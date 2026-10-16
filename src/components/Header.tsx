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
      ? 'bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-amber-500/40'
      : themeMode === 'navy'
      ? 'bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950 border-cyan-500/40'
      : 'bg-gradient-to-r from-red-900 via-amber-950 to-red-900 border-amber-500/50';

  return (
    <header className={`${headerBgStyle} border-b text-slate-100 shadow-2xl relative z-30 transition-colors duration-300`}>
      
      {/* Top Govt Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between text-slate-300 font-mono">
        
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-amber-400 font-bold">
            <Globe className="w-3.5 h-3.5 mr-1" /> {t.govtOdisha} | {t.deptDhe}
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300 font-sans flex items-center">
            <Phone className="w-3 h-3 mr-1 text-amber-400" /> {t.helpline}
          </span>
        </div>

        <div className="flex items-center space-x-3 my-1 sm:my-0">
          
          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'or' : 'en')}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center transition shadow"
          >
            <Languages className="w-3.5 h-3.5 mr-1 text-amber-400" />
            {lang === 'en' ? 'ଓଡ଼ିଆ (Odia)' : 'English'}
          </button>

          {/* Fully Working Color Theme Palette Buttons */}
          <div className="flex items-center space-x-1 bg-slate-900/90 border border-amber-500/40 rounded-lg p-1 text-[11px] shadow-lg">
            <Palette className="w-3.5 h-3.5 text-amber-400 mx-1" />
            
            <button
              onClick={() => setThemeMode('maroon')}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center space-x-1 ${
                themeMode === 'maroon'
                  ? 'bg-red-800 text-white border border-amber-400 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Classic Odisha Maroon & Gold Theme"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block mr-1"></span>
              Maroon
            </button>

            <button
              onClick={() => setThemeMode('navy')}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center space-x-1 ${
                themeMode === 'navy'
                  ? 'bg-blue-800 text-white border border-cyan-400 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="SAMS Deep Navy & Blue Theme"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1"></span>
              Navy
            </button>

            <button
              onClick={() => setThemeMode('light')}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center space-x-1 ${
                themeMode === 'light'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Official Light Mode"
            >
              <Sun className="w-3 h-3 mr-0.5 text-slate-900" />
              Light
            </button>
          </div>

          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] font-bold tracking-wider hidden md:inline">
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
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-serif">
                  {lang === 'or' ? 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼' : systemSettings.collegeName}
                </h1>
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center shadow-md">
                  <Award className="w-3.5 h-3.5 mr-1" /> {t.naacBadge}
                </span>
              </div>
              <p className="text-amber-200/90 text-xs sm:text-sm font-medium">
                {lang === 'or' ? 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ' : systemSettings.tagline} &bull; Baragada, Bargarh, Odisha - 768038
              </p>
            </div>

          </div>

          {/* Role Login Buttons */}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            {role === 'PUBLIC' ? (
              <>
                <button
                  onClick={onOpenHodModal}
                  className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-medium flex items-center transition shadow"
                >
                  {t.hodDesk}
                </button>
                <button
                  onClick={onOpenAdminModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 text-xs font-bold flex items-center transition shadow-lg"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {t.adminPortal}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 bg-slate-950/90 border border-amber-500/40 px-3.5 py-2 rounded-xl">
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-400 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {role === 'SUPER_ADMIN' ? 'SUPER ADMIN ACCESS' : `HOD: ${hodDeptName}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">SAMS Odisha Authenticated</div>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="bg-amber-500/10 border-t border-amber-500/20 text-amber-300 py-1.5 px-4 text-xs font-medium flex items-center overflow-hidden">
        <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded mr-3 shrink-0 uppercase tracking-wider flex items-center">
          <Bell className="w-3 h-3 mr-1" /> SAMS NOTICE
        </span>
        <div className="whitespace-nowrap overflow-hidden text-ellipsis animate-pulse font-mono">
          {lang === 'or'
            ? 'ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ୨୦୨୬-୨୭: ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ସିଟ୍ ଲାଇଭ୍ ମେରିଟ୍ ତାଲିକା ନିମ୍ନରେ ପ୍ରକାଶିତ।'
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
