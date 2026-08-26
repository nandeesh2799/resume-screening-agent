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
  Terminal,
  Zap,
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
      {/* Hero Header */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Step 1: Role Specification</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
          Define Your <span className="gradient-text-accent">Target Role</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400 leading-relaxed">
          Paste your Job Description or select a pre-configured industry benchmark. The neural
          matching agent will extract requirements, technical skills, and seniority thresholds.
        </p>
      </div>

      {/* Quick Benchmark Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
            Industry Benchmarks (1-Click Fill)
          </span>
          {selectedSampleId && (
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Preset loaded
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
                  'group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border border-indigo-500/80 bg-indigo-950/50 shadow-[0_0_25px_-5px_rgba(99,102,241,0.4)] ring-1 ring-indigo-400'
                    : 'glass-card glass-card-hover border-white/[0.06]',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {sample.department}
                    </span>
                    <span className="text-[10px] font-mono rounded-md bg-white/[0.06] px-1.5 py-0.5 text-slate-400 border border-white/[0.08]">
                      {sample.experience}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {sample.title}
                  </h4>
                </div>
                <div className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                  <span>Use benchmark</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Editor & Live Analysis Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Glass Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="glass-panel rounded-3xl p-5 shadow-2xl transition-all">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-white">
                  Job Specification Editor
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {wordCount} words • {charCount} chars
                </span>
                {jd && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
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
              placeholder="Paste the full job description here (responsibilities, required skills, minimum years of experience, tooling, tech stack)..."
              className="w-full resize-y bg-transparent pt-3.5 pb-2 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 font-mono scrollbar-thin"
            />
          </div>
        </div>

        {/* Live Feature Extraction Inspector */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-xl border border-white/[0.08]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              Live Feature Extraction
            </h3>

            {/* Status indicator */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-3.5 border border-white/[0.06]">
              <span className="text-xs font-medium text-slate-400">
                Specification Density
              </span>
              <span
                className={`text-xs font-bold ${
                  isReady ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400'
                }`}
              >
                {isReady ? '✓ Ready to Score' : 'Need ≥ 25 words'}
              </span>
            </div>

            {/* Detected Skills Tag Cloud */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Target Skill Taxonomy</span>
                <span className="text-[10px] font-bold font-mono rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-indigo-300">
                  {detectedSkills.length} identified
                </span>
              </div>
              {detectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {detectedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 px-2.5 py-1 text-[11px] font-bold text-indigo-300 shadow-sm"
                    >
                      <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center">
                  <Terminal className="mx-auto h-5 w-5 text-slate-600 mb-1" />
                  <p className="text-xs text-slate-500">
                    Paste text or choose a benchmark above to extract target criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Mathematical Weights Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-transparent p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Multi-Factor Scoring Matrix</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Embeddings (45%) + Skill Jaccard (35%) + Experience Match (20%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
        <p className="text-xs text-slate-500">
          Tip: You can return and re-tune the specification at any time.
        </p>
        <button
          type="button"
          disabled={!isReady}
          onClick={onNext}
          className={[
            'group relative flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white transition-all duration-200 cursor-pointer',
            isReady
              ? 'glow-btn-primary'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/[0.04]',
          ].join(' ')}
        >
          <span>Next: Upload Resumes Batch</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
