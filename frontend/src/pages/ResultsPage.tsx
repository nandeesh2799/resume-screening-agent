import { useState, useMemo } from 'react';
import { Download, ArrowUpDown, Search, AlertTriangle, Trophy } from 'lucide-react';
import type { ScreeningResult, SortField, SortDir, ScoredCandidate } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { exportCsv, exportJson } from '../utils/api';

interface Props {
  result: ScreeningResult;
  onReset: () => void;
}

export function ResultsPage({ result, onReset }: Props) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [minScore, setMinScore] = useState(0);
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  const filtered = useMemo<ScoredCandidate[]>(() => {
    let list = result.candidates.filter((c) => {
      const name = (c.candidate.name ?? c.candidate.filename).toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase());
      const matchesScore = c.scores.final_score >= minScore;
      return matchesSearch && matchesScore;
    });

    list = [...list].sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortField === 'name') {
        va = (a.candidate.name ?? a.candidate.filename).toLowerCase();
        vb = (b.candidate.name ?? b.candidate.filename).toLowerCase();
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
    return list;
  }, [result.candidates, search, sortField, sortDir, minScore]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={[
        'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
        sortField === field
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {label}
      <ArrowUpDown size={11} />
    </button>
  );

  const doExport = async (type: 'csv' | 'json') => {
    setExporting(type);
    try {
      if (type === 'csv') await exportCsv(result);
      else await exportJson(result);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Trophy size={20} className="text-indigo-600" />
            Screening Results
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {result.total_processed} candidates ranked
            {result.total_failed > 0 && `, ${result.total_failed} failed`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => doExport('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download size={13} />
            {exporting === 'csv' ? 'Exporting…' : 'CSV'}
          </button>
          <button
            onClick={() => doExport('json')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download size={13} />
            {exporting === 'json' ? 'Exporting…' : 'JSON'}
          </button>
          <button
            onClick={onReset}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            New screening
          </button>
        </div>
      </div>

      {/* JD preview */}
      <div className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800/50">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Job description</p>
        <p className="line-clamp-2 text-xs text-slate-700 dark:text-slate-300">
          {result.job_description_preview}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 outline-none ring-inset focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-500">Min score</label>
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-slate-500">Sort:</span>
          <SortBtn field="rank" label="Rank" />
          <SortBtn field="final_score" label="Score" />
          <SortBtn field="semantic_similarity" label="Semantic" />
          <SortBtn field="skill_overlap" label="Skills" />
          <SortBtn field="name" label="Name" />
        </div>
      </div>

      {/* Failed files */}
      {result.failed_files.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
            <AlertTriangle size={13} />
            {result.failed_files.length} file(s) could not be processed
          </p>
          <ul className="space-y-1">
            {result.failed_files.map((f) => (
              <li key={f.filename} className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-medium">{f.filename}</span> — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
          <Search size={32} />
          <p className="text-sm">No candidates match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <CandidateCard key={item.candidate.filename} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
