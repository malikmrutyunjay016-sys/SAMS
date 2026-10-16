import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_FAQS } from '../lib/defaultData';
import { FAQItem } from '../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  Search,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  AlertTriangle,
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
  const { faqs, addFAQ, updateFAQ, deleteFAQ, t, lang } = useData();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  // Manage / Edit Mode Toggle (defaults to true for easy access)
  const [isManageMode, setIsManageMode] = useState(true);

  // Modal / Form state for Add/Edit FAQ
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Admission');

  // In-app Delete Confirmation Modal State
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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
    setCategoryInput(selectedCategory !== 'ALL' ? selectedCategory : 'Admission');
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

  // Immediate reliable delete function for FAQ item
  const confirmDeleteFaq = () => {
    if (!faqToDelete) return;
    const targetId = faqToDelete.id;
    const targetQuestion = faqToDelete.question;
    deleteFAQ(targetId);
    showToast(
      lang === 'or'
        ? `FAQ ଡିଲିଟ୍ ହେଲା: "${targetQuestion.slice(0, 30)}..."`
        : `Deleted FAQ: "${targetQuestion.slice(0, 35)}..."`
    );
    setFaqToDelete(null);
  };

  // Immediate reliable delete function for Category Tab
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catName = categoryToDelete;
    const targets = faqs.filter((f) => f.category === catName);
    targets.forEach((f) => deleteFAQ(f.id));
    setSelectedCategory('ALL');
    setCategoryToDelete(null);
    showToast(
      lang === 'or'
        ? `"${catName}" ବର୍ଗ ଟ୍ୟାବ୍ ର ସମସ୍ତ ${targets.length} ଟି FAQ ସଫଳତାର ସହ ଡିଲିଟ୍ ହେଲା।`
        : `Deleted "${catName}" tab and all its ${targets.length} FAQs.`
    );
  };

  const handleResetDefaultFaqs = () => {
    const currentQuestions = new Set(faqs.map((f) => f.question.toLowerCase().trim()));
    let addedCount = 0;
    DEFAULT_FAQS.forEach((df) => {
      if (!currentQuestions.has(df.question.toLowerCase().trim())) {
        addFAQ(df.question, df.answer, df.category);
        addedCount++;
      }
    });
    showToast(
      addedCount > 0
        ? (lang === 'or' ? `${addedCount} ଟି ଡିଫଲ୍ଟ FAQ ପୁନରୁଦ୍ଧାର ହେଲା।` : `Restored ${addedCount} default FAQs.`)
        : (lang === 'or' ? 'ସମସ୍ତ ଡିଫଲ୍ଟ FAQ ପୂର୍ବରୁ ବିଦ୍ୟମାନ।' : 'All default FAQs are already present.')
    );
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
          <button
            type="button"
            onClick={() => setIsManageMode(!isManageMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center transition border ${
              isManageMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
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
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0 transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> {t.addFaq}
              </button>

              <button
                type="button"
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

          {/* Delete Category Tab button when a specific category tab is selected */}
          {selectedCategory !== 'ALL' && (
            <button
              type="button"
              onClick={() => setCategoryToDelete(selectedCategory)}
              className="ml-2 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-bold flex items-center transition shadow-sm"
              title={lang === 'or' ? `"${selectedCategory}" ବର୍ଗ ଟ୍ୟାବ୍ ଓ ଏହାର ସମସ୍ତ FAQ ଡିଲିଟ୍ କରନ୍ତୁ` : `Delete "${selectedCategory}" Tab and its FAQs`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-red-400" />
              {lang === 'or' ? 'ଟ୍ୟାବ୍ ଡିଲିଟ୍ କରନ୍ତୁ' : 'Delete Tab'}
            </button>
          )}
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

                  {/* Right: Controls & Expand/Collapse Toggle Component */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Management Edit & Delete Action Buttons */}
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(faq)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs transition border border-slate-700 hover:border-amber-500/40"
                        title={lang === 'or' ? 'FAQ ସମ୍ପାଦନ କରନ୍ତୁ' : 'Edit FAQ'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFaqToDelete(faq)}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white text-xs transition border border-red-500/40 hover:border-red-500/60"
                        title={lang === 'or' ? 'FAQ ଡିଲିଟ୍ କରନ୍ତୁ' : 'Delete FAQ'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

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
            {isManageMode && (
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

      {/* Delete FAQ Confirmation Modal */}
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

      {/* Delete Category Tab Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {lang === 'or' ? 'ବର୍ଗ ଟ୍ୟାବ୍ ଡିଲିଟ୍ ନିଶ୍ଚିତ କରନ୍ତୁ' : 'Confirm Delete Category Tab'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang === 'or' ? `ବର୍ଗ: ${categoryToDelete}` : `Category: ${categoryToDelete}`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'or'
                ? `ଆପଣ "${categoryToDelete}" ଟ୍ୟାବ୍ ଏବଂ ଏଥିରେ ଥିବା ସମସ୍ତ FAQ ଡିଲିଟ୍ କରିବାକୁ ନିଶ୍ଚିତ କି? ଏହି କାର୍ଯ୍ୟ ଅପରିବର୍ତ୍ତନୀୟ।`
                : `Are you sure you want to delete the "${categoryToDelete}" tab and all questions assigned to it? This action will remove all FAQs under this category.`}
            </p>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                {lang === 'or' ? 'ବାତିଲ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center transition"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                {lang === 'or' ? 'ସମସ୍ତ ଡିଲିଟ୍ କରନ୍ତୁ' : 'Delete Tab & FAQs'}
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
