
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import JudgeDashboard from './components/Judge/JudgeDashboard';
import AdminTabulation from './components/AdminTabulation';
import JudgeManager from './components/Admin/JudgeManager';
import SchemaView from './components/SchemaView';
import { Profile } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Session</p>
      </div>
    </div>
  );

  if (!session) return <Login />;

  const isAdmin = profile?.role === 'admin';

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'Dashboard': return <AdminTabulation />;
        case 'Judges': return <JudgeManager />;
        case 'System': return <SchemaView />;
        default: return <AdminTabulation />;
      }
    } else {
      return <JudgeDashboard userId={session.user.id} />;
    }
  };

  const navItems = isAdmin 
    ? ['Dashboard', 'Judges', 'System'] 
    : ['Dashboard'];

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} customNav={navItems}>
      <div className="animate-in fade-in duration-500">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Portal Access: {profile?.role}</span>
            <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h2>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-slate-400 hover:text-red-600 text-sm font-bold flex items-center transition-colors"
          >
            Sign Out
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2"/></svg>
          </button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
