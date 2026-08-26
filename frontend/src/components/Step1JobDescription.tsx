import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Trash2,
  Briefcase,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import type { SampleJD } from '../types';

interface Props {
  jd: string;
  setJd: (val: string) => void;
  samples: SampleJD[];
  onNext: () => void;
}

const COMMON_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'node', 'fastapi', 'django',
  'aws', 'gcp', 'docker', 'kubernetes', 'postgresql', 'redis', 'graphql',
  'sql', 'machine learning', 'nlp', 'pytorch', 'tensorflow', 'ci/cd', 'git',
];

export function Step1JobDescription({ jd, setJd, samples, onNext }: Props) {
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const wordCount = useMemo(() => (jd.trim() ? jd.trim().split(/\s+/).length : 0), [jd]);
  const charCount = jd.length;

  const detectedSkills = useMemo(() => {
    const lower = jd.toLowerCase();
    return COMMON_SKILLS.filter((s) => lower.includes(s));
  }, [jd]);

  const handleSelectSample = (sample: SampleJD) => {
    setSelectedSampleId(sample.id);
    setJd(sample.content);
  };

  const handleClear = () => {
    setJd('');
    setSelectedSampleId(null);
  };

  const isReady = wordCount >= 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-8"
    >
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Step 1: Define Target Role
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          What role are you hiring for?
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Paste your Job Description or pick a ready-to-test industry preset below. The agent will
          extract required skills, experience thresholds, and domain criteria automatically.
        </p>
      </div>

      {/* Preset JD Chips */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
            Quick Presets (1-Click Test)
          </span>
          {selectedSampleId && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Preset active
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {samples.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={[
                  'group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 border cursor-pointer',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:border-indigo-500/60'
                    : 'glass-card glass-card-hover border-slate-200/80 dark:border-slate-800/80',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {sample.department}
                    </span>
                    <span className="text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-slate-500">
                      {sample.experience}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sample.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-500">
                  <span>Apply template</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Editor & Live Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-3">
          <div className="glass-panel rounded-2xl p-4 shadow-xl shadow-slate-900/5 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Job Description Text
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {wordCount} words • {charCount} chars
                </span>
                {jd && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={jd}
              onChange={(e) => {
                setJd(e.target.value);
                setSelectedSampleId(null);
              }}
              rows={14}
              placeholder="Paste the full job description here (e.g. responsibilities, required skills, required experience, cloud tooling, education requirements)..."
              className="w-full resize-y bg-transparent pt-3 pb-2 text-sm leading-relaxed text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 font-mono scrollbar-thin"
            />
          </div>
        </div>

        {/* Live Extraction Inspector Sidebar */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-500" />
              Live JD Feature Extraction
            </h3>

            {/* Status indicator */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Specification Density
              </span>
              <span
                className={`text-xs font-bold ${
                  isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                }`}
              >
                {isReady ? '✓ Ready to Score' : 'Need ≥ 25 words'}
              </span>
            </div>

            {/* Detected Skills */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Detected Target Skills</span>
                <span className="text-[10px] font-bold rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-600 dark:text-indigo-400">
                  {detectedSkills.length} found
                </span>
              </span>
              {detectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {detectedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300"
                    >
                      <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No skills identified yet. Paste a JD or pick a preset above.
                </p>
              )}
            </div>

            {/* NLP Engine Notice */}
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-3.5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <Layers className="h-3.5 w-3.5" />
                Semantic Weight Matrix
              </div>
              <p className="text-[11px] leading-normal opacity-90">
                Embeddings (45%) + Skill Jaccard (35%) + Years Exp (20%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <p className="text-xs text-slate-500">
          Tip: You can change the job description at any point.
        </p>
        <button
          type="button"
          disabled={!isReady}
          onClick={onNext}
          className={[
            'group relative flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200',
            isReady
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none',
          ].join(' ')}
        >
          <span>Next: Upload Resumes</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
