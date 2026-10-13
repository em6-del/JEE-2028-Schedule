import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Star,
  Sparkles,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  Copy,
  Check,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Info,
  Medal,
  ChevronRight,
  PlusCircle,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  LeaderboardEntry,
  XPActivity,
  SubjectType,
  FacultySession,
  SuperAdminSession,
} from '../types';
import {
  RANK_TIERS,
  XP_REWARDS,
  getRankTier,
  getLevelProgress,
  buildCohortLeaderboard,
  exportStudentXPCode,
  parseStudentXPCode,
} from '../utils/xpEngine';

interface LeaderboardViewProps {
  currentProfile: StudentProfile;
  allProfiles: StudentProfile[];
  totalXP: number;
  xpHistory: XPActivity[];
  streakDays: number;
  topicsMasteredCount: number;
  solvedProblemsCount: number;
  totalStudyHours: number;
  facultySession?: FacultySession;
  onOpenFacultyPortal?: () => void;
  superAdminSession?: SuperAdminSession;
  onOpenSuperAdminModal?: () => void;
  onAwardXP: (
    points: number,
    actionTitle: string,
    category: XPActivity['category'],
    subject?: SubjectType
  ) => void;
  onNavigateTab: (
    tab: 'schedule' | 'goals' | 'error_log' | 'reminders' | 'analytics'
  ) => void;
}

