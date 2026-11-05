import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import BlogCard from '../components/common/BlogCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import {
  FiBookmark,
  FiPlus,
  FiFolder,
  FiList,
  FiTrash2,
  FiCheck,
  FiArrowRight,
  FiBookOpen,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const SavedStoriesPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or readingList._id
  const [bookmarks, setBookmarks] = useState([]);
  const [readingLists, setReadingLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // New list modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const fetchSavedData = async () => {
    try {
      setLoading(true);
      const [bmRes, listsRes] = await Promise.all([
        userService.getBookmarks(),
        userService.getReadingLists(),
      ]);

      if (bmRes.data.success) {
        setBookmarks(bmRes.data.bookmarks || []);
      }
      if (listsRes.data.success) {
        setReadingLists(listsRes.data.readingLists || []);
      }
    } catch (err) {
      console.error('Failed to load saved stories:', err);
      toast.error('Could not load saved stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      setCreatingList(true);
      const res = await userService.createReadingList({
        name: newListName,
        description: newListDesc,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setReadingLists(res.data.readingLists || []);
        setIsModalOpen(false);
        setNewListName('');
        setNewListDesc('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create reading list');
    } finally {
      setCreatingList(false);
    }
  };

  const handleBookmarkToggle = (postId, isNowBookmarked) => {
    if (!isNowBookmarked) {
      setBookmarks((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  // Determine which posts to show
  const currentList =
    activeTab !== 'all' ? readingLists.find((l) => l._id === activeTab) : null;
  const displayedPosts =
    activeTab === 'all' ? bookmarks : currentList ? currentList.posts || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <FiBookmark className="w-4 h-4 fill-current" />
            <span>Personal Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Stories & Reading Lists
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Curate and categorize your bookmarked articles into focused reading lists.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-sm transition"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Reading List</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
          }`}
        >
          <FiBookmark className="w-4 h-4" />
          <span>All Saved Stories ({bookmarks.length})</span>
        </button>

        {readingLists.map((list) => (
          <button
            key={list._id}
            onClick={() => setActiveTab(list._id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === list._id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
            }`}
          >
            <FiFolder className="w-4 h-4" />
            <span>{list.name}</span>
            <span className="text-[11px] opacity-75">
              ({list.posts?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Active Reading List Description */}
      {currentList && (
        <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-navy-900/60 border border-brand-200/60 dark:border-navy-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="font-bold text-slate-900 dark:text-white">
            {currentList.name}
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            {currentList.description || 'No description provided.'}
          </p>
        </div>
      )}

      {/* Stories Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? 'No Saved Stories' : 'List is Empty'}
          description={
            activeTab === 'all'
              ? 'Click the bookmark icon on any article to save it to your library.'
              : 'Add stories to this reading list from article cards or details.'
          }
          actionLabel="Explore Articles"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedPosts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              initialBookmarked={true}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}

      {/* Create Reading List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                <FiFolder className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Reading List
              </h3>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Must Read for React, AI & Robotics"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short note about the purpose of this list..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingList}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {creatingList ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedStoriesPage;
