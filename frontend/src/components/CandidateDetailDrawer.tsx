import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Layers,
  Bot,
} from 'lucide-react';
import type { ScoredCandidate } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  candidate: ScoredCandidate | null;
  onClose: () => void;
}

type Tab = 'overview' | 'scores' | 'skills' | 'raw';

export function CandidateDetailDrawer({ candidate, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!candidate) return null;

  const { candidate: info, scores, explanation, matched_skills, missing_skills, rank, llm_critique } = candidate;
  const displayName = info.name || info.filename;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />

      {/* Slide-over Drawer Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        aria-label="Candidate details drawer"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold rounded bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5">
                    Rank #{rank}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {info.filename}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-zinc-100">
                  {displayName}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <ScoreBadge score={scores.final_score} size="lg" showLabel />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Contact Chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {info.email && (
                <a
                  href={`mailto:${info.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:text-white transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{info.email}</span>
                </a>
              )}
              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-zinc-300"
                >
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{info.phone}</span>
                </a>
              )}
              {info.years_of_experience !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 font-mono font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{info.years_of_experience} yrs experience</span>
                </span>
              )}
            </div>

            {/* Tabs Bar */}
            <div className="mt-4 flex gap-1 border-b border-zinc-800 pb-1">
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
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* LLM Qualitative Critique if available */}
                {llm_critique && (
                  <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-indigo-300">
                        <Bot className="h-4 w-4 text-indigo-400" />
                        <span>AI Recruiter Executive Critique (LLM)</span>
                      </div>
                      <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                        Model Generated
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-200 whitespace-pre-line font-sans">
                      {llm_critique}
                    </p>
                  </div>
                )}

                {/* Deterministic Score Rationale */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-zinc-300 font-mono">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span>Deterministic Match Rationale</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Math Grounded</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {explanation}
                  </p>
                </div>

                {/* Sub-score Summary */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Sub-Score Performance Breakdown
                  </h4>
                  <div className="space-y-2.5">
                    <ScoreBar
                      label="Semantic Similarity (MiniLM-L6-v2)"
                      value={scores.semantic_similarity}
                      weight="45%"
                      color="bg-indigo-500"
                    />
                    <ScoreBar
                      label="Exact Skill Overlap (Jaccard Match)"
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
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-indigo-400" />
                      Education Background
                    </h4>
                    <div className="space-y-1">
                      {info.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-zinc-300 font-mono"
                        >
                          • {edu}
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
                className="space-y-4 text-xs text-zinc-300"
              >
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    Evaluation Formula
                  </h4>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-indigo-300 font-mono text-[11px] leading-relaxed">
                    Final = (0.45 × Semantic) + (0.35 × Skills) + (0.20 × Experience)
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Semantic: 0.45 × {scores.semantic_similarity}</span>
                      <span className="font-mono font-bold text-zinc-100">
                        {(0.45 * scores.semantic_similarity).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Skills: 0.35 × {scores.skill_overlap}</span>
                      <span className="font-mono font-bold text-zinc-100">
                        {(0.35 * scores.skill_overlap).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Experience: 0.20 × {scores.experience_match}</span>
                      <span className="font-mono font-bold text-zinc-100">
                        {(0.20 * scores.experience_match).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-indigo-400 text-sm">
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
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Matched Skills ({matched_skills.length})
                    </h4>
                  </div>
                  {matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-medium text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      No direct skill matches found in resume text.
                    </p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-mono font-bold uppercase text-rose-400 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      Missing Required Skills ({missing_skills.length})
                    </h4>
                  </div>
                  {missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-xs font-mono font-medium text-rose-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-medium">
                      ✓ 100% of target JD skills are present!
                    </p>
                  )}
                </div>

                {/* All Extracted Skills */}
                {info.skills.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                    <h4 className="font-mono font-bold uppercase text-zinc-400 text-xs flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      All Skills Extracted from Resume ({info.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {info.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'raw' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Extracted Document Source</span>
                  <span>{info.raw_text.length} characters</span>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {info.raw_text || 'No raw text available.'}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
