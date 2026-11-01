// src/components/common/MarkdownRenderer.tsx
// Unified Markdown + KaTeX Math Renderer for Editorial, Problem Descriptions, and AI Responses

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Image as ImageIcon } from 'lucide-react';
import { normalizeEditorialMarkdown, isSafeImageUrl } from '../../utils/markdownNormalizer';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content || !content.trim()) {
    return null;
  }

  const normalized = normalizeEditorialMarkdown(content);

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <div className={`markdown-article-root ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Safe Image Renderer
          img: ({ src, alt }) => {
            if (!isSafeImageUrl(src)) {
              return (
                <div className="markdown-image-placeholder" role="figure" aria-label={alt || 'Problem Diagram'}>
                  <ImageIcon size={16} />
                  <span>Illustration / Diagram: <strong>{alt || 'Concept Diagram'}</strong></span>
                </div>
              );
            }
            return (
              <img
                src={src}
                alt={alt || 'Problem illustration'}
                loading="lazy"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '1em 0' }}
                onError={(e) => {
                  // Fallback on load failure
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'markdown-image-placeholder';
                  placeholder.innerHTML = `<span>[Illustration: ${alt || 'Diagram'}]</span>`;
                  target.parentNode?.insertBefore(placeholder, target);
                }}
              />
            );
          },

          // Code Block / Inline Code
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            const codeString = String(children).replace(/\n$/, '');
            const lang = match ? match[1] : 'code';
            const codeId = Math.random();

            return (
              <div className="markdown-code-block-container">
                <div className="markdown-code-header">
                  <span className="markdown-code-lang">{lang}</span>
                  <button
                    type="button"
                    className={`markdown-code-copy-btn ${copiedIndex === codeId ? 'copied' : ''}`}
                    onClick={() => handleCopyCode(codeString, codeId as any)}
                    title="Copy code"
                  >
                    {copiedIndex === codeId ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
                    <span>{copiedIndex === codeId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          // Responsive Table Wrapper
          table: ({ children }) => (
            <div className="markdown-table-wrapper">
              <table>{children}</table>
            </div>
          ),

          // Safe External Links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
};
