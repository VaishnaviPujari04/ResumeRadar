import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("rr_token") || null);

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setUser(data))
        .catch(() => logout());
    }
  }, [token]);

  function login(token, userData) {
    localStorage.setItem("rr_token", token);
    setToken(token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("rr_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}