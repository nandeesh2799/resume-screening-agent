import { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Trophy, Check, ArrowRight, Zap, Palette, ChevronDown } from 'lucide-react';
import { useAmbience, AMBIENCE_OPTIONS } from '../hooks/useAmbience';

interface Props {
  step: number;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export function Header({ step, onStepClick, canNavigateToStep }: Props) {
  const { ambience, setAmbience } = useAmbience();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const steps = [
    { num: 1 as const, label: 'Role Spec', icon: FileText },
    { num: 2 as const, label: 'Upload Batch', icon: Upload },
    { num: 3 as const, label: 'Ranked Shortlist', icon: Trophy },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = AMBIENCE_OPTIONS.find((o) => o.id === ambience) || AMBIENCE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050814]/80 backdrop-blur-2xl transition-all">
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

        {/* Ambience Switcher & Status */}
        <div className="flex items-center gap-2.5">
          {/* Ambience Theme Picker Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <Palette className="h-3.5 w-3.5 text-indigo-400" />
              <span
                className="h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]"
                style={{ backgroundColor: activeOption.dotColor }}
              />
              <span className="hidden sm:inline">{activeOption.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel p-2 shadow-2xl border border-white/[0.1] bg-[#0c101c]/95 z-50 space-y-1">
                <span className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase text-slate-400 block">
                  Background Ambience
                </span>
                {AMBIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setAmbience(opt.id);
                      setIsOpen(false);
                    }}
                    className={[
                      'w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer text-left',
                      ambience === opt.id
                        ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: opt.dotColor }}
                      />
                      <span>{opt.name}</span>
                    </div>
                    {ambience === opt.id && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Engine:</span>
            <span className="text-indigo-300 font-mono text-[10px]">all-MiniLM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
