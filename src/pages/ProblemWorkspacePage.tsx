// src/pages/ProblemWorkspacePage.tsx
// AlgoTrack — Phase 5: Individual Problem Workspace with AI Explainer

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Save, 
  Check, 
  AlertCircle, 
  BookOpen, 
  Code2, 
  FileText, 
  Clock, 
  Sparkles, 
  Loader2,
  Lock,
  MessageSquareCode
} from 'lucide-react';
import { 
  fetchProblemBySlug, 
  fetchUserWorkspace, 
  fetchUserSolutions, 
  fetchUserProblemProgress, 
  saveUserWorkspaceAndProgress,
  STARTER_CODE_TEMPLATES,
  type Problem, 
  type ProblemStatus 
} from '../services/problemService';
import { CodeEditor } from '../components/workspace/CodeEditor';
import { AIAssistant } from '../components/workspace/AIAssistant';
import './ProblemWorkspacePage.css';

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Problem definition state
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User personal workspace state
  const [personalNotes, setPersonalNotes] = useState('');
  const [personalApproach, setPersonalApproach] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [mistakesEdgeCases, setMistakesEdgeCases] = useState('');

  // Code solutions state (per language)
  const [activeLanguage, setActiveLanguage] = useState<string>('python');
  const [solutionsByLang, setSolutionsByLang] = useState<Record<string, string>>({
    ...STARTER_CODE_TEMPLATES
  });

  // Problem completion status
  const [problemStatus, setProblemStatus] = useState<ProblemStatus>('not_started');

  // Autosave and sync tracking
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Responsive / View modes
  const [mobileTab, setMobileTab] = useState<'learning' | 'workspace'>('learning');
  const [rightPanelTab, setRightPanelTab] = useState<'editor' | 'ai'>('editor');

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompletedRef = useRef(false);

  // Fetch Problem & Workspace Data
  useEffect(() => {
    let isMounted = true;
    initialLoadCompletedRef.current = false;

    async function loadWorkspace() {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const currentProblem = await fetchProblemBySlug(slug);

        if (!isMounted) return;

        if (!currentProblem) {
          setErrorMsg(`Problem "${slug}" could not be found.`);
          setLoading(false);
          return;
        }

        setProblem(currentProblem);

        // Fetch user data if authenticated
        if (user?.id) {
          const [savedWs, savedSols, savedStatus] = await Promise.all([
            fetchUserWorkspace(user.id, currentProblem.id),
            fetchUserSolutions(user.id, currentProblem.id),
            fetchUserProblemProgress(user.id, currentProblem.id)
          ]);

          if (!isMounted) return;

          if (savedWs) {
            setPersonalNotes(savedWs.personal_notes || '');
            setPersonalApproach(savedWs.personal_approach || '');
            setTimeComplexity(savedWs.time_complexity || '');
            setSpaceComplexity(savedWs.space_complexity || '');
            setMistakesEdgeCases(savedWs.mistakes_and_edge_cases || '');
            if (savedWs.updated_at) setLastSavedAt(savedWs.updated_at);
          } else {
            setPersonalNotes('');
            setPersonalApproach('');
            setTimeComplexity('');
            setSpaceComplexity('');
            setMistakesEdgeCases('');
            setLastSavedAt(null);
          }

          setSolutionsByLang(savedSols);
          setProblemStatus(savedStatus);
        }

        setHasUnsavedChanges(false);
        initialLoadCompletedRef.current = true;
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load problem workspace.';
          setErrorMsg(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWorkspace();
    return () => {
      isMounted = false;
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [slug, user?.id]);

  // Save Workspace Handler
  const handleSaveProgress = useCallback(async (isAuto = false) => {
    if (!user?.id || !problem) return;

    setIsSaving(true);
    setSaveSuccessMsg(null);

    const activeCode = solutionsByLang[activeLanguage] || '';

    const res = await saveUserWorkspaceAndProgress({
      userId: user.id,
      problemId: problem.id,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      workspace: {
        personal_notes: personalNotes,
        personal_approach: personalApproach,
        time_complexity: timeComplexity,
        space_complexity: spaceComplexity,
        mistakes_and_edge_cases: mistakesEdgeCases,
      },
      status: problemStatus,
      activeLanguage,
      sourceCode: activeCode,
    });

    setIsSaving(false);

    if (res.success) {
      setHasUnsavedChanges(false);
      setLastSavedAt(res.updated_at);
      setSaveSuccessMsg(isAuto ? 'Autosaved' : 'Progress saved successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } else {
      setSaveSuccessMsg(res.error || 'Failed to save');
    }
  }, [user, problem, solutionsByLang, activeLanguage, personalNotes, personalApproach, timeComplexity, spaceComplexity, mistakesEdgeCases, problemStatus]);

  // Debounced Autosave Trigger
  const markDirtyAndDebounceSave = useCallback(() => {
    if (!initialLoadCompletedRef.current) return;
    setHasUnsavedChanges(true);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      handleSaveProgress(true);
    }, 2500);
  }, [handleSaveProgress]);

  // Browser Exit Warning if Unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle Code Changes in CodeEditor
  const handleCodeChange = (newCode: string) => {
    setSolutionsByLang((prev) => ({
      ...prev,
      [activeLanguage]: newCode,
    }));
    markDirtyAndDebounceSave();
  };

  // Reset current language template
  const handleResetTemplate = () => {
    const template = STARTER_CODE_TEMPLATES[activeLanguage] || '';
    setSolutionsByLang((prev) => ({
      ...prev,
      [activeLanguage]: template,
    }));
    markDirtyAndDebounceSave();
  };

  // Status Change Handler
  const handleStatusChange = (newStatus: ProblemStatus) => {
    setProblemStatus(newStatus);
    markDirtyAndDebounceSave();
  };

  // Navigation handlers
  const handleNavPrevious = () => {
    if (!problem?.problem_number) return;
    const prevNum = problem.problem_number - 1;
    if (prevNum >= 1) {
      navigate(`/problems/${prevNum}`);
    }
  };

  const handleNavNext = () => {
    if (!problem?.problem_number) return;
    const nextNum = problem.problem_number + 1;
    navigate(`/problems/${nextNum}`);
  };

  // Format timestamp helper
  const formatSavedTime = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="workspace-loading-state">
        <Loader2 className="spin-icon" size={36} />
        <p className="loading-label">Loading problem workspace...</p>
      </div>
    );
  }

  // Error Screen
  if (errorMsg || !problem) {
    return (
      <div className="workspace-error-container">
        <AlertCircle size={44} color="#EF4444" />
        <h2 className="error-title">Workspace Unavailable</h2>
        <p className="error-description">{errorMsg || 'Problem not found.'}</p>
        <Link to="/problems" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Problems Library
        </Link>
      </div>
    );
  }

  const activeCode = solutionsByLang[activeLanguage] ?? (STARTER_CODE_TEMPLATES[activeLanguage] || '');

  return (
    <div className="workspace-page-container">
      {/* ==================================================================
          1. TOP WORKSPACE HEADER
          ================================================================== */}
      <header className="workspace-header">
        <div className="workspace-header-inner">
          {/* Left: Back & Sequence Navigation */}
          <div className="header-left-col">
            <Link to="/problems" className="back-link-btn" title="Back to Problem Library">
              <ArrowLeft size={16} />
              <span className="back-btn-text">Problems</span>
            </Link>

            <span className="header-separator">/</span>

            <div className="problem-ident-badge">
              {problem.problem_number && (
                <span className="prob-num">#{problem.problem_number}</span>
              )}
              <h1 className="problem-header-title">{problem.title}</h1>
              <span className={`diff-pill-badge ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* Center: Sequence Previous / Next */}
          <div className="header-center-col">
            <button
              type="button"
              className="nav-seq-btn"
              onClick={handleNavPrevious}
              disabled={!problem.problem_number || problem.problem_number <= 1}
              title="Previous Problem"
            >
              <ChevronLeft size={16} />
              <span className="seq-btn-txt">Prev</span>
            </button>

            <button
              type="button"
              className="nav-seq-btn"
              onClick={handleNavNext}
              disabled={!problem.problem_number}
              title="Next Problem"
            >
              <span className="seq-btn-txt">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right: Status Selector, Save Button & AI Quick Launcher */}
          <div className="header-right-col">
            {/* Status Dropdown */}
            <div className="status-selector-wrap">
              <label htmlFor="problem-status-select" className="sr-only">Status</label>
              <select
                id="problem-status-select"
                className={`status-select-pill ${problemStatus}`}
                value={problemStatus}
                onChange={(e) => handleStatusChange(e.target.value as ProblemStatus)}
              >
                <option value="not_started">⚪ Not Started</option>
                <option value="attempted">🟡 Attempted</option>
                <option value="solved">🟢 Solved</option>
              </select>
            </div>

            {/* AI Toggle Button */}
            <button
              type="button"
              className={`header-ai-toggle-btn ${rightPanelTab === 'ai' ? 'active' : ''}`}
              onClick={() => {
                setRightPanelTab(rightPanelTab === 'ai' ? 'editor' : 'ai');
                setMobileTab('workspace');
              }}
              title="Toggle AI Problem Explainer & Tutor"
            >
              <Sparkles size={15} color={rightPanelTab === 'ai' ? '#FFFFFF' : '#0284C7'} />
              <span>{rightPanelTab === 'ai' ? 'Show Code' : 'Ask AI'}</span>
            </button>

            {/* Save Status & Button */}
            <div className="save-action-group">
              <div className="save-status-indicator">
                {isSaving ? (
                  <span className="status-text saving">
                    <Loader2 size={12} className="spin-icon" /> Saving...
                  </span>
                ) : hasUnsavedChanges ? (
                  <span className="status-text unsaved">
                    <span className="unsaved-dot"></span> Unsaved changes
                  </span>
                ) : (
                  <span className="status-text saved">
                    <Check size={12} /> Saved {formatSavedTime(lastSavedAt) ? `at ${formatSavedTime(lastSavedAt)}` : ''}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-save-progress"
                onClick={() => handleSaveProgress(false)}
                disabled={isSaving}
                title="Save solution, complexity and learning notes"
              >
                <Save size={15} />
                <span>Save Progress</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="save-toast-bubble">
                <Check size={13} /> {saveSuccessMsg}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="workspace-mobile-tabs">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'learning' ? 'active' : ''}`}
            onClick={() => setMobileTab('learning')}
          >
            <BookOpen size={16} />
            <span>Problem & Learning</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setMobileTab('workspace')}
          >
            <Code2 size={16} />
            <span>Code & AI Tutor</span>
          </button>
        </div>
      </header>

      {/* ==================================================================
          2. MAIN TWO-COLUMN WORKSPACE BODY
          ================================================================== */}
      <main className="workspace-body-container container-fluid">
        {/* ==================================================================
            LEFT COLUMN — Problem Learning Area
            ================================================================== */}
        <section
          className={`workspace-column left-learning-col ${mobileTab === 'learning' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Problem Description and Conceptual Learning"
        >
          {/* Metadata Card: Title, Tags & LeetCode Redirect */}
          <div className="learning-card card-saas">
            <div className="problem-title-row">
              <div>
                <span className="problem-card-subtitle">
                  {problem.pattern || 'Algorithmic Challenge'}
                </span>
                <h2 className="problem-main-title">
                  {problem.problem_number ? `${problem.problem_number}. ` : ''}{problem.title}
                </h2>
              </div>
            </div>

            {/* Tags Row */}
            <div className="problem-tags-row">
              <span className={`tag-diff-pill ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              {problem.pattern && (
                <span className="tag-pattern-pill">
                  <Sparkles size={11} className="text-purple" />
                  {problem.pattern}
                </span>
              )}
              {problem.topics?.map((topic) => (
                <span key={topic} className="tag-topic-pill">
                  {topic}
                </span>
              ))}
            </div>

            {/* Problem Statement */}
            {problem.description && (
              <div className="problem-statement-box">
                <p className="statement-text">{problem.description}</p>
              </div>
            )}

            {/* LeetCode Integration Callout */}
            {problem.leetcode_url && (
              <div className="leetcode-redirect-card">
                <div className="leetcode-card-content">
                  <div className="leetcode-card-text">
                    <span className="leetcode-brand-label">Official Challenge Runner</span>
                    <p className="leetcode-prompt">
                      Solve the problem on LeetCode, then return to AlgoTrack to record your progress.
                    </p>
                  </div>
                  <a
                    href={problem.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-leetcode"
                    title={`Open ${problem.title} on LeetCode in a new tab`}
                  >
                    <span>Open in LeetCode</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Understand the Concept (Theory and Concepts) */}
          <div className="learning-card card-saas">
            <div className="section-title-wrap">
              <div className="section-title-left">
                <BookOpen size={18} className="text-primary" />
                <h3 className="section-heading">Understand the Concept</h3>
              </div>

              {/* AI Explain Callout Button */}
              <button
                type="button"
                className="btn-ai-explain-callout"
                onClick={() => {
                  setRightPanelTab('ai');
                  setMobileTab('workspace');
                }}
                title="Ask AI to break down this problem in plain English"
              >
                <Sparkles size={13} color="#0284C7" />
                <span>Explain with AI</span>
              </button>
            </div>

            {problem.theory_content ? (
              <div className="theory-body-content">
                <p className="theory-paragraph">{problem.theory_content}</p>
                <div className="theory-keypoints">
                  <div className="keypoint-item">
                    <span className="keypoint-bullet"></span>
                    <span className="keypoint-txt">
                      <strong>Core Pattern:</strong> {problem.pattern || 'Algorithmic Pattern Recognition'}
                    </span>
                  </div>
                  <div className="keypoint-item">
                    <span className="keypoint-bullet"></span>
                    <span className="keypoint-txt">
                      <strong>Interview Takeaway:</strong> Analyze edge cases such as empty inputs, duplicates, or extreme values before coding.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="theory-empty-state">
                <p className="empty-state-text">
                  Theory notes for this challenge will be updated in the curated catalog. Click <strong>"Explain with AI"</strong> above to generate an instant breakdown!
                </p>
              </div>
            )}
          </div>

          {/* Section 7: Personal Problem-Solving Approach */}
          <div className="learning-card card-saas">
            <div className="section-title-wrap">
              <FileText size={18} className="text-purple" />
              <h3 className="section-heading">My Approach</h3>
            </div>
            <p className="field-hint">
              Describe your line of thinking, step-by-step logic, and why your selected algorithmic pattern works.
            </p>
            <textarea
              className="approach-textarea"
              rows={4}
              value={personalApproach}
              onChange={(e) => {
                setPersonalApproach(e.target.value);
                markDirtyAndDebounceSave();
              }}
              placeholder="e.g. 1. Initialize two pointers at start and end. 2. Compare sum against target. 3. Adjust pointers based on magnitude..."
            />
          </div>

          {/* Section 8: Complexity Analysis */}
          <div className="learning-card card-saas">
            <div className="section-title-wrap">
              <Clock size={18} className="text-success" />
              <h3 className="section-heading">Time & Space Complexity</h3>
            </div>
            <div className="complexity-inputs-grid">
              <div className="complexity-field">
                <label htmlFor="time-complexity-input" className="complexity-label">
                  Time Complexity
                </label>
                <div className="complexity-input-wrap">
                  <input
                    id="time-complexity-input"
                    type="text"
                    className="complexity-input"
                    value={timeComplexity}
                    onChange={(e) => {
                      setTimeComplexity(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="e.g. O(N) or O(N log N)"
                  />
                </div>
                <span className="complexity-helper">Asymptotic runtime bound</span>
              </div>

              <div className="complexity-field">
                <label htmlFor="space-complexity-input" className="complexity-label">
                  Space Complexity
                </label>
                <div className="complexity-input-wrap">
                  <input
                    id="space-complexity-input"
                    type="text"
                    className="complexity-input"
                    value={spaceComplexity}
                    onChange={(e) => {
                      setSpaceComplexity(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="e.g. O(1) or O(N)"
                  />
                </div>
                <span className="complexity-helper">Auxiliary memory consumption</span>
              </div>
            </div>
          </div>

          {/* Section 9: Mistakes & Edge Cases */}
          <div className="learning-card card-saas">
            <div className="section-title-wrap">
              <AlertCircle size={18} className="text-warning" />
              <h3 className="section-heading">Mistakes & Edge Cases</h3>
            </div>
            <p className="field-hint">
              Log tricky test cases, unexpected bugs, off-by-one indices, or misconceptions to revisit during interview revision.
            </p>
            <textarea
              className="approach-textarea"
              rows={4}
              value={mistakesEdgeCases}
              onChange={(e) => {
                setMistakesEdgeCases(e.target.value);
                markDirtyAndDebounceSave();
              }}
              placeholder="Record mistakes, edge cases and important lessons for future revision..."
            />
          </div>
        </section>

        {/* ==================================================================
            RIGHT COLUMN — Personal Workspace & Code Editor / AI Assistant
            ================================================================== */}
        <section
          className={`workspace-column right-editor-col ${mobileTab === 'workspace' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Personal Code Editor and Learning Scratchpad"
        >
          {/* Panel Tab Switcher */}
          <div className="right-panel-switcher">
            <button
              type="button"
              className={`panel-switch-btn ${rightPanelTab === 'editor' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('editor')}
            >
              <Code2 size={16} />
              <span>Solution Code & Notes</span>
            </button>

            <button
              type="button"
              className={`panel-switch-btn ${rightPanelTab === 'ai' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('ai')}
            >
              <Sparkles size={16} color={rightPanelTab === 'ai' ? '#0284C7' : '#64748B'} />
              <span>AI Tutor & Explainer</span>
              <span className="ai-tab-badge">Ask Questions</span>
            </button>
          </div>

          {rightPanelTab === 'ai' ? (
            /* AI Explainer / Tutor Tab */
            <AIAssistant
              problem={{
                title: problem.title,
                problem_number: problem.problem_number,
                difficulty: problem.difficulty,
                pattern: problem.pattern,
                topics: problem.topics || [],
                description: problem.description,
                theory_content: problem.theory_content,
                hints: problem.hints,
              }}
            />
          ) : (
            /* Solution Code Editor Tab */
            <>
              {/* Personal Solution Code Editor */}
              <div className="editor-card card-saas">
                <div className="editor-card-header">
                  <div className="editor-title-wrap">
                    <Code2 size={18} className="text-primary" />
                    <h3 className="section-heading">Personal Code Solution</h3>
                  </div>
                  <span className="multi-lang-pill">Multi-Language Sandbox</span>
                </div>

                <CodeEditor
                  language={activeLanguage}
                  onLanguageChange={(newLang) => {
                    setActiveLanguage(newLang);
                    markDirtyAndDebounceSave();
                  }}
                  code={activeCode}
                  onChange={handleCodeChange}
                  onResetToTemplate={handleResetTemplate}
                  isSaved={!hasUnsavedChanges}
                />
              </div>

              {/* Personal Notes / Observations Scratchpad */}
              <div className="editor-card card-saas">
                <div className="editor-card-header">
                  <div className="editor-title-wrap">
                    <FileText size={18} className="text-purple" />
                    <h3 className="section-heading">Personal Notes & Observations</h3>
                  </div>
                  <span className="private-note-badge">
                    <Lock size={12} /> Private to your account
                  </span>
                </div>

                <textarea
                  className="approach-textarea notes-textarea"
                  rows={6}
                  value={personalNotes}
                  onChange={(e) => {
                    setPersonalNotes(e.target.value);
                    markDirtyAndDebounceSave();
                  }}
                  placeholder="Record insights, alternative algorithmic designs, or personal test observations here..."
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};
