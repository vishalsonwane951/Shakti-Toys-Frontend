import { useEffect } from 'react';

// Silently wake up the Render free-tier backend on app load.
// This eliminates the 30-60s cold start delay on first API call.
export default function BackendWakeup() {
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || '/api';
    fetch(`${url}/health`).catch(() => {});
  }, []);
  return null;
}