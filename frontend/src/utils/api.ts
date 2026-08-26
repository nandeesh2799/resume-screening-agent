import type { SSEEvent, ScreeningResult, ProgressEvent } from '../types';

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
    throw new Error(`Server error ${response.status}: ${text}`);
  }

  if (!response.body) throw new Error('No response body');

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
          // malformed SSE line — ignore
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
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'screening_results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportJson(result: object): Promise<void> {
  const response = await fetch('/api/export/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'screening_results.json';
  a.click();
  URL.revokeObjectURL(url);
}
