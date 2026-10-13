import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Bell,
  Target,
  BarChart3,
  Sparkles,
  Flame,
  Volume2,
  AlertOctagon,
  Moon,
  Sun,
  ShieldCheck,
  User,
  Lock,
  Trophy,
  Zap,
  GraduationCap,
  ShieldAlert,
  Megaphone,
  X,
  History,
} from 'lucide-react';
import { StudentProfile, FacultySession, SuperAdminSession, InstitutionalAnnouncement } from '../types';
import { JEE_2028_TARGET_DATE } from '../data/defaultSchedule';
import { getDaysRemainingUntil } from '../utils/timeHelpers';
import { playChimeTone } from '../utils/audio';
import { getRankTier } from '../utils/xpEngine';

interface HeaderProps {
  activeTab: 'schedule' | 'goals' | 'error_log' | 'reminders' | 'analytics' | 'leaderboard';
  setActiveTab: (tab: 'schedule' | 'goals' | 'error_log' | 'reminders' | 'analytics' | 'leaderboard') => void;
  activeRemindersCount: number;
  pendingErrorCount?: number;
  streakDays: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentProfile: StudentProfile;
  onOpenPrivacyModal: () => void;
  studentXP?: number;
  facultySession?: FacultySession;
  onOpenFacultyPortal: () => void;
  superAdminSession?: SuperAdminSession;
  onOpenSuperAdminModal?: () => void;
  activeAnnouncement?: InstitutionalAnnouncement | null;
  onOpenRevisionHistoryModal?: () => void;
  revisionCount?: number;
}

export function Header({
  activeTab,
  setActiveTab,
  activeRemindersCount,
  pendingErrorCount = 0,
  streakDays,
  isDarkMode,
  onToggleDarkMode,
  currentProfile,
  onOpenPrivacyModal,
  studentXP = 0,
  facultySession,
  onOpenFacultyPortal,
  superAdminSession,
  onOpenSuperAdminModal,
  activeAnnouncement,
  onOpenRevisionHistoryModal,
  revisionCount = 0,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const daysToJEE = getDaysRemainingUntil(JEE_2028_TARGET_DATE, currentTime);
  const currentTier = getRankTier(studentXP);
  const isAnnouncementVisible =
    activeAnnouncement &&
    activeAnnouncement.isActive &&
    !dismissedAnnouncements.includes(activeAnnouncement.id);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs transition-colors duration-150">
      {/* Top Banner: JEE 2028 Countdown & Grade 11 Roadmap Anchor */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 px-4 py-2 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Meccademia Education Institute · JEE 2028 Hub
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Grade 11 Foundation & Mastery Phase</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Student Privacy & Data Isolation Badge */}
            <button
              onClick={onOpenPrivacyModal}
              title="Student Data Privacy & Independent Storage Vault"
              className="text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/50 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium hidden sm:inline">100% Student-Isolated Vault</span>
              <span className="text-[11px] font-medium sm:hidden">Private Vault</span>
            </button>

            {/* Past Chapters & Revision Retro Quick Button */}
            {onOpenRevisionHistoryModal && (
              <button
                onClick={onOpenRevisionHistoryModal}
                title="View Past Week & Month Chapter Revisions Retro"
                className="text-indigo-300 hover:text-indigo-200 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-600/50 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Past Revisions ({revisionCount})</span>
                <span className="text-[11px] font-medium sm:hidden">Revisions</span>
              </button>
            )}

            {/* Live Student XP & Rank Tier Pill */}
            <button
              onClick={() => setActiveTab('leaderboard')}
              title="Click to view Batch Leadership Board & XP Quests"
              className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-[11px]">{studentXP.toLocaleString()} XP</span>
              <span className="text-[11px] text-amber-400/90 hidden sm:inline">· {currentTier.badge} Lvl {currentTier.level}</span>
            </button>

            <div className="flex items-center gap-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-medium tracking-tight">
                {daysToJEE} Days to JEE 2028
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{streakDays} Day Streak</span>
            </div>

            <button
              onClick={playChimeTone}
              title="Test audio chime"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Sound Test</span>
            </button>

            {/* Global Dark Mode Toggle in Top Banner */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-[11px] font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Broadcast Alert Banner (Super Admin Transmitted) */}
      {isAnnouncementVisible && (
        <div
          className={`px-4 py-2 text-xs border-b transition-colors flex items-center justify-between gap-3 ${
            activeAnnouncement.priority === 'urgent'
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-900'
              : activeAnnouncement.priority === 'highlight'
              ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 border-amber-300 dark:border-amber-900'
              : 'bg-sky-50 dark:bg-sky-950/80 text-sky-950 dark:text-sky-100 border-sky-300 dark:border-sky-900'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span
                className={`p-1 rounded-md shrink-0 ${
                  activeAnnouncement.priority === 'urgent'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
              </span>
              <div className="truncate">
                <strong className="font-semibold mr-1.5">{activeAnnouncement.title}</strong>
                <span className="hidden sm:inline opacity-90">{activeAnnouncement.content}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] opacity-75 hidden md:inline">
                From: {activeAnnouncement.author}
              </span>
              <button
                onClick={() => setDismissedAnnouncements((prev) => [...prev, activeAnnouncement.id])}
                className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-current transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm font-extrabold text-lg tracking-wider">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Meccademia Education Institute
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Class 11 Foundation
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              JEE 2028 Study Schedule & Mastery Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: JEE Main & Advanced 2028 · Modular Timings, Daily Goals & Leaderboard
            </p>
          </div>
        </div>

        {/* Live Clock, Student Profile Badge & Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Student Profile Badge */}
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-left shadow-2xs"
            title="Click to view Student Data Privacy Assurance, Switch Profiles, or Backup"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                  {currentProfile.name}
                </span>
                {currentProfile.pin && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Independent Vault
              </span>
            </div>
          </button>

          {/* Faculty / Mentor Mode Button */}
          <button
            onClick={onOpenFacultyPortal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-left shadow-2xs text-xs font-semibold ${
              facultySession?.isLoggedIn
                ? 'border-amber-400/80 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/80'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Faculty & Mentor Portal: View Batch Leaderboards, Inspect Students & Award Points"
          >
            <GraduationCap
              className={`w-4 h-4 ${
                facultySession?.isLoggedIn
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            />
            <span className="hidden sm:inline">
              {facultySession?.isLoggedIn ? 'Faculty Portal' : 'Faculty'}
            </span>
          </button>

          {/* Super Admin Command Center Button */}
          <button
            onClick={onOpenSuperAdminModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-left shadow-2xs text-xs font-semibold ${
              superAdminSession?.isLoggedIn
                ? 'border-indigo-500/80 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/80'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Super Admin Command Center: Monitor Student & Faculty Activity, Live Audit Trail & Broadcasts"
          >
            <ShieldAlert
              className={`w-4 h-4 ${
                superAdminSession?.isLoggedIn
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            />
            <span className="hidden sm:inline">
              {superAdminSession?.isLoggedIn ? 'Super Admin' : 'Super Admin'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' · '}
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          {/* Navigation Segmented Controls */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'goals'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Goals & Journal</span>
            </button>

            <button
              onClick={() => setActiveTab('error_log')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'error_log'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Error Log</span>
              {pendingErrorCount > 0 && (
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {pendingErrorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'reminders'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Reminders</span>
              {activeRemindersCount > 0 && (
                <span className="ml-1 text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {activeRemindersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* Quick Theme Toggle Icon Button */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle dark mode theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

