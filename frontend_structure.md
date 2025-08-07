# 前端项目结构和实现指南

## 目录结构

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── videos/
│       └── images/
├── src/
│   ├── App.js
│   ├── index.js
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── global.scss
│   │   │   ├── variables.scss
│   │   │   └── animations.scss
│   │   ├── videos/
│   │   │   └── background.mp4
│   │   └── images/
│   │       └── placeholder.jpg
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.js
│   │   │   ├── PageTransition.js
│   │   │   └── ProtectedRoute.js
│   │   ├── Introduction/
│   │   │   ├── VideoBackground.js
│   │   │   └── ScrollText.js
│   │   └── News/
│   │       ├── NewsGrid.js
│   │       ├── NewsCard.js
│   │       └── LoadMoreButton.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── IntroductionPage.js
│   │   ├── NewsPage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   └── NewsManagementPage.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── news.js
│   └── utils/
│       ├── helpers.js
│       └── constants.js
├── package.json
└── README.md
```

## 依赖项

以下是项目所需的主要依赖项，应该添加到 `package.json` 文件中：

```json
{
  "name": "feed-music-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.5.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "5.0.1",
    "sass": "^1.69.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## 核心文件实现指南

### index.js

应用的入口点，负责渲染根组件。

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/global.scss';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
```

### App.js

应用的主组件，包含路由配置。

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroductionPage from './pages/IntroductionPage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsManagementPage from './pages/NewsManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<IntroductionPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/manage" 
            element={
              <ProtectedRoute>
                <NewsManagementPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## 上下文（Context）

### AuthContext.js

认证上下文，用于管理用户认证状态。

```jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register, logout, getCurrentUser } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(user => {
          setCurrentUser(user);
        })
        .catch(err => {
          localStorage.removeItem('token');
          console.error('Failed to get current user:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      setError(null);
      const { token, user } = await login(username, password);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setError(null);
      const user = await register(username, email, password);
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 服务（Services）

### api.js

API 服务的基础配置。

```jsx
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未认证，清除本地存储的令牌
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### auth.js

认证相关的 API 服务。

```jsx
import api from './api';

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return {
    token: response.data.access_token,
    user: response.data.user,
  };
};

export const register = async (username, email, password) => {
  const response = await api.post('/users/register', {
    username,
    email,
    password,
  });
  
  return response.data;
};

export const logout = async () => {
  return await api.post('/users/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};
```

### news.js

新闻相关的 API 服务。

```jsx
import api from './api';

export const getNews = async (page = 1, limit = 6) => {
  const response = await api.get('/news', {
    params: { page, limit },
  });
  
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const createNews = async (newsData) => {
  const response = await api.post('/news', newsData);
  return response.data;
};

export const updateNews = async (id, newsData) => {
  const response = await api.put(`/news/${id}`, newsData);
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};
```

## 页面组件

### IntroductionPage.js

第一屏页面，包含视频背景和滚动文字。

```jsx
import React, { useEffect, useRef } from 'react';
import VideoBackground from '../components/Introduction/VideoBackground';
import ScrollText from '../components/Introduction/ScrollText';
import './IntroductionPage.scss';

const IntroductionPage = () => {
  const pageRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // 通知导航栏当前滚动位置
      const scrollPosition = window.scrollY;
      const pageHeight = pageRef.current.offsetHeight;
      const scrollPercentage = Math.min(scrollPosition / pageHeight, 1);
      
      // 发布自定义事件，导航栏可以监听此事件
      const event = new CustomEvent('pageScroll', { 
        detail: { page: 'introduction', percentage: scrollPercentage } 
      });
      window.dispatchEvent(event);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="introduction-page" ref={pageRef}>
      <VideoBackground />
      <ScrollText />
    </div>
  );
};

export default IntroductionPage;
```

### NewsPage.js

第二屏页面，显示新闻网格。

```jsx
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
    <div className="news-page">
      <h1>Latest News</h1>
      <NewsGrid news={news} />
      {page < totalPages && (
        <LoadMoreButton onClick={handleLoadMore} loading={loading} />
      )}
    </div>
  );
};

export default NewsPage;
```

### LoginPage.js

登录页面。

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.scss';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

### RegisterPage.js

注册页面。

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './RegisterPage.scss';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      setError('Failed to create an account. ' + (err.response?.data?.detail || ''));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Register</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

### NewsManagementPage.js

新闻管理页面，用于创建、编辑和删除新闻。

```jsx
import React, { useState, useEffect } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../services/news';
import './NewsManagementPage.scss';

const NewsManagementPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews(1, 100); // 获取所有新闻
      setNews(response.items);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingNews) {
        // 更新现有新闻
        await updateNews(editingNews.id, formData);
      } else {
        // 创建新新闻
        await createNews(formData);
      }
      
      // 重置表单和编辑状态
      setFormData({ title: '', description: '', image_url: '' });
      setEditingNews(null);
      
      // 重新获取新闻列表
      fetchNews();
    } catch (error) {
      console.error('Failed to save news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      image_url: newsItem.image_url
    });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        setLoading(true);
        await deleteNews(id);
        fetchNews();
      } catch (error) {
        console.error('Failed to delete news:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleCancel = () => {
    setEditingNews(null);
    setFormData({ title: '', description: '', image_url: '' });
  };
  
  return (
    <div className="news-management-page">
      <h1>{editingNews ? 'Edit News' : 'Create News'}</h1>
      
      <form onSubmit={handleSubmit} className="news-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingNews ? 'Update' : 'Create')}
          </button>
          
          {editingNews && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>News List</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className="news-list">
        {news.map(item => (
          <div key={item.id} className="news-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="news-actions">
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
        
        {news.length === 0 && !loading && (
          <p>No news found. Create your first news item!</p>
        )}
      </div>
    </div>
  );
};

export default NewsManagementPage;
```

## 共享组件

### Navbar.js

导航栏组件，包含分页按钮和进度条。

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 监听页面滚动事件
  useEffect(() => {
    const handlePageScroll = (event) => {
      const { page, percentage } = event.detail;
      if (page === activeSection) {
        setProgress(percentage);
      }
    };
    
    window.addEventListener('pageScroll', handlePageScroll);
    return () => window.removeEventListener('pageScroll', handlePageScroll);
  }, [activeSection]);
  
  // 根据当前路径设置活动部分
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveSection('introduction');
    } else if (location.pathname === '/news') {
      setActiveSection('news');
    }
  }, [location]);
  
  const handleNavClick = (section) => {
    setActiveSection(section);
    
    if (section === 'introduction') {
      navigate('/');
    } else if (section === 'news') {
      navigate('/news');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Feed Music</Link>
      </div>
      
      <div className="navbar-sections">
        <button
          className={`navbar-section ${activeSection === 'introduction' ? 'active' : ''}`}
          onClick={() => handleNavClick('introduction')}
        >
          Introduction
        </button>
        <button
          className={`navbar-section ${activeSection === 'news' ? 'active' : ''}`}
          onClick={() => handleNavClick('news')}
        >
          News
        </button>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
        </div>
      </div>
      
      <div className="navbar-auth">
        {currentUser ? (
          <>
            <span className="username">{currentUser.username}</span>
            <Link to="/manage" className="manage-link">Manage News</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/login" className="login-button">Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

### PageTransition.js

页面切换动画组件。

```jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.scss';

const PageTransition = ({ children }) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const location = useLocation();
  
  useEffect(() => {
    if (children.key !== displayChildren.key) {
      setTransitionStage('fadeOut');
    }
  }, [children, displayChildren]);
  
  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayChildren(children);
      setTransitionStage('fadeIn');
    }
  };
  
  return (
    <div
      className={`transition ${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
```

### ProtectedRoute.js

受保护路由组件，用于限制未登录用户访问。

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;
```

## Introduction 页面组件

### VideoBackground.js

视频背景组件。

```jsx
import React from 'react';
import backgroundVideo from '../../assets/videos/background.mp4';
import './VideoBackground.scss';

const VideoBackground = () => {
  return (
    <div className="video-background">
      <video autoPlay muted loop playsInline>
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="overlay"></div>
    </div>
  );
};

export default VideoBackground;
```

### ScrollText.js

滚动文字组件。

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