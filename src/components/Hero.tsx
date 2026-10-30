import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  Flame, 
  FileEdit, 
  Layers
} from 'lucide-react';
import './Hero.css';

interface HeroProps {
  onStartJourneyClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourneyClick }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'solved' | 'in-progress'>('all');

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const previewProblems = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      diffClass: 'diff-easy',
      topic: 'Arrays & Hashing',
      pattern: 'Two Pointers',
      status: 'Solved',
      statusClass: 'status-solved',
      notesCount: 2,
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      diffClass: 'diff-med',
      topic: 'Strings',
      pattern: 'Sliding Window',
      status: 'Solved',
      statusClass: 'status-solved',
      notesCount: 1,
    },
    {
      id: 146,
      title: 'LRU Cache Design',
      difficulty: 'Medium',
      diffClass: 'diff-med',
      topic: 'Linked Lists',
      pattern: 'Hash Table + DLL',
      status: 'In Progress',
      statusClass: 'status-progress',
      notesCount: 3,
    },
    {
      id: 42,
      title: 'Trapping Rain Water',
      difficulty: 'Hard',
      diffClass: 'diff-hard',
      topic: 'Arrays & Two Pointers',
      pattern: 'Two Pointers / Stack',
      status: 'In Progress',
      statusClass: 'status-progress',
      notesCount: 1,
    },
  ];

  const filteredProblems = selectedTab === 'all' 
    ? previewProblems 
    : selectedTab === 'solved'
    ? previewProblems.filter(p => p.status === 'Solved')
    : previewProblems.filter(p => p.status === 'In Progress');

  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Hero Top Copy */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span className="hero-badge-text">Personal Coding Interview & Pattern Tracker</span>
          </div>

          <h1 className="hero-headline">
            Your Coding Journey, <span className="highlight-text">Organized.</span>
          </h1>

          <p className="hero-description">
            Master coding interviews one problem at a time. Practice popular coding challenges, 
            understand algorithmic patterns and keep track of every step of your progress.
          </p>

          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn btn-primary btn-lg"
              onClick={onStartJourneyClick}
            >
              <span>Start Your Journey</span>
              <ArrowRight size={18} />
            </button>

            <a 
              href="#features" 
              className="btn btn-secondary btn-lg"
              onClick={scrollToFeatures}
            >
              <span>Explore Features</span>
            </a>
          </div>

          <div className="hero-trust-indicators">
            <div className="trust-item">
              <span className="trust-number">400+</span>
              <span className="trust-label">Curated Problems</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">16+</span>
              <span className="trust-label">Algorithmic Patterns</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">100%</span>
              <span className="trust-label">Personal Control</span>
            </div>
          </div>
        </div>

        {/* Visual Product Preview Mockup (Equa Inspired) */}
        <div className="hero-preview-wrapper" aria-label="AlgoTrack Platform Preview">
          <div className="preview-top-flag">
            <span className="preview-flag-pill">
              <Sparkles size={13} className="text-orange" />
              <span>Illustrative Product Preview</span>
            </span>
          </div>

          <div className="hero-mockup-frame">
            {/* Mockup App Bar */}
            <div className="mockup-header">
              <div className="mockup-header-left">
                <div className="window-dots" aria-hidden="true">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="mockup-workspace-pill">
                  <span className="workspace-status"></span>
                  <span className="workspace-title">AlgoTrack / Blind 75 & Grind 169</span>
                </div>
              </div>

              <div className="mockup-search-bar">
                <Search size={14} className="search-icon" />
                <span className="search-placeholder">Filter by topic, pattern or difficulty...</span>
                <span className="search-shortcut">⌘K</span>
              </div>
            </div>

            {/* Mockup Dashboard Body */}
            <div className="mockup-body">
              {/* Top Stats Cards Row */}
              <div className="mockup-stats-grid">
                {/* Total Solved Card */}
                <div className="mockup-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Overall Progress</span>
                    <span className="stat-pill">35.5%</span>
                  </div>
                  <div className="stat-card-value">
                    <span className="number-solved">142</span>
                    <span className="number-total">/ 400</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-segment segment-easy" style={{ width: '48%' }}></div>
                    <div className="progress-segment segment-med" style={{ width: '40%' }}></div>
                    <div className="progress-segment segment-hard" style={{ width: '12%' }}></div>
                  </div>
                  <div className="stat-card-caption">Problems solved across all tiers</div>
                </div>

                {/* Difficulty Breakup Card */}
                <div className="mockup-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Difficulty Tiers</span>
                    <Layers size={14} className="text-muted" />
                  </div>
                  <div className="difficulty-bars-stack">
                    <div className="diff-bar-item">
                      <div className="diff-bar-label">
                        <span className="diff-name diff-easy-text">Easy</span>
                        <span className="diff-count">68 / 90 (75%)</span>
                      </div>
                      <div className="diff-bar-bg">
                        <div className="diff-bar-fill fill-easy" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="diff-bar-item">
                      <div className="diff-bar-label">
                        <span className="diff-name diff-med-text">Medium</span>
                        <span className="diff-count">58 / 210 (27%)</span>
                      </div>
                      <div className="diff-bar-bg">
                        <div className="diff-bar-fill fill-med" style={{ width: '27%' }}></div>
                      </div>
                    </div>
                    <div className="diff-bar-item">
                      <div className="diff-bar-label">
                        <span className="diff-name diff-hard-text">Hard</span>
                        <span className="diff-count">16 / 100 (16%)</span>
                      </div>
                      <div className="diff-bar-bg">
                        <div className="diff-bar-fill fill-hard" style={{ width: '16%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consistency Streak Card */}
                <div className="mockup-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Consistency Streak</span>
                    <span className="streak-badge">
                      <Flame size={13} />
                      <span>18 Days</span>
                    </span>
                  </div>
                  <div className="stat-card-value">
                    <span className="number-solved">4 Problems</span>
                    <span className="number-total">today</span>
                  </div>
                  <div className="mini-streak-dots">
                    <div className="streak-dot active" title="Monday">M</div>
                    <div className="streak-dot active" title="Tuesday">T</div>
                    <div className="streak-dot active" title="Wednesday">W</div>
                    <div className="streak-dot active" title="Thursday">T</div>
                    <div className="streak-dot active" title="Friday">F</div>
                    <div className="streak-dot active" title="Saturday">S</div>
                    <div className="streak-dot current" title="Sunday">S</div>
                  </div>
                  <div className="stat-card-caption">Current week target: 92% met</div>
                </div>
              </div>

              {/* Problem Library Preview Table */}
              <div className="mockup-table-section">
                <div className="table-filter-bar">
                  <div className="table-tabs">
                    <button 
                      type="button" 
                      className={`table-tab ${selectedTab === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('all')}
                    >
                      All Problems (4)
                    </button>
                    <button 
                      type="button" 
                      className={`table-tab ${selectedTab === 'solved' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('solved')}
                    >
                      Solved (2)
                    </button>
                    <button 
                      type="button" 
                      className={`table-tab ${selectedTab === 'in-progress' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('in-progress')}
                    >
                      In Progress (2)
                    </button>
                  </div>
                  <div className="table-actions">
                    <span className="topic-pill-hint">Filter: Arrays, Sliding Window</span>
                  </div>
                </div>

                <div className="mockup-problems-list">
                  {filteredProblems.map((problem) => (
                    <div key={problem.id} className="mockup-problem-row">
                      <div className="problem-cell-status">
                        {problem.status === 'Solved' ? (
                          <CheckCircle2 size={16} className="icon-solved" />
                        ) : (
                          <Clock size={16} className="icon-progress" />
                        )}
                      </div>

                      <div className="problem-cell-main">
                        <span className="problem-id">#{problem.id}</span>
                        <span className="problem-title">{problem.title}</span>
                      </div>

                      <div className="problem-cell-diff">
                        <span className={`diff-tag ${problem.diffClass}`}>{problem.difficulty}</span>
                      </div>

                      <div className="problem-cell-meta">
                        <span className="topic-badge">{problem.topic}</span>
                        <span className="pattern-badge">{problem.pattern}</span>
                      </div>

                      <div className="problem-cell-notes">
                        <span className="notes-indicator">
                          <FileEdit size={13} />
                          <span>{problem.notesCount} {problem.notesCount === 1 ? 'note' : 'notes'}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mockup-footer-note">
                  <span>Showing 4 of 400 curated practice problems</span>
                  <span className="footer-link-hint">Official LeetCode links & personal notes attached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
