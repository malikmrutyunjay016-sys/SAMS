import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  Plus,
  ChevronDown,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

const DEFAULT_FAQS_ODIA: Record<string, { question: string; answer: string }> = {
  faq_1: {
    question: "ସାମ୍ସ (SAMS) ଡିଗ୍ରୀ (+3) ନାମଲେଖା କିପରି କରିବେ?",
    answer: "ସାମ୍ସ ଓଡ଼ିଶା (samsodisha.gov.in) ପୋର୍ଟାଲ ମାଧ୍ୟମରେ ସାଧାରଣ ଆବେଦନ ଫର୍ମ (CAF) ଅନଲାଇନ୍ ପୂରଣ କରନ୍ତୁ। ନିଜର ବିକଳ୍ପ କଲେଜ ଓ ଅନର୍ସ ବିଷୟ ଚୟନ କରନ୍ତୁ। ମେରିଟ୍ ତାଲିକା ଅନୁସାରେ ଚୟନ ହେବା ପରେ କଲେଜରେ ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ ଓ ଫିସ୍ ଦାଖଲ କରି ନାମଲେଖା ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।"
  },
  faq_2: {
    question: "ନାମଲେଖା ସମୟରେ କେଉଁ କେଉଁ ମୂଳ ଦଲିଲ (Documents) ଆବଶ୍ୟକ?",
    answer: "୧. ସାମ୍ସ ସି.ଏ.ଏଫ୍ (CAF) କପି ଓ ଇଣ୍ଟିମେସନ୍ ଲେଟର\n୨. +୨ ମାର୍କସିଟ୍ ଏବଂ ପାସ୍ ସାର୍ଟିଫିକେଟ୍ (ମୂଳ ଓ ଜେରକ୍ସ)\n୩. କଲେଜ ଲିଭିଂ ସାର୍ଟିଫିକେଟ୍ (CLC) ଓ ଆଚରଣ ପ୍ରମାଣପତ୍ର (Conduct Certificate)\n୪. ଜାତି ପ୍ରମାଣପତ୍ର (SC / ST / SEBC / OBC - ଯଦି ଲାଗୁ ହୁଏ)\n୫. ୪ ଟି ପାସପୋର୍ଟ ସାଇଜ୍ ରଙ୍ଗୀନ ଫଟୋ ଓ ଆଧାର କାର୍ଡ।"
  },
  faq_3: {
    question: "ପଞ୍ଚାୟତ ଡିଗ୍ରୀ କଲେଜରେ ଏଇଡିପି (AEDP) କୋର୍ସ କ'ଣ ଏବଂ ଏହାର ସୁବିଧା କ'ଣ?",
    answer: "ଏଇଡିପି (Apprenticeship Embedded Degree Programme) ହେଉଛି ଓଡ଼ିଶା ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ ଓ UGC ଦ୍ୱାରା ଅନୁମୋଦିତ ଏକ ନୂତନ ଯୁଗର ରୋଜଗାରକ୍ଷମ ପାଠ୍ୟକ୍ରମ। ଏଥିରେ ବି.ଏ., ବି.କମ୍ ଓ ବି.ଏସସି ଅନର୍ସ ଡିଗ୍ରୀ ସହିତ ଶିଳ୍ପାନୁଷ୍ଠାନ ମାନଙ୍କରେ ପ୍ରତ୍ୟକ୍ଷ ଷ୍ଟାଇପେଣ୍ଡ-ଯୁକ୍ତ ଆପ୍ରେଣ୍ଟିସିପ୍ ତାଲିମ ପ୍ରଦାନ କରାଯାଏ।"
  },
  faq_4: {
    question: "ସ୍ପଟ୍ ରାଉଣ୍ଡ (Spot Admission) ରେ ସିଟ୍ ଚୟନ ପ୍ରକ୍ରିୟା କିପରି ହୁଏ?",
    answer: "ପ୍ରଥମ ଓ ଦ୍ୱିତୀୟ ପର୍ଯ୍ୟାୟ ନାମଲେଖା ପରେ ଖାଲି ଥିବା ସିଟ୍ ପାଇଁ ସାମ୍ସ ପୋର୍ଟାଲରେ ଛାତ୍ରଛାତ୍ରୀମାନେ ରିପୋର୍ଟ କରନ୍ତି। କଲେଜ ମେରିଟ୍ ମାର୍କ (ଅତିରିକ୍ତ ଭାରାଙ୍କ/ୱେଟେଜ୍ ସହିତ) ଏବଂ ସରକାରୀ ସଂରକ୍ଷଣ ନିୟମ ଅନୁସାରେ ସ୍ୱଚ୍ଛ ଭାବେ ଚୟନ ତାଲିକା ପ୍ରକାଶ କରେ।"
  },
  faq_5: {
    question: "କଲେଜ ହଷ୍ଟେଲ ସୁବିଧା ପାଇଁ କିପରି ଆବେଦନ କରିବେ?",
    answer: "ନାମଲେଖା ପ୍ରକ୍ରିୟା ସମାପ୍ତ ହେବା ପରେ କଲେଜ ପ୍ରଶାସନ ପକ୍ଷରୁ ହଷ୍ଟେଲ ଫର୍ମ ପ୍ରଦାନ କରାଯାଏ। ଦୂରବର୍ତ୍ତୀ ଅଞ୍ଚଳର ଛାତ୍ରଛାତ୍ରୀ ଓ ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀଙ୍କୁ ପ୍ରାଥମିକତା ଭିତ୍ତିରେ ହଷ୍ଟେଲ ଆବଣ୍ଟନ କରାଯାଏ।"
  }
};

