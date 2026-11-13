import React, { useState, useMemo, useEffect } from 'react';
import { Student, StudentStatus } from '../types';
import { useData } from '../context/DataContext';
import {
  inferSessionFromStudent,
  inferRollBarcodeSession,
} from '../lib/counsellingService';
import { compareRollNumbers } from '../lib/excelParser';
import {
  X,
  Users,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';

interface BatchCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBatch?: string;
  canEdit: boolean;
  scopedDeptName?: string | null;
  onSaved?: (updatedCount: number, summaryMsg: string) => void;
}

const BATCH_DEFS = [
  { id: '2026-27', label: '2026-27', yearTag: '1st Year (Current)' },
  { id: '2025-26', label: '2025-26', yearTag: '2nd Year (1 Yr Ago)' },
  { id: '2024-25', label: '2024-25', yearTag: '3rd Year (2 Yrs Ago)' },
];

interface PendingBatchEdit {
  academicYear?: string;
  isClcTaken?: boolean;
  batchCorrected?: boolean;
}

export const BatchCorrectionModal: React.FC<BatchCorrectionModalProps> = ({
  isOpen,
  onClose,
  initialBatch = '2026-27',
  canEdit,
  scopedDeptName,
  onSaved,
}) => {
  const { students, bulkUpdateStudentBatches } = useData();

  const [activeBatchTab, setActiveBatchTab] = useState<string>(
    initialBatch === 'ALL' ? 'ALL' : initialBatch || '2026-27'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLC' | 'MISMATCH'>('ACTIVE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingBatchEdit>>({});
  const [page, setPage] = useState(1);
  const pageSize = 30;

  useEffect(() => {
    if (isOpen) {
      setActiveBatchTab(initialBatch || '2026-27');
      setPendingEdits({});
      setSelectedIds(new Set());
      setSearchQuery('');
      setStreamFilter('ALL');
      setStatusFilter('ACTIVE');
      setPage(1);
    }
  }, [isOpen, initialBatch]);

  // Scope to HOD department if scopedDeptName is provided
  const scopedStudents = useMemo(() => {
    if (!scopedDeptName) return students;
    const h = scopedDeptName.toLowerCase().trim();
    return students.filter((s) => {
      const d = (s.department || '').toLowerCase().trim();
      return d === h || d.includes(h) || h.includes(d);
    });
  }, [students, scopedDeptName]);

  // Helper to resolve current vs staged batch & CLC status for each student
  const getOriginalBatch = (s: Student) =>
    inferSessionFromStudent(s.academicYear, s, s.rollNo, s.samsRegNo);

  const getEffectiveBatch = (s: Student) => {
    const edit = pendingEdits[s.id];
    if (edit?.academicYear) return edit.academicYear;
    return getOriginalBatch(s);
  };

  const getEffectiveIsClc = (s: Student) => {
    const edit = pendingEdits[s.id];
    if (edit?.isClcTaken !== undefined) return edit.isClcTaken;
    return Boolean(s.isClcTaken || s.status === 'CLC Taken');
  };

  // Detect roll/barcode vs stored academicYear mismatches
  const mismatchedStudentIds = useMemo(() => {
    const list: Array<{ id: string; targetBatch: string }> = [];
    scopedStudents.forEach((s) => {
      if (s.batchCorrected) return;
      const expectedFromId = inferRollBarcodeSession(s.rollNo, s.samsRegNo);
      if (expectedFromId && s.academicYear !== expectedFromId) {
        list.push({ id: s.id, targetBatch: expectedFromId });
      }
    });
    return list;
  }, [scopedStudents]);

  // Compute live Before vs After stats per batch
  const batchStats = useMemo(() => {
    return BATCH_DEFS.map((b) => {
      let origActive = 0;
      let origClc = 0;
      let nextActive = 0;
      let nextClc = 0;

      scopedStudents.forEach((s) => {
        const origB = getOriginalBatch(s);
        const origIsClc = Boolean(s.isClcTaken || s.status === 'CLC Taken');
        if (origB === b.id) {
          if (origIsClc) origClc++;
          else origActive++;
        }

        const effB = getEffectiveBatch(s);
        const effIsClc = getEffectiveIsClc(s);
        if (effB === b.id) {
          if (effIsClc) nextClc++;
          else nextActive++;
        }
      });

      return {
        ...b,
        origActive,
        origClc,
        origTotal: origActive + origClc,
        nextActive,
        nextClc,
        nextTotal: nextActive + nextClc,
        delta: nextActive - origActive,
      };
    });
  }, [scopedStudents, pendingEdits]);

  const totalOrigActive = batchStats.reduce((sum, b) => sum + b.origActive, 0);
  const totalNextActive = batchStats.reduce((sum, b) => sum + b.nextActive, 0);

  // Filtered students for the modal table
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const mismatchSet = new Set(mismatchedStudentIds.map((m) => m.id));

    return scopedStudents
      .filter((s) => {
        const effBatch = getEffectiveBatch(s);
        const effIsClc = getEffectiveIsClc(s);

        if (activeBatchTab !== 'ALL' && effBatch !== activeBatchTab) return false;
        if (streamFilter !== 'ALL' && s.stream !== streamFilter) return false;

        if (statusFilter === 'ACTIVE' && effIsClc) return false;
        if (statusFilter === 'CLC' && !effIsClc) return false;
        if (statusFilter === 'MISMATCH' && !mismatchSet.has(s.id)) return false;

        if (q) {
          const match =
            (s.name || '').toLowerCase().includes(q) ||
            (s.rollNo || '').toLowerCase().includes(q) ||
            (s.universityRollNo || '').toLowerCase().includes(q) ||
            (s.samsRegNo || '').toLowerCase().includes(q) ||
            (s.department || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));
  }, [
    scopedStudents,
    pendingEdits,
    activeBatchTab,
    streamFilter,
    statusFilter,
    searchQuery,
    mismatchedStudentIds,
  ]);

  // Stream breakdown for the currently selected batch
  const selectedBatchStreamBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    scopedStudents.forEach((s) => {
      if (getEffectiveIsClc(s)) return;
      const b = getEffectiveBatch(s);
      if (activeBatchTab !== 'ALL' && b !== activeBatchTab) return;
      const st = s.stream || 'Other';
      map.set(st, (map.get(st) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [scopedStudents, pendingEdits, activeBatchTab]);

  useEffect(() => {
    setPage(1);
  }, [activeBatchTab, streamFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingEditCount = Object.keys(pendingEdits).length;

  if (!isOpen) return null;

  const stageStudentEdit = (
    stu: Student,
    patch: Partial<PendingBatchEdit>
  ) => {
    if (!canEdit) return;
    setPendingEdits((prev) => {
      const existing = prev[stu.id] || {};
      const merged: PendingBatchEdit = { ...existing, ...patch };
      const origBatch = getOriginalBatch(stu);
      const origClc = Boolean(stu.isClcTaken || stu.status === 'CLC Taken');

      const effBatch = merged.academicYear ?? origBatch;
      const effClc = merged.isClcTaken ?? origClc;

      // Remove if identical to original
      if (effBatch === origBatch && effClc === origClc && !merged.batchCorrected) {
        const copy = { ...prev };
        delete copy[stu.id];
        return copy;
      }
      return { ...prev, [stu.id]: merged };
    });
  };

  const handleBulkMoveSelected = (targetBatch: string) => {
    if (!canEdit || selectedIds.size === 0) return;
    setPendingEdits((prev) => {
      const next = { ...prev };
      scopedStudents.forEach((s) => {
        if (selectedIds.has(s.id)) {
          next[s.id] = {
            ...(next[s.id] || {}),
            academicYear: targetBatch,
            batchCorrected: true,
          };
        }
      });
      return next;
    });
  };

  const handleBulkToggleClc = (markClc: boolean) => {
    if (!canEdit || selectedIds.size === 0) return;
    setPendingEdits((prev) => {
      const next = { ...prev };
      scopedStudents.forEach((s) => {
        if (selectedIds.has(s.id)) {
          next[s.id] = {
            ...(next[s.id] || {}),
            isClcTaken: markClc,
          };
        }
      });
      return next;
    });
  };

  const handleStageAutoFixFromRollBarcode = () => {
    if (!canEdit || mismatchedStudentIds.length === 0) return;
    setPendingEdits((prev) => {
      const next = { ...prev };
      mismatchedStudentIds.forEach((m) => {
        next[m.id] = {
          ...(next[m.id] || {}),
          academicYear: m.targetBatch,
          batchCorrected: false,
        };
      });
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    const pageIds = pagedRows.map((s) => s.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveChanges = () => {
    if (!canEdit) return;
    const updates = Object.entries(pendingEdits).map(([id, edit]) => {
      const stu = scopedStudents.find((s) => s.id === id);
      const nextStatus: StudentStatus | undefined =
        edit.isClcTaken !== undefined
          ? edit.isClcTaken
            ? 'CLC Taken'
            : stu?.status === 'CLC Taken' || !stu?.status
            ? 'Admitted'
            : stu.status
          : undefined;
      return {
        id,
        academicYear: edit.academicYear,
        isClcTaken: edit.isClcTaken,
        status: nextStatus,
        batchCorrected:
          edit.batchCorrected !== undefined
            ? edit.batchCorrected
            : edit.academicYear !== undefined,
      };
    });

    const updatedCount = bulkUpdateStudentBatches(updates);
    setPendingEdits({});
    setSelectedIds(new Set());
    if (onSaved) {
      onSaved(
        updatedCount,
        `Updated batch / student count for ${updatedCount} student record(s).`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-[11px] font-mono uppercase">
              <Layers className="w-4 h-4" />
              <span>
                Admission Batch Overview & Student Count Correction
                {scopedDeptName ? ` • ${scopedDeptName}` : ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-serif mt-0.5">
              View Admission Batches & Correct Batch Student Counts
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && mismatchedStudentIds.length > 0 && (
              <button
                type="button"
                onClick={handleStageAutoFixFromRollBarcode}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center transition"
                title="Sync stored academicYear with Roll No / SAMS Barcode year prefix (24-, 25-, 26-)"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Auto-Sync Roll/Barcode Mismatches ({mismatchedStudentIds.length})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Batch Summary Cards (4 Interactive Cards) */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {batchStats.map((b) => {
              const isSelected = activeBatchTab === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBatchTab(b.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-mono text-amber-300">
                      Batch {b.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {b.yearTag}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">
                      {b.nextActive}
                    </span>
                    {b.delta !== 0 && (
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          b.delta > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {b.origActive} <ArrowRight className="w-3 h-3 inline" /> {b.nextActive} (
                        {b.delta > 0 ? `+${b.delta}` : b.delta})
                      </span>
                    )}
                    <span className="text-[11px] text-emerald-400 font-mono ml-auto">
                      Active
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                    <span>CLC Taken: {b.nextClc}</span>
                    <span>Total DB: {b.nextTotal}</span>
                  </div>
                </button>
              );
            })}

            {/* 4th Card: All Batches Combined */}
            <button
              type="button"
              onClick={() => setActiveBatchTab('ALL')}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                activeBatchTab === 'ALL'
                  ? 'bg-emerald-500/15 border-emerald-400 shadow-lg ring-1 ring-emerald-400/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-mono text-emerald-300">
                  All Batches Combined
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {totalNextActive}
                </span>
                {totalNextActive !== totalOrigActive && (
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    was {totalOrigActive}
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 font-mono ml-auto">
                  Active
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                <span>Total Records: {scopedStudents.length}</span>
                <span>{canEdit ? 'Editable' : 'View Only'}</span>
              </div>
            </button>
          </div>

          {/* Stream-wise Active Count Pills for the Selected Batch */}
          {selectedBatchStreamBreakdown.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-bold">
                {activeBatchTab === 'ALL' ? 'All Batches' : `Batch ${activeBatchTab}`} Stream Counts:
              </span>
              {selectedBatchStreamBreakdown.map(([streamName, count]) => (
                <span
                  key={streamName}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {streamName}: <strong className="text-amber-300">{count}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Filter & Bulk Action Toolbar */}
        <div className="p-3 sm:px-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student name, college roll, barcode, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Streams</option>
            <option value="Arts">Arts</option>
            <option value="Physical Science">Physical Science</option>
            <option value="Biological Science">Biological Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Self Financing">Self Financing</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="ACTIVE">Active Students Only</option>
            <option value="CLC">CLC Taken Only</option>
            <option value="ALL">All (Active + CLC)</option>
            <option value="MISMATCH">
              Roll/Barcode Mismatches ({mismatchedStudentIds.length})
            </option>
          </select>

          <span className="text-[11px] font-mono text-slate-400 ml-auto">
            Showing <strong className="text-white">{filteredRows.length}</strong> students
          </span>
        </div>

        {/* Bulk Selection Action Bar */}
        {canEdit && selectedIds.size > 0 && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-amber-300 font-mono">
              {selectedIds.size} student(s) selected — Move to Batch or Correct Status:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {BATCH_DEFS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleBulkMoveSelected(b.id)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition"
                >
                  Move to {b.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleBulkToggleClc(false)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]"
              >
                Mark Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggleClc(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px]"
              >
                Mark CLC Taken
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px]"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="flex-1 overflow-auto p-3 sm:p-4">
          {!canEdit && (
            <div className="mb-3 bg-blue-500/10 border border-blue-500/30 text-blue-200 px-3 py-2 rounded-xl text-xs flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-blue-400 shrink-0" />
              <span>
                You are viewing batch counts in read-only mode. Log in as Super Admin or HOD to move students between batches or correct student counts.
              </span>
            </div>
          )}

          {pagedRows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              No student records match the selected batch & filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0">
                  <tr>
                    {canEdit && (
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            pagedRows.length > 0 &&
                            pagedRows.every((s) => selectedIds.has(s.id))
                          }
                          onChange={toggleSelectAllPage}
                          className="rounded border-slate-600 bg-slate-900 accent-amber-500 cursor-pointer"
                          title="Select all on current page"
                        />
                      </th>
                    )}
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">SAMS Barcode</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Stream & Honours</th>
                    <th className="py-2.5 px-3">Roll Hint</th>
                    <th className="py-2.5 px-3">Assigned Batch</th>
                    <th className="py-2.5 px-3">Active / CLC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pagedRows.map((stu) => {
                    const effBatch = getEffectiveBatch(stu);
                    const effClc = getEffectiveIsClc(stu);
                    const rollHint = inferRollBarcodeSession(stu.rollNo, stu.samsRegNo);
                    const isStaged = Boolean(pendingEdits[stu.id]);
                    const hasMismatch =
                      Boolean(rollHint) && rollHint !== effBatch && !stu.batchCorrected;

                    return (
                      <tr
                        key={stu.id}
                        className={`transition ${
                          isStaged
                            ? 'bg-amber-500/10 hover:bg-amber-500/15'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {canEdit && (
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(stu.id)}
                              onChange={() => toggleSelectRow(stu.id)}
                              className="rounded border-slate-600 bg-slate-900 accent-amber-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2 px-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                          {stu.rollNo || 'N/A'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">
                          {stu.samsRegNo || 'N/A'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">
                          {stu.name}
                          {isStaged && (
                            <span className="ml-1.5 text-[9px] font-mono bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                              EDITED
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="text-purple-300 font-semibold">{stu.stream}</span>
                          <span className="text-slate-500 mx-1">&bull;</span>
                          <span className="text-slate-200">{stu.department}</span>
                        </td>
                        <td className="py-2 px-3 font-mono whitespace-nowrap">
                          {rollHint ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                hasMismatch
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {rollHint}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {canEdit ? (
                            <select
                              value={effBatch}
                              onChange={(e) =>
                                stageStudentEdit(stu, {
                                  academicYear: e.target.value,
                                  batchCorrected: true,
                                })
                              }
                              className={`bg-slate-950 border rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 ${
                                isStaged
                                  ? 'border-amber-400 text-amber-300'
                                  : 'border-slate-700 text-slate-200'
                              }`}
                            >
                              <option value="2026-27">2026-27 (1st Yr)</option>
                              <option value="2025-26">2025-26 (2nd Yr)</option>
                              <option value="2024-25">2024-25 (3rd Yr)</option>
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-bold">
                              {effBatch}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() =>
                                stageStudentEdit(stu, { isClcTaken: !effClc })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                                effClc
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                              title="Toggle Active vs CLC Taken to adjust active student count in batch"
                            >
                              {effClc ? 'CLC Taken (Excluded)' : 'Active (Counted)'}
                            </button>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                effClc
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {effClc ? 'CLC Taken' : 'Active'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with Pagination & Save Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <strong className="text-white">{safePage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {canEdit && pendingEditCount > 0 && (
              <button
                type="button"
                onClick={() => setPendingEdits({})}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
              >
                Discard ({pendingEditCount})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Close
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={pendingEditCount === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-extrabold flex items-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>
                  {pendingEditCount > 0
                    ? `Save Batch Corrections (${pendingEditCount})`
                    : 'Save Batch Corrections'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
