import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Download,
  Search,
  ArrowUpDown,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  List,
  Crown,
  Users,
} from 'lucide-react';
import type { ScreeningResult, ScoredCandidate, SortField, SortDir } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { CandidateComparisonModal } from '../components/CandidateComparisonModal';
import { ScoreBadge } from '../components/ScoreBadge';
import { exportCsv, exportJson } from '../utils/api';

interface Props {
  result: ScreeningResult;
  onReset: () => void;
}

type TierFilter = 'all' | 'strong' | 'moderate' | 'weak';
type ViewMode = 'cards' | 'table';

export function ResultsPage({ result, onReset }: Props) {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCandidate, setSelectedCandidate] = useState<ScoredCandidate | null>(null);
  const [compareList, setCompareList] = useState<ScoredCandidate[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore in environments without canvas
    }
  }, []);

  // Compute aggregate stats
  const stats = useMemo(() => {
    const total = result.candidates.length;
    if (total === 0) return { avgScore: 0, topFitCount: 0, skillCounts: {} };
    const avgScore = result.candidates.reduce((acc, c) => acc + c.scores.final_score, 0) / total;
    const topFitCount = result.candidates.filter((c) => c.scores.final_score >= 75).length;

    const skillCounts: Record<string, number> = {};
    result.candidates.forEach((c) => {
      c.matched_skills.forEach((s) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    return { avgScore, topFitCount, skillCounts };
  }, [result.candidates]);

  // Top skills found across the batch
  const popularSkills = useMemo(() => {
    return Object.entries(stats.skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [stats.skillCounts]);

  // Filtered & sorted candidates
  const filteredCandidates = useMemo(() => {
    return result.candidates
      .filter((c) => {
        const name = (c.candidate.name || c.candidate.filename).toLowerCase();
        const matchesSearch =
          !search ||
          name.includes(search.toLowerCase()) ||
          c.matched_skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

        const matchesTier =
          tier === 'all'
            ? true
            : tier === 'strong'
              ? c.scores.final_score >= 75
              : tier === 'moderate'
                ? c.scores.final_score >= 50 && c.scores.final_score < 75
                : c.scores.final_score < 50;

        const matchesSkill = !selectedSkill || c.matched_skills.includes(selectedSkill);

        return matchesSearch && matchesTier && matchesSkill;
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
  }, [result.candidates, search, tier, selectedSkill, sortField, sortDir]);

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

  const handleExport = async (type: 'csv' | 'json') => {
    setExporting(type);
    try {
      if (type === 'csv') await exportCsv(result);
      else await exportJson(result);
    } catch (e) {
      alert(`Export failed: ${e}`);
    } finally {
      setExporting(null);
    }
  };

  const topCandidate = result.candidates.length > 0 ? result.candidates[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Screening Results & Shortlist
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {result.total_processed} candidate resumes scored against your job specification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {compareList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105"
            >
              <Users className="h-4 w-4" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{exporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('json')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{exporting === 'json' ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Screen</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Processed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {result.total_processed}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Parsed
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Average Match Fit
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
              {stats.avgScore.toFixed(1)}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Batch Avg</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Strong Fits (≥75%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.topFitCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {result.total_processed > 0
                ? `${Math.round((stats.topFitCount / result.total_processed) * 100)}% of batch`
                : ''}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Flagged Malformed
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-3xl font-black tracking-tight tabular-nums ${
                result.total_failed > 0 ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              {result.total_failed}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {result.total_failed === 0 ? '✓ Zero errors' : 'Requires review'}
            </span>
          </div>
        </div>
      </div>

      {/* Spotlight Winner Card (#1 Candidate) */}
      {topCandidate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-6 sm:p-7 shadow-xl shadow-indigo-500/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/30">
                <Crown className="h-8 w-8 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    #1 Top Match Spotlight
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Recommended to Interview
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {topCandidate.candidate.name || topCandidate.candidate.filename}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xl">
                  {topCandidate.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ScoreBadge score={topCandidate.scores.final_score} size="lg" showLabel />
              <button
                type="button"
                onClick={() => setSelectedCandidate(topCandidate)}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 cursor-pointer"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
            />
          </div>

          {/* Tier Segmented Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-800">
            {[
              { id: 'all' as const, label: `All (${result.candidates.length})` },
              {
                id: 'strong' as const,
                label: `Strong Fit (${result.candidates.filter((c) => c.scores.final_score >= 75).length})`,
              },
              {
                id: 'moderate' as const,
                label: `Moderate (${result.candidates.filter((c) => c.scores.final_score >= 50 && c.scores.final_score < 75).length})`,
              },
              {
                id: 'weak' as const,
                label: `Skill Gap (${result.candidates.filter((c) => c.scores.final_score < 50).length})`,
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  tier === t.id
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white shadow dark:bg-slate-800 text-indigo-600 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow dark:bg-slate-800 text-indigo-600 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Skill Tag Filters & Sort Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Skill Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">
              Filter by Skill:
            </span>
            {selectedSkill && (
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
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
                  className={[
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors border',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'glass-card border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-indigo-400',
                  ].join(' ')}
                >
                  {skill} <span className="opacity-60 text-[9px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400">Sort:</span>
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
                className={[
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  sortField === s.field
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200',
                ].join(' ')}
              >
                <span>{s.label}</span>
                <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Failed Resumes Banner (if any) */}
      {result.failed_files.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{result.failed_files.length} resume(s) could not be parsed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.failed_files.map((f) => (
              <div
                key={f.filename}
                className="rounded-xl bg-white/60 dark:bg-slate-900/60 p-2.5 border border-amber-500/20"
              >
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {f.filename}
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Candidate Results View */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-3">
          <Search className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No candidates matched your filters
          </h3>
          <p className="text-xs text-slate-500">
            Try resetting the search query or clearing the skill filters above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTier('all');
              setSelectedSkill(null);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-3">
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
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3.5 pl-4">Rank</th>
                  <th className="p-3.5">Candidate</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Semantic (45%)</th>
                  <th className="p-3.5">Skills (35%)</th>
                  <th className="p-3.5">Experience (20%)</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCandidates.map((item) => {
                  const displayName = item.candidate.name || item.candidate.filename;
                  return (
                    <tr
                      key={item.candidate.filename}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4 font-black text-slate-700 dark:text-slate-300">
                        #{item.rank}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{displayName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.candidate.filename}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <ScoreBadge score={item.scores.final_score} />
                      </td>
                      <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.scores.semantic_similarity.toFixed(0)}%
                      </td>
                      <td className="p-3.5 font-semibold text-violet-600 dark:text-violet-400">
                        {item.scores.skill_overlap.toFixed(0)}%
                      </td>
                      <td className="p-3.5 font-semibold text-sky-600 dark:text-sky-400">
                        {item.scores.experience_match.toFixed(0)}%
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(item)}
                          className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
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
