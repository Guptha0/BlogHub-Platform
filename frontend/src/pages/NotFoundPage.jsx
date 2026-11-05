import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The page you are looking for doesn't exist, has been moved, or the URL was entered incorrectly.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <FiHome className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-navy-850 transition"
          >
            <FiCompass className="w-4 h-4" />
            <span>Explore Blogs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

