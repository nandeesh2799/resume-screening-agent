import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type { ScoredCandidate } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  candidate: ScoredCandidate | null;
  onClose: () => void;
}

type TabType = 'overview' | 'scores' | 'skills' | 'raw';

export function CandidateDetailDrawer({ candidate, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);

  if (!candidate) return null;

  const { candidate: info, scores, rank, explanation, matched_skills, missing_skills } = candidate;
  const displayName = info.name || info.filename;

  const handleCopySummary = () => {
    const text = `Candidate Evaluation: ${displayName} (#Rank ${rank})
Score: ${scores.final_score}/100
Semantic Match: ${scores.semantic_similarity}/100 | Skill Overlap: ${scores.skill_overlap}/100 | Experience Match: ${scores.experience_match}/100
Experience: ${info.years_of_experience ?? 'N/A'} yrs
Matched Skills: ${matched_skills.join(', ') || 'None'}
Skill Gaps: ${missing_skills.join(', ') || 'None'}

Rationale:
${explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-xl glass-panel border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg border border-indigo-500/20">
                  #{rank}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {displayName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-xs">
                    {info.filename}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ScoreBadge score={scores.final_score} size="lg" showLabel />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Contact Chips */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {info.email && (
                <a
                  href={`mailto:${info.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{info.email}</span>
                </a>
              )}
              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-300"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{info.phone}</span>
                </a>
              )}
              {info.years_of_experience !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 font-semibold">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{info.years_of_experience} yrs experience</span>
                </span>
              )}
            </div>

            {/* Tabs Bar */}
            <div className="mt-5 flex gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-1">
              {[
                { id: 'overview' as const, label: 'Overview' },
                { id: 'scores' as const, label: 'Score Math' },
                { id: 'skills' as const, label: `Skills (${matched_skills.length})` },
                { id: 'raw' as const, label: 'Raw Resume' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* AI Rationale Card */}
                <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                    Hiring Agent Verdict
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {explanation}
                  </p>
                </div>

                {/* Score Quick Glance */}
                <div className="rounded-2xl glass-card p-4 space-y-3 border border-slate-200/80 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sub-Score Performance
                  </h4>
                  <div className="space-y-3">
                    <ScoreBar
                      label="Semantic Similarity (Dense Embeddings)"
                      value={scores.semantic_similarity}
                      weight="45%"
                      color="bg-indigo-500"
                    />
                    <ScoreBar
                      label="Skill Overlap (Jaccard Match)"
                      value={scores.skill_overlap}
                      weight="35%"
                      color="bg-violet-500"
                    />
                    <ScoreBar
                      label="Experience Match"
                      value={scores.experience_match}
                      weight="20%"
                      color="bg-sky-500"
                    />
                  </div>
                </div>

                {/* Education */}
                {info.education.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      Education Background
                    </h4>
                    <div className="space-y-1.5">
                      {info.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800"
                        >
                          {edu}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'scores' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-xs text-slate-600 dark:text-slate-400"
              >
                <div className="rounded-2xl glass-card p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Weighting Formula
                  </h4>
                  <div className="rounded-xl bg-slate-950 p-3 text-indigo-300 font-mono text-[11px] leading-relaxed">
                    Final = (0.45 × Semantic) + (0.35 × Skills) + (0.20 × Experience)
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                      <span>Semantic: 0.45 × {scores.semantic_similarity}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(0.45 * scores.semantic_similarity).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                      <span>Skills: 0.35 × {scores.skill_overlap}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(0.35 * scores.skill_overlap).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                      <span>Experience: 0.20 × {scores.experience_match}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(0.20 * scores.experience_match).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      <span>Final Composite Score</span>
                      <span>{scores.final_score.toFixed(1)} / 100</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Matched Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Matched Skills ({matched_skills.length})
                    </span>
                  </div>
                  {matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matched_skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                        >
                          <Check className="h-3 w-3" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No overlapping skills detected.</p>
                  )}
                </div>

                {/* Skill Gaps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-500 dark:text-rose-400">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      Skill Gaps in JD ({missing_skills.length})
                    </span>
                  </div>
                  {missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {missing_skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300"
                        >
                          <X className="h-3 w-3" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-500 font-medium">
                      ✓ No missing skill requirements! Perfect coverage.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'raw' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Extracted Text View
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {info.raw_text.length} characters
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text scrollbar-thin">
                  {info.raw_text || 'No raw text available.'}
                </div>
              </motion.div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow transition-transform hover:scale-105 active:scale-95"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied Evaluation!' : 'Copy Summary for Recruiter'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
