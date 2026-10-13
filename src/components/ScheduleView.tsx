import { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  RotateCcw,
  BookOpen,
  Trophy,
  ChevronRight,
  History,
  GraduationCap,
  Filter,
  Search,
  Star,
  MessageSquare,
  AlertTriangle,
  Printer,
  Calendar,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DayOfWeek,
  DaySchedule,
  StudySlot,
  SlotStatus,
  SchedulePreset,
  SubjectType,
  FacultyScheduleComment,
  ChapterRevisionRecord,
  RevisionType,
} from '../types';
import {
  format12Hour,
  calculateSlotDurationMinutes,
  formatDurationHuman,
  isSlotActiveNow,
  getSlotRemainingMinutes,
} from '../utils/timeHelpers';
import { getRankTier } from '../utils/xpEngine';
import { SUBJECT_THEMES } from '../utils/theme';
import {
  DEFAULT_SCHOOL_DAY_SLOTS,
  DEFAULT_WEEKEND_SLOTS,
  DEFAULT_COACHING_DAY_SLOTS,
  GRADE_11_SYLLABUS,
} from '../data/defaultSchedule';
import { SlotModal } from './SlotModal';
import { TimeShiftModal } from './TimeShiftModal';
import { FocusTimer } from './FocusTimer';
import { FacultyScheduleBanner } from './FacultyScheduleBanner';

