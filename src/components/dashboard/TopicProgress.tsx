import React from 'react';
import { Sparkles } from 'lucide-react';
import type { TopicProgressData } from '../../services/dashboardService';

interface TopicProgressProps {
  topics: TopicProgressData[];
  isLibraryLoaded: boolean;
}

export const TopicProgress: React.FC<TopicProgressProps> = ({ topics, isLibraryLoaded }) => {
  return (
    <div className="dashboard-card-section" id="topic-progress" aria-label="Topic Progress">
      <div className="card-section-header">
        <h3 className="card-section-title">Your Topic Progress</h3>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          {topics.length} Algorithmic Topics
        </span>
      </div>

      <div className="topic-progress-grid">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-item-pill">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="topic-name">{topic.name}</span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: topic.solved > 0 ? '#10B981' : '#64748B' }}>
                {topic.solved}/{topic.total} ({topic.rate}%)
              </span>
            </div>

            <div className="progress-track" style={{ height: '6px' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${topic.rate}%`, 
                  backgroundColor: topic.solved > 0 ? '#0284C7' : '#CBD5E1' 
                }} 
              />
            </div>
            
            <span className="topic-meta">
              {topic.solved === 0 ? 'Not started yet' : `${topic.solved} mastered`}
            </span>
          </div>
        ))}
      </div>

      {!isLibraryLoaded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', background: '#F0F9FF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
          <Sparkles size={14} color="#0284C7" />
          <span>Topic categorization across 400 questions will populate automatically upon Phase 4 library integration.</span>
        </div>
      )}
    </div>
  );
};
