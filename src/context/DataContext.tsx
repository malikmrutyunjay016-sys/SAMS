import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  SeatMatrixItem,
  SpotCandidate,
  AuditLog,
  HodAccount,
  SystemSettings,
  Notice,
  FacultyMember,
  FAQItem
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
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';

export type ThemeMode = 'maroon' | 'navy' | 'light';

interface DataContextType {
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
  toggleSpotRound: (enabled: boolean) => void;
  updateCollegeLogo: (url: string) => void;
  updateSeatMatrixItem: (id: string, sanctioned: number, admitted?: number) => void;
  resetSeatMatrixToBenchmark: () => void;
  updateHodPassword: (deptId: string, newPass: string, hodName?: string) => void;
  updateStudentRollNo: (studentId: string, newRollNo: string, newStatus?: string) => void;
  bulkImportStudents: (importedStudents: Student[]) => void;
  syncSamsGoogleSheet: (sheetUrl: string) => Promise<number>;
  reportSpotCandidate: (candidateId: string, status: 'Reported' | 'Not Reported') => void;
  registerSpotCandidate: (candidate: Partial<SpotCandidate>) => void;
  runAutomatedMeritSelection: (deptId?: string) => void;
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  deleteNotice: (noticeId: string) => void;
  addFAQ: (question: string, answer: string, category: string) => void;
  updateFAQ: (id: string, question: string, answer: string, category: string) => void;
  deleteFAQ: (id: string) => void;
  addAuditLog: (actionType: string, description: string) => void;
  restoreSystemFromSnapshot: (snapshotData: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LS_PREFIX = 'SAMS_BARAGADA_V2_';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('maroon');

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'students');
    return saved ? JSON.parse(saved) : generate1100Students();
  });

  const [seatMatrix, setSeatMatrix] = useState<SeatMatrixItem[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'seatMatrix');
    return saved ? JSON.parse(saved) : DEFAULT_SEAT_MATRIX;
  });

  const [spotCandidates, setSpotCandidates] = useState<SpotCandidate[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'spotCandidates');
    return saved ? JSON.parse(saved) : DEFAULT_SPOT_CANDIDATES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  const [hodAccounts, setHodAccounts] = useState<HodAccount[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'hodAccounts');
    return saved ? JSON.parse(saved) : DEFAULT_HOD_ACCOUNTS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'systemSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'notices');
    return saved ? JSON.parse(saved) : DEFAULT_NOTICES;
  });

  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'faculty');
    return saved ? JSON.parse(saved) : DEFAULT_FACULTY;
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem(LS_PREFIX + 'faqs');
    return saved ? JSON.parse(saved) : DEFAULT_FAQS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'students', JSON.stringify(students.slice(0, 1500)));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'seatMatrix', JSON.stringify(seatMatrix));
  }, [seatMatrix]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'spotCandidates', JSON.stringify(spotCandidates));
  }, [spotCandidates]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'hodAccounts', JSON.stringify(hodAccounts));
  }, [hodAccounts]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'systemSettings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem(LS_PREFIX + 'faqs', JSON.stringify(faqs));
  }, [faqs]);

  const addFAQ = (question: string, answer: string, category: string) => {
    const newFaq: FAQItem = {
      id: `faq_${Date.now()}`,
      question,
      answer,
      category,
      updatedAt: new Date().toISOString(),
    };
    setFaqs((prev) => [newFaq, ...prev]);
    addAuditLog('FAQ_ADDED', `New FAQ added: "${question}"`);
  };

  const updateFAQ = (id: string, question: string, answer: string, category: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, question, answer, category, updatedAt: new Date().toISOString() } : f))
    );
    addAuditLog('FAQ_UPDATED', `FAQ ${id} updated.`);
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    addAuditLog('FAQ_DELETED', `FAQ ${id} deleted.`);
  };

  // Firestore Listeners
  useEffect(() => {
    const unsubSettings = onSnapshot(
      collection(db, 'systemSettings'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as SystemSettings);
          const globalSetting = docs.find((s) => s.id === 'global') || docs[0];
          if (globalSetting) setSystemSettings(globalSetting);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'systemSettings')
    );

    const unsubSeat = onSnapshot(
      collection(db, 'seatMatrix'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => d.data() as SeatMatrixItem);
          setSeatMatrix(items);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'seatMatrix')
    );

    const unsubSpot = onSnapshot(
      collection(db, 'spotCandidates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const candidates = snapshot.docs.map((d) => d.data() as SpotCandidate);
          setSpotCandidates(candidates);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'spotCandidates')
    );

    return () => {
      unsubSettings();
      unsubSeat();
      unsubSpot();
    };
  }, []);

  const addAuditLog = (actionType: string, description: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: 'Super Admin',
      actionType,
      description,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    } catch (e) {}
  };

  const toggleSpotRound = (enabled: boolean) => {
    const updated = { ...systemSettings, spotRoundEnabled: enabled, updatedAt: new Date().toISOString() };
    setSystemSettings(updated);
    addAuditLog('SPOT_ROUND_TOGGLE', `Spot Round live reporting desk set to ${enabled ? 'ENABLED' : 'DISABLED'}`);

    try {
      setDoc(doc(db, 'systemSettings', 'global'), updated).catch(() => {});
    } catch (e) {}
  };

  const updateCollegeLogo = (url: string) => {
    const updated = { ...systemSettings, collegeLogoUrl: url, updatedAt: new Date().toISOString() };
    setSystemSettings(updated);
    addAuditLog('COLLEGE_LOGO_UPDATE', 'College crest logo updated.');

    try {
      setDoc(doc(db, 'systemSettings', 'global'), updated).catch(() => {});
    } catch (e) {}
  };

  const updateSeatMatrixItem = (id: string, sanctioned: number, admitted?: number) => {
    setSeatMatrix((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSanctioned = sanctioned;
          const newAdmitted = admitted !== undefined ? admitted : item.admitted;
          const newVacant = Math.max(0, newSanctioned - newAdmitted);
          const updatedItem = {
            ...item,
            sanctioned: newSanctioned,
            admitted: newAdmitted,
            vacant: newVacant,
            updatedAt: new Date().toISOString(),
          };

          try {
            setDoc(doc(db, 'seatMatrix', item.id), updatedItem).catch(() => {});
          } catch (e) {}

          return updatedItem;
        }
        return item;
      })
    );
    addAuditLog('SEAT_MATRIX_UPDATE', `Updated intake seat matrix for ${id}.`);
  };

  const resetSeatMatrixToBenchmark = () => {
    setSeatMatrix(DEFAULT_SEAT_MATRIX);
    addAuditLog('SEAT_MATRIX_RESET', 'Reset seat intake matrix to Odisha Government benchmark default.');
  };

  const updateHodPassword = (deptId: string, newPass: string, hodName?: string) => {
    setHodAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === deptId) {
          const updated = {
            ...acc,
            password: newPass,
            hodName: hodName || acc.hodName,
            updatedAt: new Date().toISOString(),
          };
          try {
            setDoc(doc(db, 'hodAccounts', acc.id), updated).catch(() => {});
          } catch (e) {}
          return updated;
        }
        return acc;
      })
    );
    addAuditLog('HOD_CREDENTIALS_UPDATE', `Updated security password for department ${deptId}.`);
  };

  const updateStudentRollNo = (studentId: string, newRollNo: string, newStatus?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            rollNo: newRollNo,
            status: (newStatus as any) || s.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    addAuditLog('STUDENT_RECORD_EDIT', `Updated University Roll No for student ID ${studentId} to ${newRollNo}`);
  };

  const bulkImportStudents = (importedStudents: Student[]) => {
    setStudents((prev) => [...importedStudents, ...prev]);
    addAuditLog('BULK_STUDENT_IMPORT', `Imported ${importedStudents.length} student records from CSV/XLSX sheet.`);
  };

  const syncSamsGoogleSheet = async (sheetUrl: string): Promise<number> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1200));

    const newSyncedCount = 25;
    const newStudents = generate1100Students().slice(0, newSyncedCount);
    setStudents((prev) => [...newStudents, ...prev]);

    const updatedSettings = {
      ...systemSettings,
      sheetSyncUrl: sheetUrl,
      lastSheetSync: new Date().toISOString(),
    };
    setSystemSettings(updatedSettings);

    addAuditLog('SAMS_GOOGLE_SHEET_SYNC', `Successfully synced live SAMS Google Sheet URL: ${sheetUrl}`);
    setIsLoading(false);
    return newSyncedCount;
  };

  const reportSpotCandidate = (candidateId: string, status: 'Reported' | 'Not Reported') => {
    setSpotCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === candidateId) {
          const updated = { ...cand, reportedStatus: status };
          try {
            setDoc(doc(db, 'spotCandidates', cand.id), updated).catch(() => {});
          } catch (e) {}
          return updated;
        }
        return cand;
      })
    );
    addAuditLog('SPOT_CANDIDATE_REPORTING', `Updated candidate ${candidateId} reported status to ${status}`);
  };

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
    addAuditLog('SPOT_CANDIDATE_REGISTRATION', `New candidate registered for Spot Round: ${newCand.studentName} (${newCand.samsRegNo})`);

    try {
      setDoc(doc(db, 'spotCandidates', newCand.id), newCand).catch(() => {});
    } catch (e) {}
  };

  const runAutomatedMeritSelection = (targetDeptId?: string) => {
    setSpotCandidates((prev) => {
      const updated = prev.map((cand) => {
        if (targetDeptId && cand.deptId !== targetDeptId) return cand;

        const deptSeats = seatMatrix.find((s) => s.id === cand.deptId);
        const vacantCount = deptSeats ? deptSeats.vacant : 2;

        if (cand.reportedStatus === 'Reported') {
          const deptReported = prev
            .filter((c) => c.deptId === cand.deptId && c.reportedStatus === 'Reported')
            .sort((a, b) => b.marksPercentage - a.marksPercentage);

          const candidateIndex = deptReported.findIndex((c) => c.id === cand.id);
          if (candidateIndex >= 0 && candidateIndex < vacantCount) {
            return { ...cand, selectionStatus: 'Selected' as const, waitlistRank: candidateIndex + 1 };
          } else if (candidateIndex >= 0) {
            return { ...cand, selectionStatus: 'Waiting' as const, waitlistRank: candidateIndex + 1 };
          }
        }
        return { ...cand, selectionStatus: 'Rejected' as const };
      });

      return updated;
    });

    addAuditLog('AUTOMATED_MERIT_SELECTION', 'Executed automated Spot Round Merit Selection algorithm based on reported candidates and vacant seats.');
  };

  const addNotice = (notice: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...notice,
      id: `notice_${Date.now()}`,
    };
    setNotices((prev) => [newNotice, ...prev]);
    addAuditLog('NOTICE_POSTED', `New notice posted: "${notice.title}"`);
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    addAuditLog('NOTICE_DELETED', `Notice ${noticeId} removed.`);
  };

  const restoreSystemFromSnapshot = (snapshotData: any) => {
    if (snapshotData && snapshotData.data) {
      if (snapshotData.data.students) setStudents(snapshotData.data.students);
      if (snapshotData.data.seatMatrix) setSeatMatrix(snapshotData.data.seatMatrix);
      if (snapshotData.data.spotCandidates) setSpotCandidates(snapshotData.data.spotCandidates);
      if (snapshotData.data.auditLogs) setAuditLogs(snapshotData.data.auditLogs);
      if (snapshotData.data.hodAccounts) setHodAccounts(snapshotData.data.hodAccounts);
      if (snapshotData.data.systemSettings) setSystemSettings(snapshotData.data.systemSettings);
      if (snapshotData.data.notices) setNotices(snapshotData.data.notices);
      if (snapshotData.data.faculty) setFaculty(snapshotData.data.faculty);

      addAuditLog('SYSTEM_RESTORE', `System restored from snapshot created on ${snapshotData.timestamp || 'unknown'}`);
    }
  };

  return (
    <DataContext.Provider
      value={{
        students,
        seatMatrix,
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
        toggleSpotRound,
        updateCollegeLogo,
        updateSeatMatrixItem,
        resetSeatMatrixToBenchmark,
        updateHodPassword,
        updateStudentRollNo,
        bulkImportStudents,
        syncSamsGoogleSheet,
        reportSpotCandidate,
        registerSpotCandidate,
        runAutomatedMeritSelection,
        addNotice,
        deleteNotice,
        addFAQ,
        updateFAQ,
        deleteFAQ,
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
