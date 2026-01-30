
import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

/**
 * RSPC Core Error Boundary
 */
// Fix: Explicitly extend React.Component and declare state/props to resolve "Property does not exist" errors in specific TypeScript configurations
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declaring state to satisfy property existence checks (Lines 21, 39, 56)
  public state: ErrorBoundaryState;
  // Fix: Explicitly declaring props to satisfy property existence checks (Line 71)
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.group("RSPC 2026 - Critical Runtime Error");
    console.error("Error:", error);
    console.error("Info:", errorInfo);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
               </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Application Crashed</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              The interface encountered an unrecoverable error. This is often caused by a missing database key or a network timeout.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-3xl text-left mb-8 border border-slate-200 overflow-hidden shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Diagnostics</p>
              <code className="text-[11px] font-mono text-red-600 break-all leading-tight block bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                {this.state.error?.toString() || "Unknown Initialization Error"}
              </code>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              Restart Tabulation Engine
            </button>
          </div>
        </div>
      );
    }
    
    // Fix: Explicitly returned children from props (Line 71)
    return this.props.children;
  }
}

// Initializing the application root
const init = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log("RSPC Engine Mounted Successfully.");
    } catch (err) {
      console.error("CRITICAL: Failed to mount React application root.", err);
      rootElement.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; text-align: center; color: red;"><h1>Engine Mounting Failed</h1><p>${err}</p></div>`;
    }
  }
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
