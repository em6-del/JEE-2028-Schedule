import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, Tag, FileText, Bell } from 'lucide-react';
import { StudySlot, SubjectType, SlotCategory } from '../types';
import {
  calculateSlotDurationMinutes,
  formatDurationHuman,
} from '../utils/timeHelpers';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: StudySlot) => void;
  slotToEdit?: StudySlot | null;
  dayName: string;
}

const SUBJECT_OPTIONS: SubjectType[] = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Revision',
  'Mock/PYQ',
  'School',
  'Break',
];

const CATEGORY_OPTIONS: SlotCategory[] = [
  'Theory & Concepts',
  'Problem Solving & DPP',
  'NCERT & Formulas',
  'Mock Test & PYQ',
  'Doubt Clearing & Analysis',
  'School / Coaching',
  'Break / Rest',
];

export function SlotModal({
  isOpen,
  onClose,
  onSave,
  slotToEdit,
  dayName,
}: SlotModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('Physics');
  const [category, setCategory] = useState<SlotCategory>('Problem Solving & DPP');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(5);
  const [hasReminder, setHasReminder] = useState(true);

  useEffect(() => {
    if (slotToEdit) {
      setTitle(slotToEdit.title);
      setSubject(slotToEdit.subject);
      setCategory(slotToEdit.category);
      setStartTime(slotToEdit.startTime);
      setEndTime(slotToEdit.endTime);
      setNotes(slotToEdit.notes || '');
      setHasReminder(!!slotToEdit.reminderMinutesBefore);
      setReminderMinutesBefore(slotToEdit.reminderMinutesBefore || 5);
    } else {
      // Default new slot
      setTitle('Physics: Mechanics Practice');
      setSubject('Physics');
      setCategory('Problem Solving & DPP');
      setStartTime('16:00');
      setEndTime('17:30');
      setNotes('Solve 20 DPP numericals');
      setHasReminder(true);
      setReminderMinutesBefore(5);
    }
  }, [slotToEdit, isOpen]);

  if (!isOpen) return null;

  const durationMins = calculateSlotDurationMinutes(startTime, endTime);
  const durationText = formatDurationHuman(durationMins);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSlot: StudySlot = {
      id: slotToEdit ? slotToEdit.id : `slot-${Date.now()}`,
      title: title.trim(),
      subject,
      category,
      startTime,
      endTime,
      notes: notes.trim(),
      status: slotToEdit ? slotToEdit.status : 'pending',
      reminderMinutesBefore: hasReminder ? reminderMinutesBefore : undefined,
    };

    onSave(newSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {slotToEdit ? 'Edit Study Slot' : 'Add Study Slot'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customizing timings for {dayName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Slot Title / Activity Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics: Work, Energy & Power DPP"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            />
          </div>

          {/* Timings row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Start Time (24h)
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                End Time (24h)
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>Calculated Slot Duration:</span>
            <span className="font-semibold text-sky-900 dark:text-sky-300">{durationText}</span>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Subject
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUBJECT_OPTIONS.map((sub) => (
                <button
                  type="button"
                  key={sub}
                  onClick={() => setSubject(sub)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-left transition-all ${
                    subject === sub
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200 font-semibold ring-1 ring-sky-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Study Category / Focus
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SlotCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Targets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Study Notes / Problem Target (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Target 25 problems from Coaching module. Focus on non-calculator calculations."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none"
            />
          </div>

          {/* Reminder Setting */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Pre-Slot Reminder Alert
                </span>
              </div>
              <input
                type="checkbox"
                id="reminderCheck"
                checked={hasReminder}
                onChange={(e) => setHasReminder(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </div>

            {hasReminder && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pl-6">
                <span>Alert me</span>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={5} className="dark:bg-slate-800">5 minutes before</option>
                  <option value={10} className="dark:bg-slate-800">10 minutes before</option>
                  <option value={15} className="dark:bg-slate-800">15 minutes before</option>
                  <option value={0} className="dark:bg-slate-800">At exact start time</option>
                </select>
                <span>with sound chime</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs transition-colors"
            >
              {slotToEdit ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
