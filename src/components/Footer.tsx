import React from 'react';
import { Building2, Phone, Mail, MapPin, ExternalLink, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { systemSettings } = useData();
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* College Overview */}
          <div className="space-y-3">
            <h3 className="text-slate-100 font-bold text-sm font-serif">
              {systemSettings.collegeName}
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              A premier Odisha Government Higher Education Institution established in 1960. {systemSettings.naacGrade}. Dedicated to academic excellence and e-Admission transparency under SAMS Govt. of Odisha.
            </p>
            <div className="text-[10px] text-amber-400 font-mono">
              SAMS College Code: {systemSettings.collegeCode || '03071302'} | ESTD: 1960
            </div>
          </div>

          {/* Quick Govt Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Official SAMS Links</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://samsodisha.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-500" /> SAMS Odisha Degree e-Admission
                </a>
              </li>
              <li>
                <a href="https://dhe.odisha.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-500" /> Department of Higher Education (DHE)
                </a>
              </li>
              <li>
                <a href="https://suniv.ac.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-500" /> Sambalpur University Affiliation
                </a>
              </li>
              <li>
                <a href="https://naac.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-500" /> NAAC Accreditation Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">e-Admission Cell Contact</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-start">
                <MapPin className="w-3.5 h-3.5 mr-2 text-amber-400 shrink-0 mt-0.5" />
                <span>Panchayat College, At/Po: Baragada, Dist: Bargarh, Odisha - 768038</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-2 text-amber-400 shrink-0" />
                <span>Admission Helpline: 06646-220142 / 9437123401</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-amber-400 shrink-0" />
                <span>principal.baragada@odisha.gov.in</span>
              </li>
            </ul>
          </div>

          {/* Working Hours & Security Notice */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Office Hours & Helpdesk</h4>
            <p className="text-[11px] text-slate-400">
              SAMS Counter Hours: Monday - Saturday (10:00 AM - 5:00 PM)
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1">
              <div className="text-amber-400 font-bold flex items-center">
                <Shield className="w-3 h-3 mr-1" /> Government Transparency
              </div>
              <p className="text-slate-400">
                Admission is strictly based on SAMS Odisha merit rankings and government seat reservation policies.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 SAMS Panchayat College, Baragada - Government of Odisha. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-400">
            Powered by SAMS e-Admission & Administration Engine
          </p>
        </div>
      </div>
    </footer>
  );
};
