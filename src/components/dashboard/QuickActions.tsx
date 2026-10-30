import React from 'react';
import { Compass, Play, BarChart2, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onScrollToActivity: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onScrollToActivity }) => {
  return (
    <div className="dashboard-card-section" aria-label="Quick Actions">
      <div className="card-section-header">
        <h3 className="card-section-title">Quick Actions</h3>
      </div>

      <div className="quick-actions-row">
        {/* Explore Problems (Phase 4) */}
        <div 
          className="quick-action-card" 
          style={{ cursor: 'not-allowed', opacity: 0.8 }}
          title="Curated 400 questions library arriving in Phase 4"
        >
          <div className="quick-action-left">
            <div className="quick-action-icon">
              <Compass size={20} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Explore Problems</span>
              <span className="quick-action-desc">400 curated interview challenges</span>
            </div>
          </div>
          <span className="nav-badge" style={{ background: '#F1F5F9', color: '#64748B' }}>
            Phase 4
          </span>
        </div>

        {/* Continue Practice (Phase 4) */}
        <div 
          className="quick-action-card" 
          style={{ cursor: 'not-allowed', opacity: 0.8 }}
          title="Resume your last attempted challenge"
        >
          <div className="quick-action-left">
            <div className="quick-action-icon" style={{ color: '#F59E0B' }}>
              <Play size={20} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Continue Practice</span>
              <span className="quick-action-desc">Jump straight to your next question</span>
            </div>
          </div>
          <span className="nav-badge" style={{ background: '#F1F5F9', color: '#64748B' }}>
            Phase 4
          </span>
        </div>

        {/* View Progress (Active) */}
        <div 
          className="quick-action-card"
          onClick={onScrollToActivity}
          role="button"
          tabIndex={0}
          title="Scroll to coding activity overview"
        >
          <div className="quick-action-left">
            <div className="quick-action-icon" style={{ color: '#10B981' }}>
              <BarChart2 size={20} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">View Progress</span>
              <span className="quick-action-desc">Check your activity and charts</span>
            </div>
          </div>
          <ArrowRight size={16} color="#0284C7" />
        </div>
      </div>
    </div>
  );
};
