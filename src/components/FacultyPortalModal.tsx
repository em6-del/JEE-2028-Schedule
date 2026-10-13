import React, { useState } from 'react';
import {
  GraduationCap,
  Trophy,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Printer,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
  BookOpen,
  AlertTriangle,
  X,
  UserCheck,
  Building,
  Calendar,
  Layers,
  Send,
  Check,
  MessageSquare,
  Lightbulb,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FacultySession,
  FacultyAwardRecord,
  LeaderboardEntry,
  StudentProfile,
  SubjectType,
  XPActivity,
  FacultyScheduleComment,
  FacultyCommentTone,
  DayOfWeek,
} from '../types';
import { getRankTier } from '../utils/xpEngine';

interface FacultyPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultySession: FacultySession;
  onUpdateFacultySession: (session: FacultySession) => void;
  cohortEntries: LeaderboardEntry[];
  currentProfile: StudentProfile;
  totalStudentXP: number;
  onAwardXP: (
    points: number,
    actionTitle: string,
    category: XPActivity['category'],
    subject?: SubjectType
  ) => void;
  onAddStudentToCohort?: (student: LeaderboardEntry) => void;
  facultyComments?: FacultyScheduleComment[];
  onAddFacultyComment?: (
    comment: Omit<FacultyScheduleComment, 'id' | 'createdAt' | 'isAcknowledged'>
  ) => void;
  onDeleteFacultyComment?: (commentId: string) => void;
}

