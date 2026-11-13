import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Bell,
  Globe,
  Search,
  ShieldCheck,
  UserCheck,
  Edit3,
  X,
  ExternalLink,
} from 'lucide-react';

export const HomeView: React.FC<{
  onNavigateTab: (tab: any) => void;
  onOpenProspectus: () => void;
  onOpenAdminModal: () => void;
}> = ({ onNavigateTab, onOpenProspectus, onOpenAdminModal }) => {
  const { notices, systemSettings, t, lang, updateSystemSettings } = useData();
  const { role } = useAuth();
  const [searchNotice, setSearchNotice] = useState('');
  const [selectedNoticeCategory] = useState<string>('ALL');
  // Custom Redirect Link State
  const [isEditLinkModalOpen, setIsEditLinkModalOpen] = useState<boolean>(false);
  const [editLinkForm, setEditLinkForm] = useState({
    customBannerLinkUrl: systemSettings.customBannerLinkUrl || 'https://samsodisha.gov.in/',
    customBannerLinkLabel: systemSettings.customBannerLinkLabel || 'Visit SAMS Odisha Official Portal',
    customBannerLinkLabelOdia: systemSettings.customBannerLinkLabelOdia || 'ସାମ୍ସ ଓଡ଼ିଶା ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଯାଆନ୍ତୁ',
  });

  const filteredNotices = notices.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchNotice.toLowerCase()) || (n.content && n.content.toLowerCase().includes(searchNotice.toLowerCase()));
    const matchesCat = selectedNoticeCategory === 'ALL' || n.category === selectedNoticeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-10 pb-12">
      
      {/* Hero Banner with Official Odisha Govt Aesthetics */}
      <div className="hero-banner relative rounded-3xl bg-gradient-to-br from-red-950 via-slate-950 to-slate-900 border border-amber-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Backdrop Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          
          <div className="space-y-5">
            
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
                onClick={() => {
                  if (systemSettings.spotRoundEnabled) {
                    const link = document.createElement('a');
                    link.href = 'https://ug-admission-pcb.vercel.app/';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    onNavigateTab('spot');
                  }
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center shadow-xl transition transform hover:-translate-y-0.5"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {t.liveSpotBtn}
              </button>

              <button
                onClick={() => onNavigateTab('student_portal')}
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm flex items-center shadow-xl transition transform hover:-translate-y-0.5"
              >
                <Award className="w-4 h-4 mr-2 text-amber-400" />
                {t.studentPortal || 'Student Portal'}
              </button>
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
