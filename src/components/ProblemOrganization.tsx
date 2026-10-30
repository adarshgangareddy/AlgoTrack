import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Binary, 
  GitBranch, 
  Network, 
  Code2, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import './ProblemOrganization.css';

export const ProblemOrganization: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const topics = [
    { name: 'Arrays', count: '48 problems', icon: '▦' },
    { name: 'Strings', count: '36 problems', icon: '🔤' },
    { name: 'Hash Maps', count: '32 problems', icon: '🔑' },
    { name: 'Linked Lists', count: '24 problems', icon: '⛓' },
    { name: 'Trees', count: '44 problems', icon: '🌳' },
    { name: 'Graphs', count: '38 problems', icon: '🕸' },
    { name: 'Dynamic Programming', count: '52 problems', icon: '⚡' },
    { name: 'Binary Search', count: '28 problems', icon: '🔍' },
    { name: 'Stack and Queue', count: '26 problems', icon: '📚' },
    { name: 'Sliding Window', count: '22 problems', icon: '🪟' },
  ];

  const patterns = [
    { 
      name: 'Two Pointers', 
      desc: 'Linear traversals with opposite or fast/slow pointer tracking.',
      appliesTo: 'Arrays, Strings, Linked Lists'
    },
    { 
      name: 'Sliding Window', 
      desc: 'Subarray and substring problems with dynamic or fixed window boundaries.',
      appliesTo: 'Strings, Arrays'
    },
    { 
      name: 'Prefix Sum', 
      desc: 'Precomputing cumulative sums to resolve range queries in O(1) time.',
      appliesTo: 'Arrays, Matrices'
    },
    { 
      name: 'Binary Search', 
      desc: 'Logarithmic search spaces on sorted arrays, answers, and monotonic conditions.',
      appliesTo: 'Arrays, Rotated Arrays, Search Space'
    },
    { 
      name: 'DFS and BFS', 
      desc: 'Systematic tree traversals, level-order scans, and graph connectivity.',
      appliesTo: 'Binary Trees, Graphs, Matrices'
    },
    { 
      name: 'Backtracking', 
      desc: 'Exhaustive state-space search with pruning for permutations and subsets.',
      appliesTo: 'Recursion, Combinatorics'
    },
    { 
      name: 'Greedy', 
      desc: 'Making locally optimal choices to achieve a global optimum in interval problems.',
      appliesTo: 'Intervals, Scheduling'
    },
    { 
      name: 'Dynamic Programming', 
      desc: 'Overlapping subproblems and optimal substructure via memoization and tabulation.',
      appliesTo: 'Knapsack, Subsequences, Grids'
    },
  ];

  return (
    <section className="problem-org-section" id="problem-library">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Library Structure</span>
          <h2 className="section-title">Find the Right Problem. Learn the Right Pattern.</h2>
          <p className="section-description">
            Rather than grinding hundreds of random questions, AlgoTrack categorizes problems by 
            difficulty, core data structures, and the universal algorithmic patterns top companies test.
          </p>
        </div>

        {/* 3 Difficulty Cards */}
        <div className="difficulty-cards-grid">
          <div className="difficulty-card card-saas easy">
            <div className="diff-card-header">
              <span className="diff-pill easy">Easy</span>
              <span className="diff-target-count">~90 Problems</span>
            </div>
            <h3 className="diff-card-title">Build your fundamentals.</h3>
            <p className="diff-card-desc">
              Master essential array operations, hash table lookups, basic pointer manipulations, 
              and simple recursion to establish unwavering coding fluency.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus:</span>
              <span className="focus-text">Time/Space analysis, Edge cases, Clean syntax</span>
            </div>
          </div>

          <div className="difficulty-card card-saas medium">
            <div className="diff-card-header">
              <span className="diff-pill medium">Medium</span>
              <span className="diff-target-count">~210 Problems</span>
            </div>
            <h3 className="diff-card-title">Strengthen your problem-solving skills.</h3>
            <p className="diff-card-desc">
              The benchmark tier for software engineering interviews. Internalize multi-step algorithms, 
              sliding windows, tree and graph traversals, and dynamic programming.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus:</span>
              <span className="focus-text">Pattern recognition, Optimal subproblems, Trees & Graphs</span>
            </div>
          </div>

          <div className="difficulty-card card-saas hard">
            <div className="diff-card-header">
              <span className="diff-pill hard">Hard</span>
              <span className="diff-target-count">~100 Problems</span>
            </div>
            <h3 className="diff-card-title">Challenge yourself with advanced problems.</h3>
            <p className="diff-card-desc">
              Prepare for senior technical screens and high-tier engineering interviews with complex DP 
              states, advanced graph algorithms, and bespoke data structure designs.
            </p>
            <div className="diff-card-focus">
              <span className="focus-label">Key Focus:</span>
              <span className="focus-text">State transitions, Monotonic structures, Hard optimizations</span>
            </div>
          </div>
        </div>

        {/* Topic-Based Organization */}
        <div className="topics-container card-saas">
          <div className="topics-header">
            <div className="topics-title-box">
              <Layers size={18} className="text-orange" />
              <h3 className="topics-heading">Comprehensive Topic Taxonomy</h3>
            </div>
            <span className="topics-subtext">Curated across all fundamental computer science topics</span>
          </div>

          <div className="topics-chips-grid">
            {topics.map((topic) => (
              <div key={topic.name} className="topic-chip">
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-name">{topic.name}</span>
                <span className="topic-count">{topic.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithmic Patterns Grid */}
        <div className="patterns-section-block">
          <div className="patterns-header-row">
            <div>
              <h3 className="patterns-section-title">The 16+ Reusable Algorithmic Patterns</h3>
              <p className="patterns-section-desc">
                Learn the pattern once, apply it effortlessly across dozens of seemingly distinct questions.
              </p>
            </div>
          </div>

          <div className="patterns-grid">
            {patterns.map((pat) => (
              <div key={pat.name} className="pattern-card card-saas">
                <div className="pattern-card-top">
                  <span className="pattern-pill">{pat.name}</span>
                </div>
                <p className="pattern-desc">{pat.desc}</p>
                <div className="pattern-applies">
                  <span className="applies-label">Common topics:</span>
                  <span className="applies-val">{pat.appliesTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Library intro disclaimer */}
        <div className="org-privacy-note">
          <HelpCircle size={15} />
          <span>
            AlgoTrack organizes the library structure without exposing copyrighted problem statements on the public homepage. 
            Detailed problem workspaces open within individual problem sessions.
          </span>
        </div>
      </div>
    </section>
  );
};
