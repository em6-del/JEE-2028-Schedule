import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  User,
  Users,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  KeyRound,
  Laptop,
  Smartphone,
  EyeOff,
  Copy,
  Check,
  Info,
  Trash2,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import {
  StudentProfile,
  StudentFullBackup,
  DayOfWeek,
  DaySchedule,
  DailyGoalItem,
  WeeklyMilestone,
  SyllabusChapter,
  StudyReminder,
  DailyJournalEntry,
  ErrorLogItem,
} from '../types';

interface StudentPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  profiles: StudentProfile[];
  onSwitchProfile: (profileId: string, enteredPin?: string) => boolean;
  onCreateProfile: (name: string, batch?: string, avatarColor?: string, pin?: string) => void;
  onUpdateProfile: (updated: StudentProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (backup: StudentFullBackup) => boolean;
  onResetActiveProfile: () => void;
}

const AVATAR_COLORS = [
  { name: 'Sky Blue', bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500', lightBg: 'bg-sky-100 dark:bg-sky-950/70' },
  { name: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', lightBg: 'bg-indigo-100 dark:bg-indigo-950/70' },
  { name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', lightBg: 'bg-emerald-100 dark:bg-emerald-950/70' },
  { name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', lightBg: 'bg-amber-100 dark:bg-amber-950/70' },
  { name: 'Rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', lightBg: 'bg-rose-100 dark:bg-rose-950/70' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', lightBg: 'bg-purple-100 dark:bg-purple-950/70' },
];

export function StudentPrivacyModal({
  isOpen,
  onClose,
  currentProfile,
  profiles,
  onSwitchProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onExportBackup,
  onImportBackup,
  onResetActiveProfile,
}: StudentPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<'assurance' | 'profiles' | 'backup'>('assurance');

  // Create Profile Form State
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileBatch, setNewProfileBatch] = useState('Class 11 - JEE 2028');
  const [newProfileColor, setNewProfileColor] = useState('Sky Blue');
  const [newProfilePin, setNewProfilePin] = useState('');

  // Switch with PIN state
  const [switchingToProfile, setSwitchingToProfile] = useState<StudentProfile | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Edit Profile Form State
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editPin, setEditPin] = useState('');

  // Import file ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Copy teacher text state
  const [hasCopiedAssurance, setHasCopiedAssurance] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreatingProfile(true);
    setNewProfileName('');
    setNewProfileBatch('Class 11 - JEE 2028');
    setNewProfileColor('Sky Blue');
    setNewProfilePin('');
    setPinError('');
  };

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    onCreateProfile(
      newProfileName.trim(),
      newProfileBatch.trim() || 'Class 11 - JEE 2028',
      newProfileColor,
      newProfilePin.trim() || undefined
    );
    setIsCreatingProfile(false);
  };

  const handleSwitchClick = (profile: StudentProfile) => {
    if (profile.id === currentProfile.id) return;
    if (profile.pin) {
      setSwitchingToProfile(profile);
      setEnteredPin('');
      setPinError('');
    } else {
      onSwitchProfile(profile.id);
    }
  };

  const handleConfirmPinSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchingToProfile) return;
    const success = onSwitchProfile(switchingToProfile.id, enteredPin);
    if (success) {
      setSwitchingToProfile(null);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError('Incorrect 4-digit PIN. Please try again.');
    }
  };

  const handleStartEdit = (profile: StudentProfile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditBatch(profile.batch || 'Class 11 - JEE 2028');
    setEditPin(profile.pin || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editName.trim()) return;
    onUpdateProfile({
      ...editingProfile,
      name: editName.trim(),
      batch: editBatch.trim() || 'Class 11 - JEE 2028',
      pin: editPin.trim() || undefined,
    });
    setEditingProfile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as StudentFullBackup;
        if (!parsed.daySchedules && !parsed.syllabusChapters) {
          setImportStatus({
            success: false,
            message: 'Invalid backup file format. Expected a JEE 2028 Student Backup JSON.',
          });
          return;
        }
        const ok = onImportBackup(parsed);
        if (ok) {
          setImportStatus({
            success: true,
            message: 'All student study data restored successfully into active profile!',
          });
        } else {
          setImportStatus({
            success: false,
            message: 'Failed to restore backup file. Please verify file integrity.',
          });
        }
      } catch (err) {
        setImportStatus({
          success: false,
          message: 'Error reading JSON backup file: ' + (err instanceof Error ? err.message : String(err)),
        });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const copyTeacherAssuranceText = () => {
    const text = `Dear Students & Parents,
Our JEE 2028 Class 11 Study Planner & Syllabus Tracker operates with 100% Client-Side Local Storage:
1. Whatever schedule changes, target syllabus dates, daily journals, or test mistakes you save stay strictly on your own device.
2. It NEVER syncs to or affects other students' apps.
3. No personal notes or study logs are shared or uploaded to any central server.
4. You can also create your own named Student Profile and export your complete backup file (.json) anytime.
Your prep, pace, and mistake diaries remain 100% private to you!`;

    navigator.clipboard.writeText(text);
    setHasCopiedAssurance(true);
    setTimeout(() => setHasCopiedAssurance(false), 3000);
  };

  const currentAvatar = AVATAR_COLORS.find((c) => c.name === currentProfile.avatarColor) || AVATAR_COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Student Data Privacy & Independent Workspace
                </h2>
                <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  100% Isolated
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Meccademia Education Institute · Active Student: <span className="font-semibold text-white">{currentProfile.name}</span> ({currentProfile.batch || 'Class 11'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('assurance')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'assurance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>How Student Data Stays Independent</span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profiles'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Profiles & Workspaces ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Backup & Transfer (.json)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* TAB 1: HOW STUDENT DATA STAYS INDEPENDENT */}
          {activeTab === 'assurance' && (
            <div className="space-y-6">
              {/* Executive Assurance Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    Guaranteed Isolation: Whatever a Student Saves Stays in Their App Only
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1 leading-relaxed">
                    This web application uses <strong>Client-Side Sandboxed LocalStorage</strong>. Every student who accesses the link on their own phone, tablet, or laptop receives a completely isolated, independent data vault. There is <strong>no central server or database merging student inputs</strong>.
                  </p>
                </div>
              </div>

              {/* 4 Pillars of Data Isolation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Browser-Level Origin Sandbox
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    When <strong>Student A</strong> modifies their Class 11 target dates, adds a custom chapter, or logs test mistakes, the browser saves it exclusively into Student A&apos;s physical device storage. <strong>Student B</strong> opening the exact same link sees only their own data.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Zero Central Database Overwriting
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Traditional apps with a shared database risk students accidentally overwriting each other&apos;s records. This application has no multi-tenant database. It is technically impossible for one student&apos;s action to alter another student&apos;s syllabus or timetable.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Shared Computer / Lab Protection
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    If two students (e.g. siblings, or coaching lab computers) share the same physical device, they can create separate <strong>Named Student Profiles</strong> with optional <strong>4-digit PIN passcodes</strong> so their error diaries and notes remain confidential.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                      100% Offline & Portable Backups
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    All study plans, customized target dates, error logs, and journals can be exported into an offline <code>.json</code> backup file with 1 click. Students can transfer their personal backup between their phone, laptop, or home PC anytime.
                  </p>
                </div>
              </div>

              {/* Ready-to-Send Message for Teachers / Coordinators */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    Teacher / Coordinator Note: Copy & Share with Students & Parents
                  </span>
                  <button
                    onClick={copyTeacherAssuranceText}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {hasCopiedAssurance ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {`Dear Students & Parents,\nOur JEE 2028 Class 11 Study Planner & Syllabus Tracker operates with 100% Client-Side Local Storage:\n1. Whatever schedule changes, target syllabus dates, daily journals, or test mistakes you save stay strictly on your own device.\n2. It NEVER syncs to or affects other students' apps.\n3. No personal notes or study logs are shared or uploaded to any central server.\n4. You can also create your own named Student Profile and export your complete backup file (.json) anytime.\nYour prep, pace, and mistake diaries remain 100% private to you!`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT PROFILES & WORKSPACES */}
          {activeTab === 'profiles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Manage Student Profiles on This Device
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Useful for shared computers, coaching labs, or siblings preparing for JEE 2028.
                  </p>
                </div>

                {!isCreatingProfile && !editingProfile && (
                  <button
                    onClick={handleStartCreate}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Student Profile</span>
                  </button>
                )}
              </div>

              {/* Create Profile Form */}
              {isCreatingProfile && (
                <form
                  onSubmit={handleSaveNewProfile}
                  className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Create New Student Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arjun Sharma, Priya P."
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Batch / Target
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Class 11 - JEE 2028 (Batch A)"
                        value={newProfileBatch}
                        onChange={(e) => setNewProfileBatch(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Avatar Color Theme
                      </label>
                      <select
                        value={newProfileColor}
                        onChange={(e) => setNewProfileColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        {AVATAR_COLORS.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Optional 4-Digit Passcode (PIN)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Leave blank for no PIN"
                        value={newProfilePin}
                        onChange={(e) => setNewProfilePin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                    >
                      Save & Initialize Student Vault
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Profile Form */}
              {editingProfile && (
                <form
                  onSubmit={handleSaveEdit}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4" />
                      Edit Student Profile: {editingProfile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(null)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Batch
                      </label>
                      <input
                        type="text"
                        value={editBatch}
                        onChange={(e) => setEditBatch(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        4-Digit PIN (Clear to remove)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="None"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              )}

              {/* PIN Verification Modal / Card if switching to locked profile */}
              {switchingToProfile && (
                <form
                  onSubmit={handleConfirmPinSwitch}
                  className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Enter 4-Digit Passcode for &quot;{switchingToProfile.name}&quot;</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    This profile is protected to keep study notes and mistake diary confidential.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="****"
                      value={enteredPin}
                      onChange={(e) => {
                        setEnteredPin(e.target.value.replace(/\D/g, ''));
                        setPinError('');
                      }}
                      className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Unlock & Switch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSwitchingToProfile(null);
                        setEnteredPin('');
                        setPinError('');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                  {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
                </form>
              )}

              {/* Profiles List */}
              <div className="space-y-3">
                {profiles.map((p) => {
                  const isActive = p.id === currentProfile.id;
                  const colorDef = AVATAR_COLORS.find((c) => c.name === p.avatarColor) || AVATAR_COLORS[0];

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${colorDef.bg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.2 rounded-full font-bold">
                                Active Workspace
                              </span>
                            )}
                            {p.pin && (
                              <span
                                title="PIN Protected Profile"
                                className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                              >
                                <Lock className="w-3 h-3 text-amber-500" />
                                PIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {p.batch || 'Class 11 - JEE 2028'} · Isolated Storage Vault
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => handleSwitchClick(p)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 dark:bg-slate-700 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Switch To</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(p)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {profiles.length > 1 && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete profile "${p.name}"? This removes this student's local records on this device.`
                                )
                              ) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            title="Delete Profile"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP, TRANSFER & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Personal Study Data Backup & Multi-Device Transfer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your complete JEE 2028 preparation file (schedules, target dates, syllabus progress, goals, journal, mistake notebook).
                </p>
              </div>

              {/* Status Message */}
              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                        Export Personal Backup (.json)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        For student: <strong>{currentProfile.name}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Downloads an encrypted/offline JSON file containing your timetable, customized syllabus target dates, daily goals, journal entries, and error notebook.
                  </p>
                  <button
                    onClick={onExportBackup}
                    className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {currentProfile.name}&apos;s Backup</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                        Restore / Transfer Data (.json)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Load saved file onto this device
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Moving from your phone to laptop or restoring from an earlier backup? Select your previously exported <code>.json</code> file to restore instantly.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select Backup File to Restore</span>
                  </button>
                </div>
              </div>

              {/* Clean Reset Section */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h4 className="font-semibold text-rose-900 dark:text-rose-300 text-xs">
                      Reset Workspace for &quot;{currentProfile.name}&quot;
                    </h4>
                  </div>
                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-medium cursor-pointer"
                    >
                      Reset Options
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Resets the current active profile back to the recommended Class 11 timetable and syllabus roadmap. Other student profiles are untouched.
                </p>

                {showResetConfirm && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-800 space-y-2">
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      ⚠️ Are you sure? This will reload the default Grade 11 JEE 2028 schedule and milestones for {currentProfile.name}.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetActiveProfile();
                          setShowResetConfirm(false);
                          setImportStatus({
                            success: true,
                            message: `Workspace for ${currentProfile.name} has been reset to defaults.`,
                          });
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Yes, Reset This Profile
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted in Browser · Zero Cross-Student Interference</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
