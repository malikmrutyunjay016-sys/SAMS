import React from 'react';
import { X, Download, FileText, CheckCircle, HelpCircle, ShieldAlert, Award } from 'lucide-react';
import { useData } from '../context/DataContext';

export const CommonProspectusModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { lang, t } = useData();

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
              {lang === 'or'
                ? 'ସାଧାରଣ ପ୍ରୋସ୍ପେକ୍ଟସ୍ (CP) - ସାମ୍ସ ଡିଗ୍ରୀ (+୩) ନାମଲେଖା ୨୦୨୬-୨୭'
                : 'Common Prospectus (CP) - SAMS Degree Admissions 2026-27'}
            </h2>
            <p className="text-xs text-amber-400 font-mono">
              {t.collegeName} - {t.govtOdisha}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          
          {/* Section 1: Overview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <Award className="w-4 h-4 mr-1.5" /> {lang === 'or' ? '୧. ନାମଲେଖା ଯୋଗ୍ୟତା ଓ ଶାଖା ସୂଚନା' : '1. Admission Eligibility & Stream Combinations'}
            </h3>
            <p>
              {lang === 'or'
                ? 'CHSE ଓଡ଼ିଶା କିମ୍ବା ସମତୁଲ୍ୟ ବୋର୍ଡ ଦ୍ୱାରା ପରିଚାଳିତ +୨ ପରୀକ୍ଷାରେ ଉତ୍ତୀର୍ଣ୍ଣ ପ୍ରାର୍ଥୀମାନେ ବିଜ୍ଞାନ, କଳା ଏବଂ ବାଣିଜ୍ୟ ଶାଖାରେ +୩ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ପାଇଁ ଯୋଗ୍ୟ।'
                : 'Candidates passing Higher Secondary (+2) Examination conducted by CHSE Odisha or equivalent recognized boards are eligible for +3 Degree e-Admission across Arts, Science, and Commerce streams.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">{lang === 'or' ? 'ବିଜ୍ଞାନ ଶାଖା' : 'Science Stream'}</span>
                {lang === 'or'
                  ? 'ପଦାର୍ଥ ବିଜ୍ଞାନ, ରସାୟନ ବିଜ୍ଞାନ, ଗଣିତ, ଉଦ୍ଭିଦ ବିଜ୍ଞାନ, ପ୍ରାଣୀ ବିଜ୍ଞାନ ଓ କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ।'
                  : 'Physics, Chemistry, Mathematics, Botany, Zoology, Computer Science (Regular & AEDP Specializations).'}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">{lang === 'or' ? 'କଳା ଶାଖା' : 'Arts Stream'}</span>
                {lang === 'or'
                  ? 'ଓଡ଼ିଆ, ଇତିହାସ, ରାଜନୀତି ବିଜ୍ଞାନ, ଅର୍ଥଶାସ୍ତ୍ର, ଶିକ୍ଷା, ଇଂରାଜୀ, ସଂସ୍କୃତ, ଦର୍ଶନ ଶାସ୍ତ୍ର, ମନୋବିଜ୍ଞାନ, ଭୂଗୋଳ।'
                  : 'Odia, Political Science, History, Economics, Education, Sociology, Geography, Philosophy, Sanskrit, Psychology, Hindi.'}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">{lang === 'or' ? 'ବାଣିଜ୍ୟ ଶାଖା' : 'Commerce Stream'}</span>
                {lang === 'or'
                  ? 'ଆକାଉଣ୍ଟିଂ, ବିଜନେସ୍ ଷ୍ଟଡିଜ୍, ଫାଇନାନ୍ସ, କର୍ପୋରେଟ୍ ଲ\' ଏବଂ BFSI ଏଇଡିପି।'
                  : 'Accounting, Business Studies, Finance, Corporate Law, and BFSI AEDP.'}
              </div>
            </div>
          </div>

          {/* Section 2: Regular vs AEDP */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> {lang === 'or' ? '୨. ଆପ୍ରେଣ୍ଟିସସିପ୍ ଏମ୍ବେଡେଡ୍ ଡିଗ୍ରୀ (AEDP) ବିବରଣୀ' : '2. Apprenticeship Embedded Degree Programme (AEDP) vs. Regular Honours'}
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                UGC & DHE Odisha
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {lang === 'or'
                ? 'ଜାତୀୟ ଶିକ୍ଷାନୀତି (NEP 2020) ଏବଂ ୟୁଜିସି ମାର୍ଗଦର୍ଶିକା ଅନୁଯାୟୀ, ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ (DHE), ଓଡ଼ିଶା ସରକାର ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ ବରଗଡ଼ରେ ଏଇଡିପି (AEDP) ପାଠ୍ୟକ୍ରମ ଆରମ୍ଭ କରିଛନ୍ତି।'
                : 'In accordance with the National Education Policy (NEP) 2020 and UGC Apprenticeship Embedded Degree Guidelines, the Department of Higher Education (DHE), Govt. of Odisha has introduced the Apprenticeship Embedded Degree Programme (AEDP) across premier colleges in Odisha including Panchayat College, Baragada.'}
            </p>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
              <div className="text-amber-400 font-semibold font-mono text-[11px]">{lang === 'or' ? 'ଓଡ଼ିଶାରେ ଏଇଡିପି (AEDP) ର ପ୍ରମୁଖ ବୈଶିଷ୍ଟ୍ୟ:' : 'Key Highlights of AEDP in Odisha:'}</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px]">
                <li><strong className="text-white">{lang === 'or' ? '୧ ବର୍ଷର ବାଧ୍ୟତାମୂଳକ ବେତନଯୁକ୍ତ ଶିଳ୍ପ ଶିକ୍ଷାନବିଶୀ:' : '1-Year Mandatory Paid Apprenticeship:'}</strong> {lang === 'or' ? '୩ୟ ବର୍ଷରେ ପ୍ରତିଷ୍ଠିତ ଶିଳ୍ପସଂସ୍ଥାରେ ବାସ୍ତବ ପ୍ରଶିକ୍ଷଣ।' : 'Students undergo real on-the-job industrial apprenticeship in their 3rd year.'}</li>
                <li><strong className="text-white">{lang === 'or' ? 'ମାସିକ ଷ୍ଟାଇପେଣ୍ଡ୍:' : 'Monthly Stipend:'}</strong> {lang === 'or' ? 'ଶିକ୍ଷାନବିଶୀ ସମୟରେ ଛାତ୍ରଛାତ୍ରୀ ମାସିକ ଷ୍ଟାଇପେଣ୍ଡ୍ ପାଆନ୍ତି।' : 'Apprentices receive monthly stipends disbursed by industry partners under national apprenticeship norms.'}</li>
                <li><strong className="text-white">{lang === 'or' ? '୧୦୦% ସ୍ନାତକ ଡିଗ୍ରୀ ସମତୁଲ୍ୟତା:' : '100% UG Degree Equivalency:'}</strong> {lang === 'or' ? 'ଓଡ଼ିଶା ସରକାରଙ୍କ ଆଦେଶାନୁସାରେ ଏହି ଡିଗ୍ରୀ ପିଜି, ପିଏଚ୍.ଡି ଏବଂ ସରକାରୀ ଚାକିରି ପରୀକ୍ଷା ପାଇଁ ସାଧାରଣ ଡିଗ୍ରୀ ସହ ସମ୍ପୂର୍ଣ୍ଣ ସମାନ।' : 'The Odisha Govt. has directed all universities that AEDP degrees are 100% equivalent to conventional degrees for M.A., M.Sc., M.Com., Ph.D. admissions, and civil/public service examinations.'}</li>
                <li><strong className="text-white">{lang === 'or' ? 'ସାମ୍ସ କେନ୍ଦ୍ରୀୟ ନାମଲେଖା:' : 'Centrally Administered:'}</strong> {lang === 'or' ? 'ଅଫିସିଆଲ୍ ସାମ୍ସ ଓଡ଼ିଶା ଡିଗ୍ରୀ ପୋର୍ଟାଲ୍ (samsodisha.gov.in) ମାଧ୍ୟମରେ ଆବେଦନ।' : 'Applied through the official SAMS Odisha degree portal (samsodisha.gov.in).'}</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Quota Policy */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5" /> {lang === 'or' ? '୩. ଓଡ଼ିଶା ସରକାର ସଂରକ୍ଷଣ କୋଟା ନୀତି' : '3. Odisha Government Reservation Quota Matrix'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">{lang === 'or' ? 'ଅନୁସୂଚିତ ଜାତି (SC)' : 'Scheduled Caste (SC)'}</span>
                <span className="font-bold text-amber-400 text-sm">16.25%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">{lang === 'or' ? 'ଅନୁସୂଚିତ ଜନଜାତି (ST)' : 'Scheduled Tribe (ST)'}</span>
                <span className="font-bold text-amber-400 text-sm">22.50%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">{lang === 'or' ? 'ଏସଇବିସି / ଓବିସି (SEBC)' : 'SEBC / OBC'}</span>
                <span className="font-bold text-amber-400 text-sm">11.25%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/20">
                <span className="block text-slate-400">{lang === 'or' ? 'ଦିବ୍ୟାଙ୍ଗ / ସୈନିକ' : 'PwD / Ex-Servicemen'}</span>
                <span className="font-bold text-amber-400 text-sm">5.00%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Spot Round Rules */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1.5" /> {lang === 'or' ? '୪. ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ମାର୍ଗଦର୍ଶିକା ଓ ରିପୋର୍ଟିଂ ନିୟମ' : '4. Spot Selection Guidelines & Reporting Rules'}
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-2">
              <li>{lang === 'or' ? 'ପ୍ରାର୍ଥୀ ନିର୍ଦ୍ଧାରିତ ସମୟସୀମା ମଧ୍ୟରେ ସାମ୍ସ ଡେସ୍କରେ ସ୍ପଟ୍ ଆବେଦନ ଦାଖଲ କରିବା ଆବଶ୍ୟକ।' : 'Candidates must submit online or physical Spot Application at SAMS Helpdesk by designated deadline.'}</li>
              <li>{lang === 'or' ? 'ପୂର୍ବାହ୍ନ ୧୦:୦୦ ରୁ ଅପରାହ୍ନ ୨:୦୦ ମଧ୍ୟରେ ବ୍ୟକ୍ତିଗତ ଭାବେ ଉପସ୍ଥିତ ହେଉଥିବା ପ୍ରାର୍ଥୀଙ୍କୁ "ଉପସ୍ଥିତ" (Reported) ବୋଲି ଚିହ୍ନିତ କରାଯାଏ।' : 'Candidates reporting physically between 10:00 AM and 2:00 PM are marked as Reported.'}</li>
              <li>{lang === 'or' ? '+୨ ମାର୍କ ପ୍ରତିଶତ ଏବଂ ସଂରକ୍ଷଣ ନିୟମ ଅନୁସାରେ ସ୍ୱୟଂଚାଳିତ ମେରିଟ୍ ତାଲିକା ପ୍ରସ୍ତୁତ କରାଯାଏ।' : 'Merit list is automatically computed strictly based on +2 Marks percentage and category reservation rules.'}</li>
              <li>{lang === 'or' ? 'ମନୋନୀତ ପ୍ରାର୍ଥୀ କଲେଜ କାଉଣ୍ଟରରେ ମୂଳ ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ କରି ନାମଲେଖା ଫିସ୍ ଜମା କରିବେ।' : 'Selected candidates must deposit admission fee and verify original certificates at college counter.'}</li>
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
            <Download className="w-4 h-4 mr-2" /> {lang === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ସରକାରୀ CP PDF ଡାଉନଲୋଡ୍' : 'Download Full Govt Common Prospectus PDF'}
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            {lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
