import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateSpotSelectionPDF, generateWordSelectionListDoc } from '../lib/pdfGenerator';
import { UserCheck, Radio, Download, FileText, CheckCircle2, XCircle, Search, Filter, Sparkles, AlertTriangle, Plus, RefreshCw, ShieldCheck } from 'lucide-react';

export const SpotRoundView: React.FC = () => {
  const {
    spotCandidates,
    seatMatrix,
    systemSettings,
    reportSpotCandidate,
    registerSpotCandidate,
    runAutomatedMeritSelection
  } = useData();
  const { role } = useAuth();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedReportedFilter, setSelectedReportedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // New Candidate Registration Form State
  const [newCandName, setNewCandName] = useState('');
  const [newCandSamsReg, setNewCandSamsReg] = useState('');
  const [newCandDept, setNewCandDept] = useState('physics_regular');
  const [newCandCategory, setNewCandCategory] = useState<'GEN' | 'SC' | 'ST' | 'SEBC'>('GEN');
  const [newCandMarks, setNewCandMarks] = useState('84.5');
  const [newCandPhone, setNewCandPhone] = useState('');

  const filteredCandidates = spotCandidates.filter((c) => {
    const matchesDept = selectedDeptFilter === 'ALL' || c.deptId === selectedDeptFilter;
    const matchesReported = selectedReportedFilter === 'ALL' || c.reportedStatus === selectedReportedFilter;
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.samsRegNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesReported && matchesSearch;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName || !newCandSamsReg) return;

    const selectedDeptObj = seatMatrix.find((s) => s.id === newCandDept);

    registerSpotCandidate({
      studentName: newCandName,
      samsRegNo: newCandSamsReg,
      deptId: newCandDept,
      deptName: selectedDeptObj?.deptName || 'Physics',
      stream: selectedDeptObj?.stream || 'Science',
      category: newCandCategory,
      marksPercentage: parseFloat(newCandMarks) || 80.0,
      phone: newCandPhone || '9861000000',
    });

    setShowRegisterModal(false);
    setNewCandName('');
    setNewCandSamsReg('');
  };

  const selectedCandidatesOnly = filteredCandidates.filter((c) => c.selectionStatus === 'Selected');

  if (!systemSettings.spotRoundEnabled && role === 'PUBLIC') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">
          Spot Round Seats Portal Currently Offline / Disabled
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          The SAMS Spot Round Selection Live Reporting Desk is currently turned OFF by the College e-Admission Committee. Please check the official Notice Board for upcoming Spot Phase publication dates.
        </p>
        <div className="pt-2 text-xs font-mono text-amber-400">
          SAMS College Code: 03071302 &bull; Govt. of Odisha
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>SAMS DEGREE e-ADMISSION 2026-27 &bull; LIVE SPOT REPORTING DESK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Spot Round Seats & Live Automated Merit Selection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate reporting counter, automated merit selection algorithm, and downloadable official PDF/Word selection lists.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runAutomatedMeritSelection()}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Run Automated Merit Selection
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold flex items-center shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Spot Candidate
          </button>
        </div>
      </div>

      {/* Export Options Banner */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Official Formatted Selection Lists for <strong>{filteredCandidates.length} Candidates</strong> (
            <span className="text-amber-400 font-bold">{selectedCandidatesOnly.length} Provisionally Selected</span>)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => generateSpotSelectionPDF(filteredCandidates, seatMatrix)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center transition"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF Selection List
          </button>

          <button
            onClick={() => generateWordSelectionListDoc(filteredCandidates)}
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center transition"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Download Word List (.doc)
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by candidate name or SAMS Reg No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Departments</option>
            {seatMatrix.map((s) => (
              <option key={s.id} value={s.id}>
                {s.deptName} ({s.vacant} vacant)
              </option>
            ))}
          </select>

          <select
            value={selectedReportedFilter}
            onChange={(e) => setSelectedReportedFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Reporting Status</option>
            <option value="Reported">Reported Only</option>
            <option value="Not Reported">Not Reported Only</option>
          </select>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing <strong>{filteredCandidates.length}</strong> applicants
        </div>

      </div>

      {/* Main Candidate Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-mono">Roll / SAMS Reg. No.</th>
                <th className="py-3.5 px-4">Merit Rank</th>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">+2 Marks %</th>
                <th className="py-3.5 px-4 text-center">Live Reported Status</th>
                <th className="py-3.5 px-4 text-center">Provisional Selection</th>
                <th className="py-3.5 px-4 text-center">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCandidates.map((cand, idx) => (
                <tr key={cand.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{cand.samsRegNo}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    #{cand.waitlistRank || idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">{cand.studentName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{cand.deptName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{cand.category}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-100">
                    {cand.marksPercentage.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center ${
                        cand.reportedStatus === 'Reported'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {cand.reportedStatus === 'Reported' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Reported
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" /> Not Reported
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                        cand.selectionStatus === 'Selected'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : cand.selectionStatus === 'Waiting'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {cand.selectionStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => reportSpotCandidate(cand.id, 'Reported')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          cand.reportedStatus === 'Reported'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Mark Reported
                      </button>
                      <button
                        onClick={() => reportSpotCandidate(cand.id, 'Not Reported')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          cand.reportedStatus === 'Not Reported'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Register Candidate for Spot Round
            </h3>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  placeholder="e.g. Subrata Kumar Behera"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">SAMS Registration Number</label>
                <input
                  type="text"
                  required
                  value={newCandSamsReg}
                  onChange={(e) => setNewCandSamsReg(e.target.value)}
                  placeholder="e.g. 24D11950"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Department</label>
                  <select
                    value={newCandDept}
                    onChange={(e) => setNewCandDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {seatMatrix.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.deptName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category Quota</label>
                  <select
                    value={newCandCategory}
                    onChange={(e) => setNewCandCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">+2 Board Marks %</label>
                  <input
                    type="number"
                    step="0.1"
                    max="100"
                    required
                    value={newCandMarks}
                    onChange={(e) => setNewCandMarks(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCandPhone}
                    onChange={(e) => setNewCandPhone(e.target.value)}
                    placeholder="9437XXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
                >
                  Submit Spot Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
