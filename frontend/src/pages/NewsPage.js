import React, { useState, useEffect } from 'react';
import NewsGrid from '../components/News/NewsGrid';
import { getNews } from '../services/news';
import './NewsPage.scss';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchNews = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await getNews(pageNum);
      
      if (pageNum === 1) {
        setNews(response.items);
      } else {
        setNews(prevNews => [...prevNews, ...response.items]);
      }
      
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      let errorMessage = '获取新闻失败。';
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
    fetchNews();
  }, []);
  
  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage);
    }
  };

  return (
    <div className="news-container">
      {/* 错误消息显示 */}
      {error && (
        <div className="error-message-banner">
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}
      
      <div className="news-page">
        <div className="news-grad-wrap">
          <NewsGrid 
            news={news} 
            loading={loading}
            hasMore={page < totalPages}
          />
        </div>
      </div>

      {/* 固定位置的加载更多按钮 */}
      {page < totalPages && (
        <button 
          className="fixed-load-more-button" 
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? '加载中...' : '加载更多'}
         </button>
       )}
     </div>
   );
};

export default NewsPage;