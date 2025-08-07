import React from 'react';
import NewsCard from './NewsCard';
import './NewsGrid.scss';

const NewsGrid = ({ news }) => {
  return (
    <div className="news-grid">
      {news.map(item => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
};

export default NewsGrid;