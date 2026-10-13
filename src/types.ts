export type SubjectType =
  | 'Physics'
  | 'Chemistry'
  | 'Mathematics'
  | 'Revision'
  | 'Mock/PYQ'
  | 'School'
  | 'Break';

export type SlotCategory =
  | 'Theory & Concepts'
  | 'Problem Solving & DPP'
  | 'NCERT & Formulas'
  | 'Mock Test & PYQ'
  | 'Doubt Clearing & Analysis'
  | 'School / Coaching'
  | 'Break / Rest'
  | 'Sleep / Wakeup';

export type SlotStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface StudySlot {
  id: string;
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  subject: SubjectType;
  title: string;
  category: SlotCategory;
  notes?: string;
  status: SlotStatus;
  actualMinutesSpent?: number;
  reminderMinutesBefore?: number; // e.g. 5 or 10 min
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type SchedulePreset = 'school_day' | 'weekend_deep_prep' | 'coaching_day';

export interface DaySchedule {
  day: DayOfWeek;
  preset: SchedulePreset;
  slots: StudySlot[];
  dailyTargetHours: number;
  dailyTargetProblems: number;
  dailyNotes?: string;
}

export interface DailyGoalItem {
  id: string;
  text: string;
  subject: SubjectType;
  completed: boolean;
}

export interface WeeklyMilestone {
  id: string;
  title: string;
  subject: SubjectType;
  targetCount?: number; // e.g. 50 questions
  completedCount?: number;
  deadlineDate: string; // "YYYY-MM-DD"
  completed: boolean;
  priority: 'High' | 'Medium' | 'Standard';
}

export type ChapterStatus =
  | 'not_started'
  | 'theory_completed'
  | 'dpp_level1'
  | 'pyq_advanced'
  | 'mastered_revision_done';

export interface SyllabusChapter {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapterName: string;
  jeeWeightage: 'High' | 'Medium' | 'Moderate';
  status: ChapterStatus;
  targetCompletionDate?: string;
  notes?: string;
}

export interface StudyReminder {
  id: string;
  title: string;
  time: string; // "HH:MM"
  repeat: 'Everyday' | 'Weekdays' | 'Weekends' | 'Once';
  category: 'Study Slot' | 'Formula Revision' | 'DPP Submission' | 'Hydration & Break' | 'Bedtime';
  enabled: boolean;
  linkedSlotId?: string;
  lastTriggeredDate?: string;
}

export interface StudyDayLog {
  date: string; // "YYYY-MM-DD"
  totalMinutes: number;
  subjectMinutes: Record<SubjectType, number>;
  problemsSolved: number;
  slotsCompleted: number;
  totalSlots: number;
}

export type MentalStateType =
  | 'Laser Focused'
  | 'Productive & Steady'
  | 'Tired / Low Energy'
  | 'Anxious / Overwhelmed'
  | 'Distracted'
  | 'Breakthrough Moment';

export interface DailyJournalEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  mentalState: MentalStateType;
  energyRating: number; // 1 to 5
  topicsCovered: string;
  reflection: string; // 2-3 sentence reflection
  tomorrowFocus?: string;
  createdAt: string;
}

export type ErrorReasonType =
  | 'Calculation / Silly Error'
  | 'Conceptual Gap'
  | 'Misread Question / Trap'
  | 'Formula Forgotten'
  | 'Time Pressure / Speed';

export interface ErrorLogItem {
  id: string;
  questionRef: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  errorType: ErrorReasonType;
  mistakeDescription: string;
  correctConcept: string;
  status: 'needs_revision' | 'mastered';
  dateLogged: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  batch?: string;
  avatarColor?: string;
  pin?: string; // Optional 4-digit PIN for device privacy
  createdAt: string;
}

export type XPCategory =
  | 'slot'
  | 'goal'
  | 'milestone'
  | 'syllabus'
  | 'error_log'
  | 'timer'
  | 'journal'
  | 'streak'
  | 'quest'
  | 'bonus'
  | 'peer';

