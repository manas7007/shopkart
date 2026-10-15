import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount via GET /customers/me
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers/me');
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      // 401 simply means unauthenticated guest, not an application crash
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/customers/login', { email, password });
      setUser(res.data.customer);
      return { success: true, customer: res.data.customer };
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/customers/register', userData);
      setUser(res.data.customer);
      return { success: true, customer: res.data.customer };
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        fetchCurrentUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
