
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
        setErrorMessage(`Failed to load contestants: ${err.message}`);
      }
    };
    fetchContestants();
  }, [assignment]);

  const handleScoreChange = (id: string, val: string) => {
    setErrorMessage(null);
    const num = parseFloat(val);
    if (isNaN(num)) {
       setScores(prev => {
         const next = { ...prev };
         delete next[id];
         return next;
       });
       return;
    }

    const criterion = rubric.criteria.find(c => c.id === id);
    if (criterion) {
      if (num > criterion.maxScore) {
        setErrorMessage(`The score for "${criterion.label}" exceeds the maximum of ${criterion.maxScore}.`);
      }
      setScores(prev => ({ ...prev, [id]: Math.min(Math.max(0, num), criterion.maxScore) }));
    }
  };

  // Fix: Explicitly type the return object to resolve toFixed error on unknown types (Fix for line 234)
  const calculateResults = (): { rawTotal: number; deduction: number; final: number } => {
    // Fix: Explicitly type the reduce parameters and generic to ensure arithmetic operations work (Fix for line 76)
    const rawTotal = Object.values(scores).reduce<number>((acc, val) => acc + (Number(val) || 0), 0);
    let deduction = 0;
    if (isBroadcast) {
      deduction = assignment.category === 'Radio Broadcasting' 
        ? calculateRadioDeduction(timerValue) 
        : calculateTVDeduction(timerValue);
    }
    return { 
      rawTotal: rawTotal, 
      deduction: deduction, 
      final: Math.max(0, rawTotal - deduction) 
    };
  };

  const validate = () => {
    if (!selectedId) return "Please select a contestant code.";
    if (Object.keys(scores).length < rubric.criteria.length) return "All criteria must be graded before submission.";
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
      setErrorMessage(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const results = calculateResults();

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
            {assignment.category}
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Digital Score Sheet</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">{assignment.medium} Medium • {assignment.level} Level</p>
        </div>
        <div className="w-full md:w-72">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Select Contestant Code</label>
          <select 
            className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
            value={selectedId}
            onChange={e => {
              setSelectedId(e.target.value);
              setErrorMessage(null);
            }}
          >
            <option value="">-- Choose Participant --</option>
            {contestants.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-pulse">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p className="text-sm font-bold">{errorMessage}</p>
        </div>
      )}

      {!selectedId ? (
        <div className="py-24 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
             </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-400">Please select a participant to begin scoring</h3>
          <p className="text-slate-300 text-sm mt-2">All entries are recorded securely and in real-time.</p>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="grid grid-cols-1 gap-8">
            {rubric.criteria.map(c => (
              <div key={c.id} className="relative p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-blue-100 transition-all group shadow-sm hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="max-w-xl">
                    <h4 className="text-xl font-black text-slate-800 mb-1">{c.label}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{c.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Weight</span>
                    <span className="text-3xl font-black text-blue-600">{c.maxScore}%</span>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    max={c.maxScore}
                    value={scores[c.id] === undefined ? '' : scores[c.id]}
                    onChange={e => handleScoreChange(c.id, e.target.value)}
                    className="w-full p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all text-2xl font-black text-slate-800"
                    placeholder={`Enter Score (0 - ${c.maxScore})`}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">
                    / {c.maxScore}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isBroadcast && (
            <div className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-black text-amber-900">Technical Production Timer</h4>
               </div>
              <p className="text-sm text-amber-700 mb-6 font-medium leading-relaxed">
                Enter total production duration in <strong>seconds</strong>. 
                System will automatically apply Annex {assignment.category === 'Radio Broadcasting' ? 'C' : 'F'} deductions.
              </p>
              <input 
                type="number"
                value={timerValue || ''}
                onChange={e => setTimerValue(parseInt(e.target.value) || 0)}
                className="w-full p-6 border-2 border-white rounded-2xl outline-none focus:border-amber-400 transition-all text-2xl font-black bg-white text-amber-900 shadow-inner"
                placeholder="Duration in seconds (e.g. 305)"
              />
            </div>
          )}

          <div className="sticky bottom-6 bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-10 border-4 border-white">
            <div className="flex flex-wrap justify-center gap-12">
              <div className="text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Raw Total</span>
                <span className="text-4xl font-black tabular-nums">{results.rawTotal.toFixed(1)}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black text-red-400/80 uppercase tracking-widest block mb-2">Penalties</span>
                <span className="text-4xl font-black text-red-400 tabular-nums">-{results.deduction.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="h-px w-full lg:w-px lg:h-12 bg-white/10 hidden lg:block"></div>

            <div className="text-center lg:text-left">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Official Final Score</span>
              <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{results.final.toFixed(1)}</span>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full lg:w-auto px-16 py-6 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isSubmitting ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : 'Submit Record'}
            </button>
          </div>
          
          {isSuccess && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] p-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-2xl animate-bounce border-2 border-white">
              Official score recorded!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicScoreSheet;