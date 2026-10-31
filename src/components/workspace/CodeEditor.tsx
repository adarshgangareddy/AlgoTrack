import React, { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Copy, Check, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import './CodeEditor.css';

export interface CodeEditorProps {
  language: string;
  onLanguageChange: (newLang: string) => void;
  code: string;
  onChange: (val: string) => void;
  onResetToTemplate: () => void;
  isSaved?: boolean;
}

export const LANGUAGE_OPTIONS = [
  { id: 'python', label: 'Python 3', ext: '.py' },
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'java', label: 'Java', ext: '.java' },
  { id: 'cpp', label: 'C++', ext: '.cpp' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  onLanguageChange,
  code,
  onChange,
  onResetToTemplate,
  isSaved = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Dynamic language extension for CodeMirror
  const extensions = useMemo(() => {
    switch (language) {
      case 'python':
        return [python()];
      case 'typescript':
        return [javascript({ typescript: true })];
      case 'javascript':
        return [javascript()];
      case 'java':
        return [java()];
      case 'cpp':
        return [cpp()];
      default:
        return [python()];
    }
  }, [language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleConfirmClear = () => {
    onChange('');
    setShowClearConfirm(false);
  };

  return (
    <div className="workspace-editor-container">
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        {/* Language Selection */}
        <div className="editor-lang-group">
          <label htmlFor="editor-lang-select" className="visually-hidden">
            Programming Language
          </label>
          <select
            id="editor-lang-select"
            className="editor-lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} ({opt.ext})
              </option>
            ))}
          </select>

          <span className={`editor-saved-pill ${isSaved ? 'is-saved' : 'is-unsaved'}`}>
            <span className="saved-dot"></span>
            <span>{isSaved ? 'Solution Saved' : 'Unsaved Code'}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="editor-action-buttons">
          <button
            type="button"
            className="editor-tool-btn"
            onClick={onResetToTemplate}
            title="Reset code to standard starter template"
          >
            <RotateCcw size={14} />
            <span className="btn-text">Template</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span className="btn-text">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn clear-btn"
            onClick={() => setShowClearConfirm(true)}
            title="Clear all code in this editor"
          >
            <Trash2 size={14} />
            <span className="btn-text">Clear</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="editor-confirm-bar" role="alert">
          <div className="confirm-text-wrap">
            <AlertTriangle size={15} className="text-warning" />
            <span>Are you sure you want to clear your code for this language?</span>
          </div>
          <div className="confirm-buttons">
            <button
              type="button"
              className="confirm-action-btn cancel"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="confirm-action-btn danger"
              onClick={handleConfirmClear}
            >
              Yes, Clear
            </button>
          </div>
        </div>
      )}

      {/* CodeMirror Surface */}
      <div className="codemirror-wrapper">
        <CodeMirror
          value={code}
          height="420px"
          extensions={extensions}
          onChange={(value) => onChange(value)}
          placeholder="// Type your solution or approach code here..."
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            tabSize: 4,
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="editor-footer-info">
        <span>Personal code sandbox • Not compiled on server • Saved per language</span>
        <span className="editor-stats">
          {code.split('\n').length} lines • {code.length} chars
        </span>
      </div>
    </div>
  );
};
