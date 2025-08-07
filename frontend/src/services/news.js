import api from './api';

export const getNews = async (page = 1, limit = 6) => {
  const response = await api.get('/news', {
    params: { page, limit },
  });
  
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const createNews = async (newsData) => {
  const response = await api.post('/news', newsData);
  return response.data;
};

export const updateNews = async (id, newsData) => {
  const response = await api.put(`/news/${id}`, newsData);
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};