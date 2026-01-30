
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
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
    fetchData();
  }, []);

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

  useEffect(() => {
    const categoryContestants = contestants.filter(c => c.category === selectedCategory);
    const categoryScores = scores.filter(s => 
      categoryContestants.some(c => c.id === s.contestant_id)
    );

    const result = tabulateResults(categoryContestants, categoryScores);
    setRankings(result);

    const standings = calculateDivisionPoints(result);
    setDivisionPoints(standings);
  }, [selectedCategory, contestants, scores]);

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Tabulation...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="w-full md:w-1/2">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-1">Annex Filter</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Print Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Official Ranking</h2>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mt-1">{selectedCategory}</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            Tabulated
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-left">Place</th>
                <th className="px-6 py-6 text-left">Entry Code</th>
                <th className="px-6 py-6 text-left">Division</th>
                <th className="px-6 py-6 text-center">Avg Score</th>
                <th className="px-6 py-6 text-center">Peak Judge</th>
                <th className="px-6 py-6 text-center">Sum of Ranks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rankings.map((r, idx) => (
                <tr key={r.contestant_id} className={`hover:bg-blue-50/30 transition-colors ${idx < 7 ? 'bg-blue-50/10' : ''}`}>
                  <td className="px-10 py-6">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900 rotate-3' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-amber-600 text-white -rotate-2' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {r.final_rank}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-black text-slate-800 text-lg">{r.contestant_code}</td>
                  <td className="px-6 py-6 text-slate-500 font-bold text-sm uppercase tracking-tight">{r.division}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-xl font-black text-blue-600 tabular-nums">{r.average_raw_score.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-6 text-center text-slate-400 font-bold text-sm">
                    {r.max_individual_score.toFixed(1)}
                  </td>
                  <td className="px-6 py-6 text-center">
                     <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-black text-xs">{r.sum_of_ranks}</span>
                  </td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center text-slate-300 font-black text-lg uppercase tracking-widest italic">
                    No scores submitted for this category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Division Standings</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(divisionPoints)
              .sort(([, a], [, b]) => (a as number) - (b as number))
              .map(([div, points], i) => (
              <div key={div} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-300 w-6">#{i + 1}</span>
                  <span className="font-black text-slate-700 uppercase tracking-tight">{div}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-indigo-600 tabular-nums">{points}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PTS</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            * Rank 1 = 1 Point. Lowest total aggregate points wins the Overall Title (Annex H).
          </p>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
              </span>
              Engine Logic
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Tie-Break Algorithm</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-black">Average System</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Data Integrity</span>
                <span className="text-emerald-400 font-black flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                  Verified Sync
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-10">
            Calculations are processed via the 2026 RSPC Tabulation Engine. In cases where averages are identical, the system automatically cross-references the highest individual judge score to resolve rankings without human intervention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTabulation;
