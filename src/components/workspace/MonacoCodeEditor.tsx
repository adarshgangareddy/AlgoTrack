// src/components/workspace/MonacoCodeEditor.tsx
// AlgoTrack: LeetCode-Style Clean Code Editor with Language Selector & Clipboard Support

import React, { useState, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Code2
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
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  savedTime?: string | null;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  onLanguageChange,
  code,
  onChange,
  onResetToTemplate,
  leetcodeUrl,
  isMaximized = false,
  onToggleMaximize,
  savedTime,
}) => {
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const currentLangConfig = getLanguageConfig(language);

  // Copy code to clipboard with fallback
  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignore
    }
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Track cursor position for LeetCode-style footer (Ln X, Col Y)
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });

    // Initial layout
    editor.layout();
  };

  // Re-layout on resize/maximize
  useEffect(() => {
    const timer = setTimeout(() => {
      editorRef.current?.layout();
    }, 50);
    return () => clearTimeout(timer);
  }, [isMaximized]);

  return (
    <div className="monaco-leetcode-card">
      {/* 1. LeetCode-style Header Bar */}
      <div className="monaco-leetcode-header">
        {/* Left: Code Icon + Language Selector */}
        <div className="header-left-tools">
          <div className="code-tag">
            <Code2 size={15} color="#0284C7" />
            <span className="code-tag-title">Code</span>
          </div>

          <div className="lang-select-wrap">
            <label htmlFor="monaco-lang-select" className="sr-only">
              Select Programming Language
            </label>
            <select
              id="monaco-lang-select"
              className="monaco-lang-select"
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

        {/* Right: Copy, Reset, Theme, LeetCode, Maximize */}
        <div className="header-right-tools">
          {/* Copy Code Button */}
          <button
            type="button"
            className={`editor-action-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyCode}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Reset to Starter Template */}
          <button
            type="button"
            className="editor-action-btn icon-only"
            onClick={onResetToTemplate}
            title="Reset code to default template"
          >
            <RotateCcw size={13} />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="editor-action-btn theme-btn"
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            title={`Switch to ${editorTheme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
          >
            <span>{editorTheme === 'vs-dark' ? '🌙' : '☀️'}</span>
          </button>

          {/* Open on LeetCode Button */}
          {leetcodeUrl && (
            <a
              href={leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="editor-action-btn leetcode-btn"
              title="Open problem on LeetCode"
            >
              <span>LeetCode</span>
              <ExternalLink size={12} />
            </a>
          )}

          {/* Maximize / Restore Editor (Collapses/Expands Testcases) */}
          {onToggleMaximize && (
            <button
              type="button"
              className={`editor-action-btn icon-only maximize-btn ${isMaximized ? 'active' : ''}`}
              onClick={onToggleMaximize}
              title={isMaximized ? 'Restore testcases panel' : 'Expand code editor (hide testcases)'}
            >
              {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Monaco Editor Canvas Body */}
      <div 
        className="monaco-canvas-container"
        onClick={() => editorRef.current?.focus()}
      >
        <Editor
          height="100%"
          width="100%"
          language={currentLangConfig.monacoLang}
          value={code}
          theme={editorTheme}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13.5,
            lineHeight: 22,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
            padding: { top: 10, bottom: 10 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            readOnly: false,
            domReadOnly: false,
            contextmenu: true,
            pasteAs: { enabled: true },
          }}
          loading={
            <div className="monaco-loading-indicator">
              <Loader2 size={22} className="spin-icon" />
              <span>Loading Editor...</span>
            </div>
          }
        />
      </div>

      {/* 3. LeetCode-style Status Bar Footer */}
      <div className="monaco-leetcode-footer">
        <div className="footer-status-left">
          <span className="status-dot"></span>
          <span className="status-text">{savedTime ? `Saved ${savedTime}` : 'Ready to code'}</span>
        </div>
        <div className="footer-status-right">
          <span className="cursor-pos">Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>
      </div>
    </div>
  );
};
