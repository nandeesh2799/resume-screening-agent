import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
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
      className="w-full max-w-[1800px] mx-auto space-y-6"
    >
      {/* Workstation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Target Role Specification & Criteria
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure the evaluation criteria and technical requirements for candidate ranking
          </p>
        </div>

        <button
          type="button"
          disabled={!isReady}
          onClick={onNext}
          className={[
            'group flex items-center gap-2.5 rounded-2xl px-7 py-3 text-xs font-black text-white transition-all cursor-pointer',
            isReady
              ? 'glow-btn-primary'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/[0.04]',
          ].join(' ')}
        >
          <span>Continue to Batch Upload</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Main Full-Screen Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Full-Height Code / Spec Editor (7/12 on large screens) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="glass-panel rounded-3xl p-5 shadow-2xl transition-all">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Role Specification Document (Raw Editor)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {wordCount} words • {charCount} chars
                </span>
                {jd && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Editor
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
              rows={20}
              placeholder="Paste the full job description here (responsibilities, required skills, minimum years of experience, cloud infrastructure, tooling, degrees)..."
              className="w-full resize-y bg-transparent pt-4 pb-2 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 font-mono scrollbar-thin min-h-[420px]"
            />
          </div>
        </div>

        {/* Right Column: Benchmarks & Live Extraction Sidebar (5/12 on large screens) */}
        <div className="xl:col-span-4 space-y-5">
          {/* Preset Benchmark Roles */}
          <div className="glass-panel rounded-3xl p-5 space-y-3.5 border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                Industry Benchmarks
              </span>
              {selectedSampleId && (
                <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Preset loaded
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {samples.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={[
                      'group relative flex flex-col justify-between rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer',
                      isSelected
                        ? 'border border-indigo-500/80 bg-indigo-950/60 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] ring-1 ring-indigo-400'
                        : 'glass-card glass-card-hover border-white/[0.06]',
                    ].join(' ')}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {sample.department}
                        </span>
                        <span className="text-[9px] font-mono rounded bg-white/[0.06] px-1 py-0.5 text-slate-400 border border-white/[0.08]">
                          {sample.experience}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {sample.title}
                      </h4>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                      <span>Apply template</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Feature Extraction Inspector */}
          <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-xl border border-white/[0.08]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              Real-Time Feature Extraction
            </h3>

            {/* Status indicator */}
            <div className="flex items-center justify-between rounded-2xl bg-black/40 p-3.5 border border-white/[0.06]">
              <span className="text-xs font-medium text-slate-400">
                Specification Density
              </span>
              <span
                className={`text-xs font-bold font-mono ${
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
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {detectedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-950/70 border border-indigo-500/40 px-2.5 py-1 text-[11px] font-bold text-indigo-300 shadow-sm"
                    >
                      <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-4 text-center">
                  <Terminal className="mx-auto h-5 w-5 text-slate-600 mb-1" />
                  <p className="text-xs text-slate-500">
                    Paste text or choose a benchmark above to extract target criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Scoring Weights Matrix */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-transparent p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Scoring Weights Formula</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                0.45 × Semantic + 0.35 × Skills + 0.20 × Experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
