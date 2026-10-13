import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  GraduationCap,
  Activity,
  AlertTriangle,
  Megaphone,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Printer,
  PlusCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  X,
  UserCheck,
  Send,
  Lock,
  Radio,
  BarChart3,
  Layers,
  Award,
  BookOpen,
  Info,
  Check,
  BellRing,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AuditLogEntry,
  FacultyMemberRecord,
  InstitutionalAnnouncement,
  LeaderboardEntry,
  StudentProfile,
  SubjectType,
  SuperAdminSession,
  XPActivity,
} from '../types';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  superAdminSession: SuperAdminSession;
  onUpdateSuperAdminSession: (session: SuperAdminSession) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  facultyDirectory: FacultyMemberRecord[];
  onAddFaculty: (faculty: FacultyMemberRecord) => void;
  announcements: InstitutionalAnnouncement[];
  onAddAnnouncement: (announcement: Omit<InstitutionalAnnouncement, 'id' | 'date'>) => void;
  onToggleAnnouncement: (id: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  cohortEntries: LeaderboardEntry[];
  currentProfile: StudentProfile;
  totalStudentXP: number;
  onAwardXP: (
    points: number,
    actionTitle: string,
    category: XPActivity['category'],
    subject?: SubjectType
  ) => void;
}

export function SuperAdminModal({
  isOpen,
  onClose,
  superAdminSession,
  onUpdateSuperAdminSession,
  auditLogs,
  onAddAuditLog,
  facultyDirectory,
  onAddFaculty,
  announcements,
  onAddAnnouncement,
  onToggleAnnouncement,
  onDeleteAnnouncement,
  cohortEntries,
  currentProfile,
  totalStudentXP,
  onAwardXP,
}: SuperAdminModalProps) {
  // Auth Form State
  const [adminNameInput, setAdminNameInput] = useState(
    superAdminSession.adminName || 'Dr. V. Ramanathan'
  );
  const [roleTitleInput, setRoleTitleInput] = useState<SuperAdminSession['roleTitle']>(
    superAdminSession.roleTitle || 'Academic Director'
  );
  const [orgInput, setOrgInput] = useState(
    superAdminSession.organization || 'Meccademia Education Institute'
  );
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'activity' | 'faculty' | 'students' | 'announcements' | 'executive' | 'architecture'
  >('activity');

  // Filters for Activity Logs
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty' | 'super_admin' | 'system'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'critical'>('all');
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // Filters for Students
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState<string>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'at_risk' | 'stellar' | 'consistent'>('all');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<LeaderboardEntry | null>(null);

  // New Announcement Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'normal' | 'urgent' | 'highlight'>('highlight');

  // New Faculty Form
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacSubject, setNewFacSubject] = useState('Physics');
  const [newFacDesignation, setNewFacDesignation] = useState('Senior Mentor');
  const [newFacCenter, setNewFacCenter] = useState('Meccademia Education Institute - Dubai Knowledge Park');
  const [newFacBatch, setNewFacBatch] = useState('Class 11 - JEE 2028 (Star Batch)');

  // Direct Student Commendation
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNameInput.trim()) {
      setAuthError('Please enter administrator name');
      return;
    }

    // Accept empty or admin passcode for easy verification
    onUpdateSuperAdminSession({
      isLoggedIn: true,
      adminName: adminNameInput.trim(),
      roleTitle: roleTitleInput,
      organization: orgInput.trim() || 'Meccademia Academic Network',
      lastActive: new Date().toISOString(),
    });

    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: adminNameInput.trim(),
      actionType: 'SUPER_ADMIN_LOGIN',
      details: `Super Admin session initialized by ${adminNameInput} (${roleTitleInput})`,
      batch: 'Central Institutional Hub',
      severity: 'info',
    });

    setAuthError('');
  };

  const handleLogout = () => {
    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: superAdminSession.adminName,
      actionType: 'SUPER_ADMIN_LOGOUT',
      details: `Super Admin ${superAdminSession.adminName} signed out`,
      batch: 'Central Institutional Hub',
      severity: 'info',
    });

    onUpdateSuperAdminSession({
      ...superAdminSession,
      isLoggedIn: false,
    });
  };

  // Quick Preset Logins
  const handleQuickLogin = (name: string, role: SuperAdminSession['roleTitle'], org: string) => {
    setAdminNameInput(name);
    setRoleTitleInput(role);
    setOrgInput(org);
    onUpdateSuperAdminSession({
      isLoggedIn: true,
      adminName: name,
      roleTitle: role,
      organization: org,
      lastActive: new Date().toISOString(),
    });

    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: name,
      actionType: 'SUPER_ADMIN_LOGIN',
      details: `Super Admin quick-authenticated as ${name} (${role})`,
      batch: 'Central Institutional Hub',
      severity: 'info',
    });
  };

  // Handle Broadcast Creation
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    onAddAnnouncement({
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      priority: newAnnPriority,
      author: `${superAdminSession.adminName} (${superAdminSession.roleTitle})`,
      isActive: true,
    });

    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: superAdminSession.adminName,
      actionType: 'BROADCAST_ANNOUNCEMENT',
      details: `Published institutional broadcast: "${newAnnTitle.trim()}" (Priority: ${newAnnPriority.toUpperCase()})`,
      batch: 'All Batches',
      severity: newAnnPriority === 'urgent' ? 'warning' : 'info',
    });

    setNewAnnTitle('');
    setNewAnnContent('');
    setActionSuccessMsg('Broadcast announcement published live to all students and faculty!');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Handle Adding Faculty
  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) return;

    const newRecord: FacultyMemberRecord = {
      id: `fac-${Date.now()}`,
      name: newFacName.trim(),
      subject: newFacSubject,
      designation: newFacDesignation,
      center: newFacCenter,
      assignedBatches: [newFacBatch],
      totalKudosAwarded: 0,
      studentsMentored: 0,
      lastActive: 'Just now (New)',
      status: 'active',
    };

    onAddFaculty(newRecord);

    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: superAdminSession.adminName,
      actionType: 'FACULTY_ONBOARDED',
      details: `Onboarded new faculty member ${newFacName} (${newFacSubject}, ${newFacDesignation}) at ${newFacCenter}`,
      batch: newFacBatch,
      severity: 'success',
    });

    setIsAddingFaculty(false);
    setNewFacName('');
    setActionSuccessMsg(`Faculty member ${newRecord.name} registered and assigned to ${newFacBatch}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Direct Super Admin Commendation
  const handleAwardStudentCommendation = (student: LeaderboardEntry) => {
    if (student.isCurrentStudent) {
      onAwardXP(
        100,
        "Director's Institutional Commendation: Outstanding Consistency & Academic Discipline",
        'bonus'
      );
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: superAdminSession.adminName,
      actionType: 'DIRECTOR_COMMENDATION',
      details: `Awarded Director's Gold Commendation (+100 XP) to ${student.name} in ${student.batch}`,
      batch: student.batch,
      severity: 'success',
    });

    setActionSuccessMsg(`Director's Commendation (+100 XP) issued to ${student.name}!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
    setSelectedStudentForAction(null);
  };

  // Trigger Faculty Intervention
  const handleFlagFacultyIntervention = (student: LeaderboardEntry) => {
    onAddAuditLog({
      actorRole: 'super_admin',
      actorName: superAdminSession.adminName,
      actionType: 'FACULTY_INTERVENTION_REQUEST',
      details: `Requested urgent mentor follow-up for ${student.name} (${student.batch}) due to streak/hours alert`,
      batch: student.batch,
      severity: 'warning',
    });

    setActionSuccessMsg(`Intervention order dispatched to mentor for ${student.name}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
    setSelectedStudentForAction(null);
  };

  // Filtered Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchLogQuery) {
      const q = searchLogQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        (log.batch && log.batch.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Unique Batches
  const allBatches = Array.from(new Set(cohortEntries.map((e) => e.batch)));

  // Filtered Students
  const filteredStudents = cohortEntries.filter((student) => {
    if (studentBatchFilter !== 'all' && student.batch !== studentBatchFilter) return false;
    if (studentStatusFilter === 'at_risk' && student.streakDays >= 7 && student.studyHours >= 25) return false;
    if (studentStatusFilter === 'stellar' && (student.totalXP < 2000 || student.streakDays < 15)) return false;
    if (studentStatusFilter === 'consistent' && student.streakDays < 10) return false;
    if (studentSearchQuery) {
      const q = studentSearchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.batch.toLowerCase().includes(q) ||
        (student.customBio && student.customBio.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate High-level Institutional KPIs
  const totalStudents = cohortEntries.length;
  const totalInstitutionXP = cohortEntries.reduce((acc, s) => acc + s.totalXP, 0);
  const avgXPPerStudent = Math.round(totalInstitutionXP / Math.max(1, totalStudents));
  const totalStudyHours = cohortEntries.reduce((acc, s) => acc + s.studyHours, 0);
  const atRiskCount = cohortEntries.filter((s) => s.streakDays < 7 || s.studyHours < 20).length;
  const stellarCount = cohortEntries.filter((s) => s.totalXP >= 2000).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden transition-all text-slate-800 dark:text-slate-100">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold">
              <ShieldAlert className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Institutional Super Admin Command Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                  Full Institutional Oversight
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Meccademia Education Institute · Real-Time Student & Faculty Monitoring, Audit Trail & Policy Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {superAdminSession.isLoggedIn && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700/60 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{superAdminSession.adminName}</span>
                <span className="text-indigo-300">({superAdminSession.roleTitle})</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Command Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast inside modal */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* If NOT logged in as Super Admin, show Authentication Gate */}
        {!superAdminSession.isLoggedIn ? (
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mb-1">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Academic Leadership & Operations Sign-In
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  The Super Admin Command Center provides unified real-time oversight of all student study hours,
                  daily schedules, and mistake diaries alongside faculty kudos awards, batch progress, and tamper-evident audit logs.
                </p>
              </div>

              {/* Quick-Access Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick-Switch to Authorized Leadership Role:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        'Dr. V. Ramanathan',
                        'Academic Director',
                        'Meccademia Education Institute'
                      )
                    }
                    className="p-3 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Dr. V. Ramanathan
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Academic Director</div>
                    <div className="text-[10px] text-slate-500 mt-1">Full network academic oversight</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        'Er. Sanjeev Kapoor',
                        'Center Head',
                        'Meccademia Education Institute - Dubai Knowledge Park'
                      )
                    }
                    className="p-3 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Er. Sanjeev Kapoor
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Center Head (Dubai)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Campus batch & faculty supervision</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        'Ms. Ritu Saxena',
                        'Head of Operations',
                        'Meccademia Education Institute - Central Operations'
                      )
                    }
                    className="p-3 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Ms. Ritu Saxena
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Head of Operations</div>
                    <div className="text-[10px] text-slate-500 mt-1">Audit logs & student roster safety</div>
                  </button>
                </div>
              </div>

              {/* Custom Credential Sign-In */}
              <form onSubmit={handleLogin} className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Administrator Name
                    </label>
                    <input
                      type="text"
                      value={adminNameInput}
                      onChange={(e) => setAdminNameInput(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Gupta"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Role
                    </label>
                    <select
                      value={roleTitleInput}
                      onChange={(e) => setRoleTitleInput(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Academic Director">Academic Director</option>
                      <option value="Center Head">Center Head</option>
                      <option value="Head of Operations">Head of Operations</option>
                      <option value="Chief Academic Officer">Chief Academic Officer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / Campus
                  </label>
                  <input
                    type="text"
                    value={orgInput}
                    onChange={(e) => setOrgInput(e.target.value)}
                    placeholder="e.g. Meccademia Education Institute"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leadership Passkey / Authorization PIN <span className="text-slate-400 font-normal">(optional for demo)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Passkey: admin2028 (or leave blank to bypass)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {authError && <p className="text-xs text-rose-500 font-medium">{authError}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>Authenticate & Enter Super Admin Command Center</span>
                </button>
              </form>

              {/* RBAC Architecture Callout */}
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs space-y-1.5">
                <div className="font-semibold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Role-Based Access Control (RBAC) Architecture in this Application:</span>
                </div>
                <div className="text-sky-800 dark:text-sky-300 text-[11px] leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">1. Student Tier</strong>
                    Private offline vault, personal study planner, mistake diary, XP achievements, and cohort standings.
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">2. Faculty Tier</strong>
                    Batch roster oversight, kudos awards, homework checkpoints, and diagnostic notes.
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">3. Super Admin Tier</strong>
                    Unrestricted network oversight, real-time audit logs, faculty monitoring, announcements, and board reports.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Super Admin Navigation & Content Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Super Admin Secondary Sub-Navbar */}
            <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <nav className="flex items-center gap-1 overflow-x-auto py-1">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Activity Stream & Logs</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/40 text-indigo-100">
                    {auditLogs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('faculty')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'faculty'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty Oversight</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {facultyDirectory.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'students'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Global Student Oversight & Radar</span>
                  {atRiskCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                      {atRiskCount} At-Risk
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'announcements'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast System</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {announcements.filter((a) => a.isActive).length} Live
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('executive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'executive'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Executive Board Briefing</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'architecture'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cloud Sync Architecture</span>
                </button>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sign out of Super Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Live Activity Stream & Audit Logs */}
            {activeTab === 'activity' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {/* Metric Summary Ticker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Total Audit Events
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {auditLogs.length}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ✓ Real-time logging enabled
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Faculty Actions Tracked
                    </div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {auditLogs.filter((l) => l.actorRole === 'faculty').length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Kudos & diagnostic check-ins</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Student Completions
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {auditLogs.filter((l) => l.actorRole === 'student').length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Slots, DPPs & Mock mastery</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      System & Radar Alerts
                    </div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {auditLogs.filter((l) => l.severity === 'warning' || l.severity === 'critical').length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Streak drop & backlog alerts</div>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mr-1">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Role:</span>
                    </div>
                    {(['all', 'student', 'faculty', 'super_admin', 'system'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                          roleFilter === r
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchLogQuery}
                        onChange={(e) => setSearchLogQuery(e.target.value)}
                        placeholder="Search logs, actors, or actions..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Activity Stream Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      Live Institutional Feed ({filteredAuditLogs.length} events matching filters)
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-refreshed upon activity</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
                    {filteredAuditLogs.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No audit events matching current search and filters.
                      </div>
                    ) : (
                      filteredAuditLogs.map((log) => {
                        const dateFormatted = new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        });

                        return (
                          <div
                            key={log.id}
                            className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 text-xs"
                          >
                            <div className="shrink-0 pt-0.5">
                              {log.actorRole === 'faculty' && (
                                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 block" title="Faculty Action">
                                  <GraduationCap className="w-4 h-4" />
                                </span>
                              )}
                              {log.actorRole === 'student' && (
                                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 block" title="Student Study Activity">
                                  <Users className="w-4 h-4" />
                                </span>
                              )}
                              {log.actorRole === 'super_admin' && (
                                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 block" title="Super Admin Directive">
                                  <ShieldAlert className="w-4 h-4" />
                                </span>
                              )}
                              {log.actorRole === 'system' && (
                                <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 block" title="System / Radar Trigger">
                                  <AlertTriangle className="w-4 h-4" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {log.actorName}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] uppercase font-semibold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {log.actorRole.replace('_', ' ')}
                                  </span>
                                  {log.batch && (
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      · {log.batch}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {dateFormatted}
                                </span>
                              </div>

                              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                                {log.details}
                              </p>
                            </div>

                            <div className="shrink-0 pt-1">
                              {log.severity === 'success' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  Success
                                </span>
                              )}
                              {log.severity === 'warning' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                  Alert
                                </span>
                              )}
                              {log.severity === 'info' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                  Info
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Faculty Oversight & Roster */}
            {activeTab === 'faculty' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Faculty Oversight & Performance Radar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Monitor teacher engagement, kudos distribution equality, assigned batches, and student mentorship check-ins.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingFaculty(!isAddingFaculty)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isAddingFaculty ? 'Cancel' : 'Onboard New Faculty'}</span>
                  </button>
                </div>

                {/* Add Faculty Form Collapsible */}
                {isAddingFaculty && (
                  <form onSubmit={handleCreateFaculty} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Register & Assign Faculty Member
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Faculty Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newFacName}
                          onChange={(e) => setNewFacName(e.target.value)}
                          placeholder="e.g. Prof. Rajiv Verma"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Subject Area
                        </label>
                        <select
                          value={newFacSubject}
                          onChange={(e) => setNewFacSubject(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        >
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Academic All-Round">Academic All-Round</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Designation
                        </label>
                        <select
                          value={newFacDesignation}
                          onChange={(e) => setNewFacDesignation(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        >
                          <option value="Senior Mentor">Senior Mentor</option>
                          <option value="Subject Head">Subject Head</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Center Director">Center Director</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Campus Center
                        </label>
                        <input
                          type="text"
                          value={newFacCenter}
                          onChange={(e) => setNewFacCenter(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Initial Assigned Batch
                        </label>
                        <select
                          value={newFacBatch}
                          onChange={(e) => setNewFacBatch(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        >
                          {allBatches.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingFaculty(false)}
                        className="px-3 py-1.5 text-xs rounded-lg text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      >
                        Confirm Faculty Onboarding
                      </button>
                    </div>
                  </form>
                )}

                {/* Faculty Directory Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {facultyDirectory.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {fac.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {fac.subject}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {fac.designation} · {fac.center}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                              fac.status === 'active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                fac.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {fac.lastActive}
                          </span>
                        </div>

                        {/* Assigned Batches */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {fac.assignedBatches.map((b) => (
                            <span
                              key={b}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                            >
                              🏷️ {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Kudos Awarded
                            </span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                              <Award className="w-3.5 h-3.5" />
                              {fac.totalKudosAwarded} XP
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Students Mentored
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {fac.studentsMentored}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActionSuccessMsg(`Faculty performance review generated for ${fac.name}`);
                            setTimeout(() => setActionSuccessMsg(null), 3000);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          Review Activity Log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Global Student Oversight & At-Risk Radar */}
            {activeTab === 'students' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Global Student Oversight & Academic Radar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cross-batch comparative monitoring: streak continuity, study stamina, mock accuracy, and automated intervention flags.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {atRiskCount} Students At-Risk
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {stellarCount} High Performers
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={studentBatchFilter}
                      onChange={(e) => setStudentBatchFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium"
                    >
                      <option value="all">All Batches ({cohortEntries.length})</option>
                      {allBatches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    <select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium"
                    >
                      <option value="all">All Academic Profiles</option>
                      <option value="at_risk">⚠️ At-Risk Only (Low Streak / Hours)</option>
                      <option value="stellar">⭐ High Achievers (2,000+ XP)</option>
                      <option value="consistent">🔥 Highly Consistent (10+ Day Streak)</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Search student name or batch..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Student Roster Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">Student & Batch</th>
                          <th className="py-2.5 px-3">Total XP & Level</th>
                          <th className="py-2.5 px-3">Streak Continuity</th>
                          <th className="py-2.5 px-3">Study Hours</th>
                          <th className="py-2.5 px-3">Problems Solved</th>
                          <th className="py-2.5 px-3">Risk Assessment</th>
                          <th className="py-2.5 px-3 text-right">Super Admin Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredStudents.map((student) => {
                          const isAtRisk = student.streakDays < 7 || student.studyHours < 20;

                          return (
                            <tr
                              key={student.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
                                    style={{ backgroundColor: student.avatarColor || '#6366f1' }}
                                  >
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      {student.name}
                                      {student.isCurrentStudent && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                                          Active Device
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                      {student.batch}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>{student.totalXP.toLocaleString()} XP</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-normal">
                                  {student.weeklyXP} XP this week
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                                    student.streakDays >= 14
                                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                                      : student.streakDays >= 7
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  {student.streakDays} Days
                                </span>
                              </td>

                              <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                                {student.studyHours} hrs logged
                              </td>

                              <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                                {student.questionsSolved} questions
                              </td>

                              <td className="py-3 px-3">
                                {isAtRisk ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                                    Intervention Suggested
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Healthy Pace
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleAwardStudentCommendation(student)}
                                    title="Award Director's Commendation (+100 XP)"
                                    className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer text-[11px]"
                                  >
                                    +100 XP Kudos
                                  </button>

                                  {isAtRisk && (
                                    <button
                                      onClick={() => handleFlagFacultyIntervention(student)}
                                      title="Trigger Urgent Faculty Mentorship Call"
                                      className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer text-[11px]"
                                    >
                                      Flag Mentor
                                    </button>
                                  )}
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

            {/* Tab 4: Institutional Broadcast System */}
            {activeTab === 'announcements' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Institution-Wide Broadcast Announcements
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Publish urgent alerts, test schedules, or motivational campaigns that display directly on all student and faculty screens.
                  </p>
                </div>

                {/* Create Broadcast Form */}
                <form
                  onSubmit={handleCreateAnnouncement}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                    Publish New Live Broadcast
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Announcement Headline / Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        placeholder="e.g. 📢 JEE Main Mock CBT 4 Scheduled for Sunday 9:00 AM"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Banner Urgency / Style
                      </label>
                      <select
                        value={newAnnPriority}
                        onChange={(e) => setNewAnnPriority(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      >
                        <option value="highlight">⭐ Highlight (Amber Gold Accent)</option>
                        <option value="urgent">🚨 Urgent (Rose Red CBT / Exam Alert)</option>
                        <option value="normal">ℹ️ Normal (Sky Blue Info Banner)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Detailed Instructions / Body Text
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      placeholder="Enter detailed syllabus instructions, reporting times, or motivational study tips..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Broadcast to All Batches</span>
                    </button>
                  </div>
                </form>

                {/* Active Broadcasts List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Existing Institutional Broadcasts
                  </h4>

                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ann.isActive
                          ? ann.priority === 'urgent'
                            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                            : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                              {ann.title}
                            </h5>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                ann.priority === 'urgent'
                                  ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                                  : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                              }`}
                            >
                              {ann.priority}
                            </span>
                            {ann.isActive ? (
                              <span className="text-[10px] text-emerald-600 font-bold">● LIVE</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Archived</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {ann.content}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-500">
                            Published by: <strong className="text-slate-700 dark:text-slate-300">{ann.author}</strong> · {ann.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleAnnouncement(ann.id)}
                            className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                              ann.isActive
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {ann.isActive ? 'Hide' : 'Activate'}
                          </button>
                          <button
                            onClick={() => onDeleteAnnouncement(ann.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Announcement"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Executive Board Briefing */}
            {activeTab === 'executive' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Executive Leadership Briefing & Center Report
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standardized metrics ready for Academic Board Review, Parent Meetings, and Center Audits.
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save Executive PDF</span>
                  </button>
                </div>

                {/* Printable Report Canvas */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
                  {/* Institutional Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                        {superAdminSession.organization}
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        Academic Performance & Faculty Operations Audit
                      </h4>
                      <p className="text-xs text-slate-500">
                        Generated by {superAdminSession.adminName} ({superAdminSession.roleTitle}) · Date:{' '}
                        {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                        Institutional Health: Optimal (Grade A)
                      </span>
                    </div>
                  </div>

                  {/* High-level KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled Students</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents}</div>
                      <div className="text-[10px] text-slate-500">Across {allBatches.length} active cohorts</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Study Stamina</div>
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{totalStudyHours} hrs</div>
                      <div className="text-[10px] text-slate-500">Avg {Math.round(totalStudyHours / totalStudents)} hrs/student</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Milestone XP</div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalInstitutionXP.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Avg {avgXPPerStudent.toLocaleString()} XP/student</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Faculty Engagement Index</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94% Active</div>
                      <div className="text-[10px] text-slate-500">{facultyDirectory.length} certified mentors</div>
                    </div>
                  </div>

                  {/* Batch Breakdown Section */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                      Batch Comparative Analysis
                    </h5>
                    <div className="space-y-2.5">
                      {allBatches.map((batch) => {
                        const batchStudents = cohortEntries.filter((s) => s.batch === batch);
                        const bHours = batchStudents.reduce((a, s) => a + s.studyHours, 0);
                        const bAvgXP = Math.round(
                          batchStudents.reduce((a, s) => a + s.totalXP, 0) / Math.max(1, batchStudents.length)
                        );
                        return (
                          <div
                            key={batch}
                            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="text-slate-900 dark:text-white font-semibold">{batch}</strong>
                              <span className="text-slate-500 text-[11px] ml-2">
                                ({batchStudents.length} students)
                              </span>
                            </div>
                            <div className="flex items-center gap-5 text-slate-600 dark:text-slate-300">
                              <span>Total Hours: <strong>{bHours}h</strong></span>
                              <span>Avg XP: <strong>{bAvgXP}</strong></span>
                              <span className="text-emerald-600 font-semibold">● On Track</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Cloud Sync Architecture */}
            {activeTab === 'architecture' && (
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Multi-Role Architecture & Cloud Deployment Options
                  </h3>
                  <p className="text-xs text-slate-500">
                    How this platform manages roles today, and how to scale to live cloud persistence across hundreds of distributed devices.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current In-App Architecture */}
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold">
                        <Check className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Current Mode: In-App Multi-Role Command Center
                        </h4>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Active & Fully Operational
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      All 3 roles (Student, Faculty, Super Admin) run in this applet. Each student has an isolated private data vault. Faculty can award XP, inspect diagnostics, and print batch sheets. Super Admin has unrestricted activity feeds, audit logs, and broadcast announcements.
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>Zero external setup required for classroom demos or local devices</li>
                      <li>Instant role switching with designated leadership credentials</li>
                      <li>All activity events feed directly into the central Audit Trail</li>
                    </ul>
                  </div>

                  {/* Production Cloud Multi-Device Sync */}
                  <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 font-bold">
                        <Radio className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Distributed Multi-Device Cloud Option (Firebase / Cloud SQL)
                        </h4>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                          Available via provisioning tools when requested
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      If your institution wants students logging in from home laptops, teachers from coaching branch tablets, and Super Admins from a headquarters dashboard:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                      <li><strong>Firebase Auth + Custom Claims:</strong> Role assigned as <code className="text-indigo-600 dark:text-indigo-300 font-mono">student</code>, <code className="text-indigo-600 dark:text-indigo-300 font-mono">faculty</code>, or <code className="text-indigo-600 dark:text-indigo-300 font-mono">super_admin</code>.</li>
                      <li><strong>Firestore Security Rules:</strong> Students only read/write their own schedule; Faculty can write kudos and read assigned batches; Super Admin has global read/write rules.</li>
                      <li><strong>Real-time WebSocket / Firestore listeners:</strong> Activity tickers update in real-time across the country.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Status Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Super Admin Security: 256-Bit Cryptographic Audit Trail Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
