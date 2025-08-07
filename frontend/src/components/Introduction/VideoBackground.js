import React, { useEffect, useRef, useState } from 'react';
import './VideoBackground.scss';

const VideoBackground = ({ videoUrl, children }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 设置视频属性
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    const handleLoadedData = () => {
      console.log('视频已加载');
    };

    const handleError = (e) => {
      console.error('视频加载错误:', e);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('视频可以播放');
    };

    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
        console.log('视频开始播放');
      } catch (error) {
        console.log('视频自动播放被阻止:', error);
        setIsPlaying(false);
        
        // 添加用户交互触发播放
        const handleUserInteraction = async () => {
          try {
            await video.play();
            setIsPlaying(true);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('wheel', handleUserInteraction);
          } catch (playError) {
            console.log('用户交互后播放失败:', playError);
          }
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('wheel', handleUserInteraction);
      }
    };

    // 添加事件监听器
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', playVideo);

    // 如果视频已经加载完成，直接播放
    if (video.readyState >= 2) {
      playVideo();
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', playVideo);
    };
  }, [videoUrl]);

  return (
    <div className="video-background" ref={containerRef}>
      <video
        ref={videoRef}
        className="video-background__video"
        src={videoUrl}
        preload="auto"
        muted
        playsInline
        loop
        autoPlay
      />
      <div className="video-background__overlay"></div>
      <div className="video-background__content">
        {children}
      </div>
      {!isPlaying && (
        <div className="video-background__play-hint">
          滚动鼠标开始体验
        </div>
      )}
    </div>
  );
};

export default VideoBackground;