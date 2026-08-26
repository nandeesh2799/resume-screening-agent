import { motion } from 'framer-motion';
import { X, Trophy, CheckCircle2, XCircle, Briefcase, GraduationCap } from 'lucide-react';
import type { ScoredCandidate } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  candidates: ScoredCandidate[];
  onClose: () => void;
}

export function CandidateComparisonModal({ candidates, onClose }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-5xl glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 my-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Side-by-Side Candidate Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {candidates.length} shortlisted candidates against target criteria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Head to Head Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c) => {
            const displayName = c.candidate.name || c.candidate.filename;
            return (
              <div
                key={c.candidate.filename}
                className="rounded-2xl glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-5 flex flex-col justify-between"
              >
                {/* Profile Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-black text-indigo-600 dark:text-indigo-400">
                      #{c.rank}
                    </span>
                    <ScoreBadge score={c.scores.final_score} size="md" showLabel />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{c.candidate.filename}</p>
                  </div>

                  {/* Experience & Contact */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{c.candidate.years_of_experience ?? 'N/A'} yrs experience</span>
                    </div>
                    {c.candidate.education.length > 0 && (
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{c.candidate.education[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Sub-Score Bars */}
                  <div className="space-y-2.5 pt-1">
                    <ScoreBar
                      label="Semantic Match"
                      value={c.scores.semantic_similarity}
                      color="bg-indigo-500"
                    />
                    <ScoreBar
                      label="Skill Overlap"
                      value={c.scores.skill_overlap}
                      color="bg-violet-500"
                    />
                    <ScoreBar
                      label="Experience Match"
                      value={c.scores.experience_match}
                      color="bg-sky-500"
                    />
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Matched ({c.matched_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {c.matched_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1 mb-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      Gaps ({c.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {c.missing_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            Done Comparing
          </button>
        </div>
      </motion.div>
    </div>
  );
}
