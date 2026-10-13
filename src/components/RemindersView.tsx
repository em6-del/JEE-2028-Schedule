import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Volume2,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { StudyReminder } from '../types';
import { format12Hour } from '../utils/timeHelpers';
import { playChimeTone } from '../utils/audio';
import {
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notifications';

interface RemindersViewProps {
  reminders: StudyReminder[];
  setReminders: React.Dispatch<React.SetStateAction<StudyReminder[]>>;
  autoSlotRemindersEnabled: boolean;
  setAutoSlotRemindersEnabled: (enabled: boolean) => void;
}

export function RemindersView({
  reminders,
  setReminders,
  autoSlotRemindersEnabled,
  setAutoSlotRemindersEnabled,
}: RemindersViewProps) {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('16:00');
  const [repeat, setRepeat] = useState<StudyReminder['repeat']>('Everyday');
  const [category, setCategory] = useState<StudyReminder['category']>('Study Slot');

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setReminders((prev) => [
      ...prev,
      {
        id: `rem-${Date.now()}`,
        title: title.trim(),
        time,
        repeat,
        category,
        enabled: true,
      },
    ]);

    setTitle('');
    setIsAddOpen(false);
  };

  const addQuickPreset = (presetTitle: string, presetTime: string, cat: StudyReminder['category']) => {
    setReminders((prev) => [
      ...prev,
      {
        id: `rem-preset-${Date.now()}`,
        title: presetTitle,
        time: presetTime,
        repeat: 'Everyday',
        category: cat,
        enabled: true,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Notification Permission & Audio Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Study Reminders & Timetable Alerts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Never miss a JEE revision block or problem-solving session
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={playChimeTone}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Test Chime</span>
            </button>

            {isNotificationSupported() && permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enable Desktop Alerts</span>
              </button>
            )}

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Reminder</span>
            </button>
          </div>
        </div>

        {/* Global Auto-Slot Reminder Switch */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Automatic Study Slot Starting Alerts
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Play alert chime and notify 5 minutes before each scheduled study block
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSlotRemindersEnabled}
              onChange={(e) => setAutoSlotRemindersEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-4 transition-colors duration-150">
        <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Recommended Grade 11 Reminders:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() =>
              addQuickPreset(
                'Organic Chemistry Flashcards & Reactions',
                '21:30',
                'Formula Revision'
              )
            }
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-slate-700 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            + 9:30 PM Organic Chemistry Flashcards
          </button>
          <button
            onClick={() =>
              addQuickPreset(
                'Solve 15 Mathematics PYQs Sprint',
                '17:30',
                'Study Slot'
              )
            }
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-slate-700 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            + 5:30 PM Maths 15 PYQs Sprint
          </button>
          <button
            onClick={() =>
              addQuickPreset(
                'Hydration & Eye Relaxation Break',
                '16:30',
                'Hydration & Break'
              )
            }
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-slate-700 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            + 4:30 PM Hydration & Eye Break
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs transition-colors duration-150">
        {reminders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No reminders scheduled. Add your first study alert above.
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                reminder.enabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Time Display */}
                <div className="w-20 text-left font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {format12Hour(reminder.time)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {reminder.title}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {reminder.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 px-2 py-0.2 rounded-md font-medium">
                      {reminder.repeat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => handleToggleReminder(reminder.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>

                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add Study Alert / Reminder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Schedule audio & notification alerts for key routines
            </p>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics HC Verma 20 questions target"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alert Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Repeat
                  </label>
                  <select
                    value={repeat}
                    onChange={(e) =>
                      setRepeat(e.target.value as StudyReminder['repeat'])
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="Everyday" className="dark:bg-slate-800">Everyday</option>
                    <option value="Weekdays" className="dark:bg-slate-800">Weekdays (Mon-Fri)</option>
                    <option value="Weekends" className="dark:bg-slate-800">Weekends (Sat-Sun)</option>
                    <option value="Once" className="dark:bg-slate-800">Once</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as StudyReminder['category'])
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                >
                  <option value="Study Slot" className="dark:bg-slate-800">Study Slot</option>
                  <option value="Formula Revision" className="dark:bg-slate-800">Formula Revision</option>
                  <option value="DPP Submission" className="dark:bg-slate-800">DPP Submission</option>
                  <option value="Hydration & Break" className="dark:bg-slate-800">Hydration & Break</option>
                  <option value="Bedtime" className="dark:bg-slate-800">Bedtime</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
