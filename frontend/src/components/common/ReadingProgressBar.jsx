import React, { useState, useEffect } from 'react';

const ReadingProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) return setScrollProgress(100);
      const currentProgress = (totalScroll / windowHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 transition-all duration-75 ease-out shadow-sm shadow-brand-500/50"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
