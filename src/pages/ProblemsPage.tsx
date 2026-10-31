import React, { useState, useEffect } from 'react';
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
  BookOpen, 
  ArrowRight,
  Code2,
  Loader2
} from 'lucide-react';
import { 
  fetchAllProblems, 
  fetchUserProblemProgress, 
  type Problem, 
  type ProblemStatus 
} from '../services/problemService';
import './ProblemsPage.css';

export const ProblemsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, ProblemStatus>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const list = await fetchAllProblems();
        if (!isMounted) return;
        setProblems(list);

        // Fetch user progress for problems
        if (user?.id) {
          const statusPromises = list.map(async (p) => {
            const status = await fetchUserProblemProgress(user.id, p.id);
            return { id: p.id, status };
          });
          const results = await Promise.all(statusPromises);
          if (!isMounted) return;
          const statusMap: Record<string, ProblemStatus> = {};
          results.forEach((r) => {
            statusMap[r.id] = r.status;
          });
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

  // Filter problems
  const filteredProblems = problems.filter((p) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.pattern && p.pattern.toLowerCase().includes(q)) ||
      (p.topics && p.topics.some((t) => t.toLowerCase().includes(q))) ||
      (p.problem_number && p.problem_number.toString().includes(q));

    // Difficulty
    const matchDiff =
      selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    // Status
    const status = userStatuses[p.id] || 'not_started';
    const matchStatus =
      selectedStatus === 'all' || status === selectedStatus;

    return matchSearch && matchDiff && matchStatus;
  });

  return (
    <div className="problems-library-page">
      {/* Header */}
      <header className="library-header">
        <div className="container library-header-container">
          <div className="library-header-left">
            <Link to="/dashboard" className="library-back-btn" title="Back to Dashboard">
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>
            <div className="library-title-group">
              <div className="library-tag-pill">
                <Sparkles size={12} className="text-orange" />
                <span>Phase 4 & 5 Curated Library</span>
              </div>
              <h1 className="library-main-heading">Problem Library & Workspaces</h1>
            </div>
          </div>

          <div className="library-header-stats">
            <div className="library-stat-chip">
              <span className="stat-chip-num">{problems.length}</span>
              <span className="stat-chip-label">Curated Challenges</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container library-content-container">
        {/* Search & Filter Bar */}
        <div className="library-filter-panel card-saas">
          {/* Search Box */}
          <div className="library-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="library-search-input"
              placeholder="Search problems by title, topic, pattern, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="filters-row">
            {/* Difficulty Tabs */}
            <div className="filter-group">
              <span className="filter-label">
                <Filter size={13} />
                <span>Difficulty</span>
              </span>
              <div className="filter-pills">
                {['all', 'easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={`filter-pill-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <span className="filter-label">
                <span>Status</span>
              </span>
              <div className="filter-pills">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'not_started', label: 'Not Started' },
                  { id: 'attempted', label: 'Attempted' },
                  { id: 'solved', label: 'Solved' },
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
          </div>
        </div>

        {/* Problems List / Table */}
        {loading ? (
          <div className="library-loading-box card-saas">
            <Loader2 size={32} className="spinner-anim text-primary" />
            <p>Loading curated problems...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="library-empty-box card-saas">
            <BookOpen size={40} className="text-muted" />
            <h3>No problems found</h3>
            <p>Try adjusting your search query or difficulty filters.</p>
            <button
              type="button"
              className="btn btn-secondary"
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
          <div className="problems-table-wrapper card-saas">
            <div className="problems-table-header">
              <span className="col-num">#</span>
              <span className="col-title">Problem Title</span>
              <span className="col-diff">Difficulty</span>
              <span className="col-pattern">Pattern / Topic</span>
              <span className="col-status">Your Status</span>
              <span className="col-action">Action</span>
            </div>

            <div className="problems-table-body">
              {filteredProblems.map((prob) => {
                const status = userStatuses[prob.id] || 'not_started';

                return (
                  <div
                    key={prob.id}
                    className="problem-row-item"
                    onClick={() => navigate(`/problems/${prob.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/problems/${prob.slug}`);
                    }}
                  >
                    <span className="col-num prob-id-txt">
                      {prob.problem_number ? `#${prob.problem_number}` : '—'}
                    </span>

                    <div className="col-title prob-title-box">
                      <span className="prob-title-text">{prob.title}</span>
                      {prob.leetcode_url && (
                        <a
                          href={prob.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leetcode-link-icon"
                          onClick={(e) => e.stopPropagation()}
                          title="Open on LeetCode"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <span className="col-diff">
                      <span className={`diff-tag-pill ${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                    </span>

                    <span className="col-pattern pattern-text">
                      {prob.pattern || 'Algorithmic Pattern'}
                    </span>

                    <span className="col-status">
                      <span className={`status-badge-chip ${status}`}>
                        {status === 'solved' && <CheckCircle2 size={13} />}
                        {status === 'attempted' && <Clock size={13} />}
                        {status === 'not_started' && <CircleDot size={13} />}
                        <span>
                          {status === 'solved'
                            ? 'Solved'
                            : status === 'attempted'
                            ? 'Attempted'
                            : 'Not Started'}
                        </span>
                      </span>
                    </span>

                    <span className="col-action">
                      <Link
                        to={`/problems/${prob.slug}`}
                        className="workspace-link-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Code2 size={14} />
                        <span>Workspace</span>
                        <ArrowRight size={13} />
                      </Link>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

