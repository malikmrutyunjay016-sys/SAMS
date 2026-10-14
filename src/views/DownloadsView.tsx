import React from 'react';
import { Download, FileText, CheckCircle, ExternalLink, Shield } from 'lucide-react';

export const DownloadsView: React.FC<{ onOpenProspectus: () => void }> = ({ onOpenProspectus }) => {
  const downloadsList = [
    {
      title: 'Common Prospectus (CP) 2026-27 - Degree (+3) Admissions',
      category: 'Official Prospectus',
      size: '4.2 MB',
      action: onOpenProspectus,
      isExternal: false,
    },
    {
      title: 'Spot Round Application Form & Physical Reporting Intimation',
      category: 'Admission Form',
      size: '340 KB',
      action: () => alert('Spot Application Form download triggered.'),
      isExternal: false,
    },
    {
      title: 'Subject Combination & Generic Elective (GE) Syllabus Matrix',
      category: 'Academic Syllabus',
      size: '1.8 MB',
      action: () => alert('Syllabus PDF download triggered.'),
      isExternal: false,
    },
    {
      title: 'Odisha Govt Fee Structure & Hostel Accommodation Rules',
      category: 'Fee Schedule',
      size: '850 KB',
      action: () => alert('Fee Schedule PDF download triggered.'),
      isExternal: false,
    },
    {
      title: 'SAMS Govt. of Odisha Official Portal Link',
      category: 'External Portal',
      size: 'SAMS Portal',
      action: () => window.open('https://samsodisha.gov.in', '_blank'),
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Download className="w-4 h-4" />
          <span>OFFICIAL DOCUMENT DOWNLOADS & GUIDELINES</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          SAMS Application Forms, Prospectus & Regulations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Download official government e-Admission documents, prospectus PDFs, and fee structures.
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
                  Visit SAMS Portal <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download / View
                </>
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
