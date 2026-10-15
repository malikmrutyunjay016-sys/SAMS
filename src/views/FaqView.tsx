import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, Plus, Search, Edit2, Trash2, CheckCircle2, X, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const FaqView: React.FC = () => {
  const { faqs, addFAQ, updateFAQ, deleteFAQ } = useData();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  // Modal / Form state for Add/Edit FAQ
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Admission');

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

  const handleOpenEditModal = (faq: any) => {
    setEditingId(faq.id);
    setQuestionInput(faq.question);
    setAnswerInput(faq.answer);
    setCategoryInput(faq.category);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput || !answerInput) return;

    if (editingId) {
      updateFAQ(editingId, questionInput, answerInput, categoryInput);
    } else {
      addFAQ(questionInput, answerInput, categoryInput);
    }

    setShowModal(false);
    setEditingId(null);
    setQuestionInput('');
    setAnswerInput('');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>FREQUENTLY ASKED QUESTIONS &bull; SAMS e-ADMISSION</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Student & Admission Help FAQs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Common questions regarding +3 Degree e-Admission, spot rounds, fees, and college policies.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs flex items-center shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New FAQ (Super Admin)
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
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

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-2"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">{faq.question}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal(faq)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs"
                          title="Edit FAQ Answer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this FAQ item?')) deleteFAQ(faq.id);
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-red-900/40 text-red-400 text-xs"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="p-1 rounded bg-slate-800 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed pl-2 whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No FAQs found matching your search.
          </div>
        )}
      </div>

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
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
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
