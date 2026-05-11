import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * fetchWithRetry
 * Wraps fetch with:
 *  - An AbortController timeout (default 15 s — covers Vercel cold starts)
 *  - One automatic retry after `retryDelay` ms on network failure
 *
 * On Vercel's free tier a cold start can take up to ~10 s before the
 * function responds. A 15 s timeout + 1 retry gives the best UX without
 * making the user wait forever.
 */
async function fetchWithRetry(url, options, { timeoutMs = 15000, retries = 1, retryDelay = 2000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const isLast = attempt === retries;
      if (isLast) throw err;
      // Wait before retrying
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

      // Server responded but credentials / server error
      return {
        success: false,
        message: data.message || 'Login failed. Please try again.',
      };
    } catch (err) {
      console.error('[AuthContext] login error:', err);
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'The server is taking too long to respond. It may be waking up — please wait a moment and try again.',
        };
      }
      return {
        success: false,
        message: 'Cannot reach the server. Please check your internet connection.',
      };
    }
  };

  const register = async (name, email, password, rememberMe = true) => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
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

      return {
        success: false,
        message: data.message || 'Registration failed. Please try again.',
      };
    } catch (err) {
      console.error('[AuthContext] register error:', err);
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'The server is taking too long to respond. It may be waking up — please wait a moment and try again.',
        };
      }
      return {
        success: false,
        message: 'Cannot reach the server. Please check your internet connection.',
      };
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
