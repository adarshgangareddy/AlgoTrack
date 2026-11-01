// src/components/workspace/TestcasesPanel.tsx
// AlgoTrack: LeetCode-Inspired Sample Testcases Panel (Inspection only, NO code execution)

import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  ExternalLink,
  Info
} from 'lucide-react';
import './TestcasesPanel.css';

export interface TestcasesPanelProps {
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  leetcodeUrl?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TestcasesPanel: React.FC<TestcasesPanelProps> = ({
  examples = [],
  leetcodeUrl,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeCaseIdx, setActiveCaseIdx] = useState<number>(0);
  const [customTestcases, setCustomTestcases] = useState<string[]>([]);
  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Sample cases from problem examples (never fallback to Two Sum!)
  const sampleCases = examples || [];

  const allCasesCount = sampleCases.length + customTestcases.length;

  const handleCopyInput = async (text: string, idx: number) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Ignore clipboard fallback failure
    }
  };

  const handleAddCustomCase = () => {
    if (!customInputValue.trim()) return;
    setCustomTestcases(prev => [...prev, customInputValue.trim()]);
    setActiveCaseIdx(sampleCases.length + customTestcases.length);
    setCustomInputValue('');
  };

  const handleRemoveCustomCase = (indexToRemove: number) => {
    setCustomTestcases(prev => prev.filter((_, i) => i !== indexToRemove));
    setActiveCaseIdx(0);
  };

  const isCustomActive = activeCaseIdx >= sampleCases.length;
  const currentSample = !isCustomActive ? sampleCases[activeCaseIdx] : null;
  const currentCustom = isCustomActive ? customTestcases[activeCaseIdx - sampleCases.length] : null;

  return (
    <div className={`testcases-panel-root ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 1. Panel Header Bar */}
      <div className="testcases-panel-header">
        <div className="testcases-header-left">
          <div className="testcases-title-badge">
            <Terminal size={14} color="#0284C7" />
            <span className="testcases-header-title">Testcase</span>
          </div>

          {!isCollapsed && (
            <div className="testcases-tabs-list">
              {sampleCases.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`testcase-tab-btn ${activeCaseIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveCaseIdx(idx)}
                >
                  <span>Case {idx + 1}</span>
                </button>
              ))}

              {customTestcases.map((_, cIdx) => {
                const globalIdx = sampleCases.length + cIdx;
                return (
                  <button
                    key={globalIdx}
                    type="button"
                    className={`testcase-tab-btn custom ${activeCaseIdx === globalIdx ? 'active' : ''}`}
                    onClick={() => setActiveCaseIdx(globalIdx)}
                  >
                    <span>Custom {cIdx + 1}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`testcase-tab-btn add-custom-btn ${activeCaseIdx === allCasesCount ? 'active' : ''}`}
                onClick={() => setActiveCaseIdx(allCasesCount)}
                title="Add custom test input"
              >
                <Plus size={12} />
                <span>Custom</span>
              </button>
            </div>
          )}
        </div>

        <div className="testcases-header-right">
          {onToggleCollapse && (
            <button
              type="button"
              className="testcases-collapse-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Testcase panel' : 'Collapse Testcase panel'}
            >
              {isCollapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Panel Content Body */}
      {!isCollapsed && (
        <div className="testcases-panel-body">
          {activeCaseIdx === allCasesCount ? (
            /* Custom Case Creator */
            <div className="testcase-custom-creator">
              <label htmlFor="custom-case-input" className="testcase-field-label">
                Custom Testcase Arguments:
              </label>
              <textarea
                id="custom-case-input"
                className="testcase-custom-textarea"
                rows={3}
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="e.g. nums = [1,2,3,4,5], target = 8"
              />
              <div className="custom-actions-row">
                <button
                  type="button"
                  className="testcase-add-submit-btn"
                  onClick={handleAddCustomCase}
                  disabled={!customInputValue.trim()}
                >
                  <Plus size={13} />
                  <span>Save Custom Case</span>
                </button>
                <button
                  type="button"
                  className="testcase-clear-btn"
                  onClick={() => setCustomInputValue('')}
                  disabled={!customInputValue}
                >
                  <span>Clear</span>
                </button>
              </div>
            </div>
          ) : currentCustom !== null ? (
            /* Custom Case Display */
            <div className="testcase-case-view">
              <div className="testcase-view-row">
                <div className="testcase-row-header">
                  <span className="testcase-field-label">Custom Input:</span>
                  <div className="testcase-row-actions">
                    <button
                      type="button"
                      className="testcase-copy-btn"
                      onClick={() => handleCopyInput(currentCustom, activeCaseIdx)}
                      title="Copy input values"
                    >
                      {copiedIdx === activeCaseIdx ? (
                        <>
                          <Check size={12} color="#059669" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Input</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="testcase-delete-btn"
                      onClick={() => handleRemoveCustomCase(activeCaseIdx - sampleCases.length)}
                      title="Delete this custom testcase"
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                <pre className="testcase-code-box">{currentCustom}</pre>
              </div>
            </div>
          ) : currentSample ? (
            /* Sample Case Display */
            <div className="testcase-case-view">
              <div className="testcase-view-row">
                <div className="testcase-row-header">
                  <span className="testcase-field-label">Input:</span>
                  <button
                    type="button"
                    className="testcase-copy-btn"
                    onClick={() => handleCopyInput(currentSample.input, activeCaseIdx)}
                    title="Copy sample input values"
                  >
                    {copiedIdx === activeCaseIdx ? (
                      <>
                        <Check size={12} color="#059669" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Input</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="testcase-code-box">{currentSample.input}</pre>
              </div>

              {currentSample.output && (
                <div className="testcase-view-row">
                  <span className="testcase-field-label">Expected Output:</span>
                  <pre className="testcase-code-box expected-output">{currentSample.output}</pre>
                </div>
              )}

              {currentSample.explanation && (
                <div className="testcase-view-row">
                  <span className="testcase-field-label">Explanation:</span>
                  <p className="testcase-explanation-text">{currentSample.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="testcase-case-view">
              <p className="testcase-explanation-text">
                No sample testcases recorded for this problem. You can click <strong>+ Custom</strong> above to test your custom inputs.
              </p>
            </div>
          )}

          {/* 3. Footer Notice: No execution disclaimer & LeetCode redirect */}
          <div className="testcases-panel-footer">
            <div className="testcase-notice-wrap">
              <Info size={13} color="#0284C7" />
              <span className="testcase-notice-text">
                Sample testcase inspector. Use LeetCode to submit against official test suites. AlgoTrack does not execute code.
              </span>
            </div>

            {leetcodeUrl && (
              <a
                href={leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="testcase-leetcode-link"
                title="Run against official LeetCode judge"
              >
                <span>Run on LeetCode</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
