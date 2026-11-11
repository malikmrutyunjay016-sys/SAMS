import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Student, StudentCounsellingRecord, StreamType } from '../types';
import {
  COMMON_AEC_OPTIONS,
  COMMON_VAC_OPTIONS,
  STREAM_MDC_OPTIONS,
  STREAM_SEC_OPTIONS,
  REGULAR_MINOR_MAPPING,
  generateDefaultCounselling,
  normalizeLookupKey,
  normalizeRollLookupKey,
} from '../lib/counsellingService';
import {
  UserCheck,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Save,
  BookOpen,
  GraduationCap,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Layers,
  Award,
  Hash,
  Shield,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

const LS_STUDENT_SESSION_KEY = 'SAMS_BARAGADA_STUDENT_ID';

function isUnfilledOrNA(val: string | undefined | null): boolean {
  if (!val) return true;
  const cleaned = val.trim().toLowerCase();
  return (
    cleaned === '' ||
    cleaned === '-' ||
    cleaned === '--' ||
    cleaned === 'n/a' ||
    cleaned === 'na' ||
    cleaned === 'nil' ||
    cleaned === 'none' ||
    cleaned === 'unfilled'
  );
}

function cleanCredential(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/[\s\-_]/g, '').toLowerCase().trim();
}

export const StudentPortalView: React.FC = () => {
  const { students, counsellingMap, saveCounsellingRecord, updateStudent, addAuditLog, themeMode, lang, t } = useData();

  // Session State
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LS_STUDENT_SESSION_KEY);
    } catch {
      return null;
    }
  });

  // Login Form State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Assistance / Lookup modal
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');

  // Active student object
  const student = useMemo(() => {
    if (!currentStudentId) return null;
    return students.find((s) => s.id === currentStudentId) || null;
  }, [currentStudentId, students]);

  // Secondary lookup map for counselling records
  const counsellingByRollOrBarcode = useMemo(() => {
    const map: Record<string, StudentCounsellingRecord> = {};
    Object.values(counsellingMap).forEach((rec) => {
      if (!rec) return;
      const rKey = normalizeLookupKey(rec.rollNo);
      if (rKey) map[`roll_${rKey}`] = rec;
      const rNorm = normalizeRollLookupKey(rec.rollNo);
      if (rNorm) map[`rollnorm_${rNorm}`] = rec;
      const sKey = normalizeLookupKey(rec.samsRegNo);
      if (sKey) map[`sams_${sKey}`] = rec;
      const uKey = normalizeLookupKey(rec.universityRollNo);
      if (uKey && uKey !== 'na') map[`univ_${uKey}`] = rec;
    });
    return map;
  }, [counsellingMap]);

  // Fetch or generate current counselling record
  const currentRecord = useMemo<StudentCounsellingRecord | null>(() => {
    if (!student) return null;
    const existing =
      counsellingMap[student.id] ||
      counsellingByRollOrBarcode[`sams_${normalizeLookupKey(student.samsRegNo)}`] ||
      counsellingByRollOrBarcode[`roll_${normalizeLookupKey(student.rollNo)}`] ||
      generateDefaultCounselling(student);

    return {
      ...existing,
      studentId: student.id,
      id: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      samsRegNo: student.samsRegNo,
      stream: student.stream,
      department: student.department,
      isAedp: student.isAedp,
      universityRollNo: student.universityRollNo || existing.universityRollNo || '',
    };
  }, [student, counsellingMap, counsellingByRollOrBarcode]);

  // Set of permanently locked field keys for this student
  const lockedFieldsSet = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    if (student?.studentLockedFields) {
      student.studentLockedFields.forEach((f) => set.add(f));
    }
    if (currentRecord?.studentLockedFields) {
      currentRecord.studentLockedFields.forEach((f) => set.add(f));
    }
    return set;
  }, [student, currentRecord]);

  // Form State for Student Editing
  const [univRollValue, setUnivRollValue] = useState<string>('');
  const [regularChoices, setRegularChoices] = useState<{
    minor1: string;
    minor2: string;
    mdc1: string;
    mdc2: string;
    mdc3: string;
    sec1: string;
    sec2: string;
    sec3: string;
    aec1: string;
    aec2: string;
    vac1: string;
    vac2: string;
  }>({
    minor1: '',
    minor2: '',
    mdc1: '',
    mdc2: '',
    mdc3: '',
    sec1: '',
    sec2: '',
    sec3: '',
    aec1: '',
    aec2: '',
    vac1: '',
    vac2: '',
  });

  const [aedpChoices, setAedpChoices] = useState<{
    major2: string;
    mdc1: string;
    mdc2: string;
    sec1: string;
    sec2: string;
    aec1: string;
    aec2: string;
    vac1: string;
    vac2: string;
  }>({
    major2: '',
    mdc1: '',
    mdc2: '',
    sec1: '',
    sec2: '',
    aec1: '',
    aec2: '',
    vac1: '',
    vac2: '',
  });

  // Track initial values so we know if a field was ALREADY filled by admin / college initially
  const [initialFilledFields, setInitialFilledFields] = useState<Record<string, boolean>>({});

  // Sync state whenever student or currentRecord changes
  useEffect(() => {
    if (!currentRecord || !student) return;

    const univRoll = student.universityRollNo || currentRecord.universityRollNo || '';
    setUnivRollValue(univRoll);

    const initialMap: Record<string, boolean> = {};
    initialMap['universityRollNo'] = !isUnfilledOrNA(univRoll);

    if (currentRecord.isAedp && currentRecord.aedp) {
      const a = currentRecord.aedp;
      setAedpChoices({
        major2: a.major2 || '',
        mdc1: a.mdc1 || '',
        mdc2: a.mdc2 || '',
        sec1: a.sec1 || '',
        sec2: a.sec2 || '',
        aec1: a.aec1 || '',
        aec2: a.aec2 || '',
        vac1: a.vac1 || '',
        vac2: a.vac2 || '',
      });
      initialMap['major2'] = !isUnfilledOrNA(a.major2);
      initialMap['mdc1'] = !isUnfilledOrNA(a.mdc1);
      initialMap['mdc2'] = !isUnfilledOrNA(a.mdc2);
      initialMap['sec1'] = !isUnfilledOrNA(a.sec1);
      initialMap['sec2'] = !isUnfilledOrNA(a.sec2);
      initialMap['aec1'] = !isUnfilledOrNA(a.aec1);
      initialMap['aec2'] = !isUnfilledOrNA(a.aec2);
      initialMap['vac1'] = !isUnfilledOrNA(a.vac1);
      initialMap['vac2'] = !isUnfilledOrNA(a.vac2);
    } else if (currentRecord.regular) {
      const r = currentRecord.regular;
      setRegularChoices({
        minor1: r.minor1 || '',
        minor2: r.minor2 || '',
        mdc1: r.mdc1 || '',
        mdc2: r.mdc2 || '',
        mdc3: r.mdc3 || '',
        sec1: r.sec1 || '',
        sec2: r.sec2 || '',
        sec3: r.sec3 || '',
        aec1: r.aec1 || '',
        aec2: r.aec2 || '',
        vac1: r.vac1 || '',
        vac2: r.vac2 || '',
      });
      initialMap['minor1'] = !isUnfilledOrNA(r.minor1);
      initialMap['minor2'] = !isUnfilledOrNA(r.minor2);
      initialMap['mdc1'] = !isUnfilledOrNA(r.mdc1);
      initialMap['mdc2'] = !isUnfilledOrNA(r.mdc2);
      initialMap['mdc3'] = !isUnfilledOrNA(r.mdc3);
      initialMap['sec1'] = !isUnfilledOrNA(r.sec1);
      initialMap['sec2'] = !isUnfilledOrNA(r.sec2);
      initialMap['sec3'] = !isUnfilledOrNA(r.sec3);
      initialMap['aec1'] = !isUnfilledOrNA(r.aec1);
      initialMap['aec2'] = !isUnfilledOrNA(r.aec2);
      initialMap['vac1'] = !isUnfilledOrNA(r.vac1);
      initialMap['vac2'] = !isUnfilledOrNA(r.vac2);
    }

    setInitialFilledFields(initialMap);
  }, [student?.id, currentRecord?.id]);

  // Toast / confirmation modal state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChangesList, setPendingChangesList] = useState<Array<{ fieldKey: string; label: string; value: string }>>([]);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const inputBarcode = cleanCredential(barcodeInput);
    const inputPass = cleanCredential(passwordInput);

    if (!inputBarcode || !inputPass) {
      setLoginError('Please enter both your SAMS Barcode Number and your Aadhaar Number.');
      setIsLoggingIn(false);
      return;
    }

    // Find student matching barcode or roll number
    const matched = students.find((s) => {
      const sBarcode = cleanCredential(s.samsRegNo);
      const sRoll = cleanCredential(s.rollNo);
      return sBarcode === inputBarcode || sRoll === inputBarcode;
    });

    if (!matched) {
      setLoginError('No admitted student found matching this Barcode Number. Please verify your SAMS CAF / Intimation Slip.');
      setIsLoggingIn(false);
      return;
    }

    // Verify Password (Aadhaar No)
    const storedAadhaar = cleanCredential(matched.aadhaarNo);
    const storedRoll = cleanCredential(matched.rollNo);

    // Password matches if it equals stored Aadhaar No,
    // or if Aadhaar was not provided in system yet, matches roll number or 'password'
    const isAadhaarMatch = storedAadhaar && storedAadhaar === inputPass;
    const isFallbackMatch = !storedAadhaar && (inputPass === storedRoll || inputPass === 'password' || inputPass === '123456789012');

    if (!isAadhaarMatch && !isFallbackMatch) {
      setLoginError('Incorrect Password. Please enter the valid 12-digit Aadhaar Number registered in your SAMS application.');
      setIsLoggingIn(false);
      return;
    }

    // Login successful
    setCurrentStudentId(matched.id);
    try {
      localStorage.setItem(LS_STUDENT_SESSION_KEY, matched.id);
    } catch {}
    setIsLoggingIn(false);
    showNotification(`Welcome, ${matched.name}! You are logged into the Student Portal.`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentStudentId(null);
    try {
      localStorage.removeItem(LS_STUDENT_SESSION_KEY);
    } catch {}
    setBarcodeInput('');
    setPasswordInput('');
    setLoginError(null);
    showNotification('You have logged out safely.', 'info');
  };

  // Available subject choices
  const minorOptions = useMemo(() => {
    if (!student) return { minor1: [], minor2: [] };
    const dept = student.department || '';
    const mapped = REGULAR_MINOR_MAPPING[dept];
    if (mapped) return mapped;

    // Stream-based fallback
    if (student.stream === 'Physical Science') {
      return {
        minor1: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
        minor2: ['Mathematics', 'Statistics', 'Electronics', 'Geology'],
      };
    } else if (student.stream === 'Biological Science') {
      return {
        minor1: ['Botany', 'Zoology', 'Chemistry'],
        minor2: ['Chemistry', 'Biotechnology', 'Environmental Science'],
      };
    } else if (student.stream === 'Commerce') {
      return {
        minor1: ['Business Economics', 'Business Law & Corporate Governance'],
        minor2: ['Business Mathematics & Statistics', 'Financial Markets & Institutions'],
      };
    }
    return {
      minor1: ['History', 'Political Science', 'Economics', 'Sociology', 'Odia', 'Education'],
      minor2: ['Political Science', 'Philosophy', 'Psychology', 'Geography', 'Sanskrit', 'English'],
    };
  }, [student]);

  const mdcOptions = useMemo(() => {
    if (!student) return [];
    return STREAM_MDC_OPTIONS[student.stream] || STREAM_MDC_OPTIONS['Arts'] || [];
  }, [student]);

  const secOptions = useMemo(() => {
    if (!student) return [];
    return STREAM_SEC_OPTIONS[student.stream] || STREAM_SEC_OPTIONS['Arts'] || [];
  }, [student]);

  // Helper to determine if a specific field is locked for editing
  // A field is locked IF:
  // 1. It is already in lockedFieldsSet (student already edited & submitted it once)
  // 2. OR it was ALREADY filled by college/admin prior to student login (not unfilled/NA)
  // 3. OR the student is marked CLC Taken
  const isFieldLocked = (fieldKey: string): { locked: boolean; reason: 'STUDENT_LOCKED' | 'COLLEGE_ALLOTTED' | 'CLC_TAKEN' | 'OPEN' } => {
    if (student?.isClcTaken || student?.status === 'CLC Taken') {
      return { locked: true, reason: 'CLC_TAKEN' };
    }
    if (lockedFieldsSet.has(fieldKey)) {
      return { locked: true, reason: 'STUDENT_LOCKED' };
    }
    if (initialFilledFields[fieldKey] === true) {
      return { locked: true, reason: 'COLLEGE_ALLOTTED' };
    }
    return { locked: false, reason: 'OPEN' };
  };

  // Collect pending changes before showing confirmation modal
  const handleInitiateSave = () => {
    if (!student || !currentRecord) return;

    if (student.isClcTaken || student.status === 'CLC Taken') {
      showNotification('Transfer / CLC has been issued for this admission. Student profile is locked.', 'error');
      return;
    }

    const changes: Array<{ fieldKey: string; label: string; value: string }> = [];

    // 1. University Roll No
    const univStatus = isFieldLocked('universityRollNo');
    if (!univStatus.locked) {
      const val = univRollValue.trim();
      if (val && !isUnfilledOrNA(val)) {
        changes.push({ fieldKey: 'universityRollNo', label: 'University Roll Number', value: val });
      }
    }

    if (student.isAedp) {
      // AEDP Fields
      const aedpKeys: Array<{ key: keyof typeof aedpChoices; label: string }> = [
        { key: 'major2', label: 'Major 2 (Specialization)' },
        { key: 'mdc1', label: 'MDC 1 (Multidisciplinary 1)' },
        { key: 'mdc2', label: 'MDC 2 (Multidisciplinary 2)' },
        { key: 'sec1', label: 'SEC 1 (Skill Enhancement 1)' },
        { key: 'sec2', label: 'SEC 2 (Skill Enhancement 2)' },
        { key: 'aec1', label: 'AEC 1 (Ability Enhancement 1)' },
        { key: 'aec2', label: 'AEC 2 (Ability Enhancement 2)' },
        { key: 'vac1', label: 'VAC 1 (Value Added Course 1)' },
        { key: 'vac2', label: 'VAC 2 (Value Added Course 2)' },
      ];

      aedpKeys.forEach(({ key, label }) => {
        const status = isFieldLocked(key);
        if (!status.locked) {
          const val = aedpChoices[key]?.trim();
          if (val && !isUnfilledOrNA(val)) {
            changes.push({ fieldKey: key, label, value: val });
          }
        }
      });
    } else {
      // Regular Honours Fields
      const regularKeys: Array<{ key: keyof typeof regularChoices; label: string }> = [
        { key: 'minor1', label: 'Core-II (Minor-I)' },
        { key: 'minor2', label: 'Core-III (Minor-II)' },
        { key: 'mdc1', label: 'MDC 1 (Multidisciplinary Course 1)' },
        { key: 'mdc2', label: 'MDC 2 (Multidisciplinary Course 2)' },
        { key: 'mdc3', label: 'MDC 3 (Multidisciplinary Course 3)' },
        { key: 'sec1', label: 'SEC 1 (Skill Enhancement 2nd Sem)' },
        { key: 'sec2', label: 'SEC 2 (Skill Enhancement 5th Sem)' },
        { key: 'sec3', label: 'SEC 3 (Skill Enhancement 6th Sem)' },
        { key: 'aec1', label: 'AEC 1 (MIL Communication)' },
        { key: 'aec2', label: 'AEC 2 (Environmental Studies)' },
        { key: 'vac1', label: 'VAC 1 (Ethics & Human Values)' },
        { key: 'vac2', label: 'VAC 2 (Value Added Course 2)' },
      ];

      regularKeys.forEach(({ key, label }) => {
        const status = isFieldLocked(key);
        if (!status.locked) {
          const val = regularChoices[key]?.trim();
          if (val && !isUnfilledOrNA(val)) {
            changes.push({ fieldKey: key, label, value: val });
          }
        }
      });
    }

    if (changes.length === 0) {
      showNotification('No new unfilled sections have been filled. Please make your selection before saving.', 'info');
      return;
    }

    setPendingChangesList(changes);
    setShowConfirmModal(true);
  };

  // Final confirmation to lock and submit
  const handleConfirmSave = () => {
    if (!student || !currentRecord || pendingChangesList.length === 0) {
      setShowConfirmModal(false);
      return;
    }

    const newlyLockedKeys = pendingChangesList.map((c) => c.fieldKey);
    const updatedLockedFields = Array.from(new Set([...Array.from(lockedFieldsSet), ...newlyLockedKeys]));

    const nowIso = new Date().toISOString();

    // Prepare updated record
    let updatedRecord: StudentCounsellingRecord = {
      ...currentRecord,
      studentLockedFields: updatedLockedFields,
      updatedAt: nowIso,
    };

    let updatedUnivRoll = student.universityRollNo || '';

    // Apply University Roll Number change
    const univChange = pendingChangesList.find((c) => c.fieldKey === 'universityRollNo');
    if (univChange) {
      updatedUnivRoll = univChange.value;
      updatedRecord.universityRollNo = univChange.value;
    }

    // Apply Counselling Paper updates
    if (student.isAedp) {
      const prevAedp = currentRecord.aedp || {
        major1: student.department,
        major2: '',
        mdc1: '',
        mdc2: '',
        aec1: '',
        aec2: '',
        sec1: '',
        sec2: '',
        vac1: '',
        vac2: '',
      };
      const updatedAedp = {
        ...prevAedp,
        major2: aedpChoices.major2 || prevAedp.major2,
        mdc1: aedpChoices.mdc1 || prevAedp.mdc1,
        mdc2: aedpChoices.mdc2 || prevAedp.mdc2,
        sec1: aedpChoices.sec1 || prevAedp.sec1,
        sec2: aedpChoices.sec2 || prevAedp.sec2,
        aec1: aedpChoices.aec1 || prevAedp.aec1,
        aec2: aedpChoices.aec2 || prevAedp.aec2,
        vac1: aedpChoices.vac1 || prevAedp.vac1,
        vac2: aedpChoices.vac2 || prevAedp.vac2,
      };
      updatedRecord.aedp = updatedAedp;
    } else {
      const prevReg = currentRecord.regular || {
        major: student.department,
        minor1: '',
        minor2: '',
        mdc1: '',
        mdc2: '',
        mdc3: '',
        sec1: '',
        sec2: '',
        sec3: '',
        aec1: '',
        aec2: '',
        vac1: '',
        vac2: '',
      };
      const updatedReg = {
        ...prevReg,
        minor1: regularChoices.minor1 || prevReg.minor1,
        minor2: regularChoices.minor2 || prevReg.minor2,
        mdc1: regularChoices.mdc1 || prevReg.mdc1,
        mdc2: regularChoices.mdc2 || prevReg.mdc2,
        mdc3: regularChoices.mdc3 || prevReg.mdc3,
        sec1: regularChoices.sec1 || prevReg.sec1,
        sec2: regularChoices.sec2 || prevReg.sec2,
        sec3: regularChoices.sec3 || prevReg.sec3,
        aec1: regularChoices.aec1 || prevReg.aec1,
        aec2: regularChoices.aec2 || prevReg.aec2,
        vac1: regularChoices.vac1 || prevReg.vac1,
        vac2: regularChoices.vac2 || prevReg.vac2,
      };
      updatedRecord.regular = updatedReg;
    }

    // Save to DataContext (persists to Firestore, LocalStorage, Memory)
    saveCounsellingRecord(updatedRecord);

    // Update student document as well
    updateStudent(student.id, {
      universityRollNo: updatedUnivRoll,
      studentLockedFields: updatedLockedFields,
    });

    addAuditLog(
      'STUDENT_PORTAL_EDIT',
      `Student ${student.name} (${student.rollNo} / ${student.samsRegNo}) submitted & locked: ${newlyLockedKeys.join(', ')}.`
    );

    setShowConfirmModal(false);
    setPendingChangesList([]);
    showNotification(
      `Successfully saved! ${newlyLockedKeys.length} section(s) have been permanently locked and updated across the entire college portal.`,
      'success'
    );
  };

  // Render Badge helper
  const renderStatusBadge = (fieldKey: string) => {
    const { locked, reason } = isFieldLocked(fieldKey);
    if (reason === 'CLC_TAKEN') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <Lock className="w-3 h-3 mr-1" /> CLC Issued (Locked)
        </span>
      );
    }
    if (reason === 'COLLEGE_ALLOTTED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Shield className="w-3 h-3 mr-1" /> Allotted by College (Locked)
        </span>
      );
    }
    if (reason === 'STUDENT_LOCKED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <Lock className="w-3 h-3 mr-1" /> Submitted by You (Permanently Locked)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
        <Unlock className="w-3 h-3 mr-1" /> Action Required (Editable Once)
      </span>
    );
  };

  // Barcode Lookup Filtered Students
  const filteredLookupStudents = useMemo(() => {
    if (!lookupQuery.trim()) return [];
    const q = lookupQuery.toLowerCase().trim();
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.samsRegNo.toLowerCase().includes(q) ||
          (s.phone && s.phone.includes(q))
      )
      .slice(0, 10);
  }, [students, lookupQuery]);

  // ==========================================
  // VIEW: 1. STUDENT LOGIN SCREEN
  // ==========================================
  if (!student) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Banner Toast Notification */}
        {toastMsg && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-lg transition-all ${
              toastMsg.type === 'error'
                ? 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
                : toastMsg.type === 'info'
                ? 'bg-blue-950/90 border border-blue-500/50 text-blue-200'
                : 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toastMsg.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-xs underline ml-4 hover:opacity-80">
              Dismiss
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            SAMS Student Portal
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Official Self-Service Portal for enrolled students of Panchayat College, Baragada. Access your academic record,
            enter your University Roll Number, and finalize your NEP 2020 Subject Counselling papers.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 font-bold border border-slate-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Student Secure Sign In</h2>
                <p className="text-xs text-slate-400">Use your SAMS Barcode & Aadhaar Number to authenticate</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              NEP 2020 • SAMS Odisha
            </span>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                User ID: SAMS Barcode Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="e.g. 24D103948 or 26DA..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono tracking-wide"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Printed on your SAMS e-Admission CAF & Intimation Slip</span>
                <button
                  type="button"
                  onClick={() => setShowLookupModal(true)}
                  className="text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  Forgot your Barcode?
                </button>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Password: Aadhaar Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="12-digit Aadhaar Card Number"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Enter your 12-digit Aadhaar Card Number (without spaces or dashes).
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>{isLoggingIn ? 'Verifying Student Identity...' : 'Sign In to Student Portal'}</span>
              </button>
            </div>
          </form>

          {/* Guidelines Box */}
          <div className="mt-8 pt-6 border-t border-slate-800 bg-slate-950/40 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Important Instructions for Students
            </h3>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
              <li>
                <strong className="text-slate-200">Single Submission Rule:</strong> Each unfilled or &quot;N/A&quot; section
                can be edited and submitted by the student <strong className="text-amber-300">only once</strong>.
              </li>
              <li>
                Once you save your choices, those fields are immediately and permanently locked against any further modifications.
              </li>
              <li>
                All submitted selections are synchronized directly with the college examination database and HOD records in real time.
              </li>
              <li>
                If you encounter any discrepancy in your Honours department or major allotment, contact the SAMS Admission Helpdesk in Room No. 12.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal: Forgot Barcode / Lookup Assistant */}
        {showLookupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Find Your SAMS Barcode Number</h3>
                </div>
                <button
                  onClick={() => setShowLookupModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-3">
                Type your Student Name, College Roll No, or registered Mobile Number to look up your SAMS Barcode:
              </p>

              <input
                type="text"
                autoFocus
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Search by name e.g. 'Priyanka' or Roll 'BA24-001'..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 mb-4"
              />

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredLookupStudents.length > 0 ? (
                  filteredLookupStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setBarcodeInput(s.samsRegNo);
                        setShowLookupModal(false);
                      }}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-200">{s.name}</div>
                        <div className="text-xs text-slate-400">
                          Roll: <span className="font-mono text-amber-300">{s.rollNo}</span> • {s.department} ({s.stream})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {s.samsRegNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Click to select</div>
                      </div>
                    </div>
                  ))
                ) : lookupQuery.trim() ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No matching student found. Please verify spelling.
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Enter at least 2 characters to search the admitted student roster.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-right">
                <button
                  onClick={() => setShowLookupModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: 2. LOGGED-IN STUDENT DASHBOARD
  // ==========================================
  const isClcTaken = Boolean(student.isClcTaken || student.status === 'CLC Taken');

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-xl transition-all ${
            toastMsg.type === 'error'
              ? 'bg-rose-950 border border-rose-500/50 text-rose-200'
              : toastMsg.type === 'info'
              ? 'bg-blue-950 border border-blue-500/50 text-blue-200'
              : 'bg-emerald-950 border border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMsg.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs underline ml-4 hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* CLC Notice Banner if Applicable */}
      {isClcTaken && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-300">College Leaving Certificate (CLC) Issued</h4>
            <p className="text-xs text-rose-200/90 mt-0.5">
              A Transfer / College Leaving Certificate has been issued for your admission. Your admission profile is
              archived in accordance with Govt. of Odisha DHE guidelines. No further subject counselling or university roll
              modifications are permitted.
            </p>
          </div>
        </div>
      )}

      {/* Top Student Identity Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-lg shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{student.name}</h1>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    student.isAedp
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {student.isAedp ? 'AEDP Specialization' : 'Regular Honours'}
                </span>
                {isClcTaken ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    CLC Taken
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {student.status || 'Admitted'}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>
                  College Roll No: <strong className="font-mono text-amber-300">{student.rollNo}</strong>
                </span>
                <span>•</span>
                <span>
                  SAMS Barcode: <strong className="font-mono text-slate-200">{student.samsRegNo}</strong>
                </span>
                <span>•</span>
                <span>
                  Department / Major: <strong className="text-slate-200">{student.department}</strong>
                </span>
                <span>•</span>
                <span>
                  Stream: <strong className="text-slate-200">{student.stream}</strong>
                </span>
                <span>•</span>
                <span>
                  Session: <strong className="text-slate-200">{student.academicYear || '2026-27'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: University Roll No & Subject Counselling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: University Roll Number Card & Quick Stats */}
        <div className="space-y-6">
          {/* Section 1: University Roll Number */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">University Roll Number</h2>
              </div>
              {renderStatusBadge('universityRollNo')}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Assigned by the Sambalpur University / Council examination wing. If unfilled, enter your official
              examination roll number carefully.
            </p>

            {(() => {
              const { locked, reason } = isFieldLocked('universityRollNo');
              if (locked) {
                return (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Recorded University Roll No</div>
                    <div className="text-xl font-mono font-bold text-amber-400">
                      {univRollValue || student.universityRollNo || 'N/A'}
                    </div>
                    <div className="flex items-center text-[11px] text-slate-400 pt-1">
                      <Lock className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                      {reason === 'STUDENT_LOCKED'
                        ? 'Updated & permanently locked by student'
                        : 'Official allotment confirmed by examination cell'}
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isClcTaken}
                      value={univRollValue}
                      onChange={(e) => setUnivRollValue(e.target.value.toUpperCase())}
                      placeholder="e.g. 24UG01004"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                    <strong>Notice:</strong> This field is currently empty. You may enter it <strong>only once</strong>. Once saved, it cannot be changed.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Policy Information Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <Award className="w-4 h-4 mr-1.5 text-amber-400" /> NEP 2020 Subject Framework
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Under Odisha State Higher Education NEP 2020 curriculum, every undergraduate student completes:
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li><strong>Major (Honours):</strong> Fixed departmental specialization</li>
              <li><strong>Minor-I & Minor-II:</strong> Two complementary allied disciplines</li>
              <li><strong>MDC 1, 2, 3:</strong> Multidisciplinary breadth courses across other faculties</li>
              <li><strong>SEC 1, 2, 3:</strong> Skill enhancement courses for practical employability</li>
              <li><strong>AEC 1, 2:</strong> Language communication & environment</li>
              <li><strong>VAC 1, 2:</strong> Ethics, human values & community health</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Subject Counselling Papers Table & Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-amber-400" />
                  Subject Counselling Allotment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review your allotted papers. Each unfilled/N.A. section can be chosen and locked once by the student.
                </p>
              </div>

              {/* Submit Button */}
              {!isClcTaken && (
                <button
                  type="button"
                  onClick={handleInitiateSave}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save & Lock My Selections</span>
                </button>
              )}
            </div>

            {/* SUBJECTS LISTING */}
            {student.isAedp ? (
              // ==========================================
              // AEDP PAPERS
              // ==========================================
              <div className="space-y-4">
                {/* Major 1 (Fixed) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Major-I (Specialization Honours)</div>
                    <div className="text-sm font-semibold text-amber-300 mt-0.5">{student.department}</div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Shield className="w-3 h-3 mr-1" /> Admitted Major (Fixed)
                  </span>
                </div>

                {/* Major 2 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Major-II (Allied Domain)</span>
                    {renderStatusBadge('major2')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('major2');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {aedpChoices.major2 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <input
                        type="text"
                        value={aedpChoices.major2}
                        onChange={(e) => setAedpChoices({ ...aedpChoices, major2: e.target.value })}
                        placeholder="Enter Major-II preference (e.g. Data Analytics / BFSI)"
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    );
                  })()}
                </div>

                {/* MDC 1 & MDC 2 */}
                {(['mdc1', 'mdc2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        MDC-{idx + 1} (Multidisciplinary Course)
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{aedpChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={aedpChoices[key]}
                          onChange={(e) => setAedpChoices({ ...aedpChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select MDC-{idx + 1} Paper --</option>
                          {mdcOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* SEC 1 & SEC 2 */}
                {(['sec1', 'sec2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        SEC-{idx + 1} (Skill Enhancement Course)
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{aedpChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={aedpChoices[key]}
                          onChange={(e) => setAedpChoices({ ...aedpChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select SEC-{idx + 1} Paper --</option>
                          {secOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* AEC 1 & AEC 2 */}
                {(['aec1', 'aec2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        AEC-{idx + 1} (Ability Enhancement Course)
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{aedpChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={aedpChoices[key]}
                          onChange={(e) => setAedpChoices({ ...aedpChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select AEC-{idx + 1} Paper --</option>
                          {COMMON_AEC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* VAC 1 & VAC 2 */}
                {(['vac1', 'vac2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        VAC-{idx + 1} (Value Added Course)
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{aedpChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={aedpChoices[key]}
                          onChange={(e) => setAedpChoices({ ...aedpChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select VAC-{idx + 1} Paper --</option>
                          {COMMON_VAC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* Final Year Apprenticeship Badge */}
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-300">Sem 5 & 6 (Final Year)</div>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">
                      1-Year Paid Industrial Apprenticeship & Industry Project
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-purple-400 bg-purple-500/20 px-2.5 py-1 rounded border border-purple-500/40">
                    Mandatory Stipendiary
                  </span>
                </div>
              </div>
            ) : (
              // ==========================================
              // REGULAR HONOURS PAPERS
              // ==========================================
              <div className="space-y-4">
                {/* Major (Fixed) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400">Core-I: Major Discipline (Honours)</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{student.department}</div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Shield className="w-3 h-3 mr-1" /> Admitted Major (Fixed)
                  </span>
                </div>

                {/* Minor 1: Core-II (Minor-I) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Core-II (Minor-I)</span>
                      <span className="text-[11px] text-slate-400 ml-2">Taken during 1st to 4th Semesters</span>
                    </div>
                    {renderStatusBadge('minor1')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('minor1');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {regularChoices.minor1 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <select
                        value={regularChoices.minor1}
                        onChange={(e) => setRegularChoices({ ...regularChoices, minor1: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">-- Select Minor-I Subject --</option>
                        {minorOptions.minor1.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* Minor 2: Core-III (Minor-II) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Core-III (Minor-II)</span>
                      <span className="text-[11px] text-slate-400 ml-2">Taken during 5th to 6th Semesters</span>
                    </div>
                    {renderStatusBadge('minor2')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('minor2');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {regularChoices.minor2 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <select
                        value={regularChoices.minor2}
                        onChange={(e) => setRegularChoices({ ...regularChoices, minor2: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">-- Select Minor-II Subject --</option>
                        {minorOptions.minor2.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* SEC 1 (2nd Sem) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">SEC-1 (Skill Enhancement Course - 2nd Sem)</span>
                    </div>
                    {renderStatusBadge('sec1')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('sec1');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {regularChoices.sec1 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <select
                        value={regularChoices.sec1}
                        onChange={(e) => setRegularChoices({ ...regularChoices, sec1: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">-- Select SEC-1 Subject --</option>
                        {secOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* SEC 2 (5th Sem) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">SEC-2 (Skill Enhancement Course - 5th Sem)</span>
                    </div>
                    {renderStatusBadge('sec2')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('sec2');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {regularChoices.sec2 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <select
                        value={regularChoices.sec2}
                        onChange={(e) => setRegularChoices({ ...regularChoices, sec2: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">-- Select SEC-2 Subject --</option>
                        {secOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* SEC 3 (6th Sem) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">SEC-3 (Skill Enhancement Course - 6th Sem)</span>
                    </div>
                    {renderStatusBadge('sec3')}
                  </div>
                  {(() => {
                    const status = isFieldLocked('sec3');
                    if (status.locked) {
                      return (
                        <div className="text-sm font-semibold text-slate-300">
                          {regularChoices.sec3 || 'N/A'}
                        </div>
                      );
                    }
                    return (
                      <select
                        value={regularChoices.sec3}
                        onChange={(e) => setRegularChoices({ ...regularChoices, sec3: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">-- Select SEC-3 Subject --</option>
                        {secOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* MDC 1, MDC 2, MDC 3 */}
                {(['mdc1', 'mdc2', 'mdc3'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        MDC-{idx + 1} (Multidisciplinary Course - Sem {idx + 1})
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{regularChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={regularChoices[key]}
                          onChange={(e) => setRegularChoices({ ...regularChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select MDC-{idx + 1} Paper --</option>
                          {mdcOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* AEC 1 & AEC 2 */}
                {(['aec1', 'aec2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        AEC-{idx + 1} (Ability Enhancement Course - Sem {idx + 1})
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{regularChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={regularChoices[key]}
                          onChange={(e) => setRegularChoices({ ...regularChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select AEC-{idx + 1} Paper --</option>
                          {COMMON_AEC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}

                {/* VAC 1 & VAC 2 */}
                {(['vac1', 'vac2'] as const).map((key, idx) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        VAC-{idx + 1} (Value Added Course - Sem {idx === 0 ? 1 : 3})
                      </span>
                      {renderStatusBadge(key)}
                    </div>
                    {(() => {
                      const status = isFieldLocked(key);
                      if (status.locked) {
                        return <div className="text-sm font-semibold text-slate-300">{regularChoices[key] || 'N/A'}</div>;
                      }
                      return (
                        <select
                          value={regularChoices[key]}
                          onChange={(e) => setRegularChoices({ ...regularChoices, [key]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Select VAC-{idx + 1} Paper --</option>
                          {COMMON_VAC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Permanent Lock */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center space-x-3 text-amber-400 mb-4 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Permanent Submission</h3>
                <p className="text-xs text-amber-300">Single-Edit Rule strictly enforced</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-4">
              <p>
                You are about to save the following <strong className="text-white">{pendingChangesList.length} section(s)</strong>:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto font-mono">
                {pendingChangesList.map((c) => (
                  <div key={c.fieldKey} className="flex items-center justify-between border-b border-slate-800/60 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-400 text-[11px] font-sans">{c.label}:</span>
                    <span className="text-amber-300 text-xs font-bold">{c.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <strong>Attention:</strong> Under college policy, each unfilled section can be edited <strong>only once</strong>. Once confirmed, these selections will be <strong>permanently locked</strong> and immediately updated across the entire college site.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Review & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Yes, Confirm & Lock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
