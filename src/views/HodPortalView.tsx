import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Users, BookOpen, Plus, CheckCircle2, ShieldAlert, LogOut, Bell, Search } from 'lucide-react';

export const HodPortalView: React.FC<{ onOpenHodModal: () => void }> = ({ onOpenHodModal }) => {
  const { students, seatMatrix, faculty, hodAccounts, notices, addNotice } = useData();
  const { isHod, hodDeptId, hodDeptName, logout } = useAuth();

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Admission' | 'Examination' | 'Departmental' | 'Spot Round'>('Departmental');
  const [noticeContent, setNoticeContent] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

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
    s.department.toLowerCase().includes((hodDeptName || '').toLowerCase())
  );

  const filteredDeptStudents = deptStudents.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.samsRegNo.toLowerCase().includes(searchStudent.toLowerCase())
  );

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

  return (
    <div className="space-y-8 pb-12">
      
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
            <Users className="w-4 h-4 mr-2 text-amber-400" /> Department Student Roster ({deptStudents.length} Enrolled)
          </h2>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student name or roll..."
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
                <th className="py-3 px-4">Univ Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">SAMS Reg No</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Marks %</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeptStudents.slice(0, 100).map((stu, idx) => (
                <tr key={`${stu.id}_${idx}`} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{stu.rollNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{stu.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{stu.samsRegNo}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{stu.category}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400">{stu.marksPercentage}%</td>
                  <td className="py-3 px-4 text-slate-400">{stu.bloodGroup}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{stu.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
