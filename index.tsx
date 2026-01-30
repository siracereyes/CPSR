
import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Fixed: Explicitly use React.Component and ensure state is correctly typed to resolve property existence errors (Line 17, 29, 39, 52 fix)
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  render() {
    // Fixed: state access is now correctly resolved through React.Component inheritance
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Application Crash</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              The interface encountered a fatal error. This often happens if the Supabase project is not yet initialized with the required SQL schema.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 overflow-hidden border border-slate-200">
              <code className="text-[10px] text-red-500 break-all">
                {this.state.error?.toString() || "Unknown Error"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all shadow-md"
            >
              Restart System
            </button>
          </div>
        </div>
      );
    }
    // Fixed: props access is now correctly resolved via React.Component base class
    return this.props.children;
  }
}

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
  } catch (err) {
    console.error("Failed to initialize ReactDOM:", err);
  }
}
