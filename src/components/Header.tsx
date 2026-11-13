import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, CheckCircle2, Award, Globe, Bell, Phone } from 'lucide-react';

export const Header: React.FC<{ onOpenAdminModal: () => void; onOpenHodModal: () => void }> = ({
  onOpenAdminModal,
  onOpenHodModal,
}) => {
  const { systemSettings, updateCollegeLogo, lang, t } = useData();
  const { role, logout, hodDeptName } = useAuth();
  const [showLogoUploader, setShowLogoUploader] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState(systemSettings.collegeLogoUrl);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
          updateCollegeLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogoUrl = () => {
    if (customLogoUrl) {
      updateCollegeLogo(customLogoUrl);
      setShowLogoUploader(false);
    }
  };

  return (
    <header className="bg-[rgb(126,160,196)] border-b border-[#5f82a8] text-slate-950 shadow-xl relative z-30 transition-colors duration-300">
      
      {/* Top Govt Bar */}
      <div className="bg-[#698db4] border-b border-[#56789c] text-slate-950 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between font-mono transition-colors">
        
        <div className="flex items-center space-x-3">
          <span className="flex items-center font-bold text-[#0f2238]">
            <Globe className="w-3.5 h-3.5 mr-1 text-[#0f2238]" /> {t.govtOdisha} | {t.deptDhe}
          </span>
          <span className="hidden sm:inline text-slate-800/50">|</span>
          <span className="hidden sm:inline font-sans flex items-center text-slate-900 font-medium">
            <Phone className="w-3 h-3 mr-1 text-[#0f2238]" /> {t.helpline}
          </span>
        </div>

        <div className="flex items-center space-x-3 my-1 sm:my-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider hidden md:inline bg-white/70 text-[#0f2238] border border-[#537496]">
            SAMS: {systemSettings.collegeCode || '03071302'}
          </span>
        </div>

      </div>

      {/* Main College Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Crest & College Title */}
          <div className="flex items-center space-x-4 sm:space-x-5 text-center md:text-left">
            
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/85 p-1 bg-[#1e344d] shadow-xl overflow-hidden flex items-center justify-center">
                <img
                  src={systemSettings.collegeLogoUrl}
                  alt="College emblem crest"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => setShowLogoUploader(true)}
                  className="absolute inset-0 bg-[#16273a]/85 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-amber-300 font-medium"
                  title="Update College Crest Emblem"
                >
                  <Upload className="w-4 h-4 mr-1" /> Edit
                </button>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-serif text-slate-950">
                  {lang === 'or'
                    ? (systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼')
                    : systemSettings.collegeName}
                </h1>
                <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center shadow-md bg-[#1b314b] text-amber-300 border border-[#0f1f33]">
                  <Award className="w-3.5 h-3.5 mr-1 text-amber-300" /> {systemSettings.naacGrade || t.naacBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900/90">
                {lang === 'or'
                  ? (systemSettings.taglineOdia || 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ')
                  : systemSettings.tagline} &bull; {lang === 'or' ? (systemSettings.addressOdia || systemSettings.address || 'ବରଗଡ଼, ଓଡ଼ିଶା - ୭୬୮୦୨୮') : (systemSettings.address || 'Baragada, Bargarh, Odisha - 768028')}
              </p>
            </div>

          </div>

          {/* Role Login Buttons */}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            {role === 'PUBLIC' ? (
              <>
                <button
                  onClick={onOpenHodModal}
                  className="px-4 py-2 rounded-full text-xs font-bold flex items-center transition shadow-sm bg-white/80 hover:bg-white text-slate-950 border border-[#56789c]"
                >
                  {t.hodDesk}
                </button>
                <button
                  onClick={onOpenAdminModal}
                  className="px-4 py-2 rounded-full text-xs font-extrabold flex items-center transition shadow-md bg-[#1b314b] hover:bg-[#132438] text-white border border-[#0f1f33]"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                  {t.adminPortal}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 px-3.5 py-2 rounded-xl border bg-[#1b314b] border-[#0f1f33] text-white shadow-md">
                <div className="text-left">
                  <div className="text-xs font-bold flex items-center text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {role === 'SUPER_ADMIN' ? 'SUPER ADMIN ACCESS' : `HOD: ${hodDeptName}`}
                  </div>
                  <div className="text-[10px] font-mono text-sky-200">SAMS Odisha Authenticated</div>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-400/50 text-xs font-semibold transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="border-t py-1.5 px-4 text-xs font-semibold flex items-center overflow-hidden transition-colors bg-[#698db4] border-[#56789c] text-slate-950">
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded mr-3 shrink-0 uppercase tracking-wider flex items-center shadow-sm bg-[#1b314b] text-amber-300">
          <Bell className="w-3 h-3 mr-1" /> {lang === 'or' ? 'ସାମ୍ସ ସୂଚନା' : 'SAMS NOTICE'}
        </span>
        <div className="whitespace-nowrap overflow-hidden text-ellipsis animate-pulse font-mono">
          {lang === 'or'
            ? (systemSettings.bannerNoticeOdia || systemSettings.bannerNotice)
            : systemSettings.bannerNotice}
        </div>
      </div>

      {/* Emblem Modal */}
      {showLogoUploader && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#230b47] border border-violet-400/40 rounded-xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center">
              <Upload className="w-5 h-5 mr-2" /> Update College Emblem Crest
            </h3>
            <p className="text-xs text-violet-200 mb-4">
              Upload an image file or enter a custom image URL to update the header emblem across the SAMS portal.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-violet-100 font-semibold mb-1">Upload File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-violet-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-slate-950"
                />
              </div>

              <div>
                <label className="block text-violet-100 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-violet-950 border border-violet-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowLogoUploader(false)}
                  className="px-3 py-1.5 rounded bg-violet-900 text-violet-100 font-medium hover:bg-violet-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLogoUrl}
                  className="px-4 py-1.5 rounded bg-amber-400 text-slate-950 font-bold shadow hover:bg-amber-300"
                >
                  Save Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
