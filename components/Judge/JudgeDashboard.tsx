
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { JudgeAssignment } from '../../types';
import DynamicScoreSheet from './DynamicScoreSheet';

const JudgeDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<JudgeAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data } = await supabase
        .from('judge_assignments')
        .select('*')
        .eq('judge_id', userId);
      if (data) setAssignments(data);
      setLoading(false);
    };
    fetchAssignments();
  }, [userId]);

  if (loading) return <div className="text-center py-20 font-bold text-slate-400">Loading Assignments...</div>;

  if (selectedEvent) {
    return (
      <div>
        <button 
          onClick={() => setSelectedEvent(null)}
          className="mb-6 flex items-center text-blue-600 font-bold hover:underline"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
          Back to Events
        </button>
        <DynamicScoreSheet assignment={selectedEvent} userId={userId} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-blue-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome, Judge</h2>
          <p className="opacity-80">You have {assignments.length} assigned categories for scoring today.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map(asg => (
          <button 
            key={asg.id}
            onClick={() => setSelectedEvent(asg)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{asg.category}</span>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" /></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">{asg.medium} • {asg.level}</h4>
            <p className="text-sm text-slate-500">Official RSPC 2026 Scoring Modality</p>
          </button>
        ))}
      </div>
      
      {assignments.length === 0 && (
        <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed">
          <p className="text-slate-400 font-medium">No events currently assigned. Please contact the administrator.</p>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
