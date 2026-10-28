import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, CheckCircle2, Award, Globe, Bell, Languages, Palette, Phone, Sun, Moon } from 'lucide-react';

export const Header: React.FC<{ onOpenAdminModal: () => void; onOpenHodModal: () => void }> = ({
  onOpenAdminModal,
  onOpenHodModal,
}) => {
  const { systemSettings, updateCollegeLogo, lang, setLang, themeMode, setThemeMode, t } = useData();
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

  // Header background theme styles
  const headerBgStyle =
    themeMode === 'maroon'
      ? 'bg-gradient-to-r from-[#280612] via-[#140309] to-[#280612] border-amber-500/40 text-slate-100'
      : themeMode === 'navy'
      ? 'bg-gradient-to-r from-[#091633] via-[#040915] to-[#091633] border-cyan-500/40 text-slate-100'
      : 'bg-[#f4f6f1] border-b border-[#e1e7de] text-[#131f15]';

  const topBarBgStyle =
    themeMode === 'maroon'
      ? 'bg-[#120308] border-b border-red-900/50 text-pink-100/90'
      : themeMode === 'navy'
      ? 'bg-[#030814] border-b border-blue-900/50 text-cyan-100/90'
      : 'bg-[#e7eee5] border-b border-[#d8e0d4] text-[#283e2b]';

  return (
    <header className={`${headerBgStyle} border-b shadow-2xl relative z-30 transition-colors duration-300`}>
      
      {/* Top Govt Bar */}
      <div className={`${topBarBgStyle} text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between font-mono transition-colors`}>
        
        <div className="flex items-center space-x-3">
          <span className={`flex items-center font-bold ${
            themeMode === 'navy' ? 'text-cyan-400' : themeMode === 'light' ? 'text-amber-800' : 'text-amber-400'
          }`}>
            <Globe className="w-3.5 h-3.5 mr-1" /> {t.govtOdisha} | {t.deptDhe}
          </span>
          <span className={`hidden sm:inline ${themeMode === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>|</span>
          <span className={`hidden sm:inline font-sans flex items-center ${
            themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <Phone className={`w-3 h-3 mr-1 ${
              themeMode === 'navy' ? 'text-cyan-400' : themeMode === 'light' ? 'text-amber-700' : 'text-amber-400'
            }`} /> {t.helpline}
          </span>
        </div>

        <div className="flex items-center space-x-3 my-1 sm:my-0">
          
          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'or' : 'en')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center transition-all duration-200 shadow-md transform hover:scale-[1.03] active:scale-95 ${
              lang === 'or'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/50 font-black'
                : themeMode === 'light'
                ? 'bg-white hover:bg-amber-50 text-slate-800 border border-slate-300 hover:border-amber-500'
                : 'bg-slate-900/90 hover:bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:border-amber-400'
            }`}
            title={lang === 'en' ? 'ସମସ୍ତ ବିବରଣୀ ଓଡ଼ିଆରେ ଦେଖନ୍ତୁ (Switch all details to Odia)' : 'Switch back to English'}
          >
            <Languages className={`w-3.5 h-3.5 mr-1.5 ${lang === 'or' ? 'text-slate-950 animate-pulse' : 'text-amber-400'}`} />
            {lang === 'en' ? (
              <span>ଓଡ଼ିଆ (Odia)</span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>ଓଡ଼ିଆ ଭାଷା</span>
                <span className="ml-1 bg-red-900 text-amber-300 text-[9px] px-1 py-0.2 rounded font-extrabold uppercase tracking-wide">
                  ସକ୍ରିୟ ✓
                </span>
              </span>
            )}
          </button>

          {/* Fully Working Color Theme Palette Buttons */}
          <div className={`flex items-center space-x-1 rounded-lg p-1 text-[11px] transition-all shadow-md ${
            themeMode === 'maroon'
              ? 'bg-[#19050f] border border-amber-500/50 ring-1 ring-amber-500/20'
              : themeMode === 'navy'
              ? 'bg-[#081328] border border-cyan-500/50 ring-1 ring-cyan-500/20'
              : 'bg-white border border-slate-300 shadow-sm text-slate-800'
          }`}>
            <Palette className={`w-3.5 h-3.5 mx-1 ${
              themeMode === 'maroon'
                ? 'text-amber-400'
                : themeMode === 'navy'
                ? 'text-cyan-400'
                : 'text-amber-600'
            }`} />
            
            <button
              onClick={() => setThemeMode('maroon')}
              className={`px-2 py-0.5 rounded font-bold transition-all flex items-center space-x-1 ${
                themeMode === 'maroon'
                  ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-200 border border-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] ring-1 ring-amber-400/50 font-black scale-[1.04]'
                  : 'text-slate-300 hover:text-white hover:bg-red-950/40 border border-transparent'
              }`}
              title={lang === 'or' ? 'ଓଡ଼ିଶା ମେରୁନ୍ ଓ ସୁନେଲି ରଙ୍ଗ (Classic Maroon & Gold Theme)' : 'Classic Odisha Maroon & Gold Theme'}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block mr-1 shadow-sm"></span>
              {lang === 'or' ? 'ମେରୁନ୍' : 'Maroon'}
            </button>

            <button
              onClick={() => setThemeMode('navy')}
              className={`px-2 py-0.5 rounded font-bold transition-all flex items-center space-x-1 ${
                themeMode === 'navy'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-cyan-100 border border-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.4)] ring-1 ring-cyan-400/50 font-black scale-[1.04]'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/40 border border-transparent'
              }`}
              title={lang === 'or' ? 'ସାମ୍ସ ଡିପ୍ ନେଭି ବ୍ଲୁ (SAMS Oceanic Navy & Blue Theme)' : 'SAMS Deep Navy & Blue Theme'}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1 shadow-sm"></span>
              {lang === 'or' ? 'ନେଭି' : 'Navy'}
            </button>

            <button
              onClick={() => setThemeMode('light')}
              className={`px-2 py-0.5 rounded font-bold transition-all flex items-center space-x-1 ${
                themeMode === 'light'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 border border-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50 font-black scale-[1.04]'
                  : themeMode === 'maroon' || themeMode === 'navy'
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
              title={lang === 'or' ? 'ଅଫିସିଆଲ୍ ଲାଇଟ୍ ମୋଡ୍ (Official Light Academic Mode)' : 'Official Light Mode'}
            >
              <Sun className={`w-3 h-3 mr-0.5 ${themeMode === 'light' ? 'text-slate-950' : 'text-amber-400'}`} />
              {lang === 'or' ? 'ଲାଇଟ୍' : 'Light'}
            </button>
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider hidden md:inline ${
            themeMode === 'navy'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : themeMode === 'light'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/80 p-1 bg-slate-950 shadow-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={systemSettings.collegeLogoUrl}
                  alt="College emblem crest"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => setShowLogoUploader(true)}
                  className="absolute inset-0 bg-slate-950/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-amber-400 font-medium"
                  title="Update College Crest Emblem"
                >
                  <Upload className="w-4 h-4 mr-1" /> Edit
                </button>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-serif ${
                  themeMode === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {lang === 'or'
                    ? (systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼')
                    : systemSettings.collegeName}
                </h1>
                <span className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center shadow-md ${
                  themeMode === 'navy'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950'
                }`}>
                  <Award className="w-3.5 h-3.5 mr-1" /> {systemSettings.naacGrade || t.naacBadge}
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-medium ${
                themeMode === 'light'
                  ? 'text-slate-600'
                  : themeMode === 'navy'
                  ? 'text-cyan-200/90'
                  : 'text-amber-200/90'
              }`}>
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
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center transition shadow-sm ${
                    themeMode === 'light'
                      ? 'bg-[#2d4f32] hover:bg-[#213c25] text-white border border-[#213a25]'
                      : themeMode === 'navy'
                      ? 'bg-[#09152b] hover:bg-[#0f2142] text-cyan-200 border border-blue-900/60'
                      : 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700'
                  }`}
                >
                  {t.hodDesk}
                </button>
                <button
                  onClick={onOpenAdminModal}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center transition shadow-md ${
                    themeMode === 'navy'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-slate-950 shadow-cyan-500/20'
                      : themeMode === 'light'
                      ? 'bg-[#d2eb4b] hover:bg-[#c3de3a] text-[#16291a] border border-[#bad338]'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {t.adminPortal}
                </button>
              </>
            ) : (
              <div className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl border ${
                themeMode === 'light'
                  ? 'bg-white border-slate-300 text-slate-800'
                  : themeMode === 'navy'
                  ? 'bg-[#09152b] border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/90 border-amber-500/40'
              }`}>
                <div className="text-left">
                  <div className={`text-xs font-bold flex items-center ${
                    themeMode === 'navy' ? 'text-cyan-400' : 'text-amber-500'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {role === 'SUPER_ADMIN' ? 'SUPER ADMIN ACCESS' : `HOD: ${hodDeptName}`}
                  </div>
                  <div className={`text-[10px] font-mono ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>SAMS Odisha Authenticated</div>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div className={`border-t py-1.5 px-4 text-xs font-medium flex items-center overflow-hidden transition-colors ${
        themeMode === 'maroon'
          ? 'bg-[#1b050f] border-amber-500/30 text-amber-300'
          : themeMode === 'navy'
          ? 'bg-[#08152e] border-cyan-500/30 text-cyan-300'
          : 'bg-amber-100/90 border-amber-300 text-amber-950'
      }`}>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded mr-3 shrink-0 uppercase tracking-wider flex items-center shadow-sm ${
          themeMode === 'navy'
            ? 'bg-cyan-500 text-slate-950'
            : themeMode === 'light'
            ? 'bg-amber-600 text-white'
            : 'bg-amber-500 text-slate-950'
        }`}>
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
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center">
              <Upload className="w-5 h-5 mr-2" /> Update College Emblem Crest
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload an image file or enter a custom image URL to update the header emblem across the SAMS portal.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Upload File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowLogoUploader(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLogoUrl}
                  className="px-4 py-1.5 rounded bg-amber-500 text-slate-950 font-bold shadow"
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