export function FacultyPortalModal({
  isOpen,
  onClose,
  facultySession,
  onUpdateFacultySession,
  cohortEntries,
  currentProfile,
  totalStudentXP,
  onAwardXP,
  onAddStudentToCohort,
  facultyComments = [],
  onAddFacultyComment,
  onDeleteFacultyComment,
}: FacultyPortalModalProps) {
  // Login form state (if not logged in)
  const [facultyNameInput, setFacultyNameInput] = useState(
    facultySession.facultyName || 'Prof. R. K. Sharma (Meccademia Education Institute)'
  );
  const [facultyRoleInput, setFacultyRoleInput] = useState<FacultySession['designation']>(
    facultySession.designation || 'Senior Mentor'
  );
  const [facultySubjectInput, setFacultySubjectInput] = useState<FacultySession['subject']>(
    facultySession.subject || 'Physics'
  );
  const [facultyCenterInput, setFacultyCenterInput] = useState(
    facultySession.center || 'Meccademia Education Institute - Dubai Knowledge Park'
  );
  const [facultyPasscode, setFacultyPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active view in Faculty Portal
  const [portalTab, setPortalTab] = useState<
    'leaderboard' | 'award' | 'schedule_comments' | 'analytics' | 'print'
  >('leaderboard');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'totalXP' | 'weeklyXP' | 'studyHours' | 'questionsSolved'>(
    'totalXP'
  );

  // Student Award Modal / drawer
  const [selectedStudentForAward, setSelectedStudentForAward] = useState<LeaderboardEntry | null>(
    null
  );
  const [awardPoints, setAwardPoints] = useState<number>(50);
  const [awardReason, setAwardReason] = useState<string>('Scored 85%+ in Coaching Mock Test');
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);

  // Student Diagnostics Modal
  const [selectedStudentForInspect, setSelectedStudentForInspect] =
    useState<LeaderboardEntry | null>(null);

  // Add new student form
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBatch, setNewStudentBatch] = useState('Class 11 - JEE 2028 (Alpha Batch)');
  const [newStudentInitialXP, setNewStudentInitialXP] = useState(500);

  // Faculty announcements broadcast
  const [broadcastNote, setBroadcastNote] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Faculty Schedule Comment form state
  const [commentTargetStudentId, setCommentTargetStudentId] = useState<string>('default');
  const [commentTone, setCommentTone] = useState<FacultyCommentTone>('lagging_alert');
  const [commentTitle, setCommentTitle] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentDay, setCommentDay] = useState<DayOfWeek | 'All Days'>('Wednesday');
  const [commentSlotTitle, setCommentSlotTitle] = useState('Chemistry: NCERT Deep Dive');
  const [commentAction, setCommentAction] = useState('Complete DPP #6 & #7 before Friday');
  const [commentBonusXP, setCommentBonusXP] = useState<number>(25);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Faculty Sign-in
  const handleFacultyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyNameInput.trim()) {
      setLoginError('Please enter your Faculty / Mentor name.');
      return;
    }

    const updatedSession: FacultySession = {
      isLoggedIn: true,
      facultyName: facultyNameInput.trim(),
      designation: facultyRoleInput,
      subject: facultySubjectInput,
      center: facultyCenterInput.trim() || 'Meccademia Academic Hub',
      lastActive: new Date().toISOString(),
    };

    onUpdateFacultySession(updatedSession);
    setLoginError('');
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  // Handle Faculty Log-out
  const handleFacultyLogout = () => {
    onUpdateFacultySession({
      ...facultySession,
      isLoggedIn: false,
    });
  };

  // Filter cohort entries
  const filteredEntries = cohortEntries
    .filter((entry) => {
      if (selectedBatch !== 'All' && !entry.batch.toLowerCase().includes(selectedBatch.toLowerCase())) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !entry.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.batch.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  // Aggregate Batch Statistics
  const totalStudents = filteredEntries.length;
  const avgXP =
    totalStudents > 0
      ? Math.round(filteredEntries.reduce((acc, curr) => acc + curr.totalXP, 0) / totalStudents)
      : 0;
  const avgStudyHours =
    totalStudents > 0
      ? Math.round(
          (filteredEntries.reduce((acc, curr) => acc + curr.studyHours, 0) / totalStudents) * 10
        ) / 10
      : 0;
  const highPerformers = filteredEntries.filter((s) => s.totalXP >= 1500).length;
  const atRiskStudents = filteredEntries.filter((s) => s.studyHours < 16 || s.streakDays < 3);

  // Handle Award XP Submission
  const handleConfirmAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAward || !awardReason.trim()) return;

    if (selectedStudentForAward.isCurrentStudent) {
      onAwardXP(awardPoints, `Faculty Award: ${awardReason.trim()} (${facultySession.facultyName})`, 'bonus');
    }

    setAwardFeedback(
      `Awarded +${awardPoints} XP to ${selectedStudentForAward.name} with commendation note!`
    );

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setAwardFeedback(null);
      setSelectedStudentForAward(null);
    }, 2000);
  };

  // Handle Add New Student
  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newEntry: LeaderboardEntry = {
      id: `faculty-added-${Date.now()}`,
      name: newStudentName.trim(),
      batch: newStudentBatch,
      totalXP: newStudentInitialXP,
      weeklyXP: Math.round(newStudentInitialXP * 0.25),
      streakDays: 7,
      topicsMastered: 4,
      questionsSolved: 120,
      studyHours: 18,
      rankBadge: '🎓 Enrolled by Faculty',
      customBio: 'Added via Faculty / Mentor Portal',
    };

    if (onAddStudentToCohort) {
      onAddStudentToCohort(newEntry);
    }

    setIsAddingStudent(false);
    setNewStudentName('');
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Handle Broadcast Note
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNote.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastNote('');
    }, 2500);
  };

  // Handle Post Schedule Comment
  const handlePostScheduleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentTitle.trim() || !commentMessage.trim()) return;

    const targetStudent =
      cohortEntries.find((s) => s.id === commentTargetStudentId) ||
      (currentProfile.id === commentTargetStudentId
        ? { id: currentProfile.id, name: currentProfile.name }
        : { id: 'default', name: currentProfile.name });

    onAddFacultyComment?.({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      facultyName: facultySession.facultyName,
      facultyDesignation: facultySession.designation,
      facultySubject: facultySession.subject,
      facultyCenter: facultySession.center,
      commentTone,
      title: commentTitle.trim(),
      message: commentMessage.trim(),
      targetDay: commentDay,
      targetSlotTitle: commentSlotTitle.trim() || undefined,
      recommendedAction: commentAction.trim() || undefined,
      bonusXPAwarded: commentBonusXP > 0 ? commentBonusXP : undefined,
    });

    if (
      commentBonusXP > 0 &&
      (targetStudent.id === 'default' || targetStudent.id === currentProfile.id)
    ) {
      onAwardXP(
        commentBonusXP,
        `Faculty Commendation: ${commentTitle.trim()} (${facultySession.facultyName})`,
        'bonus'
      );
    }

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setCommentSuccessMsg(`Guidance directive posted to ${targetStudent.name}'s schedule!`);
    setTimeout(() => {
      setCommentSuccessMsg(null);
    }, 3000);

    setCommentTitle('');
    setCommentMessage('');
  };

  const applyCommentPreset = (preset: {
    tone: FacultyCommentTone;
    title: string;
    message: string;
    action: string;
    slot: string;
    bonus: number;
  }) => {
    setCommentTone(preset.tone);
    setCommentTitle(preset.title);
    setCommentMessage(preset.message);
    setCommentAction(preset.action);
    setCommentSlotTitle(preset.slot);
    setCommentBonusXP(preset.bonus);
  };

  // Print leaderboard
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Faculty & Mentor Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  JEE 2028 Academic Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Batch Leaderboard, Performance Oversight & Student Recognition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {facultySession.isLoggedIn && (
              <button
                onClick={handleFacultyLogout}
                title="Log out from Faculty Mode"
                className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Faculty Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* IF NOT LOGGED IN: FACULTY LOGIN / SIGN-IN SCREEN */}
        {!facultySession.isLoggedIn ? (
          <div className="p-6 sm:p-10 overflow-y-auto max-w-xl mx-auto w-full my-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <UserCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Faculty & Mentor Login
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Sign in to view real-time batch leaderboards, inspect student study hours, award bonus
                XP for tests & DPPs, and print batch rankings.
              </p>
            </div>

            <form onSubmit={handleFacultyLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Name / Title
                </label>
                <input
                  type="text"
                  value={facultyNameInput}
                  onChange={(e) => setFacultyNameInput(e.target.value)}
                  placeholder="e.g. Prof. R. K. Sharma (Meccademia Education Institute)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Role
                  </label>
                  <select
                    value={facultyRoleInput}
                    onChange={(e) =>
                      setFacultyRoleInput(e.target.value as FacultySession['designation'])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Senior Mentor">Senior Mentor</option>
                    <option value="Faculty">Faculty Teacher</option>
                    <option value="Subject Head">Subject Head</option>
                    <option value="Center Director">Center Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Department
                  </label>
                  <select
                    value={facultySubjectInput}
                    onChange={(e) =>
                      setFacultySubjectInput(e.target.value as FacultySession['subject'])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Academic All-Round">Academic All-Round</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institute / Center Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={facultyCenterInput}
                    onChange={(e) => setFacultyCenterInput(e.target.value)}
                    placeholder="e.g. Meccademia Education Institute - Dubai"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Mentor Access Passcode (Optional)</span>
                  <span className="text-[10px] text-slate-400">Demo Code: Any or Blank</span>
                </label>
                <input
                  type="password"
                  value={facultyPasscode}
                  onChange={(e) => setFacultyPasscode(e.target.value)}
                  placeholder="Enter passcode or leave blank for instant access"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Enter Faculty & Mentor Dashboard</span>
              </button>
            </form>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Multi-Faculty Collaborative Access</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Faculty can access all cohort batches, award official commendation points, inspect
                student error patterns, and print batch rankings for classroom notice boards without
                disrupting student personal vaults.
              </p>
            </div>
          </div>
        ) : (
          /* LOGGED IN: FULL FACULTY DASHBOARD */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Faculty Bar: Info & Tabs */}
            <div className="px-6 py-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                  {facultySession.facultyName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {facultySession.facultyName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {facultySession.designation} · {facultySession.subject}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    {facultySession.center}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setPortalTab('leaderboard')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    portalTab === 'leaderboard'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Batch Leaderboard</span>
                </button>

                <button
                  onClick={() => setPortalTab('schedule_comments')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    portalTab === 'schedule_comments'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span>Schedule Guidance & Lag Alerts</span>
                  {facultyComments.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {facultyComments.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setPortalTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    portalTab === 'analytics'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  <span>Batch Insights</span>
                </button>

                <button
                  onClick={() => setPortalTab('print')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    portalTab === 'print'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export & Print</span>
                </button>
              </div>
            </div>

            {/* TAB 1: BATCH LEADERBOARD WITH FACULTY CONTROLS */}
            {portalTab === 'leaderboard' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Batch KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Enrolled in Batch
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {totalStudents} <span className="text-xs font-normal text-slate-500">Students</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Cohort Average XP
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                      {avgXP.toLocaleString()} <span className="text-xs font-normal text-slate-500">XP</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Avg Daily Study
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {avgStudyHours}h <span className="text-xs font-normal text-slate-500">/ student</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      High-Pace Solvers
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {highPerformers} <span className="text-xs font-normal text-slate-500">&gt; Level 4</span>
                    </div>
                  </div>
                </div>

                {/* Filters & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Batch Filter Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Filter className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Batch:</span>
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="All">All Batches (Overall Cohort)</option>
                        <option value="Alpha">Alpha Batch (Class 11)</option>
                        <option value="Star">Star Batch (Class 11)</option>
                        <option value="Beta">Beta Batch (Class 11)</option>
                      </select>
                    </div>

                    {/* Metric Sort */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span>Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="totalXP">Highest Total XP</option>
                        <option value="weeklyXP">Weekly Sprint XP</option>
                        <option value="studyHours">Total Study Hours</option>
                        <option value="questionsSolved">Problems Solved</option>
                      </select>
                    </div>
                  </div>

                  {/* Search and Add Student */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <button
                      onClick={() => setIsAddingStudent(!isAddingStudent)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Enroll Student</span>
                    </button>
                  </div>
                </div>

                {/* Add Student Inline Form */}
                {isAddingStudent && (
                  <form
                    onSubmit={handleAddNewStudent}
                    className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Enroll New Student to Batch
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingStudent(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Student Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarav Gupta"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Batch Assignment
                        </label>
                        <select
                          value={newStudentBatch}
                          onChange={(e) => setNewStudentBatch(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="Class 11 - JEE 2028 (Alpha Batch)">Alpha Batch (Class 11)</option>
                          <option value="Class 11 - JEE 2028 (Star Batch)">Star Batch (Class 11)</option>
                          <option value="Class 11 - JEE 2028 (Beta Batch)">Beta Batch (Class 11)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Baseline Starting XP
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={newStudentInitialXP}
                          onChange={(e) => setNewStudentInitialXP(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingStudent(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Confirm Enrollment
                      </button>
                    </div>
                  </form>
                )}

                {/* Faculty Broadcast Banner */}
                <form
                  onSubmit={handleSendBroadcast}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        Post Faculty Mentor Notice to Batch:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Broadcast encouraging targets or test schedule announcements to students.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="e.g. Focus on Rotational Dynamics DPP 3 before Friday mock test!"
                      value={broadcastNote}
                      onChange={(e) => setBroadcastNote(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs w-full sm:w-72"
                    />
                    <button
                      type="submit"
                      disabled={!broadcastNote.trim()}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast</span>
                    </button>
                  </div>
                  {broadcastSent && (
                    <div className="w-full text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Notice broadcasted to batch announcement board!
                    </div>
                  )}
                </form>

                {/* Interactive Leaderboard Table */}
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/80 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-3.5 text-center w-12">Rank</th>
                          <th className="py-3 px-3.5">Student / Batch</th>
                          <th className="py-3 px-3.5 text-right">Total XP</th>
                          <th className="py-3 px-3.5 text-right hidden sm:table-cell">Weekly Sprint</th>
                          <th className="py-3 px-3.5 text-center">Streak</th>
                          <th className="py-3 px-3.5 text-right hidden md:table-cell">Study Time</th>
                          <th className="py-3 px-3.5 text-right hidden md:table-cell">Questions</th>
                          <th className="py-3 px-3.5 text-center">Faculty Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {filteredEntries.map((student, idx) => {
                          const tier = getRankTier(student.totalXP);
                          const isTop3 = idx < 3;
                          return (
                            <tr
                              key={student.id}
                              className={`hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors ${
                                student.isCurrentStudent
                                  ? 'bg-amber-50/30 dark:bg-amber-950/20'
                                  : ''
                              }`}
                            >
                              {/* Rank */}
                              <td className="py-3 px-3.5 text-center font-bold">
                                {idx === 0 && <span className="text-base">🥇</span>}
                                {idx === 1 && <span className="text-base">🥈</span>}
                                {idx === 2 && <span className="text-base">🥉</span>}
                                {idx > 2 && (
                                  <span className="text-slate-600 dark:text-slate-400 font-mono">
                                    #{idx + 1}
                                  </span>
                                )}
                              </td>

                              {/* Student & Batch */}
                              <td className="py-3 px-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs"
                                    style={{
                                      backgroundColor:
                                        student.avatarColor ||
                                        (student.isCurrentStudent ? '#6366f1' : '#3b82f6'),
                                    }}
                                  >
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <span>{student.name}</span>
                                      {student.isCurrentStudent && (
                                        <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[10px] font-bold">
                                          Active Vault
                                        </span>
                                      )}
                                      <span className="text-[11px] text-slate-500">
                                        {tier.badge} Lvl {tier.level}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                                      {student.batch}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Total XP */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                                {student.totalXP.toLocaleString()} XP
                              </td>

                              {/* Weekly Sprint */}
                              <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                                +{student.weeklyXP.toLocaleString()} XP
                              </td>

                              {/* Streak */}
                              <td className="py-3 px-3.5 text-center">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  {student.streakDays}d
                                </span>
                              </td>

                              {/* Study Hours */}
                              <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300 hidden md:table-cell">
                                {student.studyHours} hrs
                              </td>

                              {/* Questions Solved */}
                              <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300 hidden md:table-cell font-mono">
                                {student.questionsSolved} Qs
                              </td>

                              {/* Faculty Actions */}
                              <td className="py-3 px-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedStudentForAward(student)}
                                    title="Award Faculty Recognition XP & Note"
                                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>Award XP</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCommentTargetStudentId(student.id);
                                      if (student.studyHours < 16 || student.streakDays < 3) {
                                        setCommentTone('lagging_alert');
                                        setCommentTitle(`⚠️ Schedule Lag Alert: Backlog Catch-Up Needed (${student.name})`);
                                        setCommentMessage(`Your weekly study logs show ${student.studyHours}h completed, which is falling behind our Class 11 batch milestones. Please prioritize your weak slots and clear backlogged DPPs.`);
                                        setCommentAction('Complete 30 backlogged numericals before Friday test');
                                      } else {
                                        setCommentTone('encouragement');
                                        setCommentTitle(`🌟 Mentor Encouragement & Study Stamina Kudos (${student.name})`);
                                        setCommentMessage(`Impressive consistency with ${student.studyHours}h logged and ${student.streakDays}-day unbroken streak! Keep maintaining this high study momentum.`);
                                        setCommentAction('Solve HC Verma Level 2 numericals for upcoming chapter');
                                        setCommentBonusXP(35);
                                      }
                                      setPortalTab('schedule_comments');
                                    }}
                                    title="Comment on Student Schedule (Alert Lag or Encourage)"
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <MessageSquare className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    <span>Comment Schedule</span>
                                  </button>

                                  <button
                                    onClick={() => setSelectedStudentForInspect(student)}
                                    title="Inspect Student Consistency & Performance"
                                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
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

            {/* TAB 2: BATCH INSIGHTS & AT-RISK RADAR */}
            {portalTab === 'analytics' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Performers Column */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Batch Leaders & Star Performers
                      </h4>
                      <span className="text-xs text-amber-600 font-semibold font-mono">
                        Top 5 Aspirants
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {cohortEntries.slice(0, 5).map((student, i) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 font-bold text-center text-slate-500">#{i + 1}</span>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-500">{student.batch}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                                {student.totalXP.toLocaleString()} XP
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                {student.studyHours}h study · {student.questionsSolved} Qs
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setCommentTargetStudentId(student.id);
                                setCommentTone('encouragement');
                                setCommentTitle(`🌟 Batch Star Commendation: Top Tier Performance (${student.name})`);
                                setCommentMessage(`Superb work ranking in the top cohort! Your study stamina and numerical problem solving are exemplary for Class 11 JEE 2028. Keep dominating your daily slots!`);
                                setCommentAction('Maintain high problem-solving velocity for next topic');
                                setCommentBonusXP(50);
                                setPortalTab('schedule_comments');
                              }}
                              title="Send Encouragement to Student Schedule"
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentorship Radar: Students Needing Attention */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        Mentorship Radar: Needs Faculty Follow-up
                      </h4>
                      <span className="text-xs text-rose-600 font-semibold">
                        Low Hours or Broken Streak
                      </span>
                    </div>

                    {atRiskStudents.length > 0 ? (
                      <div className="space-y-2.5">
                        {atRiskStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-rose-600 dark:text-rose-400">
                                {student.studyHours < 16 ? 'Under 16 hrs logged' : 'Streak lapsed'}{' '}
                                · {student.batch}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setCommentTargetStudentId(student.id);
                                  setCommentTone('lagging_alert');
                                  setCommentTitle(`⚠️ Schedule Lag Warning: Class 11 Backlog Catch-Up Needed (${student.name})`);
                                  setCommentMessage(`Your weekly study time (${student.studyHours}h) is lagging behind our Class 11 target schedule. Please prioritize backlogged DPPs and adhere strictly to your scheduled study slots before the upcoming mock test.`);
                                  setCommentAction('Complete 30 backlogged numericals before Friday test');
                                  setPortalTab('schedule_comments');
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Alert Lag on Schedule</span>
                              </button>
                              <button
                                onClick={() => setSelectedStudentForAward(student)}
                                className="px-2.5 py-1 bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-[11px] font-semibold hover:bg-rose-50 cursor-pointer shadow-2xs"
                              >
                                Encourage (+XP)
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        All batch students are maintaining solid consistency above 16 hours!
                      </div>
                    )}
                  </div>
                </div>

                {/* Faculty Subject Syllabus Coverage */}
                <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Class 11 Curriculum Progress Tracking (JEE 2028 Target)
                    </h4>
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      Coaching Phase 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Faculty recommendation: Ensure students complete NCERT Line-by-Line before
                    attempting multi-concept Level 2 DPPs in Physics (Kinematics, Laws of Motion) and
                    Organic Chemistry GOC.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: SCHEDULE GUIDANCE & LAG WARNINGS */}
            {portalTab === 'schedule_comments' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span>Student Schedule Directives & Encouragements</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Post actionable advice directly into student timetables. Alert students who are lagging behind on DPPs or reward consistent study stamina.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    {facultyComments.length} Active Directives
                  </span>
                </div>

                {/* Success Banner */}
                {commentSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{commentSuccessMsg}</span>
                  </div>
                )}

                {/* Form: Post Schedule Guidance */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <span>Post Directive or Encouragement to Student Schedule</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Displays immediately on student&apos;s daily timetable
                    </span>
                  </div>

                  {/* Preset Guidance Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Guidance Templates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          applyCommentPreset({
                            tone: 'lagging_alert',
                            title: '⚠️ Lagging in Class 11 Chemistry DPPs',
                            message:
                              'Your study log shows an uncompleted backlog in Chemical Bonding (MOT & Hybridization) DPPs. Please dedicate a 90-minute evening slot this week before the batch milestone test.',
                            action: 'Complete 30 VSEPR & Dipole Moment numericals before Friday',
                            slot: 'Chemistry: NCERT Deep Dive',
                            bonus: 25,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        ⚠️ Chemistry DPP Backlog
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          applyCommentPreset({
                            tone: 'encouragement',
                            title: '🌟 Outstanding Mechanics Consistency',
                            message:
                              'Exceptional focus and stamina during your daily 2-hour Physics numerical slots! Your Kinematics and Laws of Motion problem solving speed has reached top percentile level. Keep it up!',
                            action: 'Attempt HC Verma Objective 1 & 2 before starting Rotational Mechanics',
                            slot: 'Evening Problem Solving: Mechanics Focus',
                            bonus: 50,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        🌟 Mechanics Streak Praise
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          applyCommentPreset({
                            tone: 'schedule_advice',
                            title: '💡 Shift Coordinate Geometry to Morning Slot',
                            message:
                              'To avoid calculation slips in sign conventions caused by late-evening mental fatigue, shift heavy formula derivations and coordinate geometry problems to your 6:00 AM morning slot.',
                            action: 'Practice 45 mins of formula derivation during morning slot',
                            slot: 'Morning Formula Drill',
                            bonus: 30,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        💡 Move Math to Morning Slot
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          applyCommentPreset({
                            tone: 'urgent_catchup',
                            title: '🚨 Urgent Catch-Up: Review Mistake Diary before Mock',
                            message:
                              'Your recent mock test diagnostics showed repeated errors in Projectile Motion trajectories. Please review your marked mistake diary items before Sunday 9:00 AM CBT.',
                            action: 'Review all 12 marked error traps in Mistake Diary',
                            slot: 'Timed Part-Test (PCM Mix)',
                            bonus: 20,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        🚨 Urgent CBT Error Review
                      </button>
                    </div>
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handlePostScheduleComment} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Select Recipient Student
                        </label>
                        <select
                          value={commentTargetStudentId}
                          onChange={(e) => setCommentTargetStudentId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="default">{currentProfile.name} (Active Student Vault)</option>
                          {cohortEntries
                            .filter((s) => s.id !== 'default')
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.batch})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Directive Purpose / Tone
                        </label>
                        <select
                          value={commentTone}
                          onChange={(e) => setCommentTone(e.target.value as FacultyCommentTone)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="lagging_alert">⚠️ Lagging in Schedule (Backlog Warning)</option>
                          <option value="encouragement">🌟 Encouragement & Kudos (Praise)</option>
                          <option value="schedule_advice">💡 Routine & Timing Optimization</option>
                          <option value="urgent_catchup">🚨 Urgent Test Intervention</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Schedule Day
                        </label>
                        <select
                          value={commentDay}
                          onChange={(e) => setCommentDay(e.target.value as DayOfWeek | 'All Days')}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="All Days">All Days (Weekly Guidance)</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Study Slot Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={commentSlotTitle}
                          onChange={(e) => setCommentSlotTitle(e.target.value)}
                          placeholder="e.g. Evening Physics Problem Solving"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Directive Headline / Title
                      </label>
                      <input
                        type="text"
                        required
                        value={commentTitle}
                        onChange={(e) => setCommentTitle(e.target.value)}
                        placeholder="e.g. ⚠️ Behind in Chemical Bonding DPPs — Immediate Slot Adjustment Needed"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mentor Detailed Guidance & Assessment
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={commentMessage}
                        onChange={(e) => setCommentMessage(e.target.value)}
                        placeholder="Explain specifically which topics or problems are lagging, or highlight what the student did well..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Recommended Action / Goal
                        </label>
                        <input
                          type="text"
                          value={commentAction}
                          onChange={(e) => setCommentAction(e.target.value)}
                          placeholder="e.g. Complete 30 VSEPR & Dipole Moment questions before Friday"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Encouragement Kudos / Bonus XP
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 25, 50, 100].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setCommentBonusXP(pts)}
                              className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                                commentBonusXP === pts
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {pts === 0 ? 'None' : `+${pts} XP`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post Directive to Student Schedule</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Directive History Log */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Active Student Directives & Responses ({facultyComments.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Live status tracking
                    </span>
                  </div>

                  {facultyComments.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      No schedule directives posted yet. Use the form above to encourage students or flag lagging areas!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {facultyComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  comment.commentTone === 'encouragement'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                                    : comment.commentTone === 'lagging_alert'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800'
                                }`}
                              >
                                {comment.commentTone === 'encouragement'
                                  ? '🌟 Encouragement'
                                  : comment.commentTone === 'lagging_alert'
                                  ? '⚠️ Lag Warning'
                                  : '💡 Schedule Advice'}
                              </span>

                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Student: {comment.studentName}
                              </span>

                              {comment.targetDay && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                                  {comment.targetDay}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {comment.isAcknowledged ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Acknowledged by Student</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium text-[10px] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Pending Student Review</span>
                                </span>
                              )}

                              {onDeleteFacultyComment && (
                                <button
                                  onClick={() => onDeleteFacultyComment(comment.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                                  title="Retract directive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {comment.title}
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {comment.message}
                            </p>
                          </div>

                          {comment.recommendedAction && (
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                Action Required:{' '}
                              </span>
                              <span>{comment.recommendedAction}</span>
                            </div>
                          )}

                          {comment.studentReply && (
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-0.5">
                              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Student Reply Received:
                              </span>
                              <p className="text-slate-700 dark:text-slate-200 italic">
                                &quot;{comment.studentReply}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EXPORT & PRINT NOTICE BOARD FORMAT */}
            {portalTab === 'print' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Print-Ready Batch Leaderboard Notice
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Formatted for classroom notice boards, parent progress updates, or faculty
                      reviews.
                    </p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Leaderboard Report</span>
                  </button>
                </div>

                {/* Print Preview Paper */}
                <div className="bg-white text-slate-900 border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md max-w-3xl mx-auto space-y-4 print:shadow-none print:border-none">
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight uppercase">
                        {facultySession.center || 'Meccademia Education Institute'}
                      </h2>
                      <p className="text-xs font-bold text-slate-600">
                        Grade 11 JEE 2028 Aspirants · Official Cohort Standings
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold">Generated by:</span> {facultySession.facultyName}
                      <br />
                      <span className="text-slate-500">
                        {new Date().toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                        <th className="py-2">Rank</th>
                        <th className="py-2">Student Name</th>
                        <th className="py-2">Batch</th>
                        <th className="py-2 text-right">Total XP</th>
                        <th className="py-2 text-right">Streak</th>
                        <th className="py-2 text-right">Study Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredEntries.map((student, i) => (
                        <tr key={student.id}>
                          <td className="py-1.5 font-bold">#{i + 1}</td>
                          <td className="py-1.5 font-semibold">{student.name}</td>
                          <td className="py-1.5 text-slate-600">{student.batch}</td>
                          <td className="py-1.5 text-right font-mono font-bold">
                            {student.totalXP.toLocaleString()} XP
                          </td>
                          <td className="py-1.5 text-right font-mono">{student.streakDays} days</td>
                          <td className="py-1.5 text-right">{student.studyHours} hrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 flex justify-between">
                    <span>Authorized by: {facultySession.facultyName} ({facultySession.designation})</span>
                    <span>Target: JEE Main & Advanced 2028</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: AWARD FACULTY RECOGNITION XP */}
        {selectedStudentForAward && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Award Faculty Commendation
                </h4>
                <button
                  onClick={() => setSelectedStudentForAward(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span className="text-slate-500 block text-[10px]">Recipient Student:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedStudentForAward.name}
                </span>
                <span className="text-slate-500 text-[11px] block">{selectedStudentForAward.batch}</span>
              </div>

              <form onSubmit={handleConfirmAward} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recognition Points (XP)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 200].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setAwardPoints(pts)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          awardPoints === pts
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        +{pts} XP
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commendation Reason / Test
                  </label>
                  <select
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white mb-2"
                  >
                    <option value="Scored 85%+ in Coaching Mock Test">Scored 85%+ in Coaching Mock Test</option>
                    <option value="Exceptional DPP Numerical Solving Speed">Exceptional DPP Numerical Solving Speed</option>
                    <option value="Perfect Attendance & Unbroken Streak">Perfect Attendance & Unbroken Streak</option>
                    <option value="Active Doubt Clearing & Concept Mastery">Active Doubt Clearing & Concept Mastery</option>
                    <option value="Zero Silly Errors in Physics Test">Zero Silly Errors in Physics Test</option>
                    <option value="Most Improved Student of the Week">Most Improved Student of the Week</option>
                  </select>
                </div>

                {awardFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center border border-emerald-200 dark:border-emerald-800">
                    {awardFeedback}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForAward(null)}
                    className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Confirm +{awardPoints} XP Award</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INSPECT STUDENT DIAGNOSTICS */}
        {selectedStudentForInspect && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {selectedStudentForInspect.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedStudentForInspect.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{selectedStudentForInspect.batch}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForInspect(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total XP</span>
                  <span className="text-base font-black text-amber-500 font-mono">
                    {selectedStudentForInspect.totalXP.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-500 block">Study Hours</span>
                  <span className="text-base font-black text-emerald-500 font-mono">
                    {selectedStudentForInspect.studyHours} hrs
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-500 block">Questions</span>
                  <span className="text-base font-black text-sky-500 font-mono">
                    {selectedStudentForInspect.questionsSolved}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 text-xs space-y-1">
                <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                  Mentor Assessment Note:
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedStudentForInspect.customBio ||
                    'Consistent aspirant demonstrating strong conceptual foundations in Class 11 mechanics and physical chemistry.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const s = selectedStudentForInspect;
                      setSelectedStudentForInspect(null);
                      setCommentTargetStudentId(s.id);
                      setCommentTitle(`Academic Schedule Directive for ${s.name}`);
                      setPortalTab('schedule_comments');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comment on Schedule</span>
                  </button>

                  <button
                    onClick={() => {
                      const s = selectedStudentForInspect;
                      setSelectedStudentForInspect(null);
                      setSelectedStudentForAward(s);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Award XP</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedStudentForInspect(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
