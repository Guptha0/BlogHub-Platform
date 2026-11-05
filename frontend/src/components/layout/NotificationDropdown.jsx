import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/api';
import {
  FiBell,
  FiCheck,
  FiHeart,
  FiMessageSquare,
  FiUserPlus,
  FiDollarSign,
  FiMail,
} from 'react-icons/fi';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 45 seconds for new interactions
    const timer = setInterval(fetchNotifications, 45000);
    return () => clearInterval(timer);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'clap':
        return <FiHeart className="w-3.5 h-3.5 text-pink-500" />;
      case 'comment':
        return <FiMessageSquare className="w-3.5 h-3.5 text-indigo-500" />;
      case 'follow':
        return <FiUserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      case 'tip':
        return <FiDollarSign className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FiMail className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition border border-slate-200/60 dark:border-navy-800"
        title="Notifications"
        aria-label="View notifications"
      >
        <FiBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-purple-600 to-brand-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-2xl py-3 z-50 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <FiCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/70 dark:divide-navy-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications yet. You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 flex items-start space-x-3 transition hover:bg-slate-50 dark:hover:bg-navy-850/50 ${
                    !n.read ? 'bg-brand-50/30 dark:bg-navy-950/40' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <img
                      src={
                        n.sender?.profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={n.sender?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-navy-800"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-navy-900 shadow-xs">
                      {getIcon(n.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                      {n.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.post?.slug && (
                        <Link
                          to={`/blog/${n.post.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-semibold text-brand-600 hover:underline truncate max-w-[120px]"
                        >
                          View story
                        </Link>
                      )}
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                      className="text-slate-400 hover:text-brand-500 p-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
