import React, { useState } from 'react';
import { Phone, Mail, MapPin, Building2, Send, CheckCircle2, Clock, Shield, Award } from 'lucide-react';
import { useData } from '../context/DataContext';

export const ContactView: React.FC = () => {
  const { systemSettings, t, lang } = useData();
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(lang === 'or' ? 'ସ୍ପଟ୍ ରାଉଣ୍ଡ ଇ-ନାମଲେଖା ପ୍ରଶ୍ନ' : 'Spot Round e-Admission Query');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setInquirySubmitted(true);
  };

  const keyOfficers = [
    {
      name: lang === 'or' ? 'ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା' : 'Prof. Amarendra Panda',
      role: t.principalInCharge,
      phone: systemSettings.contactPhone || '06646-230234',
      email: systemSettings.contactEmail || 'principal.baragada@gmail.com',
    },
    {
      name: lang === 'or' ? 'ଡଃ ରମେଶ ଚନ୍ଦ୍ର ସାହୁ' : 'Dr. Ramesh Chandra Sahoo',
      role: lang === 'or' ? 'ସାମ୍ସ ନାମଲେଖା ମୁଖ୍ୟ' : 'SAMS Admission In-Charge',
      phone: '9437123401',
      email: 'sams.admission@baragada.edu.in',
    },
    {
      name: lang === 'or' ? 'ଡଃ ସୁନୀତା ମହାପାତ୍ର' : 'Dr. Sunita Mohapatra',
      role: lang === 'or' ? 'ଏକାଡେମିକ୍ ବର୍ସାର୍' : 'Academic Bursar',
      phone: '9437123402',
      email: 'bursar@baragada.edu.in',
    },
    {
      name: lang === 'or' ? 'ପ୍ରଫେସର ଦେବବ୍ରତ ସିଂ' : 'Prof. Debabrata Singh',
      role: lang === 'or' ? 'ଆକାଉଣ୍ଟସ୍ ବର୍ସାର୍' : 'Accounts Bursar',
      phone: '9437123409',
      email: 'accounts@baragada.edu.in',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Phone className="w-4 h-4" />
          <span>{lang === 'or' ? 'ସାମ୍ସ କଲେଜ ହେଲ୍ପଡେସ୍କ ଓ ଅଧିକାରୀ ସୂଚୀ' : 'SAMS COLLEGE HELPDESK & OFFICERS DIRECTORY'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          {t.contactTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t.contactSub}
        </p>
      </div>

      {/* Official College Information & Global System Settings Overview Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full border border-amber-500/50 p-1 bg-slate-950 overflow-hidden shrink-0">
              <img
                src={systemSettings.collegeLogoUrl}
                alt="College Crest"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                {lang === 'or'
                  ? (systemSettings.collegeNameOdia || 'ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼')
                  : systemSettings.collegeName}
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {lang === 'or'
                  ? (systemSettings.taglineOdia || 'ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ')
                  : systemSettings.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1 rounded-full font-mono">
              SAMS: {systemSettings.collegeCode || '03071302'}
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" />
              {systemSettings.naacGrade || t.naacBadge}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="flex items-start space-x-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
                {lang === 'or' ? 'ଅଫିସିଆଲ୍ ଠିକଣା' : 'Official Postal Address'}
              </span>
              <p className="text-slate-200 mt-0.5">
                {lang === 'or'
                  ? (systemSettings.addressOdia || systemSettings.address || t.address)
                  : (systemSettings.address || t.address)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
                {lang === 'or' ? 'ନାମଲେଖା ହେଲ୍ପଲାଇନ୍' : 'Admission Helpline'}
              </span>
              <p className="text-emerald-300 font-bold font-mono mt-0.5">
                {systemSettings.contactPhone || '06646-230234'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
                {lang === 'or' ? 'ଅଫିସିଆଲ୍ ଇମେଲ୍' : 'Official SAMS Email'}
              </span>
              <p className="text-blue-300 font-mono mt-0.5">
                {systemSettings.contactEmail || 'principal.baragada@gmail.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Officers Directory */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4 mr-2" /> {t.keyOfficersTitle}
            </h2>

            <div className="space-y-3">
              {keyOfficers.map((officer, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                  <h3 className="font-bold text-white text-sm">{officer.name}</h3>
                  <p className="text-amber-400 font-semibold">{officer.role}</p>
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-1">
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" /> {officer.phone}
                    </span>
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-slate-500" /> {officer.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 text-xs text-slate-300">
            <h3 className="font-bold text-white text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2 text-emerald-400" /> {t.counterHoursTitle}
            </h3>
            <p>{t.counterHoursText}</p>
            <p className="text-slate-400 text-[11px]">{lang === 'or' ? 'ସୂଚନା: ସରକାରୀ ଛୁଟିଦିନ ଓ ରବିବାର କାଉଣ୍ଟର ବନ୍ଦ ରହିବ।' : 'Note: Closed on government holidays and Sundays.'}</p>
          </div>

        </div>

        {/* Public Inquiry Form */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white font-serif flex items-center">
              <Send className="w-4 h-4 mr-2 text-amber-400" /> {t.submitInquiryTitle}
            </h2>

            {inquirySubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-emerald-300 text-sm">{t.inquirySuccess}</h3>
                <p className="text-xs text-slate-300">
                  {lang === 'or' ? (
                    <>ଧନ୍ୟବାଦ, <strong>{name}</strong>। ଆପଣଙ୍କ ବାର୍ତ୍ତା (ବିଷୟ: <strong>{subject}</strong>) ସାମ୍ସ ବରଗଡ଼ ନାମଲେଖା ପ୍ରକୋଷ୍ଠକୁ ପଠାଗଲା।</>
                  ) : (
                    <>Thank you, <strong>{name}</strong>. Your message regarding <strong>{subject}</strong> has been logged into the SAMS Baragada admission desk inbox.</>
                  )}
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  {lang === 'or' ? 'ଅନ୍ୟ ଏକ ପ୍ରଶ୍ନ ପଠାନ୍ତୁ' : 'Submit Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.yourFullName}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'or' ? 'ଉଦାହରଣ: ରମେଶ ଚନ୍ଦ୍ର ବେହେରା' : 'e.g. Ramesh Chandra Behera'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t.emailAddress}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t.phoneNumber}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9861000000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.inquiryTopic}</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={lang === 'or' ? 'ସ୍ପଟ୍ ରାଉଣ୍ଡ ଇ-ନାମଲେଖା ପ୍ରଶ୍ନ' : 'Spot Round e-Admission Query'}>
                      {lang === 'or' ? 'ସ୍ପଟ୍ ରାଉଣ୍ଡ ଇ-ନାମଲେଖା ପ୍ରଶ୍ନ' : 'Spot Round e-Admission Query'}
                    </option>
                    <option value={lang === 'or' ? 'ଏଇଡିପି (AEDP) ପାଠ୍ୟକ୍ରମ ସୂଚନା' : 'Apprenticeship Embedded Degree (AEDP) Query'}>
                      {lang === 'or' ? 'ଏଇଡିପି (AEDP) ପାଠ୍ୟକ୍ରମ ସୂଚନା' : 'Apprenticeship Embedded Degree (AEDP) Query'}
                    </option>
                    <option value={lang === 'or' ? 'ସିଟ୍ ମ୍ୟାଟ୍ରିକ୍ସ ଓ ସଂରକ୍ଷଣ' : 'Seat Matrix & Reservation Query'}>
                      {lang === 'or' ? 'ସିଟ୍ ମ୍ୟାଟ୍ରିକ୍ସ ଓ ସଂରକ୍ଷଣ' : 'Seat Matrix & Reservation Query'}
                    </option>
                    <option value={lang === 'or' ? 'ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ ଓ ଫିସ୍' : 'Document Verification & Fee Query'}>
                      {lang === 'or' ? 'ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ ଓ ଫିସ୍' : 'Document Verification & Fee Query'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.yourMessage}</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={lang === 'or' ? 'ଆପଣଙ୍କ ପ୍ରଶ୍ନ କିମ୍ବା ଅଭିଯୋଗ ଏଠାରେ ଲେଖନ୍ତୁ...' : 'Describe your query or admission assistance required...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow-lg transition"
                >
                  {t.submitButton}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
