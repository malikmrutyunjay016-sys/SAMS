import React, { useState } from 'react';
import { Phone, Mail, MapPin, Building2, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Spot Round e-Admission Query');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setInquirySubmitted(true);
  };

  const keyOfficers = [
    { name: 'Prof. Amarendra Panda', role: 'Principal-in-Charge', phone: '06646-220142', email: 'principal.baragada@odisha.gov.in' },
    { name: 'Dr. Ramesh Chandra Sahoo', role: 'SAMS Admission In-Charge', phone: '9437123401', email: 'sams.admission@baragada.edu.in' },
    { name: 'Dr. Sunita Mohapatra', role: 'Academic Bursar', phone: '9437123402', email: 'bursar@baragada.edu.in' },
    { name: 'Prof. Debabrata Singh', role: 'Accounts Bursar', phone: '9437123409', email: 'accounts@baragada.edu.in' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Phone className="w-4 h-4" />
          <span>SAMS COLLEGE HELPDESK & OFFICERS DIRECTORY</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          Contact e-Admission Officers & Submit Inquiry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Panchayat College, At/Po: Baragada, District: Bargarh, Odisha - 768038
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Officers Directory */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4 mr-2" /> Key Administrative Officers
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
              <Clock className="w-4 h-4 mr-2 text-emerald-400" /> Counter Working Hours
            </h3>
            <p>SAMS e-Admission Verification Counters are open Monday through Saturday (10:00 AM to 5:00 PM).</p>
            <p className="text-slate-400 text-[11px]">Note: Closed on government holidays and Sundays.</p>
          </div>

        </div>

        {/* Public Inquiry Form */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white font-serif flex items-center">
              <Send className="w-4 h-4 mr-2 text-amber-400" /> Submit e-Admission Inquiry / Grievance
            </h2>

            {inquirySubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-emerald-300 text-sm">Inquiry Successfully Registered</h3>
                <p className="text-xs text-slate-300">
                  Thank you, <strong>{name}</strong>. Your message regarding <strong>{subject}</strong> has been logged into the SAMS Baragada admission desk inbox.
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Behera"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
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
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Inquiry Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Spot Round e-Admission Query">Spot Round e-Admission Query</option>
                    <option value="AEDP Specialization Information">AEDP Specialization Information</option>
                    <option value="Fee Deposit & Refund Query">Fee Deposit & Refund Query</option>
                    <option value="Certificate Verification Desk">Certificate Verification Desk</option>
                    <option value="Hostel & Transportation">Hostel & Transportation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query or SAMS application number..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Submit Inquiry to Admission Desk
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
