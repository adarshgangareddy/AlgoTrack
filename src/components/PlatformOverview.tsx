import React from 'react';
import { Layers, BookMarked, TrendingUp, CheckCircle2 } from 'lucide-react';
import './PlatformOverview.css';

export const PlatformOverview: React.FC = () => {
  return (
    <section className="overview-section" id="overview">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Introduction</span>
          <h2 className="section-title">Your Practice. Your Progress. Your Journey.</h2>
          <p className="section-description">
            AlgoTrack brings coding practice, learning notes and progress tracking into one organized space. Build consistency, recognize algorithmic patterns and make every problem a meaningful learning experience.
          </p>
        </div>

        <div className="overview-grid">
          {/* CARD 1 — Structured Practice */}
          <div className="overview-card card-saas">
            <div className="card-top">
              <div className="overview-icon-box orange">
                <Layers size={22} />
              </div>
              <span className="card-pill">Structure</span>
            </div>

            <div className="card-content">
              <h3 className="card-heading">Structured Practice</h3>
              <p className="card-text">
                Explore a curated collection of coding challenges organized systematically by difficulty, topic and algorithmic pattern.
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
                <span className="micro-tree-text">Curated pattern roadmap & problem sets</span>
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
                Understand core concepts, record your own problem-solving approaches, and save notes for future interview revision.
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
                <div className="note-line detail">Key insight: Validate boundary conditions first</div>
              </div>
            </div>
          </div>

          {/* CARD 3 — Consistent Progress */}
          <div className="overview-card card-saas">
            <div className="card-top">
              <div className="overview-icon-box orange">
                <TrendingUp size={22} />
              </div>
              <span className="card-pill">Momentum</span>
            </div>

            <div className="card-content">
              <h3 className="card-heading">Consistent Progress</h3>
              <p className="card-text">
                Build steady practice habits, monitor your milestones, and see how your algorithmic intuition compounds over time.
              </p>
            </div>

            {/* Illustrative micro-visual: qualitative habit momentum */}
            <div className="overview-visual-box">
              <div className="micro-habit-row">
                <div className="habit-step">
                  <CheckCircle2 size={15} className="text-orange" />
                  <span className="habit-label">Daily Problem Solved</span>
                </div>
                <div className="habit-step">
                  <CheckCircle2 size={15} className="text-purple" />
                  <span className="habit-label">Notes Documented</span>
                </div>
                <div className="habit-step">
                  <CheckCircle2 size={15} className="text-gold" />
                  <span className="habit-label">Pattern Mastered</span>
                </div>
              </div>
              <div className="micro-progress-strip">
                <div className="micro-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
