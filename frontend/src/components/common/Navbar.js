import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  
  // 添加调试日志
  useEffect(() => {
    console.log('Navbar: currentUser changed:', currentUser);
  }, [currentUser]);
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
    if (location.pathname === '/') {
      setActiveSection('introduction');
    }
  }, [location]);

  // 监听全屏滚动事件来更新活动状态
  useEffect(() => {
    const handleFullPageScroll = (event) => {
      const { page } = event.detail;
      setActiveSection(page);
    };

    window.addEventListener('fullPageScroll', handleFullPageScroll);
    return () => window.removeEventListener('fullPageScroll', handleFullPageScroll);
  }, []);
  
  const handleNavClick = (section) => {
    // 如果不在主页，先跳转到主页
    if (location.pathname !== '/') {
      navigate('/');
      // 延迟滚动到指定页面
      setTimeout(() => {
        const pageIndex = section === 'introduction' ? 0 : 1;
        const animationDirection = section === 'introduction' ? 'down' : 'up';
        const event = new CustomEvent('scrollToPage', {
          detail: { pageIndex, animationDirection }
        });
        window.dispatchEvent(event);
      }, 100);
    } else {
      // 在主页时，直接滚动到指定页面
      const pageIndex = section === 'introduction' ? 0 : 1;
      const animationDirection = section === 'introduction' ? 'down' : 'up';
      const event = new CustomEvent('scrollToPage', {
        detail: { pageIndex, animationDirection }
      });
      window.dispatchEvent(event);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClickMobile = (section) => {
    handleNavClick(section);
    closeMobileMenu();
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img
            src="/logo-white.svg"
            alt="Feed Music"
            style={{ height: '34px', width: '34px' }}
          />
        </Link>
      </div>
      
      {/* 汉堡菜单按钮 - 仅在移动端显示 */}
      <button className="hamburger-menu" onClick={toggleMobileMenu}>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>
      
      {/* 桌面端导航 */}
      <div className="navbar-sections desktop-nav">
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
      
      {/* 桌面端认证区域 */}
      <div className="navbar-auth desktop-nav">
        {currentUser ? (
          <>
            <Link to="/manage" className="manage-link">管理新闻</Link>
            <span className="username">{currentUser.username}</span>
            <button onClick={handleLogout} className="logout-button">退出登录</button>
          </>
        ) : (
          <Link to="/login" className="login-button">登录 / 注册</Link>
        )}
      </div>
      
      {/* 移动端下拉菜单 */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <button
            className={`mobile-nav-item ${activeSection === 'introduction' ? 'active' : ''}`}
            onClick={() => handleNavClickMobile('introduction')}
          >
            Introduction
          </button>
          <button
            className={`mobile-nav-item ${activeSection === 'news' ? 'active' : ''}`}
            onClick={() => handleNavClickMobile('news')}
          >
            News
          </button>
          
          <div className="mobile-auth">
            {currentUser ? (
              <>
                <span className="mobile-username">{currentUser.username}</span>
                <Link to="/manage" className="mobile-manage-link" onClick={closeMobileMenu}>管理新闻</Link>
                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="mobile-logout-button">退出登录</button>
              </>
            ) : (
              <Link to="/login" className="mobile-login-button" onClick={closeMobileMenu}>登录 / 注册</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;