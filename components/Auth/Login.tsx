
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-3xl">R</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Official Login</h2>
          <p className="text-slate-500 mt-2 text-sm">RSPC 2026 Scoring & Tabulation</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@deped.gov.ph"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
        <div className="mt-8 text-center text-xs text-slate-400">
          Authorized personnel only. All access is logged.
        </div>
      </div>
    </div>
  );
};

export default Login;