export function LeaderboardView({
  currentProfile,
  allProfiles,
  totalXP,
  xpHistory,
  streakDays,
  topicsMasteredCount,
  solvedProblemsCount,
  totalStudyHours,
  facultySession,
  onOpenFacultyPortal,
  superAdminSession,
  onOpenSuperAdminModal,
  onAwardXP,
  onNavigateTab,
}: LeaderboardViewProps) {
  const [subTab, setSubTab] = useState<'standings' | 'quests' | 'peer_connect' | 'history'>('standings');
  const [standingsSort, setStandingsSort] = useState<'total' | 'weekly'>('total');
  const [subjectFilter, setSubjectFilter] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');

  // Peer import state
  const [peerInputCode, setPeerInputCode] = useState('');
  const [peerImportStatus, setPeerImportStatus] = useState<string | null>(null);
  const [importedPeers, setImportedPeers] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('jee2028_imported_peers_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Custom teacher bonus state
  const [customBonusPoints, setCustomBonusPoints] = useState(50);
  const [customBonusReason, setCustomBonusReason] = useState('Scored 85%+ in Coaching Mock Test');
  const [isBonusAwarded, setIsBonusAwarded] = useState(false);

  // Copy state
  const [hasCopiedCard, setHasCopiedCard] = useState(false);

  const { currentTier, nextTier, percent, xpInCurrentLevel, xpNeededForNext } =
    getLevelProgress(totalXP);

  // Build full cohort leaderboard
  const { entries: cohortEntries, currentStudentRank } = buildCohortLeaderboard(
    {
      id: currentProfile.id,
      name: currentProfile.name,
      batch: currentProfile.batch || 'Class 11 - JEE 2028',
      totalXP,
      streakDays,
      topicsMastered: topicsMasteredCount,
      questionsSolved: solvedProblemsCount,
      studyHours: totalStudyHours,
    },
    importedPeers,
    standingsSort
  );

  // Find who is 1 rank ahead of current student
  const studentIndex = cohortEntries.findIndex((e) => e.isCurrentStudent);
  const rivalAhead = studentIndex > 0 ? cohortEntries[studentIndex - 1] : null;
  const xpDifferenceAhead = rivalAhead
    ? standingsSort === 'weekly'
      ? rivalAhead.weeklyXP - (cohortEntries[studentIndex]?.weeklyXP || 0)
      : rivalAhead.totalXP - totalXP
    : 0;

  // Handle peer import
  const handleImportPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerInputCode.trim()) return;

    const parsed = parseStudentXPCode(peerInputCode);
    if (!parsed) {
      setPeerImportStatus('Invalid XP code. Please paste a valid code starting with "XP-"');
      return;
    }

    const updated = [parsed, ...importedPeers.filter((p) => p.name !== parsed.name)];
    setImportedPeers(updated);
    try {
      localStorage.setItem('jee2028_imported_peers_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setPeerInputCode('');
    setPeerImportStatus(`Added ${parsed.name} (${parsed.totalXP} XP) to your batch leaderboard! 🎉`);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setTimeout(() => setPeerImportStatus(null), 4000);
  };

  // Copy student scorecard
  const handleCopyCard = () => {
    const cardText = `🏆 JEE 2028 Study Card · ${currentProfile.name}
Institute: Meccademia Education Institute
Batch: ${currentProfile.batch || 'Class 11 - JEE 2028'}
Rank: #${currentStudentRank} in Batch Cohort
Level: Level ${currentTier.level} · ${currentTier.title} ${currentTier.badge}
Total XP: ${totalXP.toLocaleString()} XP
Streak: ${streakDays} Days 🔥
Chapters Mastered: ${topicsMasteredCount} | Solved Questions: ${solvedProblemsCount}
Exported from Meccademia Education Institute · JEE 2028 Study Hub`;

    const code = exportStudentXPCode({
      name: currentProfile.name,
      batch: currentProfile.batch || 'Class 11 - JEE 2028',
      totalXP,
      streakDays,
      topicsMastered: topicsMasteredCount,
      questionsSolved: solvedProblemsCount,
      studyHours: totalStudyHours,
    });

    navigator.clipboard.writeText(`${cardText}\n\n[Import Code]: ${code}`);
    setHasCopiedCard(true);
    setTimeout(() => setHasCopiedCard(false), 2500);
  };

  // Handle custom teacher bonus
  const handleAwardCustomBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBonusReason.trim() || customBonusPoints <= 0) return;

    onAwardXP(customBonusPoints, customBonusReason.trim(), 'bonus');
    setIsBonusAwarded(true);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setTimeout(() => setIsBonusAwarded(false), 3000);
  };

  // Top 3 Podium
  const top1 = cohortEntries[0];
  const top2 = cohortEntries[1];
  const top3 = cohortEntries[2];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Card: Rank, Level, Progress & Multiplier */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Current Rank & Student Level */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Batch Standings: Rank #{currentStudentRank} of {cohortEntries.length} Aspirants
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentProfile.batch || 'Class 11 - JEE 2028'}
              </span>
              {onOpenFacultyPortal && (
                <button
                  onClick={onOpenFacultyPortal}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Switch to Faculty / Mentor Portal for Batch Analytics and XP Awarding"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{facultySession?.isLoggedIn ? 'Faculty Portal (Active)' : 'Faculty & Mentor Mode'}</span>
                </button>
              )}
              {onOpenSuperAdminModal && (
                <button
                  onClick={onOpenSuperAdminModal}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open Institutional Super Admin Command Center"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{superAdminSession?.isLoggedIn ? 'Super Admin (Active)' : 'Super Admin Mode'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-amber-300/40 shrink-0">
                {currentTier.badge}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                    Level {currentTier.level} Tier
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-300">
                    Active: <strong className="text-white">{currentProfile.name}</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                  {currentTier.title}
                </h2>
                <p className="text-xs text-slate-300 max-w-xl line-clamp-2 mt-1">
                  {currentTier.description}
                </p>
              </div>
            </div>

            {/* Level Progression Bar */}
            <div className="pt-2 max-w-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  XP Progress: <strong className="text-white font-mono">{totalXP.toLocaleString()} XP</strong>
                </span>
                <span className="text-amber-300 font-mono font-semibold">
                  {nextTier
                    ? `${xpNeededForNext.toLocaleString()} XP to Level ${nextTier.level} (${nextTier.title})`
                    : 'Max National Mastery Achieved!'}
                </span>
              </div>

              <div className="w-full bg-slate-800/90 rounded-full h-3 p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-700 relative shadow-sm"
                  style={{ width: `${percent}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{currentTier.minXP} XP</span>
                <span>{percent}% Completed</span>
                <span>{nextTier ? `${nextTier.minXP} XP` : '∞'}</span>
              </div>
            </div>
          </div>

          {/* Right: Study Stat Badges & Rival Milestone */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            {/* Rival Alert / Target banner */}
            {rivalAhead && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 font-bold">
                  #{studentIndex}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    Next Target: {rivalAhead.name}
                  </p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    Only <strong className="text-white font-mono">{xpDifferenceAhead} XP</strong> behind! Finish today's scheduled slot to overtake!
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total XP</span>
                <span className="text-lg font-black text-amber-400 font-mono">{totalXP.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Streak</span>
                <span className="text-lg font-black text-orange-400 font-mono flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  {streakDays}d
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Topics Mastered</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{topicsMasteredCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions Solved</span>
                <span className="text-lg font-black text-sky-400 font-mono">{solvedProblemsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSubTab('standings')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'standings'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Batch Leaderboard</span>
          </button>

          <button
            onClick={() => setSubTab('quests')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'quests'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-sky-500" />
            <span>Earn XP (Study Quests)</span>
          </button>

          <button
            onClick={() => setSubTab('peer_connect')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'peer_connect'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Classroom & Peer Sharing</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-500" />
            <span>XP History ({xpHistory.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Faculty / Mentor Mode Button */}
          {onOpenFacultyPortal && (
            <button
              onClick={onOpenFacultyPortal}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Open Faculty & Mentor Portal to oversee batch, inspect students, and award commendation XP"
            >
              <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{facultySession?.isLoggedIn ? 'Faculty Portal' : 'Faculty / Mentor Portal'}</span>
            </button>
          )}

          {/* Share Scorecard button */}
          <button
            onClick={handleCopyCard}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            {hasCopiedCard ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scorecard Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share My XP Card</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BATCH LEADERBOARD STANDINGS */}
      {subTab === 'standings' && (
        <div className="space-y-6">
          {/* Podium for Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div
                className={`order-2 md:order-1 rounded-2xl p-5 border text-center transition-all ${
                  top2.isCurrentStudent
                    ? 'bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-950/40 dark:to-slate-900 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-2xl border-2 border-slate-300 dark:border-slate-600 mb-2">
                  🥈
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rank #2 · Silver
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {top2.name}
                  {top2.isCurrentStudent && (
                    <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full">
                      You
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {top2.batch}
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {standingsSort === 'weekly' ? `${top2.weeklyXP} XP / wk` : `${top2.totalXP.toLocaleString()} XP`}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <span>🔥 {top2.streakDays}d streak</span>
                  <span>·</span>
                  <span>📚 {top2.topicsMastered} mastered</span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top1 && (
              <div
                className={`order-1 md:order-2 rounded-3xl p-6 border-2 text-center transition-all md:-mt-3 shadow-lg ${
                  top1.isCurrentStudent
                    ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-400 dark:border-amber-500 ring-4 ring-amber-400/20'
                    : 'bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-850 dark:to-slate-900 border-amber-300 dark:border-amber-600/50'
                }`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white text-3xl shadow-md border-2 border-white mb-2">
                  👑
                </div>
                <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>🥇 Cohort Champion · Rank #1</span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                  {top1.name}
                  {top1.isCurrentStudent && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs bg-amber-600 text-white rounded-full font-bold">
                      You
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {top1.batch}
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {standingsSort === 'weekly' ? `${top1.weeklyXP} XP / wk` : `${top1.totalXP.toLocaleString()} XP`}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    {top1.streakDays}d Streak
                  </span>
                  <span>·</span>
                  <span>📚 {top1.topicsMastered} Chapters</span>
                  <span>·</span>
                  <span>🎯 {top1.questionsSolved} Qs</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div
                className={`order-3 rounded-2xl p-5 border text-center transition-all ${
                  top3.isCurrentStudent
                    ? 'bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-950/40 dark:to-slate-900 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-2xl border-2 border-amber-600/40 mb-2">
                  🥉
                </div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
                  Rank #3 · Bronze
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {top3.name}
                  {top3.isCurrentStudent && (
                    <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full">
                      You
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {top3.batch}
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {standingsSort === 'weekly' ? `${top3.weeklyXP} XP / wk` : `${top3.totalXP.toLocaleString()} XP`}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <span>🔥 {top3.streakDays}d streak</span>
                  <span>·</span>
                  <span>📚 {top3.topicsMastered} mastered</span>
                </div>
              </div>
            )}
          </div>

          {/* Standings Filter & Controls Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ranking Metric:
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setStandingsSort('total')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    standingsSort === 'total'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All-Time Total XP
                </button>
                <button
                  onClick={() => setStandingsSort('weekly')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    standingsSort === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  This Week's Pace
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Personal study notes & test diaries remain 100% private to each student.
              </span>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-14 text-center">Rank</th>
                    <th className="py-3 px-4">Student & Batch</th>
                    <th className="py-3 px-4">Tier & Badge</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-center">Chapters Done</th>
                    <th className="py-3 px-4 text-center">Solved Qs</th>
                    <th className="py-3 px-4 text-right">Weekly XP</th>
                    <th className="py-3 px-4 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cohortEntries.map((student, index) => {
                    const rank = index + 1;
                    const tier = getRankTier(student.totalXP);
                    const isYou = student.isCurrentStudent;

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          isYou
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold border-l-4 border-l-indigo-600 dark:border-l-indigo-400'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* Name & Batch */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                              style={{
                                backgroundColor: student.avatarColor || '#6366f1',
                              }}
                            >
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {student.name}
                                </span>
                                {isYou && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                {student.batch}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{tier.badge}</span>
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                                Lvl {tier.level}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {tier.title}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Streak */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-semibold font-mono text-[11px] border border-orange-200 dark:border-orange-800">
                            <Flame className="w-3 h-3" />
                            {student.streakDays}d
                          </span>
                        </td>

                        {/* Chapters Mastered */}
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                          {student.topicsMastered}
                        </td>

                        {/* Solved Problems */}
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                          {student.questionsSolved}
                        </td>

                        {/* Weekly XP */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                          +{student.weeklyXP}
                        </td>

                        {/* Total XP */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                            {student.totalXP.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDY QUESTS & WAYS TO EARN XP */}
      {subTab === 'quests' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/50 rounded-2xl p-5 border border-sky-200 dark:border-indigo-900/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              How to Earn XP & Climb the Leadership Board
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Every productive study action earns experience points (XP). Complete daily schedule slots, finish DPPs, clear milestones, and eradicate mistakes in your error diary!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quest 1: Study Slots */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-sky-400 dark:hover:border-sky-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    +{XP_REWARDS.SLOT_COMPLETED} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Complete a Study Slot
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mark any scheduled study slot as "Completed" in your daily timetable after finishing your session.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="mt-4 w-full py-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold text-xs hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Go to Daily Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quest 2: Daily Goals */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Target className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    +{XP_REWARDS.DAILY_GOAL} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Check off a Daily Goal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Check off daily homework, question sets, or formula revisions in your Goals checklist.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="mt-4 w-full py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-xs hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Goals Checklist</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quest 3: Weekly Milestone */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    +{XP_REWARDS.WEEKLY_MILESTONE} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Complete Weekly Milestone
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hit your 50/50 problem target or finish full weekly target chapters before the deadline.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="mt-4 w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Milestones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quest 4: Syllabus Mastered */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    Up to +{XP_REWARDS.SYLLABUS_MASTERED} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Master a Syllabus Chapter
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Progress chapters from Theory (+50 XP), DPP Level 1 (+40 XP), to PYQs (+80 XP) and Mastered (+100 XP).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="mt-4 w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Syllabus Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quest 5: Error Log Revision */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    +{XP_REWARDS.ERROR_LOG_MASTERED} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Master a Mock Test Error
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Re-attempt and mark an analyzed mistake from your test diary as "Mastered / Concept Clear".
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('error_log')}
                className="mt-4 w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Error Diary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quest 6: Pomodoro Focus Session */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                    +{XP_REWARDS.FOCUS_TIMER_SESSION} XP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Complete Focus Timer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete a 25-minute undistracted Pomodoro deep study block with ambient chimes.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="mt-4 w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Start Focus Timer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* All Ranks and Tiers Reference */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Medal className="w-4 h-4 text-amber-500" />
              JEE 2028 Aspirant Rank Tiers & Badges
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RANK_TIERS.map((tier) => {
                const isCurrent = currentTier.level === tier.level;
                const isUnlocked = totalXP >= tier.minXP;

                return (
                  <div
                    key={tier.level}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                        : isUnlocked
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-50/40 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{tier.badge}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {tier.minXP.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="mt-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        Lvl {tier.level}: {tier.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {tier.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PEER CONNECT & CLASSROOM SHARING (TEACHER TOOLS) */}
      {subTab === 'peer_connect' && (
        <div className="space-y-6">
          {/* Privacy Banner */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">
                Data Privacy & Independent Student Vault Guarantee
              </h4>
              <p className="mt-1 leading-relaxed">
                When students share their scorecard code or compare ranks, <strong>no private study notes, journal entries, or mistake diaries are ever uploaded or transmitted</strong>. Only high-level public milestones (Name, Batch, Level, and XP) are encoded in the share snippet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Share Your XP Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Share Your Scorecard with Batch / Teacher
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Send your current XP scorecard to your coaching WhatsApp group or teacher to benchmark against your classmates.
              </p>

              {/* Preview Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">
                  🏆 {currentProfile.name} · Level {currentTier.level} ({currentTier.title}) {currentTier.badge}
                </p>
                <p>Batch: {currentProfile.batch || 'Class 11 - JEE 2028'}</p>
                <p>Total XP: {totalXP.toLocaleString()} XP · Rank #{currentStudentRank}</p>
                <p>Streak: {streakDays} Days 🔥 | Mastered: {topicsMasteredCount} Chapters</p>
              </div>

              <button
                onClick={handleCopyCard}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {hasCopiedCard ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Scorecard Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy My Scorecard & Share Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Import Classmate / Peer XP Code */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Classmate / Peer to Leaderboard
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Paste a code shared by your friend or classmate (starts with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">XP-...</code>) to add them to your local cohort leaderboard.
              </p>

              <form onSubmit={handleImportPeer} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paste Classmate's XP Code:
                  </label>
                  <input
                    type="text"
                    value={peerInputCode}
                    onChange={(e) => setPeerInputCode(e.target.value)}
                    placeholder="e.g. XP-eyJ2ZXIiOjEsIm4iOiJBcnlhbiIsInhwIjoyNTQwfQ=="
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {peerImportStatus && (
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {peerImportStatus}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Import Peer into Leaderboard</span>
                </button>
              </form>
            </div>
          </div>

          {/* Teacher Tool: Custom Study Bonus / Award XP */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Teacher / Mentor Special Achievement Bonus
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                Classroom Engagement Tool
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Teachers and mentors can reward students with bonus XP for classroom quiz wins, disciplined homework submission, or solving difficult challenge problems.
            </p>

            <form onSubmit={handleAwardCustomBonus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Achievement / Reason:
                </label>
                <input
                  type="text"
                  value={customBonusReason}
                  onChange={(e) => setCustomBonusReason(e.target.value)}
                  placeholder="e.g. Scored 85%+ in Coaching Mock Test 2"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bonus Points (XP):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={customBonusPoints}
                    onChange={(e) => setCustomBonusPoints(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                  >
                    Award!
                  </button>
                </div>
              </div>
            </form>

            {isBonusAwarded && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-bounce-in">
                <Sparkles className="w-4 h-4" />
                Successfully awarded +{customBonusPoints} XP to {currentProfile.name}! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: XP AUDIT / RECENT ACTIVITY HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              XP Activity Audit Log
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Total Points: <strong className="text-amber-500">{totalXP.toLocaleString()} XP</strong>
            </span>
          </div>

          {xpHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No XP Activities Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Mark your study slots as completed, solve daily goals, or master syllabus topics to start logging XP!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {xpHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.action}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="capitalize">{item.category}</span>
                        {item.subject && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {item.subject}
                            </span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 shrink-0 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                    +{item.points} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
