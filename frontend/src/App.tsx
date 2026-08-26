import { useState } from 'react';
import { ArrowRight, ArrowLeft, FileText, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ProgressOverlay } from './components/ProgressOverlay';
import { ResultsPage } from './pages/ResultsPage';
import { streamScreening } from './utils/api';
import type { ScreeningResult, ProgressEvent } from './types';

type Step = 1 | 2 | 3;

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [jd, setJd] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // abortRef reserved for future cancel support

  const handleReset = () => {
    setStep(1);
    setJd('');
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const handleScreen = async () => {
    if (!jd.trim() || files.length === 0) return;
    setError(null);
    setProgress({ type: 'progress', current: 0, total: files.length, filename: '' });

    try {
      const gen = streamScreening(jd, files, (p) => setProgress(p));
      for await (const r of gen) {
        setResult(r);
        setStep(3);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setProgress(null);
    }
  };

  if (step === 3 && result) {
    return (
      <div className="min-h-screen">
        <Header step={3} />
        <ResultsPage result={result} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header step={step} />
      {progress && (
        <ProgressOverlay
          current={progress.current}
          total={progress.total}
          filename={progress.filename}
        />
      )}

      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Step 1: Job Description */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40">
                <FileText size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Paste your Job Description
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                The AI will extract required skills, experience, and responsibilities
                to score every resume against it.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Senior Software Engineer — We are looking for a Python & React engineer with 5+ years of experience..."
                rows={16}
                className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={jd.trim().length < 50}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Upload Resumes
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40">
                <Upload size={24} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Upload Resumes
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                PDF, DOCX, and TXT supported. Upload as many as you like.
              </p>
            </div>

            <DropZone files={files} onChange={setFiles} />

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleScreen}
                disabled={files.length === 0 || !!progress}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} />
                Analyse {files.length > 0 ? `${files.length} resume${files.length > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
