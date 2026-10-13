/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  DayOfWeek,
  DaySchedule,
  DailyGoalItem,
  WeeklyMilestone,
  SyllabusChapter,
  StudyReminder,
  StudySlot,
  DailyJournalEntry,
  ErrorLogItem,
  StudentProfile,
  StudentFullBackup,
  XPActivity,
  XPCategory,
  SubjectType,
  FacultySession,
  LeaderboardEntry,
  SuperAdminSession,
  AuditLogEntry,
  FacultyMemberRecord,
  InstitutionalAnnouncement,
  ChapterRevisionRecord,
  FacultyScheduleComment,
} from './types';
import {
  getDefaultWeekSchedules,
  DEFAULT_WEEKLY_MILESTONES,
  GRADE_11_SYLLABUS,
  DEFAULT_REMINDERS,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_ERROR_LOGS,
} from './data/defaultSchedule';
import {
  DEFAULT_SUPER_ADMIN_SESSION,
  DEFAULT_FACULTY_DIRECTORY,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_ANNOUNCEMENTS,
} from './data/superAdminDefaults';
import { DEFAULT_REVISION_RECORDS } from './data/defaultRevisionHistory';
import { DEFAULT_FACULTY_COMMENTS } from './data/defaultFacultyComments';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { GoalsView } from './components/GoalsView';
import { ErrorLogView } from './components/ErrorLogView';
import { RemindersView } from './components/RemindersView';
import { AnalyticsView } from './components/AnalyticsView';
import { LeaderboardView } from './components/LeaderboardView';
import { XPToast, XPToastEvent } from './components/XPToast';
import { ReminderAlertBanner } from './components/ReminderAlertBanner';
import { FocusTimer } from './components/FocusTimer';
import { StudentPrivacyModal } from './components/StudentPrivacyModal';
import { FacultyPortalModal } from './components/FacultyPortalModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import { RevisionHistoryModal } from './components/RevisionHistoryModal';
import { playChimeTone } from './utils/audio';
import { sendBrowserNotification } from './utils/notifications';
import { parseTimeToMinutes } from './utils/timeHelpers';
import { getRankTier, XP_REWARDS, buildCohortLeaderboard } from './utils/xpEngine';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEYS = {
  SCHEDULES: 'jee2028_day_schedules_v1',
  DAILY_GOALS: 'jee2028_daily_goals_v1',
  WEEKLY_MILESTONES: 'jee2028_weekly_milestones_v1',
  SYLLABUS: 'jee2028_syllabus_v1',
  REMINDERS: 'jee2028_reminders_v1',
  AUTO_SLOT_REMINDERS: 'jee2028_auto_slot_reminders_v1',
  STREAK: 'jee2028_streak_v1',
  JOURNAL: 'jee2028_journal_v1',
  ERROR_LOGS: 'jee2028_error_logs_v1',
  THEME: 'jee2028_theme_v1',
  PROFILES: 'jee2028_student_profiles_v1',
  ACTIVE_PROFILE: 'jee2028_active_profile_id_v1',
  XP: 'jee2028_xp_v1',
  XP_HISTORY: 'jee2028_xp_history_v1',
  FACULTY_SESSION: 'jee2028_faculty_session_v1',
  IMPORTED_PEERS: 'jee2028_imported_peers_v1',
  SUPER_ADMIN_SESSION: 'jee2028_super_admin_session_v1',
  AUDIT_LOGS: 'jee2028_audit_logs_v1',
  FACULTY_DIRECTORY: 'jee2028_faculty_directory_v1',
  ANNOUNCEMENTS: 'jee2028_announcements_v1',
  REVISION_RECORDS: 'jee2028_revision_records_v1',
  FACULTY_COMMENTS: 'jee2028_faculty_comments_v1',
};

const getProfileStorageKey = (profileId: string, baseKey: string) => {
  return `jee2028_p_${profileId}_${baseKey}`;
};

const DEFAULT_PROFILE: StudentProfile = {
  id: 'default',
  name: 'Student 1',
  batch: 'Meccademia Education Institute - Class 11 JEE 2028',
  avatarColor: 'Sky Blue',
  createdAt: new Date().toISOString(),
};

const DEFAULT_DAILY_GOALS: DailyGoalItem[] = [
  {
    id: 'dg-1',
    text: 'HC Verma: Motion in a Straight Line 25 Numericals',
    subject: 'Physics',
    completed: true,
  },
  {
    id: 'dg-2',
    text: 'Chemical Bonding: Molecular Orbital Theory NCERT Line-by-Line',
    subject: 'Chemistry',
    completed: false,
  },
  {
    id: 'dg-3',
    text: 'Mathematics: 20 Advanced Problems on Complex Numbers & Roots',
    subject: 'Mathematics',
    completed: false,
  },
  {
    id: 'dg-4',
    text: 'Revise Formulas Sheet & Update Mistake Diary for 30 mins',
    subject: 'Revision',
    completed: false,
  },
];

