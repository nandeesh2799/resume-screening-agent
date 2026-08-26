interface Props {
  score: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'sm', showLabel = false }: Props) {
  const isHigh = score >= 75;
  const isMid = score >= 50 && score < 75;

  const band = isHigh
    ? {
        label: 'Strong Fit',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30 dark:border-emerald-500/40',
        dot: 'bg-emerald-500',
        glow: 'shadow-emerald-500/10',
      }
    : isMid
      ? {
          label: 'Moderate Fit',
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30 dark:border-amber-500/40',
          dot: 'bg-amber-500',
          glow: 'shadow-amber-500/10',
        }
      : {
          label: 'Skill Gap',
          bg: 'bg-rose-500/10 dark:bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-500/30 dark:border-rose-500/40',
          dot: 'bg-rose-500',
          glow: 'shadow-rose-500/10',
        };

  if (size === 'lg') {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl border ${band.border} ${band.bg} px-4 py-2.5 shadow-lg ${band.glow}`}
      >
        <div className="flex flex-col">
          <span className={`text-2xl font-black tracking-tight ${band.text} tabular-nums`}>
            {score.toFixed(0)}
            <span className="text-xs font-semibold opacity-60">/100</span>
          </span>
          {showLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {band.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-xl border ${band.border} ${band.bg} px-3 py-1.5 shadow-sm ${band.glow}`}
      >
        <span className={`h-2 w-2 rounded-full ${band.dot} animate-pulse`}></span>
        <span className={`text-sm font-bold ${band.text} tabular-nums`}>
          {score.toFixed(0)}
        </span>
        {showLabel && (
          <span className="text-[11px] font-medium opacity-80 border-l border-slate-300 dark:border-slate-700 pl-1.5">
            {band.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${band.border} ${band.bg} px-2.5 py-1 text-xs font-bold ${band.text} tabular-nums shadow-sm`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${band.dot}`}></span>
      {score.toFixed(0)}
      {showLabel && <span className="font-normal opacity-80 text-[10px]">{band.label}</span>}
    </span>
  );
}
