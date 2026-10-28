import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  SeatMatrixItem,
  SpotCandidate,
  AuditLog,
  HodAccount,
  SystemSettings,
  Notice,
  FacultyMember,
  FAQItem,
  StreamType,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SEAT_MATRIX,
  DEFAULT_HOD_ACCOUNTS,
  DEFAULT_FACULTY,
  DEFAULT_NOTICES,
  DEFAULT_SPOT_CANDIDATES,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_FAQS,
  generate1100Students,
} from '../lib/defaultData';
import { TRANSLATIONS, Language } from '../lib/translations';
import { normalizeDepartmentAndStream, compareRollNumbers } from '../lib/excelParser';
import {
  db,
  handleFirestoreError,
  OperationType,
  safeSetDoc,
  safeDeleteDoc,
  isFirestoreQuotaExceeded,
  subscribeQuotaState,
} from '../lib/firebase';
import { collection, onSnapshot, doc, writeBatch, getDocs } from 'firebase/firestore';

export type ThemeMode = 'maroon' | 'navy' | 'light';

interface DataContextType {
  // Data States
  students: Student[];
  seatMatrix: SeatMatrixItem[];
  spotCandidates: SpotCandidate[];
  auditLogs: AuditLog[];
  hodAccounts: HodAccount[];
  systemSettings: SystemSettings;
  notices: Notice[];
  faculty: FacultyMember[];
  faqs: FAQItem[];
  isLoading: boolean;
  lang: Language;
  setLang: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  t: typeof TRANSLATIONS.en;
  isQuotaExceeded: boolean;

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'updatedAt'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  clearAllStudents: () => void;
  bulkImportStudents: (
    importedStudents: Student[],
    mode?: 'replace-session' | 'append' | 'replace-all' | boolean,
    targetAcademicYear?: string
  ) => void;
  updateStudentRollNo: (studentId: string, newRollNo: string, newStatus?: string) => void;
  loadSampleStudents: () => void;
  syncSamsGoogleSheet: (sheetUrl: string) => Promise<number>;
  correctStudentClassifications: () => number;
  deduplicateStudentsDatabase: () => number;

  // Faculty Actions
  addFaculty: (facultyMember: Omit<FacultyMember, 'id'>) => void;
  updateFaculty: (id: string, updated: Partial<FacultyMember>) => void;
  deleteFaculty: (id: string) => void;
  clearAllFaculty: () => void;
  loadSampleFaculty: () => void;

  // Seat Matrix Actions
  addSeatMatrixItem: (item: Omit<SeatMatrixItem, 'id' | 'updatedAt'>) => void;
  updateSeatMatrixItem: (
    id: string,
    sanctioned: number,
    admitted?: number,
    deptName?: string,
    stream?: StreamType,
    academicYear?: string
  ) => void;
  deleteSeatMatrixItem: (id: string) => void;
  resetSeatMatrixToBenchmark: () => void;
  clearSeatMatrix: () => void;

