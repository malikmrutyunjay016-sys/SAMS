import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_FAQS } from '../lib/defaultData';
import { FAQItem } from '../types';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const DEFAULT_FAQS_ODIA: Record<string, { question: string; answer: string; category: string }> = {
  faq_1: {
    question: "ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼ରେ +୩ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ପାଇଁ କିପରି ଆବେଦନ କରିବେ?",
    answer: "ପ୍ରାର୍ଥୀମାନେ ଅଫିସିଆଲ୍ ସାମ୍ସ ଓଡ଼ିଶା ୱେବସାଇଟ୍ (samsodisha.gov.in) ମାଧ୍ୟମରେ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼ (କଲେଜ କୋଡ୍: ୦୩୦୭୧୩୦୨) କୁ ପ୍ରଥମ ପସନ୍ଦ ଭାବେ ବାଛି ଅନଲାଇନ୍ Common Application Form (CAF) ପୂରଣ କରି ଆବେଦନ କରିପାରିବେ।",
    category: "ନାମଲେଖା"
  },
  faq_2: {
    question: "ଓଡ଼ିଶାରେ ଆପ୍ରେଣ୍ଟିସସିପ୍ ଏମ୍ବେଡେଡ୍ ଡିଗ୍ରୀ ପ୍ରୋଗ୍ରାମ୍ (AEDP) କ'ଣ?",
    answer: "ଏଇଡିପି (AEDP) ହେଉଛି ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ (DHE), ଓଡ଼ିଶା ସରକାରଙ୍କ ଏକ ପ୍ରମୁଖ ଯୁଗାନ୍ତକାରୀ ଯୋଜନା, ଯାହା UGC ମାର୍ଗଦର୍ଶିକା ଏବଂ NEP 2020 ଅନୁସାରେ ପରିଚାଳିତ। ଏଥିରେ ନିୟମିତ ଅନର୍ସ ସହିତ ୩ୟ ବର୍ଷରେ ୧ ବର୍ଷର ବାଧ୍ୟତାମୂଳକ ବେତନଯୁକ୍ତ ଶିଳ୍ପ ଶିକ୍ଷାନବିଶୀ (Apprenticeship) ପ୍ରଦାନ କରାଯାଏ। ଛାତ୍ରଛାତ୍ରୀ ମାସିକ ଷ୍ଟାଇପେଣ୍ଡ୍ ପାଆନ୍ତି। ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ ଦ୍ୱାରା ଏହି ଡିଗ୍ରୀ ସାଧାରଣ +୩ ଡିଗ୍ରୀ ସହିତ ୧୦୦% ସମତୁଲ୍ୟ ବୋଲି ପ୍ରମାଣିତ, ଯାହା ପିଜି/ମାଷ୍ଟର୍ସ ଏବଂ ପିଏଚ୍.ଡି ନାମଲେଖା ତଥା ସରକାରୀ ଚାକିରି ପରୀକ୍ଷା ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ମାନ୍ୟତାପ୍ରାପ୍ତ।",
    category: "ଶିକ୍ଷାଦାନ"
  },
  faq_5: {
    question: "ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ ବରଗଡ଼ରେ କେଉଁ ୮ ଟି ଏଇଡିପି (AEDP) ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମ ଉପଲବ୍ଧ?",
    answer: "ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ ବରଗଡ଼ରେ ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା ଅନୁମୋଦିତ ୮ ଟି ଏଇଡିପି ସ୍ୱତନ୍ତ୍ର ପାଠ୍ୟକ୍ରମ ରହିଛି: (୧) ବି.ଏ. ଅର୍ଥଶାସ୍ତ୍ର ଓ ଡାଟା ଆନାଲିଟିକ୍ସ, (୨) ବି.ଏ. ଇଂରାଜୀ ଓ ଡିଜିଟାଲ୍ ହ୍ୟୁମାନିଟିଜ୍, (୩) ବି.ଏ. ଇତିହାସ ଓ ପର୍ଯ୍ୟଟନ/ହସ୍ପିଟାଲିଟି, (୪) ବି.କମ୍ ବ୍ୟାଙ୍କିଙ୍ଗ୍, ଫାଇନାନ୍ସ ଓ ଇନସୁରାନ୍ସ (BFSI), (୫) ବି.ଏସସି ଉଦ୍ଭିଦ ବିଜ୍ଞାନ ଓ ଟିସୁ କଲଚର୍, (୬) ବି.ଏସସି ପ୍ରାଣୀ ବିଜ୍ଞାନ ଓ ଇଣ୍ଟିଗ୍ରେଟିଭ୍ ବାୟୋସାଇନ୍ସ, (୭) ବି.ଏସସି ରସାୟନ ବିଜ୍ଞାନ ଓ ଇଣ୍ଡଷ୍ଟ୍ରିଆଲ୍ କେମିଷ୍ଟ୍ରି, ଏବଂ (୮) ବି.ଏସସି ଗଣିତ ଓ କମ୍ପ୍ୟୁଟିଂ। ନାମଲେଖା ସାମ୍ସ (SAMS) ମାଧ୍ୟମରେ କରାଯାଏ।",
    category: "ଶିକ୍ଷାଦାନ"
  },
  faq_3: {
    question: "ସ୍ପଟ୍ ରାଉଣ୍ଡ ସିଟ୍ ରିପୋର୍ଟିଂ ଏବଂ ଚୟନ ପ୍ରକ୍ରିୟା କିପରି ହୁଏ?",
    answer: "ସ୍ପଟ୍ ରାଉଣ୍ଡ ସମୟରେ ଖାଲିଥିବା ସିଟ୍ ତାଲିକା ଏହି ପୋର୍ଟାଲରେ ଲାଇଭ୍ ପ୍ରଦର୍ଶିତ ହୁଏ। ଯୋଗ୍ୟ ଆବେଦନକାରୀମାନେ ପୂର୍ବାହ୍ନ ୧୦ ରୁ ଅପରାହ୍ନ ୨ ଟା ମଧ୍ୟରେ ସମସ୍ତ ମୂଳ ପ୍ରମାଣପତ୍ର ସହିତ ସାମ୍ସ ରୁମ୍ ନମ୍ବର ୧୨ ରେ ବ୍ୟକ୍ତିଗତ ଭାବେ ଉପସ୍ଥିତ ହୋଇ ରିପୋର୍ଟ କରିବା ଆବଶ୍ୟକ। ସ୍ୱୟଂଚାଳିତ ମେରିଟ୍ ମାଧ୍ୟମରେ ସିଲେକ୍ସନ୍ ତାଲିକା ପ୍ରକାଶ କରାଯାଏ।",
    category: "ସ୍ପଟ୍ ରାଉଣ୍ଡ"
  },
  faq_4: {
    question: "ପ୍ରଶାସକ କିପରି ନୂତନ FAQ ଯୋଡ଼ିପାରିବେ କିମ୍ବା ପୁରୁଣା FAQ ଡିଲିଟ୍ କରିପାରିବେ?",
    answer: "ସୁପର ଆଡମିନ୍ ଲଗଇନ୍ କରି, FAQ ଟ୍ୟାବରୁ 'Add New FAQ' ବଟନ୍ କ୍ଲିକ୍ କରି ନୂତନ ପ୍ରଶ୍ନୋତ୍ତର ଯୋଡ଼ିପାରିବେ ଏବଂ ଟ୍ରାସ୍ ଆଇକନ୍ (Delete) ବଟନ୍ କ୍ଲିକ୍ କରି ଯେକୌଣସି FAQ କୁ ତୁରନ୍ତ ଡିଲିଟ୍ କରିପାରିବେ।",
    category: "ପ୍ରଶାସନ"
  }
};

