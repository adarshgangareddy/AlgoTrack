import React from 'react';
import { Layers, Workflow } from 'lucide-react';
import './ProblemOrganization.css';

export const ProblemOrganization: React.FC = () => {
  const showcaseTopics = [
    { name: 'Arrays & Strings', icon: '▦', desc: 'Linear traversal, in-place manipulation & two pointers' },
    { name: 'Hash Maps & Sets', icon: '🔑', desc: 'Fast lookup, frequency tracking & index caching' },
    { name: 'Trees & Graphs', icon: '🌳', desc: 'Hierarchical traversals, DFS, BFS & connectivity' },
    { name: 'Dynamic Programming', icon: '⚡', desc: 'State memoization, optimal substructure & tabulation' },
    { name: 'Binary Search', icon: '🔍', desc: 'Logarithmic search spaces & monotonic conditions' },
  ];

  const showcasePatterns = [
    { name: 'Two Pointers', desc: 'Traverse sorted sequences inward or forward with paired pointers' },
    { name: 'Sliding Window', desc: 'Maintain running subarray state with dynamic or fixed boundaries' },
    { name: 'DFS & BFS', desc: 'Exhaustive tree/graph exploration and level-order pathfinding' },
    { name: 'Prefix Sum', desc: 'Precompute cumulative sums for rapid O(1) range queries' },
  ];

  return (
    <section className="problem-org-section" id="problem-library">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Organized Practice</span>
          <h2 className="section-title">Find the Right Problem. Learn the Right Pattern.</h2>
          <p className="section-description">
            Explore a curated collection of popular coding interview problems, organized by difficulty, topic and algorithmic pattern.
          </p>
        </div>

        {/* Visual: Easy | Medium | Hard Tier Indicator */}
        <div className="difficulty-visual-strip card-saas">
          <div className="diff-strip-item easy">
            <span className="diff-strip-dot easy"></span>
            <span className="diff-strip-name">Easy</span>
            <span className="diff-strip-hint">Core Fundamentals</span>
          </div>
          <div className="diff-strip-divider">|</div>
          <div className="diff-strip-item medium">
            <span className="diff-strip-dot medium"></span>
            <span className="diff-strip-name">Medium</span>
            <span className="diff-strip-hint">Core Interview Tier</span>
          </div>
          <div className="diff-strip-divider">|</div>
          <div className="diff-strip-item hard">
            <span className="diff-strip-dot hard"></span>
            <span className="diff-strip-name">Hard</span>
            <span className="diff-strip-hint">Advanced Challenges</span>
          </div>
        </div>

        {/* 3 Visually Attractive Cards */}
        <div className="difficulty-cards-grid">
          {/* Easy Card */}
          <div className="difficulty-card card-saas easy">
            <div className="diff-card-header">
              <span className="diff-pill easy">Easy</span>
            </div>
            <h3 className="diff-card-title">Build your fundamentals.</h3>
            <p className="diff-card-desc">
              Master essential array operations, hash table lookups, basic pointer manipulations, and simple recursion to establish unwavering coding fluency.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus</span>
              <span className="focus-text">Time/Space analysis, Edge cases, Clean syntax</span>
            </div>
          </div>

          {/* Medium Card */}
          <div className="difficulty-card card-saas medium">
            <div className="diff-card-header">
              <span className="diff-pill medium">Medium</span>
            </div>
            <h3 className="diff-card-title">Strengthen your problem-solving skills.</h3>
            <p className="diff-card-desc">
              The benchmark tier for software engineering interviews. Internalize multi-step algorithms, sliding windows, tree and graph traversals, and dynamic programming.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus</span>
              <span className="focus-text">Pattern recognition, Optimal subproblems, Graphs</span>
            </div>
          </div>

          {/* Hard Card */}
          <div className="difficulty-card card-saas hard">
            <div className="diff-card-header">
              <span className="diff-pill hard">Hard</span>
            </div>
            <h3 className="diff-card-title">Challenge yourself with advanced algorithms.</h3>
            <p className="diff-card-desc">
              Prepare for senior technical screens and high-tier engineering interviews with complex DP states, advanced graph algorithms, and bespoke data structure designs.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus</span>
              <span className="focus-text">State transitions, Monotonic structures, Hard optimizations</span>
            </div>
          </div>
        </div>

        {/* Topic & Pattern Showcase */}
        <div className="showcase-dual-grid">
          {/* Topics Showcase */}
          <div className="showcase-panel card-saas">
            <div className="showcase-panel-header">
              <div className="panel-title-wrap">
                <Layers size={18} className="text-orange" />
                <h3 className="showcase-title">Topic Showcase</h3>
              </div>
              <span className="showcase-subtitle">Core Data Structures</span>
            </div>
            <div className="showcase-list">
              {showcaseTopics.map((topic) => (
                <div key={topic.name} className="showcase-item">
                  <span className="showcase-item-icon">{topic.icon}</span>
                  <div className="showcase-item-text">
                    <span className="showcase-item-name">{topic.name}</span>
                    <span className="showcase-item-desc">{topic.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patterns Showcase */}
          <div className="showcase-panel card-saas">
            <div className="showcase-panel-header">
              <div className="panel-title-wrap">
                <Workflow size={18} className="text-purple" />
                <h3 className="showcase-title">Pattern Showcase</h3>
              </div>
              <span className="showcase-subtitle">Universal Solution Templates</span>
            </div>
            <div className="showcase-list">
              {showcasePatterns.map((pat) => (
                <div key={pat.name} className="showcase-item">
                  <span className="pattern-badge-pill">{pat.name}</span>
                  <div className="showcase-item-text">
                    <span className="showcase-item-desc">{pat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
