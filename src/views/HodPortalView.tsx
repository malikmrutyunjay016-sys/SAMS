import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { compareRollNumbers } from '../lib/excelParser';
import { Building2, Lock, Users, BookOpen, Plus, CheckCircle2, ShieldAlert, LogOut, Bell, Search, Edit2, X } from 'lucide-react';

export const HodPortalView: React.FC<{ onOpenHodModal: () => void }> = ({ onOpenHodModal }) => {
  const { students, seatMatrix, faculty, hodAccounts, notices, addNotice, updateStudent } = useData();
  const { isHod, hodDeptId, hodDeptName, logout } = useAuth();

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Admission' | 'Examination' | 'Departmental' | 'Spot Round'>('Departmental');
  const [noticeContent, setNoticeContent] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

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
    category: 'GEN' as any,
    maxMarks: 600,
    marksSecured: 480,
    marksPercentage: 80.0,
    department: '',
    stream: 'Science' as any,
    bloodGroup: 'O+',
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
          Please log in with your department-specific HOD credentials to access the departmental student roster, seat vacancy reports, and notice publishing desk.
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
    .filter((s) =>
      (s.name || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.rollNo || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.universityRollNo || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.email || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.samsRegNo || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.parentName || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      (s.motherName || '').toLowerCase().includes((searchStudent || '').toLowerCase())
    )
    .sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));

  const deptSeats = seatMatrix.filter((s) =>
    s.deptName.toLowerCase().includes((hodDeptName || '').toLowerCase())
  );

  const deptFaculty = faculty.filter((f) =>
    f.deptName.toLowerCase().includes((hodDeptName || '').toLowerCase())
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
      category: stu.category,
      maxMarks: stu.maxMarks || 600,
      marksSecured: stu.marksSecured || 400,
      marksPercentage: stu.marksPercentage || 80.0,
      department: stu.department,
      stream: stu.stream,
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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
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

      {/* Section 1: Post Departmental Notice */}
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

      {/* Section 2: Departmental Student Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-white font-serif flex items-center">
            <Users className="w-4 h-4 mr-2 text-amber-400" /> Department Student Roster ({deptStudents.length} Enrolled) &bull; HOD Edit Permission Active
          </h2>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student name, roll, parents..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">College Roll</th>
                <th className="py-3 px-3">University Roll</th>
                <th className="py-3 px-3">Barcode</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Father Name</th>
                <th className="py-3 px-3">Mother Name</th>
                <th className="py-3 px-3">Email ID</th>
                <th className="py-3 px-3">Mobile No</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Percentage (%)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeptStudents.slice(0, 100).map((stu, idx) => (
                <tr key={`${stu.id}_${idx}`} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300 whitespace-nowrap">{stu.rollNo || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300 whitespace-nowrap">{stu.universityRollNo || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">{stu.samsRegNo || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-100 whitespace-nowrap">{stu.name}</td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.parentName || 'N/A'}</td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{stu.motherName || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono text-sky-400 whitespace-nowrap">{stu.email || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 whitespace-nowrap">{stu.mobileNumber || stu.phone || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{stu.category}</td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-amber-400 text-sm">{stu.marksPercentage}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleOpenEditHodStudent(stu)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold flex items-center justify-center mx-auto transition"
                      title="Edit University Roll No, Email & Student Details"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOD Student Edit Modal */}
      {isHodStudentModalOpen && editingHodStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-amber-400" />
                Edit Student Details (HOD Privilege)
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
                  disabled
                  value={hodStudentForm.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
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
                    University Roll Number <span className="text-amber-400 text-[10px] font-normal">(Editable)</span>
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
                  <label className="text-slate-300 block mb-1 font-semibold">Email ID</label>
                  <input
                    type="email"
                    value={hodStudentForm.email}
                    placeholder="student@gmail.com"
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sky-300 font-mono focus:outline-none focus:border-amber-500"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="tel"
                    value={hodStudentForm.mobileNumber}
                    onChange={(e) => setHodStudentForm({ ...hodStudentForm, mobileNumber: e.target.value, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
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

    </div>
  );
};
