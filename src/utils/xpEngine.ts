import { LeaderboardEntry, StudentRankTier, XPActivity } from '../types';

export const XP_REWARDS = {
  SLOT_COMPLETED: 50,
  DAILY_GOAL: 35,
  WEEKLY_MILESTONE: 120,
  SYLLABUS_THEORY: 50,
  SYLLABUS_DPP: 40,
  SYLLABUS_PYQ: 80,
  SYLLABUS_MASTERED: 100,
  ERROR_LOG_MASTERED: 45,
  ERROR_LOG_CREATED: 20,
  FOCUS_TIMER_SESSION: 25,
  JOURNAL_ENTRY: 30,
  DAILY_STREAK: 25,
  STREAK_7_DAY_BONUS: 150,
} as const;

export const RANK_TIERS: StudentRankTier[] = [
  {
    level: 1,
    title: 'Foundation Aspirant',
    minXP: 0,
    maxXP: 299,
    badge: '🌱',
    color: 'from-emerald-500 to-teal-600',
    description: 'Starting the Grade 11 journey with curiosity, baseline study habits, and commitment.',
  },
  {
    level: 2,
    title: 'Concept Builder',
    minXP: 300,
    maxXP: 749,
    badge: '⚡',
    color: 'from-sky-500 to-blue-600',
    description: 'Mastering core formulas and NCERT line-by-line across Physics, Chemistry, and Math.',
  },
  {
    level: 3,
    title: 'Consistent Striver',
    minXP: 750,
    maxXP: 1499,
    badge: '🔥',
    color: 'from-amber-500 to-orange-600',
    description: 'Establishing unstoppable daily schedule rhythm, solving regular DPPs, and logging errors.',
  },
  {
    level: 4,
    title: 'Problem Solver Elite',
    minXP: 1500,
    maxXP: 2499,
    badge: '🎯',
    color: 'from-indigo-500 to-purple-600',
    description: 'Tackling multi-concept problems, JEE Main PYQs, and high-difficulty questions with confidence.',
  },
  {
    level: 5,
    title: 'Mock Gladiator',
    minXP: 2500,
    maxXP: 3999,
    badge: '⚔️',
    color: 'from-rose-500 to-pink-600',
    description: 'Timed full-syllabus mock tests, rigorous mistake diary analysis, and zero-panic test demeanor.',
  },
  {
    level: 6,
    title: 'Speed & Accuracy Pro',
    minXP: 4000,
    maxXP: 5999,
    badge: '🚀',
    color: 'from-cyan-500 to-blue-700',
    description: 'Exceptional problem turnaround speed, minimal calculation errors, and deep conceptual agility.',
  },
  {
    level: 7,
    title: 'Top 500 Contender',
    minXP: 6000,
    maxXP: 8999,
    badge: '🏆',
    color: 'from-amber-400 to-yellow-600',
    description: 'Top-tier cohort mastery, consistently outperforming weekly targets with elite stamina.',
  },
  {
    level: 8,
    title: 'AIR Top 100 Legend',
    minXP: 9000,
    maxXP: Infinity,
    badge: '👑',
    color: 'from-purple-600 via-pink-600 to-amber-500',
    description: 'Peak national competitive readiness for JEE Main & JEE Advanced 2028.',
  },
];

export function getRankTier(xp: number): StudentRankTier {
  const safeXP = Math.max(0, xp);
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (safeXP >= RANK_TIERS[i].minXP) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

export function getLevelProgress(xp: number) {
  const currentTier = getRankTier(xp);
  const nextTier = RANK_TIERS.find((t) => t.level === currentTier.level + 1);

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      percent: 100,
      xpInCurrentLevel: xp - currentTier.minXP,
      xpNeededForNext: 0,
      isMaxLevel: true,
    };
  }

  const range = nextTier.minXP - currentTier.minXP;
  const earnedInRange = Math.max(0, xp - currentTier.minXP);
  const percent = Math.min(100, Math.round((earnedInRange / range) * 100));
  const xpNeededForNext = Math.max(0, nextTier.minXP - xp);

  return {
    currentTier,
    nextTier,
    percent,
    xpInCurrentLevel: earnedInRange,
    xpNeededForNext,
    isMaxLevel: false,
  };
}

