import React from 'react';
import './LoadMoreButton.scss';

const LoadMoreButton = ({ onClick, loading }) => {
  return (
    <button 
      className="load-more-button" 
      onClick={onClick} 
      disabled={loading}
    >
      {loading ? '加载中...' : '加载更多'}
    </button>
  );
};

export default LoadMoreButton;