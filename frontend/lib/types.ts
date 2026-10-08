export interface ResumeScoreCategory {
  category?: string;
  category_name?: string;
  score: number;
  max_score?: number;
  weight?: number;
  feedback?: string;
  feedback_text?: string;
}

export interface ResumeSkillGroup {
  category: string;  // "languages" | "frameworks" | "tools" | "soft_skills"
  skills: string[];
}

export interface ResumeImprovement {
  section: string;
  issue: string;
  before_text: string;
  suggested_text: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysisReport {
  id?: string;
  overall_score: number;
  grade: string;
  summary: string;
  category_scores: ResumeScoreCategory[];
  skills: ResumeSkillGroup[];
  strengths: string[];
  weaknesses: string[];
  improvements: ResumeImprovement[];
  recommended_interview_topics: string[];
  created_at?: string;
}

export type UserRole = "candidate" | "expert" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CandidateProfile {
  user_id: string;
  target_role?: string;
  bio?: string;
  resume_url?: string;
}

export interface ExpertProfile {
  user_id: string;
  domains?: string;
  bio?: string;
  company_title?: string;
  approved: boolean;
  avg_rating: number;
}

