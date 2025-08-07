import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register, logout, getCurrentUser } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(user => {
          setCurrentUser(user);
        })
        .catch(err => {
          localStorage.removeItem('token');
          console.error('Failed to get current user:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      setError(null);
      const { token, user } = await login(username, password);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败');
      throw err;
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setError(null);
      const user = await register(username, email, password);
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};