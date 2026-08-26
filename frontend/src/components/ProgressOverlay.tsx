import { motion } from 'framer-motion';
import { Sparkles, FileText, Cpu } from 'lucide-react';

interface Props {
  current: number;
  total: number;
  filename: string;
}

export function ProgressOverlay({ current, total, filename }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-indigo-500/20 text-center space-y-6 relative overflow-hidden"
      >
        {/* Glowing background aura */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"></div>

        {/* Animated Radar Pulse Core */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-spin" style={{ animationDuration: '6s' }}></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Cpu className="h-3.5 w-3.5 animate-spin" />
            <span>AI Multi-Pass Screening Active</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Analysing Candidate Resumes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Extracting text, computing dense embeddings, and scoring skill taxonomy
          </p>
        </div>

        {/* Current File Being Processed */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 p-3 border border-slate-200/60 dark:border-slate-800 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Processing File {current} of {total}
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {filename || 'Initialising candidate parser...'}
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {pct}%
          </span>
        </div>

        {/* Smooth Animated Progress Bar */}
        <div className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800 p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Semantic Embeddings (all-MiniLM)</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {current} / {total} Completed
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