export interface XPActivity {
  id: string;
  action: string;
  points: number;
  timestamp: string;
  category: XPCategory;
  subject?: SubjectType;
}

export interface StudentRankTier {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  badge: string;
  color: string;
  description: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  batch: string;
  avatarColor?: string;
  totalXP: number;
  weeklyXP: number;
  streakDays: number;
  topicsMastered: number;
  questionsSolved: number;
  studyHours: number;
  isCurrentStudent?: boolean;
  rankBadge?: string;
  customBio?: string;
  lastActive?: string;
}

export interface StudentFullBackup {
  version: string;
  exportedAt: string;
  profile: StudentProfile;
  daySchedules: Record<DayOfWeek, DaySchedule>;
  dailyGoals: DailyGoalItem[];
  weeklyMilestones: WeeklyMilestone[];
  syllabusChapters: SyllabusChapter[];
  reminders: StudyReminder[];
  autoSlotRemindersEnabled: boolean;
  streakDays: number;
  journalEntries: DailyJournalEntry[];
  errorLogs: ErrorLogItem[];
  xp?: number;
  xpHistory?: XPActivity[];
  revisionRecords?: ChapterRevisionRecord[];
  facultyComments?: FacultyScheduleComment[];
}

export interface FacultySession {
  isLoggedIn: boolean;
  facultyName: string;
  designation: 'Faculty' | 'Senior Mentor' | 'Subject Head' | 'Center Director';
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Academic All-Round';
  center: string;
  lastActive: string;
}

export interface FacultyAwardRecord {
  id: string;
  studentId: string;
  studentName: string;
  points: number;
  reason: string;
  facultyName: string;
  date: string;
}

export interface SuperAdminSession {
  isLoggedIn: boolean;
  adminName: string;
  roleTitle: 'Academic Director' | 'Center Head' | 'Head of Operations' | 'Chief Academic Officer';
  organization: string;
  lastActive: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: 'student' | 'faculty' | 'super_admin' | 'system';
  actorName: string;
  actionType: string;
  details: string;
  batch?: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
}

export interface InstitutionalAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'normal' | 'urgent' | 'highlight';
  isActive: boolean;
}

export interface FacultyMemberRecord {
  id: string;
  name: string;
  designation: string;
  subject: string;
  center: string;
  assignedBatches: string[];
  totalKudosAwarded: number;
  studentsMentored: number;
  lastActive: string;
  status: 'active' | 'offline';
}

export type RevisionType =
  | 'Full Chapter Revision'
  | 'NCERT Line-by-Line & Formulas'
  | 'Coaching DPP / Problem Set'
  | 'PYQ Marathon (JEE Main/Adv)'
  | 'Mistake Diary Trap Review';

export interface ChapterRevisionRecord {
  id: string;
  date: string; // ISO date string or "YYYY-MM-DD"
  chapterName: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Revision';
  revisionType: RevisionType;
  durationMinutes: number;
  questionsSolved?: number;
  confidenceRating?: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Mastered
  notes?: string;
  source: 'manual' | 'slot_completed' | 'syllabus_update' | 'faculty_directive';
}

export type FacultyCommentTone =
  | 'encouragement'       // Encouragement & Kudos
  | 'lagging_alert'       // Lagging / Backlog Alert
  | 'schedule_advice'     // Routine / Timing Optimization
  | 'urgent_catchup';     // Urgent Intervention before tests

export interface FacultyScheduleComment {
  id: string;
  studentId: string;       // target student id ('default' or cohort id)
  studentName: string;
  facultyName: string;
  facultyDesignation: string;
  facultySubject: string;
  facultyCenter: string;
  commentTone: FacultyCommentTone;
  title: string;
  message: string;
  targetDay?: DayOfWeek | 'All Days';
  targetSlotId?: string;
  targetSlotTitle?: string;
  recommendedAction?: string;
  bonusXPAwarded?: number;
  createdAt: string;       // ISO date
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  studentReply?: string;
  studentRepliedAt?: string;
}


