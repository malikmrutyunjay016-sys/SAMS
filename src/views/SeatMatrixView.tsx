import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BookOpen, CheckCircle, Sparkles, AlertCircle, Filter, ArrowRight } from 'lucide-react';

export const SeatMatrixView: React.FC<{ onNavigateSpot: () => void }> = ({ onNavigateSpot }) => {
  const { seatMatrix, students } = useData();
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
            <span>SAMS PANCHAYAT COLLEGE, BARAGADA &bull; INTAKE MATRIX</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> Live Synced with Student DB ({students.length} Records)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Sanctioned Seat Matrix & AEDP Specialization Courses
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official 28 Honours & AEDP intake matrix across Arts, Biological Science, Commerce, Physical Science & Self Financing.
          </p>
        </div>

        <button
          onClick={onNavigateSpot}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0"
        >
          Check Spot Round Vacancies <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>

      {/* AEDP Highlight Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-5 rounded-2xl text-xs space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Government Skill Enhancement Initiative
          </span>
          <span className="text-slate-400 font-mono">DHE Odisha AEDP Scheme</span>
        </div>
        <h3 className="text-sm font-bold text-white">
          AEDP (Academic Excellence & Skill Development Program) Specializations
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Panchayat College Baragada offers specialized AEDP seats across faculties: <strong>B.A in Economics and data analytics</strong>, <strong>B.A in English and Translation & digital humanities</strong>, <strong>B.A in History with Tourism and Hospitality Operations</strong>, <strong>B.SC in Botany with Tissue culture and vertical gardening</strong>, <strong>B.SC in Zoology and integrative bioscience</strong>, <strong>B.Com in Banking, Financial Services and Insurance</strong>, <strong>B.SC in Chemistry and Industrial Chemistry</strong>, and <strong>B.Sc. in Mathematics & Computing</strong>.
        </p>
      </div>

      {/* Filters & Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-semibold">Stream:</span>
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
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-semibold">Course Type:</span>
            {[
              { id: 'ALL', label: 'All Courses' },
              { id: 'REGULAR', label: 'Regular Honours' },
              { id: 'AEDP', label: 'AEDP Specializations' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedType === t.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Sanctioned</span>
            <span className="text-lg font-bold text-white">{totalSanctioned}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Admitted</span>
            <span className="text-lg font-bold text-emerald-400">{totalAdmitted}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Vacant</span>
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
                <th className="py-3.5 px-4">Subject / Department</th>
                <th className="py-3.5 px-4">Stream</th>
                <th className="py-3.5 px-4">Type / Specialization</th>
                <th className="py-3.5 px-4 text-center">Sanctioned</th>
                <th className="py-3.5 px-4 text-center">Admitted</th>
                <th className="py-3.5 px-4 text-center">Vacant Seats</th>
                <th className="py-3.5 px-4 text-center">Intake Status Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMatrix.map((item) => {
                const percentFilled = Math.round((item.admitted / item.sanctioned) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center">
                      {item.deptName}
                      {item.isAedp && (
                        <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                          AEDP
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.stream}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {item.specialization || (item.isAedp ? 'AEDP Specialization' : 'Regular Honours')}
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
                          <span>{percentFilled}% Filled</span>
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
