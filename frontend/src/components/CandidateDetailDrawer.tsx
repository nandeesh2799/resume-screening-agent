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
  Zap,
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-xl border-l border-white/[0.08] bg-[#0c101c]/95 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 font-black text-lg border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
                  #{rank}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {displayName}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-xs">
                    {info.filename}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ScoreBadge score={scores.final_score} size="lg" showLabel />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-slate-300 hover:text-indigo-300 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{info.email}</span>
                </a>
              )}
              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-slate-300"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{info.phone}</span>
                </a>
              )}
              {info.years_of_experience !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 font-semibold">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{info.years_of_experience} yrs experience</span>
                </span>
              )}
            </div>

            {/* Tabs Bar */}
            <div className="mt-6 flex gap-2 border-b border-white/[0.08] pb-1">
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
                    'relative px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]',
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
                {/* Agent Verdict */}
                <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-violet-950/20 to-transparent p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-300">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>Hiring Agent Rationale</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 font-medium">
                    {explanation}
                  </p>
                </div>

                {/* Sub-score Summary */}
                <div className="rounded-3xl glass-card p-5 space-y-3.5 border border-white/[0.08]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Sub-Score Performance
                  </h4>
                  <div className="space-y-3">
                    <ScoreBar
                      label="Semantic Similarity (MiniLM-L6)"
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                      <GraduationCap className="h-4 w-4 text-indigo-400" />
                      Education Background
                    </h4>
                    <div className="space-y-1.5">
                      {info.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-white/[0.03] p-3 text-xs text-slate-300 border border-white/[0.06]"
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
                className="space-y-6 text-xs text-slate-300"
              >
                <div className="rounded-3xl glass-card p-5 space-y-4 border border-white/[0.08]">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    Weighting Calculation
                  </h4>
                  <div className="rounded-2xl bg-black/60 border border-white/[0.08] p-3.5 text-indigo-300 font-mono text-[11px] leading-relaxed">
                    Final = (0.45 × Semantic) + (0.35 × Skills) + (0.20 × Experience)
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between border-b border-white/[0.06] pb-2">
                      <span>Semantic: 0.45 × {scores.semantic_similarity}</span>
                      <span className="font-bold text-white font-mono">
                        {(0.45 * scores.semantic_similarity).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2">
                      <span>Skills: 0.35 × {scores.skill_overlap}</span>
                      <span className="font-bold text-white font-mono">
                        {(0.35 * scores.skill_overlap).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2">
                      <span>Experience: 0.20 × {scores.experience_match}</span>
                      <span className="font-bold text-white font-mono">
                        {(0.20 * scores.experience_match).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 font-black text-indigo-300 text-sm">
                      <span>Final Composite Score</span>
                      <span className="font-mono">{scores.final_score.toFixed(1)} / 100</span>
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
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Matched Target Skills ({matched_skills.length})
                    </span>
                  </div>
                  {matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matched_skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300"
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No overlapping skills detected.</p>
                  )}
                </div>

                {/* Skill Gaps */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
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
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-300"
                        >
                          <X className="h-3 w-3 text-rose-400" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-medium">
                      ✓ No missing skill requirements! Full coverage.
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
                  <span className="text-xs font-bold text-slate-400 font-mono uppercase">
                    Extracted Text Inspector
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {info.raw_text.length} characters
                  </span>
                </div>
                <div className="rounded-2xl bg-black/70 border border-white/[0.08] p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text scrollbar-thin">
                  {info.raw_text || 'No text extracted.'}
                </div>
              </motion.div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopySummary}
              className="glow-btn-primary flex items-center gap-1.5 rounded-2xl px-5 py-3 text-xs font-bold text-white cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied Evaluation!' : 'Copy Summary for Hiring Manager'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/[0.1] px-5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
