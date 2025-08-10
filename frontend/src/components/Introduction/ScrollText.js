import React, { useEffect, useState, useRef, useCallback } from 'react';
import './ScrollText.scss';

const ScrollText = ({ texts, onComplete, onScrollProgress }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const startY = useRef(0);
  const startScrollY = useRef(0);

  // 使用useCallback包装函数定义
  const updateTextVisibility = useCallback((progress) => {
    // 检查是否滚动完成
    if (progress >= 100 && !isCompleted && onComplete) {
      setIsCompleted(true);
      setTimeout(() => {
        onComplete();
        // 发送滚动完成事件
        const event = new CustomEvent('scrollTextComplete', {
          detail: { completed: true }
        });
        window.dispatchEvent(event);
      }, 500);
    }
  }, [onComplete, isCompleted]);

  // 定义handleTouchEnd函数
  const handleTouchEnd = useCallback(() => {
    // 用户停止触摸时的处理逻辑
    // 这里可以添加滚动完成后的回调逻辑
  }, []);

  // 单独的useEffect来处理滚动进度更新
  useEffect(() => {
    if (onScrollProgress) {
      onScrollProgress(scrollProgress);
    }
  }, [scrollProgress, onScrollProgress]);

  // 监听页面切换事件，重置完成状态
  useEffect(() => {
    const handlePageSwitch = (event) => {
      if (event.detail.page === 'introduction' && isCompleted) {
        setIsCompleted(false);
        setScrollProgress(0);
      }
    };

    window.addEventListener('fullPageScroll', handlePageSwitch);
    return () => window.removeEventListener('fullPageScroll', handlePageSwitch);
  }, [isCompleted]);


  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      
      const delta = e.deltaY;
      setScrollProgress(prev => {
        const newProgress = Math.max(0, Math.min(100, prev + delta * 0.1));
        updateTextVisibility(newProgress);
        return newProgress;
      });
    };

    const handleTouchStart = (e) => {
      startY.current = e.touches[0].clientY;
      startScrollY.current = scrollProgress;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const deltaY = startY.current - e.touches[0].clientY;
      setScrollProgress(prev => {
        const newProgress = Math.max(0, Math.min(100, startScrollY.current + deltaY * 0.1));
        updateTextVisibility(newProgress);
        return newProgress;
      });
    };

    // 添加事件监听器
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, handleTouchEnd, updateTextVisibility]);



  return (
    <div className="scroll-text" ref={containerRef}>
      <div className="starwars-wrapper">
        {texts.map((text, index) => {
          // 滚动进度映射，让第一个元素初始时在屏幕中央
          const scrollCenter = (scrollProgress / 100) * (texts.length - 1);
          
          // 计算当前元素相对于屏幕中心的距离
          const distance = index - scrollCenter;
          
          // 新的透明度算法：基于元素在屏幕中的垂直位置
          // 当元素在屏幕中央时透明度最高，向上下两边递减
          const normalizedDistance = Math.abs(distance);
          
          // 使用更平滑的透明度曲线，让中心区域透明度更高
          // 当distance为0时（屏幕中央），opacity为1
          // 距离越远，透明度越低，最低为0.1
          const opacity = Math.max(0.1, Math.pow(Math.E, -normalizedDistance * 0.8));
          
          // 优化缩放算法：中心元素为1，向两边递减
          const scale = Math.max(0.4, 1 - normalizedDistance * 0.15);
          
          // 垂直位移：让文本有合适的间距
          const translateY = distance * 60;
          
          // Z轴位移，增强3D效果
          const translateZ = -Math.abs(distance) * 15;
          
          // 特殊处理作者名称（假设是第4个元素）
          const isAuthor = index === 3;
          const fontSize = "48px";
          const fontStyle = isAuthor ? 'italic' : 'normal';
          const textAlign = isAuthor ? 'right' : 'center';
          const paddingRight = isAuthor ? '20%' : '0';
          
          return (
            <p
              key={index}
              ref={el => textRefs.current[index] = el}
              className={`scroll-text__line ${isAuthor ? 'author' : ''}`}
              style={{
                opacity: opacity,
                transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale})`,
                transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                fontSize,
                fontStyle,
                textAlign,
                paddingRight
              }}
            >
              {text}
            </p>
          );
        })}
      </div>
      
      {/* 滚动指示器 */}
      {!isCompleted && (
        <a 
          href="#" 
          className="scroll-down" 
          onClick={(e) => {
            e.preventDefault();
            // 触发页面切换到下一页
            const event = new CustomEvent('scrollToPage', {
              detail: { pageIndex: 1 }
            });
            window.dispatchEvent(event);
          }}
        >
          <i className="icon"></i>
          <span>scroll down</span>
        </a>
      )}
    </div>
  );
};

export default ScrollText;