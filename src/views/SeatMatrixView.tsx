import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { translateStream, translateDepartment } from '../lib/translations';
import { BookOpen, CheckCircle, Sparkles, AlertCircle, Filter, ArrowRight } from 'lucide-react';

export const SeatMatrixView: React.FC<{ onNavigateSpot: () => void }> = ({ onNavigateSpot }) => {
  const { seatMatrix, students, t, lang } = useData();
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredMatrix = seatMatrix.filter((item) => {
    const matchesStream =
      selectedStream === 'ALL' ||
      item.stream === selectedStream ||
      (selectedStream === 'Science' && (item.stream === 'Physical Science' || item.stream === 'Biological Science'));
    const matchesType =
      selectedType === 'ALL' ||
      (selectedType === 'AEDP' && item.isAedp) ||
      (selectedType === 'REGULAR' && !item.isAedp);
    return matchesStream && matchesType;
  });

  const totalSanctioned = filteredMatrix.reduce((a, b) => a + b.sanctioned, 0);
  const totalAdmitted = filteredMatrix.reduce((a, b) => a + b.admitted, 0);
  const totalVacant = filteredMatrix.reduce((a, b) => a + b.vacant, 0);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'or' ? 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼ • ସିଟ୍ ମ୍ୟାଟ୍ରିକ୍ସ' : 'SAMS PANCHAYAT COLLEGE, BARAGADA • INTAKE MATRIX'}</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> {lang === 'or' ? `ଛାତ୍ର ଡାଟାବେସ୍ ସହ ଲାଇଭ୍ ସିଙ୍କ୍ (${students.length} ରେକର୍ଡ)` : `Live Synced with Student DB (${students.length} Records)`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            {lang === 'or' ? 'ମଞ୍ଜୁରପ୍ରାପ୍ତ ସିଟ୍ ମ୍ୟାଟ୍ରିକ୍ସ ଓ ଏଇଡିପି (AEDP) ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମ' : 'Sanctioned Seat Matrix & AEDP Specialization Courses'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'or' ? 'କଳା, ଜୈବ ବିଜ୍ଞାନ, ବାଣିଜ୍ୟ, ଭୌତିକ ବିଜ୍ଞାନ ଓ ସ୍ୱୟଂ ପୋଷିତ ଶାଖାର ଅଫିସିଆଲ୍ ୨୮ ଟି ଅନର୍ସ ଓ ଏଇଡିପି ସିଟ୍ ବିବରଣୀ।' : 'Official 28 Honours & AEDP intake matrix across Arts, Biological Science, Commerce, Physical Science & Self Financing.'}
          </p>
        </div>

        <button
          onClick={onNavigateSpot}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0"
        >
          {lang === 'or' ? 'ସ୍ପଟ୍ ଖାଲି ସିଟ୍ ଯାଞ୍ଚ କରନ୍ତୁ' : 'Check Spot Round Vacancies'} <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>

      {/* AEDP Official Odisha Initiative Showcase Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 rounded-2xl text-xs space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> DHE Odisha & UGC Initiative
            </span>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono">
              NEP 2020 Aligned
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            SAMS Portal Admission &bull; 100% Equivalent to Conventional UG Degrees
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-white font-serif flex items-center">
            Apprenticeship Embedded Degree Programme (AEDP)
          </h3>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            The Government of Odisha (Department of Higher Education) has introduced the <strong>Apprenticeship Embedded Degree Programme (AEDP)</strong> to integrate academic honours degree education with <strong>a mandatory 1-year paid on-the-job industrial apprenticeship</strong>. Students receive a <strong>monthly stipend</strong> during their 3rd year apprenticeship, graduate with hands-on industrial expertise, and hold a degree recognized as fully equivalent to conventional +3 degrees for PG/Master's and Ph.D. admissions across all universities.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">1. 1-Year Paid Apprenticeship</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Structured on-the-job industrial training in the final year with reputed corporate and research partners.
            </p>
          </div>
          <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">2. Monthly Stipend</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Enrolled scholars receive a monthly stipend during their apprenticeship under NAPS / industry partnership norms.
            </p>
          </div>
          <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">3. 100% UG Equivalency</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Odisha Govt. directive ensures AEDP degrees have identical eligibility for M.A, M.Sc, M.Com, Ph.D. & competitive exams.
            </p>
          </div>
          <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">4. SAMS Central Admission</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Admissions conducted via SAMS Odisha Common Admission Form (CAF) with standard merit & reservation quotas.
            </p>
          </div>
        </div>

        {/* 8 Course Specializations Grid */}
        <div className="pt-1 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-2">
            Sanctioned AEDP Specializations at Panchayat College Baragada:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-purple-300 block">B.A Economics & Data Analytics</strong>
              <span className="text-[10px] text-slate-400">Financial Modeling & Analytics</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-purple-300 block">B.A English & Digital Humanities</strong>
              <span className="text-[10px] text-slate-400">Translation & Media Publishing</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-purple-300 block">B.A History & Tourism/Hospitality</strong>
              <span className="text-[10px] text-slate-400">Heritage & Tourism Operations</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-blue-300 block">B.Com Banking, Finance & Insurance</strong>
              <span className="text-[10px] text-slate-400">BFSI Sector Skill Certification</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-emerald-300 block">B.Sc Botany Tissue Culture</strong>
              <span className="text-[10px] text-slate-400">Vertical Gardening & Biotech</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-emerald-300 block">B.Sc Zoology Integrative Bioscience</strong>
              <span className="text-[10px] text-slate-400">Biomedical & Wildlife Labs</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-teal-300 block">B.Sc Chemistry & Industrial Chem</strong>
              <span className="text-[10px] text-slate-400">Pharma QA/QC & Chemical Labs</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <strong className="text-teal-300 block">B.Sc Mathematics & Computing</strong>
              <span className="text-[10px] text-slate-400">Software Algorithms & Python</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-semibold">{t.streamFilter}:</span>
            {['ALL', 'Arts', 'Biological Science', 'Commerce', 'Physical Science', 'Self Financing'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStream(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedStream === s
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {translateStream(s, lang)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-semibold">{t.courseTypeFilter}:</span>
            {[
              { id: 'ALL', label: t.allCourses },
              { id: 'REGULAR', label: t.regularHonours },
              { id: 'AEDP', label: t.aedpSpecializations },
            ].map((typeObj) => (
              <button
                key={typeObj.id}
                onClick={() => setSelectedType(typeObj.id)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedType === typeObj.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {typeObj.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.sanctioned}</span>
            <span className="text-lg font-bold text-white">{totalSanctioned}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.admitted}</span>
            <span className="text-lg font-bold text-emerald-400">{totalAdmitted}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.vacant}</span>
            <span className="text-lg font-bold text-amber-400">{totalVacant}</span>
          </div>
        </div>

      </div>

      {/* Main Seat Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t.subject}</th>
                <th className="py-3.5 px-4">{t.stream}</th>
                <th className="py-3.5 px-4">{t.courseType}</th>
                <th className="py-3.5 px-4 text-center">{t.sanctioned}</th>
                <th className="py-3.5 px-4 text-center">{t.admitted}</th>
                <th className="py-3.5 px-4 text-center">{t.vacant}</th>
                <th className="py-3.5 px-4 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMatrix.map((item) => {
                const percentFilled = Math.round((item.admitted / item.sanctioned) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center">
                      {translateDepartment(item.deptName, lang)}
                      {item.isAedp && (
                        <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                          AEDP
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{translateStream(item.stream, lang)}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {item.specialization || (item.isAedp ? (lang === 'or' ? 'ଏଇଡିପି ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମ' : 'AEDP Specialization') : (lang === 'or' ? 'ନିୟମିତ ଅନର୍ସ' : 'Regular Honours'))}
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
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{percentFilled}% {t.seatsFilled}</span>
                          <span>{item.admitted}/{item.sanctioned}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              percentFilled >= 90 ? 'bg-emerald-500' : percentFilled >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
