
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import JudgeDashboard from './components/Judge/JudgeDashboard';
import AdminTabulation from './components/AdminTabulation';
import OverallTabulation from './components/Admin/OverallTabulation';
import JudgeManager from './components/Admin/JudgeManager';
import SchemaView from './components/SchemaView';
import { Profile } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (data) setProfile(data);
    } catch (err) {
      console.warn("Profile fetch failed:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verifying RSPC Hub</p>
      </div>
    </div>
  );

  if (!session) return <Login />;

  const isAdmin = profile?.role === 'admin';

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'Dashboard': return <AdminTabulation />;
        case 'Overall': return <OverallTabulation />;
        case 'Judges': return <JudgeManager />;
        case 'System': return <SchemaView />;
        default: return <AdminTabulation />;
      }
    } else {
      return <JudgeDashboard userId={session.user.id} />;
    }
  };

  const navItems = isAdmin 
    ? ['Dashboard', 'Overall', 'Judges', 'System'] 
    : ['Dashboard'];

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} customNav={navItems}>
      <div className="animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
              {profile?.role || 'Restricted Access'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {profile?.full_name || session.user.email}
            </h2>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 text-xs font-bold flex items-center transition-all shadow-sm hover:shadow"
          >
            Sign Out
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {!profile && isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs flex items-center gap-3 text-left">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <p><strong>Database Desync:</strong> No matching record in <code>profiles</code> table for this account. Go to System tab to run SQL setup.</p>
          </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
