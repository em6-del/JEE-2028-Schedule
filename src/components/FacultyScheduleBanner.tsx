import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Award,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FacultyScheduleComment, FacultyCommentTone } from '../types';
import confetti from 'canvas-confetti';

interface FacultyScheduleBannerProps {
  comments: FacultyScheduleComment[];
  currentDay: string;
  onAcknowledgeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, replyText: string) => void;
  onOpenFacultyPortal?: () => void;
}

export function FacultyScheduleBanner({
  comments,
  currentDay,
  onAcknowledgeComment,
  onReplyToComment,
  onOpenFacultyPortal,
}: FacultyScheduleBannerProps) {
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!comments || comments.length === 0) return null;

  // Filter or prioritize comments: Show comments targeting current day or 'All Days' first
  const relevantComments = comments;
  const unacknowledgedCount = comments.filter((c) => !c.isAcknowledged).length;

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    onReplyToComment(commentId, replyText.trim());
    setReplyingCommentId(null);
    setReplyText('');
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const getToneBadge = (tone: FacultyCommentTone) => {
    switch (tone) {
      case 'encouragement':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
          label: '🌟 Mentor Encouragement & Kudos',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        };
      case 'lagging_alert':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
          label: '⚠️ Schedule Lag Warning & Catch-Up',
          bg: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100',
          badgeBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
        };
      case 'urgent_catchup':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
          label: '🚨 Urgent Academic Intervention',
          bg: 'bg-rose-100/90 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100',
          badgeBg: 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-rose-400',
        };
      case 'schedule_advice':
      default:
        return {
          icon: <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />,
          label: '💡 Strategic Schedule Guidance',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
          badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/80 p-4 shadow-xs transition-all space-y-3">
      {/* Banner Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-indigo-100 dark:border-indigo-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Faculty Schedule Feedback & Mentor Directives
              </h3>
              {unacknowledgedCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                  {unacknowledgedCount} New
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalized guidance on your daily study slots, lagging subjects & encouragement from Meccademia faculty
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFacultyPortal && (
            <button
              onClick={onOpenFacultyPortal}
              className="hidden sm:inline-flex text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Faculty Portal &rarr;
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse notes' : 'Expand notes'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Comments List */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {relevantComments.map((comment) => {
            const toneStyle = getToneBadge(comment.commentTone);
            const isTargetToday =
              comment.targetDay === currentDay || comment.targetDay === 'All Days';

            return (
              <div
                key={comment.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 relative ${toneStyle.bg}`}
              >
                {/* Header row of card */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${toneStyle.badgeBg}`}
                    >
                      {toneStyle.icon}
                      <span>{toneStyle.label}</span>
                    </span>

                    {comment.targetDay && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        <span>{comment.targetDay}</span>
                        {isTargetToday && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                            (Today)
                          </span>
                        )}
                      </span>
                    )}

                    {comment.targetSlotTitle && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Target: {comment.targetSlotTitle}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                {/* Main Message Body */}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {comment.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {comment.message}
                  </p>
                </div>

                {/* Recommended Action / Directive */}
                {comment.recommendedAction && (
                  <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 text-[11px]">
                      Recommended Action:
                    </span>
                    <span className="text-[11px]">{comment.recommendedAction}</span>
                  </div>
                )}

                {/* Faculty Author & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    Mentor: <strong className="font-semibold text-slate-900 dark:text-white">{comment.facultyName}</strong>{' '}
                    <span className="text-slate-500">
                      ({comment.facultyDesignation} · {comment.facultySubject})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {comment.bonusXPAwarded && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>+{comment.bonusXPAwarded} Bonus XP</span>
                      </span>
                    )}

                    {!comment.isAcknowledged ? (
                      <button
                        onClick={() => onAcknowledgeComment(comment.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </span>
                    )}

                    <button
                      onClick={() =>
                        setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id)
                      }
                      className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-indigo-500" />
                      <span>{comment.studentReply ? 'View Reply' : 'Reply'}</span>
                    </button>
                  </div>
                </div>

                {/* Student Existing Reply if any */}
                {comment.studentReply && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-xs space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">
                      Your Reply to Mentor:
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 text-[11px] italic">
                      &quot;{comment.studentReply}&quot;
                    </p>
                  </div>
                )}

                {/* Reply Drawer Form */}
                {replyingCommentId === comment.id && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2 animate-fade-in">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Send Status Update to {comment.facultyName}:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="e.g. Understood Sir, completed 30 VSEPR questions in today's evening slot..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendReply(comment.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSendReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