function translateFaqCategory(cat: string, lang: 'en' | 'or'): string {
  if (lang !== 'or') return cat;
  switch (cat) {
    case 'ALL':
      return 'ସମସ୍ତ (ALL)';
    case 'Admission':
    case 'ନାମଲେଖା':
      return 'ନାମଲେଖା (Admission)';
    case 'Academics':
    case 'ଶିକ୍ଷାଦାନ':
      return 'ଶିକ୍ଷାଦାନ (Academics)';
    case 'Spot Round':
    case 'ସ୍ପଟ୍ ରାଉଣ୍ଡ':
      return 'ସ୍ପଟ୍ ରାଉଣ୍ଡ (Spot Round)';
    case 'Administration':
    case 'ପ୍ରଶାସନ':
      return 'ପ୍ରଶାସନ (Admin)';
    default:
      return cat;
  }
}

export const FaqView: React.FC = () => {
  const { faqs, addFAQ, updateFAQ, deleteFAQ, t, lang } = useData();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  // Manage / Edit Mode Toggle (defaults to true)
  const [isManageMode, setIsManageMode] = useState(true);

  // Modal / Form state for Add/Edit FAQ
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Admission');

  // In-app Delete Confirmation Modal State
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);

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
    setEditingId(null);
    setQuestionInput('');
    setAnswerInput('');
    setCategoryInput('Admission');
    setShowModal(true);
  };

  const handleOpenEditModal = (faq: FAQItem) => {
    setEditingId(faq.id);
    setQuestionInput(faq.question);
    setAnswerInput(faq.answer);
    setCategoryInput(faq.category);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !answerInput.trim()) return;

    if (editingId) {
      updateFAQ(editingId, questionInput.trim(), answerInput.trim(), categoryInput);
      showToast(lang === 'or' ? 'FAQ ସଫଳତାର ସହ ସମ୍ପାଦିତ ହେଲା।' : 'FAQ updated successfully.');
    } else {
      addFAQ(questionInput.trim(), answerInput.trim(), categoryInput);
      showToast(lang === 'or' ? 'ନୂତନ FAQ ସଫଳତାର ସହ ଯୋଡ଼ାଗଲା।' : 'New FAQ added successfully.');
    }

    setShowModal(false);
    setEditingId(null);
    setQuestionInput('');
    setAnswerInput('');
  };

  // Immediate reliable delete function
  const confirmDeleteFaq = () => {
    if (!faqToDelete) return;
    const targetId = faqToDelete.id;
    deleteFAQ(targetId);
    showToast(lang === 'or' ? `FAQ ଡିଲିଟ୍ ହେଲା: "${faqToDelete.question.slice(0, 30)}..."` : `Deleted FAQ: "${faqToDelete.question.slice(0, 35)}..."`);
    setFaqToDelete(null);
  };

  const handleResetDefaultFaqs = () => {
    // Add any missing default FAQs
    const currentQuestions = new Set(faqs.map((f) => f.question.toLowerCase().trim()));
    let addedCount = 0;
    DEFAULT_FAQS.forEach((df) => {
      if (!currentQuestions.has(df.question.toLowerCase().trim())) {
        addFAQ(df.question, df.answer, df.category);
        addedCount++;
      }
    });
    showToast(addedCount > 0 ? (lang === 'or' ? `${addedCount} ଟି ଡିଫଲ୍ଟ FAQ ପୁନରୁଦ୍ଧାର ହେଲା।` : `Restored ${addedCount} default FAQs.`) : (lang === 'or' ? 'ସମସ୍ତ ଡିଫଲ୍ଟ FAQ ପୂର୍ବରୁ ବିଦ୍ୟମାନ।' : 'All default FAQs are already present.'));
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title Header */}
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
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center transition border ${
              isManageMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Edit / Delete Management controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            {isManageMode ? t.manageModeOn : t.manageModeOff}
          </button>

          {isManageMode && (
            <>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0 transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> {t.addFaq}
              </button>

              <button
                onClick={handleResetDefaultFaqs}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center border border-slate-700 transition"
                title="Restore official default FAQs if deleted"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> {t.restoreDefaults}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
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
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {translateFaqCategory(cat, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List with In-App Edit & Delete Controls */}
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
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-3"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono self-start sm:self-auto border border-amber-500/30">
                      {displayCat}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{displayQuestion}</h3>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isManageMode && (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(faq)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition border border-slate-700"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFaqToDelete(faq);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs transition border border-red-500/40"
                          title={lang === 'or' ? 'FAQ ଡିଲିଟ୍ କରନ୍ତୁ' : 'Delete FAQ'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

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
            {isManageMode && (
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                {t.addFaq}
              </button>
            )}
          </div>
        )}
      </div>

      {/* In-App Custom Delete Confirmation Modal */}
      {faqToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {lang === 'or' ? 'FAQ ଡିଲିଟ୍ ନିଶ୍ଚିତ କରନ୍ତୁ' : 'Confirm Delete FAQ'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang === 'or' ? `ବର୍ଗ: ${translateFaqCategory(faqToDelete.category, lang)}` : `Category: ${faqToDelete.category}`}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                {lang === 'or' ? 'ଡିଲିଟ୍ ହେବାକୁ ଥିବା ପ୍ରଶ୍ନ:' : 'Question to delete:'}
              </span>
              <p className="font-semibold text-slate-200 text-xs leading-snug">&quot;{faqToDelete.question}&quot;</p>
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'or'
                ? 'ଆପଣ ନିଶ୍ଚିତ କି ଏହି FAQ ଟିକୁ ସମ୍ପୂର୍ଣ୍ଣ ଡିଲିଟ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି? ଏହା ସାମ୍ସ FAQ ଡାଟାବେସରୁ ସବୁଦିନ ପାଇଁ ଅପସାରିତ ହେବ।'
                : 'Are you sure you want to delete this FAQ item? It will be permanently removed from the SAMS FAQs database across all devices.'}
            </p>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                {lang === 'or' ? 'ବାତିଲ କରନ୍ତୁ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteFaq}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center transition"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {lang === 'or' ? 'ହଁ, ଡିଲିଟ୍ କରନ୍ତୁ' : 'Yes, Delete FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-serif flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-amber-400" />
                {editingId
                  ? (lang === 'or' ? 'FAQ ସମ୍ପାଦନ କରନ୍ତୁ' : 'Edit FAQ Item')
                  : (lang === 'or' ? 'ନୂତନ FAQ ଯୋଡ଼ନ୍ତୁ' : 'Add New FAQ Item')}
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
                  {editingId
                    ? (lang === 'or' ? 'ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ' : 'Save Changes')
                    : (lang === 'or' ? 'FAQ ପ୍ରକାଶ କରନ୍ତୁ' : 'Publish FAQ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
