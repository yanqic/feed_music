import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/users/login', {
    username,
    password,
  });
  
  return {
    token: response.data.access_token,
    user: response.data.user,
  };
};

export const register = async (username, email, password) => {
  const response = await api.post('/users/register', {
    username,
    email,
    password,
  });
  
  return response.data;
};

export const logout = async () => {
  return await api.post('/users/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};