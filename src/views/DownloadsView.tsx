import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, ExternalLink, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';

export const DownloadsView: React.FC<{ onOpenProspectus: () => void }> = ({ onOpenProspectus }) => {
  const { systemSettings, t, lang } = useData();
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const triggerDownloadNotice = (title: string) => {
    setDownloadToast(lang === 'or' ? `ଫାଇଲ୍ ଡାଉନଲୋଡ୍ ଆରମ୍ଭ ହେଲା: ${title}` : `Download triggered: ${title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const downloadsList = [
    {
      title: lang === 'or'
        ? `${systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ'} - ସାଧାରଣ ପ୍ରୋସ୍ପେକ୍ଟସ୍ (CP) ୨୦୨୬-୨୭`
        : `${systemSettings.collegeName} - Common Prospectus (CP) 2026-27`,
      category: lang === 'or' ? 'ଅଫିସିଆଲ୍ ପ୍ରୋସ୍ପେକ୍ଟସ୍' : 'Official Prospectus',
      size: '4.2 MB',
      action: onOpenProspectus,
      isExternal: false,
    },
    {
      title: lang === 'or'
        ? 'ସ୍ପଟ୍ ରାଉଣ୍ଡ ଆବେଦନ ଫର୍ମ ଓ ଶାରୀରିକ ଉପସ୍ଥିତି ସୂଚନା'
        : 'Spot Round Application Form & Physical Reporting Intimation',
      category: lang === 'or' ? 'ନାମଲେଖା ଫର୍ମ' : 'Admission Form',
      size: '340 KB',
      action: () => triggerDownloadNotice('Spot Application Form'),
      isExternal: false,
    },
    {
      title: lang === 'or'
        ? 'ବିଷୟ ମିଶ୍ରଣ ଓ ଜେନେରିକ୍ ଇଲେକ୍ଟିଭ୍ (GE) ସିଲାବସ୍ ମ୍ୟାଟ୍ରିକ୍ସ'
        : 'Subject Combination & Generic Elective (GE) Syllabus Matrix',
      category: lang === 'or' ? 'ଶିକ୍ଷା ସିଲାବସ୍' : 'Academic Syllabus',
      size: '1.8 MB',
      action: () => triggerDownloadNotice('Syllabus Matrix PDF'),
      isExternal: false,
    },
    {
      title: lang === 'or'
        ? 'ଓଡ଼ିଶା ସରକାରୀ ଫିସ୍ ସୂଚୀ ଓ ହଷ୍ଟେଲ ନିୟମାବଳୀ'
        : 'Odisha Govt Fee Structure & Hostel Accommodation Rules',
      category: lang === 'or' ? 'ଫିସ୍ ବିବରଣୀ' : 'Fee Schedule',
      size: '850 KB',
      action: () => triggerDownloadNotice('Fee Schedule PDF'),
      isExternal: false,
    },
    {
      title: lang === 'or'
        ? 'ସାମ୍ସ ଓଡ଼ିଶା ସରକାର ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ଲିଙ୍କ୍'
        : 'SAMS Govt. of Odisha Official Portal Link',
      category: lang === 'or' ? 'ବାହ୍ୟ ପୋର୍ଟାଲ୍' : 'External Portal',
      size: 'samsodisha.gov.in',
      action: () => {
        const link = document.createElement('a');
        link.href = 'https://samsodisha.gov.in';
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.click();
      },
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Toast */}
      {downloadToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Download className="w-4 h-4" />
          <span>{lang === 'or' ? 'ଅଫିସିଆଲ୍ ଦଲିଲ ଡାଉନଲୋଡ୍ ଓ ମାର୍ଗଦର୍ଶିକା' : 'OFFICIAL DOCUMENT DOWNLOADS & GUIDELINES'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          {t.downloadsTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t.downloadsSub}
        </p>
      </div>

      {/* Downloads Grid */}
      <div className="space-y-4">
        {downloadsList.map((item, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                  {item.category}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{item.title}</h3>
                <span className="text-xs text-slate-500 font-mono">{item.size}</span>
              </div>
            </div>

            <button
              onClick={item.action}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center shadow transition shrink-0"
            >
              {item.isExternal ? (
                <>
                  {t.visitPortal} <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> {t.downloadView}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
