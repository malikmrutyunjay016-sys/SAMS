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

export const FaqView: React.FC = () => {
  const { faqs, addFAQ, updateFAQ, deleteFAQ } = useData();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  // Manage / Edit Mode Toggle (defaults to true if logged in as Admin, or toggleable)
  const [isManageMode, setIsManageMode] = useState(true);

  // Modal / Form state for Add/Edit FAQ
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Admission');

  // In-app Delete Confirmation Modal State (No window.confirm!)
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
    const matchesSearch =
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
      showToast('FAQ updated successfully.');
    } else {
      addFAQ(questionInput.trim(), answerInput.trim(), categoryInput);
      showToast('New FAQ added successfully.');
    }

    setShowModal(false);
    setEditingId(null);
    setQuestionInput('');
    setAnswerInput('');
  };

  const confirmDeleteFaq = () => {
    if (!faqToDelete) return;
    deleteFAQ(faqToDelete.id);
    showToast(`Deleted FAQ: "${faqToDelete.question.slice(0, 35)}..."`);
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
    showToast(addedCount > 0 ? `Restored ${addedCount} default FAQs.` : 'All default FAQs are already present.');
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
            <span>FREQUENTLY ASKED QUESTIONS &bull; SAMS e-ADMISSION</span>
            <span className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              {faqs.length} Active FAQs
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Student & Admission Help FAQs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official answers regarding +3 Degree admission, Apprenticeship Embedded Degree Programme (AEDP), spot round merit list, and college policies.
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
            {isManageMode ? 'Manage Mode: ON' : 'Enable Manage Mode'}
          </button>

          {isManageMode && (
            <>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0 transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add New FAQ
              </button>

              <button
                onClick={handleResetDefaultFaqs}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center border border-slate-700 transition"
                title="Restore official default FAQs if deleted"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Restore Defaults
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
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-mono mr-1">Filter Category:</span>
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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List with In-App Edit & Delete Controls */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
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
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{faq.question}</h3>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isManageMode && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(faq)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition border border-slate-700"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFaqToDelete(faq)}
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs transition border border-red-500/40"
                          title="Delete FAQ"
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
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-3">
            <p>No FAQs found matching &quot;{searchQuery || selectedCategory}&quot;.</p>
            {isManageMode && (
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Add FAQ in &quot;{selectedCategory}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      {/* In-App Custom Delete Confirmation Modal (NO window.confirm!) */}
      {faqToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Confirm Delete FAQ</h3>
                <span className="text-[10px] text-slate-400 font-mono">Category: {faqToDelete.category}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Question to delete:</span>
              <p className="font-semibold text-slate-200 text-xs leading-snug">&quot;{faqToDelete.question}&quot;</p>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to delete this FAQ item? It will be permanently removed from the SAMS FAQs database across all devices.
            </p>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFaq}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center transition"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Yes, Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 relative space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-amber-400 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" />
              {editingId ? 'Edit FAQ Question & Answer' : 'Add New FAQ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Admission">Admission</option>
                  <option value="Academics">Academics</option>
                  <option value="Spot Round">Spot Round</option>
                  <option value="Administration">Administration</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. What documents are required for admission?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Answer</label>
                <textarea
                  rows={5}
                  required
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Provide detailed answer..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {editingId ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
