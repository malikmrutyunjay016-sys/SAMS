import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Award, Bell, BookOpen, ChevronRight, FileText, Globe, GraduationCap, Search, ShieldCheck, Sparkles, UserCheck, Users, HelpCircle } from 'lucide-react';

export const HomeView: React.FC<{
  onNavigateTab: (tab: any) => void;
  onOpenProspectus: () => void;
  onOpenAdminModal: () => void;
}> = ({ onNavigateTab, onOpenProspectus, onOpenAdminModal }) => {
  const { notices, systemSettings, seatMatrix, t, lang } = useData();
  const [searchNotice, setSearchNotice] = useState('');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('ALL');

  // Interactive Probability Predictor Calculator
  const [calcMarks, setCalcMarks] = useState<string>('82');
  const [calcDept, setCalcDept] = useState<string>('physics_regular');
  const [calcCategory, setCalcCategory] = useState<string>('GEN');
  const [calcResult, setCalcResult] = useState<{ chance: string; color: string; desc: string } | null>(null);

  const handlePredictSeat = (e: React.FormEvent) => {
    e.preventDefault();
    const marks = parseFloat(calcMarks) || 0;
    const deptObj = seatMatrix.find((s) => s.id === calcDept);
    const vacant = deptObj ? deptObj.vacant : 2;

    if (marks >= 85) {
      setCalcResult({
        chance: 'HIGH PROBABILITY OF SELECTION',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        desc: `High chance of securing admission in ${deptObj?.deptName} (${vacant} vacant seats) based on current cut-offs.`,
      });
    } else if (marks >= 70) {
      setCalcResult({
        chance: 'MODERATE / SPOT ROUND SELECTION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        desc: `Eligible for Spot Selection in ${deptObj?.deptName}. Submit physical reporting at Room 12.`,
      });
    } else {
      setCalcResult({
        chance: 'WAITING LIST / AEDP SPECIALIZATION RECOMMENDED',
        color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
        desc: `Consider applying for AEDP Specializations or alternative Arts/Commerce combinations with higher vacancy.`,
      });
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchNotice.toLowerCase()) || (n.content && n.content.toLowerCase().includes(searchNotice.toLowerCase()));
    const matchesCat = selectedNoticeCategory === 'ALL' || n.category === selectedNoticeCategory;
    return matchesSearch && matchesCat;
  });

  const totalSanctioned = seatMatrix.reduce((acc, curr) => acc + curr.sanctioned, 0);
  const totalAdmitted = seatMatrix.reduce((acc, curr) => acc + curr.admitted, 0);
  const totalVacant = seatMatrix.reduce((acc, curr) => acc + curr.vacant, 0);

  return (
    <div className="space-y-10 pb-12">
      
      {/* Hero Banner with Official Odisha Govt Aesthetics */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-950 via-slate-950 to-slate-900 border border-amber-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Backdrop Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-inner">
                <Award className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {t.naacBadge}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                {t.deptDhe}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-serif">
              {t.welcomeTitle} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                {t.collegeName}
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t.welcomeSub}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('spot')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center shadow-xl transition transform hover:-translate-y-0.5"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {t.liveSpotBtn}
              </button>

              <button
                onClick={onOpenProspectus}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-semibold text-xs sm:text-sm flex items-center transition"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.commonProspectus}
              </button>

              <button
                onClick={() => onNavigateTab('seats')}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center transition"
              >
                <BookOpen className="w-4 h-4 mr-2 text-amber-400" />
                {t.checkMatrixBtn}
              </button>
            </div>

          </div>

          {/* Dignitaries & Live Counters Card */}
          <div className="lg:col-span-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4">
            
            {/* Dignitary Profile Card */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full border border-amber-500/50 p-0.5 overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Principal"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-100">Prof. Amarendra Panda</div>
                <div className="text-[10px] text-amber-400">Principal-in-Charge</div>
                <div className="text-[10px] text-slate-400 font-mono">Panchayat College, Baragada</div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
              <span>SAMS Enrollment Live Matrix</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono">LIVE SYNC</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Sanctioned</span>
                <span className="text-xl font-bold text-white">{totalSanctioned}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Admitted</span>
                <span className="text-xl font-bold text-emerald-400">{totalAdmitted}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-center">
              <span className="text-xs text-amber-300 font-medium block">Vacant Seats Available</span>
              <span className="text-2xl font-black text-amber-400">{totalVacant} Seats</span>
              <button
                onClick={() => onNavigateTab('spot')}
                className="mt-2 text-[11px] text-amber-300 hover:text-white underline font-semibold flex items-center justify-center mx-auto"
              >
                Apply / Check Spot Selection <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Interactive Probability Predictor Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-serif">
              Spot Round Seat Selection Probability Calculator
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">SAMS Odisha Cut-Off Algorithm</span>
        </div>

        <form onSubmit={handlePredictSeat} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">+2 Marks Percentage</label>
            <input
              type="number"
              step="0.1"
              required
              value={calcMarks}
              onChange={(e) => setCalcMarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Department</label>
            <select
              value={calcDept}
              onChange={(e) => setCalcDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {seatMatrix.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.deptName} ({s.vacant} vacant)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reservation Category</label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="GEN">GENERAL</option>
              <option value="SC">SC (16.25%)</option>
              <option value="ST">ST (22.5%)</option>
              <option value="SEBC">SEBC (11.25%)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
            >
              Calculate Selection Chance
            </button>
          </div>
        </form>

        {calcResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${calcResult.color}`}>
            <span className="font-extrabold uppercase font-mono block text-sm">{calcResult.chance}</span>
            <p>{calcResult.desc}</p>
          </div>
        )}
      </div>

      {/* Main Section: Official Notice Board & Quick Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Notice Board */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-serif">
                  {lang === 'or' ? 'ଅଫିସିଆଲ୍ ବିଜ୍ଞପ୍ତି ଫଳକ' : 'Official Notice Board & e-Admission Announcements'}
                </h2>
                <p className="text-xs text-slate-400">
                  Updated live by College Administration & Department HODs
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchNotice}
                onChange={(e) => setSearchNotice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{notice.date}</span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm flex items-center">
                  {notice.isImportant && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-ping" title="Important Notice"></span>
                  )}
                  {notice.title}
                </h3>

                {notice.content && (
                  <p className="text-xs text-slate-300 leading-relaxed">{notice.content}</p>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Quick Help Desk & Rules */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> SAMS e-Admission Helpdesk
            </h3>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Admission In-Charge:</span>
                <span className="font-semibold text-slate-200">Dr. R.C. Sahoo</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">e-Admission Counter:</span>
                <span className="font-semibold text-slate-200">Room No. 12</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Helpline Phone:</span>
                <span className="font-semibold text-amber-400">06646-220142</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
