import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

class ErrorBoundary extends React.Component {
  /** @param {any} props */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: /** @type {any} */ (null) };
  }
  /** @param {any} error */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  /** 
   * @param {any} error 
   * @param {any} errorInfo
   */
  componentDidCatch(error, errorInfo) {
    console.error('App Crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
