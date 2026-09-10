import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Silently wake up the Render free-tier backend on app load
// This eliminates the 30-60s cold start delay on first API call
function BackendWakeup() {
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || '/api';
    fetch(`${url}/health`).catch(() => {});
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BackendWakeup />
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);