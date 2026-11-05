import React, { useState, useRef, useEffect } from 'react';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiCopy,
  FiCheck,
  FiStar,
  FiChevronRight,
  FiZap,
} from 'react-icons/fi';
import { postService } from '../../services/api';
import toast from 'react-hot-toast';

const ArticleAiChatDrawer = ({ isOpen, onClose, post }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! I'm your AI reading copilot for "${post?.title || 'this article'}". Ask me anything—from summarizing the main thesis to explaining code snippets or technical trade-offs!`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Summarize the 3 key takeaways',
    'Explain the core thesis to a beginner (ELI5)',
    'What are the code patterns or examples?',
    'What are the trade-offs or alternatives?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || !post?._id || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await postService.askAi(post._id, q);
      if (res.data.success && res.data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: res.data.answer },
        ]);
      } else {
        toast.error('Could not retrieve AI answer');
      }
    } catch (err) {
      console.error('Failed to ask AI:', err);
      toast.error(err.response?.data?.message || 'AI assistant is currently unavailable');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ I encountered an error analyzing the post. Key takeaway: "${post.description || post.title}".`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Answer copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 dark:border-navy-800 animate-slideInRight">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white shadow-md shadow-brand-500/20">
              <FiStar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>Ask This Story</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 uppercase tracking-wider">
                  RAG Copilot
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                {post?.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-3 bg-brand-50/40 dark:bg-navy-950/20 border-b border-slate-100 dark:border-navy-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2 flex items-center space-x-1">
            <FiZap className="w-3 h-3" />
            <span>Suggested Inquiries</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 hover:bg-brand-50 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-medium transition shadow-2xs hover:border-brand-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-navy-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.role === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-navy-700/50 flex justify-end">
                    <button
                      onClick={() => copyToClipboard(msg.text, idx)}
                      className="inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <FiCheck className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3 h-3" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-brand-600 dark:text-brand-400 p-3 bg-brand-50/50 dark:bg-navy-800/50 rounded-2xl border border-brand-200/40 w-fit">
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
              <span>Analyzing story context & synthesizing answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about this article..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-md shadow-brand-500/20 transition flex-shrink-0"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-2 text-[10px] text-center text-slate-400">
            Powered by BlogHub RAG Copilot • Answers grounded in article source text
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleAiChatDrawer;
