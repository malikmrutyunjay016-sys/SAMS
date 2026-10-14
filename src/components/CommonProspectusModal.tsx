import React from 'react';
import { X, Download, FileText, CheckCircle, HelpCircle, ShieldAlert, Award } from 'lucide-react';

export const CommonProspectusModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">
              Common Prospectus (CP) - SAMS Degree Admissions 2026-27
            </h2>
            <p className="text-xs text-amber-400 font-mono">
              SAMS Panchayat College, Baragada - Govt. of Odisha
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          
          {/* Section 1: Overview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <Award className="w-4 h-4 mr-1.5" /> 1. Admission Eligibility & Stream Combinations
            </h3>
            <p>
              Candidates passing Higher Secondary (+2) Examination conducted by CHSE Odisha or equivalent recognized boards are eligible for +3 Degree e-Admission across Arts, Science, and Commerce streams.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">Science Stream</span>
                Physics, Chemistry, Mathematics, Botany, Zoology (Regular & AEDP Specializations).
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">Arts Stream</span>
                Odia, Political Science, History, Economics, Education, Sociology, Geography, Philosophy, Sanskrit, Psychology, Hindi.
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">Commerce Stream</span>
                Accounting, Business Studies, Finance, Corporate Law.
              </div>
            </div>
          </div>

          {/* Section 2: Regular vs AEDP */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" /> 2. Regular Honours vs. AEDP Specialization Courses
            </h3>
            <p>
              Under the Department of Higher Education Govt. of Odisha initiative, Panchayat College Baragada offers specialized <strong className="text-emerald-300">AEDP (Academic Excellence and Skill Development Program)</strong> options alongside traditional Regular Honours degrees:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Physics AEDP:</strong> Focuses on Renewable Energy, Solar Technology & Applied Electronics.</li>
              <li><strong>Botany AEDP:</strong> Plant Tissue Culture, Hydroponics & Vertical Farming Laboratory training.</li>
              <li><strong>Zoology AEDP:</strong> Integrative Bioscience, Diagnostic Biotechnology & Aquaponics.</li>
              <li><strong>Mathematics AEDP:</strong> Data Analytics, Computational Mathematics & Python Programming.</li>
              <li><strong>Chemistry AEDP:</strong> Industrial Quality Assurance, Chemical Processing & Lab Safety.</li>
            </ul>
          </div>

          {/* Section 3: Quota Policy */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5" /> 3. Odisha Government Reservation Quota Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">Scheduled Caste (SC)</span>
                <span className="font-bold text-amber-400 text-sm">16.25%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">Scheduled Tribe (ST)</span>
                <span className="font-bold text-amber-400 text-sm">22.50%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">SEBC / OBC</span>
                <span className="font-bold text-amber-400 text-sm">11.25%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">PwD / Ex-Servicemen</span>
                <span className="font-bold text-amber-400 text-sm">5.00%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Spot Round Rules */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1.5" /> 4. Spot Selection Guidelines & Reporting Rules
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-2">
              <li>Candidates must submit online or physical Spot Application at SAMS Helpdesk by designated deadline.</li>
              <li>Candidates reporting physically between 10:00 AM and 2:00 PM are marked as <strong>Reported</strong>.</li>
              <li>Merit list is automatically computed strictly based on +2 Marks percentage and category reservation rules.</li>
              <li>Selected candidates must deposit admission fee and verify original certificates at college counter.</li>
            </ol>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://samsodisha.gov.in/Degree/DegreePublicCommonProspectus.pdf"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" /> Download Full Govt Common Prospectus PDF
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
