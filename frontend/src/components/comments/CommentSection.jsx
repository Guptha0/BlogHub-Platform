import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { commentService } from '../../services/api';
import CommentItem from './CommentItem';
import ConfirmationModal from '../common/ConfirmationModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiMessageSquare, FiSend, FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentService.getComments(postId);
      if (res.data.success) {
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentService.addComment(postId, {
        content: newComment.trim(),
      });

      if (res.data.success) {
        // Dynamic update without page reload
        setComments((prev) => [res.data.comment, ...prev]);
        setNewComment('');
        toast.success('Comment posted successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      const res = await commentService.updateComment(commentId, {
        content: newContent,
      });
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? res.data.comment : c))
        );
        toast.success('Comment updated successfully');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
      return false;
    }
  };

  const promptDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      setDeleting(true);
      const res = await commentService.deleteComment(commentToDelete);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentToDelete));
        toast.success('Comment deleted successfully');
        setDeleteModalOpen(false);
        setCommentToDelete(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const isPostOwner = user?._id === postAuthorId;

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-navy-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-400">
            <FiMessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Discussion ({comments.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join the conversation and share your feedback
            </p>
          </div>
        </div>

        {isPostOwner && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <FiShield className="w-3.5 h-3.5" />
            <span>Post Owner Moderation Active</span>
          </div>
        )}
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="mb-10">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={
                  user?.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Commenting as <strong className="text-brand-600 dark:text-brand-400">{user?.name}</strong>
              </span>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts on this story? Be respectful and constructive..."
              rows={3}
              maxLength={1000}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-y"
            />

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {1000 - newComment.length} characters left
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-3.5 h-3.5" />
                )}
                <span>Post Comment</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-dashed border-slate-300 dark:border-navy-800 text-center">
          <FiLock className="w-6 h-6 mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Sign in to join the conversation
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Only authenticated users can publish comments and interact with creators.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <LoadingSpinner size="md" text="Loading comments..." />
      ) : comments.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
              postAuthorId={postAuthorId}
              isAdmin={user?.role === 'admin'}
              onUpdate={handleUpdateComment}
              onDelete={promptDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment? This cannot be undone."
        confirmText="Delete Comment"
        isLoading={deleting}
      />
    </section>
  );
};

export default CommentSection;

