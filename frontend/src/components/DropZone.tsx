import { useCallback, useState } from 'react';
import { Upload, X, FileText, File, AlertCircle } from 'lucide-react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

const ALLOWED = new Set(['.pdf', '.docx', '.doc', '.txt']);

function getExt(name: string) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function FileIcon({ name }: { name: string }) {
  const ext = getExt(name);
  if (ext === '.pdf') return <FileText size={14} className="text-red-500" />;
  if (ext === '.docx' || ext === '.doc') return <FileText size={14} className="text-blue-500" />;
  return <File size={14} className="text-slate-400" />;
}

export function DropZone({ files, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const ok: File[] = [];
      const bad: string[] = [];
      arr.forEach((f) => {
        if (ALLOWED.has(getExt(f.name))) {
          if (!files.some((existing) => existing.name === f.name)) ok.push(f);
        } else {
          bad.push(f.name);
        }
      });
      if (ok.length) onChange([...files, ...ok]);
      if (bad.length) {
        setRejected(bad);
        setTimeout(() => setRejected([]), 4000);
      }
    },
    [files, onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const remove = (name: string) => onChange(files.filter((f) => f.name !== name));

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all duration-200',
          dragging
            ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30'
            : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600',
        ].join(' ')}
      >
        <div className={[
          'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
          dragging ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800',
        ].join(' ')}>
          <Upload
            size={22}
            className={dragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drop resumes here
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
            PDF, DOCX, TXT — multiple files supported
          </p>
        </div>
        <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800">
          Browse files
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            className="sr-only"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      </div>

      {rejected.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            Unsupported format: {rejected.join(', ')} — only PDF, DOCX, TXT are accepted.
          </span>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileIcon name={f.name} />
                <span className="truncate text-xs text-slate-700 dark:text-slate-300">{f.name}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={() => remove(f.name)}
                className="shrink-0 text-slate-400 transition-colors hover:text-red-500"
                aria-label={`Remove ${f.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
