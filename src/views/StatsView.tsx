import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart3, Users, Award, ShieldCheck, PieChart } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { students, seatMatrix } = useData();

  const totalStudents = students.length;
  const femaleCount = students.filter((s) => s.gender === 'Female').length;
  const maleCount = students.filter((s) => s.gender === 'Male').length;
  const femalePercent = ((femaleCount / totalStudents) * 100).toFixed(1);

  const genCount = students.filter((s) => s.category === 'GEN').length;
  const scCount = students.filter((s) => s.category === 'SC').length;
  const stCount = students.filter((s) => s.category === 'ST').length;
  const sebcCount = students.filter((s) => s.category === 'SEBC').length;

  const scienceCount = students.filter((s) => s.stream === 'Science').length;
  const artsCount = students.filter((s) => s.stream === 'Arts').length;
  const commerceCount = students.filter((s) => s.stream === 'Commerce').length;

  const aedpCount = students.filter((s) => s.isAedp).length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>SAMS DEMOGRAPHIC & ENROLLMENT METRICS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          SAMS Panchayat College Enrollment & Gender Ratio Statistics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time analytics across 1,100+ student records, stream distribution, and Odisha reservation category quotas.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Active Enrollment</span>
          <div className="text-3xl font-extrabold text-white">{totalStudents.toLocaleString()} Students</div>
          <p className="text-xs text-emerald-400">Pre-seeded & synced in SAMS DB</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Gender Balance (Girls Ratio)</span>
          <div className="text-3xl font-extrabold text-amber-400">{femalePercent}% Female</div>
          <p className="text-xs text-slate-400">{femaleCount} Female / {maleCount} Male</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">AEDP Specialization Enrolled</span>
          <div className="text-3xl font-extrabold text-emerald-400">{aedpCount} Scholars</div>
          <p className="text-xs text-slate-400">Skill Development Track</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Sanctioned Stream Intake</span>
          <div className="text-3xl font-extrabold text-blue-400">
            {seatMatrix.reduce((a, b) => a + b.sanctioned, 0)} Seats
          </div>
          <p className="text-xs text-slate-400">Regular + AEDP</p>
        </div>

      </div>

      {/* Visual Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Stream Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-amber-400" /> Enrollment by Academic Stream
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-300">Science Stream (+3 B.Sc)</span>
                <span className="text-slate-200">{scienceCount} ({((scienceCount / totalStudents) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(scienceCount / totalStudents) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-300">Arts Stream (+3 B.A)</span>
                <span className="text-slate-200">{artsCount} ({((artsCount / totalStudents) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(artsCount / totalStudents) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-300">Commerce Stream (+3 B.Com)</span>
                <span className="text-slate-200">{commerceCount} ({((commerceCount / totalStudents) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(commerceCount / totalStudents) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Reservation Quota Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Odisha Reservation Quota Distribution
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">GENERAL CATEGORY</span>
              <span className="text-xl font-bold text-white">{genCount}</span>
              <span className="text-[10px] text-slate-500 block">
                {((genCount / totalStudents) * 100).toFixed(1)}% of total
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">SCHEDULED CASTE (SC)</span>
              <span className="text-xl font-bold text-amber-400">{scCount}</span>
              <span className="text-[10px] text-slate-500 block">
                {((scCount / totalStudents) * 100).toFixed(1)}% of total
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">SCHEDULED TRIBE (ST)</span>
              <span className="text-xl font-bold text-emerald-400">{stCount}</span>
              <span className="text-[10px] text-slate-500 block">
                {((stCount / totalStudents) * 100).toFixed(1)}% of total
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">SEBC / OBC</span>
              <span className="text-xl font-bold text-blue-400">{sebcCount}</span>
              <span className="text-[10px] text-slate-500 block">
                {((sebcCount / totalStudents) * 100).toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
