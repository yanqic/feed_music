import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;