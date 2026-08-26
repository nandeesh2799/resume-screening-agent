import { useState, useEffect } from 'react';

export type AmbienceTheme = 'aurora' | 'cyberpunk' | 'emerald' | 'stealth' | 'sunset';

export interface AmbienceOption {
  id: AmbienceTheme;
  name: string;
  dotColor: string;
  gradient: string;
}

export const AMBIENCE_OPTIONS: AmbienceOption[] = [
  {
    id: 'aurora',
    name: 'Cosmic Aurora',
    dotColor: '#6366f1',
    gradient: 'from-indigo-600 via-purple-600 to-cyan-500',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    dotColor: '#ec4899',
    gradient: 'from-pink-600 via-purple-600 to-cyan-400',
  },
  {
    id: 'emerald',
    name: 'Deep Emerald',
    dotColor: '#10b981',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
  },
  {
    id: 'sunset',
    name: 'Sunset Nebula',
    dotColor: '#f97316',
    gradient: 'from-orange-500 via-rose-600 to-purple-600',
  },
  {
    id: 'stealth',
    name: 'Stealth Carbon',
    dotColor: '#64748b',
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
  },
];

export function useAmbience() {
  const [ambience, setAmbience] = useState<AmbienceTheme>(() => {
    const saved = localStorage.getItem('resumerank_ambience') as AmbienceTheme | null;
    return saved && AMBIENCE_OPTIONS.some((o) => o.id === saved) ? saved : 'aurora';
  });

  useEffect(() => {
    // Remove old theme classes
    AMBIENCE_OPTIONS.forEach((o) => {
      document.body.classList.remove(`theme-${o.id}`);
    });
    // Add current theme class
    document.body.classList.add(`theme-${ambience}`);
    localStorage.setItem('resumerank_ambience', ambience);
  }, [ambience]);

  return { ambience, setAmbience, options: AMBIENCE_OPTIONS };
}
