import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  Sparkles
} from 'lucide-react';
import './PersonalProgress.css';

export const PersonalProgress: React.FC = () => {
  // 4 weeks of illustrative activity data (28 days)
  const activityDays = [
    { day: 1, count: 2 }, { day: 2, count: 4 }, { day: 3, count: 3 }, { day: 4, count: 0 },
    { day: 5, count: 5 }, { day: 6, count: 2 }, { day: 7, count: 3 }, { day: 8, count: 1 },
    { day: 9, count: 4 }, { day: 10, count: 6 }, { day: 11, count: 2 }, { day: 12, count: 3 },
    { day: 13, count: 0 }, { day: 14, count: 4 }, { day: 15, count: 5 }, { day: 16, count: 3 },
    { day: 17, count: 4 }, { day: 18, count: 2 }, { day: 19, count: 6 }, { day: 20, count: 1 },
    { day: 21, count: 3 }, { day: 22, count: 4 }, { day: 23, count: 5 }, { day: 24, count: 2 },
    { day: 25, count: 3 }, { day: 26, count: 4 }, { day: 27, count: 5 }, { day: 28, count: 4 }
  ];

  const getHeatClass = (count: number) => {
    if (count === 0) return 'heat-0';
    if (count <= 2) return 'heat-1';
    if (count <= 4) return 'heat-2';
    return 'heat-3';
  };

  const topicProgress = [
    { name: 'Arrays & Hashing', solved: 28, total: 32, pct: 87 },
    { name: 'Two Pointers & Sliding Window', solved: 22, total: 26, pct: 84 },
    { name: 'Binary Search', solved: 18, total: 24, pct: 75 },
    { name: 'Trees & Binary Search Trees', solved: 24, total: 38, pct: 63 },
    { name: 'Graphs (DFS, BFS, Dijkstra)', solved: 14, total: 30, pct: 46 },
    { name: 'Dynamic Programming', solved: 16, total: 42, pct: 38 },
  ];

  return (
    <section className="progress-section" id="progress-tracking">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Progress Analytics</span>
          <h2 className="section-title">See Your Progress. Stay Motivated.</h2>
          <p className="section-description">
            Your coding journey becomes easier to understand when every attempt and achievement is organized.
          </p>
        </div>

        {/* Equa-inspired Progress Dashboard Mockup */}
        <div className="progress-dashboard-frame card-saas">
          <div className="dashboard-topbar">
            <div className="dashboard-topbar-left">
              <span className="live-indicator"></span>
              <span className="dashboard-label">Personal Progress Studio</span>
            </div>
            <div className="dashboard-topbar-right">
              <span className="preview-watermark">
                <Sparkles size={13} className="text-orange" />
                <span>Illustrative Dashboard Preview</span>
              </span>
            </div>
          </div>

          <div className="dashboard-content-grid">
            {/* Left Column: Top Level Stats & Topic Breakdown */}
            <div className="dashboard-left-col">
              {/* Stat Counters 4-Box */}
              <div className="stat-counters-row">
                <div className="counter-box">
                  <span className="counter-label">Solved</span>
                  <div className="counter-num-wrap">
                    <span className="counter-num text-solved">142</span>
                    <CheckCircle2 size={16} className="text-solved-icon" />
                  </div>
                  <span className="counter-sub">35.5% of library</span>
                </div>

                <div className="counter-box">
                  <span className="counter-label">Attempted</span>
                  <div className="counter-num-wrap">
                    <span className="counter-num text-attempted">28</span>
                    <Clock size={16} className="text-attempted-icon" />
                  </div>
                  <span className="counter-sub">Active in review</span>
                </div>

                <div className="counter-box">
                  <span className="counter-label">Remaining</span>
                  <div className="counter-num-wrap">
                    <span className="counter-num text-remaining">230</span>
                    <AlertCircle size={16} className="text-remaining-icon" />
                  </div>
                  <span className="counter-sub">Unsolved targets</span>
                </div>

                <div className="counter-box">
                  <span className="counter-label">Day Streak</span>
                  <div className="counter-num-wrap">
                    <span className="counter-num text-streak">18</span>
                    <Flame size={16} className="text-streak-icon" />
                  </div>
                  <span className="counter-sub">Consistent practice</span>
                </div>
              </div>

              {/* Topic Mastery Breakdown */}
              <div className="topic-mastery-card">
                <div className="mastery-header">
                  <h4 className="mastery-title">Topic-Wise Mastery</h4>
                  <span className="mastery-badge">6 of 14 Active</span>
                </div>

                <div className="topic-bars-list">
                  {topicProgress.map((tp) => (
                    <div key={tp.name} className="topic-progress-row">
                      <div className="topic-progress-info">
                        <span className="topic-progress-name">{tp.name}</span>
                        <span className="topic-progress-counts">
                          <strong>{tp.solved}</strong> / {tp.total} ({tp.pct}%)
                        </span>
                      </div>
                      <div className="topic-bar-track">
                        <div 
                          className="topic-bar-fill" 
                          style={{ width: `${tp.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Radial Completion & Consistency Heatmap */}
            <div className="dashboard-right-col">
              {/* Radial Completion Card */}
              <div className="radial-overview-card">
                <h4 className="card-subheading">Difficulty Distribution</h4>

                <div className="donut-wrap">
                  <svg viewBox="0 0 100 100" className="donut-svg">
                    <circle cx="50" cy="50" r="40" className="donut-bg" />
                    {/* Easy segment: 48% of solved */}
                    <circle cx="50" cy="50" r="40" className="donut-easy" strokeDasharray="120 251.2" strokeDashoffset="0" />
                    {/* Medium segment: 40% of solved */}
                    <circle cx="50" cy="50" r="40" className="donut-med" strokeDasharray="100 251.2" strokeDashoffset="-120" />
                    {/* Hard segment: 12% of solved */}
                    <circle cx="50" cy="50" r="40" className="donut-hard" strokeDasharray="31.2 251.2" strokeDashoffset="-220" />
                  </svg>
                  <div className="donut-center-text">
                    <span className="donut-total">142</span>
                    <span className="donut-label">Solved</span>
                  </div>
                </div>

                <div className="donut-legend">
                  <div className="legend-row">
                    <span className="legend-bullet easy"></span>
                    <span className="legend-name">Easy</span>
                    <span className="legend-num">68 problems (75%)</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-bullet medium"></span>
                    <span className="legend-name">Medium</span>
                    <span className="legend-num">58 problems (27%)</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-bullet hard"></span>
                    <span className="legend-name">Hard</span>
                    <span className="legend-num">16 problems (16%)</span>
                  </div>
                </div>
              </div>

              {/* 28-Day Consistency Calendar */}
              <div className="calendar-heatmap-card">
                <div className="calendar-header">
                  <div className="calendar-title-wrap">
                    <Calendar size={15} className="text-orange" />
                    <h4 className="card-subheading">28-Day Consistency Matrix</h4>
                  </div>
                  <span className="calendar-streak-chip">18-Day Active Streak</span>
                </div>

                <div className="heatmap-grid" role="grid" aria-label="Practice activity for past 4 weeks">
                  {activityDays.map((item) => (
                    <div 
                      key={item.day} 
                      className={`heatmap-cell ${getHeatClass(item.count)}`}
                      title={`Day ${item.day}: ${item.count} problems practiced`}
                    ></div>
                  ))}
                </div>

                <div className="heatmap-footer">
                  <span className="heat-legend-label">Less</span>
                  <div className="heat-levels">
                    <span className="heatmap-cell heat-0"></span>
                    <span className="heatmap-cell heat-1"></span>
                    <span className="heatmap-cell heat-2"></span>
                    <span className="heatmap-cell heat-3"></span>
                  </div>
                  <span className="heat-legend-label">More</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-footer-bar">
            <span>Progress preview illustrative data. Phase 2 enables personal persistent profiles.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
