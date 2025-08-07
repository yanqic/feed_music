import React, { useEffect, useRef } from 'react';
import VideoBackground from '../components/Introduction/VideoBackground';
import ScrollText from '../components/Introduction/ScrollText';
import './IntroductionPage.scss';

const IntroductionPage = () => {
  const pageRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // 通知导航栏当前滚动位置
      if (!pageRef.current) return;
      
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
  
  const handleScrollProgress = (progress) => {
    // 将 ScrollText 的滚动进度传递给导航栏
    const event = new CustomEvent('scrollTextProgress', {
      detail: { progress }
    });
    window.dispatchEvent(event);
  };

  const handleScrollTextComplete = () => {
    // 通知FullPageScroll文本滚动已完成
    const event = new CustomEvent('scrollTextComplete', {
      detail: { completed: true }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="introduction-page" ref={pageRef}>
      <VideoBackground videoUrl="/videos/intro.mp4" />
      <ScrollText
        texts={[
          "When you want something,",
          "all the universe conspires",
          "in helping you to achieve it.",
          "Paulo Coelho",
          "Feed is that conspiracy:",
          "the conspiracy of trust.",
          "Trust is the single",
          "most important ingredient",
          "missing from digital relationships.",
          "Boston Consulting Group",
          "and the World Economic Forum",
          "forecast the digital economy"
        ]}
        onScrollProgress={handleScrollProgress}
        onComplete={handleScrollTextComplete}
      />
    </div>
  );
};

export default IntroductionPage;