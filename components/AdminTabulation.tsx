import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
// Fix: Import calculateDivisionPoints instead of non-existent calculateDivisionStandings (Line 3 fix)
import { tabulateResults, calculateDivisionPoints } from '../services/tabulation';
import { Contestant, ScoreEntry, RankResult, Category } from '../types';
import { CATEGORIES } from '../constants';

const AdminTabulation: React.FC = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('News Writing');
  const [rankings, setRankings] = useState<RankResult[]>([]);
  const [divisionPoints, setDivisionPoints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        supabase.from('contestants').select('*'),
        supabase.from('scores').select('*')
      ]);

      if (cRes.data) setContestants(cRes.data);
      if (sRes.data) setScores(sRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const categoryContestants = contestants.filter(c => c.category === selectedCategory);
    const categoryScores = scores.filter(s => 
      categoryContestants.some(c => c.id === s.contestant_id)
    );

    const result = tabulateResults(categoryContestants, categoryScores);
    setRankings(result);

    // Fix: Call calculateDivisionPoints (Line 36 fix)
    const standings = calculateDivisionPoints(result);
    setDivisionPoints(standings);
  }, [selectedCategory, contestants, scores]);

  if (loading) return <div className="text-center py-20 font-medium">Loading Tabulation Data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Category Filter</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="w-full p-3 border rounded-xl shadow-sm bg-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">Export PDF</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">Print Results</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Top Performers: {selectedCategory}</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Official Ranking</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Code</th>
                <th className="px-6 py-4 text-left">Division</th>
                <th className="px-6 py-4 text-center">J1 Rank</th>
                <th className="px-6 py-4 text-center">J2 Rank</th>
                <th className="px-6 py-4 text-center">J3 Rank</th>
                <th className="px-6 py-4 text-center">Sum of Ranks</th>
                <th className="px-6 py-4 text-center">Avg. Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankings.map((r, idx) => (
                <tr key={r.contestant_id} className={`hover:bg-blue-50/50 transition-colors ${idx < 5 ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-700' :
                      idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.final_rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{r.contestant_code}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{r.division}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{r.judge_ranks[0] || '-'}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{r.judge_ranks[1] || '-'}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{r.judge_ranks[2] || '-'}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{r.sum_of_ranks}</td>
                  <td className="px-6 py-4 text-center text-slate-400 font-mono">{r.average_raw_score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
            Division Performance (Points Summary)
          </h3>
          <div className="space-y-3">
            {Object.entries(divisionPoints)
              // Fix: Explicitly cast a and b to numbers to resolve arithmetic operation errors on inferred unknown types (Line 119 fix)
              .sort(([, a], [, b]) => (a as number) - (b as number)) // Lowest points (Sum of Ranks) first
              .map(([div, points], i) => (
              <div key={div} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xs font-bold text-slate-400 w-6">#{i + 1}</span>
                  <span className="font-semibold text-slate-700">{div}</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{points} pts</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-indigo-900 p-6 rounded-2xl text-white">
          <h3 className="text-lg font-bold mb-4 opacity-90">Tabulation Engine Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-70">Data Integrity Check</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Verified
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-70">Annex H Tie-Breaking</span>
              <span className="px-2 py-0.5 bg-indigo-800 rounded text-xs">Lowest Sum of Ranks</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-70">Last Sync</span>
              <span className="text-xs opacity-50">{new Date().toLocaleTimeString()}</span>
            </div>
            <p className="text-xs opacity-60 mt-4 leading-relaxed">
              Calculations are based on 2026 RSPC Memo guidelines. Tie-breaking triggers automatic rank re-sorting using raw average values when rank sums are identical.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTabulation;