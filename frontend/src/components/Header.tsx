import { FileText, Upload, Trophy, Check, ArrowRight, Zap } from 'lucide-react';

interface Props {
  step: number;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export function Header({ step, onStepClick, canNavigateToStep }: Props) {
  const steps = [
    { num: 1 as const, label: '1. Role Spec', icon: FileText },
    { num: 2 as const, label: '2. Batch Upload', icon: Upload },
    { num: 3 as const, label: '3. Candidate Shortlist', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md">
      <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm">
            <Zap className="h-4 w-4 fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-zinc-100">
              ResumeRank
            </span>
            <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              v1.0
            </span>
          </div>
        </div>

        {/* Steps Navigation Breadcrumbs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800">
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
                    'flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                      : isDone
                        ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/50 cursor-pointer'
                        : 'text-zinc-600 cursor-not-allowed',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-4.5 w-4.5 items-center justify-center rounded text-[10px] font-mono font-bold',
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-500',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-3 w-3 text-emerald-400 stroke-[3]" /> : s.num}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                    <span>{s.label}</span>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="mx-1 h-3 w-3 text-zinc-700" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Model Indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-400">Model:</span>
          <span className="text-zinc-200 font-mono text-[11px]">all-MiniLM-L6-v2</span>
        </div>
      </div>
    </header>
  );
}
