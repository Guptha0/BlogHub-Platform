import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiBookOpen } from 'react-icons/fi';

const TypographyControls = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  } = useTheme();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200/80 dark:border-navy-800 shadow-soft text-xs mb-8">
      {/* Theme Modes */}
      <div className="flex items-center space-x-1">
        <span className="text-[11px] font-bold text-slate-400 mr-1.5 uppercase tracking-wider">
          Theme
        </span>
        <button
          onClick={() => setTheme('light')}
          title="Light Mode"
          className={`px-2.5 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 ${
            theme === 'light'
              ? 'bg-brand-50 text-brand-600 font-bold border border-brand-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiSun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          title="Dark Mode"
          className={`px-2.5 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 ${
            theme === 'dark'
              ? 'bg-brand-950 text-brand-300 font-bold border border-brand-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <FiMoon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => setTheme('sepia')}
          title="Sepia Reading Mode"
          className={`px-2.5 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 ${
            theme === 'sepia'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiBookOpen className="w-3.5 h-3.5" />
          <span>Sepia</span>
        </button>
      </div>

      {/* Font Family Toggle */}
      <div className="flex items-center space-x-1">
        <span className="text-[11px] font-bold text-slate-400 mr-1.5 uppercase tracking-wider">
          Font
        </span>
        <button
          onClick={() => setFontFamily('sans')}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition ${
            fontFamily === 'sans'
              ? 'bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Sans
        </button>
        <button
          onClick={() => setFontFamily('serif')}
          className={`px-2.5 py-1.5 rounded-xl font-serif transition ${
            fontFamily === 'serif'
              ? 'bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Serif
        </button>
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center space-x-1">
        <span className="text-[11px] font-bold text-slate-400 mr-1.5 uppercase tracking-wider">
          Size
        </span>
        <button
          onClick={() => setFontSize('sm')}
          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] transition ${
            fontSize === 'sm'
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
          title="Small text"
        >
          A-
        </button>
        <button
          onClick={() => setFontSize('md')}
          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition ${
            fontSize === 'md'
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
          title="Medium text"
        >
          A
        </button>
        <button
          onClick={() => setFontSize('lg')}
          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm transition ${
            fontSize === 'lg'
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
          title="Large text"
        >
          A+
        </button>
      </div>
    </div>
  );
};

export default TypographyControls;
