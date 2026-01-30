import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { RUBRICS } from '../constants';
import { Contestant, Judge, RawScores, Category } from '../types';
import { calculateRadioDeduction, calculateTVDeduction } from '../services/tabulation';

interface Props {
  judge: Judge;
}

const JudgeScoreSheet: React.FC<Props> = ({ judge }) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [scores, setScores] = useState<RawScores>({});
  const [timeInSeconds, setTimeInSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const rubric = RUBRICS[judge.assigned_category];

  useEffect(() => {
    const fetchContestants = async () => {
      const { data, error } = await supabase
        .from('contestants')
        .select('*')
        .eq('category', judge.assigned_category);
      
      if (data) setContestants(data);
    };

    fetchContestants();
  }, [judge.assigned_category]);

  const handleScoreChange = (criterionId: string, value: string) => {
    const num = parseFloat(value) || 0;
    const max = rubric.criteria.find(c => c.id === criterionId)?.maxScore || 100;
    
    setScores(prev => ({
      ...prev,
      [criterionId]: Math.min(num, max)
    }));
  };

  const calculateTotal = () => {
    // Fix: Explicitly type the reduce parameters to avoid unknown operator errors (Line 46 fix)
    let total = Object.values(scores).reduce((acc: number, s: any) => acc + (s as number), 0);
    let deduction = 0;
    if (judge.assigned_category === 'Radio Broadcasting') {
      deduction = calculateRadioDeduction(timeInSeconds);
    } else if (judge.assigned_category === 'TV Broadcasting') {
      deduction = calculateTVDeduction(timeInSeconds);
    }
    // Fix: Ensure total and deduction are treated as numbers for arithmetic operations (Line 53 fix)
    return { total, deduction, final: Math.max(0, (total as number) - (deduction as number)) };
  };

  const handleSubmit = async () => {
    if (!selectedContestant) return;
    setIsSubmitting(true);
    const { total, deduction, final } = calculateTotal();

    const scoreData = {
      contestant_id: selectedContestant.id,
      judge_id: judge.id,
      raw_scores: scores,
      total_score: total,
      time_deduction: deduction,
      final_score: final,
      is_final: true
    };

    const { error } = await supabase.from('scores').insert([scoreData]);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedContestant(null);
        setScores({});
        setTimeInSeconds(0);
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Judge Score Sheet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Select Contestant Code</label>
            <select 
              className="w-full p-2.5 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              onChange={(e) => {
                const c = contestants.find(con => con.id === e.target.value);
                setSelectedContestant(c || null);
              }}
              value={selectedContestant?.id || ''}
            >
              <option value="">-- Choose Participant --</option>
              {contestants.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Judge Assignment</label>
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg font-semibold">
              {judge.assigned_category}
            </div>
          </div>
        </div>

        {selectedContestant && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-blue-900">Anonymized Profile</h3>
              <p className="text-sm text-slate-500">ID: {selectedContestant.code} | Level: {selectedContestant.level} | Medium: {selectedContestant.medium}</p>
            </div>

            <div className="space-y-6">
              {rubric.criteria.map(criterion => (
                <div key={criterion.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800">{criterion.label}</h4>
                      <p className="text-sm text-slate-600 italic">{criterion.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 uppercase">Max Score</span>
                      <p className="text-lg font-bold text-blue-600">{criterion.maxScore}</p>
                    </div>
                  </div>
                  <input
                    type="number"
                    max={criterion.maxScore}
                    min={0}
                    step={0.5}
                    value={scores[criterion.id] || ''}
                    onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-lg font-mono"
                    placeholder={`Enter score (0 - ${criterion.maxScore})`}
                  />
                </div>
              ))}

              {(judge.assigned_category.includes('Broadcasting')) && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2">Technical Timer (Seconds)</h4>
                  <input
                    type="number"
                    value={timeInSeconds || ''}
                    onChange={(e) => setTimeInSeconds(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-lg font-mono"
                    placeholder="Enter total duration in seconds"
                  />
                  <p className="text-xs text-amber-600 mt-2 italic">
                    {judge.assigned_category === 'Radio Broadcasting' ? 'Limit: 300s (5m)' : 'Limit: 360s (6m)'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-blue-900 rounded-xl text-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-200 font-medium">Raw Total:</span>
                <span className="text-xl font-bold">{calculateTotal().total}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-red-300">
                <span className="font-medium">Time Deductions:</span>
                <span className="text-xl font-bold">-{calculateTotal().deduction}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-blue-800">
                <span className="text-lg font-bold uppercase tracking-wider">Final Score:</span>
                <span className="text-4xl font-extrabold">{calculateTotal().final.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(scores).length < rubric.criteria.length}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              }`}
            >
              {isSubmitting ? 'Finalizing...' : 'Submit Official Score'}
            </button>
            
            {success && (
              <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-center font-bold animate-bounce">
                Score recorded successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeScoreSheet;