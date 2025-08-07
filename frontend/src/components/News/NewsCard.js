import React, { useState } from 'react';
import './NewsCard.scss';
import ImagePlaceholder from '../common/ImagePlaceholder';

const NewsCard = ({ news }) => {
const [imageError, setImageError] = useState(false);

// 截断描述为2行
const truncateDescription = (text, maxLines = 2) => {
  if (!text) return '';
  
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (let word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // 简单的行长度估算（假设每行约30个字符）
    if (testLine.length > 30 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
    
    if (lines.length >= maxLines - 1 && currentLine.length > 30) {
      lines.push(currentLine.substring(0, 27) + '...');
      break;
    }
  }
  
  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
};

const handleImageError = () => {
  setImageError(true);
};
  
  return (
    <div className="news-card">
      <div className="news-image">
        {imageError ? (
          <ImagePlaceholder />
        ) : (
          <img
            src={news.image_url}
            alt={news.title}
            onError={handleImageError}
          />
        )}
      </div>
      <div className="news-content">
        <h3 className="news-title">{news.title}</h3>
        <p className="news-description">{truncateDescription(news.description, 2)}</p>
        <p className="news-creator">By: {news.creator.username}</p>
      </div>
    </div>
  );
};

export default NewsCard;