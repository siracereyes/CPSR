
import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  // Fix: Make children optional to avoid JSX missing prop error during instantiation
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  showDetails: boolean;
}

// Fix: Explicitly extend Component with generics to ensure 'state' and 'props' are correctly typed and recognized
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Initialize component state correctly within the constructor
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("RSPC Critical Failure:", error, errorInfo);
  }

  render() {
    // Fix: Access component state using 'this.state' as required in class components
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Application Crash</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              A fatal error occurred in the React tree. This is usually due to a missing <code>API_KEY</code> or a Supabase connection error.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                Reload Dashboard
              </button>
              
              {/* Fix: Use 'this.setState' and access 'this.state' for state updates and conditional rendering */}
              <button 
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium underline"
              >
                {this.state.showDetails ? "Hide Log" : "View Debug Log"}
              </button>
            </div>

            {/* Fix: Correctly check 'this.state' for conditional display logic */}
            {this.state.showDetails && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left border border-slate-200 overflow-hidden">
                <p className="text-[10px] font-mono text-red-500 break-all whitespace-pre-wrap">
                  {this.state.error?.stack || this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    // Fix: Return 'this.props.children' to properly render wrapped components
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* Fix: ErrorBoundary now correctly identifies children passed via JSX content */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
