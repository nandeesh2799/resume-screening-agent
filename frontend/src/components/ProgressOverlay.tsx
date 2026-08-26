interface Props {
  current: number;
  total: number;
  filename: string;
}

export function ProgressOverlay({ current, total, filename }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40">
            <svg
              className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Analysing resumes…
          </p>
          <p className="mt-1 truncate px-4 text-xs text-slate-500 dark:text-slate-400">
            {filename}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>{current} of {total}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
