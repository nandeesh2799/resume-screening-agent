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

  // Lock dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load sample presets on mount
  useEffect(() => {
    fetchSamples()
      .then((data) => {
        setSampleJDs(data.job_descriptions || []);
        setSampleResumes(data.sample_resumes || []);
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
    setProgress({ type: 'progress', current: 0, total: files.length, filename: 'Preparing upload batch...' });

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
      filename: 'Loading synthetic dataset...',
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
    <div className="min-h-screen flex flex-col justify-between bg-[#09090b]">
      <div className="w-full">
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

        {/* Global Error Alert */}
        {error && (
          <div className="w-full max-w-[1800px] mx-auto px-4 pt-6">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs font-semibold text-rose-300 flex items-center justify-between shadow-lg">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-zinc-400 hover:text-rose-200 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ResultsPage result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 bg-[#09090b] py-3 text-xs text-zinc-500">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-zinc-400 font-medium font-mono text-[11px]">
            ResumeRank • Candidate Screening & Ranking Engine
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            Powered by sentence-transformers (<span className="text-zinc-300">all-MiniLM-L6-v2</span>)
          </span>
        </div>
      </footer>
    </div>
  );
}
