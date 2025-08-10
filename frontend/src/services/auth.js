import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/users/login', {
    username,
    password,
  });
  
  // 获取token
  const token = response.data.access_token;
  
  try {
    // 先将token存储到localStorage，这样api拦截器就能自动添加Authorization头
    localStorage.setItem('token', token);
    
    // 获取用户信息
    const userResponse = await api.get('/users/me');
    
    return {
      token: token,
      user: userResponse.data,
    };
  } catch (error) {
    // 如果获取用户信息失败，清除token
    localStorage.removeItem('token');
    throw error;
  }
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