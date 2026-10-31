// src/components/workspace/MonacoCodeEditor.tsx
// AlgoTrack Phase 6: Production Monaco Code Editor & Test Execution Engine

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Loader2,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../../config/languages';
import { 
  executeRunCode, 
  executeSubmitCode, 
  type ExecutionResponse, 
  type SubmissionResponse 
} from '../../services/submissionService';
import './MonacoCodeEditor.css';

export interface MonacoCodeEditorProps {
  problemId: string;
  problemTitle: string;
  language: string;
  onLanguageChange: (newLang: string) => void;
  code: string;
  onChange: (val: string) => void;
  onResetToTemplate: () => void;
  onSubmissionSuccess?: () => void;
  userToken?: string | null;
  userId?: string | null;
}

interface SampleTestCase {
  id: number;
  label: string;
  input: string;
  expectedOutput: string;
}

const DEFAULT_SAMPLE_TEST_CASES: SampleTestCase[] = [
  {
    id: 1,
    label: 'Case 1',
    input: '2 7 11 15\n9',
    expectedOutput: '[0, 1]',
  },
  {
    id: 2,
    label: 'Case 2',
    input: '3 2 4\n6',
    expectedOutput: '[1, 2]',
  },
  {
    id: 3,
    label: 'Case 3',
    input: '3 3\n6',
    expectedOutput: '[0, 1]',
  },
];

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  problemId,
  language,
  onLanguageChange,
  code,
  onChange,
  onResetToTemplate,
  onSubmissionSuccess,
  userToken,
  userId,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'custom' | 'output'>('testcases');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [customStdin, setCustomStdin] = useState('');
  
  // Execution & Submission states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentLangConfig = getLanguageConfig(language);

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Run Code against active test case or custom input
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setActiveBottomTab('output');
    setSubmissionResult(null);

    const inputToUse = activeBottomTab === 'custom' 
      ? customStdin 
      : DEFAULT_SAMPLE_TEST_CASES[activeCaseIndex].input;

    const expectedOutput = activeBottomTab === 'custom'
      ? undefined
      : DEFAULT_SAMPLE_TEST_CASES[activeCaseIndex].expectedOutput;

    try {
      const res = await executeRunCode({
        language: currentLangConfig.id,
        sourceCode: code,
        stdin: inputToUse,
        expectedOutput,
      });

      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err.message || 'Execution error occurred.',
        compile_output: '',
        time: '0 ms',
        memory: 0,
        status: { id: 11, description: 'Runtime Error' },
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code against the full problem test suite
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setActiveBottomTab('output');
    setExecutionResult(null);

    try {
      const res = await executeSubmitCode(
        {
          problemId,
          language: currentLangConfig.id,
          sourceCode: code,
        },
        userToken,
        userId
      );

      setSubmissionResult(res);
      if (res.status === 'Accepted' && onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: any) {
      setSubmissionResult({
        submissionId: `err_${Date.now()}`,
        status: 'Runtime Error',
        runtime: '0 ms',
        memory: '0 MB',
        testCasesPassed: 0,
        totalTestCases: DEFAULT_SAMPLE_TEST_CASES.length,
        results: [],
        failedCase: {
          input: 'Test Suite Execution',
          expected: 'Valid Output',
          actual: err.message || 'Submission failed.',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearOutput = () => {
    setExecutionResult(null);
    setSubmissionResult(null);
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
          <label htmlFor="monaco-lang-select" className="visually-hidden">
            Select Programming Language
          </label>
          <select
            id="monaco-lang-select"
            className="monaco-lang-dropdown"
            value={currentLangConfig.id}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isRunning || isSubmitting}
            title="Programming language for execution"
          >
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          <span className="monaco-judge0-pill" title={`Judge0 Language ID: ${currentLangConfig.judge0Id}`}>
            Judge0 ID: {currentLangConfig.judge0Id}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="monaco-toolbar-right">
          {/* Theme Toggle */}
          <button
            type="button"
            className="monaco-tool-btn"
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle editor theme"
          >
            {editorTheme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Reset Template */}
          <button
            type="button"
            className="monaco-tool-btn"
            onClick={onResetToTemplate}
            disabled={isRunning || isSubmitting}
            title="Reset code to default template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Copy Code */}
          <button
            type="button"
            className="monaco-tool-btn"
            onClick={handleCopyCode}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
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
        </div>
      </div>

      {/* 2. Monaco Editor Container */}
      <div className="monaco-editor-pane">
        <Editor
          height={isFullscreen ? 'calc(100vh - 360px)' : '380px'}
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
              <span>Loading Monaco Engine...</span>
            </div>
          }
        />
      </div>

      {/* 3. Bottom Execution & Test Cases Panel */}
      <div className="monaco-test-panel">
        {/* Panel Tabs & Execution Buttons */}
        <div className="test-panel-header">
          <div className="test-panel-tabs">
            <button
              type="button"
              className={`test-tab-btn ${activeBottomTab === 'testcases' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('testcases')}
            >
              <span>Test Cases</span>
            </button>
            <button
              type="button"
              className={`test-tab-btn ${activeBottomTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('custom')}
            >
              <span>Custom Input</span>
            </button>
            <button
              type="button"
              className={`test-tab-btn ${activeBottomTab === 'output' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('output')}
            >
              <Terminal size={13} />
              <span>Execution Output</span>
              {(executionResult || submissionResult) && (
                <span className="output-status-indicator"></span>
              )}
            </button>
          </div>

          {/* Run and Submit Action Buttons */}
          <div className="test-panel-actions">
            <button
              type="button"
              className="btn-run-code"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              title="Run code against active test case"
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>Run Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-submit-code"
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              title="Submit solution against problem test suite"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="test-panel-body">
          {/* TAB 1: Sample Test Cases */}
          {activeBottomTab === 'testcases' && (
            <div className="testcases-content">
              {/* Test Case Case Selector Pills */}
              <div className="case-pills-row">
                {DEFAULT_SAMPLE_TEST_CASES.map((tc, idx) => (
                  <button
                    key={tc.id}
                    type="button"
                    className={`case-pill-btn ${activeCaseIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveCaseIndex(idx)}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>

              {/* Active Test Case Input & Expected Output */}
              <div className="case-io-grid">
                <div className="case-io-box">
                  <span className="case-io-label">Standard Input (stdin)</span>
                  <pre className="case-io-pre">
                    {DEFAULT_SAMPLE_TEST_CASES[activeCaseIndex].input}
                  </pre>
                </div>
                <div className="case-io-box">
                  <span className="case-io-label">Expected Output</span>
                  <pre className="case-io-pre">
                    {DEFAULT_SAMPLE_TEST_CASES[activeCaseIndex].expectedOutput}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Custom Input */}
          {activeBottomTab === 'custom' && (
            <div className="custom-input-content">
              <label htmlFor="custom-stdin-input" className="case-io-label">
                Custom Standard Input (stdin)
              </label>
              <textarea
                id="custom-stdin-input"
                className="custom-stdin-textarea"
                rows={4}
                value={customStdin}
                onChange={(e) => setCustomStdin(e.target.value)}
                placeholder="Enter custom test input to feed into your program..."
              />
              <span className="custom-input-hint">
                Click <strong>Run Code</strong> above to execute your solution with this standard input.
              </span>
            </div>
          )}

          {/* TAB 3: Execution & Submission Results */}
          {activeBottomTab === 'output' && (
            <div className="output-content">
              {isRunning || isSubmitting ? (
                <div className="output-running-box">
                  <Loader2 size={24} className="spin-icon" color="#0284C7" />
                  <h4>{isRunning ? 'Executing your solution...' : 'Evaluating against test suite...'}</h4>
                  <p>Language: <strong>{currentLangConfig.label}</strong> (Judge0 ID: {currentLangConfig.judge0Id})</p>
                </div>
              ) : submissionResult ? (
                /* Full Submission Verdict */
                <div className="submission-verdict-card">
                  <div className="verdict-header">
                    <div className="verdict-left">
                      {submissionResult.status === 'Accepted' ? (
                        <div className="verdict-tag accepted">
                          <CheckCircle2 size={18} />
                          <span>Accepted</span>
                        </div>
                      ) : (
                        <div className="verdict-tag rejected">
                          <XCircle size={18} />
                          <span>{submissionResult.status}</span>
                        </div>
                      )}
                      <span className="testcases-pass-count">
                        Passed {submissionResult.testCasesPassed} / {submissionResult.totalTestCases} test cases
                      </span>
                    </div>

                    <div className="verdict-stats">
                      <span className="verdict-stat-pill">
                        <Clock size={12} />
                        <span>Runtime: <strong>{submissionResult.runtime}</strong></span>
                      </span>
                      <span className="verdict-stat-pill">
                        <Cpu size={12} />
                        <span>Memory: <strong>{submissionResult.memory}</strong></span>
                      </span>
                      <button
                        type="button"
                        className="btn-clear-output"
                        onClick={handleClearOutput}
                        title="Clear output"
                      >
                        <Trash2 size={12} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Failed Test Case Diff if any */}
                  {submissionResult.failedCase && (
                    <div className="failed-case-diff">
                      <span className="diff-title">Failed Test Case:</span>
                      <div className="diff-grid">
                        <div className="diff-box">
                          <span className="diff-label">Input</span>
                          <pre>{submissionResult.failedCase.input}</pre>
                        </div>
                        <div className="diff-box expected">
                          <span className="diff-label">Expected Output</span>
                          <pre>{submissionResult.failedCase.expected}</pre>
                        </div>
                        <div className="diff-box actual">
                          <span className="diff-label">Your Output</span>
                          <pre>{submissionResult.failedCase.actual}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : executionResult ? (
                /* Single Run Output */
                <div className="run-output-card">
                  <div className="verdict-header">
                    <div className="verdict-left">
                      {executionResult.status.id === 3 ? (
                        <div className="verdict-tag accepted">
                          <CheckCircle2 size={16} />
                          <span>{executionResult.status.description}</span>
                        </div>
                      ) : (
                        <div className="verdict-tag rejected">
                          <AlertTriangle size={16} />
                          <span>{executionResult.status.description}</span>
                        </div>
                      )}
                    </div>

                    <div className="verdict-stats">
                      <span className="verdict-stat-pill">
                        <Clock size={12} />
                        <span>{executionResult.time}</span>
                      </span>
                      <span className="verdict-stat-pill">
                        <Cpu size={12} />
                        <span>{(executionResult.memory / 1024).toFixed(1)} MB</span>
                      </span>
                      <button
                        type="button"
                        className="btn-clear-output"
                        onClick={handleClearOutput}
                        title="Clear output"
                      >
                        <Trash2 size={12} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {executionResult.message && (
                    <div className="output-notice-banner">
                      <span>{executionResult.message}</span>
                    </div>
                  )}

                  {/* Standard Output */}
                  {executionResult.stdout && (
                    <div className="console-stream-box">
                      <span className="stream-label">Standard Output (stdout):</span>
                      <pre className="stream-pre stdout">{executionResult.stdout}</pre>
                    </div>
                  )}

                  {/* Compilation Output */}
                  {executionResult.compile_output && (
                    <div className="console-stream-box">
                      <span className="stream-label compile">Compilation Message:</span>
                      <pre className="stream-pre compile">{executionResult.compile_output}</pre>
                    </div>
                  )}

                  {/* Standard Error */}
                  {executionResult.stderr && (
                    <div className="console-stream-box">
                      <span className="stream-label error">Standard Error (stderr):</span>
                      <pre className="stream-pre stderr">{executionResult.stderr}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="output-empty-state">
                  <Terminal size={28} color="#94A3B8" />
                  <p>Click <strong>Run Code</strong> or <strong>Submit</strong> above to view execution diagnostics.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
