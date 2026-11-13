import React from 'react';
import { Building2, Phone, Mail, MapPin, ExternalLink, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { systemSettings, t, lang } = useData();

  return (
    <footer className="bg-[rgb(126,160,196)] text-slate-900 border-t border-[#5f82a8] text-xs mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* College Overview */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm font-serif text-slate-950">
              {lang === 'or'
                ? (systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼')
                : systemSettings.collegeName}
            </h3>
            <p className="leading-relaxed text-[11px] text-slate-900/90 font-medium">
              {systemSettings.naacGrade || t.footerEstablished}
            </p>
            <div className="text-[10px] font-mono font-bold text-[#0f2238]">
              {lang === 'or'
                ? `ସାମ୍ସ କଲେଜ କୋଡ୍: ${systemSettings.collegeCode || '୦୩୦୭୧୩୦୨'} | ସ୍ଥାପିତ: ୧୯୬୦`
                : `SAMS College Code: ${systemSettings.collegeCode || '03071302'} | ESTD: 1960`}
            </div>
          </div>

          {/* Quick Govt Links */}
          <div className="space-y-2">
            <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider">{t.officialLinksTitle}</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-900 font-medium">
              <li>
                <a href="https://samsodisha.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#0b1f38] hover:underline flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-[#1b314b]" /> {lang === 'or' ? 'ସାମ୍ସ ଓଡ଼ିଶା ଡିଗ୍ରୀ ଇ-ନାମଲେଖା' : 'SAMS Odisha Degree e-Admission'}
                </a>
              </li>
              <li>
                <a href="https://dhe.odisha.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#0b1f38] hover:underline flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-[#1b314b]" /> {lang === 'or' ? 'ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ (DHE Odisha)' : 'Department of Higher Education (DHE)'}
                </a>
              </li>
              <li>
                <a href="https://suniv.ac.in" target="_blank" rel="noreferrer" className="hover:text-[#0b1f38] hover:underline flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-[#1b314b]" /> {lang === 'or' ? 'ସମ୍ବଲପୁର ବିଶ୍ୱବିଦ୍ୟାଳୟ ଅନୁବନ୍ଧନ' : 'Sambalpur University Affiliation'}
                </a>
              </li>
              <li>
                <a href="https://naac.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#0b1f38] hover:underline flex items-center transition">
                  <ExternalLink className="w-3 h-3 mr-1 text-[#1b314b]" /> {lang === 'or' ? 'ନୈକ୍ (NAAC) ପୋର୍ଟାଲ୍' : 'NAAC Accreditation Portal'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider">{t.contactCellTitle}</h4>
            <ul className="space-y-2 text-[11px] text-slate-900 font-medium">
              <li className="flex items-start">
                <MapPin className="w-3.5 h-3.5 mr-2 text-[#1b314b] shrink-0 mt-0.5" />
                <span>
                  {lang === 'or'
                    ? (systemSettings.addressOdia || systemSettings.address || t.address)
                    : (systemSettings.address || t.address)}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-2 text-[#1b314b] shrink-0" />
                <span>
                  {lang === 'or'
                    ? `ନାମଲେଖା ହେଲ୍ପଲାଇନ୍: ${systemSettings.contactPhone || '୦୬୬୪୬-୨୩୦୨୩୪'}`
                    : `Admission Helpline: ${systemSettings.contactPhone || '06646-230234'}`}
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-[#1b314b] shrink-0" />
                <span>{systemSettings.contactEmail || 'principal.baragada@gmail.com'}</span>
              </li>
            </ul>
          </div>

          {/* Working Hours & Security Notice */}
          <div className="space-y-2">
            <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider">{t.officeHoursTitle}</h4>
            <p className="text-[11px] text-slate-900 font-medium">
              {lang === 'or' ? 'ସାମ୍ସ କାଉଣ୍ଟର ସମୟ: ସୋମବାର - ଶନିବାର (୧୦:୦୦ AM - ୫:୦୦ PM)' : 'SAMS Counter Hours: Monday - Saturday (10:00 AM - 5:00 PM)'}
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[#56789c]/70 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-900 font-medium">
          <p>{t.copyright}</p>
          <p className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-800">
            {t.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
};
