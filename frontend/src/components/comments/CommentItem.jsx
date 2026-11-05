import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiShield } from 'react-icons/fi';

const CommentItem = ({
  comment,
  currentUserId,
  postAuthorId,
  isAdmin,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const isCommentAuthor = currentUserId && comment.author?._id === currentUserId;
  const isPostOwner = currentUserId && postAuthorId === currentUserId;
  const canEdit = isCommentAuthor;
  const canDelete = isCommentAuthor || isPostOwner || isAdmin;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    const success = await onUpdate(comment._id, editContent.trim());
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft transition">
      <div className="flex items-start justify-between">
        {/* Author info */}
        <div className="flex items-center space-x-3">
          <img
            src={
              comment.author?.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={comment.author?.name || 'Author'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {comment.author?.name || 'User'}
              </span>
              {comment.author?._id === postAuthorId && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <FiShield className="w-2.5 h-2.5" />
                  <span>Author</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {formattedDate} {comment.updatedAt !== comment.createdAt && '(edited)'}
            </span>
          </div>
        </div>

        {/* Action buttons (Edit / Delete) */}
        {!isEditing && (
          <div className="flex items-center space-x-1">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Comment"
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(comment._id)}
                title={isPostOwner && !isCommentAuthor ? 'Moderate Comment (Post Owner)' : 'Delete Comment'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment Body */}
      {isEditing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full p-3 text-sm rounded-xl border border-brand-500 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            placeholder="Edit your comment..."
          />
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition flex items-center space-x-1"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !editContent.trim()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition flex items-center space-x-1"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>
      )}
    </div>
  );
};

export default CommentItem;

