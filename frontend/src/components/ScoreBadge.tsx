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
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-300',
        border: 'border-emerald-500/40',
        dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
        glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
      }
    : isMid
      ? {
          label: 'Moderate Fit',
          bg: 'bg-amber-500/15',
          text: 'text-amber-300',
          border: 'border-amber-500/40',
          dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
          glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
        }
      : {
          label: 'Skill Gap',
          bg: 'bg-rose-500/15',
          text: 'text-rose-300',
          border: 'border-rose-500/40',
          dot: 'bg-rose-400 shadow-[0_0_8px_#f87171]',
          glow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]',
        };

  if (size === 'lg') {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl border ${band.border} ${band.bg} px-4 py-2.5 shadow-lg ${band.glow} backdrop-blur-md`}
      >
        <div className="flex flex-col">
          <span className={`text-2xl font-black tracking-tight ${band.text} tabular-nums`}>
            {score.toFixed(0)}
            <span className="text-xs font-semibold opacity-60">/100</span>
          </span>
          {showLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
        className={`inline-flex items-center gap-2 rounded-xl border ${band.border} ${band.bg} px-3 py-1.5 shadow-sm ${band.glow} backdrop-blur-md`}
      >
        <span className={`h-2 w-2 rounded-full ${band.dot}`}></span>
        <span className={`text-sm font-black ${band.text} tabular-nums`}>
          {score.toFixed(0)}
        </span>
        {showLabel && (
          <span className="text-[11px] font-semibold opacity-85 border-l border-white/[0.1] pl-2 text-slate-300">
            {band.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${band.border} ${band.bg} px-2.5 py-1 text-xs font-bold ${band.text} tabular-nums shadow-sm ${band.glow} backdrop-blur-sm`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${band.dot}`}></span>
      {score.toFixed(0)}
      {showLabel && <span className="font-medium opacity-85 text-[10px] ml-0.5">{band.label}</span>}
    </span>
  );
}
