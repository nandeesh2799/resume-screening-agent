import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Trash2,
  Briefcase,
  Zap,
} from 'lucide-react';
import type { SampleJD } from '../types';

interface Props {
  jd: string;
  setJd: (val: string) => void;
  samples: SampleJD[];
  onNext: () => void;
}

export function Step1JobDescription({ jd, setJd, samples, onNext }: Props) {
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const wordCount = useMemo(() => (jd.trim() ? jd.trim().split(/\s+/).length : 0), [jd]);
  const charCount = jd.length;

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1800px] mx-auto space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Role Specification & Criteria
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Define requirements, necessary tech stack, and experience target for candidate evaluation
          </p>
        </div>

        <button
          type="button"
          disabled={!isReady}
          onClick={onNext}
          className={[
            'flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer',
            isReady
              ? 'bg-indigo-600 hover:bg-indigo-500'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700',
          ].join(' ')}
        >
          <span>Continue to Batch Upload</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main Full-Screen Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Full-Height Code / Spec Editor (8/12 on large screens) */}
        <div className="xl:col-span-8 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Job Description Document
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-400 tabular-nums">
                  {wordCount} words • {charCount} characters
                </span>
                {jd && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
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
              rows={22}
              placeholder="Paste or write the full job description here (e.g. core responsibilities, tech stack requirements, required seniority, cloud systems)..."
              className="w-full resize-y bg-transparent pt-3 pb-1 text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 font-mono min-h-[460px]"
            />
          </div>
        </div>

        {/* Right Column: Benchmark Roles Preset Selection (4/12 on large screens) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                Benchmark Role Templates
              </span>
              {selectedSampleId && (
                <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Loaded
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {samples.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={[
                      'group flex flex-col justify-between rounded-lg p-3 text-left transition-colors cursor-pointer border',
                      isSelected
                        ? 'border-indigo-500 bg-zinc-800/90 text-white'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 hover:border-zinc-700',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                        {sample.department}
                      </span>
                      <span className="text-[10px] font-mono rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400 border border-zinc-700">
                        {sample.experience}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {sample.title}
                    </h4>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