export const BASE_CLASSMATE_COHORT: LeaderboardEntry[] = [
  {
    id: 'peer-ananya',
    name: 'Ananya Verma',
    batch: 'Class 11 - JEE 2028 (Star Batch)',
    avatarColor: '#ec4899',
    totalXP: 2920,
    weeklyXP: 680,
    streakDays: 28,
    topicsMastered: 14,
    questionsSolved: 420,
    studyHours: 48,
    rankBadge: '👑 AIR #1 Pace',
    customBio: 'Focused on Mechanics & Physical Chem DPPs',
  },
  {
    id: 'peer-aryan',
    name: 'Aryan Sharma',
    batch: 'Class 11 - JEE 2028 (Alpha Batch)',
    avatarColor: '#3b82f6',
    totalXP: 2540,
    weeklyXP: 590,
    streakDays: 21,
    topicsMastered: 12,
    questionsSolved: 380,
    studyHours: 42,
    rankBadge: '⚡ Consistency Leader',
    customBio: 'HC Verma problem solver & early riser',
  },
  {
    id: 'peer-sneha',
    name: 'Sneha Reddy',
    batch: 'Class 11 - JEE 2028 (Star Batch)',
    avatarColor: '#10b981',
    totalXP: 2210,
    weeklyXP: 510,
    streakDays: 18,
    topicsMastered: 11,
    questionsSolved: 340,
    studyHours: 39,
    rankBadge: '🎯 Math Prodigy',
    customBio: 'Conic sections & Coordinate geometry grind',
  },
  {
    id: 'peer-dev',
    name: 'Dev Patel',
    batch: 'Class 11 - JEE 2028 (Beta Batch)',
    avatarColor: '#8b5cf6',
    totalXP: 1880,
    weeklyXP: 440,
    streakDays: 15,
    topicsMastered: 9,
    questionsSolved: 290,
    studyHours: 34,
    rankBadge: '🔥 Daily Grinder',
    customBio: 'Targeting 50 numericals every evening',
  },
  {
    id: 'peer-rohan',
    name: 'Rohan Mehta',
    batch: 'Class 11 - JEE 2028 (Alpha Batch)',
    avatarColor: '#f59e0b',
    totalXP: 1640,
    weeklyXP: 390,
    streakDays: 14,
    topicsMastered: 8,
    questionsSolved: 250,
    studyHours: 31,
    rankBadge: '📚 Concept Master',
    customBio: 'Zero backlog target for Physics & Chem',
  },
  {
    id: 'peer-priya',
    name: 'Priya Kulkarni',
    batch: 'Class 11 - JEE 2028 (Alpha Batch)',
    avatarColor: '#06b6d4',
    totalXP: 1460,
    weeklyXP: 360,
    streakDays: 12,
    topicsMastered: 7,
    questionsSolved: 220,
    studyHours: 28,
    rankBadge: '🧪 Organic Chem Pro',
    customBio: 'Mastering reaction mechanisms & NCERT',
  },
  {
    id: 'peer-kabir',
    name: 'Kabir Singh',
    batch: 'Class 11 - JEE 2028 (Beta Batch)',
    avatarColor: '#6366f1',
    totalXP: 1180,
    weeklyXP: 290,
    streakDays: 9,
    topicsMastered: 6,
    questionsSolved: 190,
    studyHours: 24,
    rankBadge: '🌙 Late Night Warrior',
    customBio: 'Deep work focus after 9 PM',
  },
  {
    id: 'peer-meera',
    name: 'Meera Joshi',
    batch: 'Class 11 - JEE 2028 (Alpha Batch)',
    avatarColor: '#14b8a6',
    totalXP: 960,
    weeklyXP: 240,
    streakDays: 7,
    topicsMastered: 5,
    questionsSolved: 160,
    studyHours: 21,
    rankBadge: '🌱 Rising Star',
    customBio: 'Building steady daily discipline',
  },
  {
    id: 'peer-tanmay',
    name: 'Tanmay Das',
    batch: 'Class 11 - JEE 2028 (Beta Batch)',
    avatarColor: '#ef4444',
    totalXP: 720,
    weeklyXP: 190,
    streakDays: 5,
    topicsMastered: 4,
    questionsSolved: 120,
    studyHours: 18,
    rankBadge: '⚡ Stepping Up',
    customBio: 'Focused on overcoming silly calculation errors',
  },
  {
    id: 'peer-riya',
    name: 'Riya Sen',
    batch: 'Class 11 - JEE 2028 (Beta Batch)',
    avatarColor: '#84cc16',
    totalXP: 480,
    weeklyXP: 140,
    streakDays: 4,
    topicsMastered: 3,
    questionsSolved: 90,
    studyHours: 14,
    rankBadge: '🌱 Foundation Builder',
    customBio: 'Just started Grade 11 planner journey',
  },
];

