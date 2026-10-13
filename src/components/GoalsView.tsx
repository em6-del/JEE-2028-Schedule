import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Award,
  BookOpen,
  Filter,
  Check,
  CalendarDays,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Edit3,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DailyGoalItem,
  WeeklyMilestone,
  SyllabusChapter,
  SubjectType,
  ChapterStatus,
  DailyJournalEntry,
} from '../types';
import { SUBJECT_THEMES } from '../utils/theme';
import { GRADE_11_SYLLABUS } from '../data/defaultSchedule';
import { DailyJournal } from './DailyJournal';

interface GoalsViewProps {
  dailyGoals: DailyGoalItem[];
  setDailyGoals: React.Dispatch<React.SetStateAction<DailyGoalItem[]>>;
  weeklyMilestones: WeeklyMilestone[];
  setWeeklyMilestones: React.Dispatch<React.SetStateAction<WeeklyMilestone[]>>;
  syllabusChapters: SyllabusChapter[];
  setSyllabusChapters: React.Dispatch<React.SetStateAction<SyllabusChapter[]>>;
  dailyTargetHours: number;
  setDailyTargetHours: (hrs: number) => void;
  dailyTargetProblems: number;
  setDailyTargetProblems: (probs: number) => void;
  journalEntries: DailyJournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<DailyJournalEntry[]>>;
  onAwardXP?: (
    points: number,
    actionTitle: string,
    category: 'goal' | 'milestone' | 'syllabus' | 'journal',
    subject?: SubjectType
  ) => void;
}

