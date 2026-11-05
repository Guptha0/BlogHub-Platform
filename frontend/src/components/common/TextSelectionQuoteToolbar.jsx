import React, { useState, useEffect } from 'react';
import { FiCopy, FiMessageSquare, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TextSelectionQuoteToolbar = ({ containerRef, onQuoteComment, postTitle }) => {
  const [position, setPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 5) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      // Check if selection is inside containerRef
      if (containerRef?.current && containerRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPosition({
          top: rect.top + window.scrollY - 48,
          left: Math.max(16, rect.left + window.scrollX + rect.width / 2 - 110),
        });
        setSelectedText(text);
      } else {
        setPosition(null);
        setSelectedText('');
      }
    };

    const handleMouseDown = (e) => {
      // Don't hide if clicking on toolbar itself
      if (e.target.closest('#selection-quote-toolbar')) return;
      setPosition(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef]);

  if (!position || !selectedText) return null;

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${selectedText}" — from "${postTitle || 'BlogHub'}"`);
    setCopied(true);
    toast.success('Quote copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setPosition(null);
    }, 1500);
  };

  const handleShareToX = () => {
    const tweetText = `"${selectedText.slice(0, 180)}${selectedText.length > 180 ? '...' : ''}"`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    setPosition(null);
  };

  const handleQuoteInDiscussion = () => {
    if (onQuoteComment) {
      onQuoteComment(selectedText);
      toast.success('Quote added to comment editor!');
    }
    setPosition(null);
  };

  return (
    <div
      id="selection-quote-toolbar"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
      className="flex items-center space-x-1 p-1 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md animate-scaleIn"
    >
      <button
        onClick={handleShareToX}
        title="Share quote to X / Twitter"
        className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold flex items-center space-x-1.5 text-slate-200 hover:text-white transition"
      >
        <span className="font-bold text-xs">𝕏</span>
        <span>Quote</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-700" />

      <button
        onClick={handleQuoteInDiscussion}
        title="Quote in discussion"
        className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold flex items-center space-x-1.5 text-slate-200 hover:text-white transition"
      >
        <FiMessageSquare className="w-3.5 h-3.5 text-brand-400" />
        <span>Discuss</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-700" />

      <button
        onClick={handleCopyQuote}
        title="Copy selected quote"
        className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold flex items-center space-x-1.5 text-slate-200 hover:text-white transition"
      >
        {copied ? (
          <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <FiCopy className="w-3.5 h-3.5" />
        )}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};

export default TextSelectionQuoteToolbar;
