import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SETTINGS } from '../lib/defaultData';
import { createDriveBackupSnapshot, parseSnapshotFile } from '../lib/driveService';
import {
  parseExcelOrCsvFile,
  downloadStudentTemplateExcel,
  downloadStudentTemplateCSV,
  normalizeCategory,
  ParseResult
} from '../lib/excelParser';
import { Student, FacultyMember, Notice, FAQItem, SeatMatrixItem, HodAccount, StreamType, CategoryType, StudentStatus } from '../types';
import * as XLSX from 'xlsx';
import {
  ShieldCheck,
  Radio,
  Cloud,
  Download,
  Upload,
  Database,
  Edit2,
  Lock,
  History,
  Search,
  Filter,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
  Building2,
  FileSpreadsheet,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Users,
  Bell,
  HelpCircle,
  Settings,
  AlertTriangle,
  UserPlus,
  Eye,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  Award
} from 'lucide-react';

export const AdminPortalView: React.FC<{ onOpenAdminModal: () => void }> = ({ onOpenAdminModal }) => {
  const {
    students,
    seatMatrix,
    spotCandidates,
    auditLogs,
    hodAccounts,
    systemSettings,
    notices,
    faculty,
    faqs,
    // Student Actions
    addStudent,
    updateStudent,
    deleteStudent,
    clearAllStudents,
    bulkImportStudents,
    loadSampleStudents,
    syncSamsGoogleSheet,
    correctStudentClassifications,
    // Faculty Actions
    addFaculty,
    updateFaculty,
    deleteFaculty,
    clearAllFaculty,
    loadSampleFaculty,
    // Seat Matrix Actions
    addSeatMatrixItem,
    updateSeatMatrixItem,
    deleteSeatMatrixItem,
    resetSeatMatrixToBenchmark,
    clearSeatMatrix,
    // Notices Actions
    addNotice,
    updateNotice,
    deleteNotice,
    // FAQs Actions
    addFAQ,
    updateFAQ,
    deleteFAQ,
    // HOD Accounts
    addHodAccount,
    updateHodAccount,
    deleteHodAccount,
    updateHodPassword,
    // Spot Candidates
    registerSpotCandidate,
    updateSpotCandidate,
    deleteSpotCandidate,
    clearAllSpotCandidates,
    reportSpotCandidate,
    runAutomatedMeritSelection,
    // System Settings
    updateSystemSettings,
    toggleSpotRound,
    updateCollegeLogo,
    restoreSystemFromSnapshot,
    addAuditLog
  } = useData();

  const { isAdmin, logout } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'students' | 'add-students' | 'faculty' | 'seats' | 'notices' | 'faqs' | 'hods' | 'spot' | 'settings' | 'drive' | 'audit'
  >('students');

  // ==========================================
  // STUDENT MANAGER STATE
  // ==========================================
  const [studentSearch, setStudentSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Student Add / Edit Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNo: '',
    samsRegNo: '',
    parentName: '',
    motherName: '',
    mobileNumber: '',
    dob: '2005-01-01',
    category: 'GEN' as CategoryType,
    maxMarks: 600,
    marksSecured: 480,
    marksPercentage: 84.0,
    stream: 'Science' as StreamType,
    department: 'Physics',
    phone: '9437123456',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    status: 'Admitted' as StudentStatus,
  });

  // ==========================================
  // EXCEL IMPORT STATE & PREVIEW
  // ==========================================
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ParseResult | null>(null);
  const [importReplaceMode, setImportReplaceMode] = useState(false);
  const [autoCommitImport, setAutoCommitImport] = useState(true);
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [sheetUrlInput, setSheetUrlInput] = useState(systemSettings.sheetSyncUrl || '');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Toast notification state & helper (replaces browser alerts)
  const [adminToast, setAdminToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setAdminToast({ type, message });
    setTimeout(() => {
      setAdminToast((prev) => (prev?.message === message ? null : prev));
    }, 7000);
  };

  // Pagination for Students DB Table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(50);

  // ==========================================
  // FACULTY MANAGER STATE
  // ==========================================
  const [facultySearch, setFacultySearch] = useState('');
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    deptName: 'Physics',
    designation: 'Assistant Professor',
    qualification: 'M.Sc., Ph.D.',
    email: '',
    phone: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isHod: false,
  });

  // ==========================================
  // SEAT MATRIX STATE
  // ==========================================
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [editingSeatItem, setEditingSeatItem] = useState<SeatMatrixItem | null>(null);
  const [seatForm, setSeatForm] = useState({
    deptName: '',
    stream: 'Science' as StreamType,
    isAedp: false,
    specialization: 'Regular Honours',
    sanctioned: 32,
    admitted: 0,
  });

  // ==========================================
  // NOTICES STATE
  // ==========================================
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'General' as 'General' | 'Admission' | 'Examination' | 'Departmental' | 'Spot Round',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    isImportant: false,
    content: '',
    downloadUrl: '#',
  });

  // ==========================================
  // FAQS STATE
  // ==========================================
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'Admission',
  });

  // ==========================================
  // HOD ACCOUNTS STATE
  // ==========================================
  const [isHodModalOpen, setIsHodModalOpen] = useState(false);
  const [editingHod, setEditingHod] = useState<HodAccount | null>(null);
  const [hodForm, setHodForm] = useState({
    deptName: '',
    username: '',
    password: '',
    hodName: '',
    phone: '',
    email: '',
  });

  // ==========================================
  // SETTINGS STATE
  // ==========================================
  const [settingsForm, setSettingsForm] = useState({
    collegeName: systemSettings.collegeName || '',
    collegeNameOdia: systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼',
    collegeCode: systemSettings.collegeCode || '03071302',
    tagline: systemSettings.tagline || '',
    taglineOdia: systemSettings.taglineOdia || 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ',
    naacGrade: systemSettings.naacGrade || '',
    bannerNotice: systemSettings.bannerNotice || '',
    bannerNoticeOdia: systemSettings.bannerNoticeOdia || 'ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ୨୦୨୬-୨୭: ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ସିଟ୍ ଲାଇଭ୍ ମେରିଟ୍ ତାଲିକା ନିମ୍ନରେ ପ୍ରକାଶିତ।',
    prospectusUrl: systemSettings.prospectusUrl || '',
    collegeLogoUrl: systemSettings.collegeLogoUrl || '',
    contactPhone: systemSettings.contactPhone || '06646-230234',
    contactEmail: systemSettings.contactEmail || 'principal.baragada@gmail.com',
    address: systemSettings.address || 'Panchayat College, Baragada, Odisha - 768028',
    addressOdia: systemSettings.addressOdia || 'ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼, ଓଡ଼ିଶା - ୭୬୮୦୨୮',
    // Principal
    principalName: systemSettings.principalName || 'Prof. Amarendra Panda',
    principalNameOdia: systemSettings.principalNameOdia || 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା',
    principalDesignation: systemSettings.principalDesignation || 'Principal-in-Charge | Reader in Physics',
    principalPhotoUrl: systemSettings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    principalPhone: systemSettings.principalPhone || '06646-230234',
    principalEmail: systemSettings.principalEmail || 'principal.baragada@gmail.com',
    // Admission In-Charge 1 (Arts & Commerce)
    admissionIncharge1Name: systemSettings.admissionIncharge1Name || 'Dr. Manoranjan Dash',
    admissionIncharge1NameOdia: systemSettings.admissionIncharge1NameOdia || 'ଡଃ ମନୋରଞ୍ଜନ ଦାଶ',
    admissionIncharge1Designation: systemSettings.admissionIncharge1Designation || 'Admission In-Charge (Arts & Commerce) | Sr. Lecturer in Economics',
    admissionIncharge1PhotoUrl: systemSettings.admissionIncharge1PhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    admissionIncharge1Phone: systemSettings.admissionIncharge1Phone || '+91 94371 88201',
    admissionIncharge1Email: systemSettings.admissionIncharge1Email || 'admission.arts.pcb@gmail.com',
    // Admission In-Charge 2 (Science & AEDP)
    admissionIncharge2Name: systemSettings.admissionIncharge2Name || 'Dr. Sasmita Panigrahi',
    admissionIncharge2NameOdia: systemSettings.admissionIncharge2NameOdia || 'ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ',
    admissionIncharge2Designation: systemSettings.admissionIncharge2Designation || 'Admission In-Charge (Science & AEDP) | Sr. Lecturer in Chemistry',
    admissionIncharge2PhotoUrl: systemSettings.admissionIncharge2PhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    admissionIncharge2Phone: systemSettings.admissionIncharge2Phone || '+91 94372 65430',
    admissionIncharge2Email: systemSettings.admissionIncharge2Email || 'admission.science.pcb@gmail.com',
    // Data Entry Operator (DEO)
    deoName: systemSettings.deoName || 'Sri Rajesh Kumar Meher',
    deoNameOdia: systemSettings.deoNameOdia || 'ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର',
    deoDesignation: systemSettings.deoDesignation || 'Data Entry Operator (DEO) | SAMS Helpdesk & Verification',
    deoPhotoUrl: systemSettings.deoPhotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    deoPhone: systemSettings.deoPhone || '+91 79780 45129',
    deoEmail: systemSettings.deoEmail || 'deo.sams.pcb@gmail.com',
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Keep settingsForm in sync with global systemSettings updates
  useEffect(() => {
    setSettingsForm({
      collegeName: systemSettings.collegeName || '',
      collegeNameOdia: systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼',
      collegeCode: systemSettings.collegeCode || '03071302',
      tagline: systemSettings.tagline || '',
      taglineOdia: systemSettings.taglineOdia || 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ',
      naacGrade: systemSettings.naacGrade || '',
      bannerNotice: systemSettings.bannerNotice || '',
      bannerNoticeOdia: systemSettings.bannerNoticeOdia || 'ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ୨୦୨୬-୨୭: ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ସିଟ୍ ଲାଇଭ୍ ମେରିଟ୍ ତାଲିକା ନିମ୍ନରେ ପ୍ରକାଶିତ।',
      prospectusUrl: systemSettings.prospectusUrl || '',
      collegeLogoUrl: systemSettings.collegeLogoUrl || '',
      contactPhone: systemSettings.contactPhone || '06646-230234',
      contactEmail: systemSettings.contactEmail || 'principal.baragada@gmail.com',
      address: systemSettings.address || 'Panchayat College, Baragada, Odisha - 768028',
      addressOdia: systemSettings.addressOdia || 'ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼, ଓଡ଼ିଶା - ୭୬୮୦୨୮',
      principalName: systemSettings.principalName || 'Prof. Amarendra Panda',
      principalNameOdia: systemSettings.principalNameOdia || 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା',
      principalDesignation: systemSettings.principalDesignation || 'Principal-in-Charge | Reader in Physics',
      principalPhotoUrl: systemSettings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      principalPhone: systemSettings.principalPhone || '06646-230234',
      principalEmail: systemSettings.principalEmail || 'principal.baragada@gmail.com',
      admissionIncharge1Name: systemSettings.admissionIncharge1Name || 'Dr. Manoranjan Dash',
      admissionIncharge1NameOdia: systemSettings.admissionIncharge1NameOdia || 'ଡଃ ମନୋରଞ୍ଜନ ଦାଶ',
      admissionIncharge1Designation: systemSettings.admissionIncharge1Designation || 'Admission In-Charge (Arts & Commerce) | Sr. Lecturer in Economics',
      admissionIncharge1PhotoUrl: systemSettings.admissionIncharge1PhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      admissionIncharge1Phone: systemSettings.admissionIncharge1Phone || '+91 94371 88201',
      admissionIncharge1Email: systemSettings.admissionIncharge1Email || 'admission.arts.pcb@gmail.com',
      admissionIncharge2Name: systemSettings.admissionIncharge2Name || 'Dr. Sasmita Panigrahi',
      admissionIncharge2NameOdia: systemSettings.admissionIncharge2NameOdia || 'ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ',
      admissionIncharge2Designation: systemSettings.admissionIncharge2Designation || 'Admission In-Charge (Science & AEDP) | Sr. Lecturer in Chemistry',
      admissionIncharge2PhotoUrl: systemSettings.admissionIncharge2PhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      admissionIncharge2Phone: systemSettings.admissionIncharge2Phone || '+91 94372 65430',
      admissionIncharge2Email: systemSettings.admissionIncharge2Email || 'admission.science.pcb@gmail.com',
      deoName: systemSettings.deoName || 'Sri Rajesh Kumar Meher',
      deoNameOdia: systemSettings.deoNameOdia || 'ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର',
      deoDesignation: systemSettings.deoDesignation || 'Data Entry Operator (DEO) | SAMS Helpdesk & Verification',
      deoPhotoUrl: systemSettings.deoPhotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      deoPhone: systemSettings.deoPhone || '+91 79780 45129',
      deoEmail: systemSettings.deoEmail || 'deo.sams.pcb@gmail.com',
    });
  }, [systemSettings]);

  // ==========================================
  // CLOUD BACKUP STATE
  // ==========================================
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">
          Super Admin Restricted Access
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Super Admin authentication required to access student database manager, excel import, faculty directory, seat matrix editor, and college settings.
        </p>
        <button
          onClick={onOpenAdminModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg"
        >
          Super Admin Login
        </button>
      </div>
    );
  }

  // Helper function to resolve effective stream from student stream or department
  const getEffectiveStream = (s: Student): StreamType => {
    if (s.stream === 'Arts') return 'Arts';
    if (s.stream === 'Biological Science') return 'Biological Science';
    if (s.stream === 'Commerce') return 'Commerce';
    if (s.stream === 'Physical Science') return 'Physical Science';
    if (s.stream === 'Self Financing') return 'Self Financing';

    const st = (s.stream || '').toLowerCase().trim();
    const dept = (s.department || '').toLowerCase().trim();

    if (st.includes('bio') || st.includes('botan') || st.includes('zool')) return 'Biological Science';
    if (st.includes('phys') || st.includes('chem') || st.includes('math') || st.includes('stat')) return 'Physical Science';
    if (st.includes('self') || st.includes('computer') || st === 'cs' || st === 'csa' || st === 'it' || st.includes('information tech')) return 'Self Financing';
    if (st.includes('comm') || st.includes('b.com') || st.includes('bcom')) return 'Commerce';
    if (st.includes('art') || st.includes('b.a') || st.includes('ba')) return 'Arts';

    if (dept.includes('computer') || dept === 'cs' || dept === 'csa' || dept === 'it' || dept.includes('information tech') || dept.includes('self financ')) return 'Self Financing';
    if (dept.includes('botan') || dept.includes('zool') || dept.includes('bio') || dept.includes('tissue') || dept.includes('integrative')) return 'Biological Science';
    if (dept.includes('phys') || dept.includes('chem') || dept.includes('math') || dept.includes('stat') || dept.includes('industr') || dept.includes('computing')) return 'Physical Science';
    if (dept.includes('comm') || dept.includes('bank') || dept.includes('bfsi')) return 'Commerce';

    return 'Arts';
  };

  // Filtered Students (Crash-proof with case-insensitive and deep multi-field matching)
  const filteredStudents = students.filter((s) => {
    const q = (studentSearch || '').trim().toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(q);
    const rollMatch = (s.rollNo || '').toLowerCase().includes(q);
    const samsMatch = (s.samsRegNo || '').toLowerCase().includes(q);
    const parentMatch = (s.parentName || '').toLowerCase().includes(q);
    const motherMatch = (s.motherName || '').toLowerCase().includes(q);
    const mobileMatch = (s.mobileNumber || s.phone || '').toLowerCase().includes(q);
    const deptMatch = (s.department || '').toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || rollMatch || samsMatch || parentMatch || motherMatch || mobileMatch || deptMatch;

    const effStream = getEffectiveStream(s);
    const fStream = streamFilter.toLowerCase();
    const matchesStream =
      streamFilter === 'ALL' ||
      effStream.toLowerCase() === fStream ||
      (fStream === 'science' && (effStream === 'Physical Science' || effStream === 'Biological Science'));

    const normCat = normalizeCategory(s.category);
    const matchesCat = categoryFilter === 'ALL' || normCat.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesStream && matchesCat;
  });

  // Filtered Faculty
  const filteredFaculty = faculty.filter((f) => {
    const q = (facultySearch || '').trim().toLowerCase();
    return (
      !q ||
      (f.name || '').toLowerCase().includes(q) ||
      (f.deptName || '').toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q)
    );
  });

  // ==========================================
  // EXCEL / CSV FILE IMPORT HANDLER
  // ==========================================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsImporting(true);
    setImportStatusMessage('');

    try {
      const res = await parseExcelOrCsvFile(file);
      setIsImporting(false);
      setImportResult(res);

      if (res.success && res.students.length > 0) {
        // Direct commit to database so students are reflected in DB immediately!
        bulkImportStudents(res.students, importReplaceMode);
        showToast(
          'success',
          `Successfully imported and reflected ${res.students.length} student records into SAMS Database from "${file.name}"!`
        );
        setImportStatusMessage(`Imported ${res.students.length} student records into SAMS Database.`);
        setImportResult(null);

        // Reset all search and stream filters so imported students are immediately visible in the table
        setStudentSearch('');
        setStreamFilter('ALL');
        setCategoryFilter('ALL');
        setActiveAdminTab('students');
        setCurrentPage(1);
      } else {
        const errMsg = res.message || 'Could not parse student records from file.';
        setImportStatusMessage(`Import error: ${errMsg}`);
        showToast('error', errMsg);
      }
    } catch (err: any) {
      setIsImporting(false);
      const errMsg = err?.message || 'Error parsing spreadsheet file.';
      setImportStatusMessage(`Import error: ${errMsg}`);
      showToast('error', errMsg);
    }

    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importResult || !importResult.students.length) return;

    bulkImportStudents(importResult.students, importReplaceMode);
    showToast(
      'success',
      `Successfully ${importReplaceMode ? 'replaced database with' : 'added'} ${importResult.students.length} student records into SAMS Database!`
    );
    setImportResult(null);
    setImportStatusMessage('');
    setStudentSearch('');
    setStreamFilter('ALL');
    setCategoryFilter('ALL');
    setActiveAdminTab('students');
    setCurrentPage(1);
  };

  // Export Students to Excel
  const handleExportStudentsExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
    if (dataToExport.length === 0) {
      showToast('info', 'No student records to export.');
      return;
    }

    const wsData = dataToExport.map((s) => ({
      'University Roll No': s.rollNo,
      'SAMS Reg No': s.samsRegNo,
      'Student Name': s.name,
      'Father Name': s.parentName || '',
      'Mother Name': s.motherName || '',
      'Mobile Number': s.mobileNumber || s.phone || '',
      'Category': s.category,
      'Date of Birth': s.dob || '',
      'Maximum Marks': s.maxMarks || 600,
      'Marks Secured': s.marksSecured || 0,
      'Percentage (%)': s.marksPercentage,
      'Department': s.department,
      'Stream': s.stream,
      'Gender': s.gender,
      'Blood Group': s.bloodGroup,
      'Status': s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SAMS Students');
    XLSX.writeFile(wb, `SAMS_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ==========================================
  // STUDENT MODAL HANDLERS
  // ==========================================
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      rollNo: `BS24-${String(students.length + 1).padStart(3, '0')}`,
      samsRegNo: `24D${15000 + students.length + 1}`,
      parentName: '',
      motherName: '',
      mobileNumber: '9437123456',
      dob: '2005-01-01',
      category: 'GEN',
      maxMarks: 600,
      marksSecured: 480,
      marksPercentage: 80.0,
      stream: 'Science',
      department: 'Physics',
      phone: '9437123456',
      gender: 'Male',
      bloodGroup: 'O+',
      status: 'Admitted',
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentForm({
      name: s.name,
      rollNo: s.rollNo,
      samsRegNo: s.samsRegNo,
      parentName: s.parentName || '',
      motherName: s.motherName || '',
      mobileNumber: s.mobileNumber || s.phone || '',
      dob: s.dob || '2005-01-01',
      category: s.category,
      maxMarks: s.maxMarks || 600,
      marksSecured: s.marksSecured || 400,
      marksPercentage: s.marksPercentage,
      stream: s.stream,
      department: s.department,
      phone: s.phone || '9437123456',
      gender: s.gender,
      bloodGroup: s.bloodGroup || 'O+',
      status: s.status,
    });
    setIsStudentModalOpen(true);
  };

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    const pct = studentForm.maxMarks > 0
      ? parseFloat(((studentForm.marksSecured / studentForm.maxMarks) * 100).toFixed(1))
      : studentForm.marksPercentage;

    const payload = {
      ...studentForm,
      marksPercentage: pct,
      isAedp: studentForm.department.toLowerCase().includes('aedp'),
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, payload);
    } else {
      addStudent(payload);
    }

    setIsStudentModalOpen(false);
  };

  // ==========================================
  // FACULTY MODAL HANDLERS
  // ==========================================
  const handleOpenAddFaculty = () => {
    setEditingFaculty(null);
    setFacultyForm({
      name: '',
      deptName: 'Physics',
      designation: 'Assistant Professor',
      qualification: 'Ph.D., M.Sc.',
      email: '',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHod: false,
    });
    setIsFacultyModalOpen(true);
  };

  const handleOpenEditFaculty = (f: FacultyMember) => {
    setEditingFaculty(f);
    setFacultyForm({
      name: f.name,
      deptName: f.deptName,
      designation: f.designation,
      qualification: f.qualification,
      email: f.email,
      phone: f.phone,
      photoUrl: f.photoUrl,
      isHod: f.isHod,
    });
    setIsFacultyModalOpen(true);
  };

  const handleFacultyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) return;

    const payload = {
      name: facultyForm.name.trim(),
      deptId: facultyForm.deptName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      deptName: facultyForm.deptName.trim(),
      designation: facultyForm.designation.trim(),
      qualification: facultyForm.qualification.trim(),
      email: facultyForm.email.trim() || `${facultyForm.name.toLowerCase().replace(/\s+/g, '.')}@baragada.edu.in`,
      phone: facultyForm.phone.trim() || '9437123456',
      photoUrl: facultyForm.photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHod: facultyForm.isHod,
    };

    if (editingFaculty) {
      updateFaculty(editingFaculty.id, payload);
    } else {
      addFaculty(payload);
    }

    setIsFacultyModalOpen(false);
  };

  // ==========================================
  // SEAT MATRIX MODAL HANDLERS
  // ==========================================
  const handleOpenAddSeat = () => {
    setEditingSeatItem(null);
    setSeatForm({
      deptName: '',
      stream: 'Science',
      isAedp: false,
      specialization: 'Regular Honours',
      sanctioned: 32,
      admitted: 0,
    });
    setIsSeatModalOpen(true);
  };

  const handleOpenEditSeat = (s: SeatMatrixItem) => {
    setEditingSeatItem(s);
    setSeatForm({
      deptName: s.deptName,
      stream: s.stream,
      isAedp: s.isAedp,
      specialization: s.specialization || 'Regular Honours',
      sanctioned: s.sanctioned,
      admitted: s.admitted,
    });
    setIsSeatModalOpen(true);
  };

  const handleSeatFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatForm.deptName.trim()) return;

    if (editingSeatItem) {
      updateSeatMatrixItem(
        editingSeatItem.id,
        seatForm.sanctioned,
        seatForm.admitted,
        seatForm.deptName,
        seatForm.stream
      );
    } else {
      addSeatMatrixItem({
        deptName: seatForm.deptName,
        stream: seatForm.stream,
        isAedp: seatForm.isAedp,
        specialization: seatForm.specialization,
        sanctioned: seatForm.sanctioned,
        admitted: seatForm.admitted,
        vacant: Math.max(0, seatForm.sanctioned - seatForm.admitted),
      });
    }

    setIsSeatModalOpen(false);
  };

  // ==========================================
  // NOTICES MODAL HANDLERS
  // ==========================================
  const handleOpenAddNotice = () => {
    setEditingNotice(null);
    setNoticeForm({
      title: '',
      category: 'General',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isImportant: false,
      content: '',
      downloadUrl: '#',
    });
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (n: Notice) => {
    setEditingNotice(n);
    setNoticeForm({
      title: n.title,
      category: n.category,
      date: n.date,
      isImportant: n.isImportant,
      content: n.content || '',
      downloadUrl: n.downloadUrl || '#',
    });
    setIsNoticeModalOpen(true);
  };

  const handleNoticeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;

    if (editingNotice) {
      updateNotice(editingNotice.id, noticeForm);
    } else {
      addNotice(noticeForm);
    }
    setIsNoticeModalOpen(false);
  };

  // ==========================================
  // FAQS MODAL HANDLERS
  // ==========================================
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({
      question: '',
      answer: '',
      category: 'Admission',
    });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (f: FAQItem) => {
    setEditingFaq(f);
    setFaqForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
    });
    setIsFaqModalOpen(true);
  };

  const handleFaqFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;

    if (editingFaq) {
      updateFAQ(editingFaq.id, faqForm.question, faqForm.answer, faqForm.category);
    } else {
      addFAQ(faqForm.question, faqForm.answer, faqForm.category);
    }
    setIsFaqModalOpen(false);
  };

  // ==========================================
  // HOD MODAL HANDLERS
  // ==========================================
  const handleOpenAddHod = () => {
    setEditingHod(null);
    setHodForm({
      deptName: '',
      username: '',
      password: '',
      hodName: '',
      phone: '',
      email: '',
    });
    setIsHodModalOpen(true);
  };

  const handleOpenEditHod = (h: HodAccount) => {
    setEditingHod(h);
    setHodForm({
      deptName: h.deptName,
      username: h.username,
      password: h.password,
      hodName: h.hodName,
      phone: h.phone,
      email: h.email,
    });
    setIsHodModalOpen(true);
  };

  const handleHodFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hodForm.deptName.trim() || !hodForm.username.trim() || !hodForm.password.trim()) return;

    if (editingHod) {
      updateHodAccount(editingHod.id, hodForm);
    } else {
      addHodAccount(hodForm);
    }
    setIsHodModalOpen(false);
  };

  // ==========================================
  // SETTINGS HANDLER
  // ==========================================
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settingsForm);
    setSettingsSavedMsg('College details and system configuration saved successfully! Changes are live across the portal.');
    setTimeout(() => setSettingsSavedMsg(''), 4000);
  };

  const handleResetSettings = () => {
    updateSystemSettings(DEFAULT_SETTINGS);
    setSettingsSavedMsg('Restored official default college settings and branding!');
    setTimeout(() => setSettingsSavedMsg(''), 4000);
  };

  // Google Sheet live sync
  const handleGoogleSheetSync = async () => {
    setIsSyncingSheet(true);
    setSyncMessage('');
    const syncedCount = await syncSamsGoogleSheet(sheetUrlInput);
    setIsSyncingSheet(false);
    setSyncMessage(`Successfully synced ${syncedCount} records from live SAMS Google Sheet!`);
  };

  // Google Drive cloud backup
  const handleTriggerDriveBackup = async () => {
    setIsCreatingBackup(true);
    setBackupStatusMsg('');

    const snapshot = {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      college: systemSettings.collegeName,
      data: {
        students,
        seatMatrix,
        spotCandidates,
        auditLogs,
        hodAccounts,
        systemSettings,
        notices,
        faculty,
        faqs,
      },
    };

    const res = await createDriveBackupSnapshot(snapshot);
    setIsCreatingBackup(false);
    setBackupStatusMsg(res.message);
    addAuditLog('CLOUD_BACKUP', 'Generated system snapshot backup to Google Drive.');
  };

  const handleRestoreSnapshotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const parsed = parseSnapshotFile(content);
      if (parsed) {
        restoreSystemFromSnapshot(parsed);
        showToast('success', 'System successfully restored from snapshot backup!');
      } else {
        showToast('error', 'Invalid snapshot file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Title Header */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SUPER ADMIN CONTROL CENTER &bull; SAMS GOVT. OF ODISHA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            SAMS e-Admission & Administration Master Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong>Super Administrator</strong> &bull; SAMS Code: <strong>{systemSettings.collegeCode || '03071302'}</strong> &bull; {systemSettings.collegeName}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center shadow shrink-0"
        >
          Exit Admin Session
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'students', label: `Students DB (${students.length})`, icon: Database },
          { id: 'add-students', label: 'Import Excel / CSV', icon: FileSpreadsheet },
          { id: 'faculty', label: `Faculty (${faculty.length})`, icon: Users },
          { id: 'seats', label: `Seat Matrix (${seatMatrix.length})`, icon: Edit2 },
          { id: 'notices', label: `Notices (${notices.length})`, icon: Bell },
          { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
          { id: 'hods', label: `HOD Accounts (${hodAccounts.length})`, icon: Lock },
          { id: 'spot', label: `Spot Round Desk (${spotCandidates.length})`, icon: Radio },
          { id: 'settings', label: 'College Settings', icon: Settings },
          { id: 'drive', label: 'Cloud Backup', icon: Cloud },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Global Admin Toast Notification Banner */}
      {adminToast && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-xl transition-all ${
            adminToast.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/50'
              : adminToast.type === 'error'
              ? 'bg-red-500/15 text-red-200 border-red-500/50'
              : 'bg-amber-500/15 text-amber-200 border-amber-500/50'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {adminToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : adminToast.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{adminToast.message}</span>
          </div>
          <button
            onClick={() => setAdminToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: STUDENT DATABASE RECORDS (FULL CRUD & ACTIONS)     */}
      {/* ========================================================= */}
      {activeAdminTab === 'students' && (() => {
        const totalFiltered = filteredStudents.length;
        const effectivePageSize = pageSize === 'ALL' ? totalFiltered || 1 : pageSize;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePageSize));
        const safePage = Math.min(Math.max(1, currentPage), totalPages);
        const pagedStudents = pageSize === 'ALL'
          ? filteredStudents
          : filteredStudents.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

        const artsCount = students.filter((s) => getEffectiveStream(s) === 'Arts').length;
        const bioCount = students.filter((s) => getEffectiveStream(s) === 'Biological Science').length;
        const commCount = students.filter((s) => getEffectiveStream(s) === 'Commerce').length;
        const phyCount = students.filter((s) => getEffectiveStream(s) === 'Physical Science').length;
        const sfCount = students.filter((s) => getEffectiveStream(s) === 'Self Financing').length;

        const genCount = students.filter((s) => normalizeCategory(s.category) === 'GEN').length;
        const scCount = students.filter((s) => normalizeCategory(s.category) === 'SC').length;
        const stCount = students.filter((s) => normalizeCategory(s.category) === 'ST').length;
        const sebcCount = students.filter((s) => normalizeCategory(s.category) === 'SEBC').length;

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-serif flex items-center">
                  <Database className="w-5 h-5 mr-2 text-amber-400" />
                  SAMS Student Database Records ({students.length} Total in DB)
                </h2>
                <p className="text-xs text-slate-400">
                  Institutional student roster for Panchayat College Baragada. First column displays University Roll & SAMS Reg. No.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenAddStudent}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                </button>

                <label className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center shadow cursor-pointer transition">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  {isImporting ? 'Importing Sheet...' : 'Quick Import Excel / CSV'}
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv, .tsv"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>

                <button
                  onClick={handleExportStudentsExcel}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Export Excel
                </button>

                {students.length > 0 && (
                  <button
                    onClick={() => {
                      const count = correctStudentClassifications();
                      if (count > 0) {
                        showToast('success', `Checked & corrected ${count} student stream & subject classifications with Subjects & Seats!`);
                      } else {
                        showToast('info', 'All student records in database are already 100% synchronized with Subjects & Seats.');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center shadow transition"
                    title="Synchronize student stream and subject classifications with official Subjects & Seats matrix"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Correct Stream & Subject Classifications
                  </button>
                )}

                {students.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all student records?')) {
                        clearAllStudents();
                        showToast('info', 'All student database records cleared.');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All Students
                  </button>
                )}

                {students.length === 0 && (
                  <button
                    onClick={() => {
                      loadSampleStudents();
                      showToast('success', 'Loaded sample student roster.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Load Sample Students
                  </button>
                )}
              </div>
            </div>

            {/* Stream & Category Roster Breakdown Bar */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-amber-400 font-mono text-[11px] font-bold mr-1">Stream Breakdown:</span>
                <button
                  onClick={() => { setStreamFilter('ALL'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'ALL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  All Streams ({students.length})
                </button>
                <button
                  onClick={() => { setStreamFilter('Arts'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'Arts'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Arts ({artsCount})
                </button>
                <button
                  onClick={() => { setStreamFilter('Biological Science'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'Biological Science'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Biological Science ({bioCount})
                </button>
                <button
                  onClick={() => { setStreamFilter('Commerce'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'Commerce'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Commerce ({commCount})
                </button>
                <button
                  onClick={() => { setStreamFilter('Physical Science'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'Physical Science'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Physical Science ({phyCount})
                </button>
                <button
                  onClick={() => { setStreamFilter('Self Financing'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    streamFilter === 'Self Financing'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Self Financing ({sfCount})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] font-semibold mr-1">Category Breakdown:</span>
                <button
                  onClick={() => { setCategoryFilter('ALL'); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    categoryFilter === 'ALL'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  All Categories ({students.length})
                </button>
                <button
                  onClick={() => { setCategoryFilter('GEN'); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    categoryFilter === 'GEN'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  GEN ({genCount})
                </button>
                <button
                  onClick={() => { setCategoryFilter('SC'); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    categoryFilter === 'SC'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  SC ({scCount})
                </button>
                <button
                  onClick={() => { setCategoryFilter('ST'); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    categoryFilter === 'ST'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ST ({stCount})
                </button>
                <button
                  onClick={() => { setCategoryFilter('SEBC'); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    categoryFilter === 'SEBC'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  SEBC ({sebcCount})
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, roll, barcode, parent, dept..."
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={streamFilter}
                onChange={(e) => { setStreamFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Streams</option>
                <option value="Arts">Arts</option>
                <option value="Biological Science">Biological Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Physical Science">Physical Science</option>
                <option value="Self Financing">Self Financing</option>
                <option value="Science">All Science (Physical + Biological)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Categories</option>
                <option value="GEN">GEN</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="SEBC">SEBC</option>
              </select>

              <span className="text-slate-400 font-mono text-[11px] ml-auto">
                Showing <strong>{pagedStudents.length}</strong> of <strong>{totalFiltered}</strong> matching (<strong>{students.length}</strong> total)
              </span>
            </div>

            {/* Students Table */}
            {students.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
                <Database className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-white text-base">Students Database is Currently Clean</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No student records loaded. Upload your college Excel/CSV sheet or add records manually.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={handleOpenAddStudent}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Student
                  </button>
                  <button
                    onClick={() => setActiveAdminTab('add-students')}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" /> Upload Excel Sheet
                  </button>
                </div>
              </div>
            ) : totalFiltered === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <p className="text-slate-300 text-xs">No records matched your search query or filter.</p>
                <button
                  onClick={() => { setStudentSearch(''); setStreamFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">University Roll / SAMS</th>
                        <th className="py-3 px-3">Student Name</th>
                        <th className="py-3 px-3">Father Name</th>
                        <th className="py-3 px-3">Mother Name</th>
                        <th className="py-3 px-3">Mobile No</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">DOB</th>
                        <th className="py-3 px-3">Department</th>
                        <th className="py-3 px-3 text-center">Percentage (%)</th>
                        <th className="py-3 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {pagedStudents.map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                            <span className="text-amber-300 font-bold block">{stu.rollNo}</span>
                            <span className="text-slate-500 block text-[10px]">{stu.samsRegNo}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{stu.name}</td>
                          <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.parentName || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.motherName || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 whitespace-nowrap">{stu.mobileNumber || stu.phone || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{stu.category}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{stu.dob || 'N/A'}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-slate-200">{stu.department}</span>
                            <span className="text-[10px] text-slate-500 block">{stu.stream}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-amber-400 text-sm">{stu.marksPercentage}%</td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditStudent(stu)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition"
                                title="Edit Student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete student ${stu.name} (${stu.rollNo || stu.samsRegNo})?`)) {
                                    deleteStudent(stu.id);
                                    showToast('success', `Removed ${stu.name} from database.`);
                                  }
                                }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400 text-xs transition"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                    <span>Rows per page:</span>
                    <select
                      value={String(pageSize)}
                      onChange={(e) => {
                        const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                        setPageSize(val as any);
                        setCurrentPage(1);
                      }}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    >
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="250">250</option>
                      <option value="ALL">All ({totalFiltered})</option>
                    </select>
                    <span>
                      Page {safePage} of {totalPages} ({totalFiltered} total matching)
                    </span>
                  </div>

                  {pageSize !== 'ALL' && totalPages > 1 && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 flex items-center font-bold"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
                      </button>
                      <span className="px-3 py-1 font-mono text-amber-400 font-bold bg-slate-950 border border-slate-800 rounded">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 flex items-center font-bold"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 2: IMPORT STUDENTS EXCEL / CSV (FIXED & ENHANCED)    */}
      {/* ========================================================= */}
      {activeAdminTab === 'add-students' && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-amber-400" />
                Enhanced Excel & CSV Student Importer
              </h2>
              <p className="text-xs text-slate-400">
                Upload any college Excel (.xlsx, .xls) or CSV sheet. Features smart header discovery (handles titles in row 1-3), date normalization, and preview before saving.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadStudentTemplateExcel}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center shadow"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Excel Template
              </button>
              <button
                onClick={downloadStudentTemplateCSV}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center shadow"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download CSV Template
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Upload className="w-4 h-4 mr-2 text-emerald-400" /> Select Spreadsheet File
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Supports standard SAMS Odisha admission lists, College office sheets, and custom formats. Columns like <strong className="text-amber-400">Student Name</strong>, <strong className="text-amber-400">Barcode</strong>, <strong className="text-amber-400">Father/Mother Name</strong>, <strong className="text-amber-400">Category</strong>, <strong className="text-amber-400">DOB</strong>, <strong className="text-amber-400">Marks</strong>, and <strong className="text-amber-400">Department</strong> are mapped automatically.
              </p>

              <label className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow-lg flex items-center justify-center cursor-pointer transition">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                {isImporting ? 'Reading & Parsing Spreadsheet...' : 'Browse & Select Excel / CSV File'}
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>

              {uploadedFileName && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="truncate">Selected File: <strong>{uploadedFileName}</strong></span>
                  {importResult?.success && (
                    <span className="text-emerald-400 font-bold flex items-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {importResult.students.length} Records Parsed
                    </span>
                  )}
                </div>
              )}

              {importResult?.success && importResult.students.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={handleConfirmImport}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center transition"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Commit & Save {importResult.students.length} Records into SAMS Database Now &rarr;
                  </button>
                </div>
              )}

              {importStatusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    importResult?.success
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-300 border border-red-500/30'
                  }`}
                >
                  {importStatusMessage}
                </div>
              )}
            </div>

            {/* Import Mode & Specifications */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-300">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">
                Import Settings & Workflow
              </h3>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block mb-1">Import Destination Mode:</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={!importReplaceMode}
                      onChange={() => setImportReplaceMode(false)}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-300">Append to Existing Records</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importReplaceMode}
                      onChange={() => setImportReplaceMode(true)}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="text-red-400 font-semibold">Replace Entire Database</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCommitCheck"
                    checked={autoCommitImport}
                    onChange={(e) => setAutoCommitImport(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="autoCommitCheck" className="text-xs text-amber-300 font-semibold cursor-pointer">
                    Direct Auto-Import into Student DB immediately upon selecting file
                  </label>
                </div>
              </div>

              <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px]">
                <li><strong>Header Rows:</strong> Automatically detects headers on row 1, 2, 3 or below even if title rows exist.</li>
                <li><strong>Dates:</strong> Converts Excel serial numbers, DD/MM/YYYY, and YYYY-MM-DD reliably.</li>
                <li><strong>Aliases:</strong> Understands "Student Name", "Applicant Name", "Candidate Name", "Name".</li>
                <li><strong>Streams:</strong> Automatically assigns Science/Arts/Commerce based on Honours department if missing.</li>
              </ul>
            </div>
          </div>

          {/* PREVIEW MODAL / TABLE IF PARSED SUCCESSFULLY */}
          {importResult && importResult.success && importResult.students.length > 0 && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-amber-400" />
                    Preview Data ({importResult.students.length} Records Extracted)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review sample extracted columns below. Click "Confirm & Import Records" to commit to the database.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setImportResult(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Import {importResult.students.length} Records
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Roll / SAMS</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Mother Name</th>
                      <th className="py-2.5 px-3">Mobile No</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">DOB</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Stream</th>
                      <th className="py-2.5 px-3 text-center">Marks</th>
                      <th className="py-2.5 px-3 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {importResult.students.slice(0, 10).map((stu, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                          <span className="text-amber-300 font-bold block">{stu.rollNo}</span>
                          <span className="text-slate-500 block text-[10px]">{stu.samsRegNo}</span>
                        </td>
                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap">{stu.name}</td>
                        <td className="py-2 px-3 text-slate-300 whitespace-nowrap">{stu.motherName || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono text-emerald-400 whitespace-nowrap">{stu.mobileNumber || stu.phone || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{stu.category}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{stu.dob}</td>
                        <td className="py-2 px-3">{stu.department}</td>
                        <td className="py-2 px-3">{stu.stream}</td>
                        <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                          <span className="text-emerald-400 font-semibold">{stu.marksSecured}</span> / {stu.maxMarks}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-amber-400">{stu.marksPercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importResult.students.length > 10 && (
                <p className="text-[11px] text-slate-500 font-mono text-right">
                  ...and {importResult.students.length - 10} more rows
                </p>
              )}
            </div>
          )}

          {/* SAMS Live Google Sheet Sync Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-400 font-mono">Live Google Sheet Sync URL</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Last Sync: {systemSettings.lastSheetSync ? new Date(systemSettings.lastSheetSync).toLocaleString('en-IN') : 'Never'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleGoogleSheetSync}
                disabled={isSyncingSheet}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center shrink-0 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                {isSyncingSheet ? 'Syncing...' : 'Sync Sheet'}
              </button>
            </div>

            {syncMessage && <p className="text-xs text-emerald-400 font-medium">{syncMessage}</p>}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FACULTY DIRECTORY MANAGER                         */}
      {/* ========================================================= */}
      {activeAdminTab === 'faculty' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-400" />
                Academic Faculty Directory Manager ({faculty.length} Members)
              </h2>
              <p className="text-xs text-slate-400">
                Add, edit, or remove teaching professors, readers, and Department Heads (HODs).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOpenAddFaculty}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Faculty Member
              </button>

              {faculty.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear ALL faculty records?')) {
                      clearAllFaculty();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All Faculty
                </button>
              )}

              {faculty.length === 0 && (
                <button
                  onClick={loadSampleFaculty}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Load Benchmark Faculty
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty name, department..."
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {faculty.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">Faculty Directory is Clean</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faculty data has been cleared. Administrators can add teaching faculty members using the button below.
              </p>
              <button
                onClick={handleOpenAddFaculty}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Faculty Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFaculty.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 hover:border-amber-500/30 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border border-amber-500/40"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{member.name}</h4>
                        <p className="text-amber-400 text-xs">{member.designation}</p>
                        <p className="text-slate-400 text-[11px]">Dept of {member.deptName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditFaculty(member)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                        title="Edit Faculty"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete faculty record for ${member.name}?`)) {
                            deleteFaculty(member.id);
                            showToast('success', `Deleted faculty record for ${member.name}.`);
                          }
                        }}
                        className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-1 text-slate-400 text-[11px]">
                    <p className="text-slate-300">{member.qualification}</p>
                    <p className="truncate">Email: {member.email}</p>
                    <p>Phone: +91 {member.phone}</p>
                    {member.isHod && (
                      <span className="inline-block mt-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                        HOD Head
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SEAT MATRIX EDITOR (ADD / EDIT / DELETE)           */}
      {/* ========================================================= */}
      {activeAdminTab === 'seats' && (() => {
        const streamCounts = {
          Arts: { sanctioned: 0, admitted: 0, vacant: 0, depts: 0 },
          'Biological Science': { sanctioned: 0, admitted: 0, vacant: 0, depts: 0 },
          Commerce: { sanctioned: 0, admitted: 0, vacant: 0, depts: 0 },
          'Physical Science': { sanctioned: 0, admitted: 0, vacant: 0, depts: 0 },
          'Self Financing': { sanctioned: 0, admitted: 0, vacant: 0, depts: 0 },
        };

        seatMatrix.forEach((item) => {
          const st = item.stream || 'Arts';
          if (streamCounts[st as keyof typeof streamCounts]) {
            streamCounts[st as keyof typeof streamCounts].sanctioned += item.sanctioned;
            streamCounts[st as keyof typeof streamCounts].admitted += item.admitted;
            streamCounts[st as keyof typeof streamCounts].vacant += item.vacant;
            streamCounts[st as keyof typeof streamCounts].depts += 1;
          }
        });

        const totalSanctionedAll = seatMatrix.reduce((a, b) => a + b.sanctioned, 0);
        const totalAdmittedAll = seatMatrix.reduce((a, b) => a + b.admitted, 0);
        const totalVacantAll = seatMatrix.reduce((a, b) => a + b.vacant, 0);

        const filteredSeatMatrix = seatMatrix.filter((item) => {
          const matchesStream =
            streamFilter === 'ALL' ||
            item.stream === streamFilter ||
            (streamFilter === 'Science' && (item.stream === 'Physical Science' || item.stream === 'Biological Science'));
          return matchesStream;
        });

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-serif flex items-center">
                  <Edit2 className="w-5 h-5 mr-2 text-amber-400" />
                  Department Intake & Seat Matrix Editor ({seatMatrix.length} Departments)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live synchronized intake strengths, enrolled honours scholars, and vacancies across all 5 streams from the student database.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenAddSeat}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Department / Subject
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Clear all enrolled counts and re-initialize seat matrix with official 28 departments and intake strengths?')) {
                      clearSeatMatrix();
                      showToast('success', 'Cleared seat matrix and reset to official 28 departments.');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Seat Matrix (28 Depts)
                </button>
                <button
                  onClick={() => {
                    resetSeatMatrixToBenchmark();
                    showToast('success', 'Reset seat matrix to Govt benchmark.');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to Govt Benchmark
                </button>
              </div>
            </div>

            {/* Stream Overview Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {(Object.keys(streamCounts) as (keyof typeof streamCounts)[]).map((stKey) => {
                const data = streamCounts[stKey];
                const fillPct = data.sanctioned > 0 ? Math.round((data.admitted / data.sanctioned) * 100) : 0;
                return (
                  <div
                    key={stKey}
                    onClick={() => setStreamFilter(stKey)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      streamFilter === stKey
                        ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="truncate">{stKey}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{data.depts} Depts</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-white">{data.admitted}</span>
                      <span className="text-[11px] font-mono text-slate-400">/ {data.sanctioned} seats</span>
                    </div>
                    <div className="mt-1.5 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, fillPct)}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{fillPct}% Filled</span>
                      <span className="text-amber-400 font-bold">{data.vacant} Vacant</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stream Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px] font-semibold mr-1">Filter Stream:</span>
                {['ALL', 'Arts', 'Biological Science', 'Commerce', 'Physical Science', 'Self Financing'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStreamFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      streamFilter === s
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                Overall Roster Intake: <strong className="text-emerald-400">{totalAdmittedAll}</strong> Admitted / <strong className="text-white">{totalSanctionedAll}</strong> Sanctioned (<strong className="text-amber-400">{totalVacantAll}</strong> Vacant)
              </span>
            </div>

            {/* Seat Matrix Table with Live Student Database Roster Details */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Department / Honours Subject</th>
                    <th className="py-3 px-4">Stream & Type</th>
                    <th className="py-3 px-4 text-center">Sanctioned</th>
                    <th className="py-3 px-4 text-center">Admitted</th>
                    <th className="py-3 px-4 text-center">Vacant</th>
                    <th className="py-3 px-4">Live Student DB Roster Breakdown</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSeatMatrix.map((item) => {
                    const enrolled = students.filter((s) => {
                      if (s.status && s.status !== 'Admitted') return false;
                      const sDept = (s.department || '').toLowerCase().trim();
                      const mDept = (item.deptName || '').toLowerCase().trim();
                      if (sDept === mDept) return true;
                      if (item.isAedp && s.isAedp && (sDept.includes(mDept) || mDept.includes(sDept))) return true;
                      if (!item.isAedp && !s.isAedp && sDept.includes(mDept)) return true;
                      return false;
                    });

                    const mCount = enrolled.filter((s) => (s.gender || '').toLowerCase().startsWith('m')).length;
                    const fCount = enrolled.filter((s) => (s.gender || '').toLowerCase().startsWith('f')).length;
                    const genC = enrolled.filter((s) => normalizeCategory(s.category) === 'GEN').length;
                    const scC = enrolled.filter((s) => normalizeCategory(s.category) === 'SC').length;
                    const stC = enrolled.filter((s) => normalizeCategory(s.category) === 'ST').length;
                    const sebcC = enrolled.filter((s) => normalizeCategory(s.category) === 'SEBC').length;
                    const avgPct = enrolled.length > 0
                      ? (enrolled.reduce((a, b) => a + (b.marksPercentage || 0), 0) / enrolled.length).toFixed(1)
                      : null;

                    const percentFilled = Math.round((item.admitted / item.sanctioned) * 100);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center">
                            {item.deptName}
                            {item.isAedp && (
                              <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                                AEDP
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.specialization || (item.isAedp ? 'AEDP Specialization' : 'Regular Honours')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.stream === 'Arts' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            item.stream === 'Biological Science' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            item.stream === 'Commerce' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            item.stream === 'Physical Science' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {item.stream}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">{item.sanctioned}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{item.admitted}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                            item.vacant > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {item.vacant}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                              <span className="bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                                M: <strong className="text-blue-400">{mCount}</strong> | F: <strong className="text-pink-400">{fCount}</strong>
                              </span>
                              <span className="bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                                GEN:{genC} SC:{scC} ST:{stC} SEBC:{sebcC}
                              </span>
                              {avgPct && (
                                <span className="bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  Avg: {avgPct}%
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full ${
                                  percentFilled >= 90 ? 'bg-emerald-500' : percentFilled >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${percentFilled}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setStudentSearch(item.deptName);
                                setActiveAdminTab('students');
                              }}
                              className="p-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs flex items-center font-semibold"
                              title="View Enrolled Students Roster"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Roster
                            </button>
                            <button
                              onClick={() => handleOpenEditSeat(item)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs"
                              title="Edit Seat Matrix"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete seat matrix for ${item.deptName}?`)) {
                                  deleteSeatMatrixItem(item.id);
                                  showToast('success', `Deleted department ${item.deptName}.`);
                                }
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400 text-xs"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 5: NOTICES & ANNOUNCEMENTS MANAGER                    */}
      {/* ========================================================= */}
      {activeAdminTab === 'notices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Bell className="w-5 h-5 mr-2 text-amber-400" />
                Notices & Official Announcements ({notices.length} Notices)
              </h2>
              <p className="text-xs text-slate-400">
                Post new college notices, circulars, exam dates, or edit existing notices.
              </p>
            </div>

            <button
              onClick={handleOpenAddNotice}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Post New Notice
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 hover:border-amber-500/30 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                        {n.category}
                      </span>
                      <span className="text-slate-500 text-[10px] font-mono">{n.date}</span>
                      {n.isImportant && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                          URGENT
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm">{n.title}</h3>
                    {n.content && <p className="text-slate-400 mt-1 leading-relaxed">{n.content}</p>}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditNotice(n)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this notice?')) {
                          deleteNotice(n.id);
                          showToast('success', 'Notice deleted successfully.');
                        }
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: FAQS MANAGER (FULL CRUD & PRESERVES NEWLINES)      */}
      {/* ========================================================= */}
      {activeAdminTab === 'faqs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-amber-400" />
                Frequently Asked Questions (FAQs) Manager ({faqs.length} FAQs)
              </h2>
              <p className="text-xs text-slate-400">
                Add questions and edit multiline answers. Formatting and new lines are strictly preserved on the public site.
              </p>
            </div>

            <button
              onClick={handleOpenAddFaq}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New FAQ
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 hover:border-amber-500/30 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-white text-sm">{faq.question}</h3>
                    <div className="text-slate-300 text-xs whitespace-pre-line leading-relaxed pt-1">
                      {faq.answer}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditFaq(faq)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteFAQ(faq.id);
                        showToast('success', `FAQ deleted successfully.`);
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: HOD CREDENTIALS & ACCOUNTS MANAGER                 */}
      {/* ========================================================= */}
      {activeAdminTab === 'hods' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Lock className="w-5 h-5 mr-2 text-amber-400" />
                HOD Security Credentials & Department Accounts ({hodAccounts.length} Departments)
              </h2>
              <p className="text-xs text-slate-400">
                Manage department logins, reset passwords, update HOD head contacts, or add new department logins.
              </p>
            </div>

            <button
              onClick={handleOpenAddHod}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add HOD Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hodAccounts.map((hod) => (
              <div key={hod.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-white text-sm">Department of {hod.deptName}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditHod(hod)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete HOD account for ${hod.deptName}?`)) {
                          deleteHodAccount(hod.id);
                          showToast('success', `Deleted HOD account for ${hod.deptName}.`);
                        }
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-red-950/40 text-red-400"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-slate-300 text-[11px]">
                  <p>HOD Head: <strong>{hod.hodName}</strong></p>
                  <p className="font-mono text-slate-400">Username: <span className="text-amber-400 font-bold">{hod.username}</span></p>
                  <p className="font-mono text-slate-400">Password: <span className="text-emerald-400">{hod.password}</span></p>
                  <p className="font-mono text-slate-400">Phone: +91 {hod.phone}</p>
                  <p className="font-mono text-slate-400">Email: {hod.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: SPOT ROUND MASTER DESK & CANDIDATES                */}
      {/* ========================================================= */}
      {activeAdminTab === 'spot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Radio className="w-5 h-5 mr-2 text-amber-400" />
                Spot Round Live Master Control Desk & Candidate Roster
              </h2>
              <p className="text-xs text-slate-400">
                Master toggle for Spot Round public reporting, automated merit selection runner, and candidate manager.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                systemSettings.spotRoundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {systemSettings.spotRoundEnabled ? 'PUBLIC ACCESS LIVE' : 'PORTAL DISABLED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Spot Round Public Tab Visibility</span>
                <button
                  onClick={() => toggleSpotRound(!systemSettings.spotRoundEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemSettings.spotRoundEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                      systemSettings.spotRoundEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => runAutomatedMeritSelection()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow flex items-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Run Automated Merit Selection
                </button>
                {spotCandidates.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all spot candidates?')) {
                        clearAllSpotCandidates();
                        showToast('info', 'All spot candidates cleared.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950 text-red-400 text-xs font-bold"
                  >
                    Clear Candidates
                  </button>
                )}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl space-y-2 text-xs text-amber-200">
              <span className="font-bold block text-amber-300 uppercase tracking-wider font-mono">
                Spot Selection Rule Notice
              </span>
              <p>
                Candidates must report with CAF printout and original matric/higher secondary certificates. Run automated merit selection after locking physical reporting.
              </p>
            </div>
          </div>

          {/* Spot Candidates Table */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white font-serif flex items-center">
              <Users className="w-4 h-4 mr-2 text-amber-400" />
              Registered Spot Candidates ({spotCandidates.length})
            </h3>

            {spotCandidates.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                No spot candidates registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">SAMS Reg. No.</th>
                      <th className="py-3 px-4">Candidate Name</th>
                      <th className="py-3 px-4">Department / Stream</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Marks %</th>
                      <th className="py-3 px-4 text-center">Report Status</th>
                      <th className="py-3 px-4 text-center">Selection Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {spotCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-amber-300 font-bold">{cand.samsRegNo}</td>
                        <td className="py-3 px-4 font-bold text-white">{cand.studentName}</td>
                        <td className="py-3 px-4">
                          <span className="text-slate-200">{cand.deptName}</span>
                          <span className="text-[10px] text-slate-500 block">{cand.stream}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{cand.category}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{cand.marksPercentage}%</td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${cand.reportedStatus === 'Reported' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {cand.reportedStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${cand.selectionStatus === 'Selected' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                            {cand.selectionStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete spot candidate ${cand.studentName} (${cand.samsRegNo})?`)) {
                                deleteSpotCandidate(cand.id);
                                showToast('success', `Deleted spot candidate ${cand.studentName}.`);
                              }
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 text-red-400 text-xs transition"
                            title="Delete Spot Candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: COLLEGE SETTINGS & BRANDING                        */}
      {/* ========================================================= */}
      {activeAdminTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Settings className="w-5 h-5 mr-2 text-amber-400" />
                College Information & Global System Settings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure official college name, SAMS code, affiliation, NAAC accreditation, contact directory, top marquee banner, and prospectus. Changes reflect instantly across all pages and headers.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center transition"
                title="Restore official default settings"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Reset to Defaults
              </button>
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs flex items-center space-x-2 animate-fadeIn shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Section 1: College Identification & Code */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Building2 className="w-4 h-4 mr-2" /> 1. College Identification & SAMS Code
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-slate-300 block mb-1 font-semibold">Official College Name (English)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.collegeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, collegeName: e.target.value })}
                    placeholder="e.g. SAMS Panchayat College, Baragada"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-slate-300 block mb-1 font-semibold">Official College Name (Odia / ଓଡ଼ିଆ)</label>
                  <input
                    type="text"
                    value={settingsForm.collegeNameOdia}
                    onChange={(e) => setSettingsForm({ ...settingsForm, collegeNameOdia: e.target.value })}
                    placeholder="e.g. ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-slate-300 block mb-1 font-semibold">Official SAMS College Code</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.collegeCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, collegeCode: e.target.value })}
                    placeholder="03071302"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Government / Affiliation Tagline (English)</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    placeholder="Government of Odisha | Department of Higher Education"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Government / Affiliation Tagline (Odia / ଓଡ଼ିଆ)</label>
                  <input
                    type="text"
                    value={settingsForm.taglineOdia}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taglineOdia: e.target.value })}
                    placeholder="ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">NAAC Accreditation & Estd Details</label>
                <input
                  type="text"
                  value={settingsForm.naacGrade}
                  onChange={(e) => setSettingsForm({ ...settingsForm, naacGrade: e.target.value })}
                  placeholder="NAAC Accredited Grade B++ | Govt. Degree College Estd. 1960"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 2: Top Marquee Notice & Publications */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Bell className="w-4 h-4 mr-2" /> 2. Top Marquee Notice & Prospectus Publications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Top Marquee Notice Banner (English)</label>
                  <textarea
                    rows={2}
                    value={settingsForm.bannerNotice}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
                    placeholder="SAMS Degree e-Admission 2026-27: Spot Selection Live Reporting Desk Open..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Top Marquee Notice Banner (Odia / ଓଡ଼ିଆ)</label>
                  <textarea
                    rows={2}
                    value={settingsForm.bannerNoticeOdia}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bannerNoticeOdia: e.target.value })}
                    placeholder="ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ୨୦୨୬-୨୭: ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ସିଟ୍ ଲାଇଭ୍ ମେରିଟ୍ ତାଲିକା ନିମ୍ନରେ ପ୍ରକାଶିତ..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">College Crest Logo Image URL</label>
                  <input
                    type="url"
                    value={settingsForm.collegeLogoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, collegeLogoUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Common Prospectus (CP) PDF URL</label>
                  <input
                    type="url"
                    value={settingsForm.prospectusUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, prospectusUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact Directory & Address */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Phone className="w-4 h-4 mr-2" /> 3. Official Contact Directory & Postal Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Admission Helpline / Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    placeholder="06646-230234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Official SAMS Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    placeholder="principal.baragada@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Postal Address (English)</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="Panchayat College, Baragada, Odisha - 768028"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Postal Address (Odia / ଓଡ଼ିଆ)</label>
                  <input
                    type="text"
                    value={settingsForm.addressOdia}
                    onChange={(e) => setSettingsForm({ ...settingsForm, addressOdia: e.target.value })}
                    placeholder="ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼, ଓଡ଼ିଶା - ୭୬୮୦୨୮"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: 02 Admission In-Charge Officers, DEO & Principal Administration */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-amber-400" /> 4. Admission Committee: 02 Admission In-Charge & DEO Helpdesk
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  DISPLAYS IN HERO BANNER & CONTACT DIRECTORY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Configure official details, phone numbers, emails, and photos for the Principal, the two Admission In-Charge officers (Arts/Commerce and Science/AEDP), and the SAMS Data Entry Operator (DEO). All fields are editable by the Admin.
              </p>

              {/* Subsection A: Principal-in-Charge */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>A. Principal-in-Charge</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Principal Name (English)</label>
                    <input
                      type="text"
                      value={settingsForm.principalName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalName: e.target.value })}
                      placeholder="Prof. Amarendra Panda"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Principal Name (Odia / ଓଡ଼ିଆ)</label>
                    <input
                      type="text"
                      value={settingsForm.principalNameOdia}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalNameOdia: e.target.value })}
                      placeholder="ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Official Academic Designation</label>
                    <input
                      type="text"
                      value={settingsForm.principalDesignation}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalDesignation: e.target.value })}
                      placeholder="Principal-in-Charge | Reader in Physics"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Principal Office Phone</label>
                    <input
                      type="text"
                      value={settingsForm.principalPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalPhone: e.target.value })}
                      placeholder="06646-230234"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Principal Official Email</label>
                    <input
                      type="email"
                      value={settingsForm.principalEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalEmail: e.target.value })}
                      placeholder="principal.baragada@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Principal Photo Image URL</label>
                    <input
                      type="url"
                      value={settingsForm.principalPhotoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, principalPhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Subsection B: Admission In-Charge 01 (Arts & Commerce) */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-blue-900/40 space-y-3">
                <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>B. Admission In-Charge 01 (Arts & Commerce Stream)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Officer Name (English)</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge1Name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1Name: e.target.value })}
                      placeholder="Dr. Manoranjan Dash"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Officer Name (Odia / ଓଡ଼ିଆ)</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge1NameOdia}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1NameOdia: e.target.value })}
                      placeholder="ଡଃ ମନୋରଞ୍ଜନ ଦାଶ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Department</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge1Designation}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1Designation: e.target.value })}
                      placeholder="Admission In-Charge (Arts & Commerce) | Sr. Lecturer in Economics"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Direct Mobile / Helpline</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge1Phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1Phone: e.target.value })}
                      placeholder="+91 94371 88201"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Official Email</label>
                    <input
                      type="email"
                      value={settingsForm.admissionIncharge1Email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1Email: e.target.value })}
                      placeholder="admission.arts.pcb@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Photo Image URL</label>
                    <input
                      type="url"
                      value={settingsForm.admissionIncharge1PhotoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge1PhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Subsection C: Admission In-Charge 02 (Science & AEDP) */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-purple-900/40 space-y-3">
                <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>C. Admission In-Charge 02 (Science & AEDP Specializations)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Officer Name (English)</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge2Name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2Name: e.target.value })}
                      placeholder="Dr. Sasmita Panigrahi"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Officer Name (Odia / ଓଡ଼ିଆ)</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge2NameOdia}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2NameOdia: e.target.value })}
                      placeholder="ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-sans"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Department</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge2Designation}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2Designation: e.target.value })}
                      placeholder="Admission In-Charge (Science & AEDP) | Sr. Lecturer in Chemistry"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Direct Mobile / Helpline</label>
                    <input
                      type="text"
                      value={settingsForm.admissionIncharge2Phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2Phone: e.target.value })}
                      placeholder="+91 94372 65430"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Official Email</label>
                    <input
                      type="email"
                      value={settingsForm.admissionIncharge2Email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2Email: e.target.value })}
                      placeholder="admission.science.pcb@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Photo Image URL</label>
                    <input
                      type="url"
                      value={settingsForm.admissionIncharge2PhotoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admissionIncharge2PhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Subsection D: Data Entry Operator (DEO) */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-900/40 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>D. Data Entry Operator (DEO - SAMS Helpdesk & Verification)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">DEO Name (English)</label>
                    <input
                      type="text"
                      value={settingsForm.deoName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoName: e.target.value })}
                      placeholder="Sri Rajesh Kumar Meher"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">DEO Name (Odia / ଓଡ଼ିଆ)</label>
                    <input
                      type="text"
                      value={settingsForm.deoNameOdia}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoNameOdia: e.target.value })}
                      placeholder="ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Role Responsibilities</label>
                    <input
                      type="text"
                      value={settingsForm.deoDesignation}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoDesignation: e.target.value })}
                      placeholder="Data Entry Operator (DEO) | SAMS Helpdesk & Verification"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Direct Contact / Mobile Number</label>
                    <input
                      type="text"
                      value={settingsForm.deoPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoPhone: e.target.value })}
                      placeholder="+91 79780 45129"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">DEO Helpdesk Email</label>
                    <input
                      type="email"
                      value={settingsForm.deoEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoEmail: e.target.value })}
                      placeholder="deo.sams.pcb@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 block mb-1 font-semibold">Photo Image URL</label>
                    <input
                      type="url"
                      value={settingsForm.deoPhotoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deoPhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Live Preview Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" /> Live Portal Branding Preview
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </h3>

              {/* Header Preview */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 p-0.5 bg-slate-950 overflow-hidden shrink-0">
                  <img
                    src={settingsForm.collegeLogoUrl || DEFAULT_SETTINGS.collegeLogoUrl}
                    alt="Emblem"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-white text-sm font-serif">
                      {settingsForm.collegeName || 'College Name'}
                    </h4>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold font-mono">
                      SAMS: {settingsForm.collegeCode || '03071302'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90">
                    {settingsForm.tagline || 'Tagline'} &bull; {settingsForm.address || 'Address'}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {settingsForm.naacGrade || 'NAAC Grade'}
                  </p>
                </div>
              </div>

              {/* Marquee Preview */}
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-xs flex items-center space-x-2 overflow-hidden">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">
                  MARQUEE
                </span>
                <span className="truncate font-mono text-[11px]">
                  {settingsForm.bannerNotice || 'No notice banner configured'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-xl flex items-center transition"
              >
                <Save className="w-4 h-4 mr-1.5" /> Save All College Settings
              </button>

              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center transition"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Reset to Defaults
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: GOOGLE DRIVE CLOUD BACKUP & RESTORE               */}
      {/* ========================================================= */}
      {activeAdminTab === 'drive' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-amber-400" />
              Google Drive Cloud Snapshot Backup & Restore
            </h2>
            <p className="text-xs text-slate-400">
              Integrates Google Drive API to generate JSON system snapshots or restore full system database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Upload className="w-4 h-4 mr-2 text-amber-400" /> Create Google Drive System Snapshot
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Generates a complete JSON backup containing all students, barcodes, parent names, max marks, and audit logs.
              </p>

              <button
                onClick={handleTriggerDriveBackup}
                disabled={isCreatingBackup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow flex items-center justify-center"
              >
                <Cloud className="w-4 h-4 mr-2" />
                {isCreatingBackup ? 'Generating Snapshot...' : 'Backup Snapshot to Google Drive'}
              </button>

              {backupStatusMsg && <p className="text-emerald-400 font-mono text-[11px]">{backupStatusMsg}</p>}
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Download className="w-4 h-4 mr-2 text-emerald-400" /> Restore System from Snapshot File
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Upload a previously created system JSON snapshot file to restore all student database records and configuration.
              </p>

              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-500/30 shadow flex items-center justify-center cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Select JSON Snapshot File to Restore
                <input type="file" accept=".json" onChange={handleRestoreSnapshotFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: SYSTEM AUDIT LOGS                                 */}
      {/* ========================================================= */}
      {activeAdminTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <History className="w-5 h-5 mr-2 text-amber-400" />
              Administrative System Audit Trail
            </h2>
            <p className="text-xs text-slate-400">
              Track administrative actions, student excel imports, sheet syncs, and backup restores in real time.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="font-bold text-amber-400">{log.actionType}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-200 font-medium">{log.description}</p>
                <span className="text-[10px] text-slate-500 font-mono">By: {log.adminName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT STUDENT MODAL                         */}
      {/* ========================================================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 text-xs my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <UserPlus className="w-4 h-4 mr-2 text-amber-400" />
                {editingStudent ? 'Edit Student Record' : 'Add New Student Record'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">University Roll No *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Father Name</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mother Name</label>
                  <input
                    type="text"
                    value={studentForm.motherName}
                    onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="tel"
                    value={studentForm.mobileNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, mobileNumber: e.target.value, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={studentForm.category}
                    onChange={(e) => setStudentForm({ ...studentForm, category: e.target.value as CategoryType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GEN">GEN</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="SEBC">SEBC</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Max Marks</label>
                  <input
                    type="number"
                    value={studentForm.maxMarks}
                    onChange={(e) => setStudentForm({ ...studentForm, maxMarks: parseFloat(e.target.value) || 600 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Secured Marks</label>
                  <input
                    type="number"
                    value={studentForm.marksSecured}
                    onChange={(e) => setStudentForm({ ...studentForm, marksSecured: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Department / Honours</label>
                  <input
                    type="text"
                    required
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Stream</label>
                  <select
                    value={studentForm.stream}
                    onChange={(e) => setStudentForm({ ...studentForm, stream: e.target.value as StreamType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">University Roll No</label>
                  <input
                    type="text"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">SAMS Reg No</label>
                  <input
                    type="text"
                    value={studentForm.samsRegNo}
                    onChange={(e) => setStudentForm({ ...studentForm, samsRegNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Status</label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Admitted">Admitted</option>
                    <option value="Spot Applied">Spot Applied</option>
                    <option value="Selected">Selected</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT FACULTY MODAL                         */}
      {/* ========================================================= */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Users className="w-4 h-4 mr-2 text-amber-400" />
                {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setIsFacultyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFacultyFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Chandra Sahoo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Department *</label>
                  <input
                    type="text"
                    required
                    value={facultyForm.deptName}
                    onChange={(e) => setFacultyForm({ ...facultyForm, deptName: e.target.value })}
                    placeholder="e.g. Physics"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Designation *</label>
                  <input
                    type="text"
                    required
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    placeholder="e.g. Associate Professor"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Qualification *</label>
                <input
                  type="text"
                  required
                  value={facultyForm.qualification}
                  onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                  placeholder="e.g. Ph.D. (IIT Kharagpur), M.Sc."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Photo URL</label>
                <input
                  type="url"
                  value={facultyForm.photoUrl}
                  onChange={(e) => setFacultyForm({ ...facultyForm, photoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="facultyIsHodCheck"
                  checked={facultyForm.isHod}
                  onChange={(e) => setFacultyForm({ ...facultyForm, isHod: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="facultyIsHodCheck" className="text-slate-200 font-semibold cursor-pointer">
                  Department Head (HOD)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingFaculty ? 'Save Changes' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT SEAT MATRIX MODAL                     */}
      {/* ========================================================= */}
      {isSeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-amber-400" />
                {editingSeatItem ? 'Edit Department Intake' : 'Add Department to Seat Matrix'}
              </h3>
              <button onClick={() => setIsSeatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSeatFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Department / Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={seatForm.deptName}
                  onChange={(e) => setSeatForm({ ...seatForm, deptName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Stream</label>
                  <select
                    value={seatForm.stream}
                    onChange={(e) => setSeatForm({ ...seatForm, stream: e.target.value as StreamType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Specialization</label>
                  <input
                    type="text"
                    value={seatForm.specialization}
                    onChange={(e) => setSeatForm({ ...seatForm, specialization: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Sanctioned Intake Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={seatForm.sanctioned}
                    onChange={(e) => setSeatForm({ ...seatForm, sanctioned: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Admitted Count</label>
                  <input
                    type="number"
                    min={0}
                    value={seatForm.admitted}
                    onChange={(e) => setSeatForm({ ...seatForm, admitted: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="seatIsAedpCheck"
                  checked={seatForm.isAedp}
                  onChange={(e) => setSeatForm({ ...seatForm, isAedp: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="seatIsAedpCheck" className="text-slate-200 font-semibold cursor-pointer">
                  AEDP Skill Development Course
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSeatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingSeatItem ? 'Save Seat Intake' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT NOTICE MODAL                          */}
      {/* ========================================================= */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Bell className="w-4 h-4 mr-2 text-amber-400" />
                {editingNotice ? 'Edit Notice' : 'Post New Notice'}
              </h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNoticeFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Schedule for Spot Selection Document Verification"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="General">General</option>
                    <option value="Admission">Admission</option>
                    <option value="Spot Round">Spot Round</option>
                    <option value="Examination">Examination</option>
                    <option value="Departmental">Departmental</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Date</label>
                  <input
                    type="text"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notice Content / Instructions</label>
                <textarea
                  rows={3}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Detailed instructions for students and applicants..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="noticeIsImportantCheck"
                  checked={noticeForm.isImportant}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isImportant: e.target.checked })}
                  className="rounded border-slate-700 text-red-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="noticeIsImportantCheck" className="text-red-400 font-semibold cursor-pointer">
                  Mark as URGENT / Important
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingNotice ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD / EDIT FAQ MODAL                             */}
      {/* ========================================================= */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-amber-400" />
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFaqFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What documents are required for Spot Round reporting?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Admission, Spot Round, Academics"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Answer * <span className="text-slate-500 font-normal">(New lines entered here will be displayed exactly as typed)</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Enter detailed answer here. Press Enter for line breaks..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 whitespace-pre-wrap font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingFaq ? 'Save FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: ADD / EDIT HOD MODAL                             */}
      {/* ========================================================= */}
      {isHodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Lock className="w-4 h-4 mr-2 text-amber-400" />
                {editingHod ? 'Edit HOD Credentials' : 'Add New Department HOD Account'}
              </h3>
              <button onClick={() => setIsHodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHodFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Philosophy"
                  value={hodForm.deptName}
                  onChange={(e) => setHodForm({ ...hodForm, deptName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">HOD Head Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Chandra Sahoo"
                  value={hodForm.hodName}
                  onChange={(e) => setHodForm({ ...hodForm, hodName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="hod_physics"
                    value={hodForm.username}
                    onChange={(e) => setHodForm({ ...hodForm, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="Secret@2026"
                    value={hodForm.password}
                    onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={hodForm.phone}
                    onChange={(e) => setHodForm({ ...hodForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={hodForm.email}
                    onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHodModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingHod ? 'Save Credentials' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
