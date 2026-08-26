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
  Star,
  X,
  Clock,
  Edit3,
} from 'lucide-react';
import type { ScoredCandidate, PipelineStage } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { ScoreBar } from './ScoreBar';

interface Props {
  item: ScoredCandidate;
  onOpenDetail: (candidate: ScoredCandidate) => void;
  isSelected?: boolean;
  onToggleSelect?: (candidate: ScoredCandidate) => void;
  onUpdateStage?: (candidate: ScoredCandidate, stage: PipelineStage) => void;
  onUpdateNotes?: (candidate: ScoredCandidate, notes: string) => void;
  minExpFilter?: number;
  mandatorySkills?: string[];
}

export function CandidateCard({
  item,
  onOpenDetail,
  isSelected,
  onToggleSelect,
  onUpdateStage,
  onUpdateNotes,
  minExpFilter = 0,
  mandatorySkills = [],
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(item.recruiterNotes || '');

  const { candidate, scores, explanation, matched_skills, missing_skills, rank } = item;
  const displayName = candidate.name || candidate.filename;
  const stage = item.pipelineStage || 'review';

  // Dealbreaker Knockout checks
  const failsExp = minExpFilter > 0 && (candidate.years_of_experience === null || candidate.years_of_experience < minExpFilter);
  const missingMandatory = mandatorySkills.filter((s) => !matched_skills.includes(s));
  const hasDisqualification = failsExp || missingMandatory.length > 0;

  const handleSaveNotes = () => {
    onUpdateNotes?.(item, noteText);
    setEditingNotes(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'group relative overflow-hidden rounded-xl app-card transition-all duration-150',
        isSelected ? 'app-card-active' : '',
        stage === 'shortlisted' ? 'border-l-4 border-l-emerald-500' : '',
        stage === 'rejected' ? 'opacity-60 border-l-4 border-l-rose-500' : '',
      ].join(' ')}
    >
      {/* Top Main Bar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Checkbox + Rank + Candidate Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item)}
              aria-label={`Select ${displayName}`}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          )}

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-mono font-bold text-zinc-300 border border-zinc-700">
            #{rank}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-zinc-100 truncate">
                {displayName}
              </h3>
              {candidate.years_of_experience !== null && (
                <span className="text-[11px] font-mono rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-400 border border-zinc-700">
                  {candidate.years_of_experience} yrs
                </span>
              )}

              {/* Pipeline Stage Badge */}
              {stage === 'shortlisted' && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Star className="h-3 w-3 fill-emerald-400" /> Shortlisted
                </span>
              )}
              {stage === 'rejected' && (
                <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                  <X className="h-3 w-3" /> Rejected
                </span>
              )}

              {/* Dealbreaker Badge */}
              {hasDisqualification && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  ⚠ Dealbreaker Gap
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-zinc-400 font-mono text-[11px]">
              <span className="truncate max-w-xs text-zinc-500">
                {candidate.filename}
              </span>
              {candidate.email && (
                <span className="hidden md:inline-flex items-center gap-1 text-zinc-400">
                  <Mail className="h-3 w-3 text-zinc-600" />
                  {candidate.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Pipeline Actions + Score Badge */}
        <div className="flex items-center gap-3">
          {/* Quick Pipeline Status Buttons */}
          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              type="button"
              title="Shortlist for interview"
              onClick={() => onUpdateStage?.(item, stage === 'shortlisted' ? 'review' : 'shortlisted')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                stage === 'shortlisted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <Star className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Keep in review"
              onClick={() => onUpdateStage?.(item, 'review')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                stage === 'review'
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Reject candidate"
              onClick={() => onUpdateStage?.(item, stage === 'rejected' ? 'review' : 'rejected')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                stage === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <ScoreBadge score={scores.final_score} size="md" showLabel />

          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
          >
            <span>Profile</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Skills Summary Chips */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-mono uppercase text-zinc-500 mr-1">Skills:</span>
        {matched_skills.slice(0, 6).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
          >
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
            {s}
          </span>
        ))}
        {matched_skills.length > 6 && (
          <span className="text-[10px] text-zinc-500 font-mono">
            +{matched_skills.length - 6} more
          </span>
        )}

        {missing_skills.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <XCircle className="h-3 w-3 text-rose-500" />
            {missing_skills.length} missing skill{missing_skills.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Recruiter Notes Preview if present */}
      {item.recruiterNotes && !expanded && (
        <div className="px-4 pb-3 text-xs text-indigo-300 flex items-center gap-1.5 font-mono">
          <Edit3 className="h-3 w-3 text-indigo-400" />
          <span className="truncate">Note: {item.recruiterNotes}</span>
        </div>
      )}

      {/* Expanded Accordion Body */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-zinc-800/80 bg-zinc-950/60 p-4 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Recruiter Rationale & Education */}
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 space-y-1">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                  Evaluation Rationale
                </span>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {explanation}
                </p>
              </div>

              {candidate.education.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-zinc-400 font-mono">
                  <GraduationCap className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{candidate.education.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Right: Sub-Score Bars */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-400">
                Evaluation Weights Breakdown
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

          {/* Recruiter Internal Notes Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                Recruiter Internal Notes
              </span>
              {!editingNotes && (
                <button
                  type="button"
                  onClick={() => setEditingNotes(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  {item.recruiterNotes ? 'Edit Note' : '+ Add Note'}
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Spoke with candidate, strong technical depth in PostgreSQL, schedule first round technical interview."
                  rows={2}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-700 p-2 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-sans"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNotes(false)}
                    className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : item.recruiterNotes ? (
              <p className="text-xs text-zinc-300 font-sans">{item.recruiterNotes}</p>
            ) : (
              <p className="text-xs text-zinc-500 italic">No notes added yet for this candidate.</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
