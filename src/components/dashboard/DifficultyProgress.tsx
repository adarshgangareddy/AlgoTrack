import React from 'react';
import { Layers, Info } from 'lucide-react';
import type { DifficultyProgressData } from '../../services/dashboardService';

interface DifficultyProgressProps {
  difficulties: DifficultyProgressData[];
  isLibraryLoaded: boolean;
}

export const DifficultyProgress: React.FC<DifficultyProgressProps> = ({
  difficulties,
  isLibraryLoaded,
}) => {
  return (
    <div className="dashboard-card-section" id="difficulty-progress" aria-label="Difficulty Breakdown">
      <div className="card-section-header">
        <h3 className="card-section-title">Difficulty Breakdown</h3>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          {isLibraryLoaded ? 'Active Library' : 'Empty Library (Phase 4)'}
        </span>
      </div>

      <div className="difficulty-cards-list">
        {difficulties.map((diff) => (
          <div key={diff.difficulty} className="difficulty-item-card">
            <div className="difficulty-header-row">
              <span className={`difficulty-badge ${diff.difficulty.toLowerCase()}`}>
                {diff.difficulty}
              </span>
              <span className="difficulty-count-label">
                {diff.solved} / {diff.total} solved ({diff.rate}%)
              </span>
            </div>

            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.max(diff.rate, diff.total > 0 ? 0 : 0)}%`, 
                  backgroundColor: diff.color 
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      {!isLibraryLoaded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px' }}>
          <Info size={14} color="#0284C7" />
          <span>Curated problem set (400 problems) will be indexed in Phase 4.</span>
        </div>
      )}
    </div>
  );
};
