import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/common/BlogCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import {
  FiSearch,
  FiTrendingUp,
  FiArrowRight,
  FiStar,
  FiZap,
  FiUsers,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const categories = [
  'All',
  'Technology',
  'Programming',
  'Design & UX',
  'Artificial Intelligence',
  'Business',
  'Productivity',
];

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState('trending'); // 'trending', 'latest', 'following'
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, latestRes] = await Promise.all([
          postService.getFeatured(),
          postService.getPosts({ limit: 6, status: 'published' }),
        ]);

        if (featuredRes.data.success) {
          setFeaturedPosts(featuredRes.data.posts || []);
        }
        if (latestRes.data.success) {
          setLatestPosts(latestRes.data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching homepage posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Fetch following feed on tab activation
  useEffect(() => {
    if (activeFeedTab === 'following' && isAuthenticated) {
      const fetchFollowingFeed = async () => {
        try {
          setFollowingLoading(true);
          const res = await postService.getFollowingFeed();
          if (res.data.success) {
            setFollowingPosts(res.data.posts || []);
          }
        } catch (err) {
          console.error('Error fetching following feed:', err);
        } finally {
          setFollowingLoading(false);
        }
      };
      fetchFollowingFeed();
    }
  }, [activeFeedTab, isAuthenticated]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (cat) => {
    if (cat === 'All') {
      navigate('/explore');
    } else {
      navigate(`/explore?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-20 sm:pb-24 text-center">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-purple-600/15 to-indigo-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-navy-900 dark:text-brand-300 border border-brand-200 dark:border-navy-800 mb-6 shadow-sm">
            <FiZap className="w-3.5 h-3.5 text-brand-500" />
            <span>Next-Gen Publishing • AI Summary & Multi-Claps</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Share Your Ideas with the{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 dark:from-brand-400 dark:via-purple-400 dark:to-indigo-300">
              World
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover thoughtful engineering write-ups, architecture breakdowns, and join interactive discussions across technology and design.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-xl mx-auto relative flex items-center"
          >
            <div className="relative w-full shadow-2xl rounded-2xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, authors, or articles..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Category Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/70 dark:bg-navy-900/70 border border-slate-200/80 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs: Trending / Latest / Following Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-navy-800">
          {/* Feed Tabs Selector */}
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveFeedTab('trending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activeFeedTab === 'trending'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiTrendingUp className="w-4 h-4 text-amber-500" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveFeedTab('latest')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activeFeedTab === 'latest'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiClock className="w-4 h-4 text-blue-500" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => setActiveFeedTab('following')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activeFeedTab === 'following'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiUsers className="w-4 h-4 text-purple-500" />
              <span>Following Feed</span>
            </button>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View All Stories</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab 1: Trending Feed */}
        {activeFeedTab === 'trending' && (
          <div>
            {loading ? (
              <SkeletonGrid count={4} />
            ) : featuredPosts.length === 0 ? (
              <EmptyState title="No featured stories" description="Check back soon for curated picks." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {featuredPosts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Latest Feed */}
        {activeFeedTab === 'latest' && (
          <div>
            {loading ? (
              <SkeletonGrid count={6} />
            ) : latestPosts.length === 0 ? (
              <EmptyState title="No stories published yet" description="Be the first to publish an article on BlogHub!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {latestPosts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Following Feed */}
        {activeFeedTab === 'following' && (
          <div>
            {!isAuthenticated ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center max-w-xl mx-auto space-y-4 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-navy-800 text-purple-600 mx-auto flex items-center justify-center">
                  <FiUsers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Follow Your Favorite Writers
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Sign in to curate your personal feed of articles from authors you follow.
                </p>
                <div className="flex justify-center space-x-3 pt-2">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/explore"
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    Browse Authors
                  </Link>
                </div>
              </div>
            ) : followingLoading ? (
              <SkeletonGrid count={3} />
            ) : followingPosts.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center max-w-xl mx-auto space-y-4 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-navy-800 text-brand-600 mx-auto flex items-center justify-center">
                  <FiUsers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Your Following Feed is Empty
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  You are not following any authors yet. Follow creators to see their latest work right here!
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-sm"
                >
                  <span>Explore & Follow Creators</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {followingPosts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Newsletter / Creator Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-navy-900 via-brand-950 to-purple-950 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">
              Community & Publishing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Share Your Engineering Journey?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Publish rich Markdown articles, get feedback from a vibrant engineering community, and measure your impact with live creator telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              to="/create"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-brand-500/25 transition"
            >
              Start Writing Now
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm text-center backdrop-blur-sm transition"
            >
              Platform Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
