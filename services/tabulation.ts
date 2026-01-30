
import { ScoreEntry, RankResult, Contestant } from '../types';

/**
 * Annex C: Radio Broadcasting Time Deductions
 */
export const calculateRadioDeduction = (seconds: number): number => {
  const limit = 300; // 5 mins
  const overtime = seconds - limit;
  if (overtime <= 0) return 0;
  if (overtime <= 3) return 1;
  if (overtime <= 20) return 2;
  if (overtime <= 40) return 3;
  return 5;
};

/**
 * Annex F: TV Broadcasting Time Deductions
 */
export const calculateTVDeduction = (seconds: number): number => {
  const limit = 360; // 6 mins
  const overtime = seconds - limit;
  if (overtime <= 0) return 0;
  if (overtime <= 15) return 1;
  if (overtime <= 45) return 2;
  if (overtime <= 75) return 3;
  return 5;
};

/**
 * Annex H: Tabulation Algorithm (Rank 1-16)
 * Based on Lowest Sum of Ranks.
 */
export const tabulateResults = (
  contestants: Contestant[],
  scores: ScoreEntry[]
): RankResult[] => {
  const contestantScoresMap: Record<string, ScoreEntry[]> = {};
  scores.forEach(s => {
    if (!contestantScoresMap[s.contestant_id]) {
      contestantScoresMap[s.contestant_id] = [];
    }
    contestantScoresMap[s.contestant_id].push(s);
  });

  const judgeIds = Array.from(new Set(scores.map(s => s.judge_id)));
  
  // 1. Calculate each judge's rank for each contestant
  const judgeRankings: Record<string, Record<string, number>> = {};
  
  judgeIds.forEach(jId => {
    judgeRankings[jId] = {};
    const jScores = scores.filter(s => s.judge_id === jId);
    jScores.sort((a, b) => b.final_score - a.final_score);
    
    jScores.forEach((s, i) => {
      judgeRankings[jId][s.contestant_id] = i + 1;
    });
  });

  // 2. Build RankResult list
  const results: RankResult[] = contestants.map(c => {
    const cScores = contestantScoresMap[c.id] || [];
    const ranks = judgeIds.map(jId => judgeRankings[jId][c.id] || 0).filter(r => r > 0);
    const sumOfRanks = ranks.reduce((acc, r) => acc + r, 0);
    const avgScore = cScores.length > 0 
      ? cScores.reduce((acc, s) => acc + s.final_score, 0) / cScores.length 
      : 0;

    return {
      contestant_id: c.id,
      contestant_code: c.code,
      division: c.division,
      judge_ranks: ranks,
      sum_of_ranks: sumOfRanks,
      average_raw_score: avgScore,
      final_rank: 0
    };
  });

  // 3. Sort by Lowest Sum of Ranks, then Highest Average Raw Score
  results.sort((a, b) => {
    if (a.sum_of_ranks !== b.sum_of_ranks) return a.sum_of_ranks - b.sum_of_ranks;
    return b.average_raw_score - a.average_raw_score;
  });

  // 4. Assign Final Rank
  results.forEach((r, i) => { r.final_rank = i + 1; });

  return results;
};

export const calculateDivisionPoints = (results: RankResult[]): Record<string, number> => {
  const points: Record<string, number> = {};
  results.forEach(r => {
    if (!points[r.division]) points[r.division] = 0;
    // Annex H logic for overall: usually points are given based on rank (1st=7, 2nd=6, etc.)
    // But request said "Lowest Sum of Ranks for Overall Top Division"
    points[r.division] += r.final_rank;
  });
  return points;
};
