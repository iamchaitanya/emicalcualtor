
import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// PWA Service Worker Registration
// Simplified to prevent "Invalid URL" constructor errors in non-standard environments
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // We register using a relative path. The browser resolves this automatically.
    // We wrap it in a try-catch to handle synchronous URL resolution errors if any.
    try {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('Smart EMI Pro: SW registered', registration.scope);
        })
        .catch((err) => {
          // Handles registration failures (e.g., origin mismatch in preview environments)
          console.warn('Smart EMI Pro: SW registration failed or was blocked:', err.message);
        });
    } catch (e) {
      console.warn('Smart EMI Pro: SW registration error:', e);
    }
  });
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'sans-serif',
          color: '#ef4444',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          background: '#f8fafc'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 800, color: '#1e293b' }}>Something went wrong</h1>
          <pre style={{ 
            background: '#fee2e2', 
            padding: '20px', 
            borderRadius: '12px', 
            maxWidth: '600px', 
            overflow: 'auto',
            fontSize: '14px',
            color: '#991b1b',
            border: '1px solid #fecaca'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 28px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children || null;
  }
}

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
