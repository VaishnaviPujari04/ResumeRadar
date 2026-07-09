const BASE = import.meta.env.VITE_API_URL || "";

// Override global fetch to automatically prepend API base URL
const originalFetch = window.fetch.bind(window);

export function apiFetch(path, options = {}) {
  return originalFetch(`${BASE}${path}`, options);
}