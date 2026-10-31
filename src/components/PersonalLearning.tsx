import React from 'react';
import { BookOpen, FileCode2, Clock, NotebookPen } from 'lucide-react';
import './PersonalLearning.css';

export const PersonalLearning: React.FC = () => {
  return (
    <section className="learning-section" id="learning">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Learn Your Way</span>
          <h2 className="section-title">Don't Just Solve Problems. Understand Them.</h2>
          <p className="section-description">
            Every problem is an opportunity to learn. AlgoTrack gives you a personal space to understand concepts, record your approach, analyze complexity and revisit important lessons.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="learning-features-grid">
          {/* Card 1: Theory and Concept Notes */}
          <div className="learning-card card-saas">
            <div className="learning-card-top">
              <div className="learning-icon-box orange">
                <BookOpen size={22} />
              </div>
              <span className="card-pill">Theory</span>
            </div>

            <div className="learning-card-content">
              <h3 className="learning-card-title">Theory and Concept Notes</h3>
              <p className="learning-card-desc">
                Review fundamental pattern principles, algorithmic edge cases, and core mental models before jumping into problem solving.
              </p>
            </div>

            <div className="learning-micro-visual">
              <div className="concept-pill-group">
                <span className="concept-tag">Pattern Invariant</span>
                <span className="concept-tag">Base Cases</span>
              </div>
              <div className="concept-line">
                <span className="concept-bullet"></span>
                <span className="concept-text">Internalize the underlying principle behind the solution</span>
              </div>
            </div>
          </div>

          {/* Card 2: Personal Problem-Solving Approach */}
          <div className="learning-card card-saas">
            <div className="learning-card-top">
              <div className="learning-icon-box purple">
                <FileCode2 size={22} />
              </div>
              <span className="card-pill purple">Method</span>
            </div>

            <div className="learning-card-content">
              <h3 className="learning-card-title">Personal Problem-Solving Approach</h3>
              <p className="learning-card-desc">
                Document your thinking process, step-by-step logic, and alternative attempts in your own words for clear interview articulation.
              </p>
            </div>

            <div className="learning-micro-visual">
              <div className="approach-step-list">
                <div className="approach-step">
                  <span className="step-badge">1</span>
                  <span className="step-txt">Identify monotonic search space</span>
                </div>
                <div className="approach-step">
                  <span className="step-badge">2</span>
                  <span className="step-txt">Maintain left and right boundaries</span>
                </div>
                <div className="approach-step">
                  <span className="step-badge">3</span>
                  <span className="step-txt">Verify convergence criteria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Time and Space Complexity */}
          <div className="learning-card card-saas">
            <div className="learning-card-top">
              <div className="learning-icon-box orange">
                <Clock size={22} />
              </div>
              <span className="card-pill">Complexity</span>
            </div>

            <div className="learning-card-content">
              <h3 className="learning-card-title">Time and Space Complexity</h3>
              <p className="learning-card-desc">
                Analyze and record asymptotic Big-O bounds for both runtime and auxiliary memory to build interview-ready reasoning.
              </p>
            </div>

            <div className="learning-micro-visual">
              <div className="complexity-badge-row">
                <div className="complexity-badge">
                  <span className="comp-label">Time</span>
                  <span className="comp-val">O(N log N)</span>
                </div>
                <div className="complexity-badge">
                  <span className="comp-label">Space</span>
                  <span className="comp-val">O(1)</span>
                </div>
              </div>
              <p className="complexity-caption">Single pass traversal with constant auxiliary memory</p>
            </div>
          </div>

          {/* Card 4: Personal Notes and Saved Solutions */}
          <div className="learning-card card-saas">
            <div className="learning-card-top">
              <div className="learning-icon-box purple">
                <NotebookPen size={22} />
              </div>
              <span className="card-pill purple">Archive</span>
            </div>

            <div className="learning-card-content">
              <h3 className="learning-card-title">Personal Notes and Saved Solutions</h3>
              <p className="learning-card-desc">
                Maintain a clean personal revision archive of your verified solutions, tricky edge-case traps, and key lessons.
              </p>
            </div>

            <div className="learning-micro-visual">
              <div className="archive-tags-row">
                <span className="archive-pill">Edge Case: Empty Array</span>
                <span className="archive-pill green">Verified Solution</span>
              </div>
              <div className="archive-note-text">
                "Revisit before tech screen: remember off-by-one trap on pointer swap."
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
