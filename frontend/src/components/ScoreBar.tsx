interface Props {
  label: string;
  value: number;
  weight?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function ScoreBar({ label, value, weight, color = 'bg-indigo-500', icon }: Props) {
  const safeValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          {icon}
          <span>{label}</span>
          {weight && (
            <span className="text-[10px] rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-slate-400 font-mono font-normal">
              {weight}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 font-bold tabular-nums text-white">
          <span>{safeValue.toFixed(0)}</span>
          <span className="text-[10px] text-slate-400 font-normal">/100</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/90 border border-white/[0.06] p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color} shadow-[0_0_10px_currentColor]`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
