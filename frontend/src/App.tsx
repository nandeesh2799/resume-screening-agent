import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { Step1JobDescription } from './components/Step1JobDescription';
import { Step2ResumeUpload } from './components/Step2ResumeUpload';
import { ProgressOverlay } from './components/ProgressOverlay';
import { ResultsPage } from './pages/ResultsPage';
import { streamScreening, streamScreeningSamples, fetchSamples } from './utils/api';
import type { ScreeningResult, ProgressEvent, SampleJD, SampleResumeInfo } from './types';

type Step = 1 | 2 | 3;

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [jd, setJd] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sampleJDs, setSampleJDs] = useState<SampleJD[]>([]);
  const [sampleResumes, setSampleResumes] = useState<SampleResumeInfo[]>([]);

  // Load sample presets on mount
  useEffect(() => {
    fetchSamples()
      .then((data) => {
        setSampleJDs(data.job_descriptions || []);
        setSampleResumes(data.sample_resumes || []);
        // Pre-fill with the first sample JD for instantaneous testing
        if (data.job_descriptions && data.job_descriptions.length > 0 && !jd) {
          setJd(data.job_descriptions[0].content);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch sample templates:', err);
      });
  }, []);

  const handleReset = () => {
    setStep(1);
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const handleScreenUploadedFiles = async () => {
    if (!jd.trim() || files.length === 0) return;
    setError(null);
    setProgress({ type: 'progress', current: 0, total: files.length, filename: 'Preparing upload...' });

    try {
      const gen = streamScreening(jd, files, (p) => setProgress(p));
      for await (const r of gen) {
        setResult(r);
        setStep(3);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred during resume screening.');
    } finally {
      setProgress(null);
    }
  };

  const handleScreenServerSamples = async () => {
    if (!jd.trim()) {
      setError('Please provide or select a Job Description first.');
      return;
    }
    setError(null);
    setProgress({
      type: 'progress',
      current: 0,
      total: sampleResumes.length || 14,
      filename: 'Loading sample dataset...',
    });

    try {
      const gen = streamScreeningSamples(jd, (p) => setProgress(p));
      for await (const r of gen) {
        setResult(r);
        setStep(3);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred while screening sample resumes.');
    } finally {
      setProgress(null);
    }
  };

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return jd.trim().length >= 25;
    if (targetStep === 3) return result !== null;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header
          step={step}
          onStepClick={(s) => setStep(s)}
          canNavigateToStep={canNavigateToStep}
        />

        {/* Global Progress Modal */}
        <AnimatePresence>
          {progress && (
            <ProgressOverlay
              current={progress.current}
              total={progress.total}
              filename={progress.filename}
            />
          )}
        </AnimatePresence>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-auto max-w-4xl px-4 pt-6">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-slate-400 hover:text-rose-600 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1JobDescription
                key="step1"
                jd={jd}
                setJd={setJd}
                samples={sampleJDs}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2ResumeUpload
                key="step2"
                files={files}
                setFiles={setFiles}
                onBack={() => setStep(1)}
                onStartScreening={handleScreenUploadedFiles}
                onScreenServerSamples={handleScreenServerSamples}
                sampleResumes={sampleResumes}
              />
            )}

            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsPage result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResumeRank • Production-Grade AI Candidate Screening Engine</span>
          <span className="font-mono text-[11px] opacity-75">
            sentence-transformers (all-MiniLM-L6-v2) + Jaccard Skills Taxonomy
          </span>
        </div>
      </footer>
    </div>
  );
}
