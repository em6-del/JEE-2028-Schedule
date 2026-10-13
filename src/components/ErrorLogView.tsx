import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ErrorLogItem, ErrorReasonType, SubjectType } from '../types';
import { SUBJECT_THEMES } from '../utils/theme';

interface ErrorLogViewProps {
  errorLogs: ErrorLogItem[];
  setErrorLogs: React.Dispatch<React.SetStateAction<ErrorLogItem[]>>;
  onAwardXP?: (
    points: number,
    actionTitle: string,
    category: 'error_log',
    subject?: SubjectType
  ) => void;
}

const ERROR_REASONS: ErrorReasonType[] = [
  'Calculation / Silly Error',
  'Conceptual Gap',
  'Misread Question / Trap',
  'Formula Forgotten',
  'Time Pressure / Speed',
];

export function ErrorLogView({ errorLogs, setErrorLogs, onAwardXP }: ErrorLogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<
    'All' | 'Physics' | 'Chemistry' | 'Mathematics'
  >('All');
  const [selectedReason, setSelectedReason] = useState<'All' | ErrorReasonType>(
    'All'
  );
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | 'needs_revision' | 'mastered'
  >('All');

  // Modal for new error
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [questionRef, setQuestionRef] = useState('');
  const [subject, setSubject] = useState<
    'Physics' | 'Chemistry' | 'Mathematics'
  >('Physics');
  const [chapter, setChapter] = useState('');
  const [errorType, setErrorType] =
    useState<ErrorReasonType>('Calculation / Silly Error');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [correctConcept, setCorrectConcept] = useState('');

  // Toggle status
  const handleToggleStatus = (id: string) => {
    const targetErr = errorLogs.find((e) => e.id === id);
    setErrorLogs((prev) =>
      prev.map((err) => {
        if (err.id === id) {
          const nextStatus =
            err.status === 'needs_revision' ? 'mastered' : 'needs_revision';
          if (nextStatus === 'mastered') {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
            onAwardXP?.(
              45,
              `Mastered Mock Error: ${err.chapter} (${err.questionRef})`,
              'error_log',
              err.subject
            );
          }
          return { ...err, status: nextStatus };
        }
        return err;
      })
    );
  };

  const handleDelete = (id: string) => {
    setErrorLogs((prev) => prev.filter((err) => err.id !== id));
  };

  const handleAddError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionRef.trim() || !mistakeDescription.trim() || !correctConcept.trim())
      return;

    const newItem: ErrorLogItem = {
      id: `err-${Date.now()}`,
      questionRef: questionRef.trim(),
      subject,
      chapter: chapter.trim() || 'General Unit',
      errorType,
      mistakeDescription: mistakeDescription.trim(),
      correctConcept: correctConcept.trim(),
      status: 'needs_revision',
      dateLogged: new Date().toISOString().split('T')[0],
    };

    setErrorLogs((prev) => [newItem, ...prev]);

    onAwardXP?.(
      20,
      `Analyzed Test Mistake: ${newItem.chapter} (${newItem.questionRef})`,
      'error_log',
      newItem.subject
    );

    // reset
    setQuestionRef('');
    setChapter('');
    setMistakeDescription('');
    setCorrectConcept('');
    setIsAddModalOpen(false);
  };

  // Calculations for analytics
  const totalErrors = errorLogs.length;
  const needsRevisionCount = errorLogs.filter(
    (e) => e.status === 'needs_revision'
  ).length;
  const masteredCount = errorLogs.filter((e) => e.status === 'mastered').length;

  // Breakdown by reason
  const reasonCounts: Record<ErrorReasonType, number> = {
    'Calculation / Silly Error': 0,
    'Conceptual Gap': 0,
    'Misread Question / Trap': 0,
    'Formula Forgotten': 0,
    'Time Pressure / Speed': 0,
  };
  errorLogs.forEach((e) => {
    if (reasonCounts[e.errorType] !== undefined) {
      reasonCounts[e.errorType]++;
    }
  });

  const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const topReason = sortedReasons[0];

  // Filtering
  const filteredLogs = errorLogs.filter((item) => {
    const matchesSubject =
      selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesReason =
      selectedReason === 'All' || item.errorType === selectedReason;
    const matchesStatus =
      selectedStatus === 'All' || item.status === selectedStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.questionRef.toLowerCase().includes(query) ||
      item.chapter.toLowerCase().includes(query) ||
      item.mistakeDescription.toLowerCase().includes(query) ||
      item.correctConcept.toLowerCase().includes(query);

    return matchesSubject && matchesReason && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              JEE Error Notebook & Mistake Diary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The #1 secret to cracking JEE: Log why you got a problem wrong and review until mastered
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Mistake</span>
          </button>
        </div>

        {/* Diagnostic Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Logged</span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {totalErrors} Questions
            </span>
          </div>

          <div className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-xl p-3">
            <span className="text-rose-700 dark:text-rose-300 block text-[11px] font-medium">
              Needs Revision
            </span>
            <span className="text-base font-bold text-rose-900 dark:text-rose-200 font-mono">
              {needsRevisionCount} Active
            </span>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-3">
            <span className="text-emerald-700 dark:text-emerald-300 block text-[11px] font-medium">
              Rectified / Mastered
            </span>
            <span className="text-base font-bold text-emerald-900 dark:text-emerald-200 font-mono">
              {masteredCount} ({totalErrors > 0 ? Math.round((masteredCount / totalErrors) * 100) : 0}%)
            </span>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-3">
            <span className="text-amber-800 dark:text-amber-300 block text-[11px] font-medium">
              Primary Error Cause
            </span>
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate block mt-0.5" title={topReason ? topReason[0] : 'None'}>
              {topReason && topReason[1] > 0 ? topReason[0] : 'None yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors duration-150">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question, formula, concept..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Subject Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map(
              (sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                    selectedSubject === sub
                      ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              )
            )}
          </div>
        </div>

        {/* Reason and Status Dropdown Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Error Type:</span>
            <select
              value={selectedReason}
              onChange={(e) =>
                setSelectedReason(e.target.value as 'All' | ErrorReasonType)
              }
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="All" className="dark:bg-slate-800">All Error Types</option>
              {ERROR_REASONS.map((r) => (
                <option key={r} value={r} className="dark:bg-slate-800">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as 'All' | 'needs_revision' | 'mastered'
                )
              }
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="All" className="dark:bg-slate-800">All Statuses</option>
              <option value="needs_revision" className="dark:bg-slate-800">Needs Revision (Pending)</option>
              <option value="mastered" className="dark:bg-slate-800">Mastered (Rectified)</option>
            </select>
          </div>

          <span className="text-slate-400 dark:text-slate-500 ml-auto">
            Showing {filteredLogs.length} of {totalErrors} errors
          </span>
        </div>
      </div>

      {/* Error Cards List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No errors match your filter criteria. Click "Log New Mistake" to record questions you struggle with.
          </div>
        ) : (
          filteredLogs.map((item) => {
            const theme = SUBJECT_THEMES[item.subject] || SUBJECT_THEMES.Physics;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs space-y-3 ${
                  item.status === 'mastered'
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Row: Subject, Chapter & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span
                      className="font-bold"
                      style={{ color: theme.accentColor }}
                    >
                      {item.subject}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {item.chapter}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.2 rounded-md">
                      {item.errorType}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      Logged {item.dateLogged}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer ${
                        item.status === 'mastered'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900'
                      }`}
                    >
                      {item.status === 'mastered' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mastered</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Needs Revision</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Ref Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.questionRef}
                </h3>

                {/* What went wrong vs Correct Concept Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Mistake Description */}
                  <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-1">
                    <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>What Went Wrong:</span>
                    </div>
                    <p className="text-rose-950 dark:text-rose-200 leading-relaxed">
                      {item.mistakeDescription}
                    </p>
                  </div>

                  {/* Correct Concept / Key Takeaway */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Correct Concept & Formula to Remember:</span>
                    </div>
                    <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                      {item.correctConcept}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Error Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Log Mistake in Error Notebook
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pinpoint exactly why the question was missed to permanently prevent recurrence
            </p>

            <form onSubmit={handleAddError} className="space-y-3.5 text-xs">
              {/* Question Reference */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Reference / Source
                </label>
                <input
                  type="text"
                  required
                  value={questionRef}
                  onChange={(e) => setQuestionRef(e.target.value)}
                  placeholder="e.g. HC Verma Ch 3 Q24 or Coaching DPP #4 Q12"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Subject & Chapter */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value as 'Physics' | 'Chemistry' | 'Mathematics'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="Physics" className="dark:bg-slate-800">Physics</option>
                    <option value="Chemistry" className="dark:bg-slate-800">Chemistry</option>
                    <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Kinematics or Chemical Bonding"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Error Reason */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Root Cause / Error Type
                </label>
                <select
                  value={errorType}
                  onChange={(e) =>
                    setErrorType(e.target.value as ErrorReasonType)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-medium"
                >
                  {ERROR_REASONS.map((r) => (
                    <option key={r} value={r} className="dark:bg-slate-800">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mistake Description */}
              <div>
                <label className="block font-semibold text-rose-900 dark:text-rose-300 mb-1">
                  What Went Wrong (Your Mistake)
                </label>
                <textarea
                  rows={2}
                  required
                  value={mistakeDescription}
                  onChange={(e) => setMistakeDescription(e.target.value)}
                  placeholder="e.g. Substituted g=10 instead of 9.8 and forgot that the particle reversed direction at t=1.5s."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Correct Concept */}
              <div>
                <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Correct Concept & Key Takeaway (Never Forget)
                </label>
                <textarea
                  rows={2}
                  required
                  value={correctConcept}
                  onChange={(e) => setCorrectConcept(e.target.value)}
                  placeholder="e.g. Distance requires finding turning point where velocity = 0. When v changes sign, calculate integral in 2 intervals."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save to Error Notebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
