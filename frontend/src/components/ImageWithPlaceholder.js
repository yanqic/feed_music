import React, { useState } from 'react';

const ImageWithPlaceholder = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // SVG占位图片
  const PlaceholderSVG = () => (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="placeholder-svg"
    >
      <rect width="400" height="300" fill="#f0f0f0"/>
      <rect x="50" y="50" width="300" height="200" rx="8" fill="#e0e0e0"/>
      <circle cx="120" cy="120" r="20" fill="#d0d0d0"/>
      <path 
        d="M80 180 L120 140 L160 180 L200 160 L240 180 L320 180 L320 220 L80 220 Z" 
        fill="#d0d0d0"
      />
      <text 
        x="200" 
        y="250" 
        textAnchor="middle" 
        fill="#999" 
        fontSize="14" 
        fontFamily="Arial, sans-serif"
      >
      </text>
    </svg>
  );

  return (
    <div className={`image-container ${className || ''}`}>
      {!imageError && src ? (
        <>
          {!imageLoaded && <PlaceholderSVG />}
          <img 
            src={src} 
            alt={alt} 
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        </>
      ) : (
        <PlaceholderSVG />
      )}
    </div>
  );
};

export default ImageWithPlaceholder;