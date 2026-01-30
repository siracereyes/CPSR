
// IMPORTANT: Shim process before any other imports
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  showDetails: boolean;
}

// Fix: Defining explicit interfaces for props and state to resolve type errors where 'state', 'setState', and 'props' were not recognized as members of ErrorBoundary.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Initialize state with the correct type structure
    this.state = { hasError: false, error: null, showDetails: false };
  }

  // Fix: Explicitly return the State type to avoid inference issues
  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("RSPC App Crash:", error, errorInfo);
  }

  render() {
    // Fix: Correctly access this.state which is now properly typed
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Startup Failure</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              The application encountered a fatal error during initialization. This is usually caused by missing environment variables (API_KEY) in Vercel.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                Reload Application
              </button>
              
              <button 
                // Fix: Correctly access this.setState and this.state
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium underline"
              >
                {this.state.showDetails ? "Hide Error Log" : "Show Error Log"}
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left border border-slate-200 overflow-hidden">
                <p className="text-[10px] font-mono text-red-500 break-all">
                  {this.state.error?.stack || this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    // Fix: Correctly access this.props which is now properly typed
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
