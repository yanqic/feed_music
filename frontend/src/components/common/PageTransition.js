import React, { useState, useEffect } from 'react';
import './PageTransition.scss';

const PageTransition = ({ children }) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  useEffect(() => {
    if (children.key !== displayChildren.key) {
      setTransitionStage('fadeOut');
    }
  }, [children, displayChildren]);
  
  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayChildren(children);
      setTransitionStage('fadeIn');
    }
  };
  
  return (
    <div
      className={`transition ${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;