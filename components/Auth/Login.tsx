
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyWarning, setKeyWarning] = useState(false);

  useEffect(() => {
    // Diagnostic check: If the key starts with AIza, it's a Google API key, 
    // but this project is trying to use it for Supabase.
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).process?.env?.API_KEY || '';
    if (key.startsWith('AIza')) {
      setKeyWarning(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(loginError.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white font-black text-4xl shadow-xl rotate-3">R</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Official Login</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">RSPC 2026 Scoring & Tabulation</p>
        </div>
        
        {keyWarning && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs text-left leading-relaxed animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 font-black uppercase tracking-widest mb-1 text-amber-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              Key Type Mismatch
            </div>
            The <code>API_KEY</code> appears to be a <strong>Google API Key</strong> (Gemini). Supabase requires a <strong>Supabase Anon/Service Key</strong> to connect. Check your environment settings.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:ring-0 focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@deped.gov.ph"
            />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:ring-0 focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 h-14"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : 'Sign In to Dashboard'}
          </button>
        </form>
        <div className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Authorized Personnel Only
        </div>
      </div>
    </div>
  );
};

export default Login;