export function GoalsView({
  dailyGoals,
  setDailyGoals,
  weeklyMilestones,
  setWeeklyMilestones,
  syllabusChapters,
  setSyllabusChapters,
  dailyTargetHours,
  setDailyTargetHours,
  dailyTargetProblems,
  setDailyTargetProblems,
  journalEntries,
  setJournalEntries,
  onAwardXP,
}: GoalsViewProps) {
  // Local state for sub-section filter if desired
  const [activeSubSection, setActiveSubSection] = useState<
    'all' | 'journal' | 'daily_targets' | 'milestones' | 'syllabus'
  >('all');
  // Local state for adding daily goal
  const [newDailyText, setNewDailyText] = useState('');
  const [newDailySubject, setNewDailySubject] = useState<SubjectType>('Physics');

  // Local state for adding weekly milestone
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneSubject, setNewMilestoneSubject] =
    useState<SubjectType>('Mathematics');
  const [newMilestoneTargetCount, setNewMilestoneTargetCount] = useState(30);
  const [newMilestoneDeadline, setNewMilestoneDeadline] = useState('2026-10-15');
  const [newMilestonePriority, setNewMilestonePriority] = useState<
    'High' | 'Medium' | 'Standard'
  >('High');

  // Filter for syllabus
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<
    'All' | 'Physics' | 'Chemistry' | 'Mathematics'
  >('All');

  // Syllabus date planning, sorting, and customization state
  const [syllabusSortBy, setSyllabusSortBy] = useState<
    'default' | 'target_date' | 'weightage' | 'status'
  >('default');
  const [isPacingModalOpen, setIsPacingModalOpen] = useState(false);
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<SyllabusChapter | null>(null);

  // Auto-Pacing Form State
  const [pacingStartDate, setPacingStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [pacingEndDate, setPacingEndDate] = useState('2027-02-28');
  const [pacingSubject, setPacingSubject] = useState<
    'All' | 'Physics' | 'Chemistry' | 'Mathematics'
  >('All');

  // Add Chapter Form State
  const [newChapterSubject, setNewChapterSubject] = useState<SubjectType>('Physics');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterWeightage, setNewChapterWeightage] = useState<'High' | 'Medium' | 'Moderate'>('High');
  const [newChapterTargetDate, setNewChapterTargetDate] = useState('2026-11-15');
  const [newChapterNotes, setNewChapterNotes] = useState('');

  // Toggle daily goal
  const handleToggleDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const next = !g.completed;
          if (next) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
            onAwardXP?.(
              35,
              `Daily Goal Completed: ${g.text}`,
              'goal',
              g.subject
            );
          }
          return { ...g, completed: next };
        }
        return g;
      })
    );
  };

  const handleAddDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDailyText.trim()) return;

    setDailyGoals((prev) => [
      ...prev,
      {
        id: `dg-${Date.now()}`,
        text: newDailyText.trim(),
        subject: newDailySubject,
        completed: false,
      },
    ]);
    setNewDailyText('');
  };

  const handleDeleteDailyGoal = (id: string) => {
    setDailyGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Toggle weekly milestone
  const handleToggleMilestone = (id: string) => {
    setWeeklyMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = !m.completed;
          if (next) {
            confetti({
              particleCount: 75,
              spread: 80,
              origin: { y: 0.6 },
            });
            onAwardXP?.(
              120,
              `Milestone Achieved: ${m.title}`,
              'milestone',
              m.subject
            );
          }
          return {
            ...m,
            completed: next,
            completedCount: next ? m.targetCount : m.completedCount,
          };
        }
        return m;
      })
    );
  };

  const handleIncrementMilestone = (id: string, delta: number) => {
    setWeeklyMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newCount = Math.max(
            0,
            Math.min((m.targetCount || 100), (m.completedCount || 0) + delta)
          );
          const isDone = m.targetCount ? newCount >= m.targetCount : m.completed;
          if (isDone && !m.completed) {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
            onAwardXP?.(
              120,
              `Milestone Target Hit: ${m.title}`,
              'milestone',
              m.subject
            );
          }
          return {
            ...m,
            completedCount: newCount,
            completed: isDone,
          };
        }
        return m;
      })
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setWeeklyMilestones((prev) => [
      ...prev,
      {
        id: `wm-${Date.now()}`,
        title: newMilestoneTitle.trim(),
        subject: newMilestoneSubject,
        targetCount: newMilestoneTargetCount,
        completedCount: 0,
        deadlineDate: newMilestoneDeadline,
        priority: newMilestonePriority,
        completed: false,
      },
    ]);

    setNewMilestoneTitle('');
    setIsAddMilestoneOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    setWeeklyMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Syllabus Status Change
  const handleChapterStatusChange = (
    chapterId: string,
    newStatus: ChapterStatus
  ) => {
    const targetChapter = syllabusChapters.find((ch) => ch.id === chapterId);
    setSyllabusChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, status: newStatus } : ch
      )
    );

    if (targetChapter && targetChapter.status !== newStatus) {
      if (newStatus === 'theory_completed') {
        onAwardXP?.(
          50,
          `Theory Done: ${targetChapter.chapterName}`,
          'syllabus',
          targetChapter.subject
        );
      } else if (newStatus === 'dpp_level1') {
        onAwardXP?.(
          40,
          `DPP Level 1 Completed: ${targetChapter.chapterName}`,
          'syllabus',
          targetChapter.subject
        );
      } else if (newStatus === 'pyq_advanced') {
        onAwardXP?.(
          80,
          `PYQs & Advanced Done: ${targetChapter.chapterName}`,
          'syllabus',
          targetChapter.subject
        );
      } else if (newStatus === 'mastered_revision_done') {
        onAwardXP?.(
          100,
          `Mastered Chapter: ${targetChapter.chapterName}`,
          'syllabus',
          targetChapter.subject
        );
        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // Target completion date helpers
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTargetDateBadge = (dateStr?: string, status?: ChapterStatus) => {
    if (!dateStr) {
      return {
        label: 'No target set',
        style:
          'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60',
        isOverdue: false,
      };
    }

    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (status === 'mastered_revision_done') {
        return {
          label: 'Mastered',
          style:
            'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900',
          isOverdue: false,
        };
      }

      if (diffDays < 0) {
        return {
          label: `Overdue (${Math.abs(diffDays)}d)`,
          style:
            'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 font-semibold',
          isOverdue: true,
        };
      }

      if (diffDays === 0) {
        return {
          label: 'Due Today',
          style:
            'text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 font-bold',
          isOverdue: false,
        };
      }

      if (diffDays <= 7) {
        return {
          label: `Due in ${diffDays}d`,
          style:
            'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 font-semibold',
          isOverdue: false,
        };
      }

      return {
        label: `Due in ${diffDays}d`,
        style:
          'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900',
        isOverdue: false,
      };
    } catch {
      return {
        label: dateStr,
        style: 'text-slate-500 bg-slate-100',
        isOverdue: false,
      };
    }
  };

  // Update target date of single chapter
  const handleUpdateChapterTargetDate = (chapterId: string, newDate: string) => {
    setSyllabusChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, targetCompletionDate: newDate ? newDate : undefined }
          : ch
      )
    );
  };

  // Quick shift single chapter target date by delta days (e.g. +7, +14, -7)
  const handleQuickShiftDate = (chapterId: string, daysDelta: number) => {
    setSyllabusChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const base = ch.targetCompletionDate
          ? new Date(ch.targetCompletionDate)
          : new Date();
        if (isNaN(base.getTime())) return ch;
        base.setDate(base.getDate() + daysDelta);
        const newStr = base.toISOString().split('T')[0];
        return { ...ch, targetCompletionDate: newStr };
      })
    );
  };

  // Shift all target dates forward or backward by delta days
  const handleShiftAllDates = (daysDelta: number, targetSubject: string = 'All') => {
    setSyllabusChapters((prev) =>
      prev.map((ch) => {
        if (targetSubject !== 'All' && ch.subject !== targetSubject) return ch;
        if (!ch.targetCompletionDate) return ch;
        const base = new Date(ch.targetCompletionDate);
        if (isNaN(base.getTime())) return ch;
        base.setDate(base.getDate() + daysDelta);
        return { ...ch, targetCompletionDate: base.toISOString().split('T')[0] };
      })
    );
  };

  // Auto-pace chapters evenly across a custom date window
  const handleAutoPaceSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(pacingStartDate);
    const end = new Date(pacingEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      alert('Please choose a valid End Date that is after the Start Date.');
      return;
    }

    const totalDays = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    setSyllabusChapters((prev) => {
      const matchingIndices: number[] = [];
      prev.forEach((ch, idx) => {
        if (pacingSubject === 'All' || ch.subject === pacingSubject) {
          matchingIndices.push(idx);
        }
      });

      if (matchingIndices.length === 0) return prev;
      const intervalDays = totalDays / matchingIndices.length;

      const updated = [...prev];
      matchingIndices.forEach((chIdx, rank) => {
        const target = new Date(
          start.getTime() + (rank + 1) * intervalDays * (1000 * 60 * 60 * 24)
        );
        updated[chIdx] = {
          ...updated[chIdx],
          targetCompletionDate: target.toISOString().split('T')[0],
        };
      });

      return updated;
    });

    setIsPacingModalOpen(false);
  };

  // Reset to default JEE 2028 recommended timeline
  const handleResetToDefaultSyllabus = () => {
    if (
      window.confirm(
        'Reset all Class 11 chapters and target dates to recommended JEE 2028 coaching timeline?'
      )
    ) {
      setSyllabusChapters(GRADE_11_SYLLABUS);
    }
  };

  // Add custom chapter
  const handleAddCustomChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;

    setSyllabusChapters((prev) => [
      ...prev,
      {
        id: `custom-ch-${Date.now()}`,
        subject: newChapterSubject as 'Physics' | 'Chemistry' | 'Mathematics',
        chapterName: newChapterName.trim(),
        jeeWeightage: newChapterWeightage,
        status: 'not_started',
        targetCompletionDate: newChapterTargetDate || undefined,
        notes: newChapterNotes.trim() || undefined,
      },
    ]);

    setNewChapterName('');
    setNewChapterNotes('');
    setIsAddChapterModalOpen(false);
  };

  // Save edited chapter
  const handleSaveEditChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    setSyllabusChapters((prev) =>
      prev.map((ch) => (ch.id === editingChapter.id ? editingChapter : ch))
    );
    setEditingChapter(null);
  };

  // Delete chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (window.confirm('Delete this chapter from your Class 11 tracker?')) {
      setSyllabusChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
    }
  };

  // Calculations for syllabus
  const filteredChapters =
    selectedSubjectFilter === 'All'
      ? syllabusChapters
      : syllabusChapters.filter((ch) => ch.subject === selectedSubjectFilter);

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    if (syllabusSortBy === 'target_date') {
      if (!a.targetCompletionDate && !b.targetCompletionDate) return 0;
      if (!a.targetCompletionDate) return 1;
      if (!b.targetCompletionDate) return -1;
      return a.targetCompletionDate.localeCompare(b.targetCompletionDate);
    }
    if (syllabusSortBy === 'weightage') {
      const weightScore = { High: 3, Medium: 2, Moderate: 1 };
      return weightScore[b.jeeWeightage] - weightScore[a.jeeWeightage];
    }
    if (syllabusSortBy === 'status') {
      const statusOrder: Record<ChapterStatus, number> = {
        not_started: 1,
        theory_completed: 2,
        dpp_level1: 3,
        pyq_advanced: 4,
        mastered_revision_done: 5,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });

  const calculateSyllabusScore = () => {
    if (syllabusChapters.length === 0) return 0;
    const weights: Record<ChapterStatus, number> = {
      not_started: 0,
      theory_completed: 0.25,
      dpp_level1: 0.5,
      pyq_advanced: 0.8,
      mastered_revision_done: 1.0,
    };
    const totalScore = syllabusChapters.reduce(
      (acc, c) => acc + weights[c.status],
      0
    );
    return Math.round((totalScore / syllabusChapters.length) * 100);
  };

  const overallReadiness = calculateSyllabusScore();

  return (
    <div className="space-y-8">
      {/* Sub-Section Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-150">
        <button
          onClick={() => setActiveSubSection('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
            activeSubSection === 'all'
              ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Goals & Journal
        </button>

        <button
          onClick={() => setActiveSubSection('journal')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeSubSection === 'journal'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Daily Reflection Journal</span>
        </button>

        <button
          onClick={() => setActiveSubSection('daily_targets')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeSubSection === 'daily_targets'
              ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Daily Targets</span>
        </button>

        <button
          onClick={() => setActiveSubSection('milestones')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeSubSection === 'milestones'
              ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-sky-400" />
          <span>Weekly Milestones</span>
        </button>

        <button
          onClick={() => setActiveSubSection('syllabus')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeSubSection === 'syllabus'
              ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Class 11 Syllabus</span>
        </button>
      </div>

      {/* 1. Daily Goals Section */}
      {(activeSubSection === 'all' || activeSubSection === 'daily_targets') && (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Daily Study Targets & Priorities
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear commitments for today's study slots to prevent procrastination
            </p>
          </div>

          {/* Quick Target Settings */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Target Hours:</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white font-mono">
                <button
                  onClick={() => setDailyTargetHours(Math.max(2, dailyTargetHours - 0.5))}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  -
                </button>
                <span>{dailyTargetHours}h</span>
                <button
                  onClick={() => setDailyTargetHours(Math.min(14, dailyTargetHours + 0.5))}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Target Problems:</span>
              <div className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-400 font-mono">
                <button
                  onClick={() => setDailyTargetProblems(Math.max(10, dailyTargetProblems - 5))}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  -
                </button>
                <span>{dailyTargetProblems}</span>
                <button
                  onClick={() => setDailyTargetProblems(Math.min(150, dailyTargetProblems + 5))}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Daily Goal Form */}
        <form onSubmit={handleAddDailyGoal} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newDailyText}
            onChange={(e) => setNewDailyText(e.target.value)}
            placeholder="Add daily goal (e.g. Solve 20 questions on Work-Energy Theorem)"
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
          <select
            value={newDailySubject}
            onChange={(e) => setNewDailySubject(e.target.value as SubjectType)}
            className="text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="Physics" className="dark:bg-slate-800">Physics</option>
            <option value="Chemistry" className="dark:bg-slate-800">Chemistry</option>
            <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
            <option value="Revision" className="dark:bg-slate-800">Revision</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Priority</span>
          </button>
        </form>

        {/* Daily Goals List */}
        <div className="mt-4 space-y-2">
          {dailyGoals.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              No daily priorities added yet. Add 3 to 5 targeted priorities for today.
            </p>
          ) : (
            dailyGoals.map((goal) => {
              const theme = SUBJECT_THEMES[goal.subject] || SUBJECT_THEMES.Physics;
              return (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    goal.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div
                    onClick={() => handleToggleDailyGoal(goal.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        goal.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {goal.text}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2"
                      style={{
                        backgroundColor: `${theme.accentColor}18`,
                        color: theme.accentColor,
                      }}
                    >
                      {goal.subject}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteDailyGoal(goal.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-rose-500 p-1 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* 2. End-of-Day Reflection & Mental State Journal */}
      {(activeSubSection === 'all' || activeSubSection === 'journal') && (
        <DailyJournal
          entries={journalEntries}
          setEntries={setJournalEntries}
          onAwardXP={onAwardXP}
        />
      )}

      {/* 3. Weekly Milestone Goals Section */}
      {(activeSubSection === 'all' || activeSubSection === 'milestones') && (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              Weekly Milestone Goals (Grade 11 Sprint)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-yield chapter targets and problem quotas for this week
            </p>
          </div>

          <button
            onClick={() => setIsAddMilestoneOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        {/* Milestone List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {weeklyMilestones.map((milestone) => {
            const theme = SUBJECT_THEMES[milestone.subject] || SUBJECT_THEMES.Physics;
            const progress = milestone.targetCount
              ? Math.min(
                  100,
                  Math.round(
                    ((milestone.completedCount || 0) / milestone.targetCount) *
                      100
                  )
                )
              : milestone.completed
              ? 100
              : 0;

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-xl border transition-all ${
                  milestone.completed
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: theme.accentColor }}
                    >
                      {milestone.subject}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Priority: {milestone.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleMilestone(milestone.id)}
                      className={`text-xs px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                        milestone.completed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {milestone.completed ? (
                        <>
                          <Check className="w-3 h-3" /> Done
                        </>
                      ) : (
                        'Mark Done'
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-xs font-bold ${
                    milestone.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {milestone.title}
                </h4>

                {/* Question progress counter if targetCount provided */}
                {milestone.targetCount !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                      <span>Problems Solved</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleIncrementMilestone(milestone.id, -5)}
                          disabled={milestone.completed}
                          className="px-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                        >
                          -5
                        </button>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {milestone.completedCount || 0} / {milestone.targetCount}
                        </span>
                        <button
                          onClick={() => handleIncrementMilestone(milestone.id, 5)}
                          disabled={milestone.completed}
                          className="px-1.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900 disabled:opacity-40 font-bold"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Target Due: {milestone.deadlineDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* 4. Grade 11 JEE 2028 Chapter Syllabus Board */}
      {(activeSubSection === 'all' || activeSubSection === 'syllabus') && (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Grade 11 JEE 2028 Syllabus Progression & Target Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize target completion dates to match your coaching batch pace and school exams
            </p>
          </div>

          {/* Readiness Meter & Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsPacingModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Auto-pace syllabus or shift all target dates"
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Date Planner & Pacing</span>
            </button>

            <button
              onClick={() => setIsAddChapterModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              title="Add a custom chapter from your coaching"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
                  Readiness
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {overallReadiness}%
                </span>
              </div>
              <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${overallReadiness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map(
              (sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubjectFilter(sub)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedSubjectFilter === sub
                      ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              )
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={syllabusSortBy}
              onChange={(e) =>
                setSyllabusSortBy(
                  e.target.value as 'default' | 'target_date' | 'weightage' | 'status'
                )
              }
              className="px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="default" className="dark:bg-slate-800">
                Syllabus Sequence
              </option>
              <option value="target_date" className="dark:bg-slate-800">
                Target Date (Earliest First)
              </option>
              <option value="weightage" className="dark:bg-slate-800">
                JEE Weightage (High First)
              </option>
              <option value="status" className="dark:bg-slate-800">
                Completion Status (Pending First)
              </option>
            </select>
          </div>
        </div>

        {/* Syllabus Table / Cards */}
        <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {sortedChapters.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No chapters found matching the filter.
            </div>
          ) : (
            sortedChapters.map((chapter) => {
              const theme =
                SUBJECT_THEMES[chapter.subject] || SUBJECT_THEMES.Physics;
              const dateBadge = getTargetDateBadge(
                chapter.targetCompletionDate,
                chapter.status
              );

              return (
                <div
                  key={chapter.id}
                  className="p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold text-[11px]"
                        style={{ color: theme.accentColor }}
                      >
                        {chapter.subject}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          chapter.jeeWeightage === 'High'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {chapter.jeeWeightage} Weightage
                      </span>

                      {/* Urgency / Due status tag */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${dateBadge.style}`}
                      >
                        {dateBadge.label}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {chapter.chapterName}
                    </div>

                    {chapter.notes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {chapter.notes}
                      </div>
                    )}
                  </div>

                  {/* Interactive Date Selector, Status Selector & Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Student Date Picker Input */}
                    <div
                      className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
                      title="Select custom target completion date according to your wish"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                          Target Date
                        </span>
                        <input
                          type="date"
                          value={chapter.targetCompletionDate || ''}
                          onChange={(e) =>
                            handleUpdateChapterTargetDate(
                              chapter.id,
                              e.target.value
                            )
                          }
                          className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-hidden font-mono p-0 border-none"
                        />
                      </div>

                      {/* Quick Shift +7 Days */}
                      <button
                        onClick={() => handleQuickShiftDate(chapter.id, 7)}
                        title="Shift deadline forward by +7 days"
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 rounded transition-colors cursor-pointer"
                      >
                        +7d
                      </button>

                      {/* Clear date if set */}
                      {chapter.targetCompletionDate && (
                        <button
                          onClick={() =>
                            handleUpdateChapterTargetDate(chapter.id, '')
                          }
                          title="Clear target date"
                          className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Progression Selector */}
                    <select
                      value={chapter.status}
                      onChange={(e) =>
                        handleChapterStatusChange(
                          chapter.id,
                          e.target.value as ChapterStatus
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        chapter.status === 'mastered_revision_done'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : chapter.status === 'pyq_advanced'
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                          : chapter.status === 'dpp_level1'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : chapter.status === 'theory_completed'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <option value="not_started" className="dark:bg-slate-800">
                        ⚪ Not Started
                      </option>
                      <option value="theory_completed" className="dark:bg-slate-800">
                        🟣 Theory & Notes Done
                      </option>
                      <option value="dpp_level1" className="dark:bg-slate-800">
                        🟡 DPP & Level 1 Solved
                      </option>
                      <option value="pyq_advanced" className="dark:bg-slate-800">
                        🔵 PYQ & Advanced Solved
                      </option>
                      <option
                        value="mastered_revision_done"
                        className="dark:bg-slate-800"
                      >
                        🟢 Mastered & Revise
                      </option>
                    </select>

                    {/* Edit Chapter Details */}
                    <button
                      onClick={() => setEditingChapter(chapter)}
                      title="Edit chapter title, weightage or notes"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Chapter */}
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      title="Delete chapter from tracker"
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Add Weekly Milestone Modal */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add Weekly Sprint Milestone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Set clear problems or chapter quotas to hit this week
            </p>

            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Solve 35 problems on Laws of Motion HCV"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newMilestoneSubject}
                    onChange={(e) =>
                      setNewMilestoneSubject(e.target.value as SubjectType)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="Physics" className="dark:bg-slate-800">Physics</option>
                    <option value="Chemistry" className="dark:bg-slate-800">Chemistry</option>
                    <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
                    <option value="Revision" className="dark:bg-slate-800">Revision</option>
                    <option value="Mock/PYQ" className="dark:bg-slate-800">Mock/PYQ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Problems Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={newMilestoneTargetCount}
                    onChange={(e) =>
                      setNewMilestoneTargetCount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneDeadline}
                    onChange={(e) => setNewMilestoneDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newMilestonePriority}
                    onChange={(e) =>
                      setNewMilestonePriority(
                        e.target.value as 'High' | 'Medium' | 'Standard'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="High" className="dark:bg-slate-800">High</option>
                    <option value="Medium" className="dark:bg-slate-800">Medium</option>
                    <option value="Standard" className="dark:bg-slate-800">Standard</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Planner & Syllabus Pacing Modal */}
      {isPacingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Syllabus Target Date Planner & Pacing
              </h3>
              <button
                onClick={() => setIsPacingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
              Set deadlines completely according to your own study schedule, coaching batches, or school exams.
            </p>

            <div className="space-y-5 text-xs">
              {/* Method 1: Auto-Pace Custom Window */}
              <form
                onSubmit={handleAutoPaceSyllabus}
                className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">
                    Option 1: Auto-Distribute Dates Across a Custom Window
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Pick your target start date and completion date. All chapters will be evenly spaced out so you finish on time!
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={pacingStartDate}
                      onChange={(e) => setPacingStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Finish Date
                    </label>
                    <input
                      type="date"
                      required
                      value={pacingEndDate}
                      onChange={(e) => setPacingEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Apply To
                  </label>
                  <select
                    value={pacingSubject}
                    onChange={(e) =>
                      setPacingSubject(
                        e.target.value as
                          | 'All'
                          | 'Physics'
                          | 'Chemistry'
                          | 'Mathematics'
                      )
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="All" className="dark:bg-slate-800">
                      All Subjects (All 30 Class 11 Chapters)
                    </option>
                    <option value="Physics" className="dark:bg-slate-800">
                      Physics Chapters Only
                    </option>
                    <option value="Chemistry" className="dark:bg-slate-800">
                      Chemistry Chapters Only
                    </option>
                    <option value="Mathematics" className="dark:bg-slate-800">
                      Mathematics Chapters Only
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  ⚡ Auto-Calculate & Apply Target Dates
                </button>
              </form>

              {/* Method 2: Batch Shift All Dates */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Option 2: Shift All Upcoming Deadlines
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Delay or fast-forward all chapter dates if you had school exams, sick days, or holidays:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleShiftAllDates(7, selectedSubjectFilter)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-center transition-colors cursor-pointer"
                  >
                    +1 Week (+7d)
                  </button>
                  <button
                    onClick={() => handleShiftAllDates(14, selectedSubjectFilter)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-center transition-colors cursor-pointer"
                  >
                    +2 Weeks (+14d)
                  </button>
                  <button
                    onClick={() => handleShiftAllDates(30, selectedSubjectFilter)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-center transition-colors cursor-pointer"
                  >
                    +1 Month (+30d)
                  </button>
                  <button
                    onClick={() => handleShiftAllDates(-7, selectedSubjectFilter)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-center transition-colors cursor-pointer"
                  >
                    -1 Week (-7d)
                  </button>
                </div>
              </div>

              {/* Method 3: Reset to Recommended Schedule */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToDefaultSyllabus}
                  className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Recommended JEE 2028 Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPacingModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Chapter Modal */}
      {isAddChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add Coaching Chapter / Topic
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add extra chapters, coaching modules, or specialized sub-topics with your preferred deadline
            </p>

            <form onSubmit={handleAddCustomChapter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="e.g. Basic Mathematics & Vectors or Qualitative Analysis"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newChapterSubject}
                    onChange={(e) =>
                      setNewChapterSubject(e.target.value as SubjectType)
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
                    JEE Weightage
                  </label>
                  <select
                    value={newChapterWeightage}
                    onChange={(e) =>
                      setNewChapterWeightage(
                        e.target.value as 'High' | 'Medium' | 'Moderate'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="High" className="dark:bg-slate-800">High</option>
                    <option value="Medium" className="dark:bg-slate-800">Medium</option>
                    <option value="Moderate" className="dark:bg-slate-800">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newChapterTargetDate}
                  onChange={(e) => setNewChapterTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coaching Notes / Focus Areas (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newChapterNotes}
                  onChange={(e) => setNewChapterNotes(e.target.value)}
                  placeholder="e.g. Focus on coaching sheet Exercise 1 and past 5 year questions"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddChapterModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Chapter Modal */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit Chapter & Target Date
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Modify the completion deadline, weightage, or syllabus notes
            </p>

            <form onSubmit={handleSaveEditChapter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  value={editingChapter.chapterName}
                  onChange={(e) =>
                    setEditingChapter({
                      ...editingChapter,
                      chapterName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={editingChapter.subject}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        subject: e.target.value as
                          | 'Physics'
                          | 'Chemistry'
                          | 'Mathematics',
                      })
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
                    JEE Weightage
                  </label>
                  <select
                    value={editingChapter.jeeWeightage}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        jeeWeightage: e.target.value as
                          | 'High'
                          | 'Medium'
                          | 'Moderate',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="High" className="dark:bg-slate-800">High</option>
                    <option value="Medium" className="dark:bg-slate-800">Medium</option>
                    <option value="Moderate" className="dark:bg-slate-800">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={editingChapter.targetCompletionDate || ''}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        targetCompletionDate: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-mono"
                  />
                  {editingChapter.targetCompletionDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingChapter({
                          ...editingChapter,
                          targetCompletionDate: undefined,
                        })
                      }
                      className="px-2.5 py-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-100 cursor-pointer"
                      title="Clear target date"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Key Concepts
                </label>
                <textarea
                  rows={2}
                  value={editingChapter.notes || ''}
                  onChange={(e) =>
                    setEditingChapter({
                      ...editingChapter,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
