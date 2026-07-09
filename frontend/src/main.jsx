import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Patch fetch globally to prepend API base URL for /api/ calls
const BASE = import.meta.env.VITE_API_URL || "";
if (BASE) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (url, options) => {
    if (typeof url === "string" && url.startsWith("/api/")) {
      return originalFetch(`${BASE}${url}`, options);
    }
    return originalFetch(url, options);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)