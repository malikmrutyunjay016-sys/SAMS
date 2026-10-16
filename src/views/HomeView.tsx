import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Award, Bell, BookOpen, ChevronRight, FileText, Globe, GraduationCap, Search, ShieldCheck, UserCheck, Users, HelpCircle } from 'lucide-react';

export const HomeView: React.FC<{
  onNavigateTab: (tab: any) => void;
  onOpenProspectus: () => void;
  onOpenAdminModal: () => void;
}> = ({ onNavigateTab, onOpenProspectus, onOpenAdminModal }) => {
  const { notices, systemSettings, seatMatrix, t, lang } = useData();
  const [searchNotice, setSearchNotice] = useState('');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('ALL');

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


      {/* AEDP Feature Section: Apprenticeship Embedded Degree Programme */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase inline-flex items-center">
                <Award className="w-3.5 h-3.5 mr-1" /> DHE Odisha Flagship Initiative
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                NEP 2020 &bull; UGC Guidelines
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-serif">
              Apprenticeship Embedded Degree Programme (AEDP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Panchayat College Baragada offers Odisha Government-sanctioned AEDP courses that combine conventional honours degrees with <strong>a mandatory 1-year paid on-the-job industrial apprenticeship</strong> in the 3rd year. Students earn a <strong>monthly stipend</strong> and graduate with degrees officially certified by the Higher Education Department as <strong>100% equivalent to regular degrees</strong> for PG/Master&apos;s and Ph.D. admissions across all universities.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('seats')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs flex items-center shadow-lg transition"
            >
              <BookOpen className="w-4 h-4 mr-1.5" /> Explore AEDP Seat Matrix
            </button>
            <button
              onClick={onOpenProspectus}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center transition"
            >
              <FileText className="w-4 h-4 mr-1.5" /> AEDP Prospectus Guidelines
            </button>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">1-Year Apprenticeship</span>
            <p className="text-xs text-slate-300">
              Structured on-the-job industrial exposure in 3rd year with leading corporate, biotech, banking & IT partners.
            </p>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">Monthly Stipend</span>
            <p className="text-xs text-slate-300">
              Students receive a monthly stipend during the 1-year apprenticeship under national & state apprenticeship schemes.
            </p>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">100% UG Degree Equivalence</span>
            <p className="text-xs text-slate-300">
              Recognized for PG/M.A./M.Sc./M.Com., Ph.D. research, and UPSC/OPSC public service exams identically to regular degrees.
            </p>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">SAMS Central Admission</span>
            <p className="text-xs text-slate-300">
              Apply via Common Admission Form (CAF) at <span className="text-amber-400 font-mono">samsodisha.gov.in</span> with standard merit quotas.
            </p>
          </div>
        </div>

        {/* Course Tags */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2">
            8 Sanctioned AEDP Courses at Panchayat College Baragada:
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              B.A in Economics &amp; Data Analytics (16 Seats)
            </span>
            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              B.A in English &amp; Digital Humanities (16 Seats)
            </span>
            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              B.A in History &amp; Tourism/Hospitality (16 Seats)
            </span>
            <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              B.Com in Banking, Finance &amp; Insurance (BFSI) (64 Seats)
            </span>
            <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              B.Sc in Botany with Tissue Culture &amp; Vertical Gardening (16 Seats)
            </span>
            <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              B.Sc in Zoology &amp; Integrative Bioscience (16 Seats)
            </span>
            <span className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-1 rounded-lg">
              B.Sc in Chemistry &amp; Industrial Chemistry (16 Seats)
            </span>
            <span className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-1 rounded-lg">
              B.Sc in Mathematics &amp; Computing (16 Seats)
            </span>
          </div>
        </div>
      </div>

      {/* Main Section: Official Notice Board */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Notice Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
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

      </div>

    </div>
  );
};
