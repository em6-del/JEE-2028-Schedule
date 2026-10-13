import React, { useRef } from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DayOfWeek, DaySchedule, SubjectType } from '../types';
import {
  calculateSlotDurationMinutes,
  formatDurationHuman,
} from '../utils/timeHelpers';
import { SUBJECT_THEMES } from '../utils/theme';

interface AnalyticsViewProps {
  daySchedules: Record<DayOfWeek, DaySchedule>;
  streakDays: number;
  onImportSchedule: (imported: Record<DayOfWeek, DaySchedule>) => void;
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

export function AnalyticsView({
  daySchedules,
  streakDays,
  onImportSchedule,
}: AnalyticsViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate stats across week
  const weekData = DAYS.map((day) => {
    const sched = daySchedules[day];
    if (!sched) {
      return { day, plannedHours: 0, targetHours: 6, completedSlots: 0, totalSlots: 0 };
    }
    const studySlots = sched.slots.filter(
      (s) => s.subject !== 'Break' && s.subject !== 'School'
    );
    const totalMinutes = studySlots.reduce((acc, s) => {
      return acc + calculateSlotDurationMinutes(s.startTime, s.endTime);
    }, 0);
    const completed = sched.slots.filter((s) => s.status === 'completed').length;

    return {
      day,
      plannedHours: Math.round((totalMinutes / 60) * 10) / 10,
      targetHours: sched.dailyTargetHours,
      completedSlots: completed,
      totalSlots: sched.slots.length,
    };
  });

  const totalWeeklyPlannedHours = weekData.reduce(
    (acc, d) => acc + d.plannedHours,
    0
  );
  const totalWeeklyTargetHours = weekData.reduce(
    (acc, d) => acc + d.targetHours,
    0
  );

  // Subject distribution
  const subjectMinutes: Record<SubjectType, number> = {
    Physics: 0,
    Chemistry: 0,
    Mathematics: 0,
    Revision: 0,
    'Mock/PYQ': 0,
    School: 0,
    Break: 0,
  };

  DAYS.forEach((day) => {
    const sched = daySchedules[day];
    if (sched) {
      sched.slots.forEach((slot) => {
        const mins = calculateSlotDurationMinutes(slot.startTime, slot.endTime);
        subjectMinutes[slot.subject] = (subjectMinutes[slot.subject] || 0) + mins;
      });
    }
  });

  const totalStudySubjectMinutes =
    subjectMinutes.Physics +
    subjectMinutes.Chemistry +
    subjectMinutes.Mathematics +
    subjectMinutes.Revision +
    subjectMinutes['Mock/PYQ'];

  const getPercent = (sub: SubjectType) => {
    if (totalStudySubjectMinutes === 0) return 0;
    return Math.round((subjectMinutes[sub] / totalStudySubjectMinutes) * 100);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(daySchedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'jee_2028_grade11_schedule.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportSchedule(parsed);
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Weekly Planned Study
            </span>
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {totalWeeklyPlannedHours}h
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {totalWeeklyTargetHours}h target
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Average {(totalWeeklyPlannedHours / 7).toFixed(1)}h / day self-study
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Consistency Streak
            </span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {streakDays} Days
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            Active daily study discipline maintained
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              PCM Balance Ratio
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1 text-xs font-mono font-semibold">
            <span className="text-sky-700 dark:text-sky-400">P: {getPercent('Physics')}%</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-emerald-700 dark:text-emerald-400">C: {getPercent('Chemistry')}%</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-amber-700 dark:text-amber-400">M: {getPercent('Mathematics')}%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Balanced allocation across all 3 subjects
          </div>
        </div>
      </div>

      {/* Weekly Hours Bar Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Weekly Schedule Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily planned self-study hours across Monday to Sunday
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6">
          {weekData.map((d) => {
            const maxRefHours = 12;
            const barHeightPct = Math.min(
              100,
              Math.round((d.plannedHours / maxRefHours) * 100)
            );
            const isWeekend = d.day === 'Saturday' || d.day === 'Sunday';

            return (
              <div
                key={d.day}
                className="flex flex-col items-center h-full justify-end group"
              >
                <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-semibold mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {d.plannedHours}h
                </div>

                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isWeekend ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-sky-600 dark:bg-sky-500'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  {d.day.slice(0, 3)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {d.targetHours}h goal
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Distribution Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Subject Time Allocation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Distribution of weekly self-study hours across JEE subjects
        </p>

        <div className="space-y-4">
          {(['Physics', 'Chemistry', 'Mathematics', 'Revision', 'Mock/PYQ'] as SubjectType[]).map(
            (sub) => {
              const theme = SUBJECT_THEMES[sub];
              const pct = getPercent(sub);
              const mins = subjectMinutes[sub] || 0;
              const formattedDuration = formatDurationHuman(mins);

              return (
                <div key={sub} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      {sub}
                    </span>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono">
                      <span>{formattedDuration}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pct}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: theme.accentColor,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Grade 11 to JEE 2028 Strategic Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors duration-150">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Class 11 to JEE 2028 Master Roadmap
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Strategic timeline designed for the 2028 JEE examination batch
        </p>

        <div className="relative border-l-2 border-sky-200 dark:border-sky-900 ml-4 pl-6 space-y-6">
          {/* Phase 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-sky-600 ring-4 ring-sky-100 dark:ring-sky-950" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 px-2 py-0.5 rounded-md">
                CURRENT PHASE (Class 11)
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Sep 2026 – Feb 2027</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Phase 1: Core Mechanics, Bonding & Foundational Algebra
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Build unshakeable problem-solving foundations in Newton's Laws,
              Rotational Motion, Mole Concept, Atomic Structure, Chemical Bonding,
              and Coordinate Geometry. Aim for 40-50 problems solved daily.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Class 11 Consolidation
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Feb 2027 – Apr 2027</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Phase 2: Grade 11 Revision & School Finals
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Clear any Class 11 backlogs in Thermodynamics, Fluid Mechanics,
              and GOC. Complete comprehensive revision of short notes and error notebook.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Class 12 Deep Sprint
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">May 2027 – Nov 2027</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Phase 3: Class 12 Advanced Syllabus & Calculus
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Master Electrodynamics, Differential & Integral Calculus, Organic
              Chemistry mechanisms, and Coordination Compounds. Simultaneous
              weekly Class 11 revision slots.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                JEE 2028 Mock Marathon
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Dec 2027 – Jan 2028</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Phase 4: Full-Length Mocks & Exam Simulation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Attempt 2-3 full 3-hour mock tests per week under strict test conditions.
              Thorough paper analysis to eliminate silly mistakes and optimize time management.
            </p>
          </div>

          {/* Phase 5 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-md">
                EXAM WINDOW
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Jan 2028 – Jun 2028</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Phase 5: JEE Main 2028 (Session 1 & 2) and JEE Advanced 2028
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Deliver peak exam performance and secure top IIT rank!
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Schedule Backup & Sync (JSON)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Export your customized timings and slots or restore from a previously saved JSON file
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Export Backup</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Import Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
