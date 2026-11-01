// src/pages/ProblemWorkspacePage.tsx
// AlgoTrack — LeetCode-Inspired Problem Workspace with Collapsible Nav Sidebar

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
  ChevronDown,
  ChevronUp,
  ListChecks,
  Lightbulb,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Copy
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
import { askGroqAI } from '../services/aiService';
import './ProblemWorkspacePage.css';

interface NavSectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  isAiTab?: boolean;
}

const NAV_SECTIONS: NavSectionItem[] = [
  { id: 'sec-description', label: 'Problem Description', shortLabel: 'Description', icon: BookOpen },
  { id: 'sec-examples', label: 'Examples & Constraints', shortLabel: 'Examples', icon: ListChecks },
  { id: 'sec-concept', label: 'Concepts / Theory', shortLabel: 'Theory', icon: Lightbulb },
  { id: 'sec-approach', label: 'Approach', shortLabel: 'Approach', icon: Compass },
  { id: 'sec-complexity', label: 'Complexity Analysis', shortLabel: 'Complexity', icon: Clock },
  { id: 'sec-mistakes', label: 'Mistakes & Edge Cases', shortLabel: 'Mistakes', icon: AlertCircle },
  { id: 'sec-notes', label: 'Personal Notes', shortLabel: 'Notes', icon: FileText },
  { id: 'sec-ai', label: 'AI Code Assistant', shortLabel: 'AI Tutor', icon: Sparkles, isAiTab: true },
];

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

  // Left sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('algotrack_ws_sidebar_collapsed') === 'true';
  });

  // Active section tracking for sidebar scrollspy
  const [activeSection, setActiveSection] = useState<string>('sec-description');

  // Responsive / View modes
  const [mobileTab, setMobileTab] = useState<'learning' | 'workspace'>('learning');
  const [rightPanelTab, setRightPanelTab] = useState<'editor' | 'ai'>('editor');
  const [isAiExplaining, setIsAiExplaining] = useState(false);
  const [aiExplanationText, setAiExplanationText] = useState<string | null>(null);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    problemOverview: true,
    examples: true,
    concept: true,
    approach: true,
    complexity: true,
    mistakes: true,
    notes: true,
    editor: true,
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('algotrack_ws_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Trigger inline AI concept explanation with expanded view
  const handleExplainWithAI = async () => {
    if (!problem) return;
    setIsAiExplaining(true);
    setExpandedSections((prev) => ({ ...prev, concept: true }));

    try {
      const res = await askGroqAI({
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: activeLanguage,
        code: solutionsByLang[activeLanguage] || '',
        action: 'explain',
        question: `Explain this algorithmic problem in depth: core intuition, step-by-step logic, pattern breakdown, and optimal Big-O bounds.`,
        userId: user?.id,
      });

      if (res?.reply) {
        setAiExplanationText(res.reply);
      } else {
        setAiExplanationText('Failed to generate explanation. Please try again.');
      }
    } catch {
      setAiExplanationText('AI explainer encountered a network error. Please try again.');
    } finally {
      setIsAiExplaining(false);
    }
  };

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

  // Sidebar navigation click handler with smooth scroll and tab activation
  const handleNavSectionClick = (section: NavSectionItem) => {
    setActiveSection(section.id);

    if (section.isAiTab) {
      setRightPanelTab('ai');
      setMobileTab('workspace');
      return;
    }

    // Switch to learning tab on mobile
    setMobileTab('learning');

    // Expand section if collapsed
    const sectionKeyMap: Record<string, string> = {
      'sec-description': 'problemOverview',
      'sec-examples': 'examples',
      'sec-concept': 'concept',
      'sec-approach': 'approach',
      'sec-complexity': 'complexity',
      'sec-mistakes': 'mistakes',
      'sec-notes': 'notes',
    };
    const key = sectionKeyMap[section.id];
    if (key && !expandedSections[key]) {
      setExpandedSections(prev => ({ ...prev, [key]: true }));
    }

    // Smooth scroll into view
    setTimeout(() => {
      const el = document.getElementById(section.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Scrollspy observer for left column sections
  useEffect(() => {
    const container = document.getElementById('ws-left-scroll-pane');
    if (!container) return;

    const sectionIds = [
      'sec-description',
      'sec-examples',
      'sec-concept',
      'sec-approach',
      'sec-complexity',
      'sec-mistakes',
      'sec-notes',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: container,
        rootMargin: '-15% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [expandedSections, problem]);

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

  // Default examples if not explicitly present on the problem record
  const problemExamples = problem.examples && problem.examples.length > 0 
    ? problem.examples 
    : [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'The elements at index 0 and 1 sum to 9.'
        }
      ];

  const problemConstraints = problem.constraints && problem.constraints.length > 0
    ? problem.constraints
    : [
        `1 <= nums.length <= 10^5`,
        `-10^9 <= nums[i] <= 10^9`,
        `Optimal algorithmic time: O(N) or O(N log N)`,
      ];

  return (
    <div className="workspace-page-container">
      {/* ==================================================================
          1. TOP WORKSPACE HEADER (Compact & LeetCode-Inspired)
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
            <span>Problem & Notes</span>
          </button>
          <button
            type="button"
            className={`ws-mobile-tab-btn ${mobileTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setMobileTab('workspace')}
          >
            <Code2 size={15} />
            <span>Code & AI</span>
          </button>
        </div>
      </header>

      {/* ==================================================================
          2. MAIN BODY (Sidebar + Left Scroll Pane + Right Editor Pane)
          ================================================================== */}
      <main className="workspace-main-body">
        {/* ================================================================
            A. COLLAPSIBLE LEFT NAVIGATION SIDEBAR
            ================================================================ */}
        <aside 
          className={`workspace-nav-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
          aria-label="Workspace Section Navigation"
        >
          <div className="sidebar-nav-list">
            {NAV_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = sec.isAiTab 
                ? rightPanelTab === 'ai' 
                : activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''} ${sec.isAiTab ? 'ai-item' : ''}`}
                  onClick={() => handleNavSectionClick(sec)}
                  title={sec.label}
                >
                  <span className="nav-icon-wrap">
                    <Icon size={16} />
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="nav-item-label">{sec.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse / Expand Toggle at Bottom */}
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expand section sidebar" : "Collapse section sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <>
                  <PanelLeftClose size={16} />
                  <span className="toggle-label">Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ================================================================
            B. MAIN WORKSPACE SPLIT CONTAINER
            ================================================================ */}
        <div className="workspace-split-container">
          {/* ==============================================================
              LEFT COLUMN — Scrollable Problem Description & Notes
              ============================================================== */}
          <section
            id="ws-left-scroll-pane"
            className={`ws-column ws-left-column ${mobileTab === 'learning' ? 'mobile-show' : 'mobile-hide'}`}
            aria-label="Problem Description and Conceptual Learning"
          >
            {/* Section 1: Problem Overview */}
            <div id="sec-description" className={`ws-card ${!expandedSections.problemOverview ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-card-header-toggle"
                onClick={() => toggleSection('problemOverview')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.problemOverview}
              >
                <div className="ws-card-header-compact">
                  <span className="ws-pattern-label">
                    {problem.pattern || 'Algorithmic Challenge'}
                  </span>
                  <h2 className="ws-problem-main-title">
                    {problem.problem_number ? `${problem.problem_number}. ` : ''}{problem.title}
                  </h2>
                </div>
                <button
                  type="button"
                  className="ws-section-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('problemOverview');
                  }}
                  title={expandedSections.problemOverview ? "Collapse problem overview" : "Expand problem overview"}
                >
                  {expandedSections.problemOverview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandedSections.problemOverview && (
                <div className="ws-card-content">
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
              )}
            </div>

            {/* Section 2: Examples & Constraints */}
            <div id="sec-examples" className={`ws-card ${!expandedSections.examples ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('examples')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.examples}
              >
                <div className="ws-section-title-wrap">
                  <ListChecks size={17} color="#0284C7" />
                  <h3 className="ws-section-title">Examples & Constraints</h3>
                </div>

                <button
                  type="button"
                  className="ws-section-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('examples');
                  }}
                  title={expandedSections.examples ? "Collapse examples" : "Expand examples"}
                >
                  {expandedSections.examples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandedSections.examples && (
                <div className="ws-card-content">
                  {/* Examples List */}
                  <div className="ws-examples-container">
                    {problemExamples.map((ex, idx) => (
                      <div key={idx} className="ws-example-box">
                        <div className="ws-example-badge">Example {idx + 1}</div>
                        <div className="ws-example-row">
                          <span className="ws-example-key">Input:</span>
                          <code className="ws-example-val">{ex.input}</code>
                        </div>
                        <div className="ws-example-row">
                          <span className="ws-example-key">Output:</span>
                          <code className="ws-example-val">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="ws-example-row">
                            <span className="ws-example-key">Explanation:</span>
                            <span className="ws-example-exp">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="ws-constraints-container">
                    <h4 className="ws-constraints-heading">Constraints:</h4>
                    <ul className="ws-constraints-list">
                      {problemConstraints.map((c, i) => (
                        <li key={i} className="ws-constraint-item">
                          <code>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Understand the Concept */}
            <div id="sec-concept" className={`ws-card ws-card-concept ${!expandedSections.concept ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('concept')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.concept}
              >
                <div className="ws-section-title-wrap">
                  <Lightbulb size={17} color="#0284C7" />
                  <h3 className="ws-section-title">Concepts / Theory</h3>
                </div>

                <div className="ws-header-actions-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ws-btn-explain-ai"
                    onClick={handleExplainWithAI}
                    disabled={isAiExplaining}
                    title="Ask AI to break down and explain this problem"
                  >
                    {isAiExplaining ? (
                      <Loader2 size={13} className="spin-icon" />
                    ) : (
                      <Sparkles size={13} color="#0284C7" />
                    )}
                    <span>{isAiExplaining ? 'Generating Analysis...' : 'Explain with AI'}</span>
                  </button>

                  <button
                    type="button"
                    className="ws-section-collapse-btn"
                    onClick={() => toggleSection('concept')}
                    title={expandedSections.concept ? "Collapse concept section" : "Expand concept section"}
                  >
                    {expandedSections.concept ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expandedSections.concept && (
                <div className="ws-card-content">
                  {aiExplanationText ? (
                    <div className="ws-theory-content ws-ai-explanation-box">
                      <div className="ws-ai-explaining-banner">
                        <Sparkles size={14} color="#0284C7" />
                        <span>AI Generated Comprehensive Problem Breakdown</span>
                      </div>
                      <div className="ws-theory-text ws-markdown-content">
                        {aiExplanationText.split('\n\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ) : problem.theory_content ? (
                    <div className="ws-theory-content">
                      <p className="ws-theory-text">{problem.theory_content}</p>
                    </div>
                  ) : isAiExplaining ? (
                    <div className="ws-ai-loading-container">
                      <Loader2 size={24} className="spin-icon" />
                      <p>Consulting Groq AI for in-depth conceptual breakdown and pattern analysis...</p>
                    </div>
                  ) : (
                    <div className="ws-theory-placeholder">
                      <div className="ws-concept-empty-state">
                        <Sparkles size={28} color="#0284C7" />
                        <h4 className="ws-concept-empty-title">Deep Conceptual Breakdown</h4>
                        <p className="ws-theory-placeholder-text">
                          Before asking AI, this space is kept clean and distraction-free. Click <strong>"Explain with AI"</strong> above to generate an in-depth breakdown covering algorithmic intuition, invariant patterns, and edge cases.
                        </p>
                        <button
                          type="button"
                          className="ws-btn-explain-ai-large"
                          onClick={handleExplainWithAI}
                        >
                          <Sparkles size={14} />
                          <span>Explain Problem with AI</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Personal Approach */}
            <div id="sec-approach" className={`ws-card ${!expandedSections.approach ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('approach')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.approach}
              >
                <div className="ws-section-title-wrap">
                  <Compass size={17} color="#0284C7" />
                  <h3 className="ws-section-title">Approach</h3>
                </div>

                <button
                  type="button"
                  className="ws-section-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('approach');
                  }}
                  title={expandedSections.approach ? "Collapse approach section" : "Expand approach section"}
                >
                  {expandedSections.approach ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandedSections.approach && (
                <div className="ws-card-content">
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
              )}
            </div>

            {/* Section 5: Time & Space Complexity */}
            <div id="sec-complexity" className={`ws-card ${!expandedSections.complexity ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('complexity')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.complexity}
              >
                <div className="ws-section-title-wrap">
                  <Clock size={17} color="#059669" />
                  <h3 className="ws-section-title">Complexity Analysis</h3>
                </div>

                <button
                  type="button"
                  className="ws-section-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('complexity');
                  }}
                  title={expandedSections.complexity ? "Collapse complexity section" : "Expand complexity section"}
                >
                  {expandedSections.complexity ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandedSections.complexity && (
                <div className="ws-card-content">
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
              )}
            </div>

            {/* Section 6: Mistakes & Edge Cases */}
            <div id="sec-mistakes" className={`ws-card ${!expandedSections.mistakes ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('mistakes')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.mistakes}
              >
                <div className="ws-section-title-wrap">
                  <AlertCircle size={17} color="#D97706" />
                  <h3 className="ws-section-title">Mistakes & Edge Cases</h3>
                </div>

                <button
                  type="button"
                  className="ws-section-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('mistakes');
                  }}
                  title={expandedSections.mistakes ? "Collapse mistakes section" : "Expand mistakes section"}
                >
                  {expandedSections.mistakes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expandedSections.mistakes && (
                <div className="ws-card-content">
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
              )}
            </div>

            {/* Section 7: Personal Notes & Observations */}
            <div id="sec-notes" className={`ws-card ${!expandedSections.notes ? 'is-collapsed' : ''}`}>
              <div 
                className="ws-section-header ws-card-header-toggle"
                onClick={() => toggleSection('notes')}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.notes}
              >
                <div className="ws-section-title-wrap">
                  <FileText size={17} color="#0284C7" />
                  <h3 className="ws-section-title">Personal Notes & Observations</h3>
                </div>
                <div className="ws-header-actions-wrap" onClick={(e) => e.stopPropagation()}>
                  <span className="ws-privacy-badge">
                    <Lock size={11} />
                    <span>Private to your account</span>
                  </span>

                  <button
                    type="button"
                    className="ws-section-collapse-btn"
                    onClick={() => toggleSection('notes')}
                    title={expandedSections.notes ? "Collapse notes section" : "Expand notes section"}
                  >
                    {expandedSections.notes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expandedSections.notes && (
                <div className="ws-card-content">
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
              )}
            </div>
          </section>

          {/* ==============================================================
              RIGHT COLUMN — Monaco Code Editor & Groq AI Assistant
              ============================================================== */}
          <section
            className={`ws-column ws-right-column ${mobileTab === 'workspace' ? 'mobile-show' : 'mobile-hide'}`}
            aria-label="Code Editor and AI Assistant"
          >
            {/* Panel View Switcher: Code Editor vs AI Assistant */}
            <div className="ws-panel-tabs">
              <button
                type="button"
                className={`ws-panel-tab-btn ${rightPanelTab === 'editor' ? 'active' : ''}`}
                onClick={() => setRightPanelTab('editor')}
              >
                <Code2 size={15} />
                <span>Solution Code</span>
              </button>

              <button
                type="button"
                className={`ws-panel-tab-btn ${rightPanelTab === 'ai' ? 'active' : ''}`}
                onClick={() => setRightPanelTab('ai')}
              >
                <Sparkles size={15} color={rightPanelTab === 'ai' ? '#0284C7' : '#64748B'} />
                <span>AI Code Assistant</span>
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
              /* Solution Code Editor with Quick Actions */
              <div className="ws-editor-container-wrapper">
                {/* Editor Quick Action Toolbar */}
                <div className="ws-editor-top-actions">
                  {problem.leetcode_url && (
                    <a
                      href={problem.leetcode_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ws-quick-action-link"
                      title="Open problem directly on LeetCode"
                    >
                      <span>Open on LeetCode</span>
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <button
                    type="button"
                    className="ws-quick-action-ai-btn"
                    onClick={() => setRightPanelTab('ai')}
                    title="Ask AI to analyze, optimize, or review this code"
                  >
                    <Sparkles size={13} />
                    <span>Analyze with AI</span>
                  </button>
                </div>

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
                  isExpanded={expandedSections.editor}
                  onToggleExpand={() => toggleSection('editor')}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
