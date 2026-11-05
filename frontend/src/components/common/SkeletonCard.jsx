import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-soft animate-pulse">
      <div className="aspect-[16/9] bg-slate-200 dark:bg-navy-800 w-full" />
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded-lg w-1/4" />
        <div className="h-6 bg-slate-200 dark:bg-navy-800 rounded-lg w-4/5" />
        <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded-lg w-full" />
        <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded-lg w-2/3" />
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-navy-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-navy-800" />
            <div className="h-3 bg-slate-200 dark:bg-navy-800 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-navy-800 rounded w-12" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

export default SkeletonCard;
