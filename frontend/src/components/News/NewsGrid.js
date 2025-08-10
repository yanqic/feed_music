import React from 'react';
import NewsCard from './NewsCard';
import LoadMoreButton from './LoadMoreButton';
import './NewsGrid.scss';

const NewsGrid = ({ news, onLoadMore, loading, hasMore }) => {
  return (
    <div className="news-grid-container">
      <div className="news-grid">
        {news.map(item => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
      {hasMore && (
        <div className="news-grid-footer">
          <div>
            <LoadMoreButton onClick={onLoadMore} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsGrid;