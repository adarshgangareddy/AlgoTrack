import React from 'react';
import { History, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react';
import type { RecentActivityItem } from '../../services/dashboardService';

interface RecentActivityProps {
  activityList: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activityList }) => {
  const getActionBadge = (type: string) => {
    switch (type) {
      case 'solved':
        return { label: 'Solved', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={13} /> };
      case 'attempted':
        return { label: 'Attempted', color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={13} /> };
      default:
        return { label: 'Revisited', color: '#0284C7', bg: '#F0F9FF', icon: <BookOpen size={13} /> };
    }
  };

  return (
    <div className="dashboard-card-section" id="recent-activity" aria-label="Recent Activity">
      <div className="card-section-header">
        <h3 className="card-section-title">Recent Activity</h3>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          {activityList.length} Events Logged
        </span>
      </div>

      {activityList.length === 0 ? (
        // Prescribed Empty State
        <div 
          style={{
            padding: '36px 20px',
            background: '#F8FAFC',
            border: '1.5px dashed #E2E8F0',
            borderRadius: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <History size={20} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
            No activity yet. Start solving problems to build your history.
          </span>
          <span style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px' }}>
            Every challenge you attempt or solve in AlgoTrack will be recorded here with timestamps and difficulty tags.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activityList.map((item) => {
            const badge = getActionBadge(item.actionType);
            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    {item.problemTitle}
                  </span>
                </div>

                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
