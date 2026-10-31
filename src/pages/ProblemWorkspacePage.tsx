import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  FileText, 
  AlertCircle, 
  Loader2,
  Check,
  Code2
} from 'lucide-react';
import { 
  fetchProblemBySlug, 
  fetchAllProblems, 
  fetchUserWorkspace, 
  fetchUserSolutions, 
  fetchUserProblemProgress, 
  saveUserWorkspaceAndProgress,
  STARTER_CODE_TEMPLATES,
  type Problem,
  type ProblemStatus
} from '../services/problemService';
import { CodeEditor } from '../components/workspace/CodeEditor';
import './ProblemWorkspacePage.css';

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Problem & Catalog State
  const [problem, setProblem] = useState<Problem | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Workspace Fields
  const [personalNotes, setPersonalNotes] = useState('');
  const [personalApproach, setPersonalApproach] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [mistakesEdgeCases, setMistakesEdgeCases] = useState('');
  const [problemStatus, setProblemStatus] = useState<ProblemStatus>('not_started');

  // Multi-Language Code Solutions
  const [activeLanguage, setActiveLanguage] = useState<string>('python');
  const [solutionsByLang, setSolutionsByLang] = useState<Record<string, string>>({ ...STARTER_CODE_TEMPLATES });

  // Save State Management
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mobile Active Tab
  const [mobileTab, setMobileTab] = useState<'learning' | 'workspace'>('learning');

  const autosaveTimerRef = useRef<number | null>(null);
  const initialLoadCompletedRef = useRef(false);

  // 1. Load Problem & User Workspace Data
  useEffect(() => {
    let isMounted = true;
    initialLoadCompletedRef.current = false;

    async function loadWorkspace() {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const [catalog, currentProblem] = await Promise.all([
          fetchAllProblems(),
          fetchProblemBySlug(slug)
        ]);

        if (!isMounted) return;
        setAllProblems(catalog);

        if (!currentProblem) {
          setErrorMsg('This problem could not be found.');
          setLoading(false);
          return;
        }

        setProblem(currentProblem);

        // Load authenticated user's workspace
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

    autosaveTimerRef.current = window.setTimeout(() => {
      handleSaveProgress(true);
    }, 2500);
  }, [handleSaveProgress]);

  // Warn before navigating away if unsaved
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

  // Code editor updates for current language
  const handleCodeChange = (newCode: string) => {
    setSolutionsByLang((prev) => ({
      ...prev,
      [activeLanguage]: newCode,
    }));
    markDirtyAndDebounceSave();
  };

  const handleResetTemplate = () => {
    const template = STARTER_CODE_TEMPLATES[activeLanguage] || '';
    handleCodeChange(template);
  };

  // Previous & Next Problem Calculation
  const currentIndex = allProblems.findIndex((p) => p.slug === slug);
  const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex >= 0 && currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="workspace-loading-screen">
        <div className="workspace-spinner-card">
          <Loader2 size={36} className="spinner-anim text-primary" />
          <h2 className="loading-title">Loading Problem Workspace...</h2>
          <p className="loading-sub">Connecting to your personal learning archive</p>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (errorMsg || !problem) {
    return (
      <div className="workspace-error-screen">
        <div className="workspace-error-card card-saas">
          <AlertCircle size={44} className="text-danger" />
          <h2 className="error-title">Problem Not Found</h2>
          <p className="error-desc">{errorMsg || 'The requested coding problem could not be found.'}</p>
          <div className="error-actions">
            <Link to="/problems" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Problem Library</span>
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeCode = solutionsByLang[activeLanguage] ?? (STARTER_CODE_TEMPLATES[activeLanguage] || '');

  return (
    <div className="workspace-page-container">
      {/* 1. TOP NAVIGATION & STATUS BAR */}
      <header className="workspace-header">
        <div className="container-fluid workspace-header-inner">
          {/* Left: Breadcrumbs & Back */}
          <div className="header-left-col">
            <Link to="/problems" className="back-link-btn" title="Back to Problem Library">
              <ArrowLeft size={16} />
              <span className="back-text">Problems</span>
            </Link>

            <span className="header-separator">/</span>

            <div className="problem-ident-badge">
              {problem.problem_number && (
                <span className="prob-num">#{problem.problem_number}</span>
              )}
              <h1 className="problem-header-title">{problem.title}</h1>
            </div>

            <span className={`diff-pill-badge diff-${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Center: Previous / Next Problem Links */}
          <div className="header-center-nav">
            <button
              type="button"
              className="prob-nav-btn"
              disabled={!prevProblem}
              onClick={() => prevProblem && navigate(`/problems/${prevProblem.slug}`)}
              title={prevProblem ? `Previous: ${prevProblem.title}` : 'No previous problem'}
            >
              <ChevronLeft size={16} />
              <span className="nav-btn-text">Previous</span>
            </button>

            <button
              type="button"
              className="prob-nav-btn"
              disabled={!nextProblem}
              onClick={() => nextProblem && navigate(`/problems/${nextProblem.slug}`)}
              title={nextProblem ? `Next: ${nextProblem.title}` : 'No next problem'}
            >
              <span className="nav-btn-text">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right: Problem Status & Save Button */}
          <div className="header-right-actions">
            {/* Status Selector */}
            <div className="status-selector-wrap">
              <label htmlFor="problem-status-select" className="visually-hidden">
                Problem Progress Status
              </label>
              <div className={`status-select-capsule status-${problemStatus}`}>
                {problemStatus === 'solved' && <CheckCircle2 size={14} className="status-icon solved" />}
                {problemStatus === 'attempted' && <Clock size={14} className="status-icon attempted" />}
                {problemStatus === 'not_started' && <CircleDot size={14} className="status-icon not-started" />}
                <select
                  id="problem-status-select"
                  className="status-dropdown"
                  value={problemStatus}
                  onChange={(e) => {
                    setProblemStatus(e.target.value as ProblemStatus);
                    markDirtyAndDebounceSave();
                  }}
                >
                  <option value="not_started">Not Started</option>
                  <option value="attempted">Attempted</option>
                  <option value="solved">Solved</option>
                </select>
              </div>
            </div>

            {/* Save Status Feedback */}
            <div className="save-status-indicator">
              {isSaving ? (
                <span className="saving-text">
                  <Loader2 size={12} className="spinner-anim" /> Saving...
                </span>
              ) : saveSuccessMsg ? (
                <span className="saved-badge">
                  <Check size={12} /> {saveSuccessMsg}
                </span>
              ) : hasUnsavedChanges ? (
                <span className="unsaved-text">Unsaved edits</span>
              ) : lastSavedAt ? (
                <span className="timestamp-text">Saved {formatTimestamp(lastSavedAt)}</span>
              ) : null}
            </div>

            {/* Manual Save Button */}
            <button
              type="button"
              className="btn btn-primary btn-save-progress"
              onClick={() => handleSaveProgress(false)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={15} className="spinner-anim" /> : <Save size={15} />}
              <span>Save My Progress</span>
            </button>
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
            <span>Code & Workspace</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN TWO-COLUMN WORKSPACE BODY */}
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
              <BookOpen size={18} className="text-primary" />
              <h3 className="section-heading">Understand the Concept</h3>
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
                  Theory notes for this challenge will be updated in the curated catalog. Record your personal intuition and findings below!
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
              rows={6}
              value={personalApproach}
              onChange={(e) => {
                setPersonalApproach(e.target.value);
                markDirtyAndDebounceSave();
              }}
              placeholder="Describe how you approached this problem, the steps you followed, and why your solution works..."
            />
          </div>

          {/* Section 8: Time and Space Complexity */}
          <div className="learning-card card-saas">
            <div className="section-title-wrap">
              <Clock size={18} className="text-orange" />
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
            RIGHT COLUMN — Personal Workspace & Code Editor
            ================================================================== */}
        <section
          className={`workspace-column right-editor-col ${mobileTab === 'workspace' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Personal Code Editor and Learning Scratchpad"
        >
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
              <span className="private-note-badge">Private to your account</span>
            </div>
            <p className="field-hint">
              Quick scratchpad for mental models, pattern analogies, or quick reminders.
            </p>
            <textarea
              className="approach-textarea"
              rows={5}
              value={personalNotes}
              onChange={(e) => {
                setPersonalNotes(e.target.value);
                markDirtyAndDebounceSave();
              }}
              placeholder="Write any personal observations, alternative techniques, or interview tips..."
            />
          </div>

          {/* Bottom Floating Save Action Bar */}
          <div className="workspace-bottom-save-bar card-saas">
            <div className="save-bar-info">
              <span className="save-bar-title">Workspace Synchronization</span>
              <span className="save-bar-sub">
                {lastSavedAt ? `Last saved at ${formatTimestamp(lastSavedAt)}` : 'Edits autosaved automatically'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-save-progress"
              onClick={() => handleSaveProgress(false)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={16} className="spinner-anim" /> : <Save size={16} />}
              <span>Save My Progress</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