interface ScheduleViewProps {
  currentDay: DayOfWeek;
  setCurrentDay: (day: DayOfWeek) => void;
  daySchedules: Record<DayOfWeek, DaySchedule>;
  onUpdateDaySchedule: (day: DayOfWeek, updatedSchedule: DaySchedule) => void;
  onAwardXP?: (
    points: number,
    actionTitle: string,
    category: 'slot' | 'timer' | 'bonus' | 'syllabus',
    subject?: SubjectType
  ) => void;
  onNavigateToLeaderboard?: () => void;
  studentXP?: number;
  facultyComments?: FacultyScheduleComment[];
  onAcknowledgeFacultyComment?: (commentId: string) => void;
  onReplyToFacultyComment?: (commentId: string, replyText: string) => void;
  onOpenRevisionHistoryModal?: () => void;
  revisionHistoryCount?: number;
  onOpenFacultyPortal?: () => void;
  revisionRecords?: ChapterRevisionRecord[];
  onAddRevisionRecord?: (record: Omit<ChapterRevisionRecord, 'id'>) => void;
  onDeleteRevisionRecord?: (id: string) => void;
}

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function ScheduleView({
  currentDay,
  setCurrentDay,
  daySchedules,
  onUpdateDaySchedule,
  onAwardXP,
  facultyComments = [],
  onAcknowledgeFacultyComment,
  onReplyToFacultyComment,
  onOpenRevisionHistoryModal,
  revisionHistoryCount = 0,
  onOpenFacultyPortal,
  revisionRecords = [],
  onAddRevisionRecord,
  onDeleteRevisionRecord,
}: ScheduleViewProps) {
  const [editingSlot, setEditingSlot] = useState<StudySlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [focusSlot, setFocusSlot] = useState<StudySlot | null>(null);
  const [openMenuSlotId, setOpenMenuSlotId] = useState<string | null>(null);

  // View mode switcher: Daily Timetable vs Past Week & Month Revisions Retro
  const [scheduleViewTab, setScheduleViewTab] = useState<'timetable' | 'revisions'>('timetable');
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'all'>('week');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Log Revision Form State
  const [isAddingRevision, setIsAddingRevision] = useState(false);
  const [newSub, setNewSub] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [newChap, setNewChap] = useState('');
  const [newRevType, setNewRevType] = useState<RevisionType>('Coaching DPP / Problem Set');
  const [newDuration, setNewDuration] = useState(60);
  const [newQuestions, setNewQuestions] = useState(25);
  const [newConfidence, setNewConfidence] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Aggregate past week (7 days) and month (30 days) relative dates
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const pastWeekRecords = useMemo(() => {
    return revisionRecords.filter((r) => new Date(r.date) >= sevenDaysAgo);
  }, [revisionRecords, sevenDaysAgo]);

  const pastMonthRecords = useMemo(() => {
    return revisionRecords.filter((r) => new Date(r.date) >= thirtyDaysAgo);
  }, [revisionRecords, thirtyDaysAgo]);

  const pastWeekHours = Math.round((pastWeekRecords.reduce((acc, r) => acc + r.durationMinutes, 0) / 60) * 10) / 10;
  const pastMonthHours = Math.round((pastMonthRecords.reduce((acc, r) => acc + r.durationMinutes, 0) / 60) * 10) / 10;
  const pastWeekQuestions = pastWeekRecords.reduce((acc, r) => acc + (r.questionsSolved || 0), 0);
  const pastMonthQuestions = pastMonthRecords.reduce((acc, r) => acc + (r.questionsSolved || 0), 0);

  // Filtered records for the in-page retro tab
  const filteredRevisionRecords = useMemo(() => {
    return revisionRecords
      .filter((rec) => {
        const recDate = new Date(rec.date);
        if (periodFilter === 'week' && recDate < sevenDaysAgo) return false;
        if (periodFilter === 'month' && recDate < thirtyDaysAgo) return false;
        if (subjectFilter !== 'all' && rec.subject !== subjectFilter) return false;
        if (typeFilter !== 'all' && rec.revisionType !== typeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rec.chapterName.toLowerCase().includes(q);
          const matchNotes = rec.notes?.toLowerCase().includes(q) || false;
          const matchType = rec.revisionType.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchType) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revisionRecords, periodFilter, subjectFilter, typeFilter, searchQuery, sevenDaysAgo, thirtyDaysAgo]);

  const totalFilteredMinutes = filteredRevisionRecords.reduce((acc, r) => acc + r.durationMinutes, 0);
  const totalFilteredHours = Math.round((totalFilteredMinutes / 60) * 10) / 10;
  const totalFilteredQuestions = filteredRevisionRecords.reduce((acc, r) => acc + (r.questionsSolved || 0), 0);
  const distinctChaptersFiltered = new Set(filteredRevisionRecords.map((r) => r.chapterName)).size;
  const avgFilteredConfidence =
    filteredRevisionRecords.length > 0
      ? Math.round(
          (filteredRevisionRecords.reduce((acc, r) => acc + (r.confidenceRating || 3), 0) /
            filteredRevisionRecords.length) *
            10
        ) / 10
      : 0;

  // Class 11 chapters for selected subject
  const availableChapters = useMemo(() => {
    return GRADE_11_SYLLABUS.filter((c) => c.subject === newSub);
  }, [newSub]);

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRevisionRecord) return;
    const finalChapter = newChap.trim() || availableChapters[0]?.chapterName || 'Class 11 General Revision';
    onAddRevisionRecord({
      date: newDate,
      chapterName: finalChapter,
      subject: newSub,
      revisionType: newRevType,
      durationMinutes: Number(newDuration) || 45,
      questionsSolved: Number(newQuestions) || 0,
      confidenceRating: newConfidence,
      notes: newNotes.trim() || undefined,
      source: 'manual',
    });
    onAwardXP?.(35, `Logged Revision: ${finalChapter} (${newRevType})`, 'syllabus', newSub);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setIsAddingRevision(false);
    setNewNotes('');
  };

  const activeSchedule = daySchedules[currentDay] || {
    day: currentDay,
    preset: 'school_day',
    slots: [],
    dailyTargetHours: 6,
    dailyTargetProblems: 40,
  };

  // Determine current day of week in reality
  const realDayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  }) as DayOfWeek;
  const isViewingToday = currentDay === realDayName;

  // Calculate total study hours planned today (excluding Break and School)
  const studySlots = activeSchedule.slots.filter(
    (s) => s.subject !== 'Break' && s.subject !== 'School'
  );
  const totalStudyMinutes = studySlots.reduce((acc, s) => {
    return acc + calculateSlotDurationMinutes(s.startTime, s.endTime);
  }, 0);
  const totalStudyHoursFormatted = formatDurationHuman(totalStudyMinutes);

  const completedSlots = activeSchedule.slots.filter(
    (s) => s.status === 'completed'
  );
  const completionPercentage =
    activeSchedule.slots.length > 0
      ? Math.round((completedSlots.length / activeSchedule.slots.length) * 100)
      : 0;

  // Handle Preset Switching
  const handleApplyPreset = (preset: SchedulePreset) => {
    let newBaseSlots: StudySlot[] = [];
    let targetHours = 6;
    let targetProblems = 40;

    if (preset === 'school_day') {
      newBaseSlots = DEFAULT_SCHOOL_DAY_SLOTS;
      targetHours = 5.5;
      targetProblems = 40;
    } else if (preset === 'weekend_deep_prep') {
      newBaseSlots = DEFAULT_WEEKEND_SLOTS;
      targetHours = 9;
      targetProblems = 70;
    } else if (preset === 'coaching_day') {
      newBaseSlots = DEFAULT_COACHING_DAY_SLOTS;
      targetHours = 6.5;
      targetProblems = 50;
    }

    const updatedSlots = newBaseSlots.map((s) => ({
      ...s,
      id: `${currentDay.toLowerCase()}-${s.id}-${Date.now()}`,
      status: 'pending' as SlotStatus,
    }));

    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      preset,
      slots: updatedSlots,
      dailyTargetHours: targetHours,
      dailyTargetProblems: targetProblems,
    });
  };

  // Status toggle handler
  const handleStatusChange = (slotId: string, status: SlotStatus) => {
    const targetSlot = activeSchedule.slots.find((s) => s.id === slotId);
    const wasCompleted = targetSlot?.status === 'completed';

    const updated = activeSchedule.slots.map((s) =>
      s.id === slotId ? { ...s, status } : s
    );
    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: updated,
    });

    if (status === 'completed' && !wasCompleted && targetSlot) {
      onAwardXP?.(
        50,
        `Finished Study Slot: ${targetSlot.title || targetSlot.subject}`,
        'slot',
        targetSlot.subject
      );
    }
  };

  // Save new or edited slot
  const handleSaveSlot = (slot: StudySlot) => {
    let updatedSlots: StudySlot[];
    const exists = activeSchedule.slots.some((s) => s.id === slot.id);

    if (exists) {
      updatedSlots = activeSchedule.slots.map((s) =>
        s.id === slot.id ? slot : s
      );
    } else {
      updatedSlots = [...activeSchedule.slots, slot];
    }

    // Sort by startTime
    updatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: updatedSlots,
    });
  };

  // Delete slot
  const handleDeleteSlot = (slotId: string) => {
    const updated = activeSchedule.slots.filter((s) => s.id !== slotId);
    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: updated,
    });
  };

  // Reorder slot
  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeSchedule.slots.length) return;

    const newSlots = [...activeSchedule.slots];
    const temp = newSlots[index];
    newSlots[index] = newSlots[targetIndex];
    newSlots[targetIndex] = temp;

    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: newSlots,
    });
  };

  // Shift schedule
  const handleApplyShifted = (shiftedSlots: StudySlot[]) => {
    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: shiftedSlots,
    });
  };

  // Focus timer completion
  const handleFocusTimerComplete = (slotId: string, minutesSpent: number) => {
    const slot = activeSchedule.slots.find((s) => s.id === slotId);
    const updated = activeSchedule.slots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            status: 'completed' as SlotStatus,
            actualMinutesSpent: (s.actualMinutesSpent || 0) + minutesSpent,
          }
        : s
    );
    onUpdateDaySchedule(currentDay, {
      ...activeSchedule,
      slots: updated,
    });

    onAwardXP?.(
      25,
      `Completed ${minutesSpent}m Focus Timer Session`,
      'timer',
      slot?.subject
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Student View Switcher: Daily Timetable vs Past Chapters & Revision Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            onClick={() => setScheduleViewTab('timetable')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              scheduleViewTab === 'timetable'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Daily Timetable Schedule</span>
          </button>

          <button
            onClick={() => setScheduleViewTab('revisions')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              scheduleViewTab === 'revisions'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span>Past Chapters & Revision Tracker</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
              {pastWeekRecords.length} wk · {pastMonthRecords.length} mo
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
          {scheduleViewTab === 'timetable' ? (
            <button
              onClick={() => setScheduleViewTab('revisions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Past 7 Days: <strong>{pastWeekRecords.length} chapters</strong> ({pastWeekHours}h)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenRevisionHistoryModal && (
                <button
                  onClick={onOpenRevisionHistoryModal}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-slate-500" />
                  <span>Print Sheet</span>
                </button>
              )}
              <button
                onClick={() => setIsAddingRevision(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Revision</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Schedule Comments & Encouragement Banner */}
      {facultyComments.length > 0 && (
        <FacultyScheduleBanner
          comments={facultyComments}
          currentDay={currentDay}
          onAcknowledgeComment={(id) => onAcknowledgeFacultyComment?.(id)}
          onReplyToComment={(id, text) => onReplyToFacultyComment?.(id, text)}
          onOpenFacultyPortal={onOpenFacultyPortal}
        />
      )}

      {/* VIEW MODE 1: DAILY TIMETABLE */}
      {scheduleViewTab === 'timetable' && (
        <>
          {/* Quick summary bar of past week & month revision progress */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/60 to-purple-50/40 dark:from-sky-950/30 dark:via-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Student Past Revisions Tracker:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Past Week: <strong>{pastWeekRecords.length} chapters revised</strong> ({pastWeekHours}h, {pastWeekQuestions} Qs) · Past Month:{' '}
                  <strong>{pastMonthRecords.length} chapters</strong> ({pastMonthHours}h, {pastMonthQuestions} Qs)
                </span>
              </div>
            </div>

            <button
              onClick={() => setScheduleViewTab('revisions')}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-700 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors text-xs"
            >
              <span>Explore Past Chapters & Revisions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Day Selector & Quick Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Day of Week Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {DAYS.map((d) => {
              const isSelected = d === currentDay;
              const isToday = d === realDayName;

              return (
                <button
                  key={d}
                  onClick={() => setCurrentDay(d)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 relative flex flex-col items-center cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {d.slice(0, 3)}
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </span>
                  {isToday && (
                    <span
                      className={`text-[9px] font-normal ${
                        isSelected ? 'text-slate-300 dark:text-sky-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Routine Preset Selector & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Past Week & Month Chapter/Revision History Retro Button */}
            {onOpenRevisionHistoryModal && (
              <button
                onClick={onOpenRevisionHistoryModal}
                className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="View what chapters and revision you completed in the past week and past month"
              >
                <History className="w-3.5 h-3.5 text-sky-200" />
                <span>Past Week & Month Revisions</span>
                {revisionHistoryCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    {revisionHistoryCount}
                  </span>
                )}
              </button>
            )}

            {/* Preset Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Routine:</span>
              <select
                value={activeSchedule.preset}
                onChange={(e) =>
                  handleApplyPreset(e.target.value as SchedulePreset)
                }
                className="font-medium text-slate-800 dark:text-slate-100 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="school_day" className="dark:bg-slate-800">Regular School Day</option>
                <option value="weekend_deep_prep" className="dark:bg-slate-800">Weekend Marathon</option>
                <option value="coaching_day" className="dark:bg-slate-800">Coaching Session Day</option>
              </select>
            </div>

            {/* Shift Timing Button */}
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Shift Timings</span>
            </button>

            {/* Add Slot Button */}
            <button
              onClick={() => {
                setEditingSlot(null);
                setIsSlotModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slot</span>
            </button>
          </div>
        </div>

        {/* Day Summary Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Planned Study Hours
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {totalStudyHoursFormatted}{' '}
              <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">
                / {activeSchedule.dailyTargetHours}h target
              </span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Target Practice
            </span>
            <span className="font-bold text-amber-900 dark:text-amber-400 text-sm">
              {activeSchedule.dailyTargetProblems}{' '}
              <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">
                problems / day
              </span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Slots Progress
            </span>
            <span className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">
              {completedSlots.length} of {activeSchedule.slots.length} Done
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Day Adherence
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Timeline List */}
      <div className="space-y-3">
        {activeSchedule.slots.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No study slots scheduled for {currentDay}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Add custom slots or load a predefined routine to start tracking.
            </p>
            <button
              onClick={() => handleApplyPreset('school_day')}
              className="px-4 py-2 text-xs font-semibold bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
            >
              Load Default School Day Routine
            </button>
          </div>
        ) : (
          activeSchedule.slots.map((slot, index) => {
            const theme = SUBJECT_THEMES[slot.subject] || SUBJECT_THEMES.Physics;
            const durationMins = calculateSlotDurationMinutes(
              slot.startTime,
              slot.endTime
            );
            const durationFormatted = formatDurationHuman(durationMins);
            const isCurrentlyActive =
              isViewingToday && isSlotActiveNow(slot.startTime, slot.endTime);
            const remainingMins = isCurrentlyActive
              ? getSlotRemainingMinutes(slot.endTime)
              : 0;

            const isStudyBlock =
              slot.subject !== 'Break' && slot.subject !== 'School';

            return (
              <div
                key={slot.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCurrentlyActive
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                    : slot.status === 'completed'
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 opacity-85'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Active Slot Top Banner */}
                {isCurrentlyActive && (
                  <div className="bg-sky-600 text-white px-4 py-1 text-xs font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ACTIVE STUDY BLOCK RIGHT NOW
                    </span>
                    <span className="font-mono text-sky-100">
                      {remainingMins}m remaining
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Timing, Subject & Content */}
                  <div className="flex items-start gap-4">
                    {/* Time Column */}
                    <div className="w-28 shrink-0 text-left">
                      <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {format12Hour(slot.startTime)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {format12Hour(slot.endTime)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {durationFormatted}
                      </div>
                    </div>

                    {/* Vertical Hairline Divider */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />

                    {/* Slot Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="font-semibold"
                          style={{ color: theme.accentColor }}
                        >
                          {slot.subject}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600">·</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {slot.category}
                        </span>
                        {slot.reminderMinutesBefore !== undefined && (
                          <>
                            <span className="text-slate-400 dark:text-slate-600">·</span>
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                              Alert {slot.reminderMinutesBefore}m before
                            </span>
                          </>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold text-slate-900 dark:text-white ${
                          slot.status === 'completed'
                            ? 'line-through text-slate-500 dark:text-slate-500'
                            : ''
                        }`}
                      >
                        {slot.title}
                      </h4>

                      {slot.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                          {slot.notes}
                        </p>
                      )}

                      {/* Matching Faculty Mentor Comment on this Slot */}
                      {(() => {
                        const slotComment = facultyComments.find(
                          (c) =>
                            (c.targetDay === currentDay || c.targetDay === 'All Days') &&
                            c.targetSlotTitle &&
                            (c.targetSlotTitle.toLowerCase().includes(slot.title.toLowerCase()) ||
                              slot.title.toLowerCase().includes(c.targetSlotTitle.toLowerCase()))
                        );
                        if (!slotComment) return null;
                        return (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700/80 text-xs text-amber-950 dark:text-amber-100 flex items-start gap-2 max-w-xl">
                            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                                Mentor Directive ({slotComment.facultyName} · {slotComment.facultySubject}):
                              </span>
                              <p className="text-[11px] leading-snug text-slate-800 dark:text-slate-200">
                                {slotComment.message}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {slot.actualMinutesSpent !== undefined &&
                        slot.actualMinutesSpent > 0 && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            ✓ Logged {slot.actualMinutesSpent} mins of focused study
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right: Actions, Status & Focus Timer */}
                  <div className="flex items-center gap-2 flex-wrap self-end md:self-center shrink-0">
                    {/* Launch Focus Timer (For Study Blocks) */}
                    {isStudyBlock && (
                      <button
                        onClick={() => setFocusSlot(slot)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Focus</span>
                      </button>
                    )}

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={slot.status}
                        onChange={(e) =>
                          handleStatusChange(
                            slot.id,
                            e.target.value as SlotStatus
                          )
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer appearance-none pr-7 ${
                          slot.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : slot.status === 'in_progress'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : slot.status === 'skipped'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <option value="pending" className="dark:bg-slate-800">Pending</option>
                        <option value="in_progress" className="dark:bg-slate-800">In Progress</option>
                        <option value="completed" className="dark:bg-slate-800">Completed</option>
                        <option value="skipped" className="dark:bg-slate-800">Skipped</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Move Up/Down Controls */}
                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleMoveSlot(index, 'up')}
                        disabled={index === 0}
                        title="Move slot earlier"
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlot(index, 'down')}
                        disabled={index === activeSchedule.slots.length - 1}
                        title="Move slot later"
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Slot Button */}
                    <button
                      onClick={() => {
                        setEditingSlot(slot);
                        setIsSlotModalOpen(true);
                      }}
                      title="Edit timings and details"
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Slot Button */}
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      title="Remove slot"
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* VIEW MODE 2: PAST CHAPTERS & REVISION TRACKER (PAST WEEK & MONTH RETRO) */}
      {scheduleViewTab === 'revisions' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Class 11 Chapters & Revision Retro
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Week & Month Log
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review chapters revised, coaching DPPs solved, formulas refreshed, and problem sets logged over the past week and month.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingRevision(!isAddingRevision)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingRevision ? 'Cancel' : '+ Log Chapter Revision'}</span>
                </button>

                {onOpenRevisionHistoryModal && (
                  <button
                    onClick={onOpenRevisionHistoryModal}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Open Fullscreen Modal & Print Sheet"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Fullscreen Retro</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timeframe Selector Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setPeriodFilter('week')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    periodFilter === 'week'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Past 7 Days (Past Week)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${periodFilter === 'week' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {pastWeekRecords.length}
                  </span>
                </button>

                <button
                  onClick={() => setPeriodFilter('month')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    periodFilter === 'month'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Past 30 Days (Past Month)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${periodFilter === 'month' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {pastMonthRecords.length}
                  </span>
                </button>

                <button
                  onClick={() => setPeriodFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    periodFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>All-Time History ({revisionRecords.length})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter chapters or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden w-48 sm:w-60"
                />
              </div>
            </div>

            {/* Subject and Revision Type Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter by Subject:
              </span>
              {(['all', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    subjectFilter === sub
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
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
          </div>

          {/* Quick Add Form Drawer (if open) */}
          {isAddingRevision && (
            <form
              onSubmit={handleCreateRevision}
              className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 shadow-sm animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Log Completed Chapter Revision Session
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingRevision(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSub}
                    onChange={(e) => {
                      const s = e.target.value as 'Physics' | 'Chemistry' | 'Mathematics';
                      setNewSub(s);
                      const firstCh = GRADE_11_SYLLABUS.find((c) => c.subject === s)?.chapterName;
                      if (firstCh) setNewChap(firstCh);
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
                    Class 11 Chapter
                  </label>
                  <select
                    value={newChap}
                    onChange={(e) => setNewChap(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {availableChapters.map((ch) => (
                      <option key={ch.id} value={ch.chapterName}>
                        {ch.chapterName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Revision Focus Type
                  </label>
                  <select
                    value={newRevType}
                    onChange={(e) => setNewRevType(e.target.value as RevisionType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Coaching DPP / Problem Set">Coaching DPP / Problem Set</option>
                    <option value="Full Chapter Revision">Full Chapter Revision</option>
                    <option value="NCERT Line-by-Line & Formulas">NCERT Line-by-Line & Formulas</option>
                    <option value="PYQ Marathon (JEE Main/Adv)">PYQ Marathon (JEE Main/Adv)</option>
                    <option value="Mistake Diary Trap Review">Mistake Diary Trap Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Questions Solved
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={newQuestions}
                    onChange={(e) => setNewQuestions(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Concept Confidence
                  </label>
                  <select
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 - Mastered</option>
                    <option value={4}>⭐⭐⭐⭐ 4 - Strong</option>
                    <option value={3}>⭐⭐⭐ 3 - Moderate</option>
                    <option value={2}>⭐⭐ 2 - Needs Practice</option>
                    <option value={1}>⭐ 1 - Weak / Gaps</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Notes / Key Formulas & Insights
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solved 25 HC Verma numericals on relative velocity in 2D. Zero silly errors on rain-man problems."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingRevision(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Record & Claim +35 XP</span>
                </button>
              </div>
            </form>
          )}

          {/* KPI Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs">
              <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 font-semibold">
                <span>Total Revision Time</span>
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mt-1 font-black text-xl text-sky-950 dark:text-sky-100 font-mono">
                {totalFilteredHours} hrs
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {periodFilter === 'week' ? 'Past 7 days' : periodFilter === 'month' ? 'Past 30 days' : 'All-time log'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold">
                <span>Chapters Revised</span>
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mt-1 font-black text-xl text-indigo-950 dark:text-indigo-100 font-mono">
                {distinctChaptersFiltered}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Distinct Class 11 chapters
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
                <span>Questions & DPPs</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-1 font-black text-xl text-emerald-950 dark:text-emerald-100 font-mono">
                {totalFilteredQuestions}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Practiced numericals
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-semibold">
                <span>Avg Confidence</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-1 font-black text-xl text-amber-950 dark:text-amber-100 font-mono flex items-center gap-1">
                <span>{avgFilteredConfidence}</span>
                <span className="text-xs text-amber-500 font-normal">/ 5.0</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Self-evaluation score
              </p>
            </div>
          </div>

          {/* Cards Grid of Revisions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {periodFilter === 'week'
                    ? 'Past 7 Days Revisions'
                    : periodFilter === 'month'
                    ? 'Past 30 Days Revisions'
                    : 'All Past Revisions'}{' '}
                  ({filteredRevisionRecords.length})
                </span>
              </h4>
              <span className="text-slate-400 text-[11px]">
                Showing most recent first
              </span>
            </div>

            {filteredRevisionRecords.length === 0 ? (
              <div className="p-10 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No revision records found for {periodFilter === 'week' ? 'the past week' : periodFilter === 'month' ? 'the past month' : 'this filter'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &quot;+ Log Chapter Revision&quot; above to log your recent coaching DPP or full chapter study!
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingRevision(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Revision Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRevisionRecords.map((record) => {
                  const theme = SUBJECT_THEMES[record.subject] || SUBJECT_THEMES.Physics;

                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all shadow-2xs space-y-2.5 group relative"
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

                        {onDeleteRevisionRecord && (
                          <button
                            onClick={() => onDeleteRevisionRecord(record.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1 rounded-md cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {record.durationMinutes} mins
                        </span>

                        {record.questionsSolved !== undefined && record.questionsSolved > 0 && (
                          <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {record.questionsSolved} Qs
                          </span>
                        )}

                        {record.confidenceRating && (
                          <span className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: record.confidenceRating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </span>
                        )}
                      </div>

                      {record.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Adding / Editing Slot */}
      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(null);
        }}
        onSave={handleSaveSlot}
        slotToEdit={editingSlot}
        dayName={currentDay}
      />

      {/* Modal for Shifting Schedule Timings */}
      <TimeShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        slots={activeSchedule.slots}
        onApplyShift={handleApplyShifted}
        dayName={currentDay}
      />

      {/* Dedicated Focus Mode Pomodoro Timer */}
      {focusSlot && (
        <FocusTimer
          slot={focusSlot}
          isOpen={!!focusSlot}
          onClose={() => setFocusSlot(null)}
          onCompleteSlot={handleFocusTimerComplete}
        />
      )}
    </div>
  );
}
