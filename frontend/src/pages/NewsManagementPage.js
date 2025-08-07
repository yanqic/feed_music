import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, createNews, updateNews, deleteNews } from '../services/news';
import { useAuth } from '../contexts/AuthContext';
import './NewsManagementPage.scss';

const NewsManagementPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews(1, 100); // 获取所有新闻
      setNews(response.items);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      fetchNews();
    }
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingNews) {
        // 更新现有新闻
        await updateNews(editingNews.id, formData);
      } else {
        // 创建新新闻
        await createNews(formData);
      }
      
      // 重置表单和编辑状态
      setFormData({ title: '', description: '', image_url: '' });
      setEditingNews(null);
      
      // 重新获取新闻列表
      fetchNews();
    } catch (error) {
      console.error('Failed to save news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      image_url: newsItem.image_url
    });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条新闻吗？')) {
      try {
        setLoading(true);
        await deleteNews(id);
        fetchNews();
      } catch (error) {
        console.error('Failed to delete news:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleCancel = () => {
    setEditingNews(null);
    setFormData({ title: '', description: '', image_url: '' });
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="news-management-page">
      <h1>{editingNews ? '编辑新闻' : '创建新闻'}</h1>
      
      <form onSubmit={handleSubmit} className="news-form">
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">图片URL</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? '保存中...' : (editingNews ? '更新' : '创建')}
          </button>
          
          {editingNews && (
            <button type="button" onClick={handleCancel}>
              取消
            </button>
          )}
        </div>
      </form>
      
      <h2>新闻列表</h2>
      
      {loading && <p>加载中...</p>}
      
      <div className="news-list">
        {news.map(item => (
          <div key={item.id} className="news-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="news-actions">
              <button onClick={() => handleEdit(item)}>编辑</button>
              <button onClick={() => handleDelete(item.id)}>删除</button>
            </div>
          </div>
        ))}
        
        {news.length === 0 && !loading && (
          <p>暂无新闻。创建您的第一条新闻！</p>
        )}
      </div>
    </div>
  );
};

export default NewsManagementPage;