// src/components/workspace/MonacoCodeEditor.tsx
// AlgoTrack Phase 6: Code Editor with Language Selector & Clipboard Integration

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Code2, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../../config/languages';
import './MonacoCodeEditor.css';

export interface MonacoCodeEditorProps {
  problemId: string;
  problemTitle: string;
  language: string;
  onLanguageChange: (newLang: string) => void;
  code: string;
  onChange: (val: string) => void;
  onResetToTemplate: () => void;
  leetcodeUrl?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  onLanguageChange,
  code,
  onChange,
  onResetToTemplate,
  leetcodeUrl,
  isExpanded = true,
  onToggleExpand,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorHeight, setEditorHeight] = useState<number>(560);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentLangConfig = getLanguageConfig(language);

  // Vertical resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = editorHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaY = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(260, Math.min(1200, startHeightRef.current + deltaY));
      setEditorHeight(newHeight);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Copy code to clipboard with graceful error fallback
  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setCopyFeedback('Code copied successfully!');
      setTimeout(() => {
        setCopied(false);
        setCopyFeedback(null);
      }, 3000);
    } catch {
      setCopyFeedback('Unable to copy automatically. Please select all code and copy manually.');
      setTimeout(() => setCopyFeedback(null), 4000);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`monaco-workspace-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef}>
      {/* 1. Header Toolbar */}
      <div className="monaco-toolbar">
        {/* Left: Language Selection */}
        <div className="monaco-toolbar-left">
          <div className="monaco-lang-label-group">
            <Code2 size={16} color="#0284C7" />
            <label htmlFor="monaco-lang-select" className="visually-hidden">
              Select Programming Language
            </label>
            <select
              id="monaco-lang-select"
              className="monaco-lang-dropdown"
              value={currentLangConfig.id}
              onChange={(e) => onLanguageChange(e.target.value)}
              title="Select programming language"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions (Copy Code, Reset, Theme, Fullscreen) */}
        <div className="monaco-toolbar-right">
          {/* Prominent Copy Code Button */}
          <button
            type="button"
            className={`monaco-copy-btn ${copied ? 'is-copied' : ''}`}
            onClick={handleCopyCode}
            title="Copy code to clipboard for LeetCode practice"
          >
            {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>

          {/* Reset Template */}
          <button
            type="button"
            className="monaco-tool-btn"
            onClick={onResetToTemplate}
            title="Reset to starter code template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="monaco-tool-btn"
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle editor theme (Light/Dark)"
          >
            {editorTheme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="monaco-tool-btn icon-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Expand / Collapse Section Toggle */}
          {onToggleExpand && (
            <button
              type="button"
              className="monaco-tool-btn icon-only monaco-collapse-btn"
              onClick={onToggleExpand}
              title={isExpanded ? 'Collapse Code Editor' : 'Expand Code Editor'}
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Copy Toast Feedback */}
      {copyFeedback && (
        <div className={`monaco-copy-toast ${copied ? 'success' : 'warning'}`}>
          {copied ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* 2. Monaco Editor Container & Resizer */}
      {isExpanded && (
        <>
          <div className="monaco-editor-pane" style={{ height: isFullscreen ? 'calc(100vh - 160px)' : `${editorHeight}px` }}>
            <Editor
              height="100%"
              language={currentLangConfig.monacoLang}
              value={code}
              theme={editorTheme}
              onChange={(val) => onChange(val || '')}
              options={{
                fontSize: 13.5,
                lineHeight: 22,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                bracketPairColorization: { enabled: true },
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
              loading={
                <div className="monaco-loading-box">
                  <Loader2 size={24} className="spin-icon" />
                  <span>Loading Monaco Editor...</span>
                </div>
              }
            />
          </div>

          {!isFullscreen && (
            <div 
              className="monaco-resize-handle" 
              onMouseDown={handleResizeStart} 
              title="Drag up or down to resize code editor height"
            >
              <div className="monaco-resize-bar"></div>
            </div>
          )}
        </>
      )}

      {/* 3. Informational Footer Note (AlgoTrack does not execute code) */}
      <div className="monaco-info-footer">
        <div className="info-footer-left">
          <AlertCircle size={15} color="#0284C7" className="flex-shrink-0" />
          <p className="info-footer-text">
            Write your solution here, then copy it to practice on LeetCode. AlgoTrack does not execute code.
          </p>
        </div>

        {leetcodeUrl && (
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="monaco-leetcode-link"
            title="Open problem on LeetCode to submit and run tests"
          >
            <span>Open on LeetCode</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};
