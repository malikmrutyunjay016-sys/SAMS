import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  Globe,
  Search,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Edit3,
  X,
  CheckCircle2,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const HomeView: React.FC<{
  onNavigateTab: (tab: any) => void;
  onOpenProspectus: () => void;
  onOpenAdminModal: () => void;
}> = ({ onNavigateTab, onOpenProspectus, onOpenAdminModal }) => {
  const { notices, systemSettings, seatMatrix, students, t, lang, updateSystemSettings } = useData();
  const { role } = useAuth();
  const [searchNotice, setSearchNotice] = useState('');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('ALL');
  // Custom Redirect Link State
  const [isEditLinkModalOpen, setIsEditLinkModalOpen] = useState<boolean>(false);
  const [editLinkForm, setEditLinkForm] = useState({
    customBannerLinkUrl: systemSettings.customBannerLinkUrl || 'https://samsodisha.gov.in/',
    customBannerLinkLabel: systemSettings.customBannerLinkLabel || 'Visit SAMS Odisha Official Portal',
    customBannerLinkLabelOdia: systemSettings.customBannerLinkLabelOdia || 'ସାମ୍ସ ଓଡ଼ିଶା ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଯାଆନ୍ତୁ',
  });

  // Officials State & Interactive Selector
  const [selectedOfficialIndex, setSelectedOfficialIndex] = useState<number>(0);
  const [viewAllOfficials, setViewAllOfficials] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTab, setEditTab] = useState<'principal' | 'incharge1' | 'incharge2' | 'deo'>('principal');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    principalName: systemSettings.principalName || 'Prof. Amarendra Panda',
    principalNameOdia: systemSettings.principalNameOdia || 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା',
    principalDesignation: systemSettings.principalDesignation || 'Principal-in-Charge | Reader in Physics',
    principalPhone: systemSettings.principalPhone || '06646-230234',
    principalEmail: systemSettings.principalEmail || 'principal.baragada@gmail.com',
    principalPhotoUrl: systemSettings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',

    admissionIncharge1Name: systemSettings.admissionIncharge1Name || 'Dr. Manoranjan Dash',
    admissionIncharge1NameOdia: systemSettings.admissionIncharge1NameOdia || 'ଡଃ ମନୋରଞ୍ଜନ ଦାଶ',
    admissionIncharge1Designation: systemSettings.admissionIncharge1Designation || 'UG Admission In-Charge | Sr. Lecturer in Economics',
    admissionIncharge1Phone: systemSettings.admissionIncharge1Phone || '+91 94371 88201',
    admissionIncharge1Email: systemSettings.admissionIncharge1Email || 'admission.arts.pcb@gmail.com',
    admissionIncharge1PhotoUrl: systemSettings.admissionIncharge1PhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',

    admissionIncharge2Name: systemSettings.admissionIncharge2Name || 'Dr. Sasmita Panigrahi',
    admissionIncharge2NameOdia: systemSettings.admissionIncharge2NameOdia || 'ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ',
    admissionIncharge2Designation: systemSettings.admissionIncharge2Designation || 'UG Admission In-Charge | Sr. Lecturer in Chemistry',
    admissionIncharge2Phone: systemSettings.admissionIncharge2Phone || '+91 94372 65430',
    admissionIncharge2Email: systemSettings.admissionIncharge2Email || 'admission.science.pcb@gmail.com',
    admissionIncharge2PhotoUrl: systemSettings.admissionIncharge2PhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',

    deoName: systemSettings.deoName || 'Sri Rajesh Kumar Meher',
    deoNameOdia: systemSettings.deoNameOdia || 'ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର',
    deoDesignation: systemSettings.deoDesignation || 'Data Entry Operator (DEO) | SAMS Helpdesk & Verification',
    deoPhone: systemSettings.deoPhone || '+91 79780 45129',
    deoEmail: systemSettings.deoEmail || 'deo.sams.pcb@gmail.com',
    deoPhotoUrl: systemSettings.deoPhotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  });

  const handleOpenEditModal = () => {
    if (role === 'SUPER_ADMIN') {
      setEditForm({
        principalName: systemSettings.principalName || 'Prof. Amarendra Panda',
        principalNameOdia: systemSettings.principalNameOdia || 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା',
        principalDesignation: systemSettings.principalDesignation || 'Principal-in-Charge | Reader in Physics',
        principalPhone: systemSettings.principalPhone || '06646-230234',
        principalEmail: systemSettings.principalEmail || 'principal.baragada@gmail.com',
        principalPhotoUrl: systemSettings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',

        admissionIncharge1Name: systemSettings.admissionIncharge1Name || 'Dr. Manoranjan Dash',
        admissionIncharge1NameOdia: systemSettings.admissionIncharge1NameOdia || 'ଡଃ ମନୋରଞ୍ଜନ ଦାଶ',
        admissionIncharge1Designation: systemSettings.admissionIncharge1Designation || 'UG Admission In-Charge | Sr. Lecturer in Economics',
        admissionIncharge1Phone: systemSettings.admissionIncharge1Phone || '+91 94371 88201',
        admissionIncharge1Email: systemSettings.admissionIncharge1Email || 'admission.arts.pcb@gmail.com',
        admissionIncharge1PhotoUrl: systemSettings.admissionIncharge1PhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',

        admissionIncharge2Name: systemSettings.admissionIncharge2Name || 'Dr. Sasmita Panigrahi',
        admissionIncharge2NameOdia: systemSettings.admissionIncharge2NameOdia || 'ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ',
        admissionIncharge2Designation: systemSettings.admissionIncharge2Designation || 'UG Admission In-Charge | Sr. Lecturer in Chemistry',
        admissionIncharge2Phone: systemSettings.admissionIncharge2Phone || '+91 94372 65430',
        admissionIncharge2Email: systemSettings.admissionIncharge2Email || 'admission.science.pcb@gmail.com',
        admissionIncharge2PhotoUrl: systemSettings.admissionIncharge2PhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',

        deoName: systemSettings.deoName || 'Sri Rajesh Kumar Meher',
        deoNameOdia: systemSettings.deoNameOdia || 'ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର',
        deoDesignation: systemSettings.deoDesignation || 'Data Entry Operator (DEO) | SAMS Helpdesk & Verification',
        deoPhone: systemSettings.deoPhone || '+91 79780 45129',
        deoEmail: systemSettings.deoEmail || 'deo.sams.pcb@gmail.com',
        deoPhotoUrl: systemSettings.deoPhotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      });
      setIsEditModalOpen(true);
    } else {
      onOpenAdminModal();
    }
  };

  const handleSaveOfficialsForm = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(editForm);
    setSaveSuccessMsg(lang === 'or' ? 'ଅଧିକାରୀଙ୍କ ବିବରଣୀ ସଫଳତାର ସହ ଅପଡେଟ୍ ହେଲା!' : 'Officials details updated successfully!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setIsEditModalOpen(false);
    }, 1500);
  };

  // Officials List
  const officials = [
    {
      id: 'principal',
      shortTab: lang === 'or' ? 'ଅଧ୍ୟକ୍ଷ' : 'Principal',
      title: t.principalInCharge,
      name: (lang === 'or' ? systemSettings.principalNameOdia : systemSettings.principalName) || (lang === 'or' ? 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା' : 'Prof. Amarendra Panda'),
      designation: systemSettings.principalDesignation || 'Principal-in-Charge | Reader in Physics',
      phone: systemSettings.principalPhone || '06646-230234',
      email: systemSettings.principalEmail || 'principal.baragada@gmail.com',
      photoUrl: systemSettings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: lang === 'or' ? 'ମହାବିଦ୍ୟାଳୟ ମୁଖ୍ୟ' : 'Head of Institution',
    },
    {
      id: 'incharge1',
      shortTab: lang === 'or' ? 'ୟୁ.ଜି. ପ୍ରଭାରୀ' : 'UG In-Charge',
      title: t.admissionIncharge1Title || (lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା ପ୍ରଭାରୀ' : 'UG Admission In-Charge'),
      name: (lang === 'or' ? systemSettings.admissionIncharge1NameOdia : systemSettings.admissionIncharge1Name) || (lang === 'or' ? 'ଡଃ ମନୋରଞ୍ଜନ ଦାଶ' : 'Dr. Manoranjan Dash'),
      designation: systemSettings.admissionIncharge1Designation || 'UG Admission In-Charge | Sr. Lecturer in Economics',
      phone: systemSettings.admissionIncharge1Phone || '+91 94371 88201',
      email: systemSettings.admissionIncharge1Email || 'admission.arts.pcb@gmail.com',
      photoUrl: systemSettings.admissionIncharge1PhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      badgeText: lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା' : 'UG Admission',
    },
    {
      id: 'incharge2',
      shortTab: lang === 'or' ? 'ୟୁ.ଜି. ପ୍ରଭାରୀ' : 'UG In-Charge',
      title: t.admissionIncharge2Title || (lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା ପ୍ରଭାରୀ' : 'UG Admission In-Charge'),
      name: (lang === 'or' ? systemSettings.admissionIncharge2NameOdia : systemSettings.admissionIncharge2Name) || (lang === 'or' ? 'ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ' : 'Dr. Sasmita Panigrahi'),
      designation: systemSettings.admissionIncharge2Designation || 'UG Admission In-Charge | Sr. Lecturer in Chemistry',
      phone: systemSettings.admissionIncharge2Phone || '+91 94372 65430',
      email: systemSettings.admissionIncharge2Email || 'admission.science.pcb@gmail.com',
      photoUrl: systemSettings.admissionIncharge2PhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      badgeText: lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା' : 'UG Admission',
    },
    {
      id: 'deo',
      shortTab: lang === 'or' ? 'ଡି.ଇ.ଓ' : 'DEO Helpdesk',
      title: t.deoTitle || (lang === 'or' ? 'ଡାଟା ଏଣ୍ଟ୍ରି ଅପରେଟର୍ (DEO)' : 'Data Entry Operator (DEO)'),
      name: (lang === 'or' ? systemSettings.deoNameOdia : systemSettings.deoName) || (lang === 'or' ? 'ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର' : 'Sri Rajesh Kumar Meher'),
      designation: systemSettings.deoDesignation || 'Data Entry Operator (DEO) | SAMS Helpdesk & Verification',
      phone: systemSettings.deoPhone || '+91 79780 45129',
      email: systemSettings.deoEmail || 'deo.sams.pcb@gmail.com',
      photoUrl: systemSettings.deoPhotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: lang === 'or' ? 'ଡାଟା ଅପରେଟର୍' : 'Data Entry Operator',
    },
  ];

  const currentOfficial = officials[selectedOfficialIndex] || officials[0];

  const filteredNotices = notices.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchNotice.toLowerCase()) || (n.content && n.content.toLowerCase().includes(searchNotice.toLowerCase()));
    const matchesCat = selectedNoticeCategory === 'ALL' || n.category === selectedNoticeCategory;
    return matchesSearch && matchesCat;
  });

  const activeSessionStudents = students.filter((s) => (s.academicYear || '2026-27') === '2026-27');
  const activeSessionSeatMatrix = seatMatrix.filter((item) => (item.academicYear || '2026-27') === '2026-27');
  const effectiveSeatMatrix = activeSessionSeatMatrix.length > 0 ? activeSessionSeatMatrix : seatMatrix;

  const regularCounts = new Map<string, number>();
  const aedpCounts = new Map<string, number>();
  activeSessionStudents.forEach((s) => {
    const d = (s.department || '').toLowerCase().trim();
    if (s.isAedp) {
      aedpCounts.set(d, (aedpCounts.get(d) || 0) + 1);
    } else {
      regularCounts.set(d, (regularCounts.get(d) || 0) + 1);
    }
  });

  const computedMatrix = effectiveSeatMatrix.map((item) => {
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

  const totalSanctioned = computedMatrix.reduce((acc, curr) => acc + curr.sanctioned, 0);
  const totalAdmitted = computedMatrix.reduce((acc, curr) => acc + curr.admitted, 0);
  const totalVacant = computedMatrix.reduce((acc, curr) => acc + curr.vacant, 0);

  return (
    <div className="space-y-10 pb-12">
      
      {/* Hero Banner with Official Odisha Govt Aesthetics */}
      <div className="hero-banner relative rounded-3xl bg-gradient-to-br from-red-950 via-slate-950 to-slate-900 border border-amber-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Backdrop Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-inner">
                <Award className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {systemSettings.naacGrade || t.naacBadge}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                {lang === 'or'
                  ? (systemSettings.taglineOdia || 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ')
                  : (systemSettings.tagline || t.deptDhe)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-serif drop-shadow-md">
              <span
                className="hero-welcome-title text-white !text-white font-extrabold block tracking-tight"
                style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.75)' }}
              >
                {t.welcomeTitle}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 block mt-1">
                {lang === 'or'
                  ? (systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼')
                  : systemSettings.collegeName}
              </span>
            </h1>

            <p className="hero-welcome-sub text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium" style={{ color: '#e2e8f0' }}>
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
                className="px-5 py-3 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-semibold text-xs sm:text-sm flex items-center transition shadow-lg"
                style={{ backgroundColor: '#0f172a' }}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.commonProspectus}
              </button>

              <button
                onClick={() => onNavigateTab('seats')}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center transition shadow-lg"
                style={{ backgroundColor: '#060b18' }}
              >
                <BookOpen className="w-4 h-4 mr-2 text-amber-400" />
                {t.checkMatrixBtn}
              </button>
            </div>

          </div>

          {/* Dignitaries, 02 Admission In-Charge, DEO & Live Counters Card */}
          <div
            className="lg:col-span-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl space-y-4"
            style={{ backgroundColor: 'rgba(6, 11, 24, 0.92)' }}
          >
            
            {/* Interactive Admission Officials & DEO Card */}
            <div
              className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-3 transition-all"
              style={{ backgroundColor: '#0f172a' }}
            >
              {/* Header with Title and Admin Edit Button */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-serif">
                    {lang === 'or' ? 'ନାମଲେଖା ପ୍ରଶାସନ ଓ ସହାୟତା ଡେସ୍କ' : 'Admission Authority & DEO Desk'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setViewAllOfficials(!viewAllOfficials)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                    title={viewAllOfficials ? 'Show single officer view' : 'View all 4 officers'}
                  >
                    {viewAllOfficials ? (lang === 'or' ? 'ଏକକ ଦେଖନ୍ତୁ' : 'Card View') : (lang === 'or' ? 'ସମସ୍ତ ୪ ଜଣ' : 'View All 4')}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center transition"
                    title={role === 'SUPER_ADMIN' ? 'Edit details of all 4 admission officials' : 'Login as admin to edit official details'}
                  >
                    <Edit3 className="w-2.5 h-2.5 mr-1" />
                    {role === 'SUPER_ADMIN' ? (lang === 'or' ? 'ଏଡିଟ୍' : 'Edit') : (lang === 'or' ? 'ଏଡିଟ୍ (Admin)' : 'Admin Edit')}
                  </button>
                </div>
              </div>

              {/* Selector Tabs (4 Officials) */}
              {!viewAllOfficials && (
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] font-semibold">
                  {officials.map((off, idx) => (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => setSelectedOfficialIndex(idx)}
                      className={`py-1 rounded text-center transition-all truncate px-1 ${
                        selectedOfficialIndex === idx
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                      title={off.title}
                    >
                      {off.shortTab}
                    </button>
                  ))}
                </div>
              )}

              {/* Single Official Selected View */}
              {!viewAllOfficials ? (
                <div className="space-y-2.5 animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full border border-amber-500/60 p-0.5 overflow-hidden shrink-0 shadow-md">
                      <img
                        src={currentOfficial.photoUrl}
                        alt={currentOfficial.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="text-xs flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-100 truncate text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                          {currentOfficial.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${currentOfficial.badgeColor}`}>
                          {currentOfficial.badgeText}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-semibold line-clamp-1 mt-0.5">
                        {currentOfficial.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                        {currentOfficial.designation}
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <a
                        href={`tel:${currentOfficial.phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center transition truncate"
                        title={`Call ${currentOfficial.name} (${currentOfficial.phone})`}
                      >
                        <Phone className="w-3 h-3 mr-1.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{currentOfficial.phone}</span>
                      </a>
                      <a
                        href={`mailto:${currentOfficial.email}`}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] sm:text-[11px] font-mono flex items-center justify-center transition truncate"
                        title={`Email ${currentOfficial.name} (${currentOfficial.email})`}
                      >
                        <Mail className="w-3 h-3 mr-1.5 text-blue-400 shrink-0" />
                        <span className="truncate font-medium">{currentOfficial.email}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact View of All 4 Officials */
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {officials.map((off) => (
                    <div
                      key={off.id}
                      className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-8 h-8 rounded-full border border-amber-500/40 p-0.5 overflow-hidden shrink-0">
                            <img src={off.photoUrl} alt={off.name} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-[11px] truncate" style={{ color: '#ffffff' }}>
                              {off.name}
                            </div>
                            <div className="text-[9px] text-amber-400 truncate">{off.title}</div>
                          </div>
                        </div>
                        <a
                          href={`tel:${off.phone}`}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-[10px] font-mono font-bold shrink-0 flex items-center"
                          title={off.phone}
                        >
                          <Phone className="w-2.5 h-2.5 mr-1" /> Call
                        </a>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                        <Mail className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                        <a href={`mailto:${off.email}`} className="truncate hover:underline">
                          {off.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
              <span>sams enrollment live matrix(academic session 2026-27)</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono">{t.liveSyncBadge}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.sanctioned}</span>
                <span className="text-xl font-bold text-white" style={{ color: '#ffffff' }}>{totalSanctioned}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.admitted}</span>
                <span className="text-xl font-bold text-emerald-400">{totalAdmitted}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-center">
              <span className="text-xs text-amber-300 font-medium block">{t.vacantSeatsAvailable}</span>
              <span className="text-2xl font-black text-amber-400">{totalVacant} {lang === 'or' ? 'ସିଟ୍' : 'Seats'}</span>
            </div>

          </div>

        </div>
      </div>

      {/* Custom Redirect Link Box (Admin Configurable) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center space-x-3 text-slate-200 text-xs sm:text-sm font-medium">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">
              {lang === 'or' ? 'ଅଫିସିଆଲ୍ ନାମଲେଖା ପୋର୍ଟାଲ୍ ଲିଙ୍କ୍' : 'Official e-Admission Redirect Portal'}
            </span>
            <span className="text-slate-400 text-xs font-mono truncate block max-w-md">
              {systemSettings.customBannerLinkUrl || 'https://samsodisha.gov.in/'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={systemSettings.customBannerLinkUrl || 'https://samsodisha.gov.in/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>
              {lang === 'or'
                ? (systemSettings.customBannerLinkLabelOdia || 'ସାମ୍ସ ଓଡ଼ିଶା ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଯାଆନ୍ତୁ')
                : (systemSettings.customBannerLinkLabel || 'Visit SAMS Odisha Official Portal')}
            </span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>

          {role === 'SUPER_ADMIN' ? (
            <button
              type="button"
              onClick={() => {
                setEditLinkForm({
                  customBannerLinkUrl: systemSettings.customBannerLinkUrl || 'https://samsodisha.gov.in/',
                  customBannerLinkLabel: systemSettings.customBannerLinkLabel || 'Visit SAMS Odisha Official Portal',
                  customBannerLinkLabelOdia: systemSettings.customBannerLinkLabelOdia || 'ସାମ୍ସ ଓଡ଼ିଶା ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଯାଆନ୍ତୁ',
                });
                setIsEditLinkModalOpen(true);
              }}
              className="px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center transition shadow"
              title="Edit Link (Admin Only)"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Edit Link</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 text-xs font-medium flex items-center transition"
              title="Login as Admin to edit this link"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Admin Edit</span>
            </button>
          )}
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
                  {lang === 'or' ? 'ଅଫିସିଆଲ୍ ବିଜ୍ଞପ୍ତି ଫଳକ ଓ ଇ-ନାମଲେଖା ସୂଚନା' : 'Official Notice Board & e-Admission Announcements'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'or' ? 'କଲେଜ ପ୍ରଶାସନ ଓ ବିଭାଗୀୟ ମୁଖ୍ୟ (HOD) ମାନଙ୍କ ଦ୍ୱାରା ଲାଇଭ୍ ପ୍ରକାଶିତ' : 'Updated live by College Administration & Department HODs'}
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'or' ? 'ବିଜ୍ଞପ୍ତି ଖୋଜନ୍ତୁ...' : 'Search notices...'}
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

      {/* Admin Quick Edit Officials Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2 text-amber-400">
                <Shield className="w-5 h-5" />
                <h2 className="text-base font-bold text-white font-serif">
                  {lang === 'or' ? 'ନାମଲେଖା ଅଧିକାରୀ ଓ DEO ବିବରଣୀ ସମ୍ପାଦନା' : 'Edit Admission Officials & DEO Details'}
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Officer Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditTab('principal')}
                className={`py-2 px-3 border-b-2 transition ${
                  editTab === 'principal'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🎓 {lang === 'or' ? 'ଅଧ୍ୟକ୍ଷ' : 'Principal'}
              </button>
              <button
                type="button"
                onClick={() => setEditTab('incharge1')}
                className={`py-2 px-3 border-b-2 transition ${
                  editTab === 'incharge1'
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📋 {lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା ପ୍ରଭାରୀ' : 'UG Admission In-Charge'}
              </button>
              <button
                type="button"
                onClick={() => setEditTab('incharge2')}
                className={`py-2 px-3 border-b-2 transition ${
                  editTab === 'incharge2'
                    ? 'border-purple-500 text-purple-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📋 {lang === 'or' ? 'ୟୁ.ଜି. ନାମଲେଖା ପ୍ରଭାରୀ' : 'UG Admission In-Charge'}
              </button>
              <button
                type="button"
                onClick={() => setEditTab('deo')}
                className={`py-2 px-3 border-b-2 transition ${
                  editTab === 'deo'
                    ? 'border-emerald-500 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                💻 {lang === 'or' ? 'ଡି.ଇ.ଓ (DEO Helpdesk)' : 'DEO Helpdesk'}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveOfficialsForm} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {editTab === 'principal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Principal Name (English)</label>
                      <input
                        type="text"
                        value={editForm.principalName}
                        onChange={(e) => setEditForm({ ...editForm, principalName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Principal Name (Odia / ଓଡ଼ିଆ)</label>
                      <input
                        type="text"
                        value={editForm.principalNameOdia}
                        onChange={(e) => setEditForm({ ...editForm, principalNameOdia: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Designation</label>
                    <input
                      type="text"
                      value={editForm.principalDesignation}
                      onChange={(e) => setEditForm({ ...editForm, principalDesignation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.principalPhone}
                        onChange={(e) => setEditForm({ ...editForm, principalPhone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={editForm.principalEmail}
                        onChange={(e) => setEditForm({ ...editForm, principalEmail: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Photo URL</label>
                    <input
                      type="url"
                      value={editForm.principalPhotoUrl}
                      onChange={(e) => setEditForm({ ...editForm, principalPhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {editTab === 'incharge1' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Officer Name (English)</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge1Name}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge1Name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Officer Name (Odia / ଓଡ଼ିଆ)</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge1NameOdia}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge1NameOdia: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Department</label>
                    <input
                      type="text"
                      value={editForm.admissionIncharge1Designation}
                      onChange={(e) => setEditForm({ ...editForm, admissionIncharge1Designation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Direct Mobile / Helpline</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge1Phone}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge1Phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={editForm.admissionIncharge1Email}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge1Email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Photo URL</label>
                    <input
                      type="url"
                      value={editForm.admissionIncharge1PhotoUrl}
                      onChange={(e) => setEditForm({ ...editForm, admissionIncharge1PhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {editTab === 'incharge2' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Officer Name (English)</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge2Name}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge2Name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Officer Name (Odia / ଓଡ଼ିଆ)</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge2NameOdia}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge2NameOdia: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Department</label>
                    <input
                      type="text"
                      value={editForm.admissionIncharge2Designation}
                      onChange={(e) => setEditForm({ ...editForm, admissionIncharge2Designation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Direct Mobile / Helpline</label>
                      <input
                        type="text"
                        value={editForm.admissionIncharge2Phone}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge2Phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={editForm.admissionIncharge2Email}
                        onChange={(e) => setEditForm({ ...editForm, admissionIncharge2Email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Photo URL</label>
                    <input
                      type="url"
                      value={editForm.admissionIncharge2PhotoUrl}
                      onChange={(e) => setEditForm({ ...editForm, admissionIncharge2PhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {editTab === 'deo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">DEO Name (English)</label>
                      <input
                        type="text"
                        value={editForm.deoName}
                        onChange={(e) => setEditForm({ ...editForm, deoName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">DEO Name (Odia / ଓଡ଼ିଆ)</label>
                      <input
                        type="text"
                        value={editForm.deoNameOdia}
                        onChange={(e) => setEditForm({ ...editForm, deoNameOdia: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Designation & Responsibilities</label>
                    <input
                      type="text"
                      value={editForm.deoDesignation}
                      onChange={(e) => setEditForm({ ...editForm, deoDesignation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Direct Phone / Helpline</label>
                      <input
                        type="text"
                        value={editForm.deoPhone}
                        onChange={(e) => setEditForm({ ...editForm, deoPhone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">DEO Helpdesk Email</label>
                      <input
                        type="email"
                        value={editForm.deoEmail}
                        onChange={(e) => setEditForm({ ...editForm, deoEmail: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Photo URL</label>
                    <input
                      type="url"
                      value={editForm.deoPhotoUrl}
                      onChange={(e) => setEditForm({ ...editForm, deoPhotoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
                >
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Link Edit Modal */}
      {isEditLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Custom Redirect Link (Admin Only)
              </h3>
              <button
                type="button"
                onClick={() => setIsEditLinkModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSystemSettings(editLinkForm);
                setIsEditLinkModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Redirect Target URL</label>
                <input
                  type="url"
                  required
                  value={editLinkForm.customBannerLinkUrl}
                  onChange={(e) => setEditLinkForm({ ...editLinkForm, customBannerLinkUrl: e.target.value })}
                  placeholder="e.g. https://samsodisha.gov.in/"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Button Label (English)</label>
                <input
                  type="text"
                  required
                  value={editLinkForm.customBannerLinkLabel}
                  onChange={(e) => setEditLinkForm({ ...editLinkForm, customBannerLinkLabel: e.target.value })}
                  placeholder="e.g. Visit SAMS Odisha Official Portal"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Button Label (Odia)</label>
                <input
                  type="text"
                  required
                  value={editLinkForm.customBannerLinkLabelOdia}
                  onChange={(e) => setEditLinkForm({ ...editLinkForm, customBannerLinkLabelOdia: e.target.value })}
                  placeholder="e.g. ସାମ୍ସ ଓଡ଼ିଶା ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଯାଆନ୍ତୁ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
                >
                  Save Link Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
