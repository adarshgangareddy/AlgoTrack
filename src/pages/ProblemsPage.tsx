// src/pages/ProblemsPage.tsx
// AlgoTrack — Problem Library UI Refinement

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Filter, 
  ArrowRight,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Code2
} from 'lucide-react';
import { 
  fetchAllProblems, 
  fetchUserProblemProgressBatch, 
  type Problem, 
  type ProblemStatus 
} from '../services/problemService';
import './ProblemsPage.css';

const PROBLEMS_PER_PAGE = 48; // 48 is divisible by 1, 2, 3, and 4 columns for balanced grids

export const ProblemsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, ProblemStatus>>({});
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const list = await fetchAllProblems();
        if (!isMounted) return;
        setProblems(list);

        // Fetch user progress for problems in 1 batch query
        if (user?.id) {
          const statusMap = await fetchUserProblemProgressBatch(user.id);
          if (!isMounted) return;
          setUserStatuses(statusMap);
        }
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Reset page when filters change
  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    setCurrentPage(1);
  };

  const handleStatusChange = (st: string) => {
    setSelectedStatus(st);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Filter problems
  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return problems.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.pattern && p.pattern.toLowerCase().includes(q)) ||
        (p.topics && p.topics.some((t) => t.toLowerCase().includes(q))) ||
        (p.problem_number && p.problem_number.toString().includes(q));

      const matchDiff =
        selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const status = userStatuses[p.id] || 'not_started';
      const matchStatus =
        selectedStatus === 'all' || status === selectedStatus;

      return matchSearch && matchDiff && matchStatus;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedStatus, userStatuses]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filteredProblems.slice(start, start + PROBLEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  const solvedCount = Object.values(userStatuses).filter((s) => s === 'solved').length;
  const attemptedCount = Object.values(userStatuses).filter((s) => s === 'attempted').length;

  return (
    <div className="problems-page-root">
      {/* 1. Header Section */}
      <header className="problems-header-bar">
        <div className="problems-container">
          <div className="problems-header-inner">
            {/* Left: Back & Title */}
            <div className="header-meta-group">
              <Link to="/dashboard" className="header-back-link" title="Return to your dashboard">
                <ArrowLeft size={15} />
                <span>Dashboard</span>
              </Link>

              <div className="header-titles">
                <div className="header-title-row">
                  <h1 className="header-page-title">Problem Library</h1>
                  <span className="header-count-badge">
                    {problems.length > 0 ? `${problems.length.toLocaleString()} Challenges` : 'Curated Library'}
                  </span>
                </div>
                <p className="header-page-subtitle">
                  Practice, track, and master coding challenges with personal workspaces.
                </p>
              </div>
            </div>

            {/* Right: Solved & Attempted Summary Cards */}
            <div className="header-stats-row">
              <div className="summary-stat-card solved">
                <div className="stat-card-icon solved">
                  <CheckCircle2 size={16} />
                </div>
                <div className="stat-card-text">
                  <span className="stat-card-number">{solvedCount}</span>
                  <span className="stat-card-label">Solved</span>
                </div>
              </div>

              <div className="summary-stat-card attempted">
                <div className="stat-card-icon attempted">
                  <Clock size={16} />
                </div>
                <div className="stat-card-text">
                  <span className="stat-card-number">{attemptedCount}</span>
                  <span className="stat-card-label">Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Page Container */}
      <main className="problems-main-layout">
        <div className="problems-container">
          {/* Controls Toolbar: Search + Filter Group */}
          <section className="library-toolbar-card" aria-label="Search and filter challenges">
            <div className="toolbar-search-field">
              <Search size={16} className="search-field-icon" />
              <input
                type="text"
                className="search-field-input"
                placeholder="Search by title, #number (e.g. 1, 15), or topic..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => handleSearchChange('')}
                  title="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="toolbar-filters-group">
              {/* Difficulty Segment */}
              <div className="filter-segment">
                <span className="segment-label">Difficulty:</span>
                <div className="segment-pills-row">
                  {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      className={`filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                      onClick={() => handleDifficultyChange(diff)}
                    >
                      {diff === 'all' ? 'All' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Segment */}
              <div className="filter-segment">
                <span className="segment-label">Status:</span>
                <div className="segment-pills-row">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'solved', label: 'Solved' },
                    { id: 'attempted', label: 'Attempted' },
                    { id: 'not_started', label: 'Todo' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`filter-btn ${selectedStatus === st.id ? 'active' : ''}`}
                      onClick={() => handleStatusChange(st.id)}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Results Summary & Top Pagination Info */}
          <div className="library-meta-bar">
            <span className="results-count-summary">
              Showing <strong>{filteredProblems.length === 0 ? 0 : (currentPage - 1) * PROBLEMS_PER_PAGE + 1}–{Math.min(currentPage * PROBLEMS_PER_PAGE, filteredProblems.length)}</strong> of <strong>{filteredProblems.length.toLocaleString()}</strong> problems
            </span>

            {totalPages > 1 && (
              <div className="compact-pagination-nav">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                  <span>Prev</span>
                </button>

                <span className="pagination-page-status">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* 3. Problem Cards Grid */}
          {loading ? (
            <div className="library-state-panel">
              <Loader2 size={32} className="spin-loader" />
              <p className="state-label">Loading coding challenges...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="library-state-panel empty">
              <div className="state-icon-box">
                <Filter size={24} color="#94A3B8" />
              </div>
              <h3 className="empty-title">No matching problems</h3>
              <p className="empty-description">
                We couldn't find any challenges matching your current search or filter criteria.
              </p>
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="problems-cards-grid">
              {paginatedProblems.map((problem) => {
                const status = userStatuses[problem.id] || 'not_started';
                return (
                  <article
                    key={problem.id}
                    className="problem-card"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Top Row: Problem # & Status */}
                    <div className="problem-card-top">
                      <span className="problem-card-num">
                        {problem.problem_number ? `#${problem.problem_number}` : 'LC'}
                      </span>

                      <div className="problem-card-status">
                        {status === 'solved' && (
                          <span className="status-pill-badge solved">
                            <CheckCircle2 size={11} /> Solved
                          </span>
                        )}
                        {status === 'attempted' && (
                          <span className="status-pill-badge attempted">
                            <Clock size={11} /> Attempted
                          </span>
                        )}
                        {status === 'not_started' && (
                          <span className="status-pill-badge todo">
                            <CircleDot size={11} /> Todo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="problem-card-title" title={problem.title}>
                      {problem.title}
                    </h2>

                    {/* Badges: Difficulty & Pattern */}
                    <div className="problem-card-tags">
                      <span className={`diff-tag ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>

                      {problem.pattern && (
                        <span className="pattern-tag" title={`Algorithmic pattern: ${problem.pattern}`}>
                          {problem.pattern}
                        </span>
                      )}
                    </div>

                    {/* Description (Truncated / Clamped) */}
                    <p className="problem-card-desc">
                      {problem.description || `Master this ${problem.difficulty} level challenge with structured intuition, test cases, and multi-language solutions.`}
                    </p>

                    {/* Card Footer: Action Bar */}
                    <div className="problem-card-footer">
                      <span className="card-workspace-cta">
                        Open Workspace <ArrowRight size={13} className="cta-arrow" />
                      </span>

                      {problem.leetcode_url && (
                        <a
                          href={problem.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-external-link"
                          onClick={(e) => e.stopPropagation()}
                          title="Open challenge on LeetCode"
                          aria-label={`Open ${problem.title} on LeetCode`}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* 4. Bottom Pagination Navigation */}
          {totalPages > 1 && !loading && (
            <div className="library-bottom-pagination">
              <button
                type="button"
                className="pagination-btn large"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                <span>Previous Page</span>
              </button>

              <span className="pagination-bottom-text">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                className="pagination-btn large"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
              >
                <span>Next Page</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
