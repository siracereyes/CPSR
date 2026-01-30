
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  customNav?: string[];
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, customNav }) => {
  const tabs = customNav || ['Judging', 'Tabulation', 'Analytics', 'System'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">RSPC 2026</h1>
              <p className="text-xs text-blue-200 uppercase tracking-tighter">Regional School Press Conference</p>
            </div>
          </div>
          <nav className="flex space-x-1 mt-4 md:mt-0 bg-white/10 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-900 shadow-md' 
                    : 'text-blue-100 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 text-slate-400 py-8 text-center text-sm">
        <p className="font-medium text-slate-500">&copy; 2026 Department of Education Philippines • Regional Office</p>
        <p className="mt-1 text-xs">Official Scoring & Tabulation System • Version 3.2.0-Alpha</p>
      </footer>
    </div>
  );
};

export default Layout;
