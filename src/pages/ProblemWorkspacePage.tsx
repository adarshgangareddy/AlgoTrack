// src/pages/ProblemWorkspacePage.tsx
// AlgoTrack — Problem Workspace UI Fix

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
  Lock
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
import { MonacoCodeEditor } from '../components/workspace/MonacoCodeEditor';
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
      setSaveSuccessMsg(isAuto ? 'Autosaved' : 'Progress saved!');
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
        <Link to="/problems" className="ws-btn ws-btn-primary">
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
          {/* Left Side: Back, Breadcrumb, #Number, Title, Difficulty */}
          <div className="header-left-group">
            <Link to="/problems" className="ws-back-link" title="Return to Problems Library">
              <ArrowLeft size={15} />
              <span>Problems</span>
            </Link>

            <span className="header-crumb-sep">/</span>

            <div className="header-problem-info">
              {problem.problem_number && (
                <span className="header-problem-number">#{problem.problem_number}</span>
              )}
              <h1 className="header-problem-title" title={problem.title}>
                {problem.title}
              </h1>
              <span className={`header-diff-badge ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* Right Side: Status, Ask AI, Prev/Next, Save Progress */}
          <div className="header-right-actions">
            {/* Status Dropdown */}
            <div className="ws-status-select-wrap">
              <label htmlFor="ws-status-select" className="sr-only">Problem Status</label>
              <select
                id="ws-status-select"
                className={`ws-status-dropdown ${problemStatus}`}
                value={problemStatus}
                onChange={(e) => handleStatusChange(e.target.value as ProblemStatus)}
                title="Change your progress status"
              >
                <option value="not_started">⚪ Todo</option>
                <option value="attempted">🟡 Attempted</option>
                <option value="solved">🟢 Solved</option>
              </select>
            </div>

            {/* Ask AI / Show Code Toggle */}
            <button
              type="button"
              className={`ws-ai-toggle-btn ${rightPanelTab === 'ai' ? 'active' : ''}`}
              onClick={() => {
                setRightPanelTab(rightPanelTab === 'ai' ? 'editor' : 'ai');
                setMobileTab('workspace');
              }}
              title="Toggle AI Problem Explainer & Interactive Tutor"
            >
              <Sparkles size={14} />
              <span>{rightPanelTab === 'ai' ? 'Show Code' : 'Ask AI'}</span>
            </button>

            {/* Previous and Next Navigation */}
            <div className="ws-seq-nav-group">
              <button
                type="button"
                className="ws-seq-btn"
                onClick={handleNavPrevious}
                disabled={!problem.problem_number || problem.problem_number <= 1}
                title="Previous problem in sequence"
              >
                <ChevronLeft size={15} />
                <span>Prev</span>
              </button>

              <button
                type="button"
                className="ws-seq-btn"
                onClick={handleNavNext}
                disabled={!problem.problem_number}
                title="Next problem in sequence"
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Save Progress Button & Status Indicator */}
            <div className="ws-save-btn-group">
              {isSaving ? (
                <span className="ws-save-indicator saving">
                  <Loader2 size={12} className="spin-icon" /> Saving...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="ws-save-indicator unsaved">
                  <span className="unsaved-dot"></span> Unsaved
                </span>
              ) : lastSavedAt ? (
                <span className="ws-save-indicator saved">
                  <Check size={12} /> Saved {formatSavedTime(lastSavedAt)}
                </span>
              ) : null}

              <button
                type="button"
                className="ws-btn ws-btn-save"
                onClick={() => handleSaveProgress(false)}
                disabled={isSaving}
                title="Save solution, complexity, and learning notes"
              >
                <Save size={14} />
                <span>Save Progress</span>
              </button>

              {saveSuccessMsg && (
                <div className="ws-save-toast">
                  <Check size={12} /> {saveSuccessMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="workspace-mobile-tabs">
          <button
            type="button"
            className={`ws-mobile-tab-btn ${mobileTab === 'learning' ? 'active' : ''}`}
            onClick={() => setMobileTab('learning')}
          >
            <BookOpen size={15} />
            <span>Problem & Learning</span>
          </button>
          <button
            type="button"
            className={`ws-mobile-tab-btn ${mobileTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setMobileTab('workspace')}
          >
            <Code2 size={15} />
            <span>Code & Workspace</span>
          </button>
        </div>
      </header>

      {/* ==================================================================
          2. MAIN TWO-COLUMN WORKSPACE BODY
          ================================================================== */}
      <main className="workspace-main-body">
        <div className="workspace-grid-layout">
          {/* ================================================================
              LEFT COLUMN — Problem Description & Learning Materials
              ================================================================ */}
          <section
            className={`ws-column ws-left-column ${mobileTab === 'learning' ? 'mobile-show' : 'mobile-hide'}`}
            aria-label="Problem Description and Conceptual Learning"
          >
            {/* Card 1: Problem Overview & LeetCode Callout */}
            <div className="ws-card">
              <div className="ws-card-header-compact">
                <span className="ws-pattern-label">
                  {problem.pattern || 'Algorithmic Challenge'}
                </span>
              </div>

              <h2 className="ws-problem-main-title">
                {problem.problem_number ? `${problem.problem_number}. ` : ''}{problem.title}
              </h2>

              {/* Tags Row */}
              <div className="ws-tags-row">
                <span className={`ws-diff-tag ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>

                {problem.pattern && (
                  <span className="ws-pattern-tag">
                    <Sparkles size={11} color="#0284C7" />
                    <span>{problem.pattern}</span>
                  </span>
                )}

                {problem.topics?.map((topic) => (
                  <span key={topic} className="ws-topic-tag">
                    {topic}
                  </span>
                ))}
              </div>

              {/* Problem Description */}
              {problem.description && (
                <div className="ws-description-body">
                  <p className="ws-description-text">{problem.description}</p>
                </div>
              )}

              {/* LeetCode Official Link Callout */}
              {problem.leetcode_url && (
                <div className="ws-leetcode-callout">
                  <div className="ws-leetcode-text">
                    <span className="ws-leetcode-label">Official Challenge Runner</span>
                    <p className="ws-leetcode-prompt">
                      Test and submit against official test suites on LeetCode, then record your best solution here.
                    </p>
                  </div>
                  <a
                    href={problem.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ws-btn ws-btn-leetcode"
                    title={`Open ${problem.title} on LeetCode`}
                  >
                    <span>Open in LeetCode</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Card 2: Understand the Concept */}
            <div className="ws-card">
              <div className="ws-section-header">
                <div className="ws-section-title-wrap">
                  <BookOpen size={17} color="#0284C7" />
                  <h3 className="ws-section-title">Understand the Concept</h3>
                </div>

                <button
                  type="button"
                  className="ws-btn-explain-ai"
                  onClick={() => {
                    setRightPanelTab('ai');
                    setMobileTab('workspace');
                  }}
                  title="Ask AI to break down this problem"
                >
                  <Sparkles size={13} color="#0284C7" />
                  <span>Explain with AI</span>
                </button>
              </div>

              {problem.theory_content ? (
                <div className="ws-theory-content">
                  <p className="ws-theory-text">{problem.theory_content}</p>
                  <div className="ws-theory-keypoints">
                    <div className="ws-keypoint-row">
                      <span className="ws-keypoint-dot"></span>
                      <span className="ws-keypoint-text">
                        <strong>Core Pattern:</strong> {problem.pattern || 'Pattern Recognition'}
                      </span>
                    </div>
                    <div className="ws-keypoint-row">
                      <span className="ws-keypoint-dot"></span>
                      <span className="ws-keypoint-text">
                        <strong>Interview Strategy:</strong> Identify boundary invariants and analyze trade-offs before writing code.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ws-theory-placeholder">
                  <p className="ws-theory-placeholder-text">
                    Structured notes for this challenge are being prepared. Click <strong>"Explain with AI"</strong> above to generate an instant explanation!
                  </p>
                </div>
              )}
            </div>

            {/* Card 3: Personal Approach */}
            <div className="ws-card">
              <div className="ws-section-header">
                <div className="ws-section-title-wrap">
                  <FileText size={17} color="#0284C7" />
                  <h3 className="ws-section-title">My Approach</h3>
                </div>
              </div>
              <p className="ws-field-desc">
                Describe your thought process, step-by-step logic, and why your selected algorithmic pattern works.
              </p>
              <textarea
                className="ws-textarea"
                rows={4}
                value={personalApproach}
                onChange={(e) => {
                  setPersonalApproach(e.target.value);
                  markDirtyAndDebounceSave();
                }}
                placeholder="e.g. 1. Initialize two pointers at start and end. 2. Compare sum against target. 3. Adjust pointers based on magnitude..."
              />
            </div>

            {/* Card 4: Time & Space Complexity */}
            <div className="ws-card">
              <div className="ws-section-header">
                <div className="ws-section-title-wrap">
                  <Clock size={17} color="#059669" />
                  <h3 className="ws-section-title">Time & Space Complexity</h3>
                </div>
              </div>

              <div className="ws-complexity-grid">
                <div className="ws-complexity-box">
                  <label htmlFor="time-complexity-input" className="ws-complexity-label">
                    Time Complexity
                  </label>
                  <input
                    id="time-complexity-input"
                    type="text"
                    className="ws-complexity-input"
                    value={timeComplexity}
                    onChange={(e) => {
                      setTimeComplexity(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="e.g. O(N) or O(N log N)"
                  />
                  <span className="ws-complexity-hint">Asymptotic runtime bound</span>
                </div>

                <div className="ws-complexity-box">
                  <label htmlFor="space-complexity-input" className="ws-complexity-label">
                    Space Complexity
                  </label>
                  <input
                    id="space-complexity-input"
                    type="text"
                    className="ws-complexity-input"
                    value={spaceComplexity}
                    onChange={(e) => {
                      setSpaceComplexity(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="e.g. O(1) or O(N)"
                  />
                  <span className="ws-complexity-hint">Auxiliary memory consumption</span>
                </div>
              </div>
            </div>

            {/* Card 5: Mistakes & Edge Cases */}
            <div className="ws-card">
              <div className="ws-section-header">
                <div className="ws-section-title-wrap">
                  <AlertCircle size={17} color="#D97706" />
                  <h3 className="ws-section-title">Mistakes & Edge Cases</h3>
                </div>
              </div>
              <p className="ws-field-desc">
                Log tricky test cases, unexpected bugs, off-by-one indices, or misconceptions to revisit during interview revision.
              </p>
              <textarea
                className="ws-textarea"
                rows={4}
                value={mistakesEdgeCases}
                onChange={(e) => {
                  setMistakesEdgeCases(e.target.value);
                  markDirtyAndDebounceSave();
                }}
                placeholder="e.g. 1. Handle empty input / null head. 2. Account for negative indices. 3. Watch for 32-bit integer overflow..."
              />
            </div>
          </section>

          {/* ================================================================
              RIGHT COLUMN — Code Editor, AI Tutor, and Personal Notes
              ================================================================ */}
          <section
            className={`ws-column ws-right-column ${mobileTab === 'workspace' ? 'mobile-show' : 'mobile-hide'}`}
            aria-label="Code Editor, AI Assistant, and Personal Scratchpad"
          >
            {/* Panel View Switcher: Code vs AI Tutor */}
            <div className="ws-panel-tabs">
              <button
                type="button"
                className={`ws-panel-tab-btn ${rightPanelTab === 'editor' ? 'active' : ''}`}
                onClick={() => setRightPanelTab('editor')}
              >
                <Code2 size={15} />
                <span>Solution Code & Notes</span>
              </button>

              <button
                type="button"
                className={`ws-panel-tab-btn ${rightPanelTab === 'ai' ? 'active' : ''}`}
                onClick={() => setRightPanelTab('ai')}
              >
                <Sparkles size={15} color={rightPanelTab === 'ai' ? '#0284C7' : '#64748B'} />
                <span>AI Tutor & Explainer</span>
                <span className="ws-ai-chip">Ask Questions</span>
              </button>
            </div>

            {rightPanelTab === 'ai' ? (
              /* Groq AI Code Assistant Component */
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
                code={activeCode}
                language={activeLanguage}
                userId={user?.id}
              />
            ) : (
              /* Solution Code Editor & Personal Notes */
              <>
                {/* Personal Solution Monaco Code Editor */}
                <MonacoCodeEditor
                  problemId={problem.id}
                  problemTitle={problem.title}
                  language={activeLanguage}
                  onLanguageChange={(newLang) => {
                    setActiveLanguage(newLang);
                    markDirtyAndDebounceSave();
                  }}
                  code={activeCode}
                  onChange={handleCodeChange}
                  onResetToTemplate={handleResetTemplate}
                  leetcodeUrl={problem.leetcode_url}
                />

                {/* Personal Notes & Observations Card */}
                <div className="ws-card">
                  <div className="ws-section-header">
                    <div className="ws-section-title-wrap">
                      <FileText size={17} color="#0284C7" />
                      <h3 className="ws-section-title">Personal Notes & Observations</h3>
                    </div>
                    <span className="ws-privacy-badge">
                      <Lock size={11} />
                      <span>Private to your account</span>
                    </span>
                  </div>
                  <p className="ws-field-desc">
                    Record insights, alternative algorithmic designs, or personal test observations here.
                  </p>
                  <textarea
                    className="ws-textarea ws-notes-textarea"
                    rows={6}
                    value={personalNotes}
                    onChange={(e) => {
                      setPersonalNotes(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="Record key takeaways, alternative patterns, edge-case observations, or interview prep thoughts..."
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
