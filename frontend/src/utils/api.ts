import type { SSEEvent, ScreeningResult, ProgressEvent, SamplesResponse } from '../types';

export async function fetchSamples(): Promise<SamplesResponse> {
  const response = await fetch('/api/samples');
  if (!response.ok) {
    throw new Error('Failed to load sample templates');
  }
  return response.json();
}

export async function* streamScreening(
  jobDescription: string,
  files: File[],
  onProgress: (e: ProgressEvent) => void,
): AsyncGenerator<ScreeningResult> {
  const formData = new FormData();
  formData.append('job_description', jobDescription);
  files.forEach((f) => formData.append('resumes', f));

  const response = await fetch('/api/screen', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error (${response.status}): ${text}`);
  }

  if (!response.body) throw new Error('No response stream received');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (!payload) continue;
        try {
          const event: SSEEvent = JSON.parse(payload);
          if (event.type === 'progress') {
            onProgress(event);
          } else if (event.type === 'result') {
            yield event.data;
          }
        } catch {
          // ignore transient malformed lines
        }
      }
    }
  }
}

export async function* streamScreeningSamples(
  jobDescription: string,
  onProgress: (e: ProgressEvent) => void,
): AsyncGenerator<ScreeningResult> {
  const formData = new FormData();
  formData.append('job_description', jobDescription);

  const response = await fetch('/api/screen-samples', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error (${response.status}): ${text}`);
  }

  if (!response.body) throw new Error('No response stream received');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (!payload) continue;
        try {
          const event: SSEEvent = JSON.parse(payload);
          if (event.type === 'progress') {
            onProgress(event);
          } else if (event.type === 'result') {
            yield event.data;
          }
        } catch {
          // ignore transient lines
        }
      }
    }
  }
}

export async function exportCsv(result: object): Promise<void> {
  const response = await fetch('/api/export/csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!response.ok) throw new Error('Failed to export CSV');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `screening_results_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportJson(result: object): Promise<void> {
  const response = await fetch('/api/export/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!response.ok) throw new Error('Failed to export JSON');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `screening_results_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
