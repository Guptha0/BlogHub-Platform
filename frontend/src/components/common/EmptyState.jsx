import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No blogs found',
  description = 'Try adjusting your search criteria or create the first post!',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-soft">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm hover:shadow"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm hover:shadow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

