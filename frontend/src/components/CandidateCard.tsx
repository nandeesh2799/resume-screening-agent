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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm shadow-amber-500/20">
          <Crown className="h-5 w-5" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-300/20 text-slate-400 border border-slate-400/30">
          <Medal className="h-5 w-5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700/10 text-amber-700 dark:text-amber-600 border border-amber-700/30">
          <Award className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
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
        'group relative overflow-hidden rounded-2xl glass-card transition-all duration-200 border shadow-sm',
        isSelected
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-indigo-500/10'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700',
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
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}

          {getRankBadge()}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {displayName}
              </h3>
              {candidate.years_of_experience !== null && (
                <span className="hidden sm:inline-flex text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold text-slate-600 dark:text-slate-300">
                  {candidate.years_of_experience} yrs exp
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-[11px] truncate max-w-xs opacity-80">
                {candidate.filename}
              </span>
              {candidate.email && (
                <span className="hidden md:inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
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
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer"
          >
            <span>Deep Dive</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Skills Pill Summary Bar */}
      <div className="px-5 pb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          Skills:
        </span>
        {matched_skills.slice(0, 5).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            {s}
          </span>
        ))}
        {matched_skills.length > 5 && (
          <span className="text-[10px] text-slate-400 font-medium">
            +{matched_skills.length - 5} more
          </span>
        )}

        {missing_skills.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
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
          className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: AI explanation */}
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40 p-3.5 space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Score Rationale
                </span>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {explanation}
                </p>
              </div>

              {candidate.education.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{candidate.education.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Right: Sub-scores */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Score Weighting Breakdown
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
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Full Interactive Profile & Raw Text →
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
