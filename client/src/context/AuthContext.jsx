import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set base URL from environment variable if provided
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qr_token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    async function verifyUserSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session verify failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyUserSession();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const res = await axios.post('/api/auth/login', { identifier, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('qr_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const loginWithGoogle = async (credential, email, expectedRole) => {
    try {
      const res = await axios.post('/api/auth/google-login', { credential, email, expectedRole });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('qr_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google OAuth authentication failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('qr_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
