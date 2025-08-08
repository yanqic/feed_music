import React from 'react';
import NewsCard from './NewsCard';
import './NewsGrid.scss';

const NewsGrid = ({ news, loading, hasMore }) => {
  return (
    <div className="news-grid-container">
      <div className="news-grid">
        {news.map(item => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;