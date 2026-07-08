export const apiFetch = (path, options = {}) => {
  const base = import.meta.env.VITE_API_URL || "";
  return fetch(`${base}${path}`, options);
};