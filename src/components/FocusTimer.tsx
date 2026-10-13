import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudySlot } from '../types';
import { calculateSlotDurationMinutes, format12Hour } from '../utils/timeHelpers';
import { playCompletionBell } from '../utils/audio';
import { SUBJECT_THEMES } from '../utils/theme';

interface FocusTimerProps {
  slot: StudySlot;
  isOpen: boolean;
  onClose: () => void;
  onCompleteSlot: (slotId: string, minutesSpent: number) => void;
}

export function FocusTimer({
  slot,
  isOpen,
  onClose,
  onCompleteSlot,
}: FocusTimerProps) {
  const initialDuration = calculateSlotDurationMinutes(slot.startTime, slot.endTime);
  const [totalSeconds, setTotalSeconds] = useState(initialDuration * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [isWhiteNoiseOn, setIsWhiteNoiseOn] = useState(false);

  // Web Audio noise generator ref
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const mins = calculateSlotDurationMinutes(slot.startTime, slot.endTime);
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    setIsRunning(true);
    setQuestionsSolved(0);
  }, [slot]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleSessionFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  // Safely stop ambient noise and close audio context without unhandled promise rejections
  const stopNoise = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      noiseSourceRef.current = null;
    }
    if (noiseGainRef.current) {
      try {
        noiseGainRef.current.disconnect();
      } catch {
        // ignore
      }
      noiseGainRef.current = null;
    }
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      if (ctx.state !== 'closed') {
        try {
          ctx.close().catch(() => {});
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Handle ambient brown noise generator
  useEffect(() => {
    if (!isWhiteNoiseOn) {
      stopNoise();
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // brown noise volume scale
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();

      noiseSourceRef.current = source;
      noiseGainRef.current = gainNode;
    } catch (e) {
      console.warn('Noise generator error', e);
    }

    return () => {
      stopNoise();
    };
  }, [isWhiteNoiseOn, stopNoise]);

  const handleSessionFinished = () => {
    setIsRunning(false);
    playCompletionBell();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleClose = () => {
    stopNoise();
    onClose();
  };

  const handleFinishAndMarkDone = () => {
    stopNoise();
    handleSessionFinished();
    const elapsedMinutes = Math.max(
      1,
      Math.round((totalSeconds - remainingSeconds) / 60)
    );
    onCompleteSlot(slot.id, elapsedMinutes);
    onClose();
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progress =
    totalSeconds > 0
      ? Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  if (!isOpen) return null;

  const theme = SUBJECT_THEMES[slot.subject] || SUBJECT_THEMES.Physics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 text-white relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Subject Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span
              className="px-2.5 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: `${theme.accentColor}25`, color: theme.accentColor }}
            >
              {slot.subject}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{slot.category}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white max-w-sm">
            {slot.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
          </p>
        </div>

        {/* Circular / Large Timer Display */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="w-56 h-56 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative shadow-inner bg-slate-900/60">
            {/* Progress ring accent indicator */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke={theme.accentColor}
                strokeWidth="4"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-500 ease-linear"
                fill="transparent"
              />
            </svg>

            <div className="text-4xl font-extrabold tracking-tight font-mono text-white">
              {formatTime(remainingSeconds)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
              {isRunning ? 'Focus Mode Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Problem Counter during session */}
        <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between mb-6">
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-200">
              Problems Solved This Session
            </div>
            <div className="text-[11px] text-slate-400">
              Target speed: ~2.5 - 3 mins per JEE question
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuestionsSolved((q) => Math.max(0, q - 1))}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200 font-bold"
            >
              -
            </button>
            <span className="text-lg font-bold font-mono px-2 text-amber-400">
              {questionsSolved}
            </span>
            <button
              onClick={() => setQuestionsSolved((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 flex items-center justify-center text-white font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setRemainingSeconds((s) => s + 300)}
            title="Add 5 minutes"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
          >
            <Plus className="w-4 h-4" /> 5m
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg hover:scale-102"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setRemainingSeconds(totalSeconds);
            }}
            title="Reset timer"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Brown / Ambient noise toggle */}
          <button
            onClick={() => setIsWhiteNoiseOn(!isWhiteNoiseOn)}
            title={isWhiteNoiseOn ? 'Turn off focus sound' : 'Turn on ambient brown noise'}
            className={`p-3 rounded-xl transition-colors flex items-center gap-1 text-xs ${
              isWhiteNoiseOn
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            {isWhiteNoiseOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Focus Sound</span>
          </button>
        </div>

        {/* Finish & Mark Complete */}
        <button
          onClick={handleFinishAndMarkDone}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          Finish Study Session & Mark Slot Completed
        </button>
      </div>
    </div>
  );
}
