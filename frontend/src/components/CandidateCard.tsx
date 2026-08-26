import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Crown,
  Medal,
  Award,
} from 'lucide-react';
import type { ScoredCandidate } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  item: ScoredCandidate;
  onOpenDetail: (candidate: ScoredCandidate) => void;
  isSelected?: boolean;
  onToggleSelect?: (candidate: ScoredCandidate) => void;
}

export function CandidateCard({ item, onOpenDetail, isSelected, onToggleSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { candidate, scores, explanation, matched_skills, missing_skills, rank } = item;
  const displayName = candidate.name || candidate.filename;

  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/30 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]">
          <Crown className="h-5 w-5 fill-amber-400/20" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-300/15 text-slate-200 border border-slate-300/30 shadow-[0_0_10px_rgba(203,213,225,0.2)]">
          <Medal className="h-5 w-5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-700/20 text-amber-400 border border-amber-700/40">
          <Award className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-xs font-black text-slate-400 border border-white/[0.08]">
        #{rank}
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'group relative overflow-hidden rounded-2xl glass-card transition-all duration-200 border shadow-md',
        isSelected
          ? 'border-indigo-500/80 bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]'
          : 'border-white/[0.06] hover:border-white/[0.16] hover:bg-slate-900/70',
      ].join(' ')}
    >
      {/* Top Main Row */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Checkbox + Rank + Candidate Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item)}
              aria-label={`Select ${displayName} for comparison`}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}

          {getRankBadge()}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-indigo-300 transition-colors">
                {displayName}
              </h3>
              {candidate.years_of_experience !== null && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-slate-300 font-mono">
                  {candidate.years_of_experience} yrs exp
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="font-mono text-[11px] truncate max-w-xs text-slate-500">
                {candidate.filename}
              </span>
              {candidate.email && (
                <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
                  <Mail className="h-3 w-3 text-slate-500" />
                  {candidate.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Scores + Actions */}
        <div className="flex items-center gap-3">
          <ScoreBadge score={scores.final_score} size="md" showLabel />

          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
          >
            <span>Deep Dive</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Skills Pill Summary Bar */}
      <div className="px-5 pb-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 font-mono">
          Skills:
        </span>
        {matched_skills.slice(0, 5).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300"
          >
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
            {s}
          </span>
        ))}
        {matched_skills.length > 5 && (
          <span className="text-[10px] text-slate-500 font-mono font-medium">
            +{matched_skills.length - 5} more
          </span>
        )}

        {missing_skills.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <XCircle className="h-3 w-3" />
            {missing_skills.length} missing skill{missing_skills.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Expanded Accordion Body */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/[0.06] bg-black/40 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: AI explanation */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Score Rationale
                </span>
                <p className="text-xs leading-relaxed text-slate-200 font-medium">
                  {explanation}
                </p>
              </div>

              {candidate.education.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <GraduationCap className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{candidate.education.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Right: Sub-scores */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Multi-Factor Breakdown
              </span>
              <ScoreBar
                label="Semantic Similarity"
                value={scores.semantic_similarity}
                weight="45%"
                color="bg-indigo-500"
              />
              <ScoreBar
                label="Skill Overlap"
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

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => onOpenDetail(item)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Open Full Interactive Profile & Raw Text →
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
