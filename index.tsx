
import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("App script starting...");

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Explicitly defining children in props to satisfy both TypeScript and React standard practices
interface ErrorBoundaryProps {
  children?: ReactNode;
}

// Fix: Extending React.Component with explicit generics to ensure props and state are correctly inherited and recognized by TypeScript, resolving the issue where 'this.props' was not found
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare state with interface
  public state: ErrorBoundaryState = { hasError: false, error: null };

  // Fix: Adding explicit constructor to ensure base class properties like 'this.props' are correctly inherited and recognized
  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("Derived state error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render(): ReactNode {
    // Fix: Accessing state safely after ensuring proper class initialization
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
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
          <pre style={{ 
            background: '#fee2e2', 
            padding: '20px', 
            borderRadius: '8px', 
            maxWidth: '800px', 
            overflow: 'auto',
            fontSize: '14px',
            color: '#991b1b' 
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    // Fix: Accessing children through this.props which is now guaranteed by React.Component inheritance and constructor
    return this.props.children || null;
  }
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("React mount called");
  } catch (e) {
    console.error("Failed to mount React app:", e);
    container.innerHTML = `<div style="color:red; padding:20px;">Failed to initialize app: ${e}</div>`;
  }
} else {
  console.error("Root element not found");
}
