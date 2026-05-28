import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Simple Error Boundary for Diagnosis
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ERR:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fff', color: '#ff0000', height: '100vh', overflow: 'auto' }}>
          <h2>Oops! Something went wrong.</h2>
          <pre style={{ fontSize: '10px' }}>{this.state.error.toString()}</pre>
          <pre style={{ fontSize: '10px' }}>{this.state.error.stack}</pre>
          <button onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global error catcher for non-React errors
window.onerror = (msg, url, line, col, error) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;color:red;z-index:9999;padding:20px;overflow:auto;font-family:monospace;font-size:12px;';
  errDiv.innerHTML = `<h3>Global Error</h3><p>${msg}</p><p>Line: ${line}, Col: ${col}</p><p>${error ? error.stack : ""}</p>`;
  document.body.appendChild(errDiv);
  return false;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
