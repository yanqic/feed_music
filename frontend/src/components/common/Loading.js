import React from 'react';
import './Loading.scss';

const Loading = ({ className = '' }) => {
  return (
    <div className={`loading-container ${className}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <img src="/logo-white.svg" alt="Logo" className="logo-icon" />
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;