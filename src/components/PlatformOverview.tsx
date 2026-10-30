import React from 'react';
import { Layers, BookMarked, BarChart3, Check, ArrowRight } from 'lucide-react';
import './PlatformOverview.css';

export const PlatformOverview: React.FC = () => {
  return (
    <section className="overview-section" id="overview">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Platform Overview</span>
          <h2 className="section-title">Everything You Need to Stay Consistent</h2>
          <p className="section-description">
            AlgoTrack brings your coding practice, learning notes and progress into one organized space.
          </p>
        </div>

        <div className="overview-grid">
          {/* CARD 1 — Organized Practice */}
          <div className="overview-card card-saas">
            <div className="card-top">
              <div className="overview-icon-box orange">
                <Layers size={22} />
              </div>
              <span className="card-pill">Structure</span>
            </div>

            <div className="card-content">
              <h3 className="card-heading">Organized Practice</h3>
              <p className="card-text">
                Explore a curated collection of popular coding interview problems organized by difficulty, topic and algorithmic pattern.
              </p>
            </div>

            {/* Illustrative micro-visual */}
            <div className="overview-visual-box">
              <div className="micro-pills-row">
                <span className="micro-tag diff">Easy • Medium • Hard</span>
                <span className="micro-tag pattern">Sliding Window</span>
                <span className="micro-tag topic">Binary Trees</span>
              </div>
              <div className="micro-tree-item">
                <span className="micro-tree-bullet"></span>
                <span className="micro-tree-text">Blind 75 & Grind 169 Curated Sets</span>
              </div>
            </div>
          </div>

          {/* CARD 2 — Personal Learning */}
          <div className="overview-card card-saas">
            <div className="card-top">
              <div className="overview-icon-box purple">
                <BookMarked size={22} />
              </div>
              <span className="card-pill purple">Retention</span>
            </div>

            <div className="card-content">
              <h3 className="card-heading">Personal Learning</h3>
              <p className="card-text">
                Understand concepts, record your own approaches and save important learning notes for future revision.
              </p>
            </div>

            {/* Illustrative micro-visual */}
            <div className="overview-visual-box">
              <div className="micro-note-preview">
                <div className="note-line header">Approach: Two Pointers with left & right</div>
                <div className="note-meta-badges">
                  <span className="note-badge">Time: O(N)</span>
                  <span className="note-badge">Space: O(1)</span>
                </div>
                <div className="note-line detail">Mistake: Check empty array edge case</div>
              </div>
            </div>
          </div>

          {/* CARD 3 — Progress Tracking */}
          <div className="overview-card card-saas">
            <div className="card-top">
              <div className="overview-icon-box orange">
                <BarChart3 size={22} />
              </div>
              <span className="card-pill">Momentum</span>
            </div>

            <div className="card-content">
              <h3 className="card-heading">Progress Tracking</h3>
              <p className="card-text">
                Track solved problems, monitor your consistency and understand how your coding skills improve over time.
              </p>
            </div>

            {/* Illustrative micro-visual */}
            <div className="overview-visual-box">
              <div className="micro-metric-row">
                <div className="metric-col">
                  <span className="metric-val">142</span>
                  <span className="metric-sub">Solved</span>
                </div>
                <div className="metric-col">
                  <span className="metric-val">18d</span>
                  <span className="metric-sub">Streak</span>
                </div>
                <div className="metric-col">
                  <span className="metric-val">71%</span>
                  <span className="metric-sub">Accuracy</span>
                </div>
              </div>
              <div className="micro-progress-strip">
                <div className="micro-fill" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
