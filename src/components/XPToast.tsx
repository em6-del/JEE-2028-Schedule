import { useEffect } from 'react';
import { Sparkles, Trophy, Award, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentRankTier } from '../types';

export interface XPToastEvent {
  id: string;
  points: number;
  actionTitle: string;
  totalXP: number;
  tier: StudentRankTier;
  isLevelUp?: boolean;
}

interface XPToastProps {
  toast: XPToastEvent | null;
  onDismiss: () => void;
  onViewLeaderboard: () => void;
}

export function XPToast({ toast, onDismiss, onViewLeaderboard }: XPToastProps) {
  useEffect(() => {
    if (!toast) return;

    if (toast.isLevelUp) {
      // Grand celebration for level up
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, toast.isLevelUp ? 6000 : 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all animate-bounce-in">
      {toast.isLevelUp ? (
        // Level Up Card
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl border-2 border-amber-300">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
              {toast.tier.badge}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                <Trophy className="w-3.5 h-3.5" />
                <span>Level Up Achieved!</span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-0.5 leading-snug">
                Level {toast.tier.level}: {toast.tier.title}
              </h4>
              <p className="text-xs text-amber-100 mt-1 line-clamp-2">
                {toast.tier.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    onViewLeaderboard();
                    onDismiss();
                  }}
                  className="px-3 py-1 bg-white text-amber-900 font-bold text-xs rounded-lg hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
                >
                  View Rank Standings
                </button>
                <span className="text-xs text-amber-200 font-mono">
                  {toast.totalXP.toLocaleString()} Total XP
                </span>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-amber-200 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Standard XP Award Toast
        <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-xl border border-slate-700 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 font-mono">
                  +{toast.points} XP
                </span>
                <span className="text-[11px] text-slate-400">·</span>
                <span className="text-[11px] text-slate-300 font-medium truncate">
                  {toast.actionTitle}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                <span>{toast.tier.badge}</span>
                <span className="font-semibold text-slate-200">
                  Lvl {toast.tier.level}
                </span>
                <span>·</span>
                <span className="font-mono text-amber-400 font-medium">
                  {toast.totalXP.toLocaleString()} XP
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onViewLeaderboard();
                onDismiss();
              }}
              title="View Leaderboard"
              className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
            >
              <Award className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
