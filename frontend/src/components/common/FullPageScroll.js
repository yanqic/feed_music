import React, { useState, useEffect, useRef } from 'react';
import './FullPageScroll.scss';

const FullPageScroll = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTextCompleted, setScrollTextCompleted] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const pages = React.Children.toArray(children);
  const totalPages = pages.length;

  const scrollToPage = React.useCallback((pageIndex) => {
    if (pageIndex < 0 || pageIndex >= totalPages || isScrolling) return;
    
    // 如果从introduction页面滚动到news页面，需要检查文本滚动是否完成
    if (currentPage === 0 && pageIndex === 1 && !scrollTextCompleted) {
      return;
    }
    
    setIsScrolling(true);
    setCurrentPage(pageIndex);
    
    // 通知导航栏页面切换
    const pageNames = ['introduction', 'news'];
    const event = new CustomEvent('fullPageScroll', {
      detail: { page: pageNames[pageIndex], pageIndex }
    });
    window.dispatchEvent(event);
    
    if (containerRef.current) {
      containerRef.current.style.transform = `translateY(-${pageIndex * 100}vh)`;
    }
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, [currentPage, isScrolling, totalPages, scrollTextCompleted]);

  const handleWheel = React.useCallback((e) => {
    e.preventDefault();
    
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  }, [currentPage, totalPages, isScrolling, scrollToPage]);

  const handleKeyDown = React.useCallback((e) => {
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
  }, [currentPage, totalPages, isScrolling, scrollToPage]);

  const handleTouchStart = React.useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = React.useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = React.useCallback((e) => {
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

    window.addEventListener('scrollTextComplete', handleScrollTextComplete);

    // 防止默认的滚动行为
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scrollTextComplete', handleScrollTextComplete);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      document.body.style.overflow = '';
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="full-page-scroll">
      <div 
        ref={containerRef}
        className="full-page-container"
        style={{
          transform: `translateY(-${currentPage * 100}vh)`,
          transition: isScrolling ? 'transform 1s ease-in-out' : 'none'
        }}
      >
        {pages.map((page, index) => (
          <div key={index} className="full-page-section">
            {page}
          </div>
        ))}
      </div>
      
      {/* 导航指示器 */}
      <div className="scroll-indicator">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`indicator-dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => scrollToPage(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FullPageScroll;