function loadStoredData<T>(profileId: string, baseKey: string, legacyKey: string, fallback: T): T {
  try {
    const profileKey = getProfileStorageKey(profileId, baseKey);
    const pVal = localStorage.getItem(profileKey);
    if (pVal !== null) {
      return JSON.parse(pVal);
    }
    if (profileId === 'default') {
      const lVal = localStorage.getItem(legacyKey);
      if (lVal !== null) {
        return JSON.parse(lVal);
      }
    }
  } catch {
    // fallback
  }
  return fallback;
}

export default function App() {
  // Current real-world day of week
  const todayDayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  }) as DayOfWeek;

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved === 'dark';
      return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Student Profiles State
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [DEFAULT_PROFILE];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return 'default';
  });

  // Modal for Student Privacy & Independent Storage Hub
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  // Modal for Faculty & Mentor Portal
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);

  // Faculty Session State
  const [facultySession, setFacultySession] = useState<FacultySession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACULTY_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      isLoggedIn: false,
      facultyName: 'Prof. R. K. Sharma (Meccademia Education Institute)',
      designation: 'Senior Mentor',
      subject: 'Physics',
      center: 'Meccademia Education Institute - Dubai Knowledge Park',
      lastActive: new Date().toISOString(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FACULTY_SESSION, JSON.stringify(facultySession));
    } catch {
      // ignore
    }
  }, [facultySession]);

  // Peer/Cohort roster state (accessible by faculty and peer connect)
  const [importedCohortPeers, setImportedCohortPeers] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IMPORTED_PEERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const handleAddStudentToCohort = (newStudent: LeaderboardEntry) => {
    const updated = [newStudent, ...importedCohortPeers.filter((p) => p.name !== newStudent.name)];
    setImportedCohortPeers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.IMPORTED_PEERS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Super Admin state & modals
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminSession, setSuperAdminSession] = useState<SuperAdminSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SUPER_ADMIN_SESSION;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_SESSION, JSON.stringify(superAdminSession));
    } catch {
      // ignore
    }
  }, [superAdminSession]);

  // Central Institutional Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_AUDIT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  const handleAddAuditLog = (newLog: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const fullLog: AuditLogEntry = {
      ...newLog,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [fullLog, ...prev]);
  };

  // Faculty Directory Oversight
  const [facultyDirectory, setFacultyDirectory] = useState<FacultyMemberRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACULTY_DIRECTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_FACULTY_DIRECTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FACULTY_DIRECTORY, JSON.stringify(facultyDirectory));
    } catch {
      // ignore
    }
  }, [facultyDirectory]);

  const handleAddFaculty = (newFaculty: FacultyMemberRecord) => {
    setFacultyDirectory((prev) => [newFaculty, ...prev]);
  };

  // Institutional Announcements Broadcast Engine
  const [announcements, setAnnouncements] = useState<InstitutionalAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {
      // ignore
    }
  }, [announcements]);

  const handleAddAnnouncement = (ann: Omit<InstitutionalAnnouncement, 'id' | 'date'>) => {
    const fullAnn: InstitutionalAnnouncement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setAnnouncements((prev) => [fullAnn, ...prev]);
  };

  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILE;

  const [activeTab, setActiveTab] = useState<
    'schedule' | 'goals' | 'error_log' | 'reminders' | 'analytics' | 'leaderboard'
  >('schedule');
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(todayDayName || 'Monday');

  // Gamification & Leadership Board state (Isolated per student profile)
  const [studentXP, setStudentXP] = useState<number>(() => {
    return Number(
      loadStoredData(activeProfileId, 'xp', STORAGE_KEYS.XP, 1520)
    );
  });

  const [xpHistory, setXpHistory] = useState<XPActivity[]>(() => {
    const defaultHistory: XPActivity[] = [
      {
        id: 'xp-init-1',
        action: 'HC Verma Motion in a Straight Line 25 Numericals',
        points: 50,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        category: 'slot',
        subject: 'Physics',
      },
      {
        id: 'xp-init-2',
        action: 'Daily Goal: Chemical Bonding Line-by-Line',
        points: 35,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        category: 'goal',
        subject: 'Chemistry',
      },
      {
        id: 'xp-init-3',
        action: 'Mastered Mock Error: Trigonometric Identity Trap',
        points: 45,
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        category: 'error_log',
        subject: 'Mathematics',
      },
      {
        id: 'xp-init-4',
        action: '14-Day Study Streak Consistency Bonus',
        points: 150,
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        category: 'streak',
      },
    ];
    return loadStoredData(
      activeProfileId,
      'xp_history',
      STORAGE_KEYS.XP_HISTORY,
      defaultHistory
    );
  });

  const [xpToast, setXpToast] = useState<XPToastEvent | null>(null);

  // Schedules state with profile-isolated localStorage persistence
  const [daySchedules, setDaySchedules] = useState<Record<DayOfWeek, DaySchedule>>(() => {
    return loadStoredData(
      activeProfileId,
      'schedules',
      STORAGE_KEYS.SCHEDULES,
      getDefaultWeekSchedules()
    );
  });

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState<DailyGoalItem[]>(() => {
    return loadStoredData(
      activeProfileId,
      'daily_goals',
      STORAGE_KEYS.DAILY_GOALS,
      DEFAULT_DAILY_GOALS
    );
  });

  // Weekly Milestones state
  const [weeklyMilestones, setWeeklyMilestones] = useState<WeeklyMilestone[]>(() => {
    return loadStoredData(
      activeProfileId,
      'weekly_milestones',
      STORAGE_KEYS.WEEKLY_MILESTONES,
      DEFAULT_WEEKLY_MILESTONES
    );
  });

  // Grade 11 Syllabus state
  const [syllabusChapters, setSyllabusChapters] = useState<SyllabusChapter[]>(() => {
    return loadStoredData(
      activeProfileId,
      'syllabus',
      STORAGE_KEYS.SYLLABUS,
      GRADE_11_SYLLABUS
    );
  });

  // Reminders state
  const [reminders, setReminders] = useState<StudyReminder[]>(() => {
    return loadStoredData(
      activeProfileId,
      'reminders',
      STORAGE_KEYS.REMINDERS,
      DEFAULT_REMINDERS
    );
  });

  const [autoSlotRemindersEnabled, setAutoSlotRemindersEnabled] = useState<boolean>(() => {
    return loadStoredData(
      activeProfileId,
      'auto_slot',
      STORAGE_KEYS.AUTO_SLOT_REMINDERS,
      true
    );
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    return Number(
      loadStoredData(activeProfileId, 'streak', STORAGE_KEYS.STREAK, 14)
    );
  });

  // Daily Journal state
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(() => {
    return loadStoredData(
      activeProfileId,
      'journal',
      STORAGE_KEYS.JOURNAL,
      DEFAULT_JOURNAL_ENTRIES
    );
  });

  // Error Log / Mistake Diary state
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(() => {
    return loadStoredData(
      activeProfileId,
      'error_logs',
      STORAGE_KEYS.ERROR_LOGS,
      DEFAULT_ERROR_LOGS
    );
  });

  // Chapter & Revision History state (Past week & month retro)
  const [revisionRecords, setRevisionRecords] = useState<ChapterRevisionRecord[]>(() => {
    return loadStoredData(
      activeProfileId,
      'revision_records',
      STORAGE_KEYS.REVISION_RECORDS,
      DEFAULT_REVISION_RECORDS
    );
  });
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // Faculty Schedule Comments & Directives state
  const [facultyComments, setFacultyComments] = useState<FacultyScheduleComment[]>(() => {
    return loadStoredData(
      activeProfileId,
      'faculty_comments',
      STORAGE_KEYS.FACULTY_COMMENTS,
      DEFAULT_FACULTY_COMMENTS
    );
  });

  // Active Alert banner state
  const [activeAlert, setActiveAlert] = useState<{
    type: 'custom_reminder' | 'slot_starting';
    reminder?: StudyReminder;
    slot?: StudySlot;
    message: string;
  } | null>(null);

  // Focus timer from alert or other view
  const [activeFocusSlot, setActiveFocusSlot] = useState<StudySlot | null>(null);

  // Last triggered minute to avoid duplicate triggers within the same minute
  const lastTriggeredMinuteRef = useRef<string>('');

  // Persist Profiles list and Active Profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, activeProfileId);
    } catch {
      // ignore
    }
  }, [activeProfileId]);

  // Save state to profile-isolated key (and legacy key for default profile)
  useEffect(() => {
    try {
      const json = JSON.stringify(daySchedules);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'schedules'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, json);
      }
    } catch {
      // ignore
    }
  }, [daySchedules, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(dailyGoals);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'daily_goals'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.DAILY_GOALS, json);
      }
    } catch {
      // ignore
    }
  }, [dailyGoals, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(weeklyMilestones);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'weekly_milestones'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.WEEKLY_MILESTONES, json);
      }
    } catch {
      // ignore
    }
  }, [weeklyMilestones, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(syllabusChapters);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'syllabus'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.SYLLABUS, json);
      }
    } catch {
      // ignore
    }
  }, [syllabusChapters, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(reminders);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'reminders'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.REMINDERS, json);
      }
    } catch {
      // ignore
    }
  }, [reminders, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(autoSlotRemindersEnabled);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'auto_slot'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.AUTO_SLOT_REMINDERS, json);
      }
    } catch {
      // ignore
    }
  }, [autoSlotRemindersEnabled, activeProfileId]);

  useEffect(() => {
    try {
      const str = String(streakDays);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'streak'), str);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.STREAK, str);
      }
    } catch {
      // ignore
    }
  }, [streakDays, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(journalEntries);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'journal'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.JOURNAL, json);
      }
    } catch {
      // ignore
    }
  }, [journalEntries, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(errorLogs);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'error_logs'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.ERROR_LOGS, json);
      }
    } catch {
      // ignore
    }
  }, [errorLogs, activeProfileId]);

  // Persist student XP and history
  useEffect(() => {
    try {
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'xp'), String(studentXP));
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.XP, String(studentXP));
      }
    } catch {
      // ignore
    }
  }, [studentXP, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(xpHistory);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'xp_history'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.XP_HISTORY, json);
      }
    } catch {
      // ignore
    }
  }, [xpHistory, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(revisionRecords);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'revision_records'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.REVISION_RECORDS, json);
      }
    } catch {
      // ignore
    }
  }, [revisionRecords, activeProfileId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(facultyComments);
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'faculty_comments'), json);
      if (activeProfileId === 'default') {
        localStorage.setItem(STORAGE_KEYS.FACULTY_COMMENTS, json);
      }
    } catch {
      // ignore
    }
  }, [facultyComments, activeProfileId]);

  // Handler to add a new chapter revision record
  const handleAddRevisionRecord = (record: Omit<ChapterRevisionRecord, 'id'>) => {
    const newRecord: ChapterRevisionRecord = {
      ...record,
      id: `rev-${Date.now()}`,
    };
    setRevisionRecords((prev) => [newRecord, ...prev]);

    // Also record into Super Admin Institutional Audit Trail
    handleAddAuditLog({
      actorRole: 'student',
      actorName: activeProfile.name,
      actionType: 'CHAPTER_REVISED',
      details: `Logged Revision: "${record.chapterName}" (${record.revisionType}, ${record.durationMinutes}m)`,
      batch: activeProfile.batch,
      severity: 'success',
    });
  };

  const handleDeleteRevisionRecord = (id: string) => {
    setRevisionRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler for faculty to post guidance / lag alert / encouragement
  const handleAddFacultyComment = (
    comment: Omit<FacultyScheduleComment, 'id' | 'createdAt' | 'isAcknowledged'>
  ) => {
    const newComment: FacultyScheduleComment = {
      ...comment,
      id: `fcom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isAcknowledged: false,
    };
    setFacultyComments((prev) => [newComment, ...prev]);

    // Also record into Super Admin Institutional Audit Trail
    handleAddAuditLog({
      actorRole: 'faculty',
      actorName: comment.facultyName,
      actionType: 'FACULTY_SCHEDULE_DIRECTIVE',
      details: `Posted directive to ${comment.studentName}: "${comment.title}" (Tone: ${comment.commentTone})`,
      batch: activeProfile.batch,
      severity: comment.commentTone === 'lagging_alert' ? 'warning' : 'info',
    });
  };

  const handleDeleteFacultyComment = (commentId: string) => {
    setFacultyComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleAcknowledgeFacultyComment = (commentId: string) => {
    setFacultyComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isAcknowledged: true,
              acknowledgedAt: new Date().toISOString(),
            }
          : c
      )
    );

    handleAwardXP(15, 'Acknowledged Mentor Schedule Directive', 'bonus');
  };

  const handleReplyToFacultyComment = (commentId: string, replyText: string) => {
    setFacultyComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              studentReply: replyText,
              studentRepliedAt: new Date().toISOString(),
              isAcknowledged: true,
            }
          : c
      )
    );

    handleAwardXP(20, 'Sent Status Update to Mentor', 'bonus');

    handleAddAuditLog({
      actorRole: 'student',
      actorName: activeProfile.name,
      actionType: 'STUDENT_MENTOR_REPLY',
      details: `Replied to faculty directive: "${replyText.slice(0, 80)}"`,
      batch: activeProfile.batch,
      severity: 'info',
    });
  };

  // Gamification: Award XP with sound, notification toast, and level up check
  const handleAwardXP = (
    points: number,
    actionTitle: string,
    category: XPCategory,
    subject?: SubjectType
  ) => {
    playChimeTone();
    setStudentXP((prev) => {
      const oldTier = getRankTier(prev);
      const newXP = prev + points;
      const newTier = getRankTier(newXP);
      const isLevelUp = newTier.level > oldTier.level;

      setXpToast({
        id: `toast-${Date.now()}`,
        points,
        actionTitle,
        totalXP: newXP,
        tier: newTier,
        isLevelUp,
      });

      return newXP;
    });

    const newActivity: XPActivity = {
      id: `act-${Date.now()}`,
      action: actionTitle,
      points,
      timestamp: new Date().toISOString(),
      category,
      subject,
    };

    setXpHistory((prev) => [newActivity, ...prev.slice(0, 49)]);

    // Also record event in Super Admin Institutional Audit Trail
    handleAddAuditLog({
      actorRole: category === 'bonus' ? 'faculty' : 'student',
      actorName:
        category === 'bonus'
          ? facultySession.isLoggedIn
            ? facultySession.facultyName
            : 'Faculty Mentor'
          : activeProfile.name,
      actionType: category === 'bonus' ? 'FACULTY_BONUS_AWARD' : 'STUDENT_ACTIVITY_XP',
      details: `${
        category === 'bonus' ? 'Faculty awarded' : 'Completed'
      }: "${actionTitle}" (+${points} XP)`,
      batch: activeProfile.batch,
      severity: points >= 80 ? 'success' : 'info',
    });
  };

  // Periodic Reminder & Upcoming Slot Checker (every 10 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeKey = `${now.toDateString()} ${currentH}:${currentM}`;

      if (lastTriggeredMinuteRef.current === currentTimeKey) {
        return; // already handled this minute
      }

      const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

      // 1. Check custom reminders
      const matchingReminder = reminders.find(
        (r) => r.enabled && r.time === `${currentH}:${currentM}`
      );

      if (matchingReminder) {
        lastTriggeredMinuteRef.current = currentTimeKey;
        playChimeTone();
        sendBrowserNotification(
          `JEE Study Reminder: ${matchingReminder.title}`,
          `Scheduled alert at ${matchingReminder.time} (${matchingReminder.category})`
        );
        setActiveAlert({
          type: 'custom_reminder',
          reminder: matchingReminder,
          message: matchingReminder.title,
        });
        return;
      }

      // 2. Check today's scheduled slots (if 5 minutes prior to start)
      if (autoSlotRemindersEnabled) {
        const todaySchedule = daySchedules[todayDayName];
        if (todaySchedule && todaySchedule.slots) {
          const upcomingSlot = todaySchedule.slots.find((slot) => {
            if (slot.status === 'completed' || slot.status === 'skipped') return false;
            const slotStartMin = parseTimeToMinutes(slot.startTime);
            const diff = slotStartMin - currentMinutesOfDay;
            return diff === (slot.reminderMinutesBefore ?? 5);
          });

          if (upcomingSlot) {
            lastTriggeredMinuteRef.current = currentTimeKey;
            playChimeTone();
            sendBrowserNotification(
              `Upcoming Study Slot: ${upcomingSlot.title}`,
              `Starting in ${upcomingSlot.reminderMinutesBefore ?? 5} minutes (${upcomingSlot.startTime}). Get your notebook ready!`
            );
            setActiveAlert({
              type: 'slot_starting',
              slot: upcomingSlot,
              message: `${upcomingSlot.title} starts in ${upcomingSlot.reminderMinutesBefore ?? 5} mins!`,
            });
          }
        }
      }
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [reminders, daySchedules, autoSlotRemindersEnabled, todayDayName]);

  // Update schedule for a specific day
  const handleUpdateDaySchedule = (day: DayOfWeek, updated: DaySchedule) => {
    setDaySchedules((prev) => ({
      ...prev,
      [day]: updated,
    }));
  };

  // Restore imported schedules
  const handleImportSchedule = (imported: Record<DayOfWeek, DaySchedule>) => {
    if (imported && typeof imported === 'object') {
      setDaySchedules(imported);
    }
  };

  // Target hours and problems for current day
  const activeDaySchedule = daySchedules[currentDay];
  const setDailyTargetHours = (hrs: number) => {
    if (!activeDaySchedule) return;
    handleUpdateDaySchedule(currentDay, {
      ...activeDaySchedule,
      dailyTargetHours: hrs,
    });
  };

  const setDailyTargetProblems = (probs: number) => {
    if (!activeDaySchedule) return;
    handleUpdateDaySchedule(currentDay, {
      ...activeDaySchedule,
      dailyTargetProblems: probs,
    });
  };

  // Switch Student Profile handler (with PIN verification)
  const handleSwitchProfile = (targetProfileId: string, enteredPin?: string): boolean => {
    const target = profiles.find((p) => p.id === targetProfileId);
    if (!target) return false;
    if (target.pin && target.pin !== enteredPin) {
      return false;
    }

    // 1. Flush active profile data
    try {
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'schedules'), JSON.stringify(daySchedules));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'daily_goals'), JSON.stringify(dailyGoals));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'weekly_milestones'), JSON.stringify(weeklyMilestones));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'syllabus'), JSON.stringify(syllabusChapters));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'reminders'), JSON.stringify(reminders));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'auto_slot'), JSON.stringify(autoSlotRemindersEnabled));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'streak'), String(streakDays));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'journal'), JSON.stringify(journalEntries));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'error_logs'), JSON.stringify(errorLogs));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'xp'), String(studentXP));
      localStorage.setItem(getProfileStorageKey(activeProfileId, 'xp_history'), JSON.stringify(xpHistory));
    } catch {
      // ignore
    }

    // 2. Load target profile data
    const nextSchedules = loadStoredData(targetProfileId, 'schedules', STORAGE_KEYS.SCHEDULES, getDefaultWeekSchedules());
    const nextGoals = loadStoredData(targetProfileId, 'daily_goals', STORAGE_KEYS.DAILY_GOALS, DEFAULT_DAILY_GOALS);
    const nextMilestones = loadStoredData(targetProfileId, 'weekly_milestones', STORAGE_KEYS.WEEKLY_MILESTONES, DEFAULT_WEEKLY_MILESTONES);
    const nextSyllabus = loadStoredData(targetProfileId, 'syllabus', STORAGE_KEYS.SYLLABUS, GRADE_11_SYLLABUS);
    const nextReminders = loadStoredData(targetProfileId, 'reminders', STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    const nextAutoSlot = loadStoredData(targetProfileId, 'auto_slot', STORAGE_KEYS.AUTO_SLOT_REMINDERS, true);
    const nextStreak = Number(loadStoredData(targetProfileId, 'streak', STORAGE_KEYS.STREAK, 14));
    const nextJournal = loadStoredData(targetProfileId, 'journal', STORAGE_KEYS.JOURNAL, DEFAULT_JOURNAL_ENTRIES);
    const nextErrors = loadStoredData(targetProfileId, 'error_logs', STORAGE_KEYS.ERROR_LOGS, DEFAULT_ERROR_LOGS);
    const nextXP = Number(loadStoredData(targetProfileId, 'xp', STORAGE_KEYS.XP, 150));
    const nextHistory = loadStoredData<XPActivity[]>(targetProfileId, 'xp_history', STORAGE_KEYS.XP_HISTORY, []);

    setDaySchedules(nextSchedules);
    setDailyGoals(nextGoals);
    setWeeklyMilestones(nextMilestones);
    setSyllabusChapters(nextSyllabus);
    setReminders(nextReminders);
    setAutoSlotRemindersEnabled(nextAutoSlot);
    setStreakDays(nextStreak);
    setJournalEntries(nextJournal);
    setErrorLogs(nextErrors);
    setStudentXP(nextXP);
    setXpHistory(nextHistory);

    setActiveProfileId(targetProfileId);
    return true;
  };

  // Create new profile
  const handleCreateProfile = (name: string, batch?: string, avatarColor?: string, pin?: string) => {
    const newId = 'student_' + Date.now();
    const newProfile: StudentProfile = {
      id: newId,
      name,
      batch: batch || 'Class 11 - JEE 2028',
      avatarColor: avatarColor || 'Sky Blue',
      pin: pin || undefined,
      createdAt: new Date().toISOString(),
    };

    // Pre-seed fresh independent defaults for this profile
    try {
      localStorage.setItem(getProfileStorageKey(newId, 'schedules'), JSON.stringify(getDefaultWeekSchedules()));
      localStorage.setItem(getProfileStorageKey(newId, 'syllabus'), JSON.stringify(GRADE_11_SYLLABUS));
      localStorage.setItem(getProfileStorageKey(newId, 'weekly_milestones'), JSON.stringify(DEFAULT_WEEKLY_MILESTONES));
      localStorage.setItem(getProfileStorageKey(newId, 'daily_goals'), JSON.stringify(DEFAULT_DAILY_GOALS));
      localStorage.setItem(getProfileStorageKey(newId, 'reminders'), JSON.stringify(DEFAULT_REMINDERS));
      localStorage.setItem(getProfileStorageKey(newId, 'auto_slot'), JSON.stringify(true));
      localStorage.setItem(getProfileStorageKey(newId, 'streak'), '0');
      localStorage.setItem(getProfileStorageKey(newId, 'journal'), JSON.stringify([]));
      localStorage.setItem(getProfileStorageKey(newId, 'error_logs'), JSON.stringify([]));
      localStorage.setItem(getProfileStorageKey(newId, 'xp'), '150');
      localStorage.setItem(getProfileStorageKey(newId, 'xp_history'), JSON.stringify([]));
    } catch {
      // ignore
    }

    setProfiles((prev) => [...prev, newProfile]);
    handleSwitchProfile(newId);
  };

  // Update profile
  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Delete profile
  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);
    if (activeProfileId === profileId) {
      handleSwitchProfile(remaining[0].id);
    }
  };

  // Export full student study backup (.json)
  const handleExportBackup = () => {
    const backup: StudentFullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: activeProfile,
      daySchedules,
      dailyGoals,
      weeklyMilestones,
      syllabusChapters,
      reminders,
      autoSlotRemindersEnabled,
      streakDays,
      journalEntries,
      errorLogs,
      xp: studentXP,
      xpHistory,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = (activeProfile.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeName}_JEE2028_StudyPlan_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import full backup (.json)
  const handleImportBackup = (backup: StudentFullBackup): boolean => {
    try {
      if (backup.daySchedules) setDaySchedules(backup.daySchedules);
      if (backup.dailyGoals) setDailyGoals(backup.dailyGoals);
      if (backup.weeklyMilestones) setWeeklyMilestones(backup.weeklyMilestones);
      if (backup.syllabusChapters) setSyllabusChapters(backup.syllabusChapters);
      if (backup.reminders) setReminders(backup.reminders);
      if (typeof backup.autoSlotRemindersEnabled === 'boolean') {
        setAutoSlotRemindersEnabled(backup.autoSlotRemindersEnabled);
      }
      if (typeof backup.streakDays === 'number') setStreakDays(backup.streakDays);
      if (backup.journalEntries) setJournalEntries(backup.journalEntries);
      if (backup.errorLogs) setErrorLogs(backup.errorLogs);
      if (typeof backup.xp === 'number') setStudentXP(backup.xp);
      if (Array.isArray(backup.xpHistory)) setXpHistory(backup.xpHistory);

      if (backup.profile?.name && activeProfile.id === 'default') {
        const updatedProfile = {
          ...activeProfile,
          name: backup.profile.name,
          batch: backup.profile.batch || activeProfile.batch,
        };
        setProfiles((prev) =>
          prev.map((p) => (p.id === activeProfile.id ? updatedProfile : p))
        );
      }
      return true;
    } catch {
      return false;
    }
  };

  // Reset active profile workspace
  const handleResetActiveProfile = () => {
    setDaySchedules(getDefaultWeekSchedules());
    setSyllabusChapters(GRADE_11_SYLLABUS);
    setWeeklyMilestones(DEFAULT_WEEKLY_MILESTONES);
    setDailyGoals(DEFAULT_DAILY_GOALS);
    setReminders(DEFAULT_REMINDERS);
    setAutoSlotRemindersEnabled(true);
    setJournalEntries(DEFAULT_JOURNAL_ENTRIES);
    setErrorLogs(DEFAULT_ERROR_LOGS);
    setStreakDays(14);
    setStudentXP(1520);
    setXpHistory([]);
  };

  const activeRemindersCount = reminders.filter((r) => r.enabled).length;
  const pendingErrorCount = errorLogs.filter((e) => e.status === 'needs_revision').length;

  // Derived metrics for leadership board and stats
  const topicsMasteredCount = syllabusChapters.filter(
    (c) => c.status === 'mastered_revision_done'
  ).length;

  const solvedProblemsCount = weeklyMilestones.reduce(
    (acc, m) => acc + (m.completedCount || (m.completed ? m.targetCount || 30 : 0)),
    0
  );

  const totalStudyHours = Object.values(daySchedules).reduce((acc, sch) => {
    const dayMins = sch.slots.reduce((slotAcc, s) => {
      if (s.status === 'completed') {
        return slotAcc + (s.actualMinutesSpent || 60);
      }
      return slotAcc;
    }, 0);
    return acc + Math.round(dayMins / 60);
  }, 0);

  // Full cohort entries for leaderboard and faculty inspection
  const { entries: cohortEntries } = buildCohortLeaderboard(
    {
      id: activeProfile.id,
      name: activeProfile.name,
      batch: activeProfile.batch || 'Class 11 - JEE 2028',
      totalXP: studentXP,
      streakDays,
      topicsMastered: topicsMasteredCount,
      questionsSolved: solvedProblemsCount,
      studyHours: totalStudyHours,
    },
    importedCohortPeers
  );

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 transition-colors duration-150">
      {/* Alert Banner when a reminder or slot triggers */}
      <ReminderAlertBanner
        activeAlert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        onSnooze={() => {
          setActiveAlert(null);
          // temporary dismissed
        }}
        onStartFocus={(slot) => {
          setActiveAlert(null);
          setActiveFocusSlot(slot);
        }}
      />

      {/* Persistent App Header with Active Student Profile & Isolated Storage Badge */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRemindersCount={activeRemindersCount}
        pendingErrorCount={pendingErrorCount}
        streakDays={streakDays}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentProfile={activeProfile}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        studentXP={studentXP}
        facultySession={facultySession}
        onOpenFacultyPortal={() => setIsFacultyModalOpen(true)}
        superAdminSession={superAdminSession}
        onOpenSuperAdminModal={() => setIsSuperAdminModalOpen(true)}
        activeAnnouncement={announcements.find((a) => a.isActive) || null}
        onOpenRevisionHistoryModal={() => setIsRevisionModalOpen(true)}
        revisionCount={revisionRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'schedule' && (
          <ScheduleView
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            daySchedules={daySchedules}
            onUpdateDaySchedule={handleUpdateDaySchedule}
            onAwardXP={handleAwardXP}
            facultyComments={facultyComments}
            onAcknowledgeFacultyComment={handleAcknowledgeFacultyComment}
            onReplyToFacultyComment={handleReplyToFacultyComment}
            onOpenFacultyPortal={() => setIsFacultyModalOpen(true)}
            onOpenRevisionHistoryModal={() => setIsRevisionModalOpen(true)}
            revisionHistoryCount={revisionRecords.length}
            revisionRecords={revisionRecords}
            onAddRevisionRecord={handleAddRevisionRecord}
            onDeleteRevisionRecord={handleDeleteRevisionRecord}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            dailyGoals={dailyGoals}
            setDailyGoals={setDailyGoals}
            weeklyMilestones={weeklyMilestones}
            setWeeklyMilestones={setWeeklyMilestones}
            syllabusChapters={syllabusChapters}
            setSyllabusChapters={setSyllabusChapters}
            dailyTargetHours={activeDaySchedule?.dailyTargetHours || 6}
            setDailyTargetHours={setDailyTargetHours}
            dailyTargetProblems={activeDaySchedule?.dailyTargetProblems || 40}
            setDailyTargetProblems={setDailyTargetProblems}
            journalEntries={journalEntries}
            setJournalEntries={setJournalEntries}
            onAwardXP={handleAwardXP}
          />
        )}

        {activeTab === 'error_log' && (
          <ErrorLogView
            errorLogs={errorLogs}
            setErrorLogs={setErrorLogs}
            onAwardXP={handleAwardXP}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            setReminders={setReminders}
            autoSlotRemindersEnabled={autoSlotRemindersEnabled}
            setAutoSlotRemindersEnabled={setAutoSlotRemindersEnabled}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            daySchedules={daySchedules}
            streakDays={streakDays}
            onImportSchedule={handleImportSchedule}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            currentProfile={activeProfile}
            allProfiles={profiles}
            totalXP={studentXP}
            xpHistory={xpHistory}
            streakDays={streakDays}
            topicsMasteredCount={topicsMasteredCount}
            solvedProblemsCount={solvedProblemsCount}
            totalStudyHours={totalStudyHours}
            facultySession={facultySession}
            onOpenFacultyPortal={() => setIsFacultyModalOpen(true)}
            superAdminSession={superAdminSession}
            onOpenSuperAdminModal={() => setIsSuperAdminModalOpen(true)}
            onAwardXP={handleAwardXP}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Global Focus Timer if opened from alert banner */}
      {activeFocusSlot && (
        <FocusTimer
          slot={activeFocusSlot}
          isOpen={!!activeFocusSlot}
          onClose={() => setActiveFocusSlot(null)}
          onCompleteSlot={(slotId, minutes) => {
            const updatedSlots = activeDaySchedule.slots.map((s) =>
              s.id === slotId
                ? {
                    ...s,
                    status: 'completed' as const,
                    actualMinutesSpent: (s.actualMinutesSpent || 0) + minutes,
                  }
                : s
            );
            handleUpdateDaySchedule(currentDay, {
              ...activeDaySchedule,
              slots: updatedSlots,
            });
            handleAwardXP(
              25,
              `Completed ${minutes}m Focus Timer Session`,
              'timer',
              activeFocusSlot.subject
            );
            setActiveFocusSlot(null);
          }}
        />
      )}

      {/* Real-time Floating XP Award & Level Up Toast */}
      <XPToast
        toast={xpToast}
        onDismiss={() => setXpToast(null)}
        onViewLeaderboard={() => setActiveTab('leaderboard')}
      />

      {/* Student Privacy, Data Isolation & Profile Manager Modal */}
      <StudentPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentProfile={activeProfile}
        profiles={profiles}
        onSwitchProfile={handleSwitchProfile}
        onCreateProfile={handleCreateProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetActiveProfile={handleResetActiveProfile}
      />

      {/* Faculty & Mentor Portal Modal */}
      <FacultyPortalModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        facultySession={facultySession}
        onUpdateFacultySession={setFacultySession}
        cohortEntries={cohortEntries}
        currentProfile={activeProfile}
        totalStudentXP={studentXP}
        onAwardXP={handleAwardXP}
        onAddStudentToCohort={handleAddStudentToCohort}
        facultyComments={facultyComments}
        onAddFacultyComment={handleAddFacultyComment}
        onDeleteFacultyComment={handleDeleteFacultyComment}
      />

      {/* Institutional Super Admin Command Center Modal */}
      <SuperAdminModal
        isOpen={isSuperAdminModalOpen}
        onClose={() => setIsSuperAdminModalOpen(false)}
        superAdminSession={superAdminSession}
        onUpdateSuperAdminSession={setSuperAdminSession}
        auditLogs={auditLogs}
        onAddAuditLog={handleAddAuditLog}
        facultyDirectory={facultyDirectory}
        onAddFaculty={handleAddFaculty}
        announcements={announcements}
        onAddAnnouncement={handleAddAnnouncement}
        onToggleAnnouncement={handleToggleAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        cohortEntries={cohortEntries}
        currentProfile={activeProfile}
        totalStudentXP={studentXP}
        onAwardXP={handleAwardXP}
      />

      {/* Chapter & Revision History Modal (Past Week & Month Retro) */}
      <RevisionHistoryModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        revisionRecords={revisionRecords}
        onAddRevisionRecord={handleAddRevisionRecord}
        onDeleteRevisionRecord={handleDeleteRevisionRecord}
        studentName={activeProfile.name}
        batchName={activeProfile.batch}
        onAwardXP={handleAwardXP}
      />

      {/* Reassuring Footer with Student Isolation Verification */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Meccademia Education Institute · JEE 2028 Study Planner · Class 11 Foundation & Mastery
            </span>
            <span>·</span>
            <span className="text-slate-500 dark:text-slate-400">
              Active: <strong className="text-slate-700 dark:text-slate-200">{activeProfile.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Student-Isolated Offline Storage (Zero Cross-Student Sync)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
