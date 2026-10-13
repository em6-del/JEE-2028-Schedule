import { useState } from 'react';
import { Bell, Clock, X, Play } from 'lucide-react';
import { StudyReminder, StudySlot } from '../types';
import { format12Hour } from '../utils/timeHelpers';

interface ReminderAlertBannerProps {
  activeAlert: {
    type: 'custom_reminder' | 'slot_starting';
    reminder?: StudyReminder;
    slot?: StudySlot;
    message: string;
  } | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onStartFocus?: (slot: StudySlot) => void;
}

export function ReminderAlertBanner({
  activeAlert,
  onDismiss,
  onSnooze,
  onStartFocus,
}: ReminderAlertBannerProps) {
  if (!activeAlert) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top duration-300">
      <div className="bg-slate-900 border-2 border-indigo-500 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-indigo-400 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>Study Timetable Alert</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {activeAlert.message}
            </h4>
            {activeAlert.slot && (
              <p className="text-[11px] text-slate-300 font-mono">
                {format12Hour(activeAlert.slot.startTime)} – {format12Hour(activeAlert.slot.endTime)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeAlert.slot && onStartFocus && (
            <button
              onClick={() => {
                onStartFocus(activeAlert.slot!);
                onDismiss();
              }}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors flex items-center gap-1 shadow-sm"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>Start</span>
            </button>
          )}

          <button
            onClick={() => onSnooze(5)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            Snooze 5m
          </button>

          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
