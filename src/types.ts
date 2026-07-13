export type JobBoard = "linkedin" | "naukri" | "instahyre" | "wellfound" | "cutshort" | "indeed";

export type JobStatus =
  | "discovered"
  | "scored"
  | "skipped_lowfit"
  | "skipped_excluded"
  | "queued"
  | "applied"
  | "failed"
  | "manual_review";

export interface JobPosting {
  id: string;
  board: JobBoard;
  url: string;
  title: string;
  company: string;
  location: string;
  postedAt?: string;
  description: string;
  easyApply?: boolean;
  discoveredAt: string;
}

export interface ScoredJob extends JobPosting {
  fitScore: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  coverLetter?: string;
}

export interface ApplicationRecord {
  jobId: string;
  status: JobStatus;
  fitScore?: number;
  appliedAt?: string;
  failureReason?: string;
  reasoning?: string;
  url: string;
  title: string;
  company: string;
  board: JobBoard;
}
