import { Moon, Sun, Sparkles, FileText, Upload, Trophy, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface Props {
  step: number;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export function Header({ step, onStepClick, canNavigateToStep }: Props) {
  const { theme, toggle } = useTheme();

  const steps = [
    { num: 1 as const, label: 'Job Spec', icon: FileText, desc: 'Define requirements' },
    { num: 2 as const, label: 'Batch Upload', icon: Upload, desc: 'Mixed PDF/DOCX/TXT' },
    { num: 3 as const, label: 'AI Shortlist', icon: Trophy, desc: 'Ranked candidates' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/75 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
            <div className="absolute -inset-0.5 rounded-xl bg-indigo-500 opacity-20 blur-sm"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                ResumeRank
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                AI Agent
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">
              NLP Semantic Matching & Candidate Shortlisting
            </p>
          </div>
        </div>

        {/* Interactive Steps Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2">
          {steps.map((s, idx) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            const isClickable = canNavigateToStep ? canNavigateToStep(s.num) : isDone;
            const Icon = s.icon;

            return (
              <div key={s.num} className="flex items-center">
                <button
                  type="button"
                  disabled={!isClickable && !isActive}
                  onClick={() => isClickable && onStepClick?.(s.num)}
                  className={[
                    'group relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-500/40'
                      : isDone
                        ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer'
                        : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold transition-all',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                        : isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </span>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3 w-3 opacity-70" />
                      <span>{s.label}</span>
                    </div>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="mx-1 h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Actions & Theme toggle */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            MiniLM-L6-v2 Ready
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
