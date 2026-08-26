import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Mail, Phone, GraduationCap,
  CheckCircle, XCircle, Briefcase,
} from 'lucide-react';
import type { ScoredCandidate } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  item: ScoredCandidate;
}

export function CandidateCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { candidate, scores, explanation, matched_skills, missing_skills, rank } = item;

  const bandClass =
    scores.final_score >= 70
      ? 'border-l-4 border-green-400 dark:border-green-600'
      : scores.final_score >= 45
        ? 'border-l-4 border-amber-400 dark:border-amber-600'
        : 'border-l-4 border-red-400 dark:border-red-600';

  return (
    <div
      className={`${bandClass} overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        {/* Rank badge */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          #{rank}
        </div>

        {/* Name + file */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-white">
            {candidate.name ?? candidate.filename}
          </p>
          {candidate.name && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {candidate.filename}
            </p>
          )}
        </div>

        {/* Score + toggle */}
        <div className="flex items-center gap-3">
          <ScoreBadge score={scores.final_score} />
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Left col */}
            <div className="space-y-4">
              {/* Contact */}
              <div className="space-y-1.5">
                {candidate.email && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Mail size={12} className="text-slate-400" />
                    <a href={`mailto:${candidate.email}`} className="hover:underline">
                      {candidate.email}
                    </a>
                  </p>
                )}
                {candidate.phone && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Phone size={12} className="text-slate-400" />
                    {candidate.phone}
                  </p>
                )}
                {candidate.years_of_experience !== null && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Briefcase size={12} className="text-slate-400" />
                    {candidate.years_of_experience} years of experience
                  </p>
                )}
              </div>

              {/* Education */}
              {candidate.education.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                    <GraduationCap size={12} />
                    Education
                  </p>
                  <ul className="space-y-1">
                    {candidate.education.map((edu, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300">
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                  Why this rank
                </p>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {explanation}
                </p>
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">
              {/* Score breakdown */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                  Score breakdown
                </p>
                <div className="space-y-2.5">
                  <ScoreBar label="Semantic Similarity" value={scores.semantic_similarity} color="bg-indigo-500" />
                  <ScoreBar label="Skill Overlap" value={scores.skill_overlap} color="bg-violet-500" />
                  <ScoreBar label="Experience Match" value={scores.experience_match} color="bg-sky-500" />
                  <div className="pt-1">
                    <ScoreBar label="Final Score" value={scores.final_score} color="bg-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-500">
                    <CheckCircle size={11} />
                    Matched
                  </p>
                  {matched_skills.length === 0 ? (
                    <p className="text-xs text-slate-400">None</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {matched_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-green-50 px-1.5 py-0.5 text-xs text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
                    <XCircle size={11} />
                    Gaps
                  </p>
                  {missing_skills.length === 0 ? (
                    <p className="text-xs text-slate-400">None</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {missing_skills.slice(0, 8).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-red-50 px-1.5 py-0.5 text-xs text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
