import { FileText, Upload, Trophy, Check, ArrowRight, Zap } from 'lucide-react';

interface Props {
  step: number;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export function Header({ step, onStepClick, canNavigateToStep }: Props) {
  const steps = [
    { num: 1 as const, label: 'Role Spec', icon: FileText },
    { num: 2 as const, label: 'Upload Batch', icon: Upload },
    { num: 3 as const, label: 'Ranked Shortlist', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080b11]/80 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 p-0.5 shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c101c]">
              <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400/30 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">
                ResumeRank
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                AI Agent
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
              Neural Semantic Screening & Talent Ranking
            </p>
          </div>
        </div>

        {/* Steps Navigation Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-2xl bg-slate-900/80 p-1 border border-white/[0.06] shadow-inner">
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
                    'group flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)] ring-1 ring-indigo-400/50'
                      : isDone
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.05] cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed opacity-60',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-black transition-all',
                      isActive
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/[0.05] text-slate-500',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-3 w-3 text-emerald-400 stroke-[3]" /> : s.num}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{s.label}</span>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="mx-1 h-3 w-3 text-slate-700" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Live Engine Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Model:</span>
            <span className="text-indigo-300 font-mono text-[10px]">all-MiniLM-L6-v2</span>
          </div>
        </div>
      </div>
    </header>
  );
}
