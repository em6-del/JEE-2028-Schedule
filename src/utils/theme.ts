import { SubjectType } from '../types';

export interface SubjectTheme {
  name: SubjectType;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  borderLeftColor: string;
  lightBg: string;
  ringColor: string;
}

export const SUBJECT_THEMES: Record<SubjectType, SubjectTheme> = {
  Physics: {
    name: 'Physics',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    borderColor: 'border-sky-200',
    borderLeftColor: 'border-l-sky-500',
    lightBg: 'bg-sky-50/60',
    ringColor: 'ring-sky-500',
  },
  Chemistry: {
    name: 'Chemistry',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    borderColor: 'border-emerald-200',
    borderLeftColor: 'border-l-emerald-500',
    lightBg: 'bg-emerald-50/60',
    ringColor: 'ring-emerald-500',
  },
  Mathematics: {
    name: 'Mathematics',
    accentColor: '#d97706',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-200',
    borderLeftColor: 'border-l-amber-500',
    lightBg: 'bg-amber-50/60',
    ringColor: 'ring-amber-500',
  },
  Revision: {
    name: 'Revision',
    accentColor: '#7c3aed',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    borderColor: 'border-purple-200',
    borderLeftColor: 'border-l-purple-500',
    lightBg: 'bg-purple-50/60',
    ringColor: 'ring-purple-500',
  },
  'Mock/PYQ': {
    name: 'Mock/PYQ',
    accentColor: '#e11d48',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    borderColor: 'border-rose-200',
    borderLeftColor: 'border-l-rose-500',
    lightBg: 'bg-rose-50/60',
    ringColor: 'ring-rose-500',
  },
  School: {
    name: 'School',
    accentColor: '#475569',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
    borderLeftColor: 'border-l-slate-500',
    lightBg: 'bg-slate-50',
    ringColor: 'ring-slate-500',
  },
  Break: {
    name: 'Break',
    accentColor: '#71717a',
    badgeBg: 'bg-zinc-200',
    badgeText: 'text-zinc-700',
    borderColor: 'border-zinc-200',
    borderLeftColor: 'border-l-zinc-400',
    lightBg: 'bg-zinc-50/50',
    ringColor: 'ring-zinc-400',
  },
};
