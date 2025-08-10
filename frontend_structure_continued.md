# 前端项目结构和实现指南（续）

## Introduction 页面组件（续）

### ScrollText.js（续）

```jsx
import React, { useEffect, useRef } from 'react';
import './ScrollText.scss';

const ScrollText = () => {
  const textRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!textRef.current) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scale = 1 + (scrollPosition / windowHeight) * 0.5; // 文字随滚动变大
      const translateY = -scrollPosition * 0.5; // 文字向上移动
      
      textRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
      textRef.current.style.opacity = 1 - scrollPosition / (windowHeight * 0.8);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="scroll-text" ref={textRef}>
      <h1>Feed Music</h1>
      <p>Discover the rhythm of life</p>
      <p>Scroll down to explore</p>
    </div>
  );
};

export default ScrollText;
```

## News 页面组件

### NewsGrid.js

新闻网格组件，负责展示新闻卡片。

```jsx
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
```

### NewsCard.js

新闻卡片组件，展示单个新闻项目。

```jsx
import React from 'react';
import './NewsCard.scss';

const NewsCard = ({ news }) => {
  return (
    <div className="news-card">
      <div className="news-image">
        <img src={news.image_url} alt={news.title} />
      </div>
      <div className="news-content">
        <h3 className="news-title">{news.title}</h3>
        <p className="news-description">{news.description}</p>
        <p className="news-creator">By: {news.creator.username}</p>
      </div>
    </div>
  );
};

export default NewsCard;
```

### LoadMoreButton.js

加载更多按钮组件。

```jsx
import React from 'react';
import './LoadMoreButton.scss';

const LoadMoreButton = ({ onClick, loading }) => {
  return (
    <button 
      className="load-more-button" 
      onClick={onClick} 
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Load More'}
    </button>
  );
};

export default LoadMoreButton;
```

## 样式文件

### global.scss

全局样式文件。

```scss
@import 'variables';
@import 'animations';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: $text-color;
  background-color: $background-color;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: $primary-color;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

button {
  cursor: pointer;
  background-color: $primary-color;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  
  &:hover {
    background-color: darken($primary-color, 10%);
  }
  
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
  }
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

// 响应式设计
@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
```

### variables.scss

样式变量文件。

```scss
// 颜色
$primary-color: #5000ca;
$secondary-color: #8a3ffc;
$background-color: #320d7f;
$text-color: #333;
$light-text-color: #666;
$border-color: #ddd;

// 字体大小
$font-size-small: 0.875rem;
$font-size-normal: 1rem;
$font-size-medium: 1.25rem;
$font-size-large: 1.5rem;
$font-size-xlarge: 2rem;
$font-size-xxlarge: 3rem;

// 间距
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// 断点
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;

// 动画
$transition-speed: 0.3s;
```

### animations.scss

动画样式文件。

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.transition {
  &.fadeIn {
    animation: fadeIn 0.5s ease forwards;
  }
  
  &.fadeOut {
    animation: fadeOut 0.5s ease forwards;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse {
  animation: pulse 2s infinite;
}
```

## 组件样式文件

### Navbar.scss

导航栏样式。

```scss
@import '../../assets/styles/variables';

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .navbar-logo {
    a {
      color: white;
      font-size: $font-size-large;
      font-weight: bold;
      text-decoration: none;
    }
  }
  
  .navbar-sections {
    display: flex;
    align-items: center;
    position: relative;
    
    .navbar-section {
      background: none;
      border: none;
      color: white;
      padding: $spacing-sm 0;
      margin: 0 $spacing-sm;
      font-size: $font-size-normal;
      cursor: pointer;
      position: relative;
      
      &.active {
        font-weight: bold;
        
        &:after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: $primary-color;
        }
      }
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
    
    .progress-bar {
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: rgba(255, 255, 255, 0.2);
      
      .progress-fill {
        height: 100%;
        background-color: $primary-color;
        transition: width 0.3s ease;
      }
    }
  }
  
  .navbar-auth {
    display: flex;
    align-items: center;
    
    .username {
      margin-right: $spacing-md;
      font-size: $font-size-normal;
    }
    
    .login-button, .manage-link {
      color: white;
      text-decoration: none;
      margin-right: $spacing-md;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .logout-button {
      background-color: transparent;
      border: 1px solid white;
      color: white;
      padding: $spacing-xs $spacing-sm;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .navbar {
    flex-direction: column;
    padding: $spacing-lg;
    
    .navbar-logo, .navbar-sections, .navbar-auth {
      width: 100%;
      margin-bottom: $spacing-sm;
    }
    
    .navbar-sections {
      justify-content: center;
    }
    
    .navbar-auth {
      justify-content: center;
    }
  }
}
```

### VideoBackground.scss

视频背景样式。

```scss
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(80, 0, 202, 0.6); // 紫色半透明遮罩
  }
}
```

### ScrollText.scss

滚动文字样式。

```scss
@import '../../assets/styles/variables';

.scroll-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
  padding: $spacing-lg;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  h1 {
    font-size: $font-size-xxlarge;
    margin-bottom: $spacing-lg;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  p {
    font-size: $font-size-large;
    margin-bottom: $spacing-md;
    max-width: 600px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
}

@media (max-width: $breakpoint-md) {
  .scroll-text {
    h1 {
      font-size: $font-size-xlarge;
    }
    
    p {
      font-size: $font-size-medium;
    }
  }
}
```

### NewsGrid.scss

新闻网格样式。

```scss
@import '../../assets/styles/variables';

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
  margin: $spacing-xl 0;
}

@media (max-width: $breakpoint-lg) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
```

### NewsCard.scss

新闻卡片样式。

```scss
@import '../../assets/styles/variables';

.news-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform $transition-speed ease, box-shadow $transition-speed ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
  
  .news-image {
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-speed ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
  }
  
  .news-content {
    padding: $spacing-md;
    
    .news-title {
      font-size: $font-size-medium;
      font-weight: bold;
      margin-bottom: $spacing-sm;
      color: $text-color;
    }
    
    .news-description {
      font-size: $font-size-normal;
      color: $light-text-color;
      margin-bottom: $spacing-md;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .news-creator {
      font-size: $font-size-small;
      color: $primary-color;
      font-style: italic;
    }
  }
}
```

### LoadMoreButton.scss

加载更多按钮样式。

```scss
@import '../../assets/styles/variables';

.load-more-button {
  display: block;
  margin: $spacing-xl auto;
  padding: $spacing-sm $spacing-lg;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: $font-size-normal;
  cursor: pointer;
  transition: background-color $transition-speed ease;
  
  &:hover {
    background-color: darken($primary-color, 10%);
  }
  
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
  }
}
```

## 页面样式文件

### IntroductionPage.scss

Introduction 页面样式。

```scss
@import '../assets/styles/variables';

.introduction-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
```

### NewsPage.scss

News 页面样式。

```scss
@import '../assets/styles/variables';

.news-page {
  padding: 80px $spacing-lg $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    text-align: center;
    margin: $spacing-xl 0;
    color: $primary-color;
    font-size: $font-size-xxlarge;
  }
}

