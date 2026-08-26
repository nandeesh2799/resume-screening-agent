export interface ScoreBreakdown {
  semantic_similarity: number;
  skill_overlap: number;
  experience_match: number;
  final_score: number;
}

export interface ExtractedCandidate {
  filename: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  years_of_experience: number | null;
  education: string[];
  raw_text: string;
  parse_error: string | null;
}

export interface ScoredCandidate {
  candidate: ExtractedCandidate;
  scores: ScoreBreakdown;
  rank: number;
  explanation: string;
  matched_skills: string[];
  missing_skills: string[];
}

export interface FailedFile {
  filename: string;
  reason: string;
}

export interface ScreeningResult {
  job_description_preview: string;
  total_processed: number;
  total_failed: number;
  candidates: ScoredCandidate[];
  failed_files: FailedFile[];
}

export interface ProgressEvent {
  type: 'progress';
  current: number;
  total: number;
  filename: string;
}

export interface ResultEvent {
  type: 'result';
  data: ScreeningResult;
}

export type SSEEvent = ProgressEvent | ResultEvent;

export type SortField = 'rank' | 'name' | 'final_score' | 'semantic_similarity' | 'skill_overlap' | 'experience_match';
export type SortDir = 'asc' | 'desc';

export interface SampleJD {
  id: string;
  title: string;
  department: string;
  experience: string;
  content: string;
}

export interface SampleResumeInfo {
  filename: string;
  size_kb: number;
  extension: string;
}

export interface SamplesResponse {
  job_descriptions: SampleJD[];
  sample_resumes: SampleResumeInfo[];
}
