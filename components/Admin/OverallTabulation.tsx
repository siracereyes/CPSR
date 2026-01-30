import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { tabulateResults, calculateDivisionPoints } from '../../services/tabulation';
import { Contestant, ScoreEntry, Category, Level, Medium } from '../../types';
import { CATEGORIES, LEVELS, MEDIUMS } from '../../constants';

const OverallTabulation: React.FC = () => {
  const [divisionStandings, setDivisionStandings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateOverall();
  }, []);

  const calculateOverall = async () => {
    setLoading(true);
    const { data: contestants } = await supabase.from('contestants').select('*');
    const { data: scores } = await supabase.from('scores').select('*');
    
    if (!contestants || !scores) {
      setLoading(false);
      return;
    }

    const overallPoints: Record<string, number> = {};

    // For each combination of Category, Level, and Medium, run tabulation
    for (const cat of CATEGORIES) {
      for (const lvl of LEVELS) {
        for (const med of MEDIUMS) {
          const catContestants = contestants.filter(c => c.category === cat && c.level === lvl && c.medium === med);
          const catScores = scores.filter(s => s.category === cat && s.level === lvl && s.medium === med);
          
          if (catContestants.length > 0) {
            const results = tabulateResults(catContestants, catScores);
            const points = calculateDivisionPoints(results);
            
            Object.entries(points).forEach(([div, pt]) => {
              overallPoints[div] = (overallPoints[div] || 0) + pt;
            });
          }
        }
      }
    }

    setDivisionStandings(overallPoints);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-400">Aggregating Ranks Across All Annexes...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black italic">Overall Standings</h2>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">Sum of Ranks Algorithm (Annex H)</p>
          </div>
          <button 
            onClick={calculateOverall}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2"/></svg>
          </button>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(divisionStandings)
              // Fix: Explicitly cast a and b to numbers to resolve arithmetic operation errors on inferred unknown types (Line 71 fix)
              .sort(([, a], [, b]) => (a as number) - (b as number))
              .map(([division, points], idx) => (
                <div key={division} className={`p-6 rounded-2xl border-2 transition-all ${
                  idx === 0 ? 'bg-yellow-50 border-yellow-200 scale-105 shadow-lg' : 
                  idx === 1 ? 'bg-slate-50 border-slate-200' :
                  idx === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs font-black px-2 py-1 rounded ${
                      idx === 0 ? 'bg-yellow-200 text-yellow-800' : 
                      'bg-slate-200 text-slate-600'
                    }`}>RANK #{idx + 1}</span>
                    {idx === 0 && <span className="text-2xl">🏆</span>}
                  </div>
                  <h4 className="text-xl font-black text-slate-800 uppercase mb-1">{division}</h4>
                  <div className="flex items-end justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase">Aggregate Points</span>
                    <span className="text-3xl font-black text-blue-900">{points}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t text-slate-500 text-xs font-medium italic">
          * Calculated based on Annex H methodology. Lowest aggregate points (sum of final ranks) determines the Top Performing Division.
        </div>
      </div>
    </div>
  );
};

export default OverallTabulation;