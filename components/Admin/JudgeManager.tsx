
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { CATEGORIES, LEVELS, MEDIUMS } from '../../constants';
import { Category, Level, Medium } from '../../types';

const JudgeManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedJudge, setSelectedJudge] = useState('');
  const [category, setCategory] = useState<Category>('News Writing');
  const [level, setLevel] = useState<Level>('Elementary');
  const [medium, setMedium] = useState<Medium>('English');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profs } = await supabase.from('profiles').select('*').eq('role', 'judge');
    const { data: asgs } = await supabase.from('judge_assignments').select(`*, profiles(full_name)`);
    if (profs) setUsers(profs);
    if (asgs) setAssignments(asgs);
  };

  const handleAssign = async () => {
    if (!selectedJudge) return;
    setLoading(true);
    const { error } = await supabase.from('judge_assignments').insert({
      judge_id: selectedJudge,
      category,
      level,
      medium
    });
    setLoading(false);
    if (!error) fetchData();
    else alert(error.message);
  };

  const removeAssignment = async (id: string) => {
    await supabase.from('judge_assignments').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border shadow-sm h-fit sticky top-24">
        <h3 className="text-xl font-bold mb-6 text-slate-800">Create Assignment</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Judge</label>
            <select className="w-full p-3 border rounded-xl" value={selectedJudge} onChange={e => setSelectedJudge(e.target.value)}>
              <option value="">-- Choose Judge --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select className="w-full p-3 border rounded-xl" value={category} onChange={e => setCategory(e.target.value as Category)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Level</label>
                <select className="w-full p-3 border rounded-xl" value={level} onChange={e => setLevel(e.target.value as Level)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Medium</label>
                <select className="w-full p-3 border rounded-xl" value={medium} onChange={e => setMedium(e.target.value as Medium)}>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAssign}
            disabled={loading || !selectedJudge}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Add Assignment
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Current Judge Assignments</h3>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-4">Judge</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{a.profiles?.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">{a.category}</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold">{a.level}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{a.medium}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => removeAssignment(a.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JudgeManager;
