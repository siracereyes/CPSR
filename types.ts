
export type Category = 
  | 'News Writing' 
  | 'Editorial Writing' 
  | 'Sports Writing' 
  | 'Science & Technology Writing' 
  | 'Feature Writing' 
  | 'Column Writing'
  | 'Radio Broadcasting'
  | 'TV Broadcasting';

export type Level = 'Elementary' | 'Secondary';
export type Medium = 'English' | 'Filipino';
export type UserRole = 'admin' | 'judge';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface JudgeAssignment {
  id: string;
  judge_id: string;
  category: Category;
  level: Level;
  medium: Medium;
}

export interface Contestant {
  id: string;
  code: string; // Anonymized ID for judges
  name: string;
  school: string;
  division: string;
  category: Category;
  level: Level;
  medium: Medium;
}

export interface Judge {
  id: string;
  name: string;
  assigned_category: Category;
}

export interface RawScores {
  [criterion: string]: number;
}

export interface ScoreEntry {
  id?: string;
  contestant_id: string;
  judge_id: string;
  category: Category;
  level: Level;
  medium: Medium;
  raw_scores: RawScores;
  total_score: number;
  time_deduction?: number;
  final_score: number;
  is_final: boolean;
  created_at?: string;
}

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

export interface Rubric {
  category: Category;
  criteria: RubricCriterion[];
}

export interface RankResult {
  contestant_id: string;
  contestant_code: string;
  division: string;
  judge_ranks: number[]; 
  sum_of_ranks: number;
  average_raw_score: number;
  final_rank: number;
}
