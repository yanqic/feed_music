import React, { useState, useEffect, useRef } from 'react';
import './FullPageScroll.scss';

const FullPageScroll = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTextCompleted, setScrollTextCompleted] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null); // 'to-news', 'to-introduction', 'from-news', 'from-introduction'
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const pages = React.Children.toArray(children);
  const totalPages = pages.length;

  const scrollToPage = React.useCallback((pageIndex) => {
    if (pageIndex < 0 || pageIndex >= totalPages || isScrolling) {
      return;
    }
    
    // 设置切换方向
    if (currentPage === 0 && pageIndex === 1) {
      // Introduction -> News
      setTransitionDirection('to-news');
    } else if (currentPage === 1 && pageIndex === 0) {
      // News -> Introduction
      setTransitionDirection('to-introduction');
    }
    
    // 允许用户随时通过导航栏切换页面，不受文本滚动状态限制
    setIsScrolling(true);
    setCurrentPage(pageIndex);
    
    // 如果从news页面返回到introduction页面，重置文本滚动状态
    if (currentPage === 1 && pageIndex === 0) {
      setScrollTextCompleted(false);
    }
    
    // 通知导航栏页面切换
    const pageNames = ['introduction', 'news'];
    const event = new CustomEvent('fullPageScroll', {
      detail: { page: pageNames[pageIndex], pageIndex }
    });
    window.dispatchEvent(event);
    
    // 不再使用translateY移动容器，改为通过CSS类控制每个section的显示
    
    setTimeout(() => {
      setIsScrolling(false);
      setTransitionDirection(null); // 重置切换方向
    }, 1000);
  }, [currentPage, isScrolling, totalPages]);

  const handleWheel = React.useCallback((e) => {
    // 如果在Introduction页面且文本滚动未完成，不阻止默认行为，让ScrollText处理滚动
    if (currentPage === 0 && !scrollTextCompleted) {
      return;
    }
    
    e.preventDefault();
    
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  }, [currentPage, totalPages, isScrolling, scrollTextCompleted, scrollToPage]);

  const handleKeyDown = React.useCallback((e) => {
    // 如果在Introduction页面且文本滚动未完成，不处理键盘事件，让ScrollText处理
    if (currentPage === 0 && !scrollTextCompleted) {
      return;
    }
    
    if (isScrolling) return;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        if (currentPage < totalPages - 1) {
          scrollToPage(currentPage + 1);
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        if (currentPage > 0) {
          scrollToPage(currentPage - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        scrollToPage(0);
        break;
      case 'End':
        e.preventDefault();
        scrollToPage(totalPages - 1);
        break;
      default:
        break;
    }
  }, [currentPage, totalPages, isScrolling, scrollTextCompleted, scrollToPage]);

  const handleTouchStart = React.useCallback((e) => {
    // 如果在Introduction页面且文本滚动未完成，不处理触摸事件
    if (currentPage === 0 && !scrollTextCompleted) {
      return;
    }
    touchStartY.current = e.touches[0].clientY;
  }, [currentPage, scrollTextCompleted]);

  const handleTouchMove = React.useCallback((e) => {
    // 如果在Introduction页面且文本滚动未完成，不阻止默认行为
    if (currentPage === 0 && !scrollTextCompleted) {
      return;
    }
    e.preventDefault();
  }, [currentPage, scrollTextCompleted]);

  const handleTouchEnd = React.useCallback((e) => {
    // 如果在Introduction页面且文本滚动未完成，不处理触摸事件
    if (currentPage === 0 && !scrollTextCompleted) {
      return;
    }
    
    if (isScrolling) return;
    
    touchEndY.current = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY.current - touchEndY.current;
    
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0 && currentPage < totalPages - 1) {
        scrollToPage(currentPage + 1);
      } else if (swipeDistance < 0 && currentPage > 0) {
        scrollToPage(currentPage - 1);
      }
    }
  }, [currentPage, totalPages, isScrolling, scrollToPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 添加事件监听器
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // 监听文本滚动完成事件
    const handleScrollTextComplete = (event) => {
      setScrollTextCompleted(true);
    };

    // 监听导航栏滚动请求事件
    const handleScrollToPage = (event) => {
      const { pageIndex, animationDirection } = event.detail;
      // 根据动画方向设置切换方向
      if (animationDirection === 'down' && pageIndex === 0) {
        // Introduction向下slide in
        setTransitionDirection('to-introduction-down');
      } else if (animationDirection === 'up' && pageIndex === 1) {
        // News向上slide in
        setTransitionDirection('to-news-up');
      }
      scrollToPage(pageIndex);
    };

    window.addEventListener('scrollTextComplete', handleScrollTextComplete);
    window.addEventListener('scrollToPage', handleScrollToPage);

    // 防止默认的滚动行为
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scrollTextComplete', handleScrollTextComplete);
      window.removeEventListener('scrollToPage', handleScrollToPage);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      document.body.style.overflow = '';
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd, scrollToPage]);

  return (
    <div className="full-page-scroll">
      <div 
        ref={containerRef}
        className="full-page-container"
      >
        {pages.map((page, index) => {
          const pageNames = ['introduction', 'news'];
          const pageName = pageNames[index];
          
          // 构建CSS类名
          let className = `full-page-section ${pageName}`;
          
          // 添加活动状态
          className += ` ${index === currentPage ? 'active' : 'inactive'}`;
          
          // 添加切换方向类
          if (transitionDirection) {
            if (index === 0) { // Introduction页面
              if (transitionDirection === 'to-news') {
                className += ' to-news';
              } else if (transitionDirection === 'to-introduction') {
                className += ' from-news';
              } else if (transitionDirection === 'to-introduction-down') {
                className += ' from-news-down';
              }
            } else if (index === 1) { // News页面
              if (transitionDirection === 'to-news') {
                className += ' from-introduction';
              } else if (transitionDirection === 'to-introduction') {
                className += ' to-introduction';
              } else if (transitionDirection === 'to-news-up') {
                className += ' from-introduction-up';
              }
            }
          }
          
          return (
            <div 
              key={index} 
              className={className}
            >
              {page}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FullPageScroll;