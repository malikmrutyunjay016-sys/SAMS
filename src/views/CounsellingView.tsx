import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, StudentCounsellingRecord, StreamType } from '../types';
import {
  generateDefaultCounselling,
  generateSuggestedCounselling,
  exportCounsellingExcel,
  exportCategorySubjectExcel,
  extractSubjectAllocations,
  SubjectAllocationEntry,
  COMMON_AEC_OPTIONS,
  COMMON_VAC_OPTIONS,
} from '../lib/counsellingService';
import { compareRollNumbers, compareStudentsByStreamDeptRoll } from '../lib/excelParser';
import {
  GraduationCap,
  Download,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
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
  const { students, seatMatrix, loadSampleStudents, t, lang } = useData();
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
  const [viewMode, setViewMode] = useState<'table' | 'excel' | 'subject_details'>('table');
  const [excelSheet, setExcelSheet] = useState<'regular' | 'aedp'>('regular');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC'>('MDC');

  // Local counselling records cache map (StudentID -> StudentCounsellingRecord)
  const [counsellingMap, setCounsellingMap] = useState<Record<string, StudentCounsellingRecord>>(() => {
    try {
      const saved = localStorage.getItem(LS_COUNSELLING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map: Record<string, StudentCounsellingRecord> = {};
          parsed.forEach((r) => {
            if (r && (r.studentId || r.id)) {
              map[r.studentId || r.id] = r;
            }
          });
          return map;
        }
      }
    } catch {}
    return {};
  });

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
      if (record.regular.aec2) entries.push({ category: 'AEC', paperName: record.regular.aec2 });
      if (record.regular.vac1) entries.push({ category: 'VAC', paperName: record.regular.vac1 });
      if (record.regular.vac2) entries.push({ category: 'VAC', paperName: record.regular.vac2 });
      if (record.regular.sec1) entries.push({ category: 'SEC', paperName: record.regular.sec1 });
      if (record.regular.sec2) entries.push({ category: 'SEC', paperName: record.regular.sec2 });
      if (record.regular.sec3) entries.push({ category: 'SEC', paperName: record.regular.sec3 });
    }
    return entries.filter((e) => Boolean(e.paperName && e.paperName.trim() && e.paperName !== '-'));
  }

  // Helper to check if student department matches HOD department or corresponding AEDP course
  function isStudentInHodDept(student: Student, hodDept: string): boolean {
    if (!hodDept) return false;
    const h = hodDept.toLowerCase().trim();
    const sDept = (student.department || '').toLowerCase().trim();

    // Exact or substring match
    if (sDept === h || sDept.includes(h) || h.includes(sDept)) return true;

    // Mapping between parent department and corresponding AEDP specializations
    if ((h.includes('commerce') || h.includes('comm') || h.includes('b.com')) && 
        (sDept.includes('commerce') || sDept.includes('bank') || sDept.includes('finance') || sDept.includes('insurance') || sDept.includes('bfsi'))) {
      return true;
    }
    if ((h.includes('english') || h.includes('eng')) && 
        (sDept.includes('english') || sDept.includes('translation') || sDept.includes('digital humanities'))) {
      return true;
    }
    if ((h.includes('econ') || h.includes('economics')) && 
        (sDept.includes('econ') || sDept.includes('data analytics'))) {
      return true;
    }
    if ((h.includes('chem') || h.includes('chemistry')) && 
        (sDept.includes('chem') || sDept.includes('industrial process'))) {
      return true;
    }
    if ((h.includes('math') || h.includes('comput')) && 
        (sDept.includes('math') || sDept.includes('comput') || sDept.includes('algorithm'))) {
      return true;
    }
    if ((h.includes('botan') || h.includes('botany')) && 
        (sDept.includes('botan') || sDept.includes('tissue culture') || sDept.includes('agri'))) {
      return true;
    }
    if ((h.includes('zool') || h.includes('zoology')) && 
        (sDept.includes('zool') || sDept.includes('biomedical'))) {
      return true;
    }
    if ((h.includes('hist') || h.includes('history')) && 
        (sDept.includes('hist') || sDept.includes('tourism') || sDept.includes('heritage'))) {
      return true;
    }

    // Also check student's counselling record Major 1 / Major 2 if present
    const record = counsellingMap[student.id];
    if (record?.aedp) {
      const m1 = (record.aedp.major1 || '').toLowerCase();
      const m2 = (record.aedp.major2 || '').toLowerCase();
      if (m1.includes(h) || m2.includes(h) || h.includes(m2)) return true;
    }

    return false;
  }

  // Helper to get counselling record with O(1) Map lookup
  function getRecordForStudent(student: Student): StudentCounsellingRecord {
    if (counsellingMap[student.id]) {
      return counsellingMap[student.id];
    }
    return generateSuggestedCounselling(student);
  }

  // Extract all unique paper names across the entire student counselling database
  const allUniquePaperNames = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      const rec = getRecordForStudent(s);
      const entries = getStudentPaperEntries(rec);
      entries.forEach((e) => {
        if (selectedPaperCategory === 'ALL' || e.category === selectedPaperCategory) {
          set.add(e.paperName.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [students, counsellingMap, selectedPaperCategory]);

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
  ]);

  // Memoized filtered students list searching across student info and complete subject counselling database
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      if (role === 'HOD' && hodDeptName) {
        if (!isStudentInHodDept(s, hodDeptName)) return false;
      }
      const matchesSession = selectedSession === 'ALL' || (s.academicYear || '2026-27') === selectedSession;
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

      const record = getRecordForStudent(s);
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
    }).sort(compareStudentsByStreamDeptRoll);
  }, [
    students,
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

  // Counts for sheets
  const regularCount = useMemo(() => filteredStudents.filter((s) => !getRecordForStudent(s).isAedp).length, [filteredStudents, counsellingMap]);
  const aedpCount = useMemo(() => filteredStudents.filter((s) => getRecordForStudent(s).isAedp).length, [filteredStudents, counsellingMap]);

  // Paginated slice for table view vs excel matrix view
  const activeStudentList = viewMode === 'excel' ? excelFilteredStudents : filteredStudents;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeStudentList.slice(start, start + pageSize);
  }, [activeStudentList, currentPage, pageSize]);

  const paginatedExcelStudents = paginatedStudents;

  const totalPages = Math.ceil(activeStudentList.length / pageSize) || 1;

  // Memoized category allocations for Minor, MDC, AEC, VAC, SEC Details tab
  const categoryAllocations = useMemo(() => {
    const allRecords = filteredStudents.map((s) => getRecordForStudent(s));
    const raw = extractSubjectAllocations(allRecords, activeCategoryTab);
    if (selectedSemester === 'ALL') return raw;
    return raw.filter(
      (a) => a.semester === selectedSemester || a.semesterTag.toLowerCase().includes(selectedSemester.toLowerCase())
    );
  }, [filteredStudents, activeCategoryTab, selectedSemester, counsellingMap]);

  const uniqueSubjectsCount = useMemo(() => {
    return new Set(categoryAllocations.map((a) => a.subjectName)).size;
  }, [categoryAllocations]);

  const handleDownloadCategoryExcel = (cat: 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC') => {
    const allRecords = filteredStudents.map((s) => getRecordForStudent(s));
    exportCategorySubjectExcel(allRecords, cat, `${selectedSession}_${selectedSemester}`);
    showToast(`Successfully downloaded ${cat} subject roster details for ${selectedSession} (${selectedSemester})!`);
  };

  const handleOpenEdit = (student: Student) => {
    if (role === 'HOD' && hodDeptName && !isStudentInHodDept(student, hodDeptName)) {
      showToast(`Access Denied: HOD can only access/edit students from ${hodDeptName} and corresponding AEDP courses.`);
      return;
    }
    let counselling = getRecordForStudent(student);
    if (counselling.status === 'Pending' || (!counselling.aedp?.major2 && !counselling.regular?.minor1)) {
      counselling = generateSuggestedCounselling(student);
    }
    setEditingRecord(counselling);
    setEditForm(JSON.parse(JSON.stringify(counselling)));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    let formToSave = { ...editForm };
    if (formToSave.regular) {
      const reg = formToSave.regular;
      formToSave.regular = {
        ...reg,
        sem1: { major: reg.major, minor: reg.minor1, mdc: reg.mdc1, aec: reg.aec1, vac: reg.vac1 },
        sem2: { major: reg.major, minor: reg.minor2, mdc: reg.mdc2, aec: reg.aec2, vac: reg.vac2 },
        sem3: { major: reg.major, minor: reg.minor1, mdc: reg.mdc3, vac: reg.vac2 },
        sem4: reg.sem4 || { major: reg.major, minor: reg.minor2, activity: 'Internship / Community Engagement & Service / Field Work' },
        sem5: { major: reg.major, minor: reg.minor1, sec: reg.sec2, vac: reg.sem5?.vac || 'Understanding Odisha' },
        sem6: { major: reg.major, minor: reg.minor2, sec: reg.sec3, vac: reg.sem6?.vac || 'Creative Writing' },
      };
    }

    const updatedMap = {
      ...counsellingMap,
      [formToSave.studentId || formToSave.id]: formToSave,
    };
    setCounsellingMap(updatedMap);

    // Save to localStorage in background/synchronously
    try {
      localStorage.setItem(LS_COUNSELLING_KEY, JSON.stringify(Object.values(updatedMap)));
    } catch (err) {
      console.warn('Failed to save counselling records to localStorage:', err);
    }

    setIsModalOpen(false);
    showToast(`Successfully updated subject counselling record for ${editForm.studentName}!`);
  };

  const handleExportAll = () => {
    const allRecords = filteredStudents.map((s) => getRecordForStudent(s));
    exportCounsellingExcel(allRecords, selectedSession);
    showToast(`Successfully exported ${allRecords.length} student subject counselling records to Excel!`);
  };

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
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'or' ? 'ଏନ.ଇ.ପି. (NEP) ୨୦୨୦ • ଛାତ୍ର ବିଷୟ କାଉନସେଲିଂ ମ୍ୟାଟ୍ରିକ୍ସ' : 'NEP 2020 FRAMEWORK • STUDENT SUBJECT COUNSELLING & COURSE ALLOTMENT'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            {lang === 'or' ? 'ଛାତ୍ର ବିଷୟ କାଉନସେଲିଂ ଓ ପାଠ୍ୟକ୍ରମ ବଣ୍ଟନ' : 'Student Subject Counselling & Course Allotment'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {lang === 'or'
              ? 'ଅଧିବେଶନ-ୱାର୍ଜ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ନିୟମିତ ଅନର୍ସ (Major, Minor 1, Minor 2, MDC, SEC, AEC, VAC) ଏବଂ AEDP ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମର ବିଷୟ ବଣ୍ଟନ।'
              : 'Year-wise student subject counselling records. Regular Honours include Major, Minor 1/2, MDC 1-3, SEC 1-3, AEC, VAC 1-2. AEDP courses include Major 1/2, MDC 1-2, AEC 1-2, SEC 1-2, VAC 1-2.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
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
              onClick={() => setViewMode('subject_details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                viewMode === 'subject_details' ? 'bg-purple-500 text-slate-950 shadow' : 'text-purple-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Access Minor, MDC, AEC, VAC, SEC Details
            </button>
          </div>

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
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                  selectedSession === ay.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {ay.label}
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

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            disabled={role === 'HOD'}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-60 font-mono"
          >
            {role === 'HOD' ? (
              <option value={hodDeptName || ''}>Department: {hodDeptName} & Specializations</option>
            ) : (
              <>
                <option value="ALL">{lang === 'or' ? 'ସମସ୍ତ ବିଭାଗ (Dept: ALL)' : 'Department: All Departments'}</option>
                {Array.from(new Set(seatMatrix.map((m) => m.deptName))).map((deptName) => (
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
            Showing <strong>{activeStudentList.length}</strong> records
          </span>
        </div>
      </div>

      {/* Subject Details View vs Excel Matrix View vs Table View */}
      {viewMode === 'subject_details' ? (
        <div className="space-y-6">
          {/* Interactive Subject Roster Table by Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-xs font-mono font-bold mr-1">Select Category:</span>
                {[
                  { id: 'MINOR', label: 'Minor Subjects' },
                  { id: 'MDC', label: 'MDC (Multidisciplinary)' },
                  { id: 'AEC', label: 'AEC (Ability Enhancement)' },
                  { id: 'VAC', label: 'VAC (Value Added)' },
                  { id: 'SEC', label: 'SEC (Skill Enhancement)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                      activeCategoryTab === tab.id
                        ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleDownloadCategoryExcel(activeCategoryTab)}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center shadow transition"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download {activeCategoryTab} Excel
              </button>
            </div>

            {/* Summary KPI stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total Allocations:</span>
                <strong className="text-purple-300 text-sm font-bold">{categoryAllocations.length}</strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Unique Subjects:</span>
                <strong className="text-amber-300 text-sm font-bold">{uniqueSubjectsCount}</strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Course Year / Batch:</span>
                <strong className="text-emerald-300 text-sm font-bold">{selectedSession}</strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Filtered Semester:</span>
                <strong className="text-cyan-300 text-sm font-bold">{selectedSemester}</strong>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto max-h-[60vh] rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200 border-collapse font-mono">
                <thead className="bg-slate-950 text-purple-300 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Sl</th>
                    <th className="py-3 px-3">Session</th>
                    <th className="py-3 px-3">Roll & Univ Roll</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Dept & Stream</th>
                    <th className="py-3 px-3">Course Type</th>
                    <th className="py-3 px-3">Allocated Subject Name</th>
                    <th className="py-3 px-3">Semester / Module</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {categoryAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                        No subject allocations found for category <strong>{activeCategoryTab}</strong> under session {selectedSession}.
                      </td>
                    </tr>
                  ) : (
                    categoryAllocations.map((entry, idx) => (
                      <tr key={`${entry.studentId}-${entry.subjectName}-${idx}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-emerald-300 font-bold">
                          <div>{entry.academicYear}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{entry.yearLabel}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <div className="text-amber-300">{entry.rollNo}</div>
                          <div className="text-cyan-300 text-[10px]">{entry.universityRollNo}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">{entry.studentName}</td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-200 font-sans">{entry.department}</div>
                          <div className="text-purple-300 text-[10px]">{entry.stream}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{entry.courseType}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-200">{entry.subjectName}</td>
                        <td className="py-2.5 px-3">
                          <div className="text-cyan-300 font-bold">{entry.semester}</div>
                          <div className="text-slate-400 text-[10px]">{entry.semesterTag}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : viewMode === 'excel' ? (
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
                      <td colSpan={15} className="py-12 text-center text-slate-400">
                        No Regular Honours counselling records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExcelStudents.map((s, idx) => {
                      const record = getRecordForStudent(s);
                      const reg = record.regular;
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/60 transition">
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{globalIdx}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold text-amber-300">{s.rollNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-mono text-cyan-300">{s.universityRollNo || 'N/A'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{s.samsRegNo}</td>
                          <td className="py-2 px-3 border-r border-slate-800 font-sans font-bold text-white">{s.name}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-purple-300">{s.stream}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-amber-200 font-bold">{reg?.major || s.department}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300">{reg?.minor1 || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-400">{reg?.minor2 || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {reg?.sem1 ? `Minor:${reg.sem1.minor} | MDC:${reg.sem1.mdc} | AEC:${reg.sem1.aec} | VAC:${reg.sem1.vac}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {reg?.sem2 ? `Minor:${reg.sem2.minor} | MDC:${reg.sem2.mdc} | AEC:${reg.sem2.aec} | VAC:${reg.sem2.vac}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {reg?.sem3 ? `Minor:${reg.sem3.minor} | MDC:${reg.sem3.mdc} | VAC:${reg.sem3.vac}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {reg?.sem4 ? `Minor:${reg.sem4.minor} | Act:${reg.sem4.activity}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-300 text-[10px]">
                            {reg?.sem5 ? `Minor:${reg.sem5.minor} | SEC:${reg.sem5.sec} | VAC:${reg.sem5.vac}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-300 text-[10px]">
                            {reg?.sem6 ? `Minor:${reg.sem6.minor} | SEC:${reg.sem6.sec} | VAC:${reg.sem6.vac}` : '-'}
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
                      {students.length === 0 && (
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
                          <div className="font-bold text-white text-sm">{s.name}</div>
                          <div className="text-[10px] text-slate-400">Father: {s.parentName || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-purple-300">{s.stream}</div>
                          <div className="text-[10px] font-mono text-slate-400">Batch: {s.academicYear || '2026-27'}</div>
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
                              <div className="font-bold text-amber-400">Major: {record.regular.major}</div>
                              {record.regular.sem1 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem I:</span> Minor: {record.regular.sem1.minor} | MDC: {record.regular.sem1.mdc} | AEC: {record.regular.sem1.aec} | VAC: {record.regular.sem1.vac}
                                </div>
                              )}
                              {record.regular.sem2 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem II:</span> Minor: {record.regular.sem2.minor} | MDC: {record.regular.sem2.mdc} | AEC: {record.regular.sem2.aec} | VAC: {record.regular.sem2.vac}
                                </div>
                              )}
                              {record.regular.sem3 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem III:</span> Minor: {record.regular.sem3.minor} | MDC: {record.regular.sem3.mdc} | VAC: {record.regular.sem3.vac}
                                </div>
                              )}
                              {record.regular.sem4 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem IV:</span> Minor: {record.regular.sem4.minor} | Activity: {record.regular.sem4.activity}
                                </div>
                              )}
                              {record.regular.sem5 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem V:</span> Minor: {record.regular.sem5.minor} | SEC: {record.regular.sem5.sec} | VAC: {record.regular.sem5.vac}
                                </div>
                              )}
                              {record.regular.sem6 && (
                                <div className="text-slate-300">
                                  <span className="text-amber-300 font-semibold font-mono">Sem VI:</span> Minor: {record.regular.sem6.minor} | SEC: {record.regular.sem6.sec} | VAC: {record.regular.sem6.vac}
                                </div>
                              )}
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
      {totalPages > 1 && (
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 shadow-xl">
          <div>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({activeStudentList.length} total records)
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
                      <label className="block text-slate-300 font-semibold mb-1">SEC 1</label>
                      <input
                        type="text"
                        required
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
                        required
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
                        required
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

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 1</label>
                      <input
                        type="text"
                        required
                        value={editForm.regular.aec1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, aec1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AEC 2</label>
                      <input
                        type="text"
                        required
                        value={editForm.regular.aec2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, aec2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 1</label>
                      <input
                        type="text"
                        required
                        value={editForm.regular.vac1}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, vac1: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">VAC 2</label>
                      <input
                        type="text"
                        required
                        value={editForm.regular.vac2}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            regular: { ...editForm.regular!, vac2: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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
