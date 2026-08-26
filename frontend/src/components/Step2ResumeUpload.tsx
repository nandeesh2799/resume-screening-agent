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
      bg: 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400',
      icon: <FileText className="h-4 w-4 text-red-500" />,
    };
  }
  if (ext === '.docx' || ext === '.doc') {
    return {
      label: 'DOCX',
      bg: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400',
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    };
  }
  return {
    label: 'TXT',
    bg: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-400',
    icon: <FileCode className="h-4 w-4 text-slate-500" />,
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
          <Upload className="h-3.5 w-3.5" />
          Step 2: Candidate Resumes Batch
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Upload resumes to score
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Drop any mix of PDF, DOCX, or TXT resumes. You can also test in one click using the
          pre-packaged 14 synthetic resumes.
        </p>
      </div>

      {/* Quick Action Bar / Sample Batch */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <FolderDown className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Instant 1-Click Evaluation Batch
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Run against {sampleResumes.length || 14} realistic resumes (Senior ML, Backend, Frontend,
              DevOps, Junior, Edge cases)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onScreenServerSamples}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Screen 14 Sample Resumes Now</span>
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
          'group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 transition-all duration-200 text-center cursor-pointer',
          dragging
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[1.01] shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500/20'
            : 'border-slate-300/80 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-indigo-500/60',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
            dragging
              ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/30 animate-bounce'
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105',
          ].join(' ')}
        >
          <Upload className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            Drag & drop resume files here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports <span className="font-semibold text-slate-700 dark:text-slate-300">PDF, DOCX, TXT</span> — upload 10+ resumes in parallel
          </p>
        </div>

        <label className="relative cursor-pointer rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-105 active:scale-95">
          <span>Browse From Computer</span>
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
          className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-4 py-3 text-xs text-rose-700 dark:text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Unsupported format ({rejected.join(', ')}). Only .pdf, .docx, and .txt files are supported.
          </span>
        </motion.div>
      )}

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Staged Batch ({files.length} resumes)
              </span>
              <span className="text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-500 font-medium">
                {totalSizeKb.toFixed(1)} KB total
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence>
              {files.map((file) => {
                const badge = getFormatBadge(file.name);
                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between gap-2 rounded-xl glass-card p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">{badge.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-bold rounded px-1.5 py-0.2 border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="shrink-0 text-slate-400 hover:text-rose-500 p-1 transition-colors"
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Job Spec</span>
        </button>

        <button
          type="button"
          disabled={files.length === 0}
          onClick={onStartScreening}
          className={[
            'group relative flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200',
            files.length > 0
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none',
          ].join(' ')}
        >
          <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
          <span>
            Analyse & Rank {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : ''}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
