import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  FileCode,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Trash2,
  FolderDown,
} from 'lucide-react';
import type { SampleResumeInfo } from '../types';

interface Props {
  files: File[];
  setFiles: (files: File[]) => void;
  onBack: () => void;
  onStartScreening: () => void;
  onScreenServerSamples: () => void;
  sampleResumes: SampleResumeInfo[];
  isLoadingSamples?: boolean;
}

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc', '.txt']);

function getExt(name: string) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function getFormatBadge(name: string) {
  const ext = getExt(name);
  if (ext === '.pdf') {
    return {
      label: 'PDF',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
      icon: <FileText className="h-4 w-4 text-rose-400" />,
    };
  }
  if (ext === '.docx' || ext === '.doc') {
    return {
      label: 'DOCX',
      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
      icon: <FileText className="h-4 w-4 text-cyan-400" />,
    };
  }
  return {
    label: 'TXT',
    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    icon: <FileCode className="h-4 w-4 text-slate-400" />,
  };
}

export function Step2ResumeUpload({
  files,
  setFiles,
  onBack,
  onStartScreening,
  onScreenServerSamples,
  sampleResumes,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const ok: File[] = [];
      const bad: string[] = [];

      arr.forEach((f) => {
        const ext = getExt(f.name);
        if (ALLOWED_EXTENSIONS.has(ext)) {
          if (!files.some((existing) => existing.name === f.name)) {
            ok.push(f);
          }
        } else {
          bad.push(f.name);
        }
      });

      if (ok.length) setFiles([...files, ...ok]);
      if (bad.length) {
        setRejected(bad);
        setTimeout(() => setRejected([]), 4000);
      }
    },
    [files, setFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (name: string) => {
    setFiles(files.filter((f) => f.name !== name));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const totalSizeKb = files.reduce((acc, f) => acc + f.size / 1024, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]">
          <Upload className="h-3.5 w-3.5 text-violet-400" />
          <span>Step 2: Candidate Batch Ingestion</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
          Upload <span className="gradient-text-accent">Candidate Resumes</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400 leading-relaxed">
          Drop any mixture of PDF, DOCX, or TXT documents. Everything is parsed asynchronously in a
          single non-blocking batch run.
        </p>
      </div>

      {/* Instant 1-Click Evaluation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-[#0c101c] p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]">
            <FolderDown className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Instant 1-Click Evaluation Batch
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Score against {sampleResumes.length || 14} diverse synthetic resumes (Senior ML, Backend,
              DevOps, Frontend, QA, PM, and malformed edge cases).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onScreenServerSamples}
          className="glow-btn-primary flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold text-white shadow-lg cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Screen 14 Sample Resumes</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-12 transition-all duration-300 text-center cursor-pointer overflow-hidden',
          dragging
            ? 'border-indigo-400 bg-indigo-950/50 scale-[1.01] shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] ring-4 ring-indigo-500/30'
            : 'border-white/[0.12] hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
            dragging
              ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_25px_#6366f1] animate-bounce'
              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-105',
          ].join(' ')}
        >
          <Upload className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <p className="text-base font-bold text-white">
            Drag & drop resume files here
          </p>
          <p className="text-xs text-slate-400">
            Accepts <span className="font-semibold text-indigo-300">PDF, DOCX, TXT</span> — upload 10+ resumes in parallel
          </p>
        </div>

        <label className="relative cursor-pointer rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95">
          <span>Browse Files From Computer</span>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            className="sr-only"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Rejected files warning */}
      {rejected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>
            Unsupported format ({rejected.join(', ')}). Only .pdf, .docx, and .txt files are supported.
          </span>
        </motion.div>
      )}

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Staged Batch ({files.length} resumes)
              </span>
              <span className="text-[10px] font-mono rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-slate-300">
                {totalSizeKb.toFixed(1)} KB total
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence>
              {files.map((file) => {
                const badge = getFormatBadge(file.name);
                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between gap-2.5 rounded-2xl glass-card p-3.5 border border-white/[0.08] shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">{badge.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-mono font-bold rounded px-1.5 py-0.2 border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="shrink-0 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-slate-900/80 px-5 py-3 text-xs font-bold text-slate-300 shadow-sm transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Role Spec</span>
        </button>

        <button
          type="button"
          disabled={files.length === 0}
          onClick={onStartScreening}
          className={[
            'group relative flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white transition-all duration-200 cursor-pointer',
            files.length > 0
              ? 'glow-btn-primary'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/[0.04]',
          ].join(' ')}
        >
          <Sparkles className="h-4 w-4 animate-spin text-amber-300" style={{ animationDuration: '3s' }} />
          <span>
            Analyse & Rank {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : ''}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
