interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

export function ScoreBadge({ score, size = 'sm' }: Props) {
  const color =
    score >= 70
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 ring-green-200 dark:ring-green-800'
      : score >= 45
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-200 dark:ring-amber-800'
        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-red-200 dark:ring-red-800';

  const cls =
    size === 'lg'
      ? 'text-2xl font-bold px-3 py-1 rounded-xl ring-1'
      : 'text-xs font-semibold px-2 py-0.5 rounded-md ring-1';

  return <span className={`${color} ${cls} tabular-nums`}>{score.toFixed(0)}</span>;
}
