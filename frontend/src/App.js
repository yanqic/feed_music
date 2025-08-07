import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IntroductionPage from './pages/IntroductionPage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsManagementPage from './pages/NewsManagementPage';
import Navbar from './components/common/Navbar';
import FullPageScroll from './components/common/FullPageScroll';
import ProtectedRoute from './components/common/ProtectedRoute';
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
  return (
    <Router>
      <div className="app">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
