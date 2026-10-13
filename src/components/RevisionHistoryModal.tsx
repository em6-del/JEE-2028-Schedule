import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Filter,
  Plus,
  Trash2,
  Printer,
  X,
  CheckCircle2,
  Star,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
} from 'lucide-react';
import { ChapterRevisionRecord, RevisionType, SubjectType } from '../types';
import { SUBJECT_THEMES } from '../utils/theme';
import { GRADE_11_SYLLABUS } from '../data/defaultSchedule';
import confetti from 'canvas-confetti';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionRecords: ChapterRevisionRecord[];
  onAddRevisionRecord: (record: Omit<ChapterRevisionRecord, 'id'>) => void;
  onDeleteRevisionRecord: (id: string) => void;
  studentName?: string;
  batchName?: string;
  onAwardXP?: (
    points: number,
    actionTitle: string,
    category: 'syllabus' | 'bonus',
    subject?: SubjectType
  ) => void;
}

export function RevisionHistoryModal({
  isOpen,
  onClose,
  revisionRecords,
  onAddRevisionRecord,
  onDeleteRevisionRecord,
  studentName = 'Student',
  batchName = 'Meccademia Class 11 - JEE 2028',
  onAwardXP,
}: RevisionHistoryModalProps) {
  // Period filter
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'all'>('week');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add revision modal form state
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newRevisionType, setNewRevisionType] = useState<RevisionType>('Coaching DPP / Problem Set');
  const [newDuration, setNewDuration] = useState(60);
  const [newQuestions, setNewQuestions] = useState(25);
  const [newConfidence, setNewConfidence] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filter records based on selected timeframe
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    return revisionRecords.filter((rec) => {
      const recDate = new Date(rec.date);

      // Period filter
      if (periodFilter === 'week' && recDate < sevenDaysAgo) return false;
      if (periodFilter === 'month' && recDate < thirtyDaysAgo) return false;

      // Subject filter
      if (subjectFilter !== 'all' && rec.subject !== subjectFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && rec.revisionType !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.chapterName.toLowerCase().includes(q);
        const matchesNotes = rec.notes?.toLowerCase().includes(q) || false;
        const matchesType = rec.revisionType.toLowerCase().includes(q);
        if (!matchesName && !matchesNotes && !matchesType) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revisionRecords, periodFilter, subjectFilter, typeFilter, searchQuery]);

  // Aggregate stats
  const totalMinutes = filteredRecords.reduce((acc, r) => acc + r.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalQuestions = filteredRecords.reduce((acc, r) => acc + (r.questionsSolved || 0), 0);
  const distinctChapters = new Set(filteredRecords.map((r) => r.chapterName)).size;
  const avgConfidence =
    filteredRecords.length > 0
      ? Math.round(
          (filteredRecords.reduce((acc, r) => acc + (r.confidenceRating || 3), 0) /
            filteredRecords.length) *
            10
        ) / 10
      : 0;

  // Available chapters for the selected subject
  const availableChapters = useMemo(() => {
    return GRADE_11_SYLLABUS.filter((c) => c.subject === newSubject);
  }, [newSubject]);

  // Handle Form Submission
  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const chapterFinal = newChapter.trim() || availableChapters[0]?.chapterName || 'Class 11 General Revision';

    onAddRevisionRecord({
      date: newDate,
      chapterName: chapterFinal,
      subject: newSubject,
      revisionType: newRevisionType,
      durationMinutes: Number(newDuration) || 45,
      questionsSolved: Number(newQuestions) || 0,
      confidenceRating: newConfidence,
      notes: newNotes.trim() || undefined,
      source: 'manual',
    });

    onAwardXP?.(
      35,
      `Logged Revision: ${chapterFinal} (${newRevisionType})`,
      'syllabus',
      newSubject
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    setIsAddingOpen(false);
    setNewNotes('');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <History className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Chapter & Revision History Retro
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-300 border border-sky-400/40 uppercase tracking-wider">
                  Past Week & Month Log
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Meccademia Education Institute · Active Student: <strong className="text-white">{studentName}</strong> ({batchName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Print Revision Log"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Period Controls Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Period Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                periodFilter === 'week'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Past 7 Days (Week)</span>
            </button>

            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                periodFilter === 'month'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Past 30 Days (Month)</span>
            </button>

            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                periodFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>All-Time ({revisionRecords.length})</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => {
              setNewChapter(availableChapters[0]?.chapterName || '');
              setIsAddingOpen(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Chapter Revision</span>
          </button>
        </div>

        {/* Sub-Filters: Subject & Search */}
        <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Subject:
            </span>
            {(['all', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  subjectFilter === sub
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sub === 'all' ? 'All Subjects' : sub}
              </button>
            ))}

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Revision Types</option>
              <option value="Full Chapter Revision">Full Chapter Revision</option>
              <option value="NCERT Line-by-Line & Formulas">NCERT & Formulas</option>
              <option value="Coaching DPP / Problem Set">Coaching DPP / Numericals</option>
              <option value="PYQ Marathon (JEE Main/Adv)">PYQ Marathon</option>
              <option value="Mistake Diary Trap Review">Mistake Diary Traps</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapter or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>

        {/* Content Area with Stats and Records List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60">
              <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 text-xs font-semibold">
                <span>Total Revision Time</span>
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mt-1 font-black text-xl text-sky-950 dark:text-sky-100 font-mono">
                {totalHours} hrs
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {periodFilter === 'week' ? 'In past 7 days' : periodFilter === 'month' ? 'In past 30 days' : 'All-time total'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <span>Chapters Covered</span>
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mt-1 font-black text-xl text-indigo-950 dark:text-indigo-100 font-mono">
                {distinctChapters}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Distinct Class 11 units
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span>Questions / DPPs</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-1 font-black text-xl text-emerald-950 dark:text-emerald-100 font-mono">
                {totalQuestions}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Practiced numericals
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <span>Avg Confidence</span>
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-1 font-black text-xl text-amber-950 dark:text-amber-100 font-mono flex items-center gap-1">
                <span>{avgConfidence}</span>
                <span className="text-xs text-amber-500 font-normal">/ 5.0</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Concept self-rating
              </p>
            </div>
          </div>

          {/* Timeline of Revision Records */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {periodFilter === 'week'
                    ? 'Past Week Chapter Revisions'
                    : periodFilter === 'month'
                    ? 'Past Month Chapter Revisions'
                    : 'All Logged Chapter Revisions'}{' '}
                  ({filteredRecords.length})
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Sorted by most recent
              </span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No revision records found for this period
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try switching between Past Week and Past Month, or click &quot;+ Log Chapter Revision&quot; to add your latest session!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRecords.map((record) => {
                  const theme = SUBJECT_THEMES[record.subject] || SUBJECT_THEMES.Physics;

                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all shadow-2xs space-y-2.5 group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{
                                backgroundColor: `${theme.accentColor}20`,
                                color: theme.accentColor,
                              }}
                            >
                              {record.subject}
                            </span>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {record.revisionType}
                            </span>

                            <span className="text-[11px] font-mono text-slate-500">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {record.chapterName}
                          </h4>
                        </div>

                        <button
                          onClick={() => onDeleteRevisionRecord(record.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1 rounded-md"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {record.durationMinutes} mins
                        </span>

                        {record.questionsSolved !== undefined && (
                          <span className="flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {record.questionsSolved} numericals
                          </span>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 ml-auto">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                (record.confidenceRating || 3) >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Notes snippet if present */}
                      {record.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          &quot;{record.notes}&quot;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Drawer: Log New Revision Session */}
        {isAddingOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Log Chapter Revision Session
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Record completed chapters & problem sets into your study archive
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRevision} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={newSubject}
                      onChange={(e) => {
                        const sub = e.target.value as 'Physics' | 'Chemistry' | 'Mathematics';
                        setNewSubject(sub);
                        const chaps = GRADE_11_SYLLABUS.filter((c) => c.subject === sub);
                        setNewChapter(chaps[0]?.chapterName || '');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date Completed
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class 11 Chapter Name
                  </label>
                  <select
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {availableChapters.map((ch) => (
                      <option key={ch.id} value={ch.chapterName}>
                        {ch.chapterName} ({ch.jeeWeightage} Weightage)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Revision / Study Mode
                  </label>
                  <select
                    value={newRevisionType}
                    onChange={(e) => setNewRevisionType(e.target.value as RevisionType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Coaching DPP / Problem Set">Coaching DPP / Problem Set</option>
                    <option value="NCERT Line-by-Line & Formulas">NCERT Line-by-Line & Formulas</option>
                    <option value="Full Chapter Revision">Full Chapter Revision</option>
                    <option value="PYQ Marathon (JEE Main/Adv)">PYQ Marathon (JEE Main/Adv)</option>
                    <option value="Mistake Diary Trap Review">Mistake Diary Trap Review</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={360}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Problems / Numericals Solved
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={newQuestions}
                      onChange={(e) => setNewQuestions(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Concept Confidence Level (1-5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewConfidence(num as 1 | 2 | 3 | 4 | 5)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          newConfidence === num
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Formulas Covered (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Mastered rain-man relative velocity formula & river-boat minimum drift..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save to History (+35 XP)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
