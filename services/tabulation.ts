
import { ScoreEntry, RankResult, Contestant } from '../types';

/**
 * Annex C: Radio Broadcasting Time Deductions (5-minute production)
 * 1-3s overtime = -1pt
 * 6-20s = -2pts
 * 21-40s = -3pts
 * 41s+ = -5pts
 */
export const calculateRadioDeduction = (seconds: number): number => {
  const limit = 300; 
  const overtime = seconds - limit;
  if (overtime <= 0) return 0;
  if (overtime <= 3) return 1;
  if (overtime <= 20) return 2;
  if (overtime <= 40) return 3;
  return 5;
};

/**
 * Annex F: TV Broadcasting Time Deductions (6-minute broadcast)
 * 1-15s = -1pt
 * 16-45s = -2pts
 * 46-75s = -3pts
 * 76s+ = -5pts
 */
export const calculateTVDeduction = (seconds: number): number => {
  const limit = 360; 
  const overtime = seconds - limit;
  if (overtime <= 0) return 0;
  if (overtime <= 15) return 1;
  if (overtime <= 45) return 2;
  if (overtime <= 75) return 3;
  return 5;
};

/**
 * Task 3: The Tabulation Engine (Annex H Logic)
 */
export const tabulateResults = (
  contestants: Contestant[],
  scores: ScoreEntry[]
): RankResult[] => {
  const results: RankResult[] = contestants.map(c => {
    const contestantScores = scores.filter(s => s.contestant_id === c.id);
    
    // Average System
    const sumFinalScores = contestantScores.reduce((acc, s) => acc + s.final_score, 0);
    const averageScore = contestantScores.length > 0 ? sumFinalScores / contestantScores.length : 0;
    
    // Calculate judge ranks for tie-breaking "Sum of Ranks" if needed
    // and extract the "Highest Individual Judge Score" as a tie-breaker
    const judgeRanks = contestantScores.map(s => {
      const sameJudgeScores = scores.filter(os => os.judge_id === s.judge_id);
      sameJudgeScores.sort((a, b) => b.final_score - a.final_score);
      return sameJudgeScores.findIndex(os => os.contestant_id === c.id) + 1;
    });

    const maxSingleScore = Math.max(...contestantScores.map(s => s.final_score), 0);

    return {
      contestant_id: c.id,
      contestant_code: c.code,
      division: c.division,
      judge_ranks: judgeRanks,
      sum_of_ranks: judgeRanks.reduce((a, b) => a + b, 0),
      average_raw_score: averageScore,
      max_individual_score: maxSingleScore,
      final_rank: 0
    };
  });

  /**
   * TIE-BREAKING LOGIC:
   * 1. Average Raw Score (Highest first)
   * 2. Highest Individual Judge Score (Highest first)
   * 3. Lowest Sum of Ranks (if ranks were pre-calculated per judge)
   */
  results.sort((a, b) => {
    // Primary: Average
    if (b.average_raw_score !== a.average_raw_score) {
      return b.average_raw_score - a.average_raw_score;
    }
    // Secondary: Highest Individual Score
    if (b.max_individual_score !== a.max_individual_score) {
      return b.max_individual_score - a.max_individual_score;
    }
    // Tertiary: Sum of Ranks (Lower is better in this specific ranking context)
    return a.sum_of_ranks - b.sum_of_ranks;
  });

  results.forEach((r, i) => {
    r.final_rank = i + 1;
  });

  return results;
};

/**
 * Overall Top Division Logic (Annex H)
 * Assigns points based on rank (1st = 1pt). Lowest total sum wins.
 */
export const calculateDivisionPoints = (results: RankResult[]): Record<string, number> => {
  const points: Record<string, number> = {};
  results.forEach(r => {
    // Only top 10 finishers typically contribute to Division Points
    if (r.final_rank <= 10) {
      if (!points[r.division]) points[r.division] = 0;
      points[r.division] += r.final_rank;
    }
  });
  return points;
};
