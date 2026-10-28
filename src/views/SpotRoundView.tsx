import React from 'react';
import { useData } from '../context/DataContext';
import { Building2, CheckCircle, Award, Sparkles } from 'lucide-react';

export const SpotRoundView: React.FC = () => {
  const { systemSettings, t, lang } = useData();

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'or' ? 'ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା କେନ୍ଦ୍ର' : 'SAMS UG e-Admission Center'}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          {lang === 'or' ? 'ୟୁ.ଜି. ଇ-ନାମଲେଖା ଓ ପ୍ରବେଶ କେନ୍ଦ୍ର' : 'UG e-Admission Portal'}
        </h1>
        
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {lang === 'or'
            ? 'ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼ (ଓଡ଼ିଶା ସରକାର)ଙ୍କ ଅଫିସିଆଲ୍ ୟୁ.ଜି. ଇ-ନାମଲେଖା ଓ ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ ପୋର୍ଟାଲ୍। ସମସ୍ତ ନାମଲେଖା ସାମ୍ସ ଓଡ଼ିଶା ମେରିଟ୍ ଏବଂ ସରକାରୀ ସଂରକ୍ଷଣ ନିୟମ ଅନୁସାରେ କରାଯାଏ।'
            : 'Official UG e-Admission and Certificate Verification Portal for Panchayat College, Baragada (Govt. of Odisha). All undergraduate admissions are conducted strictly as per SAMS Odisha merit rankings and government reservation guidelines.'}
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-amber-400 flex items-center shadow">
            <Building2 className="w-4 h-4 mr-2" />
            <span>{t.samsCode}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-emerald-400 flex items-center shadow">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>{t.naacBadge}</span>
          </div>
        </div>
      </div>

      {/* Guidelines & Counter Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white font-serif flex items-center">
          <Award className="w-5 h-5 mr-2 text-amber-400" />
          {lang === 'or' ? 'ଇ-ନାମଲେଖା ନିୟମାବଳୀ ଓ କାଉଣ୍ଟର ସମୟ' : 'e-Admission Guidelines & Verification Counters'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm">1. SAMS CAF & Merit Admissions</h4>
            <p>
              Candidates selected through SAMS Odisha Common Application Form (CAF) must report to the college e-Admission verification counters with original certificates, CLC, conduct certificate, and fee payment receipts.
            </p>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm">2. Counter Working Hours</h4>
            <p>
              {t.counterHoursText}
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-center text-xs text-amber-300 font-medium">
          {t.helpline}
        </div>
      </div>
    </div>
  );
};
