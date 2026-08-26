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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-5xl rounded-3xl p-6 shadow-2xl border border-white/[0.08] bg-[#0c101c]/95 backdrop-blur-2xl my-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Candidate Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating {candidates.length} shortlisted candidates head-to-head against role criteria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
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
                className="rounded-2xl glass-card p-5 border border-white/[0.08] space-y-5 flex flex-col justify-between"
              >
                {/* Profile Header */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-xs font-black text-indigo-300 border border-indigo-500/30">
                      #{c.rank}
                    </span>
                    <ScoreBadge score={c.scores.final_score} size="md" showLabel />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono truncate">{c.candidate.filename}</p>
                  </div>

                  {/* Experience & Education */}
                  <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{c.candidate.years_of_experience ?? 'N/A'} yrs experience</span>
                    </div>
                    {c.candidate.education.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-500" />
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
                <div className="space-y-3 pt-3 border-t border-white/[0.06] text-xs">
                  <div>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1.5 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Matched ({c.matched_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                      {c.matched_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-400 flex items-center gap-1 mb-1.5 text-[11px]">
                      <XCircle className="h-3.5 w-3.5" />
                      Gaps ({c.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                      {c.missing_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300"
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
        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="glow-btn-primary rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer"
          >
            Done Comparing
          </button>
        </div>
      </motion.div>
    </div>
  );
}
