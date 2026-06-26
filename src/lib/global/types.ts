// ── Types ──
export interface Profile {
  full_name: string;
  email: string;
  role: string;
  plan: string;
  onboarding_complete: boolean;
}
export interface Credits {
  balance: number;
  total_used: number;
}
export interface Project {
  id: string;
  title: string;
  genre: string | null;
  status: string;
  updated_at: string;
}
export interface GenerationRequest {
  id: string;
  prompt: string;
  status: string;
  type: string;
  created_at: string;
}