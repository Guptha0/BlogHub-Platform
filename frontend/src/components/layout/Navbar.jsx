import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import {
  FiEdit3,
  FiSun,
  FiMoon,
  FiBookOpen,
  FiMenu,
  FiX,
  FiCompass,
  FiHome,
  FiInfo,
  FiUser,
  FiLogOut,
  FiGrid,
  FiSearch,
  FiBookmark,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-navy-800'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-navy-850'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-navy-950/80 border-b border-slate-200/80 dark:border-navy-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tight">B</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-700 to-purple-700 dark:from-white dark:via-brand-300 dark:to-purple-300">
              Blog<span className="text-brand-600 dark:text-brand-400">Hub</span>
            </span>
          </Link>

          {/* Quick Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-64 lg:w-80"
          >
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 dark:bg-navy-900 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-navy-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/saved" className={navLinkClass}>
                Saved
              </NavLink>
            )}
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 3-Way Theme Switcher (Dark / Light / Sepia) */}
            <button
              onClick={cycleTheme}
              title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Light, Dark, Sepia)`}
              className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition flex items-center space-x-1 border border-slate-200/60 dark:border-navy-800"
            >
              {theme === 'dark' ? (
                <FiSun className="w-4 h-4 text-amber-400" />
              ) : theme === 'sepia' ? (
                <FiBookOpen className="w-4 h-4 text-amber-800" />
              ) : (
                <FiMoon className="w-4 h-4 text-indigo-600" />
              )}
              <span className="text-[11px] font-bold uppercase hidden sm:inline">
                {theme}
              </span>
            </button>

            {/* Authenticated State */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/create"
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Write Post</span>
                </Link>

                {/* Real-Time Interactive Notification Center */}
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                  >
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-2xl py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          @{user?.username}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition"
                        >
                          <FiGrid className="w-4 h-4 text-brand-500" />
                          <span>Creator Studio</span>
                        </Link>
                        <Link
                          to="/saved"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition"
                        >
                          <FiBookmark className="w-4 h-4 text-purple-500" />
                          <span>Saved Stories</span>
                        </Link>
                        <Link
                          to="/create"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition"
                        >
                          <FiEdit3 className="w-4 h-4 text-emerald-500" />
                          <span>Create Article</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition"
                        >
                          <FiUser className="w-4 h-4 text-blue-500" />
                          <span>My Profile</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-navy-800">
                        <button
                          onClick={logout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest State */
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 border-t border-slate-200/80 dark:border-navy-800/80 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 outline-none"
            />
          </form>

          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/saved" className={navLinkClass}>
                Saved Stories
              </NavLink>
            )}
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Creator Studio
                </NavLink>
                <NavLink to="/create" className={navLinkClass}>
                  Write Post
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
