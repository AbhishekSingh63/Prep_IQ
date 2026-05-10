import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(userInfo));
      } catch {
        // Corrupt data — clear it
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        if (rememberMe) {
          localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(data));
        }
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: 'Login failed. Please check your connection.' };
    }
  };

  const register = async (name, email, password, rememberMe = true) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        if (rememberMe) {
          localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(data));
        }
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: 'Registration failed. Please check your connection.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
