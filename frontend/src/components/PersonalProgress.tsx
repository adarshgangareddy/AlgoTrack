import React from 'react';
import { Calendar, Flame, Sparkles, Target, Compass, Award } from 'lucide-react';
import './PersonalProgress.css';

export const PersonalProgress: React.FC = () => {
  const weekDays = [
    { day: 'Mon', active: true, count: 'Practice complete' },
    { day: 'Tue', active: true, count: 'Practice complete' },
    { day: 'Wed', active: true, count: 'Practice complete' },
    { day: 'Thu', active: true, count: 'Practice complete' },
    { day: 'Fri', active: true, count: 'Practice complete' },
    { day: 'Sat', active: true, count: 'Practice complete' },
    { day: 'Sun', active: true, count: 'Review day' },
  ];

  const growthMilestones = [
    {
      title: 'Foundation & Core Data Structures',
      status: 'Mastered',
      progress: 100,
      color: '#10B981',
      badge: 'Completed',
    },
    {
      title: 'Algorithmic Patterns & Techniques',
      status: 'Active Focus',
      progress: 68,
      color: '#F59E0B',
      badge: 'In Progress',
    },
    {
      title: 'Complex Optimization & Revision',
      status: 'Upcoming',
      progress: 35,
      color: '#818CF8',
      badge: 'Target Milestone',
    },
  ];

  return (
    <section className="progress-section" id="progress-tracking">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Progress Tracking</span>
          <h2 className="section-title">See Your Progress. Stay Motivated.</h2>
          <p className="section-description">
            Build a consistent coding habit, monitor your achievements and understand how your problem-solving skills improve over time.
          </p>
        </div>

        {/* ONE Single Visually Appealing Illustrative Progress Visualization */}
        <div className="single-progress-card card-saas">
          {/* Top Label: Clearly Marked Illustrative Preview */}
          <div className="progress-card-topbar">
            <div className="topbar-left">
              <span className="live-pulse-dot"></span>
              <span className="topbar-title">Consistency & Habit Tracking</span>
            </div>
            <div className="topbar-right">
              <span className="preview-watermark-tag">
                <Sparkles size={13} className="text-orange" />
                <span>Illustrative Preview</span>
              </span>
            </div>
          </div>

          <div className="progress-card-body">
            {/* Top Row: Habit Rhythm Calendar */}
            <div className="habit-rhythm-panel">
              <div className="panel-subhead">
                <div className="subhead-title">
                  <Calendar size={16} className="text-purple" />
                  <span>Weekly Practice Consistency</span>
                </div>
                <div className="streak-habit-indicator">
                  <Flame size={14} className="text-orange" />
                  <span>Daily Habit Rhythm</span>
                </div>
              </div>

              <div className="week-rhythm-grid">
                {weekDays.map((item) => (
                  <div key={item.day} className={`day-pill ${item.active ? 'is-active' : ''}`}>
                    <span className="day-name">{item.day}</span>
                    <span className="day-dot"></span>
                    <span className="day-tooltip">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Algorithmic Growth Milestones */}
            <div className="growth-milestones-panel">
              <div className="panel-subhead">
                <div className="subhead-title">
                  <Compass size={16} className="text-orange" />
                  <span>Curated Learning Milestones</span>
                </div>
                <span className="milestone-badge-counter">Phase Progress</span>
              </div>

              <div className="milestones-list">
                {growthMilestones.map((milestone) => (
                  <div key={milestone.title} className="milestone-item">
                    <div className="milestone-header">
                      <div className="milestone-title-wrap">
                        <span className="milestone-title">{milestone.title}</span>
                        <span className="milestone-status">{milestone.status}</span>
                      </div>
                      <span className={`milestone-tag ${milestone.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                        {milestone.badge}
                      </span>
                    </div>

                    <div className="milestone-bar-bg">
                      <div
                        className="milestone-bar-fill"
                        style={{
                          width: `${milestone.progress}%`,
                          backgroundColor: milestone.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Value Props Banner */}
            <div className="progress-summary-banner">
              <div className="summary-col">
                <Target size={18} className="text-orange" />
                <div>
                  <h4 className="summary-title">Clear Problem Roadmaps</h4>
                  <p className="summary-desc">Never guess what challenge to tackle next.</p>
                </div>
              </div>
              <div className="summary-col">
                <Award size={18} className="text-purple" />
                <div>
                  <h4 className="summary-title">Revision Retention</h4>
                  <p className="summary-desc">Revisit solved questions before key interviews.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="progress-card-footer">
            <span>Illustrative Preview • Personal statistics and progress metrics are tracked privately inside your authenticated account.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
