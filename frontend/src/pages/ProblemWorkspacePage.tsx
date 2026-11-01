// src/pages/ProblemWorkspacePage.tsx
// AlgoTrack: LeetCode-Inspired Problem Workspace with Top Horizontal Tabs, Resizable Split & Maximize Code Support

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
  Compass, 
  RotateCcw,
  Search,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  History,
  Play
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
import { 
  getProblemStarterTemplate, 
  getAllStarterTemplatesForProblem 
} from '../services/codeTemplates';
import { MonacoCodeEditor } from '../components/workspace/MonacoCodeEditor';
import { AIAssistant } from '../components/workspace/AIAssistant';
import { TestcasesPanel } from '../components/workspace/TestcasesPanel';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import './ProblemWorkspacePage.css';

export type LeftWorkspaceTab = 'description' | 'ai' | 'approach' | 'notes';

const STORAGE_KEYS = {
  H_SPLIT: 'algotrack_ws_h_split',
  V_SPLIT: 'algotrack_ws_v_split',
  ACTIVE_TAB: 'algotrack_ws_active_tab',
  LEFT_COLLAPSED: 'algotrack_ws_left_collapsed',
};

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Profile dropdown in header
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Coder';
  const displayEmail = profile?.email || user?.email || '';

  const getInitials = (name?: string) => {
    if (!name) return 'AT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Problem definition state
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Left Horizontal Tab (LeetCode Style)
  const [activeLeftTab, setActiveLeftTab] = useState<LeftWorkspaceTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as LeftWorkspaceTab;
    return (['description', 'ai', 'approach', 'notes'].includes(saved)) ? saved : 'description';
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
  const [hSplitPercent, setHSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.H_SPLIT);
    return saved ? Math.max(25, Math.min(75, parseFloat(saved))) : 46;
  });

  const [vSplitPercent, setVSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.V_SPLIT);
    return saved ? Math.max(25, Math.min(85, parseFloat(saved))) : 65;
  });

  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);

  // Layout expansion states
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.LEFT_COLLAPSED) === 'true';
  });
  const [isCodeEditorMaximized, setIsCodeEditorMaximized] = useState(false);
  const [isTestcasesCollapsed, setIsTestcasesCollapsed] = useState(false);

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
    setMobileActiveTab('content');
  };

  // Toggle left panel collapse
  const handleToggleLeftCollapse = () => {
    setIsLeftCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.LEFT_COLLAPSED, String(next));
      return next;
    });
  };

  // Reset panels layout to defaults
  const handleResetLayout = () => {
    setHSplitPercent(46);
    setVSplitPercent(65);
    setIsLeftCollapsed(false);
    setIsCodeEditorMaximized(false);
    setIsTestcasesCollapsed(false);
    localStorage.setItem(STORAGE_KEYS.H_SPLIT, '46');
    localStorage.setItem(STORAGE_KEYS.V_SPLIT, '65');
    localStorage.setItem(STORAGE_KEYS.LEFT_COLLAPSED, 'false');
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
        const offsetX = e.clientX - rect.left;
        const newPercent = Math.max(25, Math.min(75, (offsetX / rect.width) * 100));
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
            fetchUserSolutions(user.id, currentProblem.id, currentProblem),
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
        } else {
          // Unauthenticated/guest mode: load authentic LeetCode starter templates for this problem
          setSolutionsByLang(getAllStarterTemplatesForProblem(currentProblem));
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

  // Reset current language template to authentic LeetCode template
  const handleResetTemplate = () => {
    if (!problem) return;
    const template = getProblemStarterTemplate(problem, activeLanguage);
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

  const activeCode = solutionsByLang[activeLanguage] ?? 
    (problem ? getProblemStarterTemplate(problem, activeLanguage) : (STARTER_CODE_TEMPLATES[activeLanguage] || ''));

  // Authentic problem examples and constraints - mapped strictly per problem without Two Sum fallbacks
  const problemExamples = problem.examples || [];
  const problemConstraints = problem.constraints || [];

  return (
    <div className="workspace-page-container">
      {/* ==================================================================
          1. FIXED GLOBAL WORKSPACE NAVBAR (LeetCode-Inspired Top Header)
          ================================================================== */}
      <header className="workspace-header">
        <div className="workspace-header-inner">
          {/* Left: Brand Logo (Links to /dashboard), Problem List link, Prev/Next, Title Badge */}
          <div className="header-left-group">
            {/* Logo directly redirects to /dashboard */}
            <Link to="/dashboard" className="ws-brand-logo" title="AlgoTrack Dashboard">
              <div className="ws-brand-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#18181B" />
                  <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#0284C7" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1.75" strokeLinejoin="round" />
                  <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                  <circle cx="15" cy="12" r="1.5" fill="#0284C7" />
                  <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                  <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                  <path d="M15 12H18" stroke="#F97316" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx="18" cy="12" r="1.75" fill="#F97316" />
                </svg>
              </div>
              <span className="ws-brand-title">AlgoTrack</span>
            </Link>

            <span className="ws-nav-pipe">|</span>

            {/* Back to Problems Button */}
            <Link to="/problems" className="ws-problem-list-link" title="Return to Problems Library">
              <ChevronLeft size={14} />
              <span>Problems</span>
            </Link>

            {/* Previous and Next Navigation Arrows */}
            <div className="ws-seq-nav-group">
              <button
                type="button"
                className="ws-seq-btn"
                onClick={handleNavPrevious}
                disabled={!problem.problem_number || problem.problem_number <= 1}
                title="Previous problem in sequence"
                aria-label="Previous Problem"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                className="ws-seq-btn"
                onClick={handleNavNext}
                disabled={!problem.problem_number}
                title="Next problem in sequence"
                aria-label="Next Problem"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <span className="ws-nav-pipe">|</span>

            {/* Problem Identifier Badge */}
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

          {/* Right: Status Selector, Save Progress, Search, Reset Layout, User Dropdown, Mobile Menu */}
          <div className="header-right-actions">
            {/* Problem Status Selector in Global Navbar */}
            <div className="ws-header-status-wrap">
              <select
                className={`ws-header-status-select ${problemStatus}`}
                value={problemStatus}
                onChange={(e) => handleStatusChange(e.target.value as ProblemStatus)}
                title="Update problem status"
                aria-label="Problem Status"
              >
                <option value="not_started">Todo</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
            </div>

            {/* Save Progress Button in Global Navbar */}
            <div className="ws-header-save-group">
              {lastSavedAt && (
                <span className="ws-header-saved-tag" title={`Saved at ${formatSavedTime(lastSavedAt)}`}>
                  <Check size={11} color="#10B981" />
                  <span className="ws-saved-time-text">{formatSavedTime(lastSavedAt)}</span>
                </span>
              )}
              <button
                type="button"
                className="ws-header-btn-save"
                onClick={() => handleSaveProgress(false)}
                disabled={isSaving}
                title="Save solution and notes (Ctrl+S)"
              >
                {isSaving ? <Loader2 size={13} className="spin-icon" /> : <Save size={13} />}
                <span className="ws-header-save-label">{isSaving ? 'Saving' : 'Save'}</span>
              </button>
            </div>

            <span className="ws-nav-pipe desktop-only">|</span>

            {/* Search Symbol + Name Trigger */}
            <button
              type="button"
              className="ws-nav-search-btn desktop-only"
              onClick={() => navigate('/problems')}
              title="Search challenges and topics (Ctrl+K)"
            >
              <Search size={14} />
              <span className="ws-search-text">Search</span>
            </button>

            {/* Reset Split Layout */}
            <button
              type="button"
              className="ws-btn-layout-reset desktop-only"
              onClick={handleResetLayout}
              title="Reset workspace panels to default layout"
            >
              <RotateCcw size={13} />
            </button>

            {/* User Account Menu with Direct Profile Link & Dropdown */}
            <div className="ws-user-menu-wrapper" ref={dropdownRef}>
              <div className="ws-user-pill-wrap">
                <Link
                  to="/profile"
                  className="ws-avatar-circle-link"
                  title="Open My Profile & Analytics"
                >
                  <div className="ws-avatar-circle">
                    {getInitials(displayName)}
                  </div>
                </Link>

                <button
                  type="button"
                  className="ws-user-avatar-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  title="User account menu"
                >
                  <ChevronDown size={12} className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`} />
                </button>
              </div>

              {profileDropdownOpen && (
                <div className="ws-user-dropdown-card">
                  <div className="dropdown-user-info">
                    <span className="user-name">{displayName}</span>
                    <span className="user-email">{displayEmail}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link 
                    to="/profile" 
                    className="dropdown-menu-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User size={14} />
                    <span>My Profile & Analytics</span>
                  </Link>

                  <Link 
                    to="/dashboard" 
                    className="dropdown-menu-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>

                  <Link 
                    to="/problems" 
                    className="dropdown-menu-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Code2 size={14} />
                    <span>Problems Library</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    type="button"
                    className="dropdown-menu-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile 3-Lines Hamburger Button */}
            <button
              type="button"
              className="ws-mobile-hamburger-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              title="Open Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher (Segmented Control, visible only below 1024px) */}
      <div className="workspace-mobile-bar">
        <div className="workspace-mobile-segmented">
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
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
          <>
            <div 
              className="ws-mobile-drawer-backdrop" 
              onClick={() => setMobileDrawerOpen(false)} 
              aria-hidden="true" 
            />
            <div className="ws-mobile-drawer" role="dialog" aria-modal="true" aria-label="Workspace Navigation Drawer">
              <div className="ws-drawer-top">
                <Link to="/dashboard" className="ws-drawer-brand" onClick={() => setMobileDrawerOpen(false)}>
                  <div className="ws-brand-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="#18181B" />
                      <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#0284C7" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1.75" strokeLinejoin="round" />
                      <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                      <circle cx="15" cy="12" r="1.5" fill="#0284C7" />
                      <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                      <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                      <path d="M15 12H18" stroke="#F97316" strokeWidth="1.75" strokeLinecap="round" />
                      <circle cx="18" cy="12" r="1.75" fill="#F97316" />
                    </svg>
                  </div>
                  <span className="ws-brand-title">AlgoTrack</span>
                </Link>
                <button
                  type="button"
                  className="ws-drawer-close-btn"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Card */}
              <Link 
                to="/profile" 
                className="ws-drawer-profile-card"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <div className="ws-avatar-circle">
                  {getInitials(displayName)}
                </div>
                <div className="ws-drawer-user-info">
                  <span className="drawer-user-name">{displayName}</span>
                  <span className="drawer-user-email">{displayEmail}</span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="ws-drawer-nav">
                <Link 
                  to="/dashboard" 
                  className="ws-drawer-link"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  to="/problems" 
                  className="ws-drawer-link"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <Code2 size={18} />
                  <span>Problems Library</span>
                </Link>

                <Link 
                  to="/dashboard#recent-activity" 
                  className="ws-drawer-link"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <History size={18} />
                  <span>Problems History</span>
                </Link>

                <Link 
                  to="/profile" 
                  className="ws-drawer-link"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <User size={18} />
                  <span>My Profile & Analytics</span>
                </Link>
              </nav>

              <div className="ws-drawer-footer">
                <button
                  type="button"
                  className="ws-drawer-logout-btn"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </>
        )}

      {/* ==================================================================
          2. MAIN WORKSPACE VIEWPORT (Top Tabs on Left Panel + Right Coding Cards)
          ================================================================== */}
      <main className="workspace-main-viewport" ref={mainContainerRef}>
        {/* ================================================================
            A. LEFT PROBLEM PANEL (LeetCode-style Top Horizontal Tabs)
            ================================================================ */}
        {!isLeftCollapsed && (
          <section 
            className={`workspace-left-panel ${mobileActiveTab === 'content' ? 'mobile-visible' : 'mobile-hidden'}`}
            style={{ width: `${hSplitPercent}%` }}
            aria-label="Problem Learning Panel"
          >
            {/* Top Horizontal Tabs Header (LeetCode Style) */}
            <div className="left-panel-tab-bar">
              <div className="left-tabs-group">
                <button
                  type="button"
                  className={`left-tab-btn ${activeLeftTab === 'description' ? 'active' : ''}`}
                  onClick={() => handleTabChange('description')}
                >
                  <BookOpen size={14} />
                  <span>Description</span>
                </button>

                <button
                  type="button"
                  className={`left-tab-btn ai-tab ${activeLeftTab === 'ai' ? 'active' : ''}`}
                  onClick={() => handleTabChange('ai')}
                >
                  <Sparkles size={14} />
                  <span>AI Tutor</span>
                </button>

                <button
                  type="button"
                  className={`left-tab-btn ${activeLeftTab === 'approach' ? 'active' : ''}`}
                  onClick={() => handleTabChange('approach')}
                >
                  <Compass size={14} />
                  <span>My Approach</span>
                </button>

                <button
                  type="button"
                  className={`left-tab-btn ${activeLeftTab === 'notes' ? 'active' : ''}`}
                  onClick={() => handleTabChange('notes')}
                >
                  <FileText size={14} />
                  <span>Personal Notes</span>
                </button>
              </div>

              {/* Collapse Left Panel Action */}
              <div className="left-tab-actions">
                <button
                  type="button"
                  className="left-collapse-btn"
                  onClick={handleToggleLeftCollapse}
                  title="Collapse problem description to maximize code area"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="left-panel-content-body">
              {/* TAB 1: DESCRIPTION */}
              {activeLeftTab === 'description' && (
                <div className="tab-pane-content tab-description-pane">
                  <div className="desc-header-row">
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

                  {/* Problem Statement */}
                  {problem.description && (
                    <div className="desc-statement-block">
                      <MarkdownRenderer content={problem.description} />
                    </div>
                  )}

                  {/* Examples Section */}
                  {problemExamples.length > 0 && (
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
                  )}

                  {/* Constraints Section */}
                  {problemConstraints.length > 0 && (
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
                  )}

                  {/* LeetCode Challenge Runner Link */}
                  {problem.leetcode_url && (
                    <div className="desc-leetcode-callout">
                      <div className="desc-leetcode-info">
                        <span className="desc-callout-tag">Official Challenge Runner</span>
                        <p className="desc-callout-desc">
                          Test and submit against official test suites on LeetCode, then record your best solution here.
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

              {/* TAB 2: AI TUTOR (Kept mounted to preserve conversation state across tab switches) */}
              <div 
                className="tab-pane-content tab-ai-pane"
                style={{ 
                  display: activeLeftTab === 'ai' ? 'flex' : 'none',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
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

              {/* TAB 4: MY APPROACH */}
              {activeLeftTab === 'approach' && (
                <div className="tab-pane-content tab-approach-pane">
                  <div className="tab-section-header">
                    <div className="tab-heading-wrap">
                      <Compass size={17} color="#0284C7" />
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

              {/* TAB 5: PERSONAL NOTES */}
              {activeLeftTab === 'notes' && (
                <div className="tab-pane-content tab-notes-pane">
                  <div className="tab-section-header">
                    <div className="tab-heading-wrap">
                      <FileText size={17} color="#0284C7" />
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
            </div>
          </section>
        )}

        {/* Slim Expand Strip when Left Panel is Collapsed */}
        {isLeftCollapsed && (
          <div 
            className="left-collapsed-restore-strip"
            onClick={handleToggleLeftCollapse}
            title="Expand problem panel"
          >
            <ChevronRight size={16} />
            <span className="collapsed-strip-text">Problem</span>
          </div>
        )}

        {/* Horizontal Drag Divider between Left & Right */}
        {!isLeftCollapsed && (
          <div 
            className={`workspace-h-resizer ${isDraggingH ? 'active' : ''}`}
            onMouseDown={handleHMouseDown}
            title="Drag horizontally to resize Left vs Right"
          >
            <div className="resizer-handle-pill"></div>
          </div>
        )}

        {/* ================================================================
            B. RIGHT CODING WORKSPACE (Monaco Editor Card + Testcases Card + Action Footer)
            ================================================================ */}
        <section 
          className={`workspace-right-panel ${mobileActiveTab === 'code' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{ width: isLeftCollapsed ? '100%' : `${100 - hSplitPercent}%` }}
          ref={rightColumnRef}
          aria-label="Code Editor and Testcases Workspace"
        >
          <div className="right-panel-workspace-body">
            {/* Top Card: Monaco Code Editor */}
            <div 
              className="code-editor-card"
              style={{ 
                height: isCodeEditorMaximized 
                  ? '100%' 
                  : isTestcasesCollapsed 
                    ? 'calc(100% - 38px)' 
                    : `${vSplitPercent}%` 
              }}
            >
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
                isMaximized={isCodeEditorMaximized}
                onToggleMaximize={() => setIsCodeEditorMaximized(!isCodeEditorMaximized)}
                savedTime={formatSavedTime(lastSavedAt)}
              />
            </div>

            {/* Vertical Split Divider (Hidden when Editor is Maximized or Testcase Collapsed) */}
            {!isCodeEditorMaximized && !isTestcasesCollapsed && (
              <div 
                className={`workspace-v-resizer ${isDraggingV ? 'active' : ''}`}
                onMouseDown={handleVMouseDown}
                title="Drag vertically to resize Editor vs Testcases"
              >
                <div className="v-resizer-handle-pill"></div>
              </div>
            )}

            {/* Bottom Card: Testcases Panel */}
            {!isCodeEditorMaximized && (
              <div 
                className="testcases-card"
                style={{ 
                  height: isTestcasesCollapsed 
                    ? '38px' 
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
          </div>

          {/* ==============================================================
              STATUS & SAVE PROGRESS CONTROLS (Moved to RIGHT SIDE)
              ============================================================== */}
          <footer className="problem-dashboard-footer" aria-label="Problem Status and Progress Controls">
            {/* Left: Problem Status Dropdown */}
            <div className="pdf-status-group">
              <span className="pdf-status-label">Status:</span>
              <div className="ws-status-select-wrap">
                <select
                  id="ws-status-select"
                  className={`ws-status-dropdown ${problemStatus}`}
                  value={problemStatus}
                  onChange={(e) => handleStatusChange(e.target.value as ProblemStatus)}
                  title="Change problem status"
                >
                  <option value="not_started">⚪ Todo</option>
                  <option value="attempted">🟡 Attempted</option>
                  <option value="solved">🟢 Solved</option>
                </select>
              </div>
            </div>

            {/* Right: Run / Submit Placeholders + Autosave status + Save button + LeetCode link */}
            <div className="pdf-actions-group">
              <button
                type="button"
                className="ws-btn ws-btn-run"
                disabled
                title="Run code against sample test cases (coming soon)"
              >
                <Play size={12} fill="currentColor" />
                <span>Run</span>
              </button>

              <button
                type="button"
                className="ws-btn ws-btn-submit"
                disabled
                title="Submit solution (coming soon)"
              >
                <Check size={13} />
                <span>Submit</span>
              </button>

              {isSaving ? (
                <span className="ws-save-indicator saving">
                  <Loader2 size={12} className="spin-icon" /> Saving...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="ws-save-indicator unsaved">
                  <span className="unsaved-dot"></span> Unsaved changes
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
                <span>Save Progress</span>
              </button>

              {saveSuccessMsg && (
                <div className="ws-save-toast">
                  <Check size={12} /> {saveSuccessMsg}
                </div>
              )}

              {problem.leetcode_url && (
                <a
                  href={problem.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ws-btn ws-btn-leetcode"
                  title="Open official challenge runner on LeetCode"
                >
                  <span>LeetCode</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};
