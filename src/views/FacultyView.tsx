import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FacultyMember } from '../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  Award,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  UserPlus,
  RotateCcw
} from 'lucide-react';

export const FacultyView: React.FC = () => {
  const { faculty, addFaculty, updateFaculty, deleteFaculty, loadSampleFaculty, t, lang } = useData();
  const { isAdmin } = useAuth();

  const [searchFaculty, setSearchFaculty] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<FacultyMember | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDeptName, setFormDeptName] = useState('Physics');
  const [formDesignation, setFormDesignation] = useState('Assistant Professor');
  const [formQualification, setFormQualification] = useState('M.Sc., Ph.D.');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formIsHod, setFormIsHod] = useState(false);

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchFaculty.toLowerCase()) ||
      f.qualification.toLowerCase().includes(searchFaculty.toLowerCase()) ||
      f.deptName.toLowerCase().includes(searchFaculty.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || f.deptName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(faculty.map((f) => f.deptName)));

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormName('');
    setFormDeptName('Physics');
    setFormDesignation('Assistant Professor');
    setFormQualification('Ph.D., M.Sc.');
    setFormEmail('');
    setFormPhone('');
    setFormPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setFormIsHod(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FacultyMember) => {
    setEditingFaculty(f);
    setFormName(f.name);
    setFormDeptName(f.deptName);
    setFormDesignation(f.designation);
    setFormQualification(f.qualification);
    setFormEmail(f.email);
    setFormPhone(f.phone);
    setFormPhotoUrl(f.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setFormIsHod(f.isHod);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      deptId: formDeptName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      deptName: formDeptName.trim(),
      designation: formDesignation.trim(),
      qualification: formQualification.trim(),
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@baragada.edu.in`,
      phone: formPhone.trim() || '9437123456',
      photoUrl: formPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHod: formIsHod,
    };

    if (editingFaculty) {
      updateFaculty(editingFaculty.id, payload);
    } else {
      addFaculty(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Users className="w-4 h-4" />
            <span>{lang === 'or' ? 'ଅଫିସିଆଲ୍ ଅଧ୍ୟାପକ ସୂଚୀ • ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ ବରଗଡ଼' : 'ACADEMIC FACULTY DIRECTORY • PANCHAYAT COLLEGE BARAGADA'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            {t.facultyTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.facultySub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 text-xs font-bold flex items-center shadow-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> {lang === 'or' ? 'ନୂତନ ଅଧ୍ୟାପକ ଯୋଡ଼ନ୍ତୁ' : 'Add Faculty Member'}
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchFaculty}
              value={searchFaculty}
              onChange={(e) => setSearchFaculty(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-44 sm:w-56"
            />
          </div>

          {uniqueDepts.length > 0 && (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{t.allDepartments}</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {facultyToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-100 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">
              {lang === 'or' ? 'ଅଧ୍ୟାପକ ରେକର୍ଡ ଡିଲିଟ୍ ନିଶ୍ଚିତ କରନ୍ତୁ' : 'Confirm Delete Faculty Record'}
            </h3>
            <p className="text-slate-400">
              {lang === 'or'
                ? `ଆପଣ ${facultyToDelete.name} ଙ୍କ ରେକର୍ଡ ଡିଲିଟ୍ କରିବାକୁ ନିଶ୍ଚିତ କି?`
                : `Are you sure you want to delete the record for ${facultyToDelete.name}?`}
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setFacultyToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                {lang === 'or' ? 'ବାତିଲ' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteFaculty(facultyToDelete.id);
                  setFacultyToDelete(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
              >
                {lang === 'or' ? 'ଡିଲିଟ୍' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Cards Grid */}
      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                {member.isHod ? (
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center">
                    <Award className="w-3 h-3 mr-1" /> {lang === 'or' ? 'ବିଭାଗୀୟ ମୁଖ୍ୟ (HOD)' : 'HOD Head'}
                  </div>
                ) : (
                  <div></div>
                )}

                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition"
                      title="Edit Faculty Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFacultyToDelete(member)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-red-400 text-xs transition"
                      title="Delete Faculty Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{member.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{member.designation}</p>
                  <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                    <Building2 className="w-3 h-3 mr-1 text-slate-500" /> {lang === 'or' ? `ବିଭାଗ: ${member.deptName}` : `Dept of ${member.deptName}`}
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
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-serif">No Faculty Members Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Faculty data is currently cleared or empty. Administrators can add teaching professors or reload benchmark faculty records.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Faculty Member
              </button>
            )}
            <button
              onClick={loadSampleFaculty}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center shadow"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Load Benchmark Faculty
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center">
                <UserPlus className="w-4 h-4 mr-2 text-amber-400" />
                {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Chandra Sahoo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics"
                    value={formDeptName}
                    onChange={(e) => setFormDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Professor"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Qualification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ph.D. (IIT Kharagpur), M.Sc."
                  value={formQualification}
                  onChange={(e) => setFormQualification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    placeholder="email@baragada.edu.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    placeholder="9437123456"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isHodCheckbox"
                  checked={formIsHod}
                  onChange={(e) => setFormIsHod(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="isHodCheckbox" className="text-slate-200 font-semibold cursor-pointer">
                  Head of Department (HOD)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {editingFaculty ? 'Save Changes' : 'Create Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
