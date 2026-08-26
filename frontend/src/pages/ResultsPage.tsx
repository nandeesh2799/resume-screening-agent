import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  Search,
  ArrowUpDown,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  List,
  Star,
  Clock,
  X,
  Sliders,
  Filter,
  Users,
} from 'lucide-react';
import type { ScreeningResult, ScoredCandidate, SortField, SortDir, PipelineStage, ScoringWeights } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { CandidateComparisonModal } from '../components/CandidateComparisonModal';
import { ScoreBadge } from '../components/ScoreBadge';
import { exportCsv, exportJson } from '../utils/api';

interface Props {
  result: ScreeningResult;
  onReset: () => void;
}

type StageTab = 'all' | 'shortlisted' | 'review' | 'rejected';
type ViewMode = 'cards' | 'table';

export function ResultsPage({ result, onReset }: Props) {
  // Recruiter pipeline state
  const [candidates, setCandidates] = useState<ScoredCandidate[]>(() =>
    result.candidates.map((c) => ({ ...c, pipelineStage: 'review' })),
  );

  // Scoring weights state
  const [weights, setWeights] = useState<ScoringWeights>({
    semantic: 45,
    skills: 35,
    experience: 20,
  });
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [stageTab, setStageTab] = useState<StageTab>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [minExpFilter, setMinExpFilter] = useState<number>(0);
  const [mandatorySkills, setMandatorySkills] = useState<string[]>([]);
  const [showKnockoutFilters, setShowKnockoutFilters] = useState(false);

  // Sort & View state
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCandidate, setSelectedCandidate] = useState<ScoredCandidate | null>(null);
  const [compareList, setCompareList] = useState<ScoredCandidate[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  // Dynamic score re-calculation when weight sliders change
  const dynamicCandidates = useMemo(() => {
    const totalWeight = (weights.semantic + weights.skills + weights.experience) || 100;
    const wSem = weights.semantic / totalWeight;
    const wSk = weights.skills / totalWeight;
    const wExp = weights.experience / totalWeight;

    const list = candidates.map((c) => {
      const dynamicFinal = Number(
        (
          wSem * c.scores.semantic_similarity +
          wSk * c.scores.skill_overlap +
          wExp * c.scores.experience_match
        ).toFixed(1),
      );
      return {
        ...c,
        scores: {
          ...c.scores,
          final_score: dynamicFinal,
        },
      };
    });

    // Re-rank
    list.sort((a, b) => b.scores.final_score - a.scores.final_score);
    return list.map((c, idx) => ({ ...c, rank: idx + 1 }));
  }, [candidates, weights]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const total = dynamicCandidates.length;
    const shortlistedCount = dynamicCandidates.filter((c) => c.pipelineStage === 'shortlisted').length;
    const reviewCount = dynamicCandidates.filter((c) => c.pipelineStage === 'review').length;
    const rejectedCount = dynamicCandidates.filter((c) => c.pipelineStage === 'rejected').length;

    const skillCounts: Record<string, number> = {};
    dynamicCandidates.forEach((c) => {
      c.matched_skills.forEach((s) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    return { total, shortlistedCount, reviewCount, rejectedCount, skillCounts };
  }, [dynamicCandidates]);

  const popularSkills = useMemo(() => {
    return Object.entries(stats.skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.skillCounts]);

  // Candidate pipeline update handlers
  const handleUpdateStage = (cand: ScoredCandidate, stage: PipelineStage) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidate.filename === cand.candidate.filename ? { ...c, pipelineStage: stage } : c,
      ),
    );
  };

  const handleUpdateNotes = (cand: ScoredCandidate, notes: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidate.filename === cand.candidate.filename ? { ...c, recruiterNotes: notes } : c,
      ),
    );
  };

  // Filtered & sorted candidates
  const filteredCandidates = useMemo(() => {
    return dynamicCandidates
      .filter((c) => {
        const name = (c.candidate.name || c.candidate.filename).toLowerCase();
        const matchesSearch =
          !search ||
          name.includes(search.toLowerCase()) ||
          c.matched_skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

        const matchesStage =
          stageTab === 'all' ? true : (c.pipelineStage || 'review') === stageTab;

        const matchesSkill = !selectedSkill || c.matched_skills.includes(selectedSkill);

        // Mandatory criteria knockout
        const meetsExp = minExpFilter === 0 || (c.candidate.years_of_experience !== null && c.candidate.years_of_experience >= minExpFilter);
        const meetsMandatory = mandatorySkills.length === 0 || mandatorySkills.every((s) => c.matched_skills.includes(s));

        return matchesSearch && matchesStage && matchesSkill && meetsExp && meetsMandatory;
      })
      .sort((a, b) => {
        let va: number | string, vb: number | string;
        if (sortField === 'name') {
          va = (a.candidate.name || a.candidate.filename).toLowerCase();
          vb = (b.candidate.name || b.candidate.filename).toLowerCase();
        } else if (sortField === 'rank') {
          va = a.rank;
          vb = b.rank;
        } else {
          va = a.scores[sortField];
          vb = b.scores[sortField];
        }

        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [dynamicCandidates, search, stageTab, selectedSkill, minExpFilter, mandatorySkills, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleToggleSelectCompare = (cand: ScoredCandidate) => {
    if (compareList.some((c) => c.candidate.filename === cand.candidate.filename)) {
      setCompareList(compareList.filter((c) => c.candidate.filename !== cand.candidate.filename));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 candidates simultaneously.');
        return;
      }
      setCompareList([...compareList, cand]);
    }
  };

  const handleExport = async (type: 'csv' | 'json', shortlistOnly = false) => {
    setExporting(type);
    try {
      const candidatesToExport = shortlistOnly
        ? dynamicCandidates.filter((c) => c.pipelineStage === 'shortlisted')
        : dynamicCandidates;

      const payload = {
        ...result,
        candidates: candidatesToExport,
        total_processed: candidatesToExport.length,
      };

      if (type === 'csv') await exportCsv(payload);
      else await exportJson(payload);
    } catch (e) {
      alert(`Export failed: ${e}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Candidate Shortlist & Pipeline
            </h1>
            <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {stats.total} processed
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ranked candidates scored against role specification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {compareList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              showWeightSliders
                ? 'bg-zinc-800 border-indigo-500 text-indigo-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Tune Weights</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKnockoutFilters(!showKnockoutFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              showKnockoutFilters || minExpFilter > 0 || mandatorySkills.length > 0
                ? 'bg-zinc-800 border-indigo-500 text-indigo-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Knockout Criteria {mandatorySkills.length > 0 ? `(${mandatorySkills.length})` : ''}</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>

          <button
            type="button"
            onClick={() => handleExport('csv', false)}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('json', false)}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Screen</span>
          </button>
        </div>
      </div>

      {/* Dynamic Weight Tuning Sliders Panel */}
      {showWeightSliders && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              Dynamic Weight Adjustment (Live Re-Ranking)
            </span>
            <button
              type="button"
              onClick={() => setWeights({ semantic: 45, skills: 35, experience: 20 })}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-mono"
            >
              Reset to 45 / 35 / 20 Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Semantic Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Semantic Relevance</span>
                <span className="font-mono font-bold text-indigo-400">{weights.semantic}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.semantic}
                onChange={(e) => setWeights({ ...weights, semantic: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Skills Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Exact Skill Overlap</span>
                <span className="font-mono font-bold text-violet-400">{weights.skills}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.skills}
                onChange={(e) => setWeights({ ...weights, skills: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Experience Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Years of Experience</span>
                <span className="font-mono font-bold text-sky-400">{weights.experience}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.experience}
                onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Knockout & Dealbreakers Panel */}
      {showKnockoutFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-400" />
              Mandatory Requirements & Knockout Filters
            </span>
            {(minExpFilter > 0 || mandatorySkills.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setMinExpFilter(0);
                  setMandatorySkills([]);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono"
              >
                Clear Knockout Rules
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Min Exp Filter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-300 font-medium">Minimum Years Experience Filter</span>
                <span className="font-mono font-bold text-zinc-100">
                  {minExpFilter === 0 ? 'Any Experience' : `≥ ${minExpFilter} Years`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={minExpFilter}
                onChange={(e) => setMinExpFilter(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Mandatory Skills Selection */}
            <div className="space-y-1.5 text-xs">
              <span className="text-zinc-300 font-medium">Mandatory Skills (Must-Have):</span>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills.slice(0, 6).map(([skill]) => {
                  const isMandatory = mandatorySkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isMandatory) setMandatorySkills(mandatorySkills.filter((s) => s !== skill));
                        else setMandatorySkills([...mandatorySkills, skill]);
                      }}
                      className={`rounded px-2 py-0.5 text-xs font-mono font-medium transition-colors cursor-pointer border ${
                        isMandatory
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {isMandatory && '✓ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recruiter Pipeline Stage Tabs & Controls */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pipeline Stage Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setStageTab('all')}
              className={`rounded-md px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                stageTab === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStageTab('shortlisted')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                stageTab === 'shortlisted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              <span>Shortlisted ({stats.shortlistedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStageTab('review')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                stageTab === 'review' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>In Review ({stats.reviewCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStageTab('rejected')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                stageTab === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <X className="h-3.5 w-3.5" />
              <span>Rejected ({stats.rejectedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search candidate name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-1.5 pl-9 pr-3 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Skill Filter Chips & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800 text-xs">
          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 mr-1">Skills:</span>
            {selectedSkill && (
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="rounded bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-300 cursor-pointer"
              >
                Clear ×
              </button>
            )}
            {popularSkills.map(([skill, count]) => {
              const isSelected = selectedSkill === skill;
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(isSelected ? null : skill)}
                  className={`rounded px-2 py-0.5 text-[11px] font-mono font-medium transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {skill} <span className="opacity-50 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Sort:</span>
            {[
              { field: 'rank' as const, label: 'Rank' },
              { field: 'final_score' as const, label: 'Score' },
              { field: 'semantic_similarity' as const, label: 'Semantic' },
              { field: 'skill_overlap' as const, label: 'Skills' },
              { field: 'experience_match' as const, label: 'Exp' },
            ].map((s) => (
              <button
                key={s.field}
                type="button"
                onClick={() => toggleSort(s.field)}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border ${
                  sortField === s.field
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{s.label}</span>
                <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Failed Resumes */}
      {result.failed_files.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{result.failed_files.length} document(s) could not be parsed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.failed_files.map((f) => (
              <div
                key={f.filename}
                className="rounded-lg bg-zinc-950 p-2.5 border border-amber-500/20"
              >
                <span className="font-mono font-bold text-zinc-200">
                  {f.filename}
                </span>
                <p className="text-zinc-400 text-[11px] mt-0.5">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Candidate List View */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-16 text-center space-y-2">
          <Search className="mx-auto h-8 w-8 text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-200">
            No candidates match current criteria
          </h3>
          <p className="text-xs text-zinc-500">
            Try loosening search parameters or clearing knockout filters above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStageTab('all');
              setSelectedSkill(null);
              setMinExpFilter(0);
              setMandatorySkills([]);
            }}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredCandidates.map((item) => (
              <CandidateCard
                key={item.candidate.filename}
                item={item}
                onOpenDetail={(cand) => setSelectedCandidate(cand)}
                isSelected={compareList.some(
                  (c) => c.candidate.filename === item.candidate.filename,
                )}
                onToggleSelect={(cand) => handleToggleSelectCompare(cand)}
                onUpdateStage={handleUpdateStage}
                onUpdateNotes={handleUpdateNotes}
                minExpFilter={minExpFilter}
                mandatorySkills={mandatorySkills}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Data Table View */
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                <tr>
                  <th className="p-3 pl-4">Rank</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Semantic ({weights.semantic}%)</th>
                  <th className="p-3">Skills ({weights.skills}%)</th>
                  <th className="p-3">Experience ({weights.experience}%)</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredCandidates.map((item) => {
                  const displayName = item.candidate.name || item.candidate.filename;
                  const stage = item.pipelineStage || 'review';
                  return (
                    <tr
                      key={item.candidate.filename}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-3 pl-4 font-mono font-bold text-zinc-300">
                        #{item.rank}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-zinc-100">{displayName}</div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {item.candidate.filename}
                        </div>
                      </td>
                      <td className="p-3">
                        <ScoreBadge score={item.scores.final_score} />
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                            stage === 'shortlisted'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : stage === 'rejected'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {stage === 'shortlisted' ? '⭐ Shortlisted' : stage === 'rejected' ? '✕ Rejected' : 'In Review'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-zinc-300">
                        {item.scores.semantic_similarity.toFixed(0)}%
                      </td>
                      <td className="p-3 font-mono font-semibold text-zinc-300">
                        {item.scores.skill_overlap.toFixed(0)}%
                      </td>
                      <td className="p-3 font-mono font-semibold text-zinc-300">
                        {item.scores.experience_match.toFixed(0)}%
                      </td>
                      <td className="p-3 pr-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStage(
                              item,
                              stage === 'shortlisted' ? 'review' : 'shortlisted',
                            )
                          }
                          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                        >
                          {stage === 'shortlisted' ? 'Unstar' : 'Shortlist'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(item)}
                          className="rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-500"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Slide-Over Drawer */}
      <CandidateDetailDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <CandidateComparisonModal
          candidates={compareList}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </div>
  );
}
