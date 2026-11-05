import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to BlogHub newsletter!');
    setEmail('');
  };

  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-navy-850 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <span className="font-extrabold text-lg">B</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-700 to-purple-700 dark:from-white dark:via-brand-300 dark:to-purple-300">
                Blog<span className="text-brand-600 dark:text-brand-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              A modern, production-grade publishing platform where curious minds, developers, and designers share ideas, tutorials, and breakthroughs with the world.
            </p>
            <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 transition"
                aria-label="GitHub"
              >
                <FiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 transition"
                aria-label="Twitter"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 transition"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Featured Stories
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  All Articles
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Technology" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Design%20%26%20UX" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Design & UX
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Artificial%20Intelligence" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/create" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Write on BlogHub
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Join Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Get the latest curated stories and engineering deep-dives straight to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl">
                <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-500 transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                    aria-label="Subscribe"
                  >
                    <FiSend className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-navy-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} BlogHub. Built with MERN Stack (React, Node, Express, MongoDB).</p>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

