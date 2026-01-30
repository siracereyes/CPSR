import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { RUBRICS } from '../../constants';
import { Contestant, JudgeAssignment, RawScores } from '../../types';
import { calculateRadioDeduction, calculateTVDeduction } from '../../services/tabulation';

interface Props {
  assignment: JudgeAssignment;
  userId: string;
}

const DynamicScoreSheet: React.FC<Props> = ({ assignment, userId }) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [scores, setScores] = useState<RawScores>({});
  const [timerValue, setTimerValue] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rubric = RUBRICS[assignment.category] || RUBRICS['News Writing'];
  const isBroadcast = assignment.category.includes('Broadcasting');

  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const { data, error } = await supabase
          .from('contestants')
          .select('*')
          .eq('category', assignment.category)
          .eq('level', assignment.level)
          .eq('medium', assignment.medium);
        
        if (error) throw error;
        if (data) setContestants(data);
      } catch (err: any) {
        setErrorMessage(`Failed to load contestants: ${err.message || 'Unknown network error'}`);
      }
    };
    fetchContestants();
  }, [assignment]);

  const handleScoreChange = (id: string, val: string) => {
    setErrorMessage(null);
    const num = Math.max(0, parseFloat(val) || 0);
    const criterion = rubric.criteria.find(c => c.id === id);
    if (criterion) {
      if (num > criterion.maxScore) {
        setErrorMessage(`${criterion.label} score cannot exceed ${criterion.maxScore}`);
      }
      setScores(prev => ({ ...prev, [id]: Math.min(num, criterion.maxScore) }));
    }
  };

  const calculateResults = () => {
    const rawTotal = Object.values(scores).reduce((acc: number, val: any) => acc + (val as number), 0);
    let deduction = 0;
    if (isBroadcast) {
      deduction = assignment.category === 'Radio Broadcasting' 
        ? calculateRadioDeduction(timerValue) 
        : calculateTVDeduction(timerValue);
    }
    return { 
      rawTotal: rawTotal as number, 
      deduction: deduction as number, 
      final: Math.max(0, (rawTotal as number) - (deduction as number)) 
    };
  };

  const validate = () => {
    if (!selectedId) return "Please select a contestant code.";
    if (Object.keys(scores).length < rubric.criteria.length) return "All rubric criteria must be scored.";
    if (isBroadcast && (timerValue < 0)) return "Invalid production time entered.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const { rawTotal, deduction, final } = calculateResults();

    try {
      const { error } = await supabase.from('scores').upsert({
        contestant_id: selectedId,
        judge_id: userId,
        category: assignment.category,
        level: assignment.level,
        medium: assignment.medium,
        raw_scores: scores,
        total_score: rawTotal,
        time_deduction: deduction,
        final_score: final,
        is_final: true
      }, { onConflict: 'contestant_id, judge_id' });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedId('');
        setScores({});
        setTimerValue(0);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(`Submission failed: ${err.message || 'Database error occurred. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{assignment.category}</h2>
          <p className="text-slate-500 font-medium">{assignment.medium} • {assignment.level}</p>
        </div>
        <div className="w-full md:w-64 text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Participant Code</label>
          <select 
            className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-blue-500 outline-none transition-all font-bold"
            value={selectedId}
            onChange={e => {
              setSelectedId(e.target.value);
              setErrorMessage(null);
            }}
          >
            <option value="">-- Choose Code --</option>
            {contestants.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-pulse">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-bold">{errorMessage}</p>
        </div>
      )}

      {!selectedId ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-400">Please select a participant code to begin scoring</h3>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 gap-6">
            {rubric.criteria.map(c => (
              <div key={c.id} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 group focus-within:border-blue-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-4">
                    <h4 className="text-lg font-extrabold text-slate-800">{c.label}</h4>
                    <p className="text-sm text-slate-500 italic">{c.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase block tracking-tighter">MAX</span>
                    <span className="text-2xl font-black text-blue-600">{c.maxScore}</span>
                  </div>
                </div>
                <input 
                  type="number"
                  step="0.5"
                  value={scores[c.id] || ''}
                  onChange={e => handleScoreChange(c.id, e.target.value)}
                  className={`w-full p-4 border-2 rounded-xl shadow-inner outline-none transition-all text-xl font-bold bg-white ${
                    scores[c.id] > c.maxScore ? 'border-red-300 focus:border-red-500' : 'border-white focus:border-blue-500'
                  }`}
                  placeholder={`Score 0.0 - ${c.maxScore}.0`}
                />
              </div>
            ))}
          </div>

          {isBroadcast && (
            <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-100">
              <h4 className="text-lg font-bold text-amber-900 mb-2">Technical Timer (Duration)</h4>
              <p className="text-sm text-amber-600 mb-4">Enter total actual production time in seconds for automated Annex {assignment.category === 'Radio Broadcasting' ? 'C' : 'F'} deductions.</p>
              <input 
                type="number"
                value={timerValue || ''}
                onChange={e => setTimerValue(parseInt(e.target.value) || 0)}
                className="w-full p-4 border-2 border-white rounded-xl outline-none focus:border-amber-400 transition-all text-xl font-bold bg-white"
                placeholder="Time in seconds (e.g. 305)"
              />
            </div>
          )}

          <div className="sticky bottom-4 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border-4 border-white">
            <div className="flex gap-10">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Raw</span>
                <span className="text-3xl font-black">{calculateResults().rawTotal.toFixed(1)}</span>
              </div>
              <div className="text-center text-red-400">
                <span className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest block mb-1">Penalty</span>
                <span className="text-3xl font-black">-{calculateResults().deduction.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Final Official Score</span>
              <span className="text-5xl font-black">{calculateResults().final.toFixed(1)}</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 ${
                isSubmitting ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isSubmitting ? 'Storing...' : 'Confirm Submission'}
            </button>
          </div>
          {isSuccess && <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-center animate-bounce">Official score recorded successfully!</div>}
        </div>
      )}
    </div>
  );
};

export default DynamicScoreSheet;