import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService, userService } from '../services/api';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  FiPlus,
  FiFileText,
  FiMessageSquare,
  FiHeart,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiUser,
  FiTrendingUp,
  FiBarChart2,
  FiMail,
  FiSend,
  FiDollarSign,
  FiUsers,
  FiArrowUpRight,
  FiActivity,
  FiPieChart,
  FiZap,
  FiGift,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DashboardPage = ({ defaultTab = 'posts' }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab state: 'posts', 'analytics', 'newsletter', 'wallet'
  const initialTab = searchParams.get('tab') || defaultTab || 'posts';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Core stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedCount: 0,
    draftCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalCommentsReceived: 0,
    totalClaps: 0,
  });

  // Posts state
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('30d'); // '7d', '30d', '1y'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Newsletter state
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [sentIssues, setSentIssues] = useState([]);
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);

  // Wallet state
  const [wallet, setWallet] = useState({
    balance: 0,
    tipsReceivedCount: 0,
    recentTips: [],
  });
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Fetch initial dashboard metrics
  const fetchDashboardStats = async () => {
    try {
      const statsRes = await userService.getDashboardStats();
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  // Fetch Posts
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await postService.getMyPosts({ status: statusFilter });
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      toast.error('Could not load your articles');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch Advanced Analytics
  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await userService.getAnalytics();
      if (res.data.success) {
        setAnalyticsData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Could not load telemetry analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch Newsletter data
  const fetchNewsletterData = async () => {
    try {
      setLoadingNewsletter(true);
      const res = await userService.getNewsletterStats();
      if (res.data.success) {
        setSubscribersCount(res.data.subscribersCount || 0);
        setSentIssues(res.data.newslettersSent || []);
      }
    } catch (err) {
      console.error('Failed to load newsletter data:', err);
    } finally {
      setLoadingNewsletter(false);
    }
  };

  // Fetch Wallet data
  const fetchWalletData = async () => {
    try {
      setLoadingWallet(true);
      const res = await userService.getWallet();
      if (res.data.success) {
        setWallet(res.data.wallet || { balance: 0, tipsReceivedCount: 0, recentTips: [] });
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'newsletter') {
      fetchNewsletterData();
    } else if (activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [activeTab, statusFilter]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Deletion handling
  const promptDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setDeleting(true);
      const res = await postService.deletePost(postToDelete._id);
      if (res.data.success) {
        toast.success('Post deleted successfully');
        setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
        setDeleteModalOpen(false);
        setPostToDelete(null);
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  // Newsletter Dispatch handling
  const handleDispatchNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterTitle.trim() || !newsletterContent.trim()) {
      toast.error('Please provide both newsletter subject title and content');
      return;
    }

    try {
      setDispatching(true);
      const res = await userService.dispatchNewsletter({
        title: newsletterTitle,
        content: newsletterContent,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Newsletter dispatched successfully!');
        setNewsletterTitle('');
        setNewsletterContent('');
        fetchNewsletterData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch newsletter');
    } finally {
      setDispatching(false);
    }
  };

  // Simulate Instant Payout / Withdrawal
  const handleWithdrawal = () => {
    if (wallet.balance <= 0) {
      toast.error('No available balance to withdraw');
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      toast.success(
        `Instant payout of $${wallet.balance.toFixed(2)} processed to connected payout account!`
      );
      setWallet((prev) => ({ ...prev, balance: 0 }));
      setWithdrawing(false);
    }, 1200);
  };

  // Sliced trend points based on period
  const getFilteredTrendPoints = () => {
    const rawData = analyticsData?.trendData || [];
    if (chartPeriod === '7d') return rawData.slice(-7);
    if (chartPeriod === '30d') return rawData.slice(-30);
    return rawData;
  };

  const trendPoints = getFilteredTrendPoints();
  const maxViewsInTrend = Math.max(...trendPoints.map((p) => p.views || 0), 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Navigation Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-brand-100">
              BlogHub v3.0 Enterprise Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Creator'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
            Real-time telemetry, AI authoring copilot, reader micro-tipping, and Substack-style newsletter dispatcher.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
          >
            <FiUser className="w-4 h-4" />
            <span>Profile Settings</span>
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-slate-50 text-xs font-bold shadow-sm hover:scale-[1.02] transition"
          >
            <FiPlus className="w-4 h-4" />
            <span>Write New Story</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <div className="border-b border-slate-200 dark:border-navy-800">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-1" aria-label="Dashboard Tabs">
          <button
            onClick={() => handleTabChange('posts')}
            className={`pb-3.5 px-1 inline-flex items-center space-x-2 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Articles & Stories ({stats.totalPosts})</span>
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`pb-3.5 px-1 inline-flex items-center space-x-2 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            <span>Deep Telemetry & Analytics</span>
          </button>

          <button
            onClick={() => handleTabChange('newsletter')}
            className={`pb-3.5 px-1 inline-flex items-center space-x-2 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'newsletter'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FiMail className="w-4 h-4" />
            <span>Newsletter Dispatcher</span>
            {subscribersCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {subscribersCount} subs
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('wallet')}
            className={`pb-3.5 px-1 inline-flex items-center space-x-2 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FiDollarSign className="w-4 h-4" />
            <span>Tip Jar & Creator Wallet</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ARTICLES & POSTS */}
      {/* ========================================================================= */}
      {activeTab === 'posts' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Metrics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Stories
                </span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <FiFileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalPosts}
              </p>
              <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
                <span className="text-emerald-500 font-semibold">{stats.publishedCount} Published</span>
                <span>•</span>
                <span className="text-amber-500 font-semibold">{stats.draftCount} Drafts</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Impressions
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <FiEye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalViews}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">Unique article readers</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Community Claps
                </span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <FiZap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalClaps || 0}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">Real-time appreciation</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Comments Received
                </span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <FiMessageSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalCommentsReceived}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">Active reader discussions</p>
            </div>
          </div>

          {/* Posts Filter and List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Authored Articles ({posts.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edit, preview, monitor live SSE engagement, or delete your publications.
                </p>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({stats.totalPosts})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'published'
                      ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Published ({stats.publishedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'draft'
                      ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Drafts ({stats.draftCount})
                </button>
              </div>
            </div>

            {loadingPosts ? (
              <LoadingSpinner text="Loading your articles..." />
            ) : posts.length === 0 ? (
              <EmptyState
                title="No articles found"
                description={
                  statusFilter === 'draft'
                    ? 'You do not have any saved drafts.'
                    : 'You have not written any articles yet. Inspire readers by publishing your first post!'
                }
                actionText="Write an Article"
                actionLink="/create"
              />
            ) : (
              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl shadow-soft overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-navy-800">
                  {posts.map((post) => {
                    const targetId = post.slug || post._id;
                    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={post._id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-navy-850/50 transition"
                      >
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <img
                            src={
                              post.image ||
                              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={post.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                                {post.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  post.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                              >
                                {post.status}
                              </span>
                            </div>

                            <Link
                              to={`/blog/${targetId}`}
                              className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition truncate block"
                            >
                              {post.title}
                            </Link>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span>{formattedDate}</span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FiEye className="w-3.5 h-3.5" />
                                <span>{post.views || 0} views</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FiZap className="w-3.5 h-3.5 text-amber-500" />
                                <span>{post.clapsCount || 0} claps</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FiHeart className="w-3.5 h-3.5 text-pink-500" />
                                <span>{post.likes?.length || 0}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FiMessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                <span>{post.commentCount || 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 self-end md:self-center">
                          <Link
                            to={`/blog/${targetId}`}
                            title="View Live Article"
                            className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/edit/${post._id}`}
                            title="Edit Article with AI Copilot"
                            className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-navy-800 transition"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => promptDeletePost(post)}
                            title="Delete Article"
                            className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEEP TELEMETRY & ANALYTICS (/dashboard/analytics) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {loadingAnalytics ? (
            <LoadingSpinner text="Computing audience telemetry & view velocity..." />
          ) : (
            <>
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Audience Reach
                    </span>
                    <FiEye className="w-4 h-4 text-brand-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {analyticsData?.totalViews || stats.totalViews}
                  </p>
                  <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <FiArrowUpRight className="w-3.5 h-3.5" />
                    <span>+18.4% vs last period</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Read Retention Rate
                    </span>
                    <FiActivity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {analyticsData?.avgCompletionRate || 82}%
                  </p>
                  <div className="mt-2 w-full bg-slate-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData?.avgCompletionRate || 82}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Average scroll completion</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Engagement Score
                    </span>
                    <FiZap className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {analyticsData?.engagementRate || 9.2}%
                  </p>
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    {analyticsData?.totalClaps || 0} claps • {analyticsData?.totalComments || 0} comments
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Audience Followers
                    </span>
                    <FiUsers className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {analyticsData?.followersCount || user?.followers?.length || 0}
                  </p>
                  <p className="mt-2 text-xs text-purple-600 font-semibold">
                    {analyticsData?.subscribersCount || 0} newsletter subscribers
                  </p>
                </div>
              </div>

              {/* View Velocity Interactive Chart */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <FiBarChart2 className="w-5 h-5 text-brand-600" />
                      <span>View Velocity & Reader Impressions</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Interactive daily readership and clap trajectory over time. Hover over bars to inspect details.
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-xs font-semibold">
                    <button
                      onClick={() => setChartPeriod('7d')}
                      className={`px-3 py-1 rounded-lg transition ${
                        chartPeriod === '7d'
                          ? 'bg-white dark:bg-navy-700 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => setChartPeriod('30d')}
                      className={`px-3 py-1 rounded-lg transition ${
                        chartPeriod === '30d'
                          ? 'bg-white dark:bg-navy-700 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Last 30 Days
                    </button>
                  </div>
                </div>

                {/* SVG/CSS Interactive Bar & Sparkline Chart */}
                <div className="relative pt-6">
                  {hoveredPoint && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg z-10">
                      <span className="font-bold text-brand-300">{hoveredPoint.date}:</span> {hoveredPoint.views} views • {hoveredPoint.claps} claps
                    </div>
                  )}

                  <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-200 dark:border-navy-800">
                    {trendPoints.map((pt, idx) => {
                      const barHeight = Math.max(12, Math.round((pt.views / maxViewsInTrend) * 100));
                      const isHovered = hoveredPoint?.date === pt.date;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        >
                          <div
                            style={{ height: `${barHeight}%` }}
                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                              isHovered
                                ? 'bg-brand-500 shadow-lg shadow-brand-500/50 scale-y-105'
                                : 'bg-gradient-to-t from-brand-600 to-indigo-400 group-hover:bg-brand-500 opacity-90'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2 px-1">
                    <span>{trendPoints[0]?.date || 'Start'}</span>
                    <span>{trendPoints[Math.floor(trendPoints.length / 2)]?.date || 'Mid'}</span>
                    <span>{trendPoints[trendPoints.length - 1]?.date || 'Today'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Traffic Sources & Top Tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <FiPieChart className="w-4 h-4 text-indigo-500" />
                    <span>Referral Traffic Channels</span>
                  </h3>
                  <div className="space-y-4 pt-2">
                    {(analyticsData?.trafficSources || []).map((src, idx) => {
                      const colors = [
                        'bg-brand-500',
                        'bg-purple-500',
                        'bg-emerald-500',
                        'bg-amber-500',
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-300">{src.source}</span>
                            <span className="text-slate-900 dark:text-white font-bold">
                              {src.percentage}% ({src.visitors} readers)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`${color} h-full rounded-full transition-all duration-700`}
                              style={{ width: `${src.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Tags & Best Performing Articles */}
                <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <FiZap className="w-4 h-4 text-amber-500" />
                    <span>Top-Performing Tags & Concepts</span>
                  </h3>

                  {analyticsData?.topTags && analyticsData.topTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {analyticsData.topTags.map((tagItem, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center space-x-2 text-xs"
                        >
                          <span className="font-bold text-brand-600 dark:text-brand-400">#{tagItem.tag}</span>
                          <span className="text-slate-400 font-medium">• {tagItem.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 pt-2">
                      Tags will appear here once your articles accumulate readership impressions.
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Leading Stories Ranking
                    </h4>
                    <div className="space-y-2">
                      {(analyticsData?.topArticles || []).map((art, idx) => (
                        <div
                          key={art._id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-navy-850"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-extrabold text-slate-400">#{idx + 1}</span>
                            <Link
                              to={`/blog/${art.slug || art._id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 truncate max-w-[220px]"
                            >
                              {art.title}
                            </Link>
                          </div>
                          <span className="font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">
                            {art.views} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NEWSLETTER DISPATCHER */}
      {/* ========================================================================= */}
      {activeTab === 'newsletter' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Subscriber Overview Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-navy-900 border border-purple-500/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                Substack-Style Publishing
              </span>
              <h2 className="text-2xl font-black">Creator Newsletter Engine</h2>
              <p className="text-xs text-purple-200 max-w-lg">
                Publish exclusive issue digests, deep dives, or engineering updates directly to your subscribers' inboxes.
              </p>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm self-start sm:self-auto">
              <FiUsers className="w-6 h-6 text-purple-300" />
              <div>
                <p className="text-2xl font-black">{subscribersCount}</p>
                <p className="text-[11px] uppercase font-bold text-purple-200">Active Subscribers</p>
              </div>
            </div>
          </div>

          {/* Dispatch New Issue Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <FiSend className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dispatch New Issue
                </h3>
                <p className="text-xs text-slate-500">
                  Compose your digest. Notifications will be queued for all {subscribersCount} subscribers.
                </p>
              </div>
            </div>

            <form onSubmit={handleDispatchNewsletter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Line / Issue Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue #14: The Architecture Behind Real-time WebSockets"
                  value={newsletterTitle}
                  onChange={(e) => setNewsletterTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Newsletter Content (Markdown Supported)
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Hey subscribers! In this issue, I am sharing the key breakthroughs from our latest production migration..."
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {newsletterContent.length} characters • ~{Math.ceil(newsletterContent.split(/\s+/).filter(Boolean).length / 200)} min read
                </span>
                <button
                  type="submit"
                  disabled={dispatching || !newsletterTitle.trim() || !newsletterContent.trim()}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{dispatching ? 'Dispatching...' : `Dispatch Issue to ${subscribersCount} Subscribers`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Dispatched History */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FiClock className="w-4 h-4 text-purple-600" />
              <span>Previously Dispatched Issues ({sentIssues.length})</span>
            </h3>

            {loadingNewsletter ? (
              <LoadingSpinner text="Loading newsletter archive..." />
            ) : sentIssues.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No newsletters sent yet. Dispatch your first issue above!
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {sentIssues.map((issue, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {issue.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-shrink-0">
                      <span>{new Date(issue.sentAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 font-semibold">
                        {issue.recipientCount} delivered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREATOR WALLET & TIP JAR */}
      {/* ========================================================================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Wallet Balance Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
                  Instant Reader Support
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black">
                ${(wallet.balance || 0).toFixed(2)} USD
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Accumulated from reader micro-tips and appreciations across your published stories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleWithdrawal}
                disabled={withdrawing || (wallet.balance || 0) <= 0}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white text-emerald-700 hover:bg-slate-50 disabled:opacity-50 font-bold text-xs shadow-md transition"
              >
                <FiDollarSign className="w-4 h-4" />
                <span>{withdrawing ? 'Processing Payout...' : 'Request Payout'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <FiGift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Tips Received
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {wallet.tipsReceivedCount || 0}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Wallet Status
                </p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Active & Verified (Instant Rail)
                </p>
              </div>
            </div>
          </div>

          {/* Recent Supporter Tips Feed */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FiGift className="w-4 h-4 text-emerald-600" />
              <span>Recent Supporter Cheers & Tips</span>
            </h3>

            {loadingWallet ? (
              <LoadingSpinner text="Loading supporter transactions..." />
            ) : !wallet.recentTips || wallet.recentTips.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No tips received yet
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Readers can tip you anytime by clicking the "☕ Tip Author" button on any of your articles.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {wallet.recentTips.map((tipItem) => (
                  <div
                    key={tipItem._id}
                    className="py-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <img
                        src={
                          tipItem.sender?.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                        }
                        alt={tipItem.sender?.name || 'Supporter'}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {tipItem.sender?.name || 'Generous Reader'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tipItem.message}
                        </p>
                        {tipItem.post && (
                          <Link
                            to={`/blog/${tipItem.post.slug || tipItem.post._id}`}
                            className="text-[11px] text-brand-600 hover:underline mt-1 block truncate"
                          >
                            On story: "{tipItem.post.title}"
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        +${(tipItem.amount || 5).toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tipItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to permanently delete "${postToDelete?.title}"? All associated comments and analytics will be erased.`}
        confirmText="Delete Permanently"
        isLoading={deleting}
      />
    </div>
  );
};

export default DashboardPage;
