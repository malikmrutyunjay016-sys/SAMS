import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { normalizeCategory } from '../lib/excelParser';
import { translateStream, translateDepartment } from '../lib/translations';
import { StreamType } from '../types';
import {
  BarChart3,
  Users,
  Award,
  ShieldCheck,
  PieChart,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

interface StreamConfig {
  name: StreamType;
  degreeLabel: string;
  themeColor: string;
  badgeBg: string;
  textColor: string;
  barColor: string;
  borderColor: string;
}

const STREAM_CONFIGS: StreamConfig[] = [
  {
    name: 'Arts',
    degreeLabel: '+3 B.A Degree',
    themeColor: 'from-purple-500/20 to-purple-600/10',
    badgeBg: 'bg-purple-500/20',
    textColor: 'text-purple-300',
    barColor: 'bg-purple-500',
    borderColor: 'border-purple-500/30',
  },
  {
    name: 'Biological Science',
    degreeLabel: '+3 B.Sc Bio-Science',
    themeColor: 'from-emerald-500/20 to-emerald-600/10',
    badgeBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-300',
    barColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  {
    name: 'Commerce',
    degreeLabel: '+3 B.Com Degree',
    themeColor: 'from-blue-500/20 to-blue-600/10',
    badgeBg: 'bg-blue-500/20',
    textColor: 'text-blue-300',
    barColor: 'bg-blue-500',
    borderColor: 'border-blue-500/30',
  },
  {
    name: 'Physical Science',
    degreeLabel: '+3 B.Sc Physical Science',
    themeColor: 'from-teal-500/20 to-teal-600/10',
    badgeBg: 'bg-teal-500/20',
    textColor: 'text-teal-300',
    barColor: 'bg-teal-500',
    borderColor: 'border-teal-500/30',
  },
  {
    name: 'Self Financing',
    degreeLabel: '+3 B.Sc (Hons) Self-Financing',
    themeColor: 'from-rose-500/20 to-rose-600/10',
    badgeBg: 'bg-rose-500/20',
    textColor: 'text-rose-300',
    barColor: 'bg-rose-500',
    borderColor: 'border-rose-500/30',
  },
];

export const StatsView: React.FC = () => {
  const { students, seatMatrix, t, lang } = useData();
  const [expandedStream, setExpandedStream] = useState<string | null>(null);

  const availableSessions = Array.from(
    new Set(['2026-27', '2025-26', '2024-25', ...students.map((s) => s.academicYear || '2026-27'), ...seatMatrix.map((m) => m.academicYear || '2026-27')])
  ).sort().reverse();
  const [selectedSession, setSelectedSession] = useState<string>('2026-27');

  const filteredStudents = selectedSession === 'ALL'
    ? students
    : students.filter((s) => (s.academicYear || '2026-27') === selectedSession);

  const matchedSeatMatrix = selectedSession === 'ALL'
    ? seatMatrix
    : seatMatrix.filter((item) => (item.academicYear || '2026-27') === selectedSession);
  const effectiveSeatMatrix = matchedSeatMatrix.length > 0
    ? matchedSeatMatrix
    : seatMatrix.filter((item) => !item.academicYear || item.academicYear === '2026-27').map((item) => ({
        ...item,
        id: item.id.startsWith('dept_') ? item.id : `dept_${selectedSession}_${item.id}`,
        academicYear: selectedSession === 'ALL' ? '2026-27' : selectedSession,
      }));

  // Compute session-wise admitted counts for seatMatrix
  const regularCounts = new Map<string, number>();
  const aedpCounts = new Map<string, number>();
  filteredStudents.forEach((s) => {
    const d = (s.department || '').toLowerCase().trim();
    if (s.isAedp) {
      aedpCounts.set(d, (aedpCounts.get(d) || 0) + 1);
    } else {
      regularCounts.set(d, (regularCounts.get(d) || 0) + 1);
    }
  });

  const sessionSeatMatrix = effectiveSeatMatrix.map((item) => {
    const mDept = (item.deptName || '').toLowerCase().trim();
    const targetMap = item.isAedp ? aedpCounts : regularCounts;
    let admittedCount = targetMap.get(mDept) || 0;
    if (admittedCount === 0) {
      for (const [sDept, count] of targetMap.entries()) {
        if (sDept.includes(mDept) || mDept.includes(sDept)) {
          admittedCount += count;
        }
      }
    }
    const vacantCount = Math.max(0, item.sanctioned - admittedCount);
    return {
      ...item,
      admitted: admittedCount,
      vacant: vacantCount,
    };
  });

  // Totals computed directly from live Subjects & Seats Matrix for selected session
  const totalSanctioned = sessionSeatMatrix.reduce((a, b) => a + (b.sanctioned || 0), 0);
  const totalAdmitted = sessionSeatMatrix.reduce((a, b) => a + (b.admitted || 0), 0);
  const totalVacant = sessionSeatMatrix.reduce((a, b) => a + (b.vacant || 0), 0);
  const overallFillPercent = totalSanctioned > 0 ? ((totalAdmitted / totalSanctioned) * 100).toFixed(1) : '0.0';

  // AEDP Specializations from Subjects & Seats Matrix
  const aedpItems = sessionSeatMatrix.filter((item) => item.isAedp);
  const aedpSanctioned = aedpItems.reduce((a, b) => a + (b.sanctioned || 0), 0);
  const aedpAdmitted = aedpItems.reduce((a, b) => a + (b.admitted || 0), 0);

  // Student database demographics for selected session
  const totalStudents = filteredStudents.length;
  const femaleCount = filteredStudents.filter((s) => s.gender === 'Female').length;
  const maleCount = filteredStudents.filter((s) => s.gender === 'Male').length;
  const femalePercent = totalStudents > 0 ? ((femaleCount / totalStudents) * 100).toFixed(1) : '0.0';

  // Category Distribution normalized
  const genCount = filteredStudents.filter((s) => normalizeCategory(s.category) === 'GEN').length;
  const scCount = filteredStudents.filter((s) => normalizeCategory(s.category) === 'SC').length;
  const stCount = filteredStudents.filter((s) => normalizeCategory(s.category) === 'ST').length;
  const sebcCount = filteredStudents.filter((s) => normalizeCategory(s.category) === 'SEBC').length;

  // Stream-wise Analytics synchronized directly with Subjects & Seats Matrix
  const streamStats = STREAM_CONFIGS.map((config) => {
    const streamItems = sessionSeatMatrix.filter((item) => item.stream === config.name);
    const sanctioned = streamItems.reduce((a, b) => a + (b.sanctioned || 0), 0);
    const admitted = streamItems.reduce((a, b) => a + (b.admitted || 0), 0);
    const vacant = streamItems.reduce((a, b) => a + (b.vacant || 0), 0);
    const fillPercent = sanctioned > 0 ? ((admitted / sanctioned) * 100).toFixed(1) : '0.0';
    const collegeShare = totalAdmitted > 0 ? ((admitted / totalAdmitted) * 100).toFixed(1) : '0.0';

    return {
      ...config,
      items: streamItems,
      deptsCount: streamItems.length,
      sanctioned,
      admitted,
      vacant,
      fillPercent,
      collegeShare,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'or' ? 'ସାମ୍ସ ଜନସଂଖ୍ୟା ଓ ନାମଲେଖା ପରିସଂଖ୍ୟାନ' : 'SAMS DEMOGRAPHIC & ENROLLMENT ANALYTICS'}</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> {lang === 'or' ? 'ବିଷୟ ଓ ସିଟ୍ ସହିତ ସିଙ୍କ୍' : 'Synced with Subjects & Seats'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            {t.statsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'or'
              ? `କଳା, ଜୈବ ବିଜ୍ଞାନ, ବାଣିଜ୍ୟ, ଭୌତିକ ବିଜ୍ଞାନ ଓ ସ୍ୱୟଂ ପୋଷିତ ସମସ୍ତ 5 ଶାଖା ଏବଂ ${seatMatrix.length} ବିଭାଗର ଲାଇଭ୍ ତଥ୍ୟ।`
              : `Live synchronized metrics across all 5 academic streams (Arts, Biological Science, Commerce, Physical Science & Self Financing) and ${seatMatrix.length} sanctioned departments.`}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">{lang === 'or' ? 'ସିଟ୍ ପୂରଣ ହାର' : 'Intake Capacity Fill'}</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {totalAdmitted} / {totalSanctioned} ({overallFillPercent}%)
          </span>
        </div>
      </div>

      {/* Academic Session Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium font-mono uppercase text-[11px]">{lang === 'or' ? 'ଅଧିବେଶନ (Academic Session):' : 'Academic Session:'}</span>
          {availableSessions.map((session) => (
            <button
              key={session}
              onClick={() => setSelectedSession(session)}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                selectedSession === session
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {session === 'ALL' ? (lang === 'or' ? 'ସମସ୍ତ ଅଧିବେଶନ' : 'All Sessions') : `${session} ${session === '2026-27' ? (lang === 'or' ? '(ଚଳିତ)' : '(Current)') : ''}`}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
          {lang === 'or' ? `ଅଧିବେଶନ ${selectedSession}: ${filteredStudents.length} ଛାତ୍ରଛାତ୍ରୀ ରେକର୍ଡ` : `Session ${selectedSession}: ${filteredStudents.length} Scholars Recorded`}
        </span>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{lang === 'or' ? 'ମୋଟ ନାମଲେଖା (ସିଟ୍ ମ୍ୟାଟ୍ରିକ୍ସ)' : 'Enrolled from Subjects & Seats'}</span>
          <div className="text-3xl font-extrabold text-white font-mono">{totalAdmitted} {lang === 'or' ? 'ଛାତ୍ରଛାତ୍ରୀ' : 'Scholars'}</div>
          <p className="text-xs text-emerald-400 flex items-center font-mono">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {overallFillPercent}% of {totalSanctioned} {lang === 'or' ? 'ମଞ୍ଜୁର ସିଟ୍' : 'Sanctioned'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.femaleRatio}</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{femalePercent}% {lang === 'or' ? 'ଛାତ୍ରୀ' : 'Female'}</div>
          <p className="text-xs text-slate-400 font-mono">
            {femaleCount} {lang === 'or' ? 'ଛାତ୍ରୀ' : 'Female'} / {maleCount} {lang === 'or' ? 'ଛାତ୍ର' : 'Male'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.aedpScholars}</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{aedpAdmitted} {lang === 'or' ? 'ନାମଲେଖା' : 'Enrolled'}</div>
          <p className="text-xs text-slate-400 font-mono">
            {aedpItems.length} {lang === 'or' ? 'ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମ' : 'Specialized Courses'} ({aedpSanctioned} {lang === 'or' ? 'ସିଟ୍' : 'Seats'})
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{lang === 'or' ? 'ଖାଲିଥିବା ସିଟ୍' : 'Total Available Vacancies'}</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{totalVacant} {lang === 'or' ? 'ସିଟ୍' : 'Seats'}</div>
          <p className="text-xs text-slate-400 font-mono">{lang === 'or' ? `${seatMatrix.length} ବିଭାଗରେ ସ୍ପଟ୍ ରାଉଣ୍ଡ ଯୋଗ୍ୟ` : `Across ${seatMatrix.length} Depts (Spot Round Eligible)`}</p>
        </div>
      </div>

      {/* Main Analytics: Academic Stream Enrollment vs Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Stream Breakdown synced with Subjects & Seats */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center">
                <PieChart className="w-4 h-4 mr-2 text-amber-400" />
                {t.streamAnalytics}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'or' ? 'ସମସ୍ତ ୫ ଶାଖାରେ ଲାଇଭ୍ ନାମଲେଖା, ମଞ୍ଜୁର ସିଟ୍ ଓ ପୂରଣ ହାର।' : 'Live enrolled scholars, sanctioned strength, and intake progress across all 5 official streams.'}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {lang === 'or' ? `୫ ଶାଖା • ${seatMatrix.length} ବିଭାଗ` : `5 Streams • ${seatMatrix.length} Depts`}
            </span>
          </div>

          <div className="space-y-4">
            {streamStats.map((st) => {
              const isExpanded = expandedStream === st.name;
              return (
                <div
                  key={st.name}
                  className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${st.badgeBg} ${st.textColor} ${st.borderColor}`}>
                        {translateStream(st.name, lang)}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{st.degreeLabel}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({st.deptsCount} {lang === 'or' ? 'ବିଭାଗ' : 'Depts'})</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-white font-mono font-bold text-sm">
                        {st.admitted} <span className="text-[11px] font-normal text-slate-400">/ {st.sanctioned}</span>
                      </span>
                      <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded ${st.badgeBg} ${st.textColor} border ${st.borderColor}`}>
                        {st.fillPercent}% {t.percentSeatsFilled}
                      </span>
                      <button
                        onClick={() => setExpandedStream(isExpanded ? null : st.name)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title={isExpanded ? 'Collapse courses' : 'View courses'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`${st.barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, parseFloat(st.fillPercent))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>{st.fillPercent}% {lang === 'or' ? `ଶାଖା ସିଟ୍ ପୂରଣ (${st.sanctioned} ରୁ ${st.admitted} ସିଟ୍)` : `Stream Seats Filled (${st.admitted} of ${st.sanctioned} seats)`}</span>
                      <span className={st.vacant > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {st.vacant} {lang === 'or' ? 'ଖାଲି ସିଟ୍' : 'Vacant Seats'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Courses List */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
                      <div className="text-[10px] uppercase font-mono text-slate-400 mb-2">
                        {lang === 'or' ? `${translateStream(st.name, lang)} ଶାଖାର ମଞ୍ଜୁରପ୍ରାପ୍ତ ବିଷୟ:` : `Sanctioned Honours & Specializations in ${st.name}:`}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {st.items.map((c) => (
                          <div
                            key={c.id}
                            className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center justify-between"
                          >
                            <div className="truncate mr-2">
                              <span className="font-medium text-slate-200 block truncate text-[11px]">
                                {translateDepartment(c.deptName, lang)}
                              </span>
                              {c.isAedp && (
                                <span className="text-[9px] text-emerald-400 font-mono">{lang === 'or' ? 'ଏଇଡିପି ସ୍ୱତନ୍ତ୍ର' : 'AEDP Specialization'}</span>
                              )}
                            </div>
                            <div className="text-right shrink-0 font-mono text-[11px]">
                              <span className="text-emerald-400 font-bold">{c.admitted}</span>
                              <span className="text-slate-500"> / {c.sanctioned}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reservation Quotas & Demographics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Reservation Quotas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
              {lang === 'or' ? 'ଓଡ଼ିଶା ସଂରକ୍ଷଣ କୋଟା ବଣ୍ଟନ' : 'Odisha Reservation Quota Distribution'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'or' ? 'ସାମ୍ସ ଓଡ଼ିଶା ସରକାରୀ ସଂରକ୍ଷଣ ନିୟମ ଅନୁସାରେ ଛାତ୍ରଛାତ୍ରୀ ବଣ୍ଟନ।' : 'Demographic classification based on official Odisha SAMS reservation norms.'}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block font-mono">{lang === 'or' ? 'ସାଧାରଣ ବର୍ଗ (GEN)' : 'GENERAL CATEGORY'}</span>
                <span className="text-2xl font-bold text-white font-mono">{genCount}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {totalStudents > 0 ? ((genCount / totalStudents) * 100).toFixed(1) : '0.0'}% {lang === 'or' ? 'ମୋଟର' : 'of total'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block font-mono">{lang === 'or' ? 'ଅନୁସୂଚିତ ଜାତି (SC)' : 'SCHEDULED CASTE (SC)'}</span>
                <span className="text-2xl font-bold text-amber-400 font-mono">{scCount}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {totalStudents > 0 ? ((scCount / totalStudents) * 100).toFixed(1) : '0.0'}% {lang === 'or' ? 'ମୋଟର' : 'of total'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block font-mono">{lang === 'or' ? 'ଅନୁସୂଚିତ ଜନଜାତି (ST)' : 'SCHEDULED TRIBE (ST)'}</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">{stCount}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {totalStudents > 0 ? ((stCount / totalStudents) * 100).toFixed(1) : '0.0'}% {lang === 'or' ? 'ମୋଟର' : 'of total'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block font-mono">{lang === 'or' ? 'ଏସଇବିସି / ଓବିସି (SEBC)' : 'SEBC / OBC'}</span>
                <span className="text-2xl font-bold text-blue-400 font-mono">{sebcCount}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {totalStudents > 0 ? ((sebcCount / totalStudents) * 100).toFixed(1) : '0.0'}% {lang === 'or' ? 'ମୋଟର' : 'of total'}
                </span>
              </div>
            </div>
          </div>

          {/* Apprenticeship Embedded Degree Programme (AEDP) Highlight Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'or' ? 'ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ ଓଡ଼ିଶା • ଏଇଡିପି (AEDP) ଯୋଜନା' : 'DHE ODISHA • APPRENTICESHIP EMBEDDED DEGREE (AEDP)'}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{t.aedpFlagshipTitle}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'or'
                ? 'ଜାତୀୟ ଶିକ୍ଷାନୀତି (NEP 2020) ଆଧାରିତ ସ୍ନାତକ ଡିଗ୍ରୀ, ଯେଉଁଥିରେ ନିୟମିତ ଅନର୍ସ ସହିତ ୩ୟ ବର୍ଷରେ ୧-ବର୍ଷର ବାଧ୍ୟତାମୂଳକ ବେତନଯୁକ୍ତ ଶିଳ୍ପ ଶିକ୍ଷାନବିଶୀ ମିଳେ। ଛାତ୍ରଛାତ୍ରୀ ମାସିକ ଷ୍ଟାଇପେଣ୍ଡ୍ ପାଆନ୍ତି ଏବଂ ଏହା ସାଧାରଣ ଡିଗ୍ରୀ ସହ ୧୦୦% ସମତୁଲ୍ୟ।'
                : "NEP 2020 aligned UG degree combining regular Honours with a mandatory 1-year paid industrial apprenticeship in the 3rd year. Students earn a monthly stipend and graduate with degrees officially certified as 100% equivalent to conventional UG degrees for Master's/Ph.D. admissions."}
            </p>
            <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-mono">{lang === 'or' ? 'ଏଇଡିପି ନାମଲେଖା' : 'AEDP Enrolled'}</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{aedpAdmitted} {lang === 'or' ? 'ଛାତ୍ରଛାତ୍ରୀ' : 'Scholars'}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-mono">{lang === 'or' ? 'ମଞ୍ଜୁରପ୍ରାପ୍ତ ସିଟ୍' : 'AEDP Sanctioned'}</span>
                <span className="text-base font-bold text-white font-mono">{aedpSanctioned} {lang === 'or' ? 'ସିଟ୍' : 'Seats'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
