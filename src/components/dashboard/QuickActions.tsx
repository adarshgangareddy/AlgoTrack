import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Play, BarChart2, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onScrollToActivity: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onScrollToActivity }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card-section" aria-label="Quick Actions">
      <div className="card-section-header">
        <h3 className="card-section-title">Quick Actions</h3>
      </div>

      <div className="quick-actions-row">
        {/* Explore Problems */}
        <div 
          className="quick-action-card" 
          onClick={() => navigate('/problems')}
          role="button"
          tabIndex={0}
          title="Browse curated problem library and start learning"
          style={{ cursor: 'pointer' }}
        >
          <div className="quick-action-left">
            <div className="quick-action-icon">
              <Compass size={20} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Explore Problems</span>
              <span className="quick-action-desc">Curated interview challenges</span>
            </div>
          </div>
          <ArrowRight size={16} color="#0284C7" />
        </div>

        {/* Continue Practice */}
        <div 
          className="quick-action-card" 
          onClick={() => navigate('/problems/two-sum')}
          role="button"
          tabIndex={0}
          title="Resume your practice workspace"
          style={{ cursor: 'pointer' }}
        >
          <div className="quick-action-left">
            <div className="quick-action-icon" style={{ color: '#F59E0B' }}>
              <Play size={20} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">Continue Practice</span>
              <span className="quick-action-desc">Jump into problem workspace</span>
            </div>
          </div>
          <ArrowRight size={16} color="#0284C7" />
        </div>

        {/* View Progress (Active) */}
        <div 
          className="quick-action-card"
          onClick={onScrollToActivity}
          role="button"
          tabIndex={0}
          title="Scroll to coding activity overview"
          style={{ cursor: 'pointer' }}
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
