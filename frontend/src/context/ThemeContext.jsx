import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme mode: 'dark' | 'light' | 'sepia'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('bloghub_theme');
    if (saved && ['dark', 'light', 'sepia'].includes(saved)) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Reading Typography: Font size ('sm' | 'md' | 'lg') and Family ('sans' | 'serif')
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('bloghub_font_size') || 'md';
  });

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('bloghub_font_family') || 'sans';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    }

    localStorage.setItem('bloghub_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bloghub_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('bloghub_font_family', fontFamily);
  }, [fontFamily]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'sepia';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
