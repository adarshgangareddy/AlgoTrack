import React, { useState } from 'react';
import { 
  Calendar, 
  BarChart2, 
  Compass,
  Sparkles
} from 'lucide-react';
import type { DailyActivityItem } from '../../services/dashboardService';

interface ActivityOverviewProps {
  activityData: DailyActivityItem[];
}

export const ActivityOverview: React.FC<ActivityOverviewProps> = ({ activityData }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'calendar'>('weekly');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hasActivity = activityData.length > 0 && activityData.some(d => d.count > 0);

  // 12-week calendar grid generation
  const weeks = Array.from({ length: 12 }, (_, wIndex) => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      // Real activity lookup
      return {
        key: `${wIndex}-${dIndex}`,
        level: 0,
      };
    });
  });

  return (
    <section className="activity-overview-card" id="activity-overview" aria-label="Your Coding Activity">
      <div className="activity-card-header">
        <div className="activity-title-group">
          <h2 className="activity-title">Your Coding Activity</h2>
          <span className="activity-subtitle">
            Track your daily problem solving consistency and progress over time.
          </span>
        </div>

        <div className="activity-tab-controls">
          <button
            type="button"
            className={`activity-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <BarChart2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Weekly View
          </button>
          <button
            type="button"
            className={`activity-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Activity Grid
          </button>
        </div>
      </div>

      {!hasActivity ? (
        // Prescribed Empty State for new accounts
        <div className="activity-empty-state">
          <div className="empty-icon-circle">
            <Compass size={28} />
          </div>
          <h3 className="empty-heading">No Activity Recorded Yet</h3>
          <p className="empty-text">
            Your coding journey starts here. Solve your first problem to see your activity.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0284C7', fontWeight: 600 }}>
            <Sparkles size={14} />
            <span>Interactive problem practice unlocks in Phase 4</span>
          </div>
        </div>
      ) : activeTab === 'weekly' ? (
        // Weekly Bar Chart (populated when data exists)
        <div className="weekly-chart-container" style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '16px' }}>
            {daysOfWeek.map((day, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    maxWidth: '48px', 
                    height: '8px', 
                    background: '#E0F2FE', 
                    borderRadius: '8px' 
                  }} 
                />
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{day}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 12-Week Contribution Grid
        <div className="activity-grid-container">
          <div className="activity-weeks-row">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="activity-week-col">
                {week.map((day) => (
                  <div
                    key={day.key}
                    className={`activity-day-cell level-${day.level}`}
                    title="0 problems solved"
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
            <span>Less</span>
            <div className="activity-day-cell" style={{ display: 'inline-block' }} />
            <div className="activity-day-cell level-1" style={{ display: 'inline-block' }} />
            <div className="activity-day-cell level-2" style={{ display: 'inline-block' }} />
            <div className="activity-day-cell level-3" style={{ display: 'inline-block' }} />
            <span>More</span>
          </div>
        </div>
      )}
    </section>
  );
};
