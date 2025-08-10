import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IntroductionPage from './pages/IntroductionPage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsManagementPage from './pages/NewsManagementPage';
import Navbar from './components/common/Navbar';
import FullPageScroll from './components/common/FullPageScroll';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';
import { AuthProvider } from './contexts/AuthContext';
import './assets/styles/global.scss';

// 创建全屏滚动主页
const HomePage = () => {
  return (
    <FullPageScroll>
      <IntroductionPage />
      <NewsPage />
    </FullPageScroll>
  );
};

// 创建一个包装组件，用于处理页面过渡动画
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
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
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 模拟资源加载过程
    const loadResources = async () => {
      // 等待所有关键资源加载完成
      await Promise.all([
        // 等待DOM完全加载
        new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        }),
        // 最小loading时间，确保用户能看到loading效果
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      // 开始淡出动画
      setFadeOut(true);
      
      // 等待淡出动画完成后隐藏loading
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadResources();
  }, []);

  if (isLoading) {
    return <Loading className={fadeOut ? 'fade-out' : ''} />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
