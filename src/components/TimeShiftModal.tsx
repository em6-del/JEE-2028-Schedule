import { useState } from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';
import { StudySlot } from '../types';
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  format12Hour,
} from '../utils/timeHelpers';

interface TimeShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: StudySlot[];
  onApplyShift: (shiftedSlots: StudySlot[]) => void;
  dayName: string;
}

export function TimeShiftModal({
  isOpen,
  onClose,
  slots,
  onApplyShift,
  dayName,
}: TimeShiftModalProps) {
  const [shiftMinutes, setShiftMinutes] = useState<number>(30);
  const [applyMode, setApplyMode] = useState<'all' | 'from_index'>('all');
  const [startIndex, setStartIndex] = useState<number>(0);

  if (!isOpen) return null;

  const calculateShifted = (): StudySlot[] => {
    return slots.map((slot, idx) => {
      if (applyMode === 'from_index' && idx < startIndex) {
        return slot;
      }
      const startMin = parseTimeToMinutes(slot.startTime) + shiftMinutes;
      const endMin = parseTimeToMinutes(slot.endTime) + shiftMinutes;
      return {
        ...slot,
        startTime: formatMinutesToTime(startMin),
        endTime: formatMinutesToTime(endMin),
      };
    });
  };

  const previewSlots = calculateShifted();

  const handleApply = () => {
    onApplyShift(previewSlots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Adjust Schedule Timings ({dayName})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shift slot timings forward or backward effortlessly
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick presets for minutes shift */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Shift Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[-30, -15, 15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setShiftMinutes(mins)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    shiftMinutes === mins
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200 ring-1 ring-sky-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {mins > 0 ? `+${mins} min` : `${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Scope selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Apply Shift To:
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="radio"
                  name="applyMode"
                  checked={applyMode === 'all'}
                  onChange={() => setApplyMode('all')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span>All slots for {dayName}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="radio"
                  name="applyMode"
                  checked={applyMode === 'from_index'}
                  onChange={() => setApplyMode('from_index')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span>Only from slot onwards:</span>
                <select
                  disabled={applyMode !== 'from_index'}
                  value={startIndex}
                  onChange={(e) => setStartIndex(Number(e.target.value))}
                  className="text-xs border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  {slots.map((s, i) => (
                    <option key={s.id} value={i} className="dark:bg-slate-800">
                      #{i + 1} {s.title} ({format12Hour(s.startTime)})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Preview Changes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preview of Timing Changes:
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs bg-slate-50/50 dark:bg-slate-850/50">
              {slots.map((slot, i) => {
                const shifted = previewSlots[i];
                const isChanged =
                  slot.startTime !== shifted.startTime ||
                  slot.endTime !== shifted.endTime;

                return (
                  <div
                    key={slot.id}
                    className={`p-2.5 flex items-center justify-between ${
                      isChanged
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="truncate pr-2 max-w-[200px]">
                      <span className="text-slate-900 dark:text-slate-200 font-medium">
                        {slot.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-slate-500 dark:text-slate-400">
                        {format12Hour(slot.startTime)}
                      </span>
                      {isChanged && (
                        <>
                          <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-amber-800 dark:text-amber-300 font-semibold">
                            {format12Hour(shifted.startTime)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/60 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs transition-colors"
          >
            Apply Timing Shift
          </button>
        </div>
      </div>
    </div>
  );
}
