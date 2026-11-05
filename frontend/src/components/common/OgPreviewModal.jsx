import React, { useState } from 'react';
import {
  FiX,
  FiGlobe,
  FiShare2,
  FiExternalLink,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';

const OgPreviewModal = ({ isOpen, onClose, title, description, image, category }) => {
  const [platform, setPlatform] = useState('twitter'); // 'twitter' | 'linkedin' | 'whatsapp' | 'google'

  if (!isOpen) return null;

  const displayTitle = title || 'Untitled Story: Discover Modern Engineering';
  const displayDesc =
    description ||
    'Comprehensive technical walkthrough exploring architectural patterns, system design, and production workflows on BlogHub.';
  const displayImage =
    image ||
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80';

  const isTitleOptimal = displayTitle.length >= 20 && displayTitle.length <= 70;
  const isDescOptimal = displayDesc.length >= 50 && displayDesc.length <= 160;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-7 shadow-2xl space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Social Share & SEO Card Previewer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect how your article renders when shared across external networks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'twitter', name: '𝕏 / Twitter Card' },
            { id: 'linkedin', name: 'LinkedIn Share' },
            { id: 'whatsapp', name: 'WhatsApp & Messaging' },
            { id: 'google', name: 'Google Search SERP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatform(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                platform === tab.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Card Previews */}
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-850 flex items-center justify-center min-h-[260px]">
          {/* Twitter Card */}
          {platform === 'twitter' && (
            <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black shadow-md font-sans">
              <div className="h-52 w-full overflow-hidden bg-slate-200 relative">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white">
                  bloghub.dev
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  bloghub.dev
                </p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {displayTitle}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {displayDesc}
                </p>
              </div>
            </div>
          )}

          {/* LinkedIn Share */}
          {platform === 'linkedin' && (
            <div className="w-full max-w-lg rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 shadow-sm font-sans">
              <div className="h-48 w-full overflow-hidden bg-slate-200">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-0.5 bg-slate-50 dark:bg-navy-850 border-t border-slate-200 dark:border-navy-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {displayTitle}
                </h4>
                <p className="text-[11px] text-slate-400">bloghub.dev • 4 min read</p>
              </div>
            </div>
          )}

          {/* WhatsApp / Chat Bubble */}
          {platform === 'whatsapp' && (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-navy-900 p-2 shadow-sm font-sans">
              <div className="rounded-xl overflow-hidden bg-white dark:bg-navy-950 border border-emerald-100 dark:border-navy-800">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {displayTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {displayDesc}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    https://bloghub.dev/blog/...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google SERP Preview */}
          {platform === 'google' && (
            <div className="w-full max-w-lg p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm font-sans space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  BlogHub
                </span>
                <span>›</span>
                <span>story</span>
                <span>›</span>
                <span className="truncate">{category || 'tech'}</span>
              </div>
              <h4 className="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                {displayTitle} - BlogHub
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            </div>
          )}
        </div>

        {/* SEO Diagnostics Checklist */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100 dark:border-navy-800">
          <div className="flex items-center space-x-2">
            {isTitleOptimal ? (
              <FiCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <FiAlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-slate-600 dark:text-slate-300">
              Title length: {displayTitle.length}/70 chars {isTitleOptimal ? '(Optimal)' : '(Keep 20-70)'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isDescOptimal ? (
              <FiCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <FiAlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-slate-600 dark:text-slate-300">
              Description: {displayDesc.length}/160 chars {isDescOptimal ? '(Optimal)' : '(Keep 50-160)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OgPreviewModal;
