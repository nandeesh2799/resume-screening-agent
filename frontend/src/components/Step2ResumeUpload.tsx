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
  CheckCircle2,
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
      className="w-full max-w-[1800px] mx-auto space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Upload className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Candidate Resume Batch Ingestion
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload candidate resumes across PDF, DOCX, and TXT formats for asynchronous batch scoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-300 shadow-sm hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Edit Role Spec</span>
          </button>

          <button
            type="button"
            disabled={files.length === 0}
            onClick={onStartScreening}
            className={[
              'group flex items-center gap-2.5 rounded-2xl px-6 py-2.5 text-xs font-black text-white transition-all cursor-pointer',
              files.length > 0
                ? 'glow-btn-primary'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/[0.04]',
            ].join(' ')}
          >
            <Sparkles className="h-4 w-4 animate-spin text-amber-300" style={{ animationDuration: '3s' }} />
            <span>Analyse {files.length > 0 ? `${files.length} Staged Resume${files.length > 1 ? 's' : ''}` : 'Batch'}</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dropzone & 1-Click Evaluation Bar (5/12 on large screens) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Instant 1-Click Evaluation Bar */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-[#0c101c] p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]">
                <FolderDown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Instant Test Dataset
                </h4>
                <p className="text-[11px] text-slate-400">
                  {sampleResumes.length || 14} diverse synthetic resumes (Senior ML, Backend, DevOps, etc.)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onScreenServerSamples}
              className="w-full glow-btn-primary flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black text-white shadow-lg cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Screen 14 Benchmark Resumes Now</span>
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
              'group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 transition-all duration-300 text-center cursor-pointer overflow-hidden',
              dragging
                ? 'border-indigo-400 bg-indigo-950/50 scale-[1.01] shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] ring-4 ring-indigo-500/30'
                : 'border-white/[0.12] hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70',
            ].join(' ')}
          >
            <div
              className={[
                'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
                dragging
                  ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_25px_#6366f1] animate-bounce'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-105',
              ].join(' ')}
            >
              <Upload className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                Drag & drop candidate resumes here
              </p>
              <p className="text-xs text-slate-400">
                Accepts <span className="font-semibold text-indigo-300">PDF, DOCX, TXT</span> — upload 10+ resumes in parallel
              </p>
            </div>

            <label className="relative cursor-pointer rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95">
              <span>Browse Files</span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                className="sr-only"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>
          </div>

          {/* Rejected format notice */}
          {rejected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                Unsupported format ({rejected.join(', ')}). Only .pdf, .docx, and .txt are supported.
              </span>
            </motion.div>
          )}
        </div>

        {/* Right Column: Staged Files Management Grid (7/12 on large screens) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] shadow-2xl min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
                  <span className="text-xs font-bold font-mono uppercase text-slate-300">
                    Staged Document Queue ({files.length} documents)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    {totalSizeKb.toFixed(1)} KB Total
                  </span>
                  {files.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear Queue
                    </button>
                  )}
                </div>
              </div>

              {files.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <FileText className="mx-auto h-10 w-10 text-slate-600" />
                  <p className="text-xs text-slate-400">No resumes staged in queue yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Drag files onto the left panel or click "Screen 14 Benchmark Resumes" to test instantly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
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
              )}
            </div>

            {files.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{files.length} document{files.length > 1 ? 's' : ''} ready for parallel scoring</span>
                </span>
                <button
                  type="button"
                  onClick={onStartScreening}
                  className="glow-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Run Screening Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
