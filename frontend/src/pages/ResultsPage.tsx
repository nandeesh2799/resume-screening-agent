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

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

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

  const popularSkills = useMemo(() => {
    return Object.entries(stats.skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.skillCounts]);

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
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
              <Trophy className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Neural Candidate Shortlist & Ranking
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {result.total_processed} candidate resumes scored against your job specification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {compareList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="glow-btn-primary flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-2xl border border-white/[0.1] bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-400" />
            <span>{exporting === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('json')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-2xl border border-white/[0.1] bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-400" />
            <span>{exporting === 'json' ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] px-4 py-2.5 text-xs font-bold text-white shadow transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Total Ingested
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-white tabular-nums">
              {result.total_processed}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              100% Parsed
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Batch Average Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-indigo-300 tabular-nums">
              {stats.avgScore.toFixed(1)}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Batch Fit</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Strong Matches (≥75%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-emerald-400 tabular-nums">
              {stats.topFitCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {result.total_processed > 0
                ? `${Math.round((stats.topFitCount / result.total_processed) * 100)}% of batch`
                : ''}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Flagged Malformed
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-3xl font-black tracking-tight tabular-nums ${
                result.total_failed > 0 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {result.total_failed}
            </span>
            <span className="text-xs text-slate-400 font-medium">
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
          className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-[#0c101c] p-6 sm:p-7 shadow-[0_0_40px_-15px_rgba(99,102,241,0.4)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    #1 Top Match Spotlight
                  </span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    Recommended for Interview
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {topCandidate.candidate.name || topCandidate.candidate.filename}
                </h2>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1 max-w-2xl">
                  {topCandidate.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <ScoreBadge score={topCandidate.scores.final_score} size="lg" showLabel />
              <button
                type="button"
                onClick={() => setSelectedCandidate(topCandidate)}
                className="glow-btn-primary rounded-2xl px-6 py-3 text-xs font-black text-white shadow-xl cursor-pointer"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-black/60 p-1 border border-white/[0.06]">
            {[
              { id: 'all' as const, label: `All (${result.candidates.length})` },
              {
                id: 'strong' as const,
                label: `Strong (≥75%)`,
              },
              {
                id: 'moderate' as const,
                label: `Moderate (50-75%)`,
              },
              {
                id: 'weak' as const,
                label: `Gap (<50%)`,
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className={[
                  'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
                  tier === t.id
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_-2px_rgba(99,102,241,0.5)]'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-2xl bg-black/60 p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Skill Tag Filters & Sort Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
          {/* Skill Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500 mr-1">
              Skills Filter:
            </span>
            {selectedSkill && (
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[11px] font-bold text-indigo-300 cursor-pointer"
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
                    'rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all border cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_#6366f1]'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:border-indigo-400 hover:text-white',
                  ].join(' ')}
                >
                  {skill} <span className="opacity-60 text-[9px] font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500">Sort:</span>
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
                  'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer',
                  sortField === s.field
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]',
                ].join(' ')}
              >
                <span>{s.label}</span>
                <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Malformed Files */}
      {result.failed_files.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{result.failed_files.length} resume(s) could not be parsed cleanly</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.failed_files.map((f) => (
              <div
                key={f.filename}
                className="rounded-2xl bg-black/40 p-3 border border-amber-500/20"
              >
                <span className="font-mono font-bold text-white">
                  {f.filename}
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Results View */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-3">
          <Search className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="text-base font-bold text-white">
            No candidates matched your search criteria
          </h3>
          <p className="text-xs text-slate-400">
            Try resetting the search query or clearing the active skill filters above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTier('all');
              setSelectedSkill(null);
            }}
            className="glow-btn-primary rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow cursor-pointer"
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
        /* Full-Width Table View */
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-white/[0.08] text-[11px] font-bold uppercase text-slate-400 font-mono">
                <tr>
                  <th className="p-4 pl-6">Rank</th>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Final Score</th>
                  <th className="p-4">Semantic (45%)</th>
                  <th className="p-4">Skills (35%)</th>
                  <th className="p-4">Experience (20%)</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredCandidates.map((item) => {
                  const displayName = item.candidate.name || item.candidate.filename;
                  return (
                    <tr
                      key={item.candidate.filename}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="p-4 pl-6 font-black text-indigo-300">
                        #{item.rank}
                      </td>
                      <td className="p-4 font-bold text-white">
                        <div>{displayName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {item.candidate.filename}
                        </div>
                      </td>
                      <td className="p-4">
                        <ScoreBadge score={item.scores.final_score} />
                      </td>
                      <td className="p-4 font-bold text-indigo-400">
                        {item.scores.semantic_similarity.toFixed(0)}%
                      </td>
                      <td className="p-4 font-bold text-violet-400">
                        {item.scores.skill_overlap.toFixed(0)}%
                      </td>
                      <td className="p-4 font-bold text-sky-400">
                        {item.scores.experience_match.toFixed(0)}%
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(item)}
                          className="rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
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
