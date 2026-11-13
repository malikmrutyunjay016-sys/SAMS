import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, StudentCounsellingRecord, StreamType } from '../types';
import {
  generateDefaultCounselling,
  exportCounsellingExcel,
  exportDefaulterListExcel,
  DefaulterStudentEntry,
  parseCounsellingExcelFile,
  normalizeRollLookupKey,
  normalizeLookupKey,
  normalizeSessionString,
  inferSessionFromStudent,
  isStudentInHodDept,
} from '../lib/counsellingService';
import { DEPARTMENTS_LIST } from '../lib/defaultData';
import { compareRollNumbers, compareStudentsByStreamDeptRoll } from '../lib/excelParser';
import {
  GraduationCap,
  Download,
  Upload,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  Building2,
  X,
  User,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

const LS_COUNSELLING_KEY = 'SAMS_BARAGADA_V4_counsellingRecords';

export const CounsellingView: React.FC = () => {
  const {
    students,
    seatMatrix,
    loadSampleStudents,
    counsellingMap,
    saveCounsellingRecord,
    bulkSaveCounsellingRecords,
    t,
    lang,
  } = useData();
  const { role, hodDeptName } = useAuth();
  const canEdit = role === 'SUPER_ADMIN' || role === 'HOD';

  const [selectedSession, setSelectedSession] = useState<string>('2026-27');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCourseType, setSelectedCourseType] = useState<'ALL' | 'REGULAR' | 'AEDP'>('ALL');
  const [selectedPaperCategory, setSelectedPaperCategory] = useState<string>('ALL');
  const [selectedPaperName, setSelectedPaperName] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => {
    return (role === 'HOD' && hodDeptName) ? hodDeptName : 'ALL';
  });

  // Pagination & View Mode state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const [viewMode, setViewMode] = useState<'table' | 'excel' | 'defaulter_list'>('table');
  const [excelSheet, setExcelSheet] = useState<'regular' | 'aedp'>('regular');
  const [defaulterFilterType, setDefaulterFilterType] = useState<'counselling' | 'univ_roll'>('counselling');
  const [isUploadingCounsellingExcel, setIsUploadingCounsellingExcel] = useState(false);

  // Secondary lookup index by Roll No, SAMS Barcode, Univ Roll, and session-scoped Name in case records were imported by Roll/Barcode
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
      const nKey = normalizeLookupKey(rec.studentName);
      const sessKey = inferSessionFromStudent(rec.academicYear, undefined, rec.rollNo, rec.samsRegNo);
      if (nKey) {
        map[`name_${sessKey}_${nKey}`] = rec;
      }
    });
    return map;
  }, [counsellingMap]);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<StudentCounsellingRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<StudentCounsellingRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper to extract all allocated papers for a student record with their respective category
  function getStudentPaperEntries(record: StudentCounsellingRecord): Array<{ category: 'MAJOR' | 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC'; paperName: string }> {
    const entries: Array<{ category: 'MAJOR' | 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC'; paperName: string }> = [];
    if (record.isAedp && record.aedp) {
      if (record.aedp.major1) entries.push({ category: 'MAJOR', paperName: record.aedp.major1 });
      if (record.aedp.major2) entries.push({ category: 'MAJOR', paperName: record.aedp.major2 });
      if (record.aedp.mdc1) entries.push({ category: 'MDC', paperName: record.aedp.mdc1 });
      if (record.aedp.mdc2) entries.push({ category: 'MDC', paperName: record.aedp.mdc2 });
      if (record.aedp.aec1) entries.push({ category: 'AEC', paperName: record.aedp.aec1 });
      if (record.aedp.aec2) entries.push({ category: 'AEC', paperName: record.aedp.aec2 });
      if (record.aedp.sec1) entries.push({ category: 'SEC', paperName: record.aedp.sec1 });
      if (record.aedp.sec2) entries.push({ category: 'SEC', paperName: record.aedp.sec2 });
      if (record.aedp.vac1) entries.push({ category: 'VAC', paperName: record.aedp.vac1 });
      if (record.aedp.vac2) entries.push({ category: 'VAC', paperName: record.aedp.vac2 });
    } else if (record.regular) {
      if (record.regular.major) entries.push({ category: 'MAJOR', paperName: record.regular.major });
      if (record.regular.minor1) entries.push({ category: 'MINOR', paperName: record.regular.minor1 });
      if (record.regular.minor2) entries.push({ category: 'MINOR', paperName: record.regular.minor2 });
      if (record.regular.mdc1) entries.push({ category: 'MDC', paperName: record.regular.mdc1 });
      if (record.regular.mdc2) entries.push({ category: 'MDC', paperName: record.regular.mdc2 });
      if (record.regular.mdc3) entries.push({ category: 'MDC', paperName: record.regular.mdc3 });
      if (record.regular.aec1) entries.push({ category: 'AEC', paperName: record.regular.aec1 });
      entries.push({ category: 'AEC', paperName: record.regular.aec2 || 'ENGLISH' });
      entries.push({ category: 'VAC', paperName: record.regular.vac1 || 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT' });
      entries.push({ category: 'VAC', paperName: record.regular.vac2 || 'ETHICS AND VALUES' });
      entries.push({ category: 'VAC', paperName: record.regular.vac3 || record.regular.sem5?.vac || 'UNDERSTANDING ODISHA' });
      entries.push({ category: 'VAC', paperName: record.regular.vac4 || record.regular.sem6?.vac || 'Creative Writing' });
      if (record.regular.sec1) entries.push({ category: 'SEC', paperName: record.regular.sec1 });
      if (record.regular.sec2) entries.push({ category: 'SEC', paperName: record.regular.sec2 });
      if (record.regular.sec3) entries.push({ category: 'SEC', paperName: record.regular.sec3 });
    }
    return entries.filter((e) => Boolean(e.paperName && e.paperName.trim() && e.paperName !== '-'));
  }

  // Keep department filter synced when HOD role or department changes
  useEffect(() => {
    if (role === 'HOD') {
      setSelectedDeptFilter(hodDeptName || '');
      setSelectedStream('ALL');
    }
  }, [role, hodDeptName]);

  // Helper to get counselling record with O(1) Map lookup (strictly anchored to master student database)
  function getRecordForStudent(student: Student): StudentCounsellingRecord {
    const stuSession = inferSessionFromStudent(student.academicYear, student, student.rollNo, student.samsRegNo);
    let found: StudentCounsellingRecord | undefined = counsellingMap[student.id];

    if (!found) {
      const rKey = normalizeLookupKey(student.rollNo);
      if (rKey && counsellingByRollOrBarcode[`roll_${rKey}`]) {
        found = counsellingByRollOrBarcode[`roll_${rKey}`];
      }
    }
    if (!found) {
      const rNorm = normalizeRollLookupKey(student.rollNo);
      if (rNorm && counsellingByRollOrBarcode[`rollnorm_${rNorm}`]) {
        found = counsellingByRollOrBarcode[`rollnorm_${rNorm}`];
      }
    }
    if (!found) {
      const sKey = normalizeLookupKey(student.samsRegNo);
      if (sKey && counsellingByRollOrBarcode[`sams_${sKey}`]) {
        found = counsellingByRollOrBarcode[`sams_${sKey}`];
      }
    }
    if (!found) {
      const uKey = normalizeLookupKey(student.universityRollNo);
      if (uKey && uKey !== 'na' && counsellingByRollOrBarcode[`univ_${uKey}`]) {
        found = counsellingByRollOrBarcode[`univ_${uKey}`];
      }
    }
    if (!found) {
      const nKey = normalizeLookupKey(student.name);
      if (nKey && counsellingByRollOrBarcode[`name_${stuSession}_${nKey}`]) {
        found = counsellingByRollOrBarcode[`name_${stuSession}_${nKey}`];
      }
    }

    if (found) {
      return {
        ...found,
        id: student.id,
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        samsRegNo: student.samsRegNo,
        academicYear: stuSession,
        stream: student.stream,
        department: student.department,
      };
    }

    // Student is in master database but not in subject counselling: return a blank subject counselling record
    return generateDefaultCounselling(student);
  }

  // Strictly display ONLY students available in the student master database,
  // and strictly scope to the logged-in HOD's department when role === 'HOD'
  const allDisplayStudents = useMemo(() => {
    if (role === 'HOD') {
      if (!hodDeptName) return [];
      return students.filter((s) => isStudentInHodDept(s, hodDeptName, counsellingMap[s.id]));
    }
    if (role === 'SUPER_ADMIN') {
      return students;
    }
    return [];
  }, [students, role, hodDeptName, counsellingMap]);

  const hodDeptMeta = useMemo(() => {
    if (role !== 'HOD' || !hodDeptName) {
      return { streams: [] as string[], hasAedp: true };
    }
    const h = hodDeptName.toLowerCase().trim();
    const matchingDepts = DEPARTMENTS_LIST.filter((d) => {
      const dn = d.name.toLowerCase();
      return dn === h || (h.length >= 3 && dn.includes(h) && !(h === 'mathematics' && dn.includes('computer')));
    });
    const streamSet = new Set<string>();
    matchingDepts.forEach((d) => streamSet.add(d.stream));
    allDisplayStudents.forEach((s) => {
      if (s.stream) streamSet.add(s.stream);
    });
    const hasAedp = matchingDepts.some((d) => d.isAedp) || allDisplayStudents.some((s) => s.isAedp);
    return { streams: Array.from(streamSet), hasAedp };
  }, [role, hodDeptName, allDisplayStudents]);

  // Extract all unique paper names across the entire student counselling database
  const allUniquePaperNames = useMemo(() => {
    const set = new Set<string>();
    allDisplayStudents.forEach((s) => {
      const rec = getRecordForStudent(s);
      const entries = getStudentPaperEntries(rec);
      entries.forEach((e) => {
        if (selectedPaperCategory === 'ALL' || e.category === selectedPaperCategory) {
          set.add(e.paperName.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [allDisplayStudents, counsellingMap, selectedPaperCategory]);

  // Department options scoped to the currently chosen stream
  const availableDeptOptions = useMemo(() => {
    const matchesSelectedStream = (streamVal?: string) => {
      if (selectedStream === 'ALL') return true;
      const s = (streamVal || '').trim().toLowerCase();
      const target = selectedStream.trim().toLowerCase();
      if (s === target) return true;
      if (selectedStream === 'Science' && (s === 'physical science' || s === 'biological science')) return true;
      return false;
    };

    const deptSet = new Set<string>();
    seatMatrix.forEach((m) => {
      if (m.deptName && matchesSelectedStream(m.stream)) {
        deptSet.add(m.deptName);
      }
    });

    if (deptSet.size === 0) {
      allDisplayStudents.forEach((s) => {
        if (s.department && matchesSelectedStream(s.stream)) {
          deptSet.add(s.department);
        }
      });
    }

    return Array.from(deptSet);
  }, [seatMatrix, allDisplayStudents, selectedStream]);

  // Reset department filter to ALL when chosen stream no longer contains it
  useEffect(() => {
    if (role !== 'HOD' && selectedDeptFilter !== 'ALL') {
      const stillValid = availableDeptOptions.some(
        (d) => d.trim().toLowerCase() === selectedDeptFilter.trim().toLowerCase()
      );
      if (!stillValid) {
        setSelectedDeptFilter('ALL');
      }
    }
  }, [availableDeptOptions, selectedDeptFilter, role]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSession,
    selectedSemester,
    selectedStream,
    selectedCourseType,
    selectedDeptFilter,
    selectedPaperCategory,
    selectedPaperName,
    searchQuery,
    excelSheet,
    viewMode,
    defaulterFilterType,
  ]);

  // Memoized filtered students list searching across student info and complete subject counselling database
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allDisplayStudents.filter((s) => {
      if (role === 'HOD' && (!hodDeptName || !isStudentInHodDept(s, hodDeptName, counsellingMap[s.id]))) {
        return false;
      }
      const record = getRecordForStudent(s);
      const studentSession = inferSessionFromStudent(
        s.academicYear || record?.academicYear || '',
        s,
        s.rollNo || record?.rollNo,
        s.samsRegNo || record?.samsRegNo
      );
      const matchesSession = selectedSession === 'ALL' || studentSession === selectedSession;
      const matchesStream =
        selectedStream === 'ALL' ||
        s.stream === selectedStream ||
        (selectedStream === 'Science' && (s.stream === 'Physical Science' || s.stream === 'Biological Science'));
      const matchesDept =
        role === 'HOD' ||
        selectedDeptFilter === 'ALL' ||
        s.department.toLowerCase() === selectedDeptFilter.toLowerCase() ||
        isStudentInHodDept(s, selectedDeptFilter);
      const isAedp = Boolean(s.isAedp || s.department.toLowerCase().includes('aedp'));
      const matchesCourseType =
        selectedCourseType === 'ALL' ||
        (selectedCourseType === 'AEDP' && isAedp) ||
        (selectedCourseType === 'REGULAR' && !isAedp);

      if (!matchesSession || !matchesStream || !matchesDept || !matchesCourseType) return false;

      const paperEntries = getStudentPaperEntries(record);

      // Paper Category filter
      if (selectedPaperCategory !== 'ALL') {
        const hasCategoryPaper = paperEntries.some((e) => e.category === selectedPaperCategory);
        if (!hasCategoryPaper) return false;
      }

      // Paper Name filter
      if (selectedPaperName !== 'ALL') {
        const hasSpecificPaper = paperEntries.some(
          (e) =>
            (selectedPaperCategory === 'ALL' || e.category === selectedPaperCategory) &&
            e.paperName.toLowerCase().trim() === selectedPaperName.toLowerCase().trim()
        );
        if (!hasSpecificPaper) return false;
      }

      if (!q) return true;

      // Complete subject counselling database search: matches student metadata OR any allocated paper name
      const matchesStudentInfo =
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.universityRollNo || '').toLowerCase().includes(q) ||
        s.samsRegNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.stream.toLowerCase().includes(q);

      const matchesPaperName = paperEntries.some((e) => e.paperName.toLowerCase().includes(q));

      return matchesStudentInfo || matchesPaperName;
    }).sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));
  }, [
    allDisplayStudents,
    selectedSession,
    selectedStream,
    selectedCourseType,
    selectedDeptFilter,
    selectedPaperCategory,
    selectedPaperName,
    searchQuery,
    role,
    hodDeptName,
    counsellingMap,
  ]);

  // Separate sheet filtering for Excel Matrix View
  const excelFilteredStudents = useMemo(() => {
    return filteredStudents.filter((s) => {
      const record = getRecordForStudent(s);
      return excelSheet === 'aedp' ? record.isAedp : !record.isAedp;
    });
  }, [filteredStudents, excelSheet, counsellingMap]);

  // Counts for sheets (exclude CLC Taken students from count)
  const regularCount = useMemo(
    () => filteredStudents.filter((s) => !s.isClcTaken && s.status !== 'CLC Taken' && !getRecordForStudent(s).isAedp).length,
    [filteredStudents, counsellingMap]
  );
  const aedpCount = useMemo(
    () => filteredStudents.filter((s) => !s.isClcTaken && s.status !== 'CLC Taken' && getRecordForStudent(s).isAedp).length,
    [filteredStudents, counsellingMap]
  );

  // Batch-wise active student counts (used in Course Year / Batch selector bar)
  const batchActiveCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '2026-27': 0,
      '2025-26': 0,
      '2024-25': 0,
      ALL: 0,
    };
    allDisplayStudents.forEach((s) => {
      if (s.isClcTaken || s.status === 'CLC Taken') return;
      if (role === 'HOD' && hodDeptName && !isStudentInHodDept(s, hodDeptName)) return;
      const batch = inferSessionFromStudent(s.academicYear, s, s.rollNo, s.samsRegNo);
      counts.ALL += 1;
      if (counts[batch] !== undefined) {
        counts[batch] += 1;
      }
    });
    return counts;
  }, [allDisplayStudents, role, hodDeptName, counsellingMap]);

  // Paginated slice for table view vs excel matrix view
  const activeStudentList = viewMode === 'excel' ? excelFilteredStudents : filteredStudents;
  const activeCountedStudents = useMemo(
    () => activeStudentList.filter((s) => !s.isClcTaken && s.status !== 'CLC Taken').length,
    [activeStudentList]
  );
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeStudentList.slice(start, start + pageSize);
  }, [activeStudentList, currentPage, pageSize]);

  const paginatedExcelStudents = paginatedStudents;

  const totalPages = Math.ceil(activeStudentList.length / pageSize) || 1;

  const handleOpenEdit = (student: Student) => {
    if (role === 'HOD' && (!hodDeptName || !isStudentInHodDept(student, hodDeptName, counsellingMap[student.id]))) {
      showToast(`Access Denied: HOD can only access/edit students from ${hodDeptName || 'their assigned department'}.`);
      return;
    }
    let counselling = getRecordForStudent(student);
    if (!counselling.aedp && !counselling.regular) {
      counselling = generateDefaultCounselling(student);
    }
    setEditingRecord(counselling);
    setEditForm(JSON.parse(JSON.stringify(counselling)));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (role === 'HOD') {
      const targetStudent = students.find((s) => s.id === editForm.studentId || s.id === editForm.id);
      if (!hodDeptName || !targetStudent || !isStudentInHodDept(targetStudent, hodDeptName, editForm)) {
        showToast(`Access Denied: HOD can only save subject counselling for ${hodDeptName || 'their assigned department'}.`);
        return;
      }
    }

    let formToSave = { ...editForm };
    if (formToSave.regular) {
      const reg = formToSave.regular;
      const a2 = reg.aec2 || 'ENGLISH';
      const v1 = reg.vac1 || 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT';
      const v2 = reg.vac2 || 'ETHICS AND VALUES';
      const v3 = reg.vac3 || reg.sem5?.vac || 'UNDERSTANDING ODISHA';
      const v4 = reg.vac4 || reg.sem6?.vac || 'Creative Writing';
      formToSave.regular = {
        ...reg,
        aec2: a2,
        vac1: v1,
        vac2: v2,
        vac3: v3,
        vac4: v4,
        sem1: { major: reg.major, minor: reg.minor1, mdc: reg.mdc1, aec: reg.aec1, vac: v1 },
        sem2: { major: reg.major, minor: reg.minor2, mdc: reg.mdc2, aec: a2, sec: reg.sec1 || reg.sem2?.sec || '' },
        sem3: { major: reg.major, minor: reg.minor1, mdc: reg.mdc3, vac: v2 },
        sem4: reg.sem4 || { major: reg.major, minor: reg.minor2, activity: 'Internship / Community Engagement & Service / Field Work' },
        sem5: { major: reg.major, minor: reg.minor1, sec: reg.sec2, vac: v3 },
        sem6: { major: reg.major, minor: reg.minor2, sec: reg.sec3, vac: v4 },
      };
    }

    saveCounsellingRecord(formToSave);

    setIsModalOpen(false);
    showToast(`Successfully updated subject counselling record for ${editForm.studentName}!`);
  };

  // Defaulter evaluation helpers (University Roll Number & Subject Counselling evaluated separately)
  const isPlaceholderUnivRoll = (val?: string) => {
    const v = (val || '').trim().toUpperCase();
    return !v || v === 'N/A' || v === 'NA' || v === '-' || v === 'PENDING';
  };

  const isBlankSubject = (val?: string) => {
    const v = (val || '').trim();
    return !v || v === '-' || v.toUpperCase() === 'N/A' || v.toUpperCase() === 'NA' || v.toUpperCase() === 'PENDING';
  };

  // Strict filtering specifically for Defaulter List so every filter in the toolbar applies strictly
  const allDefaulterCandidates = useMemo<DefaulterStudentEntry[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    const activeList = allDisplayStudents.filter((s) => !s.isClcTaken && s.status !== 'CLC Taken');
    const results: DefaulterStudentEntry[] = [];

    activeList.forEach((s) => {
      if (role === 'HOD' && (!hodDeptName || !isStudentInHodDept(s, hodDeptName, counsellingMap[s.id]))) {
        return;
      }

      const rec = getRecordForStudent(s);
      const batch = inferSessionFromStudent(
        s.academicYear || rec.academicYear || '',
        s,
        s.rollNo || rec.rollNo,
        s.samsRegNo || rec.samsRegNo
      );

      // 1. Session filter
      if (selectedSession !== 'ALL' && batch !== selectedSession) return;

      // 2. Course type filter
      const isAedp = Boolean(rec.isAedp || s.isAedp || (s.department || '').toLowerCase().includes('aedp'));
      if (selectedCourseType === 'AEDP' && !isAedp) return;
      if (selectedCourseType === 'REGULAR' && isAedp) return;

      // 3. Strict Stream filter
      const sStream = (s.stream || '').trim();
      if (selectedStream !== 'ALL') {
        const matchesStrictStream =
          sStream.toLowerCase() === selectedStream.toLowerCase() ||
          (selectedStream === 'Science' && (sStream === 'Physical Science' || sStream === 'Biological Science'));
        if (!matchesStrictStream) return;
      }

      // 4. Strict Department filter (no cross-matching AEDP into Regular or vice versa)
      if (role !== 'HOD' && selectedDeptFilter !== 'ALL') {
        const stuDeptRaw = (s.department || '').trim().toLowerCase();
        const targetDept = selectedDeptFilter.trim().toLowerCase();
        if (stuDeptRaw !== targetDept) return;
      }

      const paperEntries = getStudentPaperEntries(rec);

      // Evaluate University Roll No. missing
      const hasStudentUnivRoll = !isPlaceholderUnivRoll(s.universityRollNo);
      const hasRecUnivRoll = !isPlaceholderUnivRoll(rec.universityRollNo);
      const missingUnivRoll = !hasStudentUnivRoll && !hasRecUnivRoll;

      // Build field checks scoped strictly to selectedSemester + selectedPaperCategory
      type FieldCheck = { label: string; category: 'MAJOR' | 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC'; sem: string; value?: string };
      const allChecks: FieldCheck[] = [];

      if (isAedp) {
        const a = rec.aedp;
        allChecks.push(
          { label: 'Major 1', category: 'MAJOR', sem: 'ALL', value: a?.major1 },
          { label: 'Major 2', category: 'MAJOR', sem: 'ALL', value: a?.major2 },
          { label: 'AEC 1', category: 'AEC', sem: 'Semester I', value: a?.aec1 || a?.sem1?.aec1 },
          { label: 'VAC 1', category: 'VAC', sem: 'Semester I', value: a?.vac1 || a?.sem1?.vac1 },
          { label: 'AEC 2', category: 'AEC', sem: 'Semester II', value: a?.aec2 || a?.sem2?.aec2 },
          { label: 'VAC 2', category: 'VAC', sem: 'Semester II', value: a?.vac2 || a?.sem2?.vac2 },
          { label: 'MDC 1', category: 'MDC', sem: 'Semester III', value: a?.mdc1 || a?.sem3?.mdc1 },
          { label: 'SEC 1', category: 'SEC', sem: 'Semester III', value: a?.sec1 || a?.sem3?.sec1 },
          { label: 'MDC 2', category: 'MDC', sem: 'Semester IV', value: a?.mdc2 || a?.sem4?.mdc2 },
          { label: 'SEC 2', category: 'SEC', sem: 'Semester IV', value: a?.sec2 || a?.sem4?.sec2 }
        );
      } else {
        const r = rec.regular;
        allChecks.push(
          { label: 'Major', category: 'MAJOR', sem: 'ALL', value: r?.major },
          { label: 'Minor 1', category: 'MINOR', sem: 'Semester I', value: r?.minor1 || r?.sem1?.minor },
          { label: 'MDC 1', category: 'MDC', sem: 'Semester I', value: r?.mdc1 || r?.sem1?.mdc },
          { label: 'AEC 1', category: 'AEC', sem: 'Semester I', value: r?.aec1 || r?.sem1?.aec },
          { label: 'VAC 1', category: 'VAC', sem: 'Semester I', value: r?.vac1 || r?.sem1?.vac },
          { label: 'Minor 2', category: 'MINOR', sem: 'Semester II', value: r?.minor2 || r?.sem2?.minor },
          { label: 'MDC 2', category: 'MDC', sem: 'Semester II', value: r?.mdc2 || r?.sem2?.mdc },
          { label: 'AEC 2', category: 'AEC', sem: 'Semester II', value: r?.aec2 || r?.sem2?.aec },
          { label: 'SEC 1', category: 'SEC', sem: 'Semester II', value: r?.sec1 || r?.sem2?.sec },
          { label: 'Minor 1', category: 'MINOR', sem: 'Semester III', value: r?.sem3?.minor || r?.minor1 },
          { label: 'MDC 3', category: 'MDC', sem: 'Semester III', value: r?.mdc3 || r?.sem3?.mdc },
          { label: 'VAC 2', category: 'VAC', sem: 'Semester III', value: r?.vac2 || r?.sem3?.vac },
          { label: 'Minor 2', category: 'MINOR', sem: 'Semester IV', value: r?.sem4?.minor || r?.minor2 },
          { label: 'Minor 1', category: 'MINOR', sem: 'Semester V', value: r?.sem5?.minor || r?.minor1 },
          { label: 'SEC 2', category: 'SEC', sem: 'Semester V', value: r?.sec2 || r?.sem5?.sec },
          { label: 'VAC 3', category: 'VAC', sem: 'Semester V', value: r?.vac3 || r?.sem5?.vac },
          { label: 'Minor 2', category: 'MINOR', sem: 'Semester VI', value: r?.sem6?.minor || r?.minor2 },
          { label: 'SEC 3', category: 'SEC', sem: 'Semester VI', value: r?.sec3 || r?.sem6?.sec },
          { label: 'VAC 4', category: 'VAC', sem: 'Semester VI', value: r?.vac4 || r?.sem6?.vac }
        );
      }

      // Apply Semester & Paper Category filters strictly to subject checks
      const scopedChecks = allChecks.filter((chk) => {
        const semOk =
          selectedSemester === 'ALL'
            ? isAedp
              ? ['Major 2', 'MDC 1', 'AEC 1', 'SEC 1'].includes(chk.label)
              : ['Minor 1', 'Minor 2', 'MDC 1', 'AEC 1', 'SEC 1'].includes(chk.label)
            : chk.sem === 'ALL' || chk.sem === selectedSemester;
        const catOk = selectedPaperCategory === 'ALL' || chk.category === selectedPaperCategory;
        return semOk && catOk;
      });

      // Strictly enforce Paper Name filter scoped by selectedSemester + selectedPaperCategory
      if (selectedPaperName !== 'ALL') {
        const targetPaper = selectedPaperName.toLowerCase().trim();
        const hasSpecificPaper =
          selectedSemester === 'ALL'
            ? paperEntries.some(
                (e) =>
                  (selectedPaperCategory === 'ALL' || e.category === selectedPaperCategory) &&
                  e.paperName.toLowerCase().trim() === targetPaper
              )
            : scopedChecks.some(
                (chk) => !isBlankSubject(chk.value) && (chk.value || '').toLowerCase().trim() === targetPaper
              );
        if (!hasSpecificPaper) return;
      }

      const missingFields = scopedChecks.filter((chk) => isBlankSubject(chk.value)).map((chk) => chk.label);

      const missingCounselling =
        selectedPaperCategory === 'ALL' && selectedSemester === 'ALL'
          ? rec.status === 'Pending' || missingFields.length > 0
          : missingFields.length > 0;

      // Strictly enforce Paper Category & Semester on Univ Roll defaulters
      const matchesPaperCategoryForUnivRoll =
        selectedPaperCategory === 'ALL'
          ? selectedSemester === 'ALL' || scopedChecks.length > 0
          : scopedChecks.length > 0 &&
            (scopedChecks.some((chk) => !isBlankSubject(chk.value)) || missingFields.length > 0);

      const effectiveMissingUnivRoll = missingUnivRoll && matchesPaperCategoryForUnivRoll;

      if (!effectiveMissingUnivRoll && !missingCounselling) return;

      // 6. Strict Search filter
      if (q) {
        const matchesStudentInfo =
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          (s.universityRollNo || '').toLowerCase().includes(q) ||
          s.samsRegNo.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.stream.toLowerCase().includes(q) ||
          batch.toLowerCase().includes(q);
        const matchesPaperName = paperEntries.some((e) => e.paperName.toLowerCase().includes(q));
        const matchesMissing = missingFields.some((f) => f.toLowerCase().includes(q));
        if (!matchesStudentInfo && !matchesPaperName && !matchesMissing) return;
      }

      results.push({
        student: s,
        record: rec,
        batch,
        missingUnivRoll: effectiveMissingUnivRoll,
        missingCounselling,
        missingFields: missingFields.length > 0 ? missingFields : ['Subject Counselling Not Assigned'],
      });
    });

    return results.sort((a, b) => compareRollNumbers(a.student.rollNo, b.student.rollNo));
  }, [
    allDisplayStudents,
    counsellingMap,
    selectedSession,
    selectedCourseType,
    selectedStream,
    selectedDeptFilter,
    selectedPaperCategory,
    selectedPaperName,
    selectedSemester,
    searchQuery,
    role,
    hodDeptName,
  ]);

  const counsellingDefaulters = useMemo(
    () => allDefaulterCandidates.filter((d) => d.missingCounselling),
    [allDefaulterCandidates]
  );

  const univRollDefaulters = useMemo(
    () => allDefaulterCandidates.filter((d) => d.missingUnivRoll),
    [allDefaulterCandidates]
  );

  const groupDefaultersByDept = (entries: DefaulterStudentEntry[]) => {
    const deptTotals = new Map<string, number>();
    allDisplayStudents
      .filter((s) => {
        if (s.isClcTaken || s.status === 'CLC Taken') return false;
        if (role === 'HOD' && (!hodDeptName || !isStudentInHodDept(s, hodDeptName, counsellingMap[s.id]))) return false;
        const rec = getRecordForStudent(s);
        const batch = inferSessionFromStudent(s.academicYear || rec.academicYear || '', s, s.rollNo || rec.rollNo, s.samsRegNo || rec.samsRegNo);
        if (selectedSession !== 'ALL' && batch !== selectedSession) return false;
        const isAedp = Boolean(rec.isAedp || s.isAedp || (s.department || '').toLowerCase().includes('aedp'));
        if (selectedCourseType === 'AEDP' && !isAedp) return false;
        if (selectedCourseType === 'REGULAR' && isAedp) return false;
        const sStream = (s.stream || '').trim();
        if (selectedStream !== 'ALL') {
          const matchesStrictStream =
            sStream.toLowerCase() === selectedStream.toLowerCase() ||
            (selectedStream === 'Science' && (sStream === 'Physical Science' || sStream === 'Biological Science'));
          if (!matchesStrictStream) return false;
        }
        if (role !== 'HOD' && selectedDeptFilter !== 'ALL' && (s.department || '').trim().toLowerCase() !== selectedDeptFilter.trim().toLowerCase()) return false;
        return true;
      })
      .forEach((s) => {
        const dept = s.department || 'General';
        deptTotals.set(dept, (deptTotals.get(dept) || 0) + 1);
      });

    const groups = new Map<
      string,
      {
        department: string;
        stream: string;
        totalDeptStudents: number;
        items: DefaulterStudentEntry[];
      }
    >();

    entries.forEach((entry) => {
      const dept = entry.student.department || 'General';
      const existing = groups.get(dept) || {
        department: dept,
        stream: entry.student.stream || 'Arts',
        totalDeptStudents: deptTotals.get(dept) || 0,
        items: [],
      };
      existing.items.push(entry);
      groups.set(dept, existing);
    });

    return Array.from(groups.values()).sort((a, b) => a.department.localeCompare(b.department));
  };

  const counsellingDefaulterDepts = useMemo(
    () => groupDefaultersByDept(counsellingDefaulters),
    [counsellingDefaulters, allDisplayStudents, selectedSession, selectedCourseType, selectedStream, selectedDeptFilter, role, hodDeptName]
  );

  const univRollDefaulterDepts = useMemo(
    () => groupDefaultersByDept(univRollDefaulters),
    [univRollDefaulters, allDisplayStudents, selectedSession, selectedCourseType, selectedStream, selectedDeptFilter, role, hodDeptName]
  );

  const handleDirectCounsellingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (role !== 'SUPER_ADMIN' && (role !== 'HOD' || !hodDeptName)) {
      showToast('Access Denied: Only Super Admin or an authorized Department HOD can upload counselling Excel.');
      e.target.value = '';
      return;
    }
    setIsUploadingCounsellingExcel(true);
    try {
      const targetSess = selectedSession === 'ALL' ? '2026-27' : selectedSession;
      const scopedStudents = role === 'HOD' ? allDisplayStudents : students;
      const res = await parseCounsellingExcelFile(file, scopedStudents, counsellingMap, targetSess);
      setIsUploadingCounsellingExcel(false);
      const allowedRecords =
        role === 'HOD' && hodDeptName
          ? res.records.filter((r) => {
              const matchedStu = scopedStudents.find((s) => s.id === r.studentId || s.id === r.id);
              return Boolean(matchedStu && isStudentInHodDept(matchedStu, hodDeptName, r));
            })
          : res.records;

      if (res.success && allowedRecords.length > 0) {
        const detectedBatch = allowedRecords[0]?.academicYear || targetSess;
        bulkSaveCounsellingRecords(allowedRecords, 'merge', detectedBatch);
        if (selectedSession !== 'ALL' && detectedBatch && detectedBatch !== selectedSession) {
          setSelectedSession(detectedBatch);
        }
        showToast(
          role === 'HOD'
            ? `Updated subject counselling for ${allowedRecords.length} student(s) in Department of ${hodDeptName} (batch ${detectedBatch})!`
            : `Updated & fixed subject counselling for ${allowedRecords.length} matched students in batch ${detectedBatch}!`
        );
      } else {
        showToast(
          role === 'HOD'
            ? `No matching students found in Department of ${hodDeptName}. HOD can only update subject counselling for their own department.`
            : res.errors?.[0] || 'No matching student records found in the uploaded Excel file.'
        );
      }
    } catch (err: any) {
      setIsUploadingCounsellingExcel(false);
      showToast(err?.message || 'Error parsing Subject Counselling Excel file.');
    }
    e.target.value = '';
  };

  const handleExportAll = () => {
    const allRecords = filteredStudents.map((s) => getRecordForStudent(s));
    exportCounsellingExcel(allRecords, selectedSession);
    showToast(`Successfully exported ${allRecords.length} student subject counselling records to Excel!`);
  };

  if ((role !== 'SUPER_ADMIN' && role !== 'HOD') || (role === 'HOD' && !hodDeptName)) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">
          Restricted Access: Subject Counselling
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Subject Counselling &amp; Course Allotment records are accessible only to Super Admin or a logged-in Departmental HOD (restricted strictly to their own department).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-fadeIn border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Title Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-amber-400 text-xs font-mono mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'or' ? 'ଏନ.ଇ.ପି. (NEP) ୨୦୨୦ • ଛାତ୍ର ବିଷୟ କାଉନସେଲିଂ ମ୍ୟାଟ୍ରିକ୍ସ' : 'NEP 2020 FRAMEWORK • STUDENT SUBJECT COUNSELLING & COURSE ALLOTMENT'}</span>
            {role === 'HOD' && hodDeptName && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Department Scope: {hodDeptName} Only
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            {lang === 'or' ? 'ଛାତ୍ର ବିଷୟ କାଉନସେଲିଂ ଓ ପାଠ୍ୟକ୍ରମ ବଣ୍ଟନ' : 'Student Subject Counselling & Course Allotment'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {role === 'HOD' && hodDeptName
              ? `Viewing and managing subject counselling strictly for Department of ${hodDeptName}${hodDeptMeta.hasAedp ? ' & its AEDP specialization' : ''} only.`
              : lang === 'or'
              ? 'ଅଧିବେଶନ-ୱାର୍ଜ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ନିୟମିତ ଅନର୍ସ (Major, Minor 1, Minor 2, MDC, SEC, AEC, VAC) ଏବଂ AEDP ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମର ବିଷୟ ବଣ୍ଟନ।'
              : 'Year-wise student subject counselling records. Regular Honours include Major, Minor 1/2, MDC 1-3, SEC 1-3, AEC, VAC 1-2. AEDP courses include Major 1/2, MDC 1-2, AEC 1-2, SEC 1-2, VAC 1-2.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex flex-wrap items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('excel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'excel' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Excel Matrix View
            </button>
            <button
              onClick={() => setViewMode('defaulter_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                viewMode === 'defaulter_list'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-rose-300 hover:text-white bg-rose-500/10 border border-rose-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Defaulter List ({allDefaulterCandidates.length})
            </button>
          </div>

          {canEdit && (
            <label className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center shadow-lg transition cursor-pointer">
              <Upload className="w-4 h-4 mr-1.5" />
              <span>{isUploadingCounsellingExcel ? 'Updating...' : 'Upload Counselling Excel'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleDirectCounsellingUpload}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {lang === 'or' ? 'କାଉନସେଲିଂ ରିପୋର୍ଟ ଡାଉନଲୋଡ୍ (Excel)' : 'Export Counselling Excel'}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-mono font-bold">{lang === 'or' ? 'ଅଧିବେଶନ (Year / Batch):' : 'Course Year / Batch:'}</span>
            {[
              { id: '2026-27', label: '1st Year (2026-27)' },
              { id: '2025-26', label: '2nd Year (2025-26)' },
              { id: '2024-25', label: '3rd Year (2024-25)' },
              { id: 'ALL', label: 'All Years' },
            ].map((ay) => (
              <button
                key={ay.id}
                onClick={() => setSelectedSession(ay.id)}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition flex items-center gap-1.5 ${
                  selectedSession === ay.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{ay.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    selectedSession === ay.id
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-900 text-amber-300 border border-slate-700'
                  }`}
                >
                  {batchActiveCounts[ay.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-mono font-bold">{lang === 'or' ? 'ପାଠ୍ୟକ୍ରମ ପ୍ରକାର:' : 'Course Type:'}</span>
            {[
              { id: 'ALL', label: 'All Courses' },
              { id: 'REGULAR', label: 'Regular Honours' },
              { id: 'AEDP', label: 'AEDP Specializations' },
            ].map((ct) => (
              <button
                key={ct.id}
                onClick={() => setSelectedCourseType(ct.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCourseType === ct.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
          {/* Full Database Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'or' ? 'ଛାତ୍ର, ରୋଲ୍, ବିଭାଗ କିମ୍ବା ବିଷୟ ନାମ ଖୋଜନ୍ତୁ...' : 'Search student, roll no, department, or paper name across DB...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stream Filter */}
          {role === 'HOD' ? (
            <select
              value="ALL"
              disabled
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none disabled:opacity-60 font-mono"
              title="Stream is automatically locked to your HOD department"
            >
              <option value="ALL">
                Stream: {hodDeptMeta.streams.length > 0 ? hodDeptMeta.streams.join(' / ') : 'Department Only'}
              </option>
            </select>
          ) : (
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="ALL">{lang === 'or' ? 'ସମସ୍ତ ଶାଖା (Stream: ALL)' : 'Stream: All Streams'}</option>
              <option value="Arts">Arts</option>
              <option value="Physical Science">Physical Science</option>
              <option value="Biological Science">Biological Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Self Financing">Self Financing</option>
            </select>
          )}

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            disabled={role === 'HOD'}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-60 font-mono"
          >
            {role === 'HOD' ? (
              <option value={hodDeptName || ''}>
                Department: {hodDeptName}{hodDeptMeta.hasAedp ? ' & AEDP' : ' Only'}
              </option>
            ) : (
              <>
                <option value="ALL">{lang === 'or' ? 'ସମସ୍ତ ବିଭାଗ (Dept: ALL)' : 'Department: All Departments'}</option>
                {availableDeptOptions.map((deptName) => (
                  <option key={deptName} value={deptName}>
                    {deptName}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Paper Category Filter */}
          <select
            value={selectedPaperCategory}
            onChange={(e) => {
              setSelectedPaperCategory(e.target.value);
              setSelectedPaperName('ALL');
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="ALL">Paper Category: All Categories</option>
            <option value="MAJOR">Category: Major (Honours)</option>
            <option value="MINOR">Category: Minor</option>
            <option value="MDC">Category: MDC (Multidisciplinary)</option>
            <option value="AEC">Category: AEC (Ability Enhancement)</option>
            <option value="VAC">Category: VAC (Value Added)</option>
            <option value="SEC">Category: SEC (Skill Enhancement)</option>
          </select>

          {/* Paper Name Filter */}
          <select
            value={selectedPaperName}
            onChange={(e) => setSelectedPaperName(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-amber-500 max-w-[220px] font-mono truncate"
          >
            <option value="ALL">Paper Name: All Papers ({allUniquePaperNames.length})</option>
            {allUniquePaperNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
          >
            <option value="ALL">Semester: All Semesters (I - VI)</option>
            <option value="Semester I">Semester I (1st Sem)</option>
            <option value="Semester II">Semester II (2nd Sem)</option>
            <option value="Semester III">Semester III (3rd Sem)</option>
            <option value="Semester IV">Semester IV (4th Sem)</option>
            <option value="Semester V">Semester V (5th Sem)</option>
            <option value="Semester VI">Semester VI (6th Sem)</option>
          </select>

          <span className="text-slate-400 font-mono text-[11px] ml-auto">
            Showing{' '}
            <strong>
              {viewMode === 'defaulter_list'
                ? defaulterFilterType === 'counselling'
                  ? counsellingDefaulters.length
                  : univRollDefaulters.length
                : activeCountedStudents}
            </strong>{' '}
            records
          </span>
        </div>
      </div>

      {/* Excel Matrix View vs Defaulter List View vs Table View */}
      {viewMode === 'excel' ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl space-y-4">
          {/* Excel Sheet Selection Tabs */}
          <div className="bg-slate-950 px-4 pt-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-slate-200 font-bold">Workbook Sheets:</span>
              <button
                onClick={() => setExcelSheet('regular')}
                className={`px-4 py-2 rounded-t-xl font-bold font-mono transition border-t border-x ${
                  excelSheet === 'regular'
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 shadow-inner'
                    : 'bg-slate-950 text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Regular Honours ({regularCount})
              </button>
              <button
                onClick={() => setExcelSheet('aedp')}
                className={`px-4 py-2 rounded-t-xl font-bold font-mono transition border-t border-x ${
                  excelSheet === 'aedp'
                    ? 'bg-slate-900 text-purple-300 border-purple-500/40 shadow-inner'
                    : 'bg-slate-950 text-slate-400 border-transparent hover:text-white'
                }`}
              >
                AEDP Specializations ({aedpCount})
              </button>
            </div>
            <div className="text-slate-400 text-[11px] pb-2 font-mono">
              Active Sheet: <strong className="text-white">{excelSheet === 'regular' ? 'Regular Honours' : 'AEDP Specializations'}</strong>
            </div>
          </div>

          {/* Sheet Table Grid */}
          <div className="overflow-x-auto max-h-[70vh] px-4 pb-4">
            {excelSheet === 'regular' ? (
              <table className="w-full text-left text-[11px] text-slate-200 border-collapse font-mono">
                <thead className="bg-slate-950 text-emerald-300 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sl</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Roll No</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Univ Roll</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">SAMS Reg</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Student Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Stream</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Major (Honours)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Minor 1</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Minor 2</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">MDC 1 / 2 / 3</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">SEC 1 / 2 / 3</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">AEC 1 / 2</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">VAC 1 / 2 / 3 / 4</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem I</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem II</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem III</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem IV</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem V</th>
                    <th className="py-2.5 px-3">Sem VI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedExcelStudents.length === 0 ? (
                    <tr>
                      <td colSpan={19} className="py-12 text-center text-slate-400">
                        No Regular Honours counselling records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExcelStudents.map((s, idx) => {
                      const record = getRecordForStudent(s);
                      const reg = record.regular;
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                      const min1 = reg?.minor1 || reg?.sem1?.minor || '-';
                      const min2 = reg?.minor2 || reg?.sem2?.minor || '-';
                      const mdc1 = reg?.mdc1 || reg?.sem1?.mdc || '-';
                      const mdc2 = reg?.mdc2 || reg?.sem2?.mdc || '-';
                      const mdc3 = reg?.mdc3 || reg?.sem3?.mdc || '-';
                      const sec1 = reg?.sec1 || reg?.sem2?.sec || '-';
                      const sec2 = reg?.sec2 || reg?.sem5?.sec || '-';
                      const sec3 = reg?.sec3 || reg?.sem6?.sec || '-';
                      const aec1 = reg?.aec1 || reg?.sem1?.aec || '-';
                      const aec2 = reg?.aec2 || reg?.sem2?.aec || 'ENGLISH';
                      const vac1 = reg?.vac1 || reg?.sem1?.vac || 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT';
                      const vac2 = reg?.vac2 || reg?.sem3?.vac || 'ETHICS AND VALUES';
                      const vac3 = reg?.vac3 || reg?.sem5?.vac || 'UNDERSTANDING ODISHA';
                      const vac4 = reg?.vac4 || reg?.sem6?.vac || 'Creative Writing';

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/60 transition">
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{globalIdx}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold text-amber-300">{s.rollNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-mono text-cyan-300">{s.universityRollNo || 'N/A'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{s.samsRegNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-sans font-bold text-white">{s.name}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-purple-300">{s.stream}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-amber-200 font-bold">{reg?.major || s.department}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-emerald-300 font-semibold">{min1}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-emerald-200 font-semibold">{min2}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`${mdc1} | ${mdc2} | ${mdc3}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-cyan-300 text-[10px] font-semibold">
                            {`${sec1} | ${sec2} | ${sec3}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`${aec1} | ${aec2}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`${vac1} | ${vac2} | ${vac3} | ${vac4}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`Minor:${min1} | MDC:${mdc1} | AEC:${aec1} | VAC:${vac1}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`Minor:${min2} | MDC:${mdc2} | AEC:${aec2} | SEC:${sec1}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`Minor:${min1} | MDC:${mdc3} | VAC:${vac2}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`Minor:${min2} | Act:${reg?.sem4?.activity || 'Internship / Community Engagement'}`}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {`Minor:${min1} | SEC:${sec2} | VAC:${vac3}`}
                          </td>
                          <td className="py-2 px-3 text-slate-300 text-[10px]">
                            {`Minor:${min2} | SEC:${sec3} | VAC:${vac4}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-[11px] text-slate-200 border-collapse font-mono">
                <thead className="bg-slate-950 text-purple-300 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sl</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Roll No</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Univ Roll</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">SAMS Reg</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Student Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Stream</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Major 1 (Specialization)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Major 2 (Parent Dept)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem I (AEC/VAC)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem II (AEC/VAC)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem III (MDC/SEC)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sem IV (MDC/SEC)</th>
                    <th className="py-2.5 px-3">Sem V & VI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedExcelStudents.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-400">
                        No AEDP Specialization counselling records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExcelStudents.map((s, idx) => {
                      const record = getRecordForStudent(s);
                      const aedp = record.aedp;
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/60 transition">
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{globalIdx}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold text-amber-300">{s.rollNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-mono text-cyan-300">{s.universityRollNo || 'N/A'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{s.samsRegNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-sans font-bold text-white">{s.name}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-purple-300">{s.stream}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-amber-200 font-bold">{aedp?.major1 || s.department}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300">{aedp?.major2 || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {aedp?.sem1 ? `AEC:${aedp.sem1.aec1} | VAC:${aedp.sem1.vac1}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {aedp?.sem2 ? `AEC:${aedp.sem2.aec2} | VAC:${aedp.sem2.vac2}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {aedp?.sem3 ? `MDC:${aedp.sem3.mdc1} | SEC:${aedp.sem3.sec1}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {aedp?.sem4 ? `MDC:${aedp.sem4.mdc2} | SEC:${aedp.sem4.sec2}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-purple-300 font-bold">
                            APPRENTICESHIP (Paid OJT)
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : viewMode === 'defaulter_list' ? (
        <div className="space-y-6">
          {/* Defaulter List Header & Separate Mode Switcher */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-bold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>DEFAULTER LIST &bull; BATCH {selectedSession}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white font-serif">
                  Separate Defaulter Lists: Subject Counselling &amp; University Roll Numbers
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View students who have not filled their <strong>Subject Counselling</strong> and students who have not filled their <strong>University Roll Numbers</strong> separately.
                </p>
              </div>
            </div>

            {/* Separate List Selector Tabs + Summary Counts */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-mono font-bold">Show List:</span>
                {[
                  {
                    id: 'counselling',
                    label: `1. Subject Counselling Not Filled (${counsellingDefaulters.length})`,
                  },
                  {
                    id: 'univ_roll',
                    label: `2. University Roll No. Not Filled (${univRollDefaulters.length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDefaulterFilterType(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition border ${
                      defaulterFilterType === tab.id
                        ? 'bg-rose-500 text-white border-rose-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {selectedDeptFilter !== 'ALL' && role !== 'HOD' && (
                <button
                  onClick={() => setSelectedDeptFilter('ALL')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold"
                >
                  Show All Departments
                </button>
              )}
            </div>
          </div>

          {/* LIST 1: STUDENTS WHO HAVE NOT FILLED SUBJECT COUNSELLING */}
          {defaulterFilterType === 'counselling' && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
                      List 1
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white font-serif">
                      Students Who Have Not Filled Subject Counselling ({counsellingDefaulters.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Admitted students in {selectedSession} whose NEP 2020 subject counselling (Minor / MDC / AEC / SEC) is incomplete or pending, grouped department-wise.
                  </p>
                </div>

                <button
                  onClick={() => {
                    exportDefaulterListExcel(counsellingDefaulters, selectedSession, `${selectedDeptFilter}_Subject_Counselling_Pending`);
                    showToast(`Exported ${counsellingDefaulters.length} Subject Counselling pending records!`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export This List (Excel)
                </button>
              </div>

              {counsellingDefaulterDepts.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">All students have completed Subject Counselling!</div>
                  <p className="text-xs text-slate-400">No students pending subject counselling for the selected filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {counsellingDefaulterDepts.map((deptGroup) => (
                    <div key={`sc-${deptGroup.department}`} className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-extrabold text-white font-serif">{deptGroup.department}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                            {deptGroup.stream}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            {deptGroup.items.length} / {deptGroup.totalDeptStudents} Subject Counselling Not Filled
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            exportDefaulterListExcel(deptGroup.items, selectedSession, `${deptGroup.department}_Subject_Counselling_Pending`);
                            showToast(`Downloaded Subject Counselling defaulter list for ${deptGroup.department}!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" /> Dept Excel
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-200">
                          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Sl</th>
                              <th className="py-2.5 px-3">Roll &amp; SAMS Barcode</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Batch / Stream</th>
                              <th className="py-2.5 px-3">Department / Honours</th>
                              <th className="py-2.5 px-3">Pending Subject Fields</th>
                              {canEdit && <th className="py-2.5 px-3 text-center">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {deptGroup.items.map((entry, idx) => {
                              const s = entry.student;
                              return (
                                <tr key={`sc-${s.id}`} className="hover:bg-slate-800/40 transition">
                                  <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <div className="font-bold text-amber-300">{s.rollNo}</div>
                                    <div className="text-[10px] text-slate-400">{s.samsRegNo}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-white">{s.name}</div>
                                    <div className="text-[10px] text-slate-400">Father: {s.parentName || 'N/A'}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <div className="text-emerald-300 font-bold">{entry.batch}</div>
                                    <div className="text-[10px] text-purple-300">{s.stream}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-200">{s.department}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" /> Not Filled ({entry.missingFields.join(', ')})
                                    </span>
                                  </td>
                                  {canEdit && (
                                    <td className="py-2.5 px-3 text-center">
                                      <button
                                        onClick={() => handleOpenEdit(s)}
                                        className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center shadow transition"
                                      >
                                        <Edit2 className="w-3 h-3 mr-1" /> Fill Now
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIST 2: STUDENTS WHO HAVE NOT FILLED UNIVERSITY ROLL NUMBERS */}
          {defaulterFilterType === 'univ_roll' && (
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase">
                      List 2
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white font-serif">
                      Students Who Have Not Filled University Roll Numbers ({univRollDefaulters.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Admitted students in {selectedSession} whose University Roll Number has not been entered yet, grouped department-wise.
                  </p>
                </div>

                <button
                  onClick={() => {
                    exportDefaulterListExcel(univRollDefaulters, selectedSession, `${selectedDeptFilter}_Univ_Roll_Pending`);
                    showToast(`Exported ${univRollDefaulters.length} University Roll No. pending records!`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center shadow transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export This List (Excel)
                </button>
              </div>

              {univRollDefaulterDepts.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">All students have University Roll Numbers filled!</div>
                  <p className="text-xs text-slate-400">No students pending University Roll Number for the selected filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {univRollDefaulterDepts.map((deptGroup) => (
                    <div key={`ur-${deptGroup.department}`} className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Building2 className="w-4 h-4 text-rose-400" />
                          <span className="text-sm font-extrabold text-white font-serif">{deptGroup.department}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                            {deptGroup.stream}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                            {deptGroup.items.length} / {deptGroup.totalDeptStudents} Univ Roll Not Filled
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            exportDefaulterListExcel(deptGroup.items, selectedSession, `${deptGroup.department}_Univ_Roll_Pending`);
                            showToast(`Downloaded University Roll No. defaulter list for ${deptGroup.department}!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-bold flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" /> Dept Excel
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-200">
                          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Sl</th>
                              <th className="py-2.5 px-3">Roll &amp; SAMS Barcode</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Batch / Stream</th>
                              <th className="py-2.5 px-3">Department / Honours</th>
                              <th className="py-2.5 px-3">University Roll No.</th>
                              {canEdit && <th className="py-2.5 px-3 text-center">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {deptGroup.items.map((entry, idx) => {
                              const s = entry.student;
                              return (
                                <tr key={`ur-${s.id}`} className="hover:bg-slate-800/40 transition">
                                  <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <div className="font-bold text-amber-300">{s.rollNo}</div>
                                    <div className="text-[10px] text-slate-400">{s.samsRegNo}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-white">{s.name}</div>
                                    <div className="text-[10px] text-slate-400">Father: {s.parentName || 'N/A'}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <div className="text-emerald-300 font-bold">{entry.batch}</div>
                                    <div className="text-[10px] text-purple-300">{s.stream}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-200">{s.department}</td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold inline-flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" /> University Roll No. Not Filled
                                    </span>
                                  </td>
                                  {canEdit && (
                                    <td className="py-2.5 px-3 text-center">
                                      <button
                                        onClick={() => handleOpenEdit(s)}
                                        className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold inline-flex items-center shadow transition"
                                      >
                                        <Edit2 className="w-3 h-3 mr-1" /> Fill Now
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-3">Roll & SAMS Reg</th>
                  <th className="py-3.5 px-3">Univ Roll No</th>
                  <th className="py-3.5 px-3">Student Name</th>
                  <th className="py-3.5 px-3">Stream / Session</th>
                  <th className="py-3.5 px-3">Course & Honours</th>
                  <th className="py-3.5 px-3">Subject Allotment Details (NEP 2020)</th>
                  {canEdit && <th className="py-3.5 px-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400 space-y-3">
                      <p>{lang === 'or' ? 'କୌଣସି ଛାତ୍ରଛାତ୍ରୀ ରେକର୍ଡ ମିଳିଲା ନାହିଁ।' : 'No student subject counselling records found. Load sample student roster to view counselling allocations.'}</p>
                      {students.length === 0 && role === 'SUPER_ADMIN' && (
                        <button
                          onClick={loadSampleStudents}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-600 transition"
                        >
                          Load Sample Student Roster & Counselling Records
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => {
                    const record = getRecordForStudent(s);
                    const isAedp = record.isAedp;

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono">
                          <div className="font-bold text-amber-300">{s.rollNo}</div>
                          <div className="text-[10px] text-slate-400">{s.samsRegNo}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-300 font-semibold">
                          {s.universityRollNo || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                            <span>{s.name}</span>
                            {(s.isClcTaken || s.status === 'CLC Taken') && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider">
                                CLC Taken
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">Father: {s.parentName || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-purple-300">{s.stream}</div>
                          <div className="text-[10px] font-mono text-slate-400">Batch: {inferSessionFromStudent(s.academicYear || record.academicYear || '', s, s.rollNo || record.rollNo, s.samsRegNo || record.samsRegNo)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${
                            isAedp
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isAedp ? 'AEDP Course' : 'Regular Honours'}
                          </span>
                          <div className="font-bold text-slate-100">{s.department}</div>
                        </td>
                        <td className="py-3 px-3 max-w-md">
                          {isAedp && record.aedp ? (
                            <div className="space-y-1.5 text-[11px]">
                              <div className="font-bold text-amber-400">Major 1: {record.aedp.major1}</div>
                              <div className="font-bold text-amber-300">Major 2: {record.aedp.major2}</div>
                              {record.aedp.sem1 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem I:</span> AEC: {record.aedp.sem1.aec1} | VAC: {record.aedp.sem1.vac1}
                                </div>
                              )}
                              {record.aedp.sem2 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem II:</span> AEC: {record.aedp.sem2.aec2} | VAC: {record.aedp.sem2.vac2}
                                </div>
                              )}
                              {record.aedp.sem3 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem III:</span> MDC: {record.aedp.sem3.mdc1} | SEC: {record.aedp.sem3.sec1}
                                </div>
                              )}
                              {record.aedp.sem4 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem IV:</span> MDC: {record.aedp.sem4.mdc2} | SEC: {record.aedp.sem4.sec2}
                                </div>
                              )}
                              {record.aedp.sem5_6 && (
                                <div className="text-purple-300 font-bold font-mono">
                                  <span className="text-amber-300">Sem V & VI:</span> APPRENTICESHIP
                                </div>
                              )}
                            </div>
                          ) : record.regular ? (
                            <div className="space-y-1.5 text-[11px]">
                              <div className="font-bold text-amber-400">Major: {record.regular.major || s.department}</div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-emerald-300 font-semibold font-mono text-[10px] bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800">
                                <span>Minor 1: <strong className="text-white">{record.regular.minor1 || record.regular.sem1?.minor || '-'}</strong></span>
                                <span>•</span>
                                <span>Minor 2: <strong className="text-white">{record.regular.minor2 || record.regular.sem2?.minor || '-'}</strong></span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-cyan-300 font-semibold font-mono text-[10px] bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800">
                                <span>SEC 1: <strong className="text-white">{record.regular.sec1 || record.regular.sem2?.sec || '-'}</strong></span>
                                <span>•</span>
                                <span>SEC 2: <strong className="text-white">{record.regular.sec2 || record.regular.sem5?.sec || '-'}</strong></span>
                                <span>•</span>
                                <span>SEC 3: <strong className="text-white">{record.regular.sec3 || record.regular.sem6?.sec || '-'}</strong></span>
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem I:</span> Minor: {record.regular.sem1?.minor || record.regular.minor1 || '-'} | MDC: {record.regular.sem1?.mdc || record.regular.mdc1 || '-'} | AEC: {record.regular.sem1?.aec || record.regular.aec1 || '-'} | VAC: {record.regular.sem1?.vac || record.regular.vac1 || 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT'}
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem II:</span> Minor: {record.regular.sem2?.minor || record.regular.minor2 || '-'} | MDC: {record.regular.sem2?.mdc || record.regular.mdc2 || '-'} | AEC: {record.regular.sem2?.aec || record.regular.aec2 || 'ENGLISH'} | SEC: {record.regular.sem2?.sec || record.regular.sec1 || '-'}
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem III:</span> Minor: {record.regular.sem3?.minor || record.regular.minor1 || '-'} | MDC: {record.regular.sem3?.mdc || record.regular.mdc3 || '-'} | VAC: {record.regular.sem3?.vac || record.regular.vac2 || 'ETHICS AND VALUES'}
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem IV:</span> Minor: {record.regular.sem4?.minor || record.regular.minor2 || '-'} | Activity: {record.regular.sem4?.activity || 'Internship / Community Engagement'}
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem V:</span> Minor: {record.regular.sem5?.minor || record.regular.minor1 || '-'} | SEC: {record.regular.sem5?.sec || record.regular.sec2 || '-'} | VAC: {record.regular.sem5?.vac || record.regular.vac3 || 'UNDERSTANDING ODISHA'}
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-300 font-semibold font-mono">Sem VI:</span> Minor: {record.regular.sem6?.minor || record.regular.minor2 || '-'} | SEC: {record.regular.sem6?.sec || record.regular.sec3 || '-'} | VAC: {record.regular.sem6?.vac || record.regular.vac4 || 'Creative Writing'}
                              </div>
                            </div>
                          ) : null}
                        </td>
                        {canEdit && (
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center mx-auto shadow transition"
                              title="Edit Subject Counselling"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Subjects
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && viewMode !== 'defaulter_list' && (
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 shadow-xl">
          <div>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({activeCountedStudents} total records)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center font-bold"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center font-bold"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Subject Counselling Modal */}
      {isModalOpen && editForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-amber-400 flex items-center font-serif">
                  <GraduationCap className="w-5 h-5 mr-2" /> NEP 2020 Subject Counselling Editor
                </h3>
                <p className="text-xs text-slate-400">
                  Student: <strong className="text-white">{editForm.studentName}</strong> ({editForm.rollNo} • {editForm.department})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="block text-amber-300 font-semibold mb-1 font-mono">University Roll Number</label>
                <input
                  type="text"
                  value={editForm.universityRollNo || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      universityRollNo: e.target.value,
                    })
                  }
                  placeholder="Enter University Roll Number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {editForm.isAedp && editForm.aedp ? (
                /* AEDP Course Baskets */
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl text-purple-300 font-semibold">
                    AEDP Specialization Course (1 Year Paid Industrial Apprenticeship in 3rd Year)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Major 1 (Core Industrial Specialization)</label>
                      <input
                        type="text"
                        value={editForm.aedp.major1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, major1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Major 2 (Applied Allied Technology)</label>
                      <input
                        type="text"
                        value={editForm.aedp.major2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, major2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">MDC 1 (Multidisciplinary Course)</label>
                      <input
                        type="text"
                        value={editForm.aedp.mdc1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, mdc1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">MDC 2</label>
                      <input
                        type="text"
                        value={editForm.aedp.mdc2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, mdc2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 1 (Ability Enhancement Course)</label>
                      <input
                        type="text"
                        value={editForm.aedp.aec1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, aec1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 2</label>
                      <input
                        type="text"
                        value={editForm.aedp.aec2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, aec2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">SEC 1 (Apprenticeship OJT 1)</label>
                      <input
                        type="text"
                        value={editForm.aedp.sec1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, sec1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">SEC 2 (Apprenticeship OJT 2)</label>
                      <input
                        type="text"
                        value={editForm.aedp.sec2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, sec2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 1 (Value Added Course)</label>
                      <input
                        type="text"
                        value={editForm.aedp.vac1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, vac1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 2</label>
                      <input
                        type="text"
                        value={editForm.aedp.vac2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aedp: { ...editForm.aedp!, vac2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ) : editForm.regular ? (
                /* Regular Honours Baskets */
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 font-semibold">
                    Regular Honours Degree (NEP 2020 Multi-Disciplinary Framework)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Major (Honours)</label>
                      <input
                        type="text"
                        value={editForm.regular.major}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, major: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Minor 1</label>
                      <input
                        type="text"
                        value={editForm.regular.minor1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, minor1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Minor 2</label>
                      <input
                        type="text"
                        value={editForm.regular.minor2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, minor2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">MDC 1</label>
                      <input
                        type="text"
                        value={editForm.regular.mdc1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, mdc1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">MDC 2</label>
                      <input
                        type="text"
                        value={editForm.regular.mdc2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, mdc2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">MDC 3</label>
                      <input
                        type="text"
                        value={editForm.regular.mdc3}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, mdc3: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        SEC 1 <span className="text-[10px] text-amber-400 font-mono font-normal">(Fills Sem II SEC)</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.regular.sec1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, sec1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">SEC 2</label>
                      <input
                        type="text"
                        value={editForm.regular.sec2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, sec2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">SEC 3</label>
                      <input
                        type="text"
                        value={editForm.regular.sec3}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, sec3: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 1</label>
                      <input
                        type="text"
                        value={editForm.regular.aec1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, aec1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 2 (Sem 2)</label>
                      <input
                        type="text"
                        value={editForm.regular.aec2 || 'ENGLISH'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, aec2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 1 (Sem 1)</label>
                      <input
                        type="text"
                        value={editForm.regular.vac1 || 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, vac1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 2 (Sem 3)</label>
                      <input
                        type="text"
                        value={editForm.regular.vac2 || 'ETHICS AND VALUES'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, vac2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 3 (Sem 5)</label>
                      <input
                        type="text"
                        value={editForm.regular.vac3 || editForm.regular.sem5?.vac || 'UNDERSTANDING ODISHA'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: {
                              ...editForm.regular!,
                              vac3: e.target.value,
                              sem5: { ...(editForm.regular?.sem5 || { major: editForm.regular?.major || '', minor: editForm.regular?.minor1 || '', sec: editForm.regular?.sec2 || '' }), vac: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 4 (Sem 6)</label>
                      <input
                        type="text"
                        value={editForm.regular.vac4 || editForm.regular.sem6?.vac || 'Creative Writing'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: {
                              ...editForm.regular!,
                              vac4: e.target.value,
                              sem6: { ...(editForm.regular?.sem6 || { major: editForm.regular?.major || '', minor: editForm.regular?.minor2 || '', sec: editForm.regular?.sec3 || '' }), vac: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  Save Counselling Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
