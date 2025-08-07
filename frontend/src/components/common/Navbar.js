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
    
    const handleScrollTextProgress = (event) => {
      const { progress } = event.detail;
      setProgress(progress / 100); // 转换为 0-1 范围
    };
    
    const handleFullPageScroll = (event) => {
      const { page } = event.detail;
      setActiveSection(page);
    };
    
    window.addEventListener('pageScroll', handlePageScroll);
    window.addEventListener('scrollTextProgress', handleScrollTextProgress);
    window.addEventListener('fullPageScroll', handleFullPageScroll);
    
    return () => {
      window.removeEventListener('pageScroll', handlePageScroll);
      window.removeEventListener('scrollTextProgress', handleScrollTextProgress);
      window.removeEventListener('fullPageScroll', handleFullPageScroll);
    };
  }, [activeSection]);
  
  // 根据当前路径设置活动部分
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/introduction') {
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
        <Link to="/">
          <img
            src="/logo-white.svg"
            alt="Feed Music"
            style={{ height: '40px', width: 'auto' }}
          />
        </Link>
      </div>
      
      <div className="navbar-sections">
        <button
          className={`navbar-section ${activeSection === 'introduction' ? 'active' : ''}`}
          onClick={() => handleNavClick('introduction')}
        >
          Introduction
          {activeSection === 'introduction' && (
            <div className="progress-border">
              <div
                className="progress-border-bar"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </button>
        <button
          className={`navbar-section ${activeSection === 'news' ? 'active' : ''}`}
          onClick={() => handleNavClick('news')}
        >
          News
        </button>
      </div>
      
      <div className="navbar-auth">
        {currentUser ? (
          <>
            <span className="username">{currentUser.username}</span>
            <Link to="/manage" className="manage-link">管理新闻</Link>
            <button onClick={handleLogout} className="logout-button">退出登录</button>
          </>
        ) : (
          <Link to="/login" className="login-button">登录 / 注册</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;