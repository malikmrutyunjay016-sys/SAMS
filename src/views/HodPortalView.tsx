import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, FacultyMember } from '../types';
import { compareRollNumbers } from '../lib/excelParser';
import {
  Building2,
  Users,
  CheckCircle2,
  LogOut,
  Bell,
  Search,
  Edit2,
  X,
  Download,
  Plus,
  Trash2,
  UserCheck,
  Award,
  Phone,
  Mail
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const HodPortalView: React.FC<{ onOpenHodModal: () => void }> = ({ onOpenHodModal }) => {
  const {
    students,
    seatMatrix,
    faculty,
    hodAccounts,
    addNotice,
    updateStudent,
    addFaculty,
    updateFaculty,
    deleteFaculty
  } = useData();
  const { isHod, hodDeptId, hodDeptName, logout } = useAuth();

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Admission' | 'Examination' | 'Departmental' | 'Spot Round'>('Departmental');
  const [noticeContent, setNoticeContent] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchFaculty, setSearchFaculty] = useState('');

  // HOD Student Edit Modal state
  const [isHodStudentModalOpen, setIsHodStudentModalOpen] = useState(false);
  const [editingHodStudent, setEditingHodStudent] = useState<Student | null>(null);
  const [hodStudentForm, setHodStudentForm] = useState({
    name: '',
    rollNo: '',
    universityRollNo: '',
    samsRegNo: '',
    parentName: '',
    motherName: '',
    aadhaarNo: '',
    email: '',
    mobileNumber: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    admissionDate: '',
    category: 'GEN' as any,
    stream: 'Science' as any,
    department: '',
    maxMarks: 600,
    marksSecured: 480,
    marksPercentage: 80.0,
    bloodGroup: 'O+',
  });

  // HOD Faculty Add / Edit Modal state
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    designation: 'Assistant Professor',
    qualification: 'Ph.D., M.Sc.',
    email: '',
    phone: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isHod: false,
  });

  const [toastMsg, setToastMsg] = useState('');

  if (!isHod || !hodDeptId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">
          Departmental HOD Security Portal Access
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Please log in with your department-specific HOD credentials to access the departmental student roster, faculty directory, seat vacancy reports, and notice publishing desk.
        </p>
        <button
          onClick={onOpenHodModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg"
        >
          Open HOD Login Modal
        </button>
      </div>
    );
  }

  const currentHodAccount = hodAccounts.find((h) => h.id === hodDeptId);

  // Filter students belonging to this department
  const deptStudents = students.filter((s) =>
    (s.department || '').toLowerCase().includes((hodDeptName || '').toLowerCase())
  );

  const filteredDeptStudents = deptStudents
    .filter((s) => {
      const q = (searchStudent || '').trim().toLowerCase();
      if (!q) return true;
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.universityRollNo || '').toLowerCase().includes(q) ||
        (s.samsRegNo || '').toLowerCase().includes(q) ||
        (s.parentName || '').toLowerCase().includes(q) ||
        (s.motherName || '').toLowerCase().includes(q) ||
        (s.aadhaarNo || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.mobileNumber || s.phone || '').toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.stream || '').toLowerCase().includes(q) ||
        (s.department || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));

  // Filter faculty members belonging to this department
  const deptFaculty = faculty.filter((f) =>
    (f.deptName || '').toLowerCase().includes((hodDeptName || '').toLowerCase())
  );

  const filteredDeptFaculty = deptFaculty.filter((f) => {
    const q = (searchFaculty || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q) ||
      (f.qualification || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.phone || '').toLowerCase().includes(q)
    );
  });

  const deptSeats = seatMatrix.filter((s) =>
    s.deptName.toLowerCase().includes((hodDeptName || '').toLowerCase())
  );

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    addNotice({
      title: `[${hodDeptName}] ${noticeTitle}`,
      category: noticeCategory,
      deptId: hodDeptId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      isImportant: true,
      content: noticeContent,
    });

    setNoticeTitle('');
    setNoticeContent('');
    setPostedSuccess(true);
    setTimeout(() => setPostedSuccess(false), 3000);
  };

  const handleExportHodStudentsExcel = () => {
    if (filteredDeptStudents.length === 0) {
      setToastMsg('No departmental student records available to export.');
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }

    const wsData = filteredDeptStudents.map((s) => ({
      'College Roll Number': s.rollNo || '',
      'University Roll Number': s.universityRollNo || 'N/A',
      'Barcode Number': s.samsRegNo || '',
      'Student Name': s.name || '',
      "Father's Name": s.parentName || '',
      "Mother's Name": s.motherName || '',
      'Aadhaar No': s.aadhaarNo || '',
      'Email ID': s.email || '',
      'Stream': s.stream || '',
      'Gender': s.gender || '',
      'Address': s.address || 'Baragada, Odisha',
      'Category': s.category || 'GEN',
      'Mobile Number': s.mobileNumber || s.phone || '',
      'Admission Date': s.admissionDate || '',
      'Subject Name': s.department || ''
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${hodDeptName}_Students`);
    XLSX.writeFile(wb, `SAMS_${hodDeptName}_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleOpenEditHodStudent = (stu: Student) => {
    setEditingHodStudent(stu);
    setHodStudentForm({
      name: stu.name,
      rollNo: stu.rollNo,
      universityRollNo: stu.universityRollNo || '',
      samsRegNo: stu.samsRegNo,
      parentName: stu.parentName || '',
      motherName: stu.motherName || '',
      aadhaarNo: stu.aadhaarNo || '',
      email: stu.email || '',
      mobileNumber: stu.mobileNumber || stu.phone || '',
      phone: stu.phone || '',
      gender: stu.gender || 'Male',
      address: stu.address || '',
      admissionDate: stu.admissionDate || '',
      category: stu.category,
      stream: stu.stream,
      department: stu.department,
      maxMarks: stu.maxMarks || 600,
      marksSecured: stu.marksSecured || 400,
      marksPercentage: stu.marksPercentage || 80.0,
      bloodGroup: stu.bloodGroup || 'O+',
    });
    setIsHodStudentModalOpen(true);
  };

  const handleHodStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHodStudent) return;

    const pct = hodStudentForm.maxMarks > 0
      ? parseFloat(((hodStudentForm.marksSecured / hodStudentForm.maxMarks) * 100).toFixed(1))
      : hodStudentForm.marksPercentage;

    updateStudent(editingHodStudent.id, {
      ...hodStudentForm,
      marksPercentage: pct,
      phone: hodStudentForm.mobileNumber || hodStudentForm.phone,
    });

    setToastMsg(`Successfully updated student ${hodStudentForm.name} (Roll No: ${hodStudentForm.rollNo})`);
    setIsHodStudentModalOpen(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // ==========================================
  // HOD FACULTY HANDLERS
  // ==========================================
  const handleOpenAddFaculty = () => {
    setEditingFaculty(null);
    setFacultyForm({
      name: '',
      designation: 'Assistant Professor',
      qualification: 'Ph.D., M.Sc.',
      email: `faculty.${(hodDeptName || 'dept').toLowerCase().replace(/\s+/g, '')}@baragada.edu.in`,
      phone: '9437123456',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHod: false,
    });
    setIsFacultyModalOpen(true);
  };

  const handleOpenEditFaculty = (f: FacultyMember) => {
    setEditingFaculty(f);
    setFacultyForm({
      name: f.name,
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
      deptId: (hodDeptName || 'department').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      deptName: hodDeptName || 'Department',
      designation: facultyForm.designation.trim(),
      qualification: facultyForm.qualification.trim(),
      email: facultyForm.email.trim() || `${facultyForm.name.toLowerCase().replace(/\s+/g, '.')}@baragada.edu.in`,
      phone: facultyForm.phone.trim() || '9437123456',
      photoUrl: facultyForm.photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHod: facultyForm.isHod,
    };

    if (editingFaculty) {
      updateFaculty(editingFaculty.id, payload);
      setToastMsg(`Successfully updated faculty details for ${facultyForm.name}`);
    } else {
      addFaculty(payload);
      setToastMsg(`Added new faculty member ${facultyForm.name} to Department of ${hodDeptName}`);
    }

    setIsFacultyModalOpen(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDeleteFaculty = (f: FacultyMember) => {
    deleteFaculty(f.id);
    setToastMsg(`Removed faculty member ${f.name} from ${hodDeptName} department directory.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HOD Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Building2 className="w-4 h-4" />
            <span>DEPARTMENTAL HOD PORTAL &bull; SAMS ODISHA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Department of {hodDeptName} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            HOD Head: <strong>{currentHodAccount?.hodName || 'Department HOD'}</strong> &bull; Email: {currentHodAccount?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center shadow"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout HOD Session
        </button>
      </div>

      {/* Seat Matrix & Vacancy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {deptSeats.map((seat) => (
          <div key={seat.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{seat.isAedp ? 'AEDP Specialization' : 'Regular Honours'}</span>
              <span className="text-amber-400 font-bold">{seat.specialization || 'Honours'}</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{seat.deptName}</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Sanctioned</span>
                <span className="font-bold text-slate-200">{seat.sanctioned}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Admitted</span>
                <span className="font-bold text-emerald-400">{seat.admitted}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Vacant</span>
                <span className="font-bold text-amber-400">{seat.vacant}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section 1: Departmental Faculty Directory Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-amber-400" />
              Department Faculty Directory ({deptFaculty.length} Faculty Members in {hodDeptName})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add, edit, or remove teaching professors, readers, and lecturers for the Department of {hodDeptName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty name, designation..."
                value={searchFaculty}
                onChange={(e) => setSearchFaculty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleOpenAddFaculty}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow transition"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Faculty Member
            </button>
          </div>
        </div>

        {filteredDeptFaculty.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Faculty Records in {hodDeptName} Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click "Add Faculty Member" to populate teaching professors and staff for your department.
            </p>
            <button
              onClick={handleOpenAddFaculty}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Faculty Member Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDeptFaculty.map((fac) => (
              <div
                key={fac.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <img
                      src={fac.photoUrl}
                      alt={fac.name}
                      className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-white text-sm font-serif truncate">{fac.name}</h4>
                        {fac.isHod && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold font-mono shrink-0">
                            HOD
                          </span>
                        )}
                      </div>
                      <p className="text-amber-400 font-semibold text-xs mt-0.5">{fac.designation}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5 truncate">{fac.qualification}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center text-slate-300 space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-sky-400 text-[11px] truncate">{fac.email}</span>
                    </div>
                    <div className="flex items-center text-slate-300 space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-emerald-400 text-[11px]">{fac.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEditFaculty(fac)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFaculty(fac)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-red-400 text-xs font-bold flex items-center transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Post Departmental Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white font-serif flex items-center">
          <Bell className="w-4 h-4 mr-2 text-amber-400" /> Publish Departmental Notice
        </h2>

        {postedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Notice successfully published to college main notice board!
          </div>
        )}

        <form onSubmit={handlePostNotice} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Mid-Sem Internal Viva Voce Schedule for +3 1st Semester"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Category</label>
            <select
              value={noticeCategory}
              onChange={(e) => setNoticeCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Departmental">Departmental</option>
              <option value="Admission">Admission</option>
              <option value="Examination">Examination</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notice Content / Instructions</label>
            <textarea
              rows={3}
              required
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Enter detailed notice content..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg"
          >
            Post Official Notice
          </button>
        </form>
      </div>

      {/* Section 3: Departmental Student Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white font-serif flex items-center">
              <Users className="w-4 h-4 mr-2 text-amber-400" /> Department Student Roster ({deptStudents.length} Enrolled in {hodDeptName})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identical database view format as Admin Control Center with all 15 student attributes. Showing {filteredDeptStudents.length} matching students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, roll, barcode, email, mobile..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleExportHodStudentsExcel}
              className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">College Roll Number</th>
                <th className="py-3 px-3 whitespace-nowrap">University Roll Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Barcode Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Student Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Father's Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Mother's Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Aadhaar No</th>
                <th className="py-3 px-3 whitespace-nowrap">Email ID</th>
                <th className="py-3 px-3 whitespace-nowrap">Stream</th>
                <th className="py-3 px-3 whitespace-nowrap">Gender</th>
                <th className="py-3 px-3 whitespace-nowrap">Address</th>
                <th className="py-3 px-3 whitespace-nowrap">Category</th>
                <th className="py-3 px-3 whitespace-nowrap">Mobile Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Admission Date</th>
                <th className="py-3 px-3 whitespace-nowrap">Subject Name</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeptStudents.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400 text-xs">
                    No departmental student records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDeptStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-amber-300 font-bold whitespace-nowrap">{stu.rollNo || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold whitespace-nowrap">{stu.universityRollNo || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">{stu.samsRegNo || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{stu.name}</td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.parentName || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.motherName || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">{stu.aadhaarNo || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400 whitespace-nowrap">{stu.email || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-semibold text-purple-300 whitespace-nowrap">{stu.stream}</td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.gender || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={stu.address || 'Baragada, Odisha'}>{stu.address || 'Baragada, Odisha'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">{stu.category}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 whitespace-nowrap">{stu.mobileNumber || stu.phone || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">{stu.admissionDate || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-200 whitespace-nowrap">{stu.department}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenEditHodStudent(stu)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold flex items-center justify-center mx-auto transition"
                        title="Edit University Roll No & Student Details"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOD Student Edit Modal */}
      {isHodStudentModalOpen && editingHodStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-amber-400" />
                Edit Student Details ({hodDeptName} Department Privilege)
              </h3>
              <button onClick={() => setIsHodStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHodStudentSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Student Name</label>
                <input
                  type="text"
                  value={hodStudentForm.name}
                  onChange={(e) => setHodStudentForm({ ...hodStudentForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">College Roll Number</label>
                  <input
                    type="text"
                    value={hodStudentForm.rollNo}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    University Roll Number <span className="text-cyan-400 text-[10px] font-normal">(HOD / Admin Editable)</span>
                  </label>
                  <input
                    type="text"
                    value={hodStudentForm.universityRollNo}
                    placeholder="e.g. 240101001"
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, universityRollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Barcode / SAMS Reg No</label>
                  <input
                    type="text"
                    value={hodStudentForm.samsRegNo}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, samsRegNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Aadhaar Number</label>
                  <input
                    type="text"
                    value={hodStudentForm.aadhaarNo}
                    placeholder="e.g. 784512349012"
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, aadhaarNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email ID</label>
                  <input
                    type="email"
                    value={hodStudentForm.email}
                    placeholder="student@gmail.com"
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sky-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="tel"
                    value={hodStudentForm.mobileNumber}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, mobileNumber: e.target.value, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Father Name</label>
                  <input
                    type="text"
                    value={hodStudentForm.parentName}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, parentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mother Name</label>
                  <input
                    type="text"
                    value={hodStudentForm.motherName}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, motherName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Stream</label>
                  <select
                    value={hodStudentForm.stream}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, stream: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Arts">Arts</option>
                    <option value="Biological Science">Biological Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Physical Science">Physical Science</option>
                    <option value="Self Financing">Self Financing</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Gender</label>
                  <select
                    value={hodStudentForm.gender}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={hodStudentForm.category}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GEN">GEN</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="SEBC">SEBC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Address</label>
                  <input
                    type="text"
                    value={hodStudentForm.address}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Admission Date</label>
                  <input
                    type="text"
                    value={hodStudentForm.admissionDate}
                    placeholder="DD/MM/YYYY"
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, admissionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Subject / Honours Name</label>
                  <input
                    type="text"
                    value={hodStudentForm.department}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Max Marks</label>
                    <input
                      type="number"
                      value={hodStudentForm.maxMarks}
                      onChange={(e) => setHodStudentForm({ ...hodStudentForm, maxMarks: parseFloat(e.target.value) || 600 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Marks Secured</label>
                    <input
                      type="number"
                      value={hodStudentForm.marksSecured}
                      onChange={(e) => setHodStudentForm({ ...hodStudentForm, marksSecured: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHodStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  Save Student Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOD Faculty Add / Edit Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-amber-400" />
                {editingFaculty ? `Edit Faculty Details (${hodDeptName})` : `Add Faculty Member (${hodDeptName})`}
              </h3>
              <button onClick={() => setIsFacultyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFacultyFormSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Faculty Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Chandra Sahoo"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    disabled
                    value={hodDeptName || 'Department'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Professor / Reader"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Educational Qualifications</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ph.D. (IIT Kharagpur), M.Sc. (Utkal)"
                  value={facultyForm.qualification}
                  onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@baragada.edu.in"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sky-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone / Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9437123401"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={facultyForm.photoUrl}
                  onChange={(e) => setFacultyForm({ ...facultyForm, photoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isHodCheck"
                  checked={facultyForm.isHod}
                  onChange={(e) => setFacultyForm({ ...facultyForm, isHod: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <label htmlFor="isHodCheck" className="text-xs text-amber-300 font-semibold cursor-pointer">
                  Designate as Head of Department (HOD)
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
                  {editingFaculty ? 'Save Changes' : 'Add Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