@media (max-width: $breakpoint-md) {
  .news-page {
    padding: 80px $spacing-md $spacing-lg;
    
    h1 {
      font-size: $font-size-xlarge;
      margin: $spacing-lg 0;
    }
  }
}
```

### LoginPage.scss 和 RegisterPage.scss

登录和注册页面样式。

```scss
@import '../assets/styles/variables';

.login-page, .register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $background-color;
  padding: $spacing-lg;
  
  .login-container, .register-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: $spacing-xl;
    width: 100%;
    max-width: 400px;
    
    h1 {
      text-align: center;
      margin-bottom: $spacing-lg;
      color: $primary-color;
    }
    
    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: $spacing-sm;
      border-radius: 4px;
      margin-bottom: $spacing-md;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: $spacing-md;
      
      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: bold;
        color: $text-color;
      }
      
      input {
        width: 100%;
        padding: $spacing-sm;
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: $font-size-normal;
        
        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
        }
      }
    }
    
    button {
      width: 100%;
      padding: $spacing-sm;
      background-color: $primary-color;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: $font-size-normal;
      cursor: pointer;
      margin-top: $spacing-md;
      
      &:hover {
        background-color: darken($primary-color, 10%);
      }
      
      &:disabled {
        background-color: lighten($primary-color, 20%);
        cursor: not-allowed;
      }
    }
    
    p {
      text-align: center;
      margin-top: $spacing-lg;
      color: $light-text-color;
      
      a {
        color: $primary-color;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
```

### NewsManagementPage.scss

新闻管理页面样式。

```scss
@import '../assets/styles/variables';

.news-management-page {
  padding: 80px $spacing-lg $spacing-xl;
  max-width: 800px;
  margin: 0 auto;
  
  h1, h2 {
    text-align: center;
    margin: $spacing-lg 0;
    color: $primary-color;
  }
  
  .news-form {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: $spacing-lg;
    margin-bottom: $spacing-xl;
    
    .form-group {
      margin-bottom: $spacing-md;
      
      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: bold;
        color: $text-color;
      }
      
      input, textarea {
        width: 100%;
        padding: $spacing-sm;
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: $font-size-normal;
        
        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
        }
      }
      
      textarea {
        min-height: 100px;
        resize: vertical;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      
      button {
        padding: $spacing-sm $spacing-lg;
        
        &:last-child {
          background-color: #f44336;
          
          &:hover {
            background-color: darken(#f44336, 10%);
          }
        }
      }
    }
  }
  
  .news-list {
    .news-item {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: $spacing-md;
      margin-bottom: $spacing-md;
      
      h3 {
        margin-bottom: $spacing-sm;
        color: $text-color;
      }
      
      p {
        color: $light-text-color;
        margin-bottom: $spacing-md;
      }
      
      .news-actions {
        display: flex;
        justify-content: flex-end;
        
        button {
          margin-left: $spacing-sm;
          padding: $spacing-xs $spacing-sm;
          font-size: $font-size-small;
          
          &:last-child {
            background-color: #f44336;
            
            &:hover {
              background-color: darken(#f44336, 10%);
            }
          }
        }
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .news-management-page {
    padding: 80px $spacing-md $spacing-lg;
    
    .form-actions {
      flex-direction: column;
      
      button {
        margin-bottom: $spacing-sm;
      }
    }
  }
}
```

## 启动说明

要启动前端服务，请运行以下命令：

```bash
cd frontend
npm install
npm start
```

服务将在 http://localhost:3000 上运行。

## 响应式设计

本项目使用媒体查询实现响应式设计，主要断点如下：

- 小屏幕（手机）：< 576px
- 中等屏幕（平板）：576px - 768px
- 大屏幕（笔记本）：768px - 992px
- 超大屏幕（桌面）：> 992px

在不同断点下，我们调整了以下内容：

1. 导航栏布局（从水平变为垂直）
2. 新闻网格列数（从3列变为1列）
3. 字体大小和间距
4. 表单和按钮的尺寸

## 页面切换效果

页面切换效果通过 `PageTransition` 组件实现，使用 CSS 动画实现淡入淡出效果。当用户点击导航栏或滚动页面时，会触发页面切换动画。

## 滚动效果

Introduction 页面的滚动效果通过监听 `scroll` 事件实现。当用户滚动页面时，文字会随着滚动逐渐变大并向上移动，同时导航栏的进度条会显示当前滚动进度。