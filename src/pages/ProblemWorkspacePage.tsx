// src/pages/ProblemWorkspacePage.tsx
// AlgoTrack: LeetCode-Style Problem Workspace with Fixed Navbar, Left Tabs Sidebar & Resizable Split Panels

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
  Lightbulb,
  Compass,
  RotateCcw,
  Maximize2,
  Minimize2,
  GripVertical,
  GripHorizontal
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
import { TestcasesPanel } from '../components/workspace/TestcasesPanel';
import './ProblemWorkspacePage.css';

export type LeftWorkspaceTab = 'description' | 'editorial' | 'ai' | 'approach' | 'notes';

const STORAGE_KEYS = {
  H_SPLIT: 'algotrack_ws_h_split',
  V_SPLIT: 'algotrack_ws_v_split',
  ACTIVE_TAB: 'algotrack_ws_active_tab',
};

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Problem definition state
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Left Sidebar Tab
  const [activeLeftTab, setActiveLeftTab] = useState<LeftWorkspaceTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as LeftWorkspaceTab;
    return (['description', 'editorial', 'ai', 'approach', 'notes'].includes(saved)) ? saved : 'description';
  });

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

  // Resizable Split Panes State
  // Horizontal split (% width for Left Content Panel)
  const [hSplitPercent, setHSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.H_SPLIT);
    return saved ? Math.max(25, Math.min(75, parseFloat(saved))) : 48;
  });

  // Vertical split (% height for Monaco Code Editor in Right Column)
  const [vSplitPercent, setVSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.V_SPLIT);
    return saved ? Math.max(25, Math.min(85, parseFloat(saved))) : 65;
  });

  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const [isTestcasesCollapsed, setIsTestcasesCollapsed] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  // Mobile navigation tab ('content' vs 'code')
  const [mobileActiveTab, setMobileActiveTab] = useState<'content' | 'code'>('content');

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompletedRef = useRef(false);

  // Tab switch handler
  const handleTabChange = (tab: LeftWorkspaceTab) => {
    setActiveLeftTab(tab);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    // On mobile, ensure we view content
    setMobileActiveTab('content');
  };

  // Reset panels layout to defaults
  const handleResetLayout = () => {
    setHSplitPercent(48);
    setVSplitPercent(65);
    setIsTestcasesCollapsed(false);
    setIsEditorMaximized(false);
    localStorage.setItem(STORAGE_KEYS.H_SPLIT, '48');
    localStorage.setItem(STORAGE_KEYS.V_SPLIT, '65');
  };

  // Horizontal Dragging (Split between Left & Right)
  const handleHMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingH(true);
  };

  // Vertical Dragging (Split between Editor & Testcases)
  const handleVMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingV(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingH && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        // Exclude the 54px left sidebar from the split calculation
        const sidebarWidth = 54;
        const totalContentWidth = rect.width - sidebarWidth;
        const offsetX = e.clientX - rect.left - sidebarWidth;
        const newPercent = Math.max(25, Math.min(75, (offsetX / totalContentWidth) * 100));
        setHSplitPercent(newPercent);
      }

      if (isDraggingV && rightColumnRef.current) {
        const rect = rightColumnRef.current.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const newPercent = Math.max(20, Math.min(85, (offsetY / rect.height) * 100));
        setVSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingH) {
        setIsDraggingH(false);
        localStorage.setItem(STORAGE_KEYS.H_SPLIT, hSplitPercent.toFixed(1));
      }
      if (isDraggingV) {
        setIsDraggingV(false);
        localStorage.setItem(STORAGE_KEYS.V_SPLIT, vSplitPercent.toFixed(1));
      }
    };

    if (isDraggingH || isDraggingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingH ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingH, isDraggingV, hSplitPercent, vSplitPercent]);

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

  // Status Change Handler with immediate optimistic UI update
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

  // Normalized examples
  const problemExamples = problem.examples && problem.examples.length > 0 
    ? problem.examples 
    : [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ];

  const problemConstraints = problem.constraints && problem.constraints.length > 0
    ? problem.constraints
    : [
        `1 <= nums.length <= 10^5`,
        `-10^9 <= nums[i] <= 10^9`,
        `Optimal asymptotic runtime: O(N) or O(N log N)`,
      ];

  return (
    <div className="workspace-page-container">
      {/* ==================================================================
          1. FIXED GLOBAL WORKSPACE NAVBAR (Single compact header)
          ================================================================== */}
      <header className="workspace-header">
        <div className="workspace-header-inner">
          {/* Left: Back, Number, Title, Difficulty */}
          <div className="header-left-group">
            <Link to="/problems" className="ws-back-link" title="Return to Problems Library">
              <ArrowLeft size={14} />
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

          {/* Right: Status Dropdown, Prev/Next, Save Progress, Reset Layout */}
          <div className="header-right-actions">
            {/* Problem Status Selector */}
            <div className="ws-status-select-wrap">
              <label htmlFor="ws-status-select" className="sr-only">Problem Status</label>
              <select
                id="ws-status-select"
                className={`ws-status-dropdown ${problemStatus}`}
                value={problemStatus}
                onChange={(e) => handleStatusChange(e.target.value as ProblemStatus)}
                title="Change your problem progress status"
              >
                <option value="not_started">⚪ Todo</option>
                <option value="attempted">🟡 Attempted</option>
                <option value="solved">🟢 Solved</option>
              </select>
            </div>

            {/* Previous and Next Navigation */}
            <div className="ws-seq-nav-group">
              <button
                type="button"
                className="ws-seq-btn"
                onClick={handleNavPrevious}
                disabled={!problem.problem_number || problem.problem_number <= 1}
                title="Previous problem in sequence"
              >
                <ChevronLeft size={14} />
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
                <ChevronRight size={14} />
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
                title="Save solution, notes, and complexity"
              >
                <Save size={13} />
                <span>Save</span>
              </button>

              {saveSuccessMsg && (
                <div className="ws-save-toast">
                  <Check size={12} /> {saveSuccessMsg}
                </div>
              )}
            </div>

            {/* Reset Split Layout */}
            <button
              type="button"
              className="ws-btn-layout-reset"
              onClick={handleResetLayout}
              title="Reset workspace panels to default dimensions"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (Visible only below 1024px) */}
        <div className="workspace-mobile-bar">
          <button
            type="button"
            className={`ws-mobile-btn ${mobileActiveTab === 'content' ? 'active' : ''}`}
            onClick={() => setMobileActiveTab('content')}
          >
            <BookOpen size={14} />
            <span>Problem & Tabs</span>
          </button>
          <button
            type="button"
            className={`ws-mobile-btn ${mobileActiveTab === 'code' ? 'active' : ''}`}
            onClick={() => setMobileActiveTab('code')}
          >
            <Code2 size={14} />
            <span>Code & Testcases</span>
          </button>
        </div>
      </header>

      {/* ==================================================================
          2. MAIN WORKSPACE VIEWPORT (Fixed Left Sidebar + Resizable Split)
          ================================================================== */}
      <main className="workspace-main-viewport" ref={mainContainerRef}>
        {/* ================================================================
            A. FIXED LEFT SIDEBAR — 5 LEETCODE-STYLE TABS
            ================================================================ */}
        <nav className="workspace-fixed-sidebar" aria-label="Problem Workspace Tabs">
          <div className="sidebar-tab-items">
            {/* Tab 1: Description */}
            <button
              type="button"
              className={`sidebar-tab-button ${activeLeftTab === 'description' ? 'active' : ''}`}
              onClick={() => handleTabChange('description')}
              title="Description"
            >
              <div className="sidebar-tab-icon">
                <BookOpen size={17} />
              </div>
              <span className="sidebar-tab-label">Description</span>
            </button>

            {/* Tab 2: Editorial */}
            <button
              type="button"
              className={`sidebar-tab-button ${activeLeftTab === 'editorial' ? 'active' : ''}`}
              onClick={() => handleTabChange('editorial')}
              title="Editorial"
            >
              <div className="sidebar-tab-icon">
                <Lightbulb size={17} />
              </div>
              <span className="sidebar-tab-label">Editorial</span>
            </button>

            {/* Tab 3: AI Assistant (Strict Theory Mode) */}
            <button
              type="button"
              className={`sidebar-tab-button ai-tab ${activeLeftTab === 'ai' ? 'active' : ''}`}
              onClick={() => handleTabChange('ai')}
              title="AI Assistant (Theory Only)"
            >
              <div className="sidebar-tab-icon">
                <Sparkles size={17} />
              </div>
              <span className="sidebar-tab-label">AI Tutor</span>
            </button>

            {/* Tab 4: My Approach */}
            <button
              type="button"
              className={`sidebar-tab-button ${activeLeftTab === 'approach' ? 'active' : ''}`}
              onClick={() => handleTabChange('approach')}
              title="My Approach"
            >
              <div className="sidebar-tab-icon">
                <Compass size={17} />
              </div>
              <span className="sidebar-tab-label">Approach</span>
            </button>

            {/* Tab 5: Personal Notes */}
            <button
              type="button"
              className={`sidebar-tab-button ${activeLeftTab === 'notes' ? 'active' : ''}`}
              onClick={() => handleTabChange('notes')}
              title="Personal Notes"
            >
              <div className="sidebar-tab-icon">
                <FileText size={17} />
              </div>
              <span className="sidebar-tab-label">Notes</span>
            </button>
          </div>
        </nav>

        {/* ================================================================
            B. RESIZABLE SPLIT PANELS (Left Content + Right Coding Area)
            ================================================================ */}
        <div className="workspace-split-area">
          {/* ==============================================================
              LEFT CONTENT PANEL (Scrolls independently, switches with tabs)
              ============================================================== */}
          <section 
            className={`workspace-left-content-panel ${mobileActiveTab === 'content' ? 'mobile-visible' : 'mobile-hidden'}`}
            style={{ width: `${hSplitPercent}%` }}
            aria-label="Problem Learning Panel"
          >
            {/* ------------------------------------------------------------
                TAB 1: DESCRIPTION TAB
                ------------------------------------------------------------ */}
            {activeLeftTab === 'description' && (
              <div className="tab-pane-content tab-description-pane">
                {/* Header Problem Identity */}
                <div className="description-header-block">
                  <div className="desc-title-row">
                    <h2 className="desc-problem-title">
                      {problem.problem_number ? `${problem.problem_number}. ` : ''}{problem.title}
                    </h2>
                  </div>

                  {/* Badges Row */}
                  <div className="desc-badges-row">
                    <span className={`desc-diff-badge ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>

                    {problem.pattern && (
                      <span className="desc-pattern-badge">
                        <Sparkles size={12} color="#0284C7" />
                        <span>{problem.pattern}</span>
                      </span>
                    )}

                    {problem.topics?.map((topic) => (
                      <span key={topic} className="desc-topic-pill">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Problem Statement */}
                {problem.description && (
                  <div className="desc-statement-block">
                    <p className="desc-statement-text">{problem.description}</p>
                  </div>
                )}

                {/* Examples Section */}
                <div className="desc-examples-block">
                  {problemExamples.map((ex, idx) => (
                    <div key={idx} className="desc-example-card">
                      <div className="desc-example-title">Example {idx + 1}:</div>
                      <div className="desc-example-content">
                        <div className="desc-example-item">
                          <span className="desc-item-label">Input:</span>
                          <code className="desc-item-code">{ex.input}</code>
                        </div>
                        <div className="desc-example-item">
                          <span className="desc-item-label">Output:</span>
                          <code className="desc-item-code output">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="desc-example-item">
                            <span className="desc-item-label">Explanation:</span>
                            <span className="desc-item-explanation">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints Section */}
                <div className="desc-constraints-block">
                  <h3 className="desc-section-heading">Constraints:</h3>
                  <ul className="desc-constraints-list">
                    {problemConstraints.map((c, i) => (
                      <li key={i} className="desc-constraint-item">
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LeetCode Challenge Runner Link */}
                {problem.leetcode_url && (
                  <div className="desc-leetcode-callout">
                    <div className="desc-leetcode-info">
                      <span className="desc-callout-tag">Official Challenge Runner</span>
                      <p className="desc-callout-desc">
                        Test and submit against official test suites on LeetCode, then record your best solution and approach here.
                      </p>
                    </div>
                    <a
                      href={problem.leetcode_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="desc-leetcode-btn"
                      title={`Open ${problem.title} on LeetCode`}
                    >
                      <span>Open in LeetCode</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 2: EDITORIAL TAB
                ------------------------------------------------------------ */}
            {activeLeftTab === 'editorial' && (
              <div className="tab-pane-content tab-editorial-pane">
                <div className="editorial-header">
                  <div className="editorial-title-wrap">
                    <Lightbulb size={20} color="#0284C7" />
                    <h2 className="editorial-heading">Editorial & Algorithmic Theory</h2>
                  </div>
                  <span className="editorial-pattern-chip">
                    {problem.pattern || 'Core Algorithmic Technique'}
                  </span>
                </div>

                {problem.theory_content ? (
                  <div className="editorial-body">
                    {/* Theory Intuition */}
                    <div className="editorial-section">
                      <h3 className="editorial-subheading">1. Problem-Solving Intuition</h3>
                      <p className="editorial-text">{problem.theory_content}</p>
                    </div>

                    {/* Step-by-Step Approach Breakdown */}
                    <div className="editorial-section">
                      <h3 className="editorial-subheading">2. Step-by-Step Approach</h3>
                      <div className="editorial-steps-list">
                        <div className="editorial-step-item">
                          <span className="step-num">1</span>
                          <div className="step-content">
                            <strong>Identify Boundary Invariants:</strong> Inspect constraints and look for properties such as sortedness, monotonicity, or frequency lookups.
                          </div>
                        </div>
                        <div className="editorial-step-item">
                          <span className="step-num">2</span>
                          <div className="step-content">
                            <strong>Choose the Right Data Structure:</strong> Select data structures with favorable amortized lookups or auxiliary state bounds.
                          </div>
                        </div>
                        <div className="editorial-step-item">
                          <span className="step-num">3</span>
                          <div className="step-content">
                            <strong>Execute Single-Pass / Optimal Strategy:</strong> Avoid duplicate recalculation by storing running state or moving two bounds concurrently.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complexity Analysis */}
                    <div className="editorial-section">
                      <h3 className="editorial-subheading">3. Asymptotic Complexity Theory</h3>
                      <div className="editorial-complexity-cards">
                        <div className="complexity-theory-card">
                          <span className="theory-card-title">Optimal Time Bound</span>
                          <span className="theory-card-val">O(N) or O(N log N)</span>
                          <span className="theory-card-desc">Processes each element a constant number of times.</span>
                        </div>
                        <div className="complexity-theory-card">
                          <span className="theory-card-title">Auxiliary Space Bound</span>
                          <span className="theory-card-val">O(1) to O(N)</span>
                          <span className="theory-card-desc">Depends on whether auxiliary map/stack memory is required.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="editorial-empty-state">
                    <Lightbulb size={32} color="#94A3B8" />
                    <h3 className="editorial-empty-title">Editorial Material In Progress</h3>
                    <p className="editorial-empty-desc">
                      Official written editorial notes for this problem are currently being curated. You can use our <strong>AI Assistant</strong> tab to get a complete conceptual breakdown and step-by-step dry run on demand.
                    </p>
                    <button
                      type="button"
                      className="editorial-ask-ai-btn"
                      onClick={() => handleTabChange('ai')}
                    >
                      <Sparkles size={14} />
                      <span>Ask AI for Conceptual Breakdown</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 3: AI ASSISTANT TAB (Strict Theory-Only Mode)
                ------------------------------------------------------------ */}
            {activeLeftTab === 'ai' && (
              <div className="tab-pane-content tab-ai-pane">
                <div className="ai-tab-header">
                  <div className="ai-header-badge">
                    <Sparkles size={15} color="#0284C7" />
                    <span>DSA Theory & Concepts Mentor</span>
                  </div>
                  <span className="ai-mode-pill">Strict Theory Mode</span>
                </div>

                <div className="ai-assistant-wrapper">
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
                      examples: problemExamples,
                      constraints: problemConstraints,
                    }}
                    code={activeCode}
                    language={activeLanguage}
                    userId={user?.id}
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 4: MY APPROACH TAB
                ------------------------------------------------------------ */}
            {activeLeftTab === 'approach' && (
              <div className="tab-pane-content tab-approach-pane">
                <div className="tab-section-header">
                  <div className="tab-heading-wrap">
                    <Compass size={18} color="#0284C7" />
                    <h2 className="tab-main-title">My Algorithmic Approach</h2>
                  </div>
                  <button
                    type="button"
                    className="tab-save-btn"
                    onClick={() => handleSaveProgress(false)}
                    disabled={isSaving}
                  >
                    <Save size={13} />
                    <span>Save Approach</span>
                  </button>
                </div>

                <p className="tab-desc-text">
                  Record your problem-solving intuition, step-by-step logic, pseudocode, and selected data structures.
                </p>

                {/* Complexity Analysis Inputs */}
                <div className="approach-complexity-grid">
                  <div className="approach-input-box">
                    <label htmlFor="approach-time-input" className="approach-label">
                      <Clock size={13} color="#059669" />
                      <span>Time Complexity</span>
                    </label>
                    <input
                      id="approach-time-input"
                      type="text"
                      className="approach-text-input"
                      value={timeComplexity}
                      onChange={(e) => {
                        setTimeComplexity(e.target.value);
                        markDirtyAndDebounceSave();
                      }}
                      placeholder="e.g. O(N) or O(N log N)"
                    />
                  </div>

                  <div className="approach-input-box">
                    <label htmlFor="approach-space-input" className="approach-label">
                      <Clock size={13} color="#0284C7" />
                      <span>Space Complexity</span>
                    </label>
                    <input
                      id="approach-space-input"
                      type="text"
                      className="approach-text-input"
                      value={spaceComplexity}
                      onChange={(e) => {
                        setSpaceComplexity(e.target.value);
                        markDirtyAndDebounceSave();
                      }}
                      placeholder="e.g. O(1) or O(N)"
                    />
                  </div>
                </div>

                {/* Personal Approach Textarea */}
                <div className="approach-textarea-wrap">
                  <label htmlFor="personal-approach-area" className="approach-label">
                    Approach Details & Step-by-Step Logic
                  </label>
                  <textarea
                    id="personal-approach-area"
                    className="approach-textarea"
                    rows={12}
                    value={personalApproach}
                    onChange={(e) => {
                      setPersonalApproach(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="1. High-level intuition...&#10;2. Data structure selection...&#10;3. Key invariants / base cases...&#10;4. Pseudocode walkthrough..."
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------
                TAB 5: PERSONAL NOTES TAB
                ------------------------------------------------------------ */}
            {activeLeftTab === 'notes' && (
              <div className="tab-pane-content tab-notes-pane">
                <div className="tab-section-header">
                  <div className="tab-heading-wrap">
                    <FileText size={18} color="#0284C7" />
                    <h2 className="tab-main-title">Personal Notes & Observations</h2>
                  </div>
                  <div className="tab-header-right">
                    <span className="tab-privacy-tag">
                      <Lock size={11} />
                      <span>Private</span>
                    </span>
                    <button
                      type="button"
                      className="tab-save-btn"
                      onClick={() => handleSaveProgress(false)}
                      disabled={isSaving}
                    >
                      <Save size={13} />
                      <span>Save Notes</span>
                    </button>
                  </div>
                </div>

                {/* Personal Takeaways */}
                <div className="notes-block">
                  <label htmlFor="personal-notes-area" className="approach-label">
                    Key Observations & Takeaways
                  </label>
                  <textarea
                    id="personal-notes-area"
                    className="approach-textarea"
                    rows={7}
                    value={personalNotes}
                    onChange={(e) => {
                      setPersonalNotes(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="Record key takeaways, alternative patterns, or concepts to review before technical interviews..."
                  />
                </div>

                {/* Mistakes & Edge Cases */}
                <div className="notes-block">
                  <label htmlFor="mistakes-cases-area" className="approach-label error-label">
                    <AlertCircle size={13} color="#DC2626" />
                    <span>Mistakes & Tricky Edge Cases</span>
                  </label>
                  <textarea
                    id="mistakes-cases-area"
                    className="approach-textarea"
                    rows={6}
                    value={mistakesEdgeCases}
                    onChange={(e) => {
                      setMistakesEdgeCases(e.target.value);
                      markDirtyAndDebounceSave();
                    }}
                    placeholder="e.g. 1. Handle empty array. 2. Account for negative numbers. 3. Watch for 32-bit integer overflow..."
                  />
                </div>
              </div>
            )}
          </section>

          {/* ==============================================================
              HORIZONTAL RESIZE HANDLE (Draggable divider between Left and Right)
              ============================================================== */}
          <div 
            className={`workspace-h-resizer ${isDraggingH ? 'active' : ''}`}
            onMouseDown={handleHMouseDown}
            title="Drag horizontally to resize Left Content vs Right Editor"
          >
            <div className="resizer-pill">
              <GripVertical size={12} />
            </div>
          </div>

          {/* ==============================================================
              RIGHT CODING WORKSPACE (Editor + Vertical Split + Testcases)
              ============================================================== */}
          <section 
            className={`workspace-right-coding-panel ${mobileActiveTab === 'code' ? 'mobile-visible' : 'mobile-hidden'}`}
            style={{ width: `${100 - hSplitPercent}%` }}
            ref={rightColumnRef}
            aria-label="Code Editor and Testcases Workspace"
          >
            {/* Top Section: Monaco Code Editor */}
            <div 
              className="coding-editor-section"
              style={{ 
                height: isEditorMaximized 
                  ? '100%' 
                  : isTestcasesCollapsed 
                    ? 'calc(100% - 40px)' 
                    : `${vSplitPercent}%` 
              }}
            >
              <div className="editor-top-toolbar">
                <div className="editor-toolbar-actions">
                  {problem.leetcode_url && (
                    <a
                      href={problem.leetcode_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editor-leetcode-btn"
                      title="Open problem in official LeetCode runner"
                    >
                      <span>Open on LeetCode</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    type="button"
                    className="editor-maximize-btn"
                    onClick={() => setIsEditorMaximized(!isEditorMaximized)}
                    title={isEditorMaximized ? 'Restore testcases panel' : 'Maximize editor (hide testcases)'}
                  >
                    {isEditorMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              </div>

              <div className="editor-component-container">
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
                  fillHeight={true}
                />
              </div>
            </div>

            {/* Vertical Split Divider between Editor and Testcases */}
            {!isEditorMaximized && !isTestcasesCollapsed && (
              <div 
                className={`workspace-v-resizer ${isDraggingV ? 'active' : ''}`}
                onMouseDown={handleVMouseDown}
                title="Drag vertically to resize Editor vs Testcases"
              >
                <div className="v-resizer-pill">
                  <GripHorizontal size={12} />
                </div>
              </div>
            )}

            {/* Bottom Section: Testcases Panel */}
            {!isEditorMaximized && (
              <div 
                className="coding-testcases-section"
                style={{ 
                  height: isTestcasesCollapsed 
                    ? '40px' 
                    : `calc(${100 - vSplitPercent}% - 6px)` 
                }}
              >
                <TestcasesPanel
                  examples={problemExamples}
                  leetcodeUrl={problem.leetcode_url}
                  isCollapsed={isTestcasesCollapsed}
                  onToggleCollapse={() => setIsTestcasesCollapsed(!isTestcasesCollapsed)}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
