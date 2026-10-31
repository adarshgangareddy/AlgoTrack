import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  CircleDot,
  Filter,
  ArrowRight,
  Code2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  fetchAllProblems,
  fetchUserProblemProgressBatch,
  type Problem,
  type ProblemStatus
} from '../services/problemService';
import './ProblemsPage.css';

const PROBLEMS_PER_PAGE = 50;

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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDifficulty, selectedStatus]);

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
    <div className="problems-library-page">
      {/* Top Navbar */}
      <header className="library-header">
        <div className="library-header-inner">
          <div className="library-header-left">
            <Link to="/dashboard" className="library-back-btn" title="Back to Dashboard">
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>
            <div className="library-title-group">
              <div className="library-logo-icon">
                <Code2 size={20} color="#0284C7" />
              </div>
              <h1 className="library-title">Problem Library</h1>
              <span className="library-count-badge">
                {problems.length > 0 ? `${problems.length} Problems` : 'Curated Library'}
              </span>
            </div>
          </div>

          <div className="library-header-right">
            <div className="stat-pill-group">
              <span className="user-stat-pill solved" title="Total problems solved">
                <CheckCircle2 size={13} /> {solvedCount} Solved
              </span>
              <span className="user-stat-pill attempted" title="Problems currently in progress">
                <Clock size={13} /> {attemptedCount} Attempted
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="library-main-content">
        {/* Hero Banner */}
        <section className="library-hero-card">
          <div className="library-hero-content">
            <span className="library-hero-label">
              <Sparkles size={14} /> AlgoTrack Comprehensive Practice Library
            </span>
            <h2 className="library-hero-title">Browse & Master 2,900+ LeetCode Challenges</h2>
            <p className="library-hero-desc">
              Explore interview questions by difficulty, topics, and algorithmic patterns. Every problem includes an individual workspace with multi-language code templates, note-taking, complexity analysis, and built-in AI explanation.
            </p>
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className="library-filters-bar">
          <div className="library-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="library-search-input"
              placeholder="Search by problem name, #number (e.g. 1, 15, 200), or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="library-filter-pills-row">
            {/* Difficulty Filter */}
            <div className="filter-pill-cluster">
              <span className="cluster-label">Difficulty:</span>
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`filter-pill-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff === 'all' ? 'All' : diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="filter-pill-cluster">
              <span className="cluster-label">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'solved', label: 'Solved' },
                { id: 'attempted', label: 'Attempted' },
                { id: 'not_started', label: 'Todo' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`filter-pill-btn ${selectedStatus === st.id ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(st.id)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Counter & Pagination Bar */}
        <div className="library-pagination-info-row">
          <span className="results-count-text">
            Showing <strong>{filteredProblems.length === 0 ? 0 : (currentPage - 1) * PROBLEMS_PER_PAGE + 1}–{Math.min(currentPage * PROBLEMS_PER_PAGE, filteredProblems.length)}</strong> of <strong>{filteredProblems.length}</strong> problems
          </span>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="page-nav-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="page-nav-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Problems List / Table */}
        {loading ? (
          <div className="library-loading-state">
            <Loader2 size={32} className="spin-loader" />
            <p>Loading problem library...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="library-empty-state">
            <Filter size={36} color="#94A3B8" />
            <h3>No problems found</h3>
            <p>No challenges match your current search or filters. Try adjusting your query.</p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
                setSelectedStatus('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="problem-cards-grid">
            {paginatedProblems.map((problem) => {
              const status = userStatuses[problem.id] || 'not_started';
              return (
                <div
                  key={problem.id}
                  className={`problem-summary-card status-${status}`}
                  onClick={() => navigate(`/problems/${problem.slug}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-top-row">
                    <div className="prob-num-tag">
                      {problem.problem_number ? `#${problem.problem_number}` : 'LC'}
                    </div>

                    <div className="status-badge-inline">
                      {status === 'solved' && (
                        <span className="badge-solved">
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                      {status === 'attempted' && (
                        <span className="badge-attempted">
                          <Clock size={12} /> Attempted
                        </span>
                      )}
                      {status === 'not_started' && (
                        <span className="badge-not-started">
                          <CircleDot size={12} /> Todo
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="card-problem-title">{problem.title}</h3>

                  <div className="card-meta-row">
                    <span className={`diff-pill-micro ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>

                    {problem.pattern && (
                      <span className="pattern-pill-micro">
                        {problem.pattern}
                      </span>
                    )}
                  </div>

                  {problem.description && (
                    <p className="card-problem-desc">
                      {problem.description.slice(0, 110)}...
                    </p>
                  )}

                  <div className="card-footer-row">
                    <span className="open-workspace-cta">
                      Open Workspace <ArrowRight size={13} />
                    </span>

                    {problem.leetcode_url && (
                      <a
                        href={problem.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-ext-link"
                        onClick={(e) => e.stopPropagation()}
                        title="View on LeetCode"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && !loading && (
          <div className="library-pagination-bottom">
            <button
              type="button"
              className="page-nav-btn"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              <span>Previous Page</span>
            </button>

            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="page-nav-btn"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
            >
              <span>Next Page</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
