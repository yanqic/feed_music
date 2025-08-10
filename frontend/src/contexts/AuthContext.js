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
      // token已经在auth.js中设置到localStorage了
      setCurrentUser(user);
      // 强制触发重新渲染
      setTimeout(() => {
        setCurrentUser(prevUser => ({ ...prevUser }));
      }, 100);
      return user;
    } catch (err) {
      let errorMessage = '登录失败';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const firstError = err.response.data.detail[0];
          errorMessage = firstError?.msg || '请检查用户名和密码';
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw err;
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setError(null);
      const user = await register(username, email, password);
      return user;
    } catch (err) {
      let errorMessage = '注册失败';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const firstError = err.response.data.detail[0];
          errorMessage = firstError?.msg || '请检查输入信息';
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
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