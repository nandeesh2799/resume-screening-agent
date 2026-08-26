interface Props {
  label: string;
  value: number;
  color?: string;
}

export function ScoreBar({ label, value, color = 'bg-indigo-500' }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
          {value.toFixed(0)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
