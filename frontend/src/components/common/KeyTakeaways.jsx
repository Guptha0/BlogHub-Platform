import React from 'react';
import { FiZap, FiCheckCircle } from 'react-icons/fi';

const KeyTakeaways = ({ takeaways = [] }) => {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-brand-50/80 via-purple-50/40 to-indigo-50/60 dark:from-navy-900/90 dark:via-purple-950/20 dark:to-indigo-950/30 border border-brand-200/80 dark:border-brand-500/20 shadow-soft my-8">
      {/* Decorative accent element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 mb-3.5">
        <div className="p-1.5 rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/30">
          <FiZap className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs uppercase font-extrabold tracking-wider">
          AI Summary • Key Takeaways
        </span>
      </div>

      {/* Bullets List */}
      <ul className="space-y-2.5">
        {takeaways.map((point, idx) => (
          <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <FiCheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyTakeaways;
