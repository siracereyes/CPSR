
import React from 'react';
import { GENERATED_SQL } from '../services/supabase';

const SchemaView: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 text-slate-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Database Setup</h2>
        <p className="text-slate-400">Copy this SQL into your Supabase SQL Editor to initialize the RSPC 2026 Scoring tables.</p>
      </div>
      <div className="relative group">
        <button 
          onClick={() => navigator.clipboard.writeText(GENERATED_SQL)}
          className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
        >
          Copy SQL
        </button>
        <pre className="bg-slate-950 p-6 rounded-xl overflow-x-auto text-sm font-mono border border-slate-800 leading-relaxed max-h-[500px]">
          {GENERATED_SQL}
        </pre>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-800 p-4 rounded-xl">
          <h4 className="font-bold text-blue-400 mb-1">CONTESTANTS</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Stores primary participant data. "Code" is used in UI for anonymization.</p>
        </div>
        <div className="border border-slate-800 p-4 rounded-xl">
          <h4 className="font-bold text-emerald-400 mb-1">SCORES</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Contains JSONB raw scores per rubric and calculated totals/deductions.</p>
        </div>
        <div className="border border-slate-800 p-4 rounded-xl">
          <h4 className="font-bold text-amber-400 mb-1">JUDGES</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Links judges to specific categories and controls score sheet access.</p>
        </div>
      </div>
    </div>
  );
};

export default SchemaView;
