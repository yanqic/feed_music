import React from 'react';

const ImagePlaceholder = ({ width = '100%', height = '200px', className = '' }) => {
  return (
    <div 
      className={`image-placeholder ${className}`}
      style={{ 
        width, 
        height, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" fill="none" />
        <path
          d="M8 56V8H56V56H8ZM12 52H52V12H12V52Z"
          fill="#999"
        />
        <circle cx="20" cy="20" r="4" fill="#999" />
        <path
          d="M52 36L40 24L28 36L16 24L8 32V52H52V36Z"
          fill="#999"
        />
      </svg>
    </div>
  );
};

export default ImagePlaceholder;