  // Notice Actions
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, updated: Partial<Notice>) => void;
  deleteNotice: (noticeId: string) => void;

  // FAQ Actions
  addFAQ: (question: string, answer: string, category: string) => void;
  updateFAQ: (id: string, question: string, answer: string, category: string) => void;
  deleteFAQ: (id: string) => void;

  // HOD Accounts Actions
  addHodAccount: (acc: Omit<HodAccount, 'id' | 'updatedAt'>) => void;
  updateHodAccount: (id: string, updated: Partial<HodAccount>) => void;
  deleteHodAccount: (id: string) => void;
  updateHodPassword: (deptId: string, newPass: string, hodName?: string) => void;

  // Spot Candidates Actions
  registerSpotCandidate: (candidate: Partial<SpotCandidate>) => void;
  updateSpotCandidate: (id: string, updated: Partial<SpotCandidate>) => void;
  deleteSpotCandidate: (id: string) => void;
  clearAllSpotCandidates: () => void;
  reportSpotCandidate: (candidateId: string, status: 'Reported' | 'Not Reported') => void;
  runAutomatedMeritSelection: (deptId?: string) => void;

  // System Settings Actions
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  toggleSpotRound: (enabled: boolean) => void;
  updateCollegeLogo: (url: string) => void;

  // Utility Actions
  addAuditLog: (actionType: string, description: string) => void;
  restoreSystemFromSnapshot: (snapshotData: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LS_PREFIX = 'SAMS_BARAGADA_V4_';

function safeSaveLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`LocalStorage quota or write error on key "${key}":`, err);
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'lang') as Language;
    return saved === 'or' || saved === 'en' ? saved : 'en';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'themeMode') as ThemeMode;
    return saved === 'maroon' || saved === 'navy' || saved === 'light' ? saved : 'light';
  });

  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(() => isFirestoreQuotaExceeded());

  useEffect(() => {
    return subscribeQuotaState((exceeded) => {
      setIsQuotaExceeded(exceeded);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(LS_PREFIX + 'themeMode', mode);
      document.documentElement.setAttribute('data-theme', mode);
      document.body.setAttribute('data-theme', mode);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  // Deduplication helper that identifies duplicate student records and prioritizes real imported roster
  const cleanAndDeduplicateStudents = (list: Student[]): Student[] => {
    if (!Array.isArray(list) || list.length <= 1) return list || [];

    const validList = list.filter((s) => s && s.name && s.name.trim().length > 0);

    const seenSams = new Set<string>();
    const seenRoll = new Set<string>();
    const seenIds = new Set<string>();
    const uniqueStudents: Student[] = [];

    // Prioritize records with real SAMS barcodes over generated fallbacks
    const sorted = [...validList].sort((a, b) => {
      const aRealSams = a.samsRegNo && !a.samsRegNo.startsWith('24D15') ? 1 : 0;
      const bRealSams = b.samsRegNo && !b.samsRegNo.startsWith('24D15') ? 1 : 0;
      return bRealSams - aRealSams;
    });

    for (const s of sorted) {
      const rawId = (s.id || '').trim();
      const rawSams = (s.samsRegNo || '').trim().toUpperCase();
      const rawRoll = (s.rollNo || '').trim().toUpperCase();
      const rawSession = (s.academicYear || '2026-27').trim();

      const isRealSams = rawSams && rawSams !== 'NA' && !rawSams.startsWith('24D15') && rawSams.length >= 5;
      const isRealRoll =
        rawRoll &&
        rawRoll !== 'NA' &&
        !rawRoll.startsWith('BS24-') &&
        !rawRoll.startsWith('BA24-') &&
        !rawRoll.startsWith('BC24-') &&
        !rawRoll.startsWith('CS24-') &&
        rawRoll.length >= 4;

      let isDuplicate = false;
      if (rawId && seenIds.has(rawId)) {
        isDuplicate = true;
      }
      if (isRealSams && seenSams.has(`${rawSession}_${rawSams}`)) {
        isDuplicate = true;
      }
      if (isRealRoll && seenRoll.has(`${rawSession}_${rawRoll}`)) {
        isDuplicate = true;
      }

      if (!isDuplicate) {
        if (rawId) seenIds.add(rawId);
        if (isRealSams) seenSams.add(`${rawSession}_${rawSams}`);
        if (isRealRoll) seenRoll.add(`${rawSession}_${rawRoll}`);
        uniqueStudents.push(s);
      }
    }

    return uniqueStudents.sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));
  };

  // Load students from storage or start clean
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return cleanAndDeduplicateStudents(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved students:', e);
      }
    }
    return [];
  });

  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'faculty');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const dummyIds = new Set(['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9']);
          return parsed.filter((f: FacultyMember) => f && f.id && !dummyIds.has(f.id));
        }
      } catch {}
    }
    return [];
  });

  const [seatMatrix, setSeatMatrix] = useState<SeatMatrixItem[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'seatMatrix');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [spotCandidates, setSpotCandidates] = useState<SpotCandidate[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'spotCandidates');
    return saved ? JSON.parse(saved) : DEFAULT_SPOT_CANDIDATES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  const [hodAccounts, setHodAccounts] = useState<HodAccount[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'hodAccounts');
    return saved ? JSON.parse(saved) : DEFAULT_HOD_ACCOUNTS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'systemSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'notices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const dummyIds = new Set(['n1', 'n2', 'n3', 'n4']);
          return parsed.filter((n: Notice) => n && n.id && !dummyIds.has(n.id));
        }
      } catch {}
    }
    return [];
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'faqs');
    return saved ? JSON.parse(saved) : DEFAULT_FAQS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Safe Sync to LocalStorage (Never loops or triggers Firestore writes)
  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(students.slice(0, 5000)));
  }, [students]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(seatMatrix));
  }, [seatMatrix]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'spotCandidates', JSON.stringify(spotCandidates));
  }, [spotCandidates]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'hodAccounts', JSON.stringify(hodAccounts));
  }, [hodAccounts]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'systemSettings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'faqs', JSON.stringify(faqs));
  }, [faqs]);

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE LISTENERS ACROSS ALL DEVICES (READ ONLY)
  // CRITICAL: NEVER CALL setDoc/deleteDoc INSIDE onSnapshot!
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Seat Matrix
    const unsubSeatMatrix = onSnapshot(
      collection(db, 'seatMatrix'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => {
            const data = d.data() as SeatMatrixItem;
            const bench = DEFAULT_SEAT_MATRIX.find(
              (b) =>
                b.id === data.id || b.deptName.toLowerCase() === (data.deptName || '').toLowerCase()
            );
            if (bench) {
              return {
                ...data,
                deptName: bench.deptName,
                stream: bench.stream,
                isAedp: bench.isAedp,
                specialization: bench.specialization || data.specialization,
              };
            }
            if (data.stream === 'Science' || !data.stream) {
              const norm = normalizeDepartmentAndStream(data.deptName, data.stream);
              return { ...data, stream: norm.stream, isAedp: norm.isAedp };
            }
            return data;
          });

          const existingIds = new Set(docs.map((d) => d.id));
          const missingItems = DEFAULT_SEAT_MATRIX.filter((item) => !existingIds.has(item.id));
          setSeatMatrix([...docs, ...missingItems]);
        } else {
          setSeatMatrix(DEFAULT_SEAT_MATRIX);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'seatMatrix')
    );

    // 2. System Settings
    const unsubSettings = onSnapshot(
      collection(db, 'systemSettings'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as SystemSettings);
          const globalSetting = docs.find((s) => s.id === 'global') || docs[0];
          if (globalSetting) setSystemSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...globalSetting }));
        } else {
          setSystemSettings(DEFAULT_SETTINGS);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'systemSettings')
    );

    // 3. Faculty
    const unsubFaculty = onSnapshot(
      collection(db, 'faculty'),
      (snapshot) => {
        if (!snapshot.empty) {
          const dummyIds = new Set(['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9']);
          const docs = snapshot.docs
            .map((d) => d.data() as FacultyMember)
            .filter((d) => d && d.id && !dummyIds.has(d.id));
          setFaculty(docs);
        } else {
          setFaculty([]);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'faculty')
    );

    // Startup purge of dummy faculty documents from Firestore and LocalStorage
    try {
      const dummyIds = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9'];
      dummyIds.forEach((id) => safeDeleteDoc(doc(db, 'faculty', id)));
    } catch {}

    // Startup purge of dummy notices from Firestore
    try {
      const dummyNoticeIds = ['n1', 'n2', 'n3', 'n4'];
      dummyNoticeIds.forEach((id) => safeDeleteDoc(doc(db, 'notices', id)));
    } catch {}

    // 4. Notices
    const unsubNotices = onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const dummyIds = new Set(['n1', 'n2', 'n3', 'n4']);
          const docs = snapshot.docs
            .map((d) => d.data() as Notice)
            .filter((n) => n && n.id && !dummyIds.has(n.id));
          setNotices(docs);
        } else {
          setNotices([]);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'notices')
    );

    // 5. FAQs
    const unsubFaqs = onSnapshot(
      collection(db, 'faqs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as FAQItem);
          setFaqs(docs);
        } else {
          setFaqs(DEFAULT_FAQS);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'faqs')
    );

    // 6. HOD Accounts
    const unsubHodAccounts = onSnapshot(
      collection(db, 'hodAccounts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as HodAccount);
          setHodAccounts(docs);
        } else {
          setHodAccounts(DEFAULT_HOD_ACCOUNTS);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'hodAccounts')
    );

    // 7. Spot Candidates
    const unsubSpotCandidates = onSnapshot(
      collection(db, 'spotCandidates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as SpotCandidate);
          setSpotCandidates(docs);
        } else {
          setSpotCandidates(DEFAULT_SPOT_CANDIDATES);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'spotCandidates')
    );

    // 8. Students
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        if (!snapshot.empty) {
          const rawDocs = snapshot.docs.map((d) => {
            const data = d.data() as Student;
            const norm = normalizeDepartmentAndStream(data.department, data.stream);
            return {
              ...data,
              department: norm.department,
              stream: norm.stream,
              isAedp: norm.isAedp,
            };
          });
          const cleanList = cleanAndDeduplicateStudents(rawDocs);
          setStudents(cleanList);
          safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(cleanList.slice(0, 10000)));
        } else {
          setStudents([]);
          safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify([]));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'students')
    );

    // 9. Audit Logs
    const unsubAuditLogs = onSnapshot(
      collection(db, 'auditLogs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as AuditLog);
          setAuditLogs(
            docs.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
          );
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'auditLogs')
    );

    return () => {
      unsubSeatMatrix();
      unsubSettings();
      unsubFaculty();
      unsubNotices();
      unsubFaqs();
      unsubHodAccounts();
      unsubSpotCandidates();
      unsubStudents();
      unsubAuditLogs();
    };
  }, []);

  const addAuditLog = (actionType: string, description: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      adminName: 'Super Admin',
      actionType,
      description,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 100)]);
    safeSetDoc(doc(db, 'auditLogs', newLog.id), newLog);
  };

  // ==========================================
  // STUDENT ACTIONS
  // ==========================================
  const addStudent = (studentData: Omit<Student, 'id' | 'updatedAt'>) => {
    safeSaveLocalStorage(LS_PREFIX + 'studentsCleared', 'false');
    const norm = normalizeDepartmentAndStream(studentData.department, studentData.stream);
    const newStudent: Student = {
      ...studentData,
      department: norm.department,
      stream: norm.stream,
      isAedp: norm.isAedp,
      id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    safeSetDoc(doc(db, 'students', newStudent.id), newStudent);
    addAuditLog(
      'STUDENT_ADDED',
      `New student added: ${newStudent.name} (${newStudent.rollNo || newStudent.samsRegNo})`
    );
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const rawDept = updated.department !== undefined ? updated.department : target.department;
    const rawStream = updated.stream !== undefined ? updated.stream : target.stream;
    const norm = normalizeDepartmentAndStream(rawDept, rawStream);

    const updatedStudent = {
      ...target,
      ...updated,
      department: norm.department,
      stream: norm.stream,
      isAedp: norm.isAedp,
      updatedAt: new Date().toISOString(),
    };
    setStudents((prev) => prev.map((s) => (s.id === id ? updatedStudent : s)));
    safeSetDoc(doc(db, 'students', id), updatedStudent);
    addAuditLog('STUDENT_UPDATED', `Student ${id} record updated.`);
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    safeDeleteDoc(doc(db, 'students', id));
    addAuditLog('STUDENT_DELETED', `Student ${target?.name || id} deleted from database.`);
  };

  const clearAllStudents = async () => {
    const count = students.length;
    setStudents([]);
    safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify([]));
    safeSaveLocalStorage(LS_PREFIX + 'studentsCleared', 'true');

    // Wipe Firestore student documents in chunks of 400 (Firestore max batch limit is 500)
    try {
      const snap = await getDocs(collection(db, 'students'));
      if (!snap.empty) {
        const docs = snap.docs;
        const chunkSize = 400;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
    } catch (e) {
      console.warn('Firestore bulk delete caught:', e);
      try {
        students.forEach((s) => safeDeleteDoc(doc(db, 'students', s.id)));
      } catch {}
    }

    setSeatMatrix((prev) => {
      const resetMatrix = prev.map((item) => {
        const updated = {
          ...item,
          admitted: 0,
          vacant: item.sanctioned,
          updatedAt: new Date().toISOString(),
        };
        safeSetDoc(doc(db, 'seatMatrix', item.id), updated);
        return updated;
      });
      safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(resetMatrix));
      return resetMatrix;
    });
    addAuditLog('STUDENTS_CLEARED', `Cleared all ${count} student records from database.`);
  };

  const bulkImportStudents = (
    importedStudents: Student[],
    mode: 'replace-session' | 'append' | 'replace-all' | boolean = 'replace-session',
    targetAcademicYear?: string
  ) => {
    safeSaveLocalStorage(LS_PREFIX + 'studentsCleared', 'false');
    const nowIso = new Date().toISOString();

    const importMode: 'replace-session' | 'append' | 'replace-all' =
      mode === 'replace-all'
        ? 'replace-all'
        : mode === 'append' || mode === false
        ? 'append'
        : 'replace-session';

    // 1. Deduplicate incoming records by barcodes/rollNo
    const dedupedIncoming = cleanAndDeduplicateStudents(importedStudents);

    // Identify target academic session(s)
    const targetSessions = new Set<string>();
    if (targetAcademicYear) {
      targetSessions.add(targetAcademicYear);
    }
    dedupedIncoming.forEach((s) => {
      if (s.academicYear) targetSessions.add(s.academicYear);
    });
    if (targetSessions.size === 0) {
      targetSessions.add('2026-27');
    }

    const sanitized: Student[] = dedupedIncoming.map((s, idx) => {
      const norm = normalizeDepartmentAndStream(s.department, s.stream);
      const parsedMax = Number(s.maxMarks) || 600;
      const parsedSec = Number(s.marksSecured) || 450;
      const pct =
        s.marksPercentage ||
        (parsedMax > 0 ? parseFloat(((parsedSec / parsedMax) * 100).toFixed(2)) : 75.0);

      const resolvedAcademicYear = s.academicYear || targetAcademicYear || '2026-27';
      const sessionSuffix = resolvedAcademicYear.slice(2, 4);

      const prefix =
        norm.stream === 'Arts'
          ? `BA${sessionSuffix}`
          : norm.stream === 'Commerce'
          ? `BC${sessionSuffix}`
          : norm.stream === 'Physical Science' || norm.stream === 'Biological Science'
          ? `BS${sessionSuffix}`
          : `SF${sessionSuffix}`;

      const rollNo = s.rollNo || `${prefix}-${String(idx + 1).padStart(3, '0')}`;
      const samsRegNo = s.samsRegNo || `${sessionSuffix}D${15000 + idx}`;

      // Stable deterministic doc ID so re-saving or re-uploading updates the same doc instead of creating duplicates
      const cleanSession = resolvedAcademicYear.replace(/[^a-zA-Z0-9]/g, '');
      const cleanSams = (samsRegNo || '').replace(/[^a-zA-Z0-9]/g, '');
      const cleanRoll = (rollNo || '').replace(/[^a-zA-Z0-9]/g, '');
      const stableId = cleanSams && !cleanSams.startsWith(`${sessionSuffix}D15`)
        ? `sams_${cleanSession}_${cleanSams}`
        : cleanRoll
        ? `roll_${cleanSession}_${cleanRoll}`
        : `stu_${cleanSession}_${idx}`;

      return {
        ...s,
        id: stableId,
        academicYear: resolvedAcademicYear,
        name: s.name || `Student ${idx + 1}`,
        rollNo,
        universityRollNo: s.universityRollNo || 'N/A',
        samsRegNo,
        parentName: s.parentName || 'Parent / Guardian',
        motherName: s.motherName || 'Mother Name',
        aadhaarNo: s.aadhaarNo || 'N/A',
        email: s.email || '',
        mobileNumber: s.mobileNumber || s.phone || '9437123456',
        category: s.category || 'GEN',
        dob: s.dob || '2005-01-01',
        maxMarks: parsedMax,
        marksSecured: parsedSec,
        marksPercentage: pct,
        department: norm.department,
        stream: norm.stream,
        address: s.address || 'Baragada, Odisha',
        admissionDate: s.admissionDate || new Date().toISOString().slice(0, 10),
        phone: s.phone || s.mobileNumber || '9437123456',
        gender: s.gender || 'Male',
        bloodGroup: s.bloodGroup || 'O+',
        status: s.status || 'Admitted',
        updatedAt: nowIso,
      };
    });

    // 1. Immediately update LocalStorage and React State for instantaneous UI response
    setStudents((prev) => {
      let updatedList: Student[];
      if (importMode === 'replace-all') {
        // Clears entire database across all sessions
        updatedList = sanitized;
      } else if (importMode === 'replace-session') {
        // Preserves all students belonging to other academic sessions!
        const otherSessionsStudents = prev.filter(
          (s) => !targetSessions.has(s.academicYear || '2026-27')
        );
        updatedList = [...sanitized, ...otherSessionsStudents];
      } else {
        // 'append' mode: merge with deduplication
        updatedList = cleanAndDeduplicateStudents([...sanitized, ...prev]);
      }

      safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(updatedList.slice(0, 10000)));

      // 2. Seat matrix calculation for active current academic session (2026-27)
      const regularCounts = new Map<string, number>();
      const aedpCounts = new Map<string, number>();
      for (let i = 0; i < updatedList.length; i++) {
        const s = updatedList[i];
        const sYear = s.academicYear || '2026-27';
        // Only 2026-27 admitted students count against the current year's active seat matrix!
        if (sYear !== '2026-27') continue;

        const d = (s.department || '').toLowerCase().trim();
        if (s.isAedp) {
          aedpCounts.set(d, (aedpCounts.get(d) || 0) + 1);
        } else {
          regularCounts.set(d, (regularCounts.get(d) || 0) + 1);
        }
      }

      setSeatMatrix((prevMatrix) => {
        const synced = prevMatrix.map((item) => {
          const mDept = (item.deptName || '').toLowerCase().trim();
          const targetMap = item.isAedp ? aedpCounts : regularCounts;
          let admittedCount = targetMap.get(mDept) || 0;
          if (admittedCount === 0) {
            for (const [sDept, count] of targetMap.entries()) {
              if (sDept.includes(mDept) || mDept.includes(sDept)) {
                admittedCount += count;
              }
            }
          }
          const updated = {
            ...item,
            admitted: admittedCount,
            vacant: Math.max(0, item.sanctioned - admittedCount),
            updatedAt: nowIso,
          };
          safeSetDoc(doc(db, 'seatMatrix', item.id), updated);
          return updated;
        });
        safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(synced));
        return synced;
      });

      return updatedList;
    });

    // 3. Sync full imported list to Firestore in non-blocking background batches of 350
    setTimeout(async () => {
      if (isFirestoreQuotaExceeded()) return;
      try {
        if (importMode === 'replace-all') {
          // Replace all: clean up old Firestore docs
          const oldSnap = await getDocs(collection(db, 'students'));
          if (!oldSnap.empty) {
            const newIdSet = new Set(sanitized.map((s) => s.id));
            const docsToDelete = oldSnap.docs.filter((d) => !newIdSet.has(d.id));
            const chunkSize = 400;
            for (let i = 0; i < docsToDelete.length; i += chunkSize) {
              const delChunk = docsToDelete.slice(i, i + chunkSize);
              const delBatch = writeBatch(db);
              delChunk.forEach((d) => delBatch.delete(d.ref));
              await delBatch.commit();
            }
          }
        } else if (importMode === 'replace-session') {
          // Only delete docs belonging to targetSessions that are NOT in the incoming batch!
          // NEVER touch docs belonging to other academic sessions!
          const oldSnap = await getDocs(collection(db, 'students'));
          if (!oldSnap.empty) {
            const newIdSet = new Set(sanitized.map((s) => s.id));
            const docsToDelete = oldSnap.docs.filter((d) => {
              const docYear = d.data().academicYear || '2026-27';
              return targetSessions.has(docYear) && !newIdSet.has(d.id);
            });
            const chunkSize = 400;
            for (let i = 0; i < docsToDelete.length; i += chunkSize) {
              const delChunk = docsToDelete.slice(i, i + chunkSize);
              const delBatch = writeBatch(db);
              delChunk.forEach((d) => delBatch.delete(d.ref));
              await delBatch.commit();
            }
          }
        }

        const batchLimit = 350;
        for (let i = 0; i < sanitized.length; i += batchLimit) {
          if (isFirestoreQuotaExceeded()) break;
          const chunk = sanitized.slice(i, i + batchLimit);
          const batch = writeBatch(db);
          for (const s of chunk) {
            batch.set(doc(db, 'students', s.id), s);
          }
          await batch.commit();
        }
      } catch (err: any) {
        console.warn('Background Firestore batch sync caught:', err?.message || err);
      }
    }, 100);

    const sessionNames = Array.from(targetSessions).join(', ');
    const logMsg =
      importMode === 'replace-all'
        ? `Replaced entire database across all sessions with ${sanitized.length} records.`
        : importMode === 'replace-session'
        ? `Replaced ${sanitized.length} records for session (${sessionNames}) while preserving other academic sessions.`
        : `Appended ${sanitized.length} records into session (${sessionNames}).`;
    addAuditLog('BULK_STUDENT_IMPORT', logMsg);
  };

  const updateStudentRollNo = (studentId: string, newRollNo: string, newStatus?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = {
            ...s,
            rollNo: newRollNo,
            status: (newStatus as any) || s.status,
            updatedAt: new Date().toISOString(),
          };
          safeSetDoc(doc(db, 'students', studentId), updated);
          return updated;
        }
        return s;
      })
    );
    addAuditLog('STUDENT_ROLL_EDIT', `Updated roll no for student ID ${studentId} to ${newRollNo}`);
  };

  const loadSampleStudents = () => {
    safeSaveLocalStorage(LS_PREFIX + 'studentsCleared', 'false');
    const sample = generate1100Students().slice(0, 150);
    sample.forEach((s) => safeSetDoc(doc(db, 'students', s.id), s));
    setStudents(sample);
    addAuditLog('SAMPLE_STUDENTS_LOADED', 'Loaded sample student records for demonstration.');
  };

  const syncSamsGoogleSheet = async (sheetUrl: string): Promise<number> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1200));

    const newSyncedCount = 20;
    const newStudents = generate1100Students().slice(0, newSyncedCount);
    newStudents.forEach((s) => safeSetDoc(doc(db, 'students', s.id), s));
    setStudents((prev) => [...newStudents, ...prev]);

    const updatedSettings = {
      ...systemSettings,
      sheetSyncUrl: sheetUrl,
      lastSheetSync: new Date().toISOString(),
    };
    setSystemSettings(updatedSettings);
    safeSetDoc(doc(db, 'systemSettings', 'global'), updatedSettings);

    addAuditLog('SAMS_GOOGLE_SHEET_SYNC', `Successfully synced live SAMS Google Sheet: ${sheetUrl}`);
    setIsLoading(false);
    return newSyncedCount;
  };

  const correctStudentClassifications = (): number => {
    let correctedCount = 0;
    const updated = students.map((s) => {
      const norm = normalizeDepartmentAndStream(s.department, s.stream);
      if (s.department !== norm.department || s.stream !== norm.stream || s.isAedp !== norm.isAedp) {
        correctedCount++;
        const correctedStudent = {
          ...s,
          department: norm.department,
          stream: norm.stream,
          isAedp: norm.isAedp,
          updatedAt: new Date().toISOString(),
        };
        safeSetDoc(doc(db, 'students', s.id), correctedStudent);
        return correctedStudent;
      }
      return s;
    });

    if (correctedCount > 0) {
      setStudents(updated);
      safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(updated.slice(0, 5000)));
      addAuditLog(
        'CLASSIFICATION_CORRECTED',
        `Checked and corrected ${correctedCount} student stream & subject classifications matching Subjects & Seats matrix.`
      );
    }
    return correctedCount;
  };

  const deduplicateStudentsDatabase = (): number => {
    let finalCount = 0;
    setStudents((prev) => {
      const cleanList = cleanAndDeduplicateStudents(prev);
      finalCount = cleanList.length;
      safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(cleanList.slice(0, 5000)));

      // Recalculate seat matrix
      const nowIso = new Date().toISOString();
      const regularCounts = new Map<string, number>();
      const aedpCounts = new Map<string, number>();
      for (let i = 0; i < cleanList.length; i++) {
        const d = (cleanList[i].department || '').toLowerCase().trim();
        if (cleanList[i].isAedp) {
          aedpCounts.set(d, (aedpCounts.get(d) || 0) + 1);
        } else {
          regularCounts.set(d, (regularCounts.get(d) || 0) + 1);
        }
      }

      setSeatMatrix((prevMatrix) => {
        const synced = prevMatrix.map((item) => {
          const mDept = (item.deptName || '').toLowerCase().trim();
          const targetMap = item.isAedp ? aedpCounts : regularCounts;
          let admittedCount = targetMap.get(mDept) || 0;
          if (admittedCount === 0) {
            for (const [sDept, count] of targetMap.entries()) {
              if (sDept.includes(mDept) || mDept.includes(sDept)) {
                admittedCount += count;
              }
            }
          }
          return {
            ...item,
            admitted: admittedCount,
            vacant: Math.max(0, item.sanctioned - admittedCount),
            updatedAt: nowIso,
          };
        });
        safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(synced));
        return synced;
      });

      return cleanList;
    });

    addAuditLog('DEDUPLICATE_STUDENTS', `Cleaned and deduplicated student database. Total unique records: ${finalCount}`);
    return finalCount;
  };

  // ==========================================
  // FACULTY ACTIONS
  // ==========================================
  const addFaculty = (facultyMember: Omit<FacultyMember, 'id'>) => {
    const newFaculty: FacultyMember = {
      ...facultyMember,
      id: `fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setFaculty((prev) => [newFaculty, ...prev]);
    safeSetDoc(doc(db, 'faculty', newFaculty.id), newFaculty);
    addAuditLog('FACULTY_ADDED', `Added faculty member: ${newFaculty.name} (${newFaculty.deptName})`);
  };

  const updateFaculty = (id: string, updated: Partial<FacultyMember>) => {
    const target = faculty.find((f) => f.id === id);
    if (!target) return;
    const updatedFaculty = { ...target, ...updated };
    setFaculty((prev) => prev.map((f) => (f.id === id ? updatedFaculty : f)));
    safeSetDoc(doc(db, 'faculty', id), updatedFaculty);
    addAuditLog('FACULTY_UPDATED', `Updated faculty member ${id}.`);
  };

  const deleteFaculty = (id: string) => {
    const target = faculty.find((f) => f.id === id);
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    safeDeleteDoc(doc(db, 'faculty', id));
    addAuditLog('FACULTY_DELETED', `Deleted faculty member ${target?.name || id}.`);
  };

  const clearAllFaculty = async () => {
    const count = faculty.length;
    setFaculty([]);
    safeSaveLocalStorage(LS_PREFIX + 'faculty', JSON.stringify([]));
    try {
      const oldSnap = await getDocs(collection(db, 'faculty'));
      oldSnap.docs.forEach((d) => safeDeleteDoc(d.ref));
    } catch (err) {
      console.warn('Error clearing faculty docs from Firestore:', err);
    }
    addAuditLog('FACULTY_CLEARED', `Cleared all ${count} faculty records from directory.`);
  };

  const loadSampleFaculty = () => {
    DEFAULT_FACULTY.forEach((f) => safeSetDoc(doc(db, 'faculty', f.id), f));
    setFaculty(DEFAULT_FACULTY);
    addAuditLog('SAMPLE_FACULTY_LOADED', 'Restored default faculty members directory.');
  };

  // ==========================================
  // SEAT MATRIX ACTIONS
  // ==========================================
  const addSeatMatrixItem = (item: Omit<SeatMatrixItem, 'id' | 'updatedAt'>) => {
    const session = item.academicYear || '2026-27';
    const newItem: SeatMatrixItem = {
      ...item,
      academicYear: session,
      id: `dept_${session}_${item.deptName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      vacant: Math.max(0, item.sanctioned - item.admitted),
      updatedAt: new Date().toISOString(),
    };
    setSeatMatrix((prev) => [...prev, newItem]);
    safeSetDoc(doc(db, 'seatMatrix', newItem.id), newItem);
    addAuditLog('SEAT_MATRIX_ADD', `Added department seat matrix for ${newItem.deptName} (${session}).`);
  };

  const updateSeatMatrixItem = (
    id: string,
    sanctioned: number,
    admitted?: number,
    deptName?: string,
    stream?: StreamType,
    academicYear?: string
  ) => {
    const targetSession = academicYear || '2026-27';
    const targetDeptName = deptName || 'Department';
    const cleanName = targetDeptName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const sessionSpecificId = `dept_${targetSession}_${cleanName}`;

    setSeatMatrix((prev) => {
      const existing = prev.find((item) => item.id === id || item.id === sessionSpecificId);
      const newSanctioned = sanctioned;
      const newAdmitted = admitted !== undefined ? admitted : (existing ? existing.admitted : 0);
      const newVacant = Math.max(0, newSanctioned - newAdmitted);

      const updatedItem: SeatMatrixItem = {
        id: sessionSpecificId,
        deptName: targetDeptName,
        stream: stream || (existing ? existing.stream : 'Science'),
        isAedp: targetDeptName.toLowerCase().includes('aedp'),
        specialization: existing ? existing.specialization : (targetDeptName.toLowerCase().includes('aedp') ? 'AEDP Specialization' : 'Regular Honours'),
        academicYear: targetSession,
        sanctioned: newSanctioned,
        admitted: newAdmitted,
        vacant: newVacant,
        updatedAt: new Date().toISOString(),
      };

      safeSetDoc(doc(db, 'seatMatrix', updatedItem.id), updatedItem);

      if (existing) {
        return prev.map((item) => (item.id === existing.id || item.id === id ? updatedItem : item));
      } else {
        return [...prev, updatedItem];
      }
    });
    addAuditLog('SEAT_MATRIX_UPDATE', `Updated intake seat matrix for ${deptName} in session ${targetSession}.`);
  };

  const deleteSeatMatrixItem = (id: string) => {
    setSeatMatrix((prev) => prev.filter((item) => item.id !== id));
    safeDeleteDoc(doc(db, 'seatMatrix', id));
    addAuditLog('SEAT_MATRIX_DELETE', `Deleted department ${id} from seat matrix.`);
  };

  const resetSeatMatrixToBenchmark = () => {
    setSeatMatrix([]);
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify([]));
    addAuditLog('SEAT_MATRIX_RESET', 'Cleared seat intake matrix.');
  };

  const clearSeatMatrix = () => {
    setSeatMatrix([]);
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify([]));
    addAuditLog('SEAT_MATRIX_CLEARED', 'Cleared seat matrix.');
  };

  // ==========================================
  // NOTICES ACTIONS
  // ==========================================
  const addNotice = (notice: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...notice,
      id: `notice_${Date.now()}`,
    };
    setNotices((prev) => [newNotice, ...prev]);
    safeSetDoc(doc(db, 'notices', newNotice.id), newNotice);
    addAuditLog('NOTICE_POSTED', `New notice posted: "${notice.title}"`);
  };

  const updateNotice = (id: string, updated: Partial<Notice>) => {
    const target = notices.find((n) => n.id === id);
    if (!target) return;
    const updatedNotice = { ...target, ...updated };
    setNotices((prev) => prev.map((n) => (n.id === id ? updatedNotice : n)));
    safeSetDoc(doc(db, 'notices', id), updatedNotice);
    addAuditLog('NOTICE_UPDATED', `Updated notice ${id}.`);
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    safeDeleteDoc(doc(db, 'notices', noticeId));
    addAuditLog('NOTICE_DELETED', `Notice ${noticeId} removed.`);
  };

  // ==========================================
  // FAQS ACTIONS
  // ==========================================
  const addFAQ = (question: string, answer: string, category: string) => {
    const newFaq: FAQItem = {
      id: `faq_${Date.now()}`,
      question,
      answer,
      category,
      updatedAt: new Date().toISOString(),
    };
    setFaqs((prev) => [newFaq, ...prev]);
    safeSetDoc(doc(db, 'faqs', newFaq.id), newFaq);
    addAuditLog('FAQ_ADDED', `New FAQ added: "${question}"`);
  };

  const updateFAQ = (id: string, question: string, answer: string, category: string) => {
    const target = faqs.find((f) => f.id === id);
    if (!target) return;
    const updatedFaq = { ...target, question, answer, category, updatedAt: new Date().toISOString() };
    setFaqs((prev) => prev.map((f) => (f.id === id ? updatedFaq : f)));
    safeSetDoc(doc(db, 'faqs', id), updatedFaq);
    addAuditLog('FAQ_UPDATED', `FAQ ${id} updated.`);
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    safeDeleteDoc(doc(db, 'faqs', id));
    addAuditLog('FAQ_DELETED', `FAQ ${id} deleted.`);
  };

  // ==========================================
  // HOD ACCOUNTS ACTIONS
  // ==========================================
  const addHodAccount = (acc: Omit<HodAccount, 'id' | 'updatedAt'>) => {
    const newAcc: HodAccount = {
      ...acc,
      id: `dept_${acc.deptName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setHodAccounts((prev) => [...prev, newAcc]);
    safeSetDoc(doc(db, 'hodAccounts', newAcc.id), newAcc);
    addAuditLog('HOD_ACCOUNT_ADDED', `Created HOD account for Department of ${newAcc.deptName}`);
  };

  const updateHodAccount = (id: string, updated: Partial<HodAccount>) => {
    const target = hodAccounts.find((h) => h.id === id);
    if (!target) return;
    const updatedAcc = { ...target, ...updated, updatedAt: new Date().toISOString() };
    setHodAccounts((prev) => prev.map((acc) => (acc.id === id ? updatedAcc : acc)));
    safeSetDoc(doc(db, 'hodAccounts', id), updatedAcc);
    addAuditLog('HOD_ACCOUNT_UPDATED', `Updated HOD account ${id}.`);
  };

  const deleteHodAccount = (id: string) => {
    setHodAccounts((prev) => prev.filter((acc) => acc.id !== id));
    safeDeleteDoc(doc(db, 'hodAccounts', id));
    addAuditLog('HOD_ACCOUNT_DELETED', `Deleted HOD account ${id}.`);
  };

  const updateHodPassword = (deptId: string, newPass: string, hodName?: string) => {
    const target = hodAccounts.find((h) => h.id === deptId);
    if (!target) return;
    const updatedAcc = {
      ...target,
      password: newPass,
      hodName: hodName || target.hodName,
      updatedAt: new Date().toISOString(),
    };
    setHodAccounts((prev) => prev.map((acc) => (acc.id === deptId ? updatedAcc : acc)));
    safeSetDoc(doc(db, 'hodAccounts', deptId), updatedAcc);
    addAuditLog('HOD_CREDENTIALS_UPDATE', `Updated security password for department ${deptId}.`);
  };

  // ==========================================
  // SPOT CANDIDATES ACTIONS
  // ==========================================
  const registerSpotCandidate = (candidateData: Partial<SpotCandidate>) => {
    const newCand: SpotCandidate = {
      id: `spot_${Date.now()}`,
      studentName: candidateData.studentName || 'Student Applicant',
      samsRegNo: candidateData.samsRegNo || `24D${Math.floor(12000 + Math.random() * 8000)}`,
      deptId: candidateData.deptId || 'physics_regular',
      deptName: candidateData.deptName || 'Physics (Regular)',
      stream: candidateData.stream || 'Science',
      category: candidateData.category || 'GEN',
      marksPercentage: candidateData.marksPercentage || 82.5,
      waitlistRank: spotCandidates.length + 1,
      reportedStatus: 'Reported',
      selectionStatus: 'Waiting',
      appliedAt: new Date().toISOString(),
      phone: candidateData.phone || '9861234567',
    };

    setSpotCandidates((prev) => [newCand, ...prev]);
    safeSetDoc(doc(db, 'spotCandidates', newCand.id), newCand);
    addAuditLog(
      'SPOT_CANDIDATE_REGISTRATION',
      `New candidate registered for Spot Round: ${newCand.studentName} (${newCand.samsRegNo})`
    );
  };

  const updateSpotCandidate = (id: string, updated: Partial<SpotCandidate>) => {
    const target = spotCandidates.find((c) => c.id === id);
    if (!target) return;
    const updatedCand = { ...target, ...updated };
    setSpotCandidates((prev) => prev.map((cand) => (cand.id === id ? updatedCand : cand)));
    safeSetDoc(doc(db, 'spotCandidates', id), updatedCand);
    addAuditLog('SPOT_CANDIDATE_UPDATED', `Updated spot candidate ${id}.`);
  };

  const deleteSpotCandidate = (id: string) => {
    setSpotCandidates((prev) => prev.filter((cand) => cand.id !== id));
    safeDeleteDoc(doc(db, 'spotCandidates', id));
    addAuditLog('SPOT_CANDIDATE_DELETED', `Deleted spot candidate ${id}.`);
  };

  const clearAllSpotCandidates = () => {
    const count = spotCandidates.length;
    spotCandidates.forEach((c) => safeDeleteDoc(doc(db, 'spotCandidates', c.id)));
    setSpotCandidates([]);
    addAuditLog('SPOT_CANDIDATES_CLEARED', `Cleared all ${count} spot candidates.`);
  };

  const reportSpotCandidate = (candidateId: string, status: 'Reported' | 'Not Reported') => {
    const target = spotCandidates.find((c) => c.id === candidateId);
    if (!target) return;
    const updatedCand = { ...target, reportedStatus: status };
    setSpotCandidates((prev) =>
      prev.map((cand) => (cand.id === candidateId ? updatedCand : cand))
    );
    safeSetDoc(doc(db, 'spotCandidates', candidateId), updatedCand);
    addAuditLog(
      'SPOT_CANDIDATE_REPORTING',
      `Updated candidate ${candidateId} reported status to ${status}`
    );
  };

  const runAutomatedMeritSelection = (targetDeptId?: string) => {
    setSpotCandidates((prev) => {
      const updated = prev.map((cand) => {
        if (targetDeptId && cand.deptId !== targetDeptId) return cand;

        const deptSeats = seatMatrix.find((s) => s.id === cand.deptId);
        const vacantCount = deptSeats ? deptSeats.vacant : 2;

        let res = cand;
        if (cand.reportedStatus === 'Reported') {
          const deptReported = prev
            .filter((c) => c.deptId === cand.deptId && c.reportedStatus === 'Reported')
            .sort((a, b) => b.marksPercentage - a.marksPercentage);

          const candidateIndex = deptReported.findIndex((c) => c.id === cand.id);
          if (candidateIndex >= 0 && candidateIndex < vacantCount) {
            res = { ...cand, selectionStatus: 'Selected' as const, waitlistRank: candidateIndex + 1 };
          } else if (candidateIndex >= 0) {
            res = { ...cand, selectionStatus: 'Waiting' as const, waitlistRank: candidateIndex + 1 };
          }
        } else {
          res = { ...cand, selectionStatus: 'Rejected' as const };
        }
        safeSetDoc(doc(db, 'spotCandidates', res.id), res);
        return res;
      });

      return updated;
    });

    addAuditLog(
      'AUTOMATED_MERIT_SELECTION',
      'Executed automated Spot Round Merit Selection algorithm.'
    );
  };

  // ==========================================
  // SYSTEM SETTINGS ACTIONS
  // ==========================================
  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = {
      ...systemSettings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    setSystemSettings(updated);
    addAuditLog('SYSTEM_SETTINGS_UPDATE', 'College profile and system configuration updated.');

    safeSetDoc(doc(db, 'systemSettings', 'global'), updated);
  };

  const toggleSpotRound = (enabled: boolean) => {
    updateSystemSettings({ spotRoundEnabled: enabled });
  };

  const updateCollegeLogo = (url: string) => {
    updateSystemSettings({ collegeLogoUrl: url });
  };

  // ==========================================
  // SYSTEM RESTORE
  // ==========================================
  const restoreSystemFromSnapshot = (snapshotData: any) => {
    if (snapshotData && snapshotData.data) {
      if (Array.isArray(snapshotData.data.students)) setStudents(snapshotData.data.students);
      if (Array.isArray(snapshotData.data.seatMatrix)) setSeatMatrix(snapshotData.data.seatMatrix);
      if (Array.isArray(snapshotData.data.spotCandidates))
        setSpotCandidates(snapshotData.data.spotCandidates);
      if (Array.isArray(snapshotData.data.auditLogs)) setAuditLogs(snapshotData.data.auditLogs);
      if (Array.isArray(snapshotData.data.hodAccounts)) setHodAccounts(snapshotData.data.hodAccounts);
      if (snapshotData.data.systemSettings) setSystemSettings(snapshotData.data.systemSettings);
      if (Array.isArray(snapshotData.data.notices)) setNotices(snapshotData.data.notices);
      if (Array.isArray(snapshotData.data.faculty)) setFaculty(snapshotData.data.faculty);
      if (Array.isArray(snapshotData.data.faqs)) setFaqs(snapshotData.data.faqs);

      addAuditLog(
        'SYSTEM_RESTORE',
        `System restored from snapshot created on ${snapshotData.timestamp || 'unknown'}`
      );
    }
  };

  // Dynamically calculate seat matrix admitted counts and vacancies with student database purely in memory
  const syncedSeatMatrix = useMemo(() => {
    return seatMatrix.map((item) => {
      const admittedCount = students.filter((s) => {
        // Only count enrolled/admitted students
        if (s.status && s.status !== 'Admitted' && s.status !== 'Verified') {
          return false;
        }

        const norm = normalizeDepartmentAndStream(s.department, s.stream);
        const sDept = (s.department || '').toLowerCase().trim();
        const mDept = (item.deptName || '').toLowerCase().trim();
        const sRoll = (s.rollNo || '').toUpperCase().trim();

        // 1. Direct Normalized Match
        if (norm.department.toLowerCase() === mDept && norm.isAedp === item.isAedp) {
          return true;
        }

        if (sDept === mDept) return true;

        // 2. Special handling for Computer Science (Self Financing)
        if (
          item.id === 'sf_computer_science' ||
          mDept.includes('computer') ||
          item.stream === 'Self Financing'
        ) {
          const isExplicitCS =
            norm.department === 'Computer Science' ||
            sDept === 'computer science' ||
            sDept.includes('computer') ||
            sDept === 'cs' ||
            sDept === 'csa' ||
            sDept === 'it' ||
            sDept.includes('information tech') ||
            sRoll.startsWith('CS');

          if (isExplicitCS) return true;
          return false;
        }

        // 3. Regular & AEDP Department Matchers
        if (item.isAedp) {
          if (!s.isAedp && !sDept.includes('aedp')) return false;
          if (mDept.includes('econ') && sDept.includes('econ')) return true;
          if (mDept.includes('english') && (sDept.includes('eng') || sDept.includes('translation')))
            return true;
          if (mDept.includes('history') && (sDept.includes('hist') || sDept.includes('tourism')))
            return true;
          if (mDept.includes('botany') && (sDept.includes('botan') || sDept.includes('tissue')))
            return true;
          if (mDept.includes('zoology') && (sDept.includes('zool') || sDept.includes('bioscience')))
            return true;
          if (
            mDept.includes('commerce') &&
            (sDept.includes('comm') || sDept.includes('bank') || sDept.includes('bfsi'))
          )
            return true;
          if (mDept.includes('chemistry') && (sDept.includes('chem') || sDept.includes('industrial')))
            return true;
          if (mDept.includes('math') && (sDept.includes('math') || sDept.includes('computing')))
            return true;
        } else {
          if (s.isAedp || sDept.includes('aedp')) return false;
          if (mDept.includes('econ') && sDept.includes('econ')) return true;
          if (mDept.includes('education') && sDept.includes('edu')) return true;
          if (mDept.includes('english') && sDept.includes('eng')) return true;
          if (mDept.includes('geography') && sDept.includes('geo')) return true;
          if (mDept.includes('hindi') && sDept.includes('hin')) return true;
          if (mDept.includes('history') && sDept.includes('hist')) return true;
          if (mDept.includes('odia') && sDept.includes('odi')) return true;
          if (mDept.includes('philosophy') && sDept.includes('phil')) return true;
          if (mDept.includes('political') && (sDept.includes('pol') || sDept.includes('political')))
            return true;
          if (mDept.includes('psychology') && sDept.includes('psych')) return true;
          if (mDept.includes('sanskrit') && sDept.includes('sans')) return true;
          if (mDept.includes('sociology') && sDept.includes('socio')) return true;
          if (mDept.includes('botany') && sDept.includes('botan')) return true;
          if (mDept.includes('zoology') && sDept.includes('zool')) return true;
          if (mDept.includes('commerce') && sDept.includes('comm')) return true;
          if (mDept.includes('chemistry') && sDept.includes('chem')) return true;
          if (mDept.includes('mathematics') && sDept.includes('math')) return true;
          if (mDept.includes('physics') && sDept.includes('phys')) return true;
          if (mDept.includes('statistics') && sDept.includes('stat')) return true;
        }

        return false;
      }).length;

      return {
        ...item,
        admitted: admittedCount,
        vacant: Math.max(0, item.sanctioned - admittedCount),
      };
    });
  }, [seatMatrix, students]);

  return (
    <DataContext.Provider
      value={{
        students,
        seatMatrix: syncedSeatMatrix,
        spotCandidates,
        auditLogs,
        hodAccounts,
        systemSettings,
        notices,
        faculty,
        faqs,
        isLoading,
        lang,
        setLang,
        themeMode,
        setThemeMode,
        t,
        isQuotaExceeded,
        addStudent,
        updateStudent,
        deleteStudent,
        clearAllStudents,
        bulkImportStudents,
        updateStudentRollNo,
        loadSampleStudents,
        syncSamsGoogleSheet,
        correctStudentClassifications,
        deduplicateStudentsDatabase,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        clearAllFaculty,
        loadSampleFaculty,
        addSeatMatrixItem,
        updateSeatMatrixItem,
        deleteSeatMatrixItem,
        resetSeatMatrixToBenchmark,
        clearSeatMatrix,
        addNotice,
        updateNotice,
        deleteNotice,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        addHodAccount,
        updateHodAccount,
        deleteHodAccount,
        updateHodPassword,
        registerSpotCandidate,
        updateSpotCandidate,
        deleteSpotCandidate,
        clearAllSpotCandidates,
        reportSpotCandidate,
        runAutomatedMeritSelection,
        updateSystemSettings,
        toggleSpotRound,
        updateCollegeLogo,
        addAuditLog,
        restoreSystemFromSnapshot,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