export function buildCohortLeaderboard(
  currentStudent: {
    id: string;
    name: string;
    batch: string;
    totalXP: number;
    streakDays: number;
    topicsMastered: number;
    questionsSolved: number;
    studyHours: number;
  },
  importedPeers: LeaderboardEntry[] = [],
  sortBy: 'total' | 'weekly' = 'total'
): { entries: LeaderboardEntry[]; currentStudentRank: number } {
  // Approximate weekly XP based on total XP or recent pace
  const currentWeeklyXP = Math.min(
    currentStudent.totalXP,
    Math.round(currentStudent.totalXP * 0.28) + currentStudent.streakDays * 15
  );

  const currentEntry: LeaderboardEntry = {
    id: currentStudent.id,
    name: currentStudent.name,
    batch: currentStudent.batch || 'Class 11 - JEE 2028',
    avatarColor: '#6366f1',
    totalXP: currentStudent.totalXP,
    weeklyXP: currentWeeklyXP,
    streakDays: currentStudent.streakDays,
    topicsMastered: currentStudent.topicsMastered,
    questionsSolved: currentStudent.questionsSolved,
    studyHours: currentStudent.studyHours,
    isCurrentStudent: true,
    rankBadge: '⭐ Active Student (You)',
  };

  // Combine peers, removing any duplicates by ID
  const peerMap = new Map<string, LeaderboardEntry>();
  BASE_CLASSMATE_COHORT.forEach((p) => peerMap.set(p.id, p));
  importedPeers.forEach((p) => peerMap.set(p.id, p));

  const allEntries: LeaderboardEntry[] = [currentEntry, ...Array.from(peerMap.values())];

  // Sort by selected metric
  allEntries.sort((a, b) => {
    if (sortBy === 'weekly') {
      return b.weeklyXP - a.weeklyXP;
    }
    return b.totalXP - a.totalXP;
  });

  const currentRank = allEntries.findIndex((e) => e.isCurrentStudent) + 1;

  return {
    entries: allEntries,
    currentStudentRank: currentRank > 0 ? currentRank : allEntries.length,
  };
}

export function exportStudentXPCode(entry: {
  name: string;
  batch: string;
  totalXP: number;
  streakDays: number;
  topicsMastered: number;
  questionsSolved: number;
  studyHours: number;
}): string {
  const payload = {
    ver: 1,
    n: entry.name,
    b: entry.batch,
    xp: entry.totalXP,
    s: entry.streakDays,
    tm: entry.topicsMastered,
    qs: entry.questionsSolved,
    h: entry.studyHours,
    t: Date.now(),
  };

  try {
    return 'XP-' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return 'XP-' + btoa(JSON.stringify(payload));
  }
}

export function parseStudentXPCode(code: string): LeaderboardEntry | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith('XP-')) return null;

  try {
    const raw = trimmed.replace(/^XP-/, '');
    const jsonStr = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(jsonStr);

    if (parsed && typeof parsed.xp === 'number' && parsed.n) {
      return {
        id: `peer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: String(parsed.n),
        batch: String(parsed.b || 'Class 11'),
        totalXP: Number(parsed.xp),
        weeklyXP: Math.round(Number(parsed.xp) * 0.25),
        streakDays: Number(parsed.s || 1),
        topicsMastered: Number(parsed.tm || 0),
        questionsSolved: Number(parsed.qs || 0),
        studyHours: Number(parsed.h || 0),
        rankBadge: '🤝 Imported Classmate',
      };
    }
  } catch {
    return null;
  }
  return null;
}
