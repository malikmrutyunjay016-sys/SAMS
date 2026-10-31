import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Shield, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoadingOverlayProps {
  customMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ customMessage }) => {
  const { systemSettings, isLoading, isInitialLoading, lang, themeMode, setIsLoading } = useData();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const showOverlay = isLoading || isInitialLoading;

  // Cycle through informative loading steps for enhanced visual feedback
  const stepsEn = [
    'Connecting to SAMS Odisha Cloud Database...',
    'Loading Student Roster & Academic Records...',
    'Verifying NEP 2020 Subject Allotments & Seat Matrix...',
    'Preparing Official Form Generators & Mark Foils...',
  ];

  const stepsOr = [
    'ସାମ୍ସ ଓଡ଼ିଶା କ୍ଲାଉଡ୍ ଡାଟାବେସ୍ ସହ ସଂଯୋଗ ହେଉଛି...',
    'ଛାତ୍ରଛାତ୍ରୀଙ୍କ ନାମଲେଖା ତାଲିକା ଲୋଡ୍ ହେଉଛି...',
    'NEP ୨୦୨୦ ବିଷୟ ପସନ୍ଦ ଓ ଆସନ ବ୍ୟବସ୍ଥା ଯାଞ୍ଚ ହେଉଛି...',
    'ଅଫିସିଆଲ୍ ଫର୍ମ ଓ ମାର୍କ ଫଏଲ୍ ପ୍ରସ୍ତୁତ ହେଉଛି...',
  ];

  const currentSteps = lang === 'or' ? stepsOr : stepsEn;

  useEffect(() => {
    if (!showOverlay) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % currentSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [showOverlay, currentSteps.length]);

  if (!showOverlay) return null;

  // Theme styling for the loading box and backdrop
  const boxBgClass =
    themeMode === 'maroon'
      ? 'bg-[#180510]/95 border-amber-500/40 text-slate-100 shadow-[0_0_60px_rgba(245,158,11,0.25)]'
      : themeMode === 'navy'
      ? 'bg-[#06122b]/95 border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.25)]'
      : 'bg-white/95 border-amber-600/40 text-slate-900 shadow-[0_0_60px_rgba(45,79,50,0.2)]';

  const ringGlow =
    themeMode === 'navy'
      ? 'from-cyan-400 via-blue-500 to-indigo-500'
      : themeMode === 'light'
      ? 'from-emerald-600 via-amber-500 to-emerald-700'
      : 'from-amber-400 via-amber-500 to-red-600';

  const badgeClass =
    themeMode === 'navy'
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      : themeMode === 'light'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  const progressGradient =
    themeMode === 'navy'
      ? 'from-cyan-500 to-blue-600'
      : themeMode === 'light'
      ? 'from-emerald-600 to-amber-600'
      : 'from-amber-400 to-red-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all duration-300 animate-fadeIn">
      {/* Centered Loading Box Container */}
      <div
        className={`relative w-full max-w-md rounded-2xl border p-8 text-center flex flex-col items-center justify-center transition-all duration-300 ${boxBgClass}`}
      >
        {/* Decorative Top Ambient Light */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Outer Animated Glowing Logo Ring */}
        <div className="relative mb-6 group">
          <div
            className={`w-28 h-28 rounded-full p-1 bg-gradient-to-tr ${ringGlow} animate-spin shadow-2xl flex items-center justify-center`}
            style={{ animationDuration: '6s' }}
          >
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center p-1.5 overflow-hidden">
              {/* College Logo / Emblem */}
              {!logoError && systemSettings.collegeLogoUrl ? (
                <img
                  src={systemSettings.collegeLogoUrl}
                  alt={systemSettings.collegeName}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoError(true)}
                  className={`w-full h-full object-cover rounded-full transition-all duration-500 ${
                    logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-amber-400">
                  <Shield className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Pulsing Sparkle Icon Badge */}
          <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-amber-400 p-1.5 rounded-full shadow-lg text-amber-400 animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* College / Institution Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif mb-1 leading-snug">
          {lang === 'or'
            ? systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼'
            : systemSettings.collegeName}
        </h2>

        {/* Govt Tagline */}
        <p className="text-xs font-medium text-slate-400 mb-4 tracking-wide uppercase">
          {lang === 'or' ? systemSettings.taglineOdia : systemSettings.tagline}
        </p>

        {/* SAMS Status Badge */}
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border mb-5 shadow-sm ${badgeClass}`}>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-current" />
          <span>{lang === 'or' ? 'ସାମ୍ସ ତଥ୍ୟ ସିଙ୍କ୍ ହେଉଛି...' : 'SAMS Database Synchronizing...'}</span>
        </div>

        {/* Dynamic Stepped Loading Message */}
        <p className="text-sm font-semibold mb-4 min-h-[40px] flex items-center justify-center px-2">
          {customMessage || currentSteps[loadingStep]}
        </p>

        {/* Animated Progress Shimmer Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50 mb-3 relative">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} animate-pulse transition-all duration-500`}
            style={{ width: '85%' }}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Footer info text */}
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 mt-1 px-1">
          <span className="flex items-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
            {lang === 'or' ? 'ସୁରକ୍ଷିତ ଏନକ୍ରିପ୍ଟେଡ୍ ସଂଯୋଗ' : 'Encrypted Connection'}
          </span>
          <span className="font-mono text-slate-500">SAMS v4.2</span>
        </div>

        {/* Fallback skip button if loading takes over 5 seconds */}
        {isLoading && (
          <button
            onClick={() => setIsLoading(false)}
            className="mt-4 text-xs underline text-slate-400 hover:text-amber-400 transition-colors"
          >
            {lang === 'or' ? 'ପୃଷ୍ଠା ସିଧାସଳଖ ଦେଖନ୍ତୁ (Skip)' : 'Continue to page anyway'}
          </button>
        )}
      </div>
    </div>
  );
};
