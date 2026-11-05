import React, { useState } from 'react';
import { FiX, FiCopy, FiCheck, FiTwitter, FiLinkedin, FiCode, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, post }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState('social'); // 'social' | 'embed'

  if (!isOpen || !post) return null;

  const currentUrl = window.location.href;
  const postTitle = post.title || 'Check out this article on BlogHub';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    postTitle
  )}&url=${encodeURIComponent(currentUrl)}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    currentUrl
  )}`;

  // Embed card snippet
  const embedCode = `<iframe src="${window.location.origin}/blog/${post.slug || post._id}?embed=true" width="100%" height="320" frameborder="0" style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;" title="${postTitle}"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    toast.success('Embed snippet copied!');
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <FiShare2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Share this Story
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Amplify ideas across your network or embed on your website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-850 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'social'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Social Networks & Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'embed'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Embed HTML Card
          </button>
        </div>

        {activeTab === 'social' ? (
          <div className="space-y-4">
            {/* Direct Copy Bar */}
            <div className="flex items-center space-x-2 p-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 px-2 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition"
              >
                {copiedLink ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
              >
                <FiTwitter className="w-4 h-4" />
                <span>Share on X / Twitter</span>
              </a>
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                <FiLinkedin className="w-4 h-4" />
                <span>Share on LinkedIn</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                HTML Embed Snippet
              </label>
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full font-mono text-[11px] p-3 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 focus:outline-none select-all"
              />
            </div>

            <button
              onClick={handleCopyEmbed}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
            >
              {copiedEmbed ? <FiCheck className="w-4 h-4" /> : <FiCode className="w-4 h-4" />}
              <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
