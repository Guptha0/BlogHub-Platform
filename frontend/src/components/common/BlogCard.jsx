import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiHeart, FiMessageSquare, FiEye, FiBookmark } from 'react-icons/fi';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Programming: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Design & UX': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Artificial Intelligence': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Productivity: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const BlogCard = ({ post, initialBookmarked = false, onBookmarkToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarking, setBookmarking] = useState(false);

  if (!post) return null;

  const {
    _id,
    slug,
    title,
    description,
    image,
    category,
    readTime = 3,
    author,
    createdAt,
    likes = [],
    clapsCount = 0,
    commentCount = 0,
    views = 0,
    status,
  } = post;

  const targetId = slug || _id;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryStyle =
    categoryColors[category] ||
    'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300';

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save stories');
      return;
    }

    try {
      setBookmarking(true);
      const res = await userService.toggleBookmark(_id);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
        if (onBookmarkToggle) onBookmarkToggle(_id, res.data.isBookmarked);
      }
    } catch (err) {
      toast.error('Could not update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <article className="group flex flex-col bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-soft hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative">
      {/* Thumbnail */}
      <Link to={`/blog/${targetId}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-navy-800">
        <img
          src={image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${categoryStyle}`}>
            {category}
          </span>
          {status === 'draft' && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/90 text-white">
              Draft
            </span>
          )}
        </div>

        {/* Bookmark Icon Button on Thumbnail */}
        <button
          onClick={handleBookmarkClick}
          disabled={bookmarking}
          title={isBookmarked ? 'Remove Bookmark' : 'Save Story'}
          className={`absolute top-3 right-3 p-2 rounded-2xl backdrop-blur-md transition-all shadow-sm ${
            isBookmarked
              ? 'bg-brand-600 text-white'
              : 'bg-black/40 hover:bg-black/60 text-white'
          }`}
        >
          <FiBookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white flex items-center space-x-1">
          <FiClock className="w-3 h-3" />
          <span>{readTime} min read</span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 sm:p-6">
        <Link to={`/blog/${targetId}`} className="block">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
            {title}
          </h2>
        </Link>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Author & Meta footer */}
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-navy-800/80">
          <div className="flex items-center space-x-3">
            <img
              src={author?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={author?.name || 'Author'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {author?.name || 'Anonymous'}
              </p>
              <p className="text-[11px] text-slate-400">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-slate-400">
            {clapsCount > 0 && (
              <span className="flex items-center space-x-1" title={`${clapsCount} claps`}>
                <span>👏</span>
                <span>{clapsCount}</span>
              </span>
            )}
            <span className="flex items-center space-x-1" title={`${likes.length} likes`}>
              <FiHeart className="w-3.5 h-3.5 text-pink-500" />
              <span>{likes.length}</span>
            </span>
            <span className="flex items-center space-x-1" title={`${commentCount} comments`}>
              <FiMessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>{commentCount}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
