import React from 'react';
import { Download, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

interface DownloadItem {
  title: string;
  category: string;
  size: string;
  action: () => void;
  isExternal?: boolean;
}

export const DownloadsView: React.FC<{ onOpenProspectus?: () => void }> = () => {
  const { t, lang } = useData();
  const downloadsList: DownloadItem[] = [];

  return (
    <div className="space-y-8 pb-12 relative">
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
        {downloadsList.length > 0 ? (
          downloadsList.map((item, index) => (
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
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-xl space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              {lang === 'or' ? 'ବର୍ତ୍ତମାନ କୌଣସି ଡାଉନଲୋଡ୍ ଉପଲବ୍ଧ ନାହିଁ।' : 'No downloads available right now.'}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'or'
                ? 'ନୂତନ ଅଫିସିଆଲ୍ ଦଲିଲ ପ୍ରକାଶିତ ହେଲେ ଏଠାରେ ଦେଖାଯିବ।'
                : 'Official documents and downloadable files will appear here once published.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
