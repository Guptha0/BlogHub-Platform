import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-700/80 bg-navy-950 shadow-xl font-mono text-xs sm:text-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-2">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto text-slate-100 flex leading-relaxed">
        <div className="select-none pr-4 text-slate-600 text-right font-mono border-r border-slate-800/80 mr-4">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="font-mono flex-1 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const renderWithMath = (text) => {
  if (!text) return null;

  // Split by block math $$...$$ first
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return blockParts.map((part, bIdx) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = part.slice(2, -2).trim();
      try {
        const html = katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
        return (
          <div
            key={bIdx}
            className="my-4 p-3 rounded-2xl bg-slate-100/60 dark:bg-navy-900/60 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return <code key={bIdx} className="text-pink-500">{part}</code>;
      }
    }

    // Process inline math $...$
    const inlineParts = part.split(/(\$[^$\n]+\$)/g);

    return inlineParts.map((sub, iIdx) => {
      if (sub.startsWith('$') && sub.endsWith('$') && sub.length > 2) {
        const math = sub.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`${bIdx}-${iIdx}`}
              className="inline-math mx-1"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (err) {
          return <span key={`${bIdx}-${iIdx}`}>{sub}</span>;
        }
      }

      return sub;
    });
  });
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push({
        type: 'text',
        content: textBefore,
      });
    }

    elements.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push({
      type: 'text',
      content: remainingText,
    });
  }

  return (
    <div className="space-y-4 leading-relaxed">
      {elements.map((el, idx) => {
        if (el.type === 'code') {
          return <CodeBlock key={idx} code={el.code} language={el.language} />;
        }

        // Render paragraphs and headers with KaTeX support
        const paragraphs = el.content.split('\n\n');
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={`${idx}-${pIdx}`} className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white">
                {renderWithMath(trimmed.replace('### ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={`${idx}-${pIdx}`} className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">
                {renderWithMath(trimmed.replace('## ', ''))}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={`${idx}-${pIdx}`} className="text-3xl font-extrabold mt-8 mb-4 text-slate-900 dark:text-white">
                {renderWithMath(trimmed.replace('# ', ''))}
              </h1>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={`${idx}-${pIdx}`} className="my-4 pl-4 border-l-4 border-brand-500 italic text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-navy-900/40 p-3 rounded-r-2xl">
                {renderWithMath(trimmed.replace(/^>\s*/, ''))}
              </blockquote>
            );
          }

          return (
            <p key={`${idx}-${pIdx}`} className="text-slate-700 dark:text-slate-200">
              {renderWithMath(trimmed)}
            </p>
          );
        });
      })}
    </div>
  );
};

export default MarkdownRenderer;
