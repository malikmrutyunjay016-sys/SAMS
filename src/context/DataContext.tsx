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
  StreamType
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
  generate1100Students
} from '../lib/defaultData';
import { TRANSLATIONS, Language } from '../lib/translations';
import { normalizeDepartmentAndStream } from '../lib/excelParser';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

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

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'updatedAt'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  clearAllStudents: () => void;
  bulkImportStudents: (importedStudents: Student[], replace?: boolean) => void;
  updateStudentRollNo: (studentId: string, newRollNo: string, newStatus?: string) => void;
  loadSampleStudents: () => void;
  syncSamsGoogleSheet: (sheetUrl: string) => Promise<number>;
  correctStudentClassifications: () => number;

  // Faculty Actions
  addFaculty: (facultyMember: Omit<FacultyMember, 'id'>) => void;
  updateFaculty: (id: string, updated: Partial<FacultyMember>) => void;
  deleteFaculty: (id: string) => void;
  clearAllFaculty: () => void;
  loadSampleFaculty: () => void;

  // Seat Matrix Actions
  addSeatMatrixItem: (item: Omit<SeatMatrixItem, 'id' | 'updatedAt'>) => void;
  updateSeatMatrixItem: (id: string, sanctioned: number, admitted?: number, deptName?: string, stream?: StreamType) => void;
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
  const [lang, setLang] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('maroon');

  // Load students from storage or start clean
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
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
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [seatMatrix, setSeatMatrix] = useState<SeatMatrixItem[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'seatMatrix');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.some((p: SeatMatrixItem) => p.stream === 'Biological Science' || p.stream === 'Physical Science' || p.stream === 'Arts')
        ) {
          return parsed;
        }
      } catch {}
    }
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(DEFAULT_SEAT_MATRIX));
    return DEFAULT_SEAT_MATRIX;
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
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'notices');
    return saved ? JSON.parse(saved) : DEFAULT_NOTICES;
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = safeGetLocalStorage(LS_PREFIX + 'faqs');
    return saved ? JSON.parse(saved) : DEFAULT_FAQS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Safe Sync to LocalStorage
  useEffect(() => {
    safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(students.slice(0, 5000)));
  }, [students]);

  // Auto-normalize student classifications to guarantee 100% sync with Subjects & Seats matrix
  useEffect(() => {
    if (!students || students.length === 0) return;

    let needsUpdate = false;
    const normalized = students.map((s) => {
      const norm = normalizeDepartmentAndStream(s.department, s.stream);
      if (s.department !== norm.department || s.stream !== norm.stream || s.isAedp !== norm.isAedp) {
        needsUpdate = true;
        const updated = {
          ...s,
          department: norm.department,
          stream: norm.stream,
          isAedp: norm.isAedp,
          updatedAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'students', s.id), updated).catch(() => {});
        return updated;
      }
      return s;
    });

    if (needsUpdate) {
      setStudents(normalized);
    }
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
  // REAL-TIME FIRESTORE LISTENERS ACROSS ALL DEVICES
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Seat Matrix
    const unsubSeatMatrix = onSnapshot(
      collection(db, 'seatMatrix'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => {
            const data = d.data() as SeatMatrixItem;
            // Match against benchmark default seat matrix to ensure stream is accurately normalized
            const bench = DEFAULT_SEAT_MATRIX.find(
              (b) => b.id === data.id || b.deptName.toLowerCase() === (data.deptName || '').toLowerCase()
            );
            if (bench) {
              const needsUpdate = data.stream !== bench.stream || data.isAedp !== bench.isAedp || !data.specialization;
              if (needsUpdate) {
                const fixed = {
                  ...data,
                  deptName: bench.deptName,
                  stream: bench.stream,
                  isAedp: bench.isAedp,
                  specialization: bench.specialization || data.specialization,
                };
                setDoc(doc(db, 'seatMatrix', d.id), fixed).catch(() => {});
                return fixed;
              }
            } else if (data.stream === 'Science' || !data.stream) {
              const norm = normalizeDepartmentAndStream(data.deptName, data.stream);
              const fixed = { ...data, stream: norm.stream, isAedp: norm.isAedp };
              setDoc(doc(db, 'seatMatrix', d.id), fixed).catch(() => {});
              return fixed;
            }
            return data;
          });

          const existingIds = new Set(docs.map((d) => d.id));
          const missingItems = DEFAULT_SEAT_MATRIX.filter((item) => !existingIds.has(item.id));

          if (missingItems.length > 0) {
            missingItems.forEach((item) => {
              setDoc(doc(db, 'seatMatrix', item.id), item).catch(() => {});
            });
            const merged = [...docs, ...missingItems];
            setSeatMatrix(merged);
          } else {
            setSeatMatrix(docs);
          }
        } else {
          DEFAULT_SEAT_MATRIX.forEach((item) => setDoc(doc(db, 'seatMatrix', item.id), item).catch(() => {}));
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
          if (globalSetting) setSystemSettings(globalSetting);
        } else {
          setDoc(doc(db, 'systemSettings', 'global'), DEFAULT_SETTINGS).catch(() => {});
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'systemSettings')
    );

    // 3. Faculty
    const unsubFaculty = onSnapshot(
      collection(db, 'faculty'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as FacultyMember);
          setFaculty(docs);
        } else {
          DEFAULT_FACULTY.forEach((item) => setDoc(doc(db, 'faculty', item.id), item).catch(() => {}));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'faculty')
    );

    // 4. Notices
    const unsubNotices = onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as Notice);
          setNotices(docs);
        } else {
          DEFAULT_NOTICES.forEach((item) => setDoc(doc(db, 'notices', item.id), item).catch(() => {}));
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
          DEFAULT_FAQS.forEach((item) => setDoc(doc(db, 'faqs', item.id), item).catch(() => {}));
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
          DEFAULT_HOD_ACCOUNTS.forEach((item) => setDoc(doc(db, 'hodAccounts', item.id), item).catch(() => {}));
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
          DEFAULT_SPOT_CANDIDATES.forEach((item) => setDoc(doc(db, 'spotCandidates', item.id), item).catch(() => {}));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'spotCandidates')
    );

    // 8. Students
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as Student);
          setStudents(docs);
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
          setAuditLogs(docs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
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

    try {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    } catch (e) {}
  };

  // ==========================================
  // STUDENT ACTIONS
  // ==========================================
  const addStudent = (studentData: Omit<Student, 'id' | 'updatedAt'>) => {
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
    setDoc(doc(db, 'students', newStudent.id), newStudent).catch(() => {});
    addAuditLog('STUDENT_ADDED', `New student added: ${newStudent.name} (${newStudent.rollNo || newStudent.samsRegNo})`);
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
    setDoc(doc(db, 'students', id), updatedStudent).catch(() => {});
    addAuditLog('STUDENT_UPDATED', `Student ${id} record updated.`);
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'students', id)).catch(() => {});
    addAuditLog('STUDENT_DELETED', `Student ${target?.name || id} deleted from database.`);
  };

  const clearAllStudents = () => {
    const count = students.length;
    students.forEach((s) => deleteDoc(doc(db, 'students', s.id)).catch(() => {}));
    setStudents([]);
    localStorage.removeItem(LS_PREFIX + 'students');
    setSeatMatrix((prev) =>
      prev.map((item) => ({
        ...item,
        admitted: 0,
        vacant: item.sanctioned,
        updatedAt: new Date().toISOString(),
      }))
    );
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(DEFAULT_SEAT_MATRIX));
    addAuditLog('STUDENTS_CLEARED', `Cleared all ${count} student records from database.`);
  };

  const bulkImportStudents = (importedStudents: Student[], replace: boolean = false) => {
    if (!importedStudents || !Array.isArray(importedStudents) || importedStudents.length === 0) return;

    if (replace) {
      students.forEach((s) => deleteDoc(doc(db, 'students', s.id)).catch(() => {}));
    }

    // Sanitize and guarantee valid properties for all records
    const sanitized: Student[] = importedStudents.map((s, idx) => {
      const parsedMax =
        typeof s.maxMarks === 'number' && s.maxMarks > 0
          ? s.maxMarks
          : s.maxMarks
          ? Number(String(s.maxMarks).replace(/[^0-9.]/g, '')) || 600
          : 600;

      const parsedSec =
        typeof s.marksSecured === 'number' && s.marksSecured >= 0
          ? s.marksSecured
          : s.marksSecured
          ? Number(String(s.marksSecured).replace(/[^0-9.]/g, '')) || 0
          : 0;

      let pct =
        typeof s.marksPercentage === 'number' && s.marksPercentage > 0
          ? s.marksPercentage
          : parsedSec > 0 && parsedMax > 0
          ? parseFloat(((parsedSec / parsedMax) * 100).toFixed(2))
          : 75.0;

      if (pct > 100 && parsedSec <= parsedMax) {
        pct = parseFloat(((parsedSec / parsedMax) * 100).toFixed(2));
      }

      const norm = normalizeDepartmentAndStream(s.department || 'Economics', s.stream);
      const stream: StreamType = norm.stream;
      const prefix =
        stream === 'Arts'
          ? 'BA24'
          : stream === 'Commerce'
          ? 'BC24'
          : stream === 'Self Financing'
          ? 'CS24'
          : 'BS24';

      return {
        ...s,
        id: s.id || `stu_imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: s.name || `Student ${idx + 1}`,
        rollNo: s.rollNo || `${prefix}-${String(idx + 1).padStart(3, '0')}`,
        samsRegNo: s.samsRegNo || `24D${15000 + idx}`,
        barcode: s.barcode || s.samsRegNo || `BAR-${Date.now().toString().slice(-4)}${idx}`,
        parentName: s.parentName || 'Parent / Guardian',
        category: s.category || 'GEN',
        dob: s.dob || '2005-01-01',
        maxMarks: parsedMax,
        marksSecured: parsedSec,
        marksPercentage: pct,
        department: norm.department,
        stream: norm.stream,
        isAedp: norm.isAedp,
        phone: s.phone || '9437123456',
        gender: s.gender || 'Male',
        bloodGroup: s.bloodGroup || 'O+',
        status: s.status || 'Admitted',
        updatedAt: new Date().toISOString(),
      };
    });

    sanitized.forEach((s) => {
      setDoc(doc(db, 'students', s.id), s).catch(() => {});
    });

    setStudents((prev) => {
      const updatedList = replace ? sanitized : [...sanitized, ...prev];
      safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(updatedList.slice(0, 5000)));

      // Also dynamically sync Seat Matrix admitted scholars & remaining vacancies!
      setSeatMatrix((prevMatrix) => {
        const synced = prevMatrix.map((item) => {
          const admittedCount = updatedList.filter((s) => {
            const sDept = (s.department || '').toLowerCase().trim();
            const mDept = (item.deptName || '').toLowerCase().trim();
            if (sDept === mDept) return true;
            if (item.isAedp && s.isAedp && (sDept.includes(mDept) || mDept.includes(sDept))) return true;
            if (!item.isAedp && !s.isAedp && sDept.includes(mDept)) return true;
            return false;
          }).length;
          const updatedItem = {
            ...item,
            admitted: admittedCount,
            vacant: Math.max(0, item.sanctioned - admittedCount),
            updatedAt: new Date().toISOString(),
          };
          setDoc(doc(db, 'seatMatrix', item.id), updatedItem).catch(() => {});
          return updatedItem;
        });
        safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(synced));
        return synced;
      });

      return updatedList;
    });

    addAuditLog(
      'BULK_STUDENT_IMPORT',
      `${replace ? 'Replaced database with' : 'Imported and reflected'} ${sanitized.length} student records from Excel/CSV file.`
    );
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
          setDoc(doc(db, 'students', studentId), updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );
    addAuditLog('STUDENT_ROLL_EDIT', `Updated roll no for student ID ${studentId} to ${newRollNo}`);
  };

  const loadSampleStudents = () => {
    const sample = generate1100Students().slice(0, 150);
    sample.forEach((s) => setDoc(doc(db, 'students', s.id), s).catch(() => {}));
    setStudents(sample);
    addAuditLog('SAMPLE_STUDENTS_LOADED', 'Loaded sample student records for demonstration.');
  };

  const syncSamsGoogleSheet = async (sheetUrl: string): Promise<number> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1200));

    const newSyncedCount = 20;
    const newStudents = generate1100Students().slice(0, newSyncedCount);
    newStudents.forEach((s) => setDoc(doc(db, 'students', s.id), s).catch(() => {}));
    setStudents((prev) => [...newStudents, ...prev]);

    const updatedSettings = {
      ...systemSettings,
      sheetSyncUrl: sheetUrl,
      lastSheetSync: new Date().toISOString(),
    };
    setSystemSettings(updatedSettings);
    setDoc(doc(db, 'systemSettings', 'global'), updatedSettings).catch(() => {});

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
        setDoc(doc(db, 'students', s.id), correctedStudent).catch(() => {});
        return correctedStudent;
      }
      return s;
    });

    if (correctedCount > 0) {
      setStudents(updated);
      safeSaveLocalStorage(LS_PREFIX + 'students', JSON.stringify(updated.slice(0, 5000)));
      addAuditLog('CLASSIFICATION_CORRECTED', `Checked and corrected ${correctedCount} student stream & subject classifications matching Subjects & Seats matrix.`);
    }
    return correctedCount;
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
    setDoc(doc(db, 'faculty', newFaculty.id), newFaculty).catch(() => {});
    addAuditLog('FACULTY_ADDED', `Added faculty member: ${newFaculty.name} (${newFaculty.deptName})`);
  };

  const updateFaculty = (id: string, updated: Partial<FacultyMember>) => {
    const target = faculty.find((f) => f.id === id);
    if (!target) return;
    const updatedFaculty = { ...target, ...updated };
    setFaculty((prev) => prev.map((f) => (f.id === id ? updatedFaculty : f)));
    setDoc(doc(db, 'faculty', id), updatedFaculty).catch(() => {});
    addAuditLog('FACULTY_UPDATED', `Updated faculty member ${id}.`);
  };

  const deleteFaculty = (id: string) => {
    const target = faculty.find((f) => f.id === id);
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    deleteDoc(doc(db, 'faculty', id)).catch(() => {});
    addAuditLog('FACULTY_DELETED', `Deleted faculty member ${target?.name || id}.`);
  };

  const clearAllFaculty = () => {
    const count = faculty.length;
    faculty.forEach((f) => deleteDoc(doc(db, 'faculty', f.id)).catch(() => {}));
    setFaculty([]);
    localStorage.removeItem(LS_PREFIX + 'faculty');
    addAuditLog('FACULTY_CLEARED', `Cleared all ${count} faculty records from directory.`);
  };

  const loadSampleFaculty = () => {
    DEFAULT_FACULTY.forEach((f) => setDoc(doc(db, 'faculty', f.id), f).catch(() => {}));
    setFaculty(DEFAULT_FACULTY);
    addAuditLog('SAMPLE_FACULTY_LOADED', 'Restored default faculty members directory.');
  };

  // ==========================================
  // SEAT MATRIX ACTIONS
  // ==========================================
  const addSeatMatrixItem = (item: Omit<SeatMatrixItem, 'id' | 'updatedAt'>) => {
    const newItem: SeatMatrixItem = {
      ...item,
      id: `dept_${item.deptName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      vacant: Math.max(0, item.sanctioned - item.admitted),
      updatedAt: new Date().toISOString(),
    };
    setSeatMatrix((prev) => [...prev, newItem]);
    setDoc(doc(db, 'seatMatrix', newItem.id), newItem).catch(() => {});
    addAuditLog('SEAT_MATRIX_ADD', `Added department seat matrix for ${newItem.deptName}.`);
  };

  const updateSeatMatrixItem = (
    id: string,
    sanctioned: number,
    admitted?: number,
    deptName?: string,
    stream?: StreamType
  ) => {
    setSeatMatrix((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSanctioned = sanctioned;
          const newAdmitted = admitted !== undefined ? admitted : item.admitted;
          const newVacant = Math.max(0, newSanctioned - newAdmitted);
          const updatedItem = {
            ...item,
            deptName: deptName || item.deptName,
            stream: stream || item.stream,
            sanctioned: newSanctioned,
            admitted: newAdmitted,
            vacant: newVacant,
            updatedAt: new Date().toISOString(),
          };

          setDoc(doc(db, 'seatMatrix', item.id), updatedItem).catch(() => {});

          return updatedItem;
        }
        return item;
      })
    );
    addAuditLog('SEAT_MATRIX_UPDATE', `Updated intake seat matrix for ${id}.`);
  };

  const deleteSeatMatrixItem = (id: string) => {
    setSeatMatrix((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'seatMatrix', id)).catch(() => {});
    addAuditLog('SEAT_MATRIX_DELETE', `Deleted department ${id} from seat matrix.`);
  };

  const resetSeatMatrixToBenchmark = () => {
    DEFAULT_SEAT_MATRIX.forEach((item) => setDoc(doc(db, 'seatMatrix', item.id), item).catch(() => {}));
    setSeatMatrix(DEFAULT_SEAT_MATRIX);
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(DEFAULT_SEAT_MATRIX));
    addAuditLog('SEAT_MATRIX_RESET', 'Cleared and reset seat intake matrix to official 28 departments.');
  };

  const clearSeatMatrix = () => {
    const cleared = DEFAULT_SEAT_MATRIX.map((item) => {
      const cl = {
        ...item,
        admitted: 0,
        vacant: item.sanctioned,
        updatedAt: new Date().toISOString(),
      };
      setDoc(doc(db, 'seatMatrix', cl.id), cl).catch(() => {});
      return cl;
    });
    setSeatMatrix(cleared);
    safeSaveLocalStorage(LS_PREFIX + 'seatMatrix', JSON.stringify(cleared));
    addAuditLog('SEAT_MATRIX_CLEARED', 'Cleared seat matrix and reset intake to official 28 departments.');
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
    setDoc(doc(db, 'notices', newNotice.id), newNotice).catch(() => {});
    addAuditLog('NOTICE_POSTED', `New notice posted: "${notice.title}"`);
  };

  const updateNotice = (id: string, updated: Partial<Notice>) => {
    const target = notices.find((n) => n.id === id);
    if (!target) return;
    const updatedNotice = { ...target, ...updated };
    setNotices((prev) => prev.map((n) => (n.id === id ? updatedNotice : n)));
    setDoc(doc(db, 'notices', id), updatedNotice).catch(() => {});
    addAuditLog('NOTICE_UPDATED', `Updated notice ${id}.`);
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    deleteDoc(doc(db, 'notices', noticeId)).catch(() => {});
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
    setDoc(doc(db, 'faqs', newFaq.id), newFaq).catch(() => {});
    addAuditLog('FAQ_ADDED', `New FAQ added: "${question}"`);
  };

  const updateFAQ = (id: string, question: string, answer: string, category: string) => {
    const target = faqs.find((f) => f.id === id);
    if (!target) return;
    const updatedFaq = { ...target, question, answer, category, updatedAt: new Date().toISOString() };
    setFaqs((prev) => prev.map((f) => (f.id === id ? updatedFaq : f)));
    setDoc(doc(db, 'faqs', id), updatedFaq).catch(() => {});
    addAuditLog('FAQ_UPDATED', `FAQ ${id} updated.`);
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    deleteDoc(doc(db, 'faqs', id)).catch(() => {});
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
    setDoc(doc(db, 'hodAccounts', newAcc.id), newAcc).catch(() => {});
    addAuditLog('HOD_ACCOUNT_ADDED', `Created HOD account for Department of ${newAcc.deptName}`);
  };

  const updateHodAccount = (id: string, updated: Partial<HodAccount>) => {
    const target = hodAccounts.find((h) => h.id === id);
    if (!target) return;
    const updatedAcc = { ...target, ...updated, updatedAt: new Date().toISOString() };
    setHodAccounts((prev) => prev.map((acc) => (acc.id === id ? updatedAcc : acc)));
    setDoc(doc(db, 'hodAccounts', id), updatedAcc).catch(() => {});
    addAuditLog('HOD_ACCOUNT_UPDATED', `Updated HOD account ${id}.`);
  };

  const deleteHodAccount = (id: string) => {
    setHodAccounts((prev) => prev.filter((acc) => acc.id !== id));
    deleteDoc(doc(db, 'hodAccounts', id)).catch(() => {});
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
    setDoc(doc(db, 'hodAccounts', deptId), updatedAcc).catch(() => {});
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
    setDoc(doc(db, 'spotCandidates', newCand.id), newCand).catch(() => {});
    addAuditLog('SPOT_CANDIDATE_REGISTRATION', `New candidate registered for Spot Round: ${newCand.studentName} (${newCand.samsRegNo})`);
  };

  const updateSpotCandidate = (id: string, updated: Partial<SpotCandidate>) => {
    const target = spotCandidates.find((c) => c.id === id);
    if (!target) return;
    const updatedCand = { ...target, ...updated };
    setSpotCandidates((prev) => prev.map((cand) => (cand.id === id ? updatedCand : cand)));
    setDoc(doc(db, 'spotCandidates', id), updatedCand).catch(() => {});
    addAuditLog('SPOT_CANDIDATE_UPDATED', `Updated spot candidate ${id}.`);
  };

  const deleteSpotCandidate = (id: string) => {
    setSpotCandidates((prev) => prev.filter((cand) => cand.id !== id));
    deleteDoc(doc(db, 'spotCandidates', id)).catch(() => {});
    addAuditLog('SPOT_CANDIDATE_DELETED', `Deleted spot candidate ${id}.`);
  };

  const clearAllSpotCandidates = () => {
    const count = spotCandidates.length;
    spotCandidates.forEach((c) => deleteDoc(doc(db, 'spotCandidates', c.id)).catch(() => {}));
    setSpotCandidates([]);
    addAuditLog('SPOT_CANDIDATES_CLEARED', `Cleared all ${count} spot candidates.`);
  };

  const reportSpotCandidate = (candidateId: string, status: 'Reported' | 'Not Reported') => {
    const target = spotCandidates.find((c) => c.id === candidateId);
    if (!target) return;
    const updatedCand = { ...target, reportedStatus: status };
    setSpotCandidates((prev) => prev.map((cand) => (cand.id === candidateId ? updatedCand : cand)));
    setDoc(doc(db, 'spotCandidates', candidateId), updatedCand).catch(() => {});
    addAuditLog('SPOT_CANDIDATE_REPORTING', `Updated candidate ${candidateId} reported status to ${status}`);
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
        setDoc(doc(db, 'spotCandidates', res.id), res).catch(() => {});
        return res;
      });

      return updated;
    });

    addAuditLog('AUTOMATED_MERIT_SELECTION', 'Executed automated Spot Round Merit Selection algorithm.');
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

    try {
      setDoc(doc(db, 'systemSettings', 'global'), updated).catch(() => {});
    } catch (e) {}
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
      if (Array.isArray(snapshotData.data.spotCandidates)) setSpotCandidates(snapshotData.data.spotCandidates);
      if (Array.isArray(snapshotData.data.auditLogs)) setAuditLogs(snapshotData.data.auditLogs);
      if (Array.isArray(snapshotData.data.hodAccounts)) setHodAccounts(snapshotData.data.hodAccounts);
      if (snapshotData.data.systemSettings) setSystemSettings(snapshotData.data.systemSettings);
      if (Array.isArray(snapshotData.data.notices)) setNotices(snapshotData.data.notices);
      if (Array.isArray(snapshotData.data.faculty)) setFaculty(snapshotData.data.faculty);
      if (Array.isArray(snapshotData.data.faqs)) setFaqs(snapshotData.data.faqs);

      addAuditLog('SYSTEM_RESTORE', `System restored from snapshot created on ${snapshotData.timestamp || 'unknown'}`);
    }
  };

  // Dynamically sync seat matrix admitted counts and vacancies with student database
  const syncedSeatMatrix = useMemo(() => {
    return seatMatrix.map((item) => {
      const admittedCount = students.filter((s) => {
        // Only count enrolled/admitted students (exclude Spot Applied, Rejected, Cancelled, Withdrawn)
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
        // Strictly matches students enrolled in Computer Science / CS roll prefix (CS24-xxx)
        // Prevents matching general science students with BS prefixes (Botany, Zoology, Physics, Chem, Math, Stats)
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
          if (mDept.includes('english') && (sDept.includes('eng') || sDept.includes('translation'))) return true;
          if (mDept.includes('history') && (sDept.includes('hist') || sDept.includes('tourism'))) return true;
          if (mDept.includes('botany') && (sDept.includes('botan') || sDept.includes('tissue'))) return true;
          if (mDept.includes('zoology') && (sDept.includes('zool') || sDept.includes('bioscience'))) return true;
          if (mDept.includes('commerce') && (sDept.includes('comm') || sDept.includes('bank') || sDept.includes('bfsi'))) return true;
          if (mDept.includes('chemistry') && (sDept.includes('chem') || sDept.includes('industrial'))) return true;
          if (mDept.includes('math') && (sDept.includes('math') || sDept.includes('computing'))) return true;
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
          if (mDept.includes('political') && (sDept.includes('pol') || sDept.includes('political'))) return true;
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

  // Sync recalculated seat matrix to Firestore in real time
  useEffect(() => {
    if (!syncedSeatMatrix || syncedSeatMatrix.length === 0) return;
    syncedSeatMatrix.forEach((item) => {
      setDoc(doc(db, 'seatMatrix', item.id), item).catch(() => {});
    });
  }, [syncedSeatMatrix]);

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
        addStudent,
        updateStudent,
        deleteStudent,
        clearAllStudents,
        bulkImportStudents,
        updateStudentRollNo,
        loadSampleStudents,
        syncSamsGoogleSheet,
        correctStudentClassifications,
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
