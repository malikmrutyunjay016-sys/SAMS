import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, Search, Mail, Phone, Award, Building2, CheckCircle2 } from 'lucide-react';

export const FacultyView: React.FC = () => {
  const { faculty } = useData();
  const [searchFaculty, setSearchFaculty] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchFaculty.toLowerCase()) ||
      f.qualification.toLowerCase().includes(searchFaculty.toLowerCase()) ||
      f.deptName.toLowerCase().includes(searchFaculty.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || f.deptName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(faculty.map((f) => f.deptName)));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Users className="w-4 h-4" />
            <span>ACADEMIC FACULTY DIRECTORY &bull; PANCHAYAT COLLEGE BARAGADA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Professors, Readers & Department Heads (HODs)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Distinguished teaching faculty across Science, Arts, and Commerce streams.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty name..."
              value={searchFaculty}
              onChange={(e) => setSearchFaculty(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((member) => (
          <div
            key={member.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-4 relative overflow-hidden"
          >
            {member.isHod && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center">
                <Award className="w-3 h-3 mr-1" /> HOD
              </div>
            )}

            <div className="flex items-center space-x-4">
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
              />
              <div>
                <h3 className="font-bold text-white text-sm">{member.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">{member.designation}</p>
                <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                  <Building2 className="w-3 h-3 mr-1 text-slate-500" /> Dept of {member.deptName}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
              <div className="text-slate-300 font-medium">{member.qualification}</div>
              <div className="flex items-center text-slate-400 text-[11px]">
                <Mail className="w-3 h-3 mr-1.5 text-amber-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center text-slate-400 text-[11px]">
                <Phone className="w-3 h-3 mr-1.5 text-amber-400 shrink-0" />
                <span>+91 {member.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
