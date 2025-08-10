import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, createNews, updateNews, deleteNews } from '../services/news';
import { useAuth } from '../contexts/AuthContext';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import '../components/ImageWithPlaceholder.scss';
import './NewsManagementPage.scss';

const NewsManagementPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(6); // 每页显示数量
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  const fetchNews = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const response = await getNews(page, pageSize, currentUser?.id);
      setNews(response.items);
      setTotalPages(response.pages);
      setTotalItems(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      let errorMessage = '获取新闻列表失败。';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const firstError = error.response.data.detail[0];
          errorMessage += firstError?.msg || '请稍后重试';
        } else {
          errorMessage += error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += '请检查网络连接后重试';
      }
      setError(errorMessage);
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
      setError('');
      setSuccess('');
      
      if (editingNews) {
        // 更新现有新闻
        await updateNews(editingNews.id, formData);
        setSuccess('新闻更新成功！');
      } else {
        // 创建新新闻
        await createNews(formData);
        setSuccess('新闻创建成功！');
      }
      
      // 重置表单和编辑状态
      setFormData({ title: '', description: '', image_url: '' });
      setEditingNews(null);
      
      // 重新获取新闻列表
      fetchNews(1); // 创建/更新后回到第一页
    } catch (error) {
      console.error('Failed to save news:', error);
      let errorMessage = editingNews ? '更新新闻失败。' : '创建新闻失败。';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const firstError = error.response.data.detail[0];
          errorMessage += firstError?.msg || '请检查输入信息';
        } else {
          errorMessage += error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += '请检查输入信息后重试';
      }
      setError(errorMessage);
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
        setError('');
        setSuccess('');
        await deleteNews(id);
        setSuccess('新闻删除成功！');
        // 如果当前页没有数据了，回到上一页
        const newTotalItems = totalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / pageSize);
        const targetPage = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
        fetchNews(targetPage);
      } catch (error) {
        console.error('Failed to delete news:', error);
        let errorMessage = '删除新闻失败。';
        if (error.response?.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            const firstError = error.response.data.detail[0];
            errorMessage += firstError?.msg || '请稍后重试';
          } else {
            errorMessage += error.response.data.detail;
          }
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += '请稍后重试';
        }
        setError(errorMessage);
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
      {/* 错误和成功消息显示 */}
      {error && (
        <div className="message-container error-message">
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="message-container success-message">
          <span>{success}</span>
          <button className="close-btn" onClick={() => setSuccess('')}>×</button>
        </div>
      )}
      
      <div className="management-container">
        {/* 左侧：新闻表单 */}
        <div className="form-section">
          <div className="section-header">
            <h2>{editingNews ? '编辑新闻' : '创建新闻'}</h2>
            {editingNews && (
              <button className="cancel-edit-btn" onClick={handleCancel}>
                取消编辑
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="news-form">
            <div className="form-group">
              <label htmlFor="title">新闻标题</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入新闻标题"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">新闻描述</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请输入新闻描述内容"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image_url">封面图片URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image_url && (
                <div className="image-preview">
                  <ImageWithPlaceholder 
                    src={formData.image_url} 
                    alt="预览"
                    className="form-image-preview"
                  />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {editingNews ? '更新中...' : '创建中...'}
                  </>
                ) : (
                  editingNews ? '更新新闻' : '创建新闻'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* 右侧：新闻列表 */}
        <div className="list-section">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          <div className="news-list">
            {news.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <h3>您暂未创建新闻</h3>
                <p>创建您的第一条新闻开始管理内容吧！</p>
              </div>
            ) : (
              news.map(item => (
                <div key={item.id} className={`news-item ${editingNews?.id === item.id ? 'editing' : ''}`}>
                  <div className="news-content">
                    <div className="news-image">
                      <ImageWithPlaceholder 
                        src={item.image_url} 
                        alt={item.title}
                        className="news-image-placeholder"
                      />
                    </div>
                    <div className="news-info">
                      <h3>{item.title}</h3>
                      <p className="news-description">{item.description}</p>
                      <div className="news-meta">
                        <span className="author-info">
                          作者: {item.creator?.username || currentUser?.username || '未知'}
                        </span>
                        <span className="created-date">
                          创建时间: {new Date(item.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        {item.updated_at !== item.created_at && (
                          <span className="updated-date">
                            更新时间: {new Date(item.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="news-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(item)}
                      disabled={loading}
                    >
                      编辑
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* 分页组件 */}
          <div className="pagination-section">
            {
              <div className="pagination-controls">
                <button 
                  className="pagination-btn prev-btn"
                  onClick={() => fetchNews(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  上一页
                </button>
                
                <div className="page-numbers">
                  {/* 生成页码按钮 */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // 调整起始页，确保显示足够的页码
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    // 第一页
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          className={`pagination-btn page-btn ${currentPage === 1 ? 'active' : ''}`}
                          onClick={() => fetchNews(1)}
                          disabled={loading}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                      }
                    }
                    
                    // 中间页码
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`pagination-btn page-btn ${currentPage === i ? 'active' : ''}`}
                          onClick={() => fetchNews(i)}
                          disabled={loading}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // 最后一页
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          className={`pagination-btn page-btn ${currentPage === totalPages ? 'active' : ''}`}
                          onClick={() => fetchNews(totalPages)}
                          disabled={loading}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()
                  }
                </div>
                
                <button 
                  className="pagination-btn next-btn"
                  onClick={() => fetchNews(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  下一页
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsManagementPage;