import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Calendar,
  Sparkles,
  Zap,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyJournalEntry, MentalStateType } from '../types';

interface DailyJournalProps {
  entries: DailyJournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<DailyJournalEntry[]>>;
  onAwardXP?: (points: number, actionTitle: string, category: 'journal') => void;
}

const MENTAL_STATES: {
  label: MentalStateType;
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
}[] = [
  {
    label: 'Laser Focused',
    icon: Flame,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  {
    label: 'Productive & Steady',
    icon: Sparkles,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50 border-sky-200',
  },
  {
    label: 'Breakthrough Moment',
    icon: Zap,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  {
    label: 'Tired / Low Energy',
    icon: Meh,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-200',
  },
  {
    label: 'Distracted',
    icon: Frown,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  {
    label: 'Anxious / Overwhelmed',
    icon: AlertTriangle,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
];

export function DailyJournal({ entries, setEntries, onAwardXP }: DailyJournalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Form states
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [mentalState, setMentalState] =
    useState<MentalStateType>('Productive & Steady');
  const [energyRating, setEnergyRating] = useState<number>(4);
  const [topicsCovered, setTopicsCovered] = useState('');
  const [reflection, setReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Check if an entry already exists for selectedDate
  const existingForDate = entries.find((e) => e.date === selectedDate);

  // Populate form if selecting an existing date
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existing = entries.find((e) => e.date === date);
    if (existing) {
      setMentalState(existing.mentalState);
      setEnergyRating(existing.energyRating);
      setTopicsCovered(existing.topicsCovered);
      setReflection(existing.reflection);
      setTomorrowFocus(existing.tomorrowFocus || '');
    } else {
      setTopicsCovered('');
      setReflection('');
      setTomorrowFocus('');
      setMentalState('Productive & Steady');
      setEnergyRating(4);
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim() || !topicsCovered.trim()) return;

    const isNewEntry = !existingForDate;

    const newOrUpdatedEntry: DailyJournalEntry = {
      id: existingForDate ? existingForDate.id : `journal-${Date.now()}`,
      date: selectedDate,
      mentalState,
      energyRating,
      topicsCovered: topicsCovered.trim(),
      reflection: reflection.trim(),
      tomorrowFocus: tomorrowFocus.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => {
      const filtered = prev.filter((item) => item.date !== selectedDate);
      return [newOrUpdatedEntry, ...filtered];
    });

    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (isNewEntry) {
      onAwardXP?.(
        30,
        `Logged Daily Study Journal (${selectedDate})`,
        'journal'
      );
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            End-of-Day Study Reflection & Mental State Journal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Write a 2-3 sentence reflection each evening to monitor cognitive focus, energy, and topics mastered
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Log Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden text-xs cursor-pointer"
          />
        </div>
      </div>

      {/* Reflection Entry Form */}
      <form onSubmit={handleSaveEntry} className="space-y-4">
        {/* Mental State Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            How was your mental state & focus today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {MENTAL_STATES.map((state) => {
              const Icon = state.icon;
              const isSelected = mentalState === state.label;

              return (
                <button
                  type="button"
                  key={state.label}
                  onClick={() => setMentalState(state.label)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? `${state.bgColor} dark:bg-slate-800 dark:border-sky-500 ring-2 ring-sky-500 font-bold shadow-xs`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${state.color}`} />
                  <span className="leading-tight text-[11px]">{state.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Rating & Topics Covered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Energy Rating (1 to 5) */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Energy & Stamina Level:
            </label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEnergyRating(lvl)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                    energyRating >= lvl
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {lvl}
                </button>
              ))}
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-mono">
                {energyRating === 5
                  ? 'Peak'
                  : energyRating === 4
                  ? 'High'
                  : energyRating === 3
                  ? 'Moderate'
                  : 'Low'}
              </span>
            </div>
          </div>

          {/* Topics Covered */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topics & Chapters Covered Today
            </label>
            <input
              type="text"
              required
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="e.g. Kinematics 2D Relative Velocity + Chemical Bonding VSEPR geometries"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {/* 2-3 Sentence Reflection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Daily Reflection (2–3 Sentences)
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Prompt: What went smoothly? What concept felt tricky? Did you follow your slots?
            </span>
          </div>
          <textarea
            rows={3}
            required
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="e.g. Solved 24 questions during the morning block with minimal distractions. Felt slightly sluggish during late afternoon, but a 15-minute walk reset my mind. Need to watch out for calculation mistakes in coordinate geometry."
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none leading-relaxed"
          />
        </div>

        {/* Tomorrow's Prime Focus */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tomorrow's Primary Priority (1 Key Focus)
          </label>
          <input
            type="text"
            value={tomorrowFocus}
            onChange={(e) => setTomorrowFocus(e.target.value)}
            placeholder="e.g. Complete HC Verma Kinematics Exercise Questions 25-45 without checking hints."
            className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-1">
          {isSavedRecently ? (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Reflection saved for {selectedDate}!
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Takes 90 seconds · Consolidates your day's neural learning
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{existingForDate ? 'Update Reflection' : 'Save Daily Reflection'}</span>
          </button>
        </div>
      </form>

      {/* Previous Reflections Log */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
          <span>Recent Journal Entries</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">({entries.length})</span>
        </h3>

        {entries.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-3">
            No reflections recorded yet. Fill out your first 2-3 sentence reflection above.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry) => {
              const stateObj =
                MENTAL_STATES.find((s) => s.label === entry.mentalState) ||
                MENTAL_STATES[1];
              const Icon = stateObj.icon;

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {entry.date}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${stateObj.bgColor} ${stateObj.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {entry.mentalState}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Energy: {entry.energyRating}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDateChange(entry.date)}
                        title="Edit reflection"
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete reflection"
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Covered: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {entry.topicsCovered}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-850 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-750">
                    "{entry.reflection}"
                  </p>

                  {entry.tomorrowFocus && (
                    <div className="text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-1 pt-0.5">
                      <span className="font-semibold">Next Focus:</span>
                      <span>{entry.tomorrowFocus}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
