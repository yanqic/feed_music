import React, { useState, useEffect } from 'react';
import NewsGrid from '../components/News/NewsGrid';
import LoadMoreButton from '../components/News/LoadMoreButton';
import { getNews } from '../services/news';
import './NewsPage.scss';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const fetchNews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getNews(pageNum);
      
      if (pageNum === 1) {
        setNews(response.items);
      } else {
        setNews(prevNews => [...prevNews, ...response.items]);
      }
      
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage);
    }
  };
  
  return (
    <div className="news-container">
      <div className="news-page">
        <h1>最新新闻</h1>
        <NewsGrid news={news} />
        {page < totalPages && (
          <LoadMoreButton onClick={handleLoadMore} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default NewsPage;