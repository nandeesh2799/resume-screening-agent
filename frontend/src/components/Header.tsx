import { Moon, Sun, FileSearch } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface Props {
  step: number;
}

const steps = ['Job Description', 'Upload Resumes', 'Results'];

export function Header({ step }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <FileSearch size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            ResumeRank
          </span>
        </div>

        {/* Step indicator */}
        <nav className="hidden items-center gap-1 sm:flex">
          {steps.map((label, i) => {
            const idx = i + 1;
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <div key={label} className="flex items-center gap-1">
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  ].join(' ')}
                >
                  {isDone ? '✓' : idx}
                </span>
                <span
                  className={[
                    'text-xs font-medium',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400',
                  ].join(' ')}
                >
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <span className="mx-2 text-slate-300 dark:text-slate-700">›</span>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
