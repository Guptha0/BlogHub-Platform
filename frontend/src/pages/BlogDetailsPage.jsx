import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CommentSection from '../components/comments/CommentSection';
import BlogCard from '../components/common/BlogCard';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReadingProgressBar from '../components/common/ReadingProgressBar';
import ClapButton from '../components/common/ClapButton';
import ShareModal from '../components/common/ShareModal';
import KeyTakeaways from '../components/common/KeyTakeaways';
import TypographyControls from '../components/common/TypographyControls';
import AudioArticleReader from '../components/common/AudioArticleReader';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import TipJarModal from '../components/common/TipJarModal';
import ArticleAiChatDrawer from '../components/common/ArticleAiChatDrawer';
import TextSelectionQuoteToolbar from '../components/common/TextSelectionQuoteToolbar';
import {
  FiClock,
  FiEye,
  FiHeart,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiArrowLeft,
  FiTag,
  FiCalendar,
  FiBookmark,
  FiUserPlus,
  FiUserCheck,
  FiCoffee,
  FiMail,
  FiStar,
  FiPrinter,
  FiGlobe,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const BlogDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { fontSize, fontFamily } = useTheme();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [userClaps, setUserClaps] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Bookmark & Follow state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Modals & Monetization
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI Chat & Multi-language & Selection Quotes
  const articleContentRef = useRef(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const [translationData, setTranslationData] = useState(null);
  const [translating, setTranslating] = useState(false);

  // Newsletter subscription
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const res = await postService.getPostById(id);
        if (res.data.success) {
          const postData = res.data.post;
          setPost(postData);
          setUserClaps(res.data.userClaps || 0);

          // Check if user liked
          if (user && postData.likes) {
            const hasLiked = postData.likes.some(
              (likeId) => likeId === user._id || likeId._id === user._id
            );
            setIsLiked(hasLiked);
          }
          setLikesCount(postData.likes ? postData.likes.length : 0);

          // Author follow status
          if (postData.author) {
            const followers = postData.author.followers || [];
            setFollowersCount(followers.length);
            if (user) {
              const following = followers.some(
                (f) => f === user._id || f._id === user._id || f.toString() === user._id.toString()
              );
              setIsFollowingAuthor(following);
            }
          }

          // Fetch user bookmarks to see if this post is saved
          if (user) {
            try {
              const bmRes = await userService.getBookmarks();
              if (bmRes.data.success) {
                const saved = bmRes.data.bookmarks.some(
                  (b) => b._id === postData._id
                );
                setIsBookmarked(saved);
              }
            } catch (bmErr) {
              // Ignore bookmark fetch error
            }
          }

          // Fetch related posts
          try {
            const relRes = await postService.getRelated(postData._id);
            if (relRes.data.success) {
              setRelatedPosts(relRes.data.posts || []);
            }
          } catch (relErr) {
            // Ignore related posts error
          }

          // Real-time SSE Stream connection for live claps, likes, comments & tips
          try {
            eventSource = new EventSource(`/api/posts/${postData._id}/stream`);
            eventSource.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'CLAP_UPDATE') {
                  setPost((prev) => (prev ? { ...prev, clapsCount: data.clapsCount } : prev));
                } else if (data.type === 'LIKE_UPDATE') {
                  setLikesCount(data.likesCount);
                } else if (data.type === 'TIP_RECEIVED') {
                  toast(`🎉 ${data.senderName || 'A reader'} just tipped $${data.amount} to this story!`, {
                    icon: '☕',
                    duration: 5000,
                  });
                }
              } catch (e) {
                // Heartbeat ping
              }
            };
          } catch (sseErr) {
            console.warn('SSE stream unavailable:', sseErr);
          }
        }
      } catch (err) {
        console.error('Failed to load post details:', err);
        toast.error('Blog post not found or could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    let eventSource = null;
    fetchPostDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [id, user]);

  const handleSubscribeNewsletter = async (e) => {
    e.preventDefault();
    const emailToUse = subscriberEmail.trim() || user?.email;
    if (!emailToUse) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubscribing(true);
      const res = await userService.subscribeNewsletter(post.author._id, {
        email: emailToUse,
      });
      if (res.data.success) {
        setIsSubscribed(true);
        toast.success(res.data.message || 'Subscribed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe to newsletter');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like this story');
      navigate('/login');
      return;
    }

    try {
      const res = await postService.toggleLike(post._id);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      toast.error('Unable to update like status');
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save stories');
      navigate('/login');
      return;
    }

    try {
      const res = await userService.toggleBookmark(post._id);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Unable to update bookmark');
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow authors');
      navigate('/login');
      return;
    }

    if (!post.author?._id) return;

    try {
      setFollowLoading(true);
      const res = await userService.toggleFollow(post.author._id);
      if (res.data.success) {
        setIsFollowingAuthor(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to follow author');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      const res = await postService.deletePost(post._id);
      if (res.data.success) {
        toast.success('Blog post deleted successfully');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // AI Multi-language translation
  const handleTranslate = async (langCode) => {
    if (langCode === 'en') {
      setActiveLang('en');
      setTranslationData(null);
      return;
    }

    try {
      setTranslating(true);
      setActiveLang(langCode);
      const res = await postService.translate(post._id, langCode);
      if (res.data.success) {
        setTranslationData(res.data);
        toast.success(`Translated to ${res.data.langName}!`);
      }
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Could not translate article');
      setActiveLang('en');
    } finally {
      setTranslating(false);
    }
  };

  // Quote selected text into comment input
  const handleQuoteComment = (quote) => {
    const commentInput = document.querySelector('textarea[name="comment"]');
    if (commentInput) {
      commentInput.value = `> "${quote}"\n\n` + (commentInput.value || '');
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrintArticle = () => {
    window.print();
  };

  // Typography dynamic class computation
  const getBodyTypographyClass = () => {
    const familyClass = fontFamily === 'serif' ? 'font-reading-serif' : 'font-reading-sans';
    let sizeClass = 'text-base leading-relaxed';
    if (fontSize === 'sm') sizeClass = 'text-sm leading-relaxed';
    if (fontSize === 'lg') sizeClass = 'text-lg sm:text-xl leading-loose';
    return `${familyClass} ${sizeClass}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading story..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Post Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The article you are looking for might have been removed or unpublished.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Explore Articles</span>
        </Link>
      </div>
    );
  }

  const isAuthor = user && (user._id === post.author?._id || user._id === post.author);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen pb-16">
      {/* 1. Sleek Gradient Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Back Link */}
        <Link
          to="/explore"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        {/* 2. Reader Typography & Theme Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <TypographyControls />

          {/* Reader Superpowers Toolbar: Multi-language, PDF, and AI Chat */}
          <div className="flex items-center space-x-2 self-end sm:self-auto print:hidden">
            {/* Multi-language Selector */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-[11px] font-bold">
              <span className="px-1.5 text-slate-400">
                <FiGlobe className="w-3.5 h-3.5" />
              </span>
              {[
                { code: 'en', label: 'EN' },
                { code: 'es', label: 'ES' },
                { code: 'fr', label: 'FR' },
                { code: 'de', label: 'DE' },
                { code: 'ja', label: 'JA' },
                { code: 'hi', label: 'HI' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  disabled={translating}
                  onClick={() => handleTranslate(lang.code)}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    activeLang === lang.code
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Print / PDF Export */}
            <button
              onClick={handlePrintArticle}
              title="Print or Save as PDF"
              className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition"
            >
              <FiPrinter className="w-4 h-4" />
            </button>

            {/* Ask AI Copilot */}
            <button
              onClick={() => setAiChatOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              <FiStar className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Story AI</span>
            </button>
          </div>
        </div>

        {/* Translation Banner if active */}
        {translationData && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-navy-900 dark:to-navy-850 border border-brand-200 dark:border-brand-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-brand-900 dark:text-brand-200">
              <FiGlobe className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>
                Viewing AI translation in <strong>{translationData.langName}</strong> (Original: English)
              </span>
            </div>
            <button
              onClick={() => handleTranslate('en')}
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0"
            >
              Restore English
            </button>
          </div>
        )}

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-navy-900 dark:text-brand-300 border border-brand-200 dark:border-navy-800">
              {post.category}
            </span>
            {post.status === 'draft' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                Draft Preview
              </span>
            )}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <FiClock className="w-3.5 h-3.5" />
              <span>{post.readTime || 3} min read</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
            {translationData?.translatedTitle || post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {translationData?.translatedDescription || post.description}
          </p>

          {/* Author Card & Actions Bar */}
          <div className="pt-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-slate-200/80 dark:border-navy-800">
            {/* Author info */}
            <div className="flex items-center space-x-3.5">
              <Link to={`/profile/${post.author?.username}`}>
                <img
                  src={post.author?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={post.author?.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20"
                />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/profile/${post.author?.username}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    {post.author?.name || 'Anonymous Author'}
                  </Link>

                  {/* Follow button if not own post */}
                  {!isAuthor && post.author?._id && (
                    <button
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition ${
                        isFollowingAuthor
                          ? 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                      }`}
                    >
                      {isFollowingAuthor ? (
                        <>
                          <FiUserCheck className="w-3 h-3 text-emerald-500" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <FiUserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>{followersCount} followers</span>
                </div>
              </div>
            </div>

            {/* Interaction Bar (Clap, Like, Bookmark, Share, Author Controls) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Medium-style Claps */}
              <ClapButton
                postId={post._id}
                initialClaps={post.clapsCount || 0}
                initialUserClaps={userClaps}
              />

              {/* Likes */}
              <button
                onClick={handleToggleLike}
                title={isLiked ? 'Unlike article' : 'Like article'}
                className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl border transition ${
                  isLiked
                    ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400'
                    : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:border-pink-300'
                }`}
              >
                <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current text-pink-500' : ''}`} />
                <span className="text-xs font-bold">{likesCount}</span>
              </button>

              {/* Tip Jar Button */}
              {!isAuthor && post.author?._id && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to tip creators');
                      navigate('/login');
                      return;
                    }
                    setTipModalOpen(true);
                  }}
                  title="Tip the Author"
                  className="flex items-center space-x-1 px-3 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition shadow-sm"
                >
                  <FiCoffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold">Tip</span>
                </button>
              )}

              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                title={isBookmarked ? 'Remove bookmark' : 'Save story'}
                className={`p-2.5 rounded-2xl border transition ${
                  isBookmarked
                    ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-300'
                    : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                }`}
              >
                <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Drawer Trigger */}
              <button
                onClick={() => setShareModalOpen(true)}
                title="Share this article"
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
              >
                <FiShare2 className="w-4 h-4" />
              </button>

              {/* Author Edit / Delete */}
              {isAuthor && (
                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-navy-800">
                  <Link
                    to={`/edit/${post._id}`}
                    title="Edit article"
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                  >
                    <FiEdit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    title="Delete article"
                    className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.image && (
          <div className="mt-8 rounded-3xl overflow-hidden aspect-[16/9] shadow-soft-xl bg-slate-100 dark:bg-navy-900">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 3. AI Summary / Key Takeaways Widget */}
        <KeyTakeaways takeaways={post.keyTakeaways} />

        {/* Floating / Sticky Web Speech Audio Reader */}
        <div className="mt-8">
          <AudioArticleReader
            title={post.title}
            content={post.content}
            authorName={post.author?.name}
          />
        </div>

        {/* 4. Article Body with Syntax-Highlighted Code, KaTeX Math & Text Selection Quote Toolbar */}
        <div ref={articleContentRef} className={`mt-8 ${getBodyTypographyClass()} relative`}>
          <TextSelectionQuoteToolbar
            containerRef={articleContentRef}
            postTitle={post.title}
            onQuoteComment={handleQuoteComment}
          />
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-navy-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center space-x-1">
              <FiTag className="w-3.5 h-3.5" />
              <span>Tags:</span>
            </span>
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Creator Newsletter Subscription Card */}
        {post.author && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/30 via-brand-900/30 to-indigo-900/30 border border-brand-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left max-w-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                Creator Newsletter
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Stay updated with {post.author.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Get new articles, engineering deep dives, and exclusive commentary delivered directly to your inbox.
              </p>
            </div>
            {isSubscribed ? (
              <div className="px-5 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center space-x-1.5 border border-emerald-500/30">
                <FiCheck className="w-4 h-4 text-emerald-400" />
                <span>Subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribeNewsletter} className="flex items-center w-full sm:w-auto space-x-2">
                <input
                  type="email"
                  placeholder={user?.email || "Your email address"}
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full sm:w-64"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs whitespace-nowrap shadow-sm shadow-brand-500/20 transition disabled:opacity-50"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-navy-800">
          <CommentSection
            postId={post._id}
            postAuthorId={post.author?._id || post.author}
          />
        </div>

        {/* Related Stories */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200 dark:border-navy-800 space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Related in {post.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <BlogCard key={related._id} post={related} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tip Jar Modal */}
      {post.author && (
        <TipJarModal
          isOpen={tipModalOpen}
          onClose={() => setTipModalOpen(false)}
          author={post.author}
          postId={post._id}
        />
      )}

      {/* Share & Embed Drawer */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        post={post}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post?"
        message="This action is permanent and will cascade delete all comments associated with this article."
        confirmText={deleting ? 'Deleting...' : 'Delete Article'}
        danger
      />

      {/* Floating Ask Story AI Button */}
      <button
        onClick={() => setAiChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 hover:scale-105 text-white font-bold text-xs shadow-xl shadow-brand-500/30 transition print:hidden"
      >
        <FiStar className="w-4 h-4 text-amber-300" />
        <span>Ask Story AI</span>
      </button>

      {/* RAG Story Copilot Drawer */}
      <ArticleAiChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        post={post}
      />
    </article>
  );
};

export default BlogDetailsPage;