function translateFaqCategory(category: string, lang: string): string {
  if (lang !== 'or') return category;
  switch (category) {
    case 'ALL':
      return 'ସମସ୍ତ FAQ (ALL)';
    case 'Admission':
      return 'ନାମଲେଖା (Admission)';
    case 'Academics':
      return 'ଶିକ୍ଷାଦାନ (Academics)';
    case 'Spot Round':
      return 'ସ୍ପଟ୍ ରାଉଣ୍ଡ (Spot Round)';
    case 'Administration':
      return 'ପ୍ରଶାସନ (Administration)';
    default:
      return category;
  }
}

export const FaqView: React.FC = () => {
  const { faqs, addFAQ, t, lang } = useData();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  // Modal / Form state for Add FAQ
  const [showModal, setShowModal] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Admission');

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const categories = ['ALL', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((f) => {
    const qText = (lang === 'or' && DEFAULT_FAQS_ODIA[f.id]?.question) ? DEFAULT_FAQS_ODIA[f.id].question : f.question;
    const aText = (lang === 'or' && DEFAULT_FAQS_ODIA[f.id]?.answer) ? DEFAULT_FAQS_ODIA[f.id].answer : f.answer;
    const matchesSearch =
      qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setQuestionInput('');
    setAnswerInput('');
    setCategoryInput(selectedCategory !== 'ALL' ? selectedCategory : 'Admission');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !questionInput.trim() || !answerInput.trim()) return;

    addFAQ(questionInput.trim(), answerInput.trim(), categoryInput);
    showToast(lang === 'or' ? 'ନୂତନ FAQ ସଫଳତାର ସହ ଯୋଡ଼ାଗଲା।' : 'New FAQ added successfully.');

    setShowModal(false);
    setQuestionInput('');
    setAnswerInput('');
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* 1. Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'or' ? 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ • ସାମ୍ସ ଇ-ନାମଲେଖା' : 'FREQUENTLY ASKED QUESTIONS • SAMS e-ADMISSION'}</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              {faqs.length} {lang === 'or' ? 'ସକ୍ରିୟ FAQ' : 'Active FAQs'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            {t.faqsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.faqsSub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0 transition"
            >
              <Plus className="w-4 h-4 mr-1.5" /> {t.addFaq}
            </button>
          )}
        </div>
      </div>

      {/* 2. Search & Category Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.searchFaqs}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-mono mr-1">{t.filterCategory}:</span>
          {categories.map((cat) => (
            <div key={cat} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {translateFaqCategory(cat, lang)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FAQ Accordion List with Responsive Controls and High-Contrast Indicator */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const displayQuestion = (lang === 'or' && DEFAULT_FAQS_ODIA[faq.id]?.question)
              ? DEFAULT_FAQS_ODIA[faq.id].question
              : faq.question;
            const displayAnswer = (lang === 'or' && DEFAULT_FAQS_ODIA[faq.id]?.answer)
              ? DEFAULT_FAQS_ODIA[faq.id].answer
              : faq.answer;
            const displayCat = translateFaqCategory(faq.category, lang);

            return (
              <div
                key={faq.id}
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 space-y-3"
              >
                {/* FAQ Header Row: Clicking anywhere opens/closes the FAQ */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  {/* Left: Category Badge & Question Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono self-start sm:self-auto border border-amber-500/30">
                      {displayCat}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {displayQuestion}
                    </h3>
                  </div>

                  {/* Right: Expand/Collapse Toggle Component */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Expand / Collapse Toggle Button Component (with distinct styling) */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : faq.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : faq.id);
                        }
                      }}
                      className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md transform hover:scale-110 active:scale-95 ${
                        isExpanded
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105 ring-2 ring-amber-400/40'
                          : 'bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 hover:shadow-amber-500/10'
                      }`}
                      title={
                        isExpanded
                          ? (lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ (Click to Collapse)' : 'Click to Collapse')
                          : (lang === 'or' ? 'ଖୋଲନ୍ତୁ (Click to Expand)' : 'Click to Expand')
                      }
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse FAQ' : 'Expand FAQ'}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                          isExpanded ? 'rotate-180 text-slate-950 stroke-[2.5]' : 'text-amber-400 stroke-[2.2]'
                        }`}
                      />
                    </span>
                  </div>
                </div>

                {/* FAQ Expanded Content */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-1 animate-fadeIn">
                    {displayAnswer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-3">
            <p>{lang === 'or' ? 'କୌଣସି FAQ ମିଳିଲା ନାହିଁ।' : `No FAQs found matching "${searchQuery || selectedCategory}".`}</p>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                {t.addFaq}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-serif flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-amber-400" />
                {lang === 'or' ? 'ନୂତନ FAQ ଯୋଡ଼ନ୍ତୁ' : 'Add New FAQ Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'or' ? 'ବର୍ଗ (Category)' : 'Category'}
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Admission">Admission (ନାମଲେଖା)</option>
                  <option value="Academics">Academics (ଶିକ୍ଷାଦାନ)</option>
                  <option value="Spot Round">Spot Round (ସ୍ପଟ୍ ରାଉଣ୍ଡ)</option>
                  <option value="Administration">Administration (ପ୍ରଶାସନ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'or' ? 'ପ୍ରଶ୍ନ (Question)' : 'Question'}
                </label>
                <input
                  type="text"
                  required
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder={lang === 'or' ? 'ଉଦାହରଣ: ନାମଲେଖା କିପରି କରିବେ?' : 'e.g. What documents are required for admission?'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'or' ? 'ଉତ୍ତର (Answer)' : 'Answer'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder={lang === 'or' ? 'ଏଠାରେ ବିସ୍ତୃତ ଉତ୍ତର ଲେଖନ୍ତୁ...' : 'Provide complete and helpful official explanation...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  {lang === 'or' ? 'ବାତିଲ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow-lg"
                >
                  {lang === 'or' ? 'FAQ ପ୍ରକାଶ କରନ୍ତୁ' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification (rendered stably at bottom) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
