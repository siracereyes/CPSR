
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global shim for environments where process might be undefined (common in browser ESM)
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Fixed ErrorBoundary by ensuring state and props are properly recognized by the compiler
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  // Explicitly declare state and props to resolve TS errors where inheritance members are not found
  state: { hasError: boolean, error: any };
  props: { children: React.ReactNode };

  constructor(props: any) {
    super(props);
    // Initialize state
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    // Check state for error
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
            <p className="text-slate-600 mb-6 text-sm">
              The application failed to start. This is usually due to missing environment variables or network issues during module loading.
            </p>
            <pre className="text-[10px] bg-slate-100 p-4 rounded text-left overflow-x-auto text-red-500 mb-6 font-mono whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }
    // Return children if no error
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
