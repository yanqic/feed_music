import React, { useEffect, useState, useRef, useCallback } from 'react';
import './ScrollText.scss';

const ScrollText = ({ texts, onComplete, onScrollProgress }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const startY = useRef(0);
  const startScrollY = useRef(0);

  // 使用useCallback包装函数定义
  const updateTextVisibility = useCallback((progress) => {
    // 检查是否滚动完成
    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [onComplete]);

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

  // 计算滚动指示器的样式
  const scrollIndicatorStyle = {
    opacity: scrollProgress < 100 ? 1 : 0,
    transition: 'opacity 0.5s ease'
  };

  return (
    <div className="scroll-text" ref={containerRef}>
      <div className="starwars-wrapper">
        {texts.map((text, index) => {
          // 滚动进度映射到文本索引，初始状态scrollCenter为0，对应第一个元素在中心
          const scrollCenter = (scrollProgress / 100) * (texts.length - 1);
          
          // 计算当前元素相对于中心的距离
          const distance = index - scrollCenter;
          
          // 优化透明度算法：使用更平滑的曲线
          // 中心元素透明度为1，向两边平滑递减
          const normalizedDistance = Math.abs(distance);
          const opacity = Math.max(0, 1 - Math.pow(normalizedDistance * 0.5, 1.5));
          
          // 优化缩放算法：中心元素为1，向两边递减
          // 使用更细腻的缩放变化，模拟3D透视效果
          const scale = Math.max(0.3, 1 - normalizedDistance * 0.1);
          
          // 优化垂直位移：调整间距，让文本更紧凑
          const translateY = distance * 40;
          
          // 添加Z轴位移，增强3D效果
          const translateZ = -Math.abs(distance) * 10;
          
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
      <a href="#" className="scroll-down" style={scrollIndicatorStyle}>
        <i className="icon"></i>
        <span>scroll down</span>
      </a>
    </div>
  );
};

export default ScrollText;