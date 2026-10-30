import React from 'react';
import { 
  Code2, 
  CheckCircle2, 
  Clock, 
  Percent, 
  Info
} from 'lucide-react';
import type { DashboardSummary } from '../../services/dashboardService';

interface SummaryCardsProps {
  summary: DashboardSummary;
  isLibraryLoaded: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLibraryLoaded }) => {
  const cards = [
    {
      title: 'Total Problems',
      value: summary.totalProblems,
      icon: <Code2 size={22} color="#0284C7" />,
      bgIcon: '#E0F2FE',
      footer: isLibraryLoaded
        ? 'Available in shared library'
        : 'Library indexing in Phase 4',
      badge: isLibraryLoaded ? `${summary.totalProblems} Total` : 'Phase 4',
    },
    {
      title: 'Solved Problems',
      value: summary.solvedProblems,
      icon: <CheckCircle2 size={22} color="#10B981" />,
      bgIcon: '#ECFDF5',
      footer: summary.solvedProblems > 0
        ? 'Verified complete by you'
        : 'Solve your first problem',
      badge: `${summary.solvedProblems} Solved`,
    },
    {
      title: 'Attempted Problems',
      value: summary.attemptedProblems,
      icon: <Clock size={22} color="#F59E0B" />,
      bgIcon: '#FFFBEB',
      footer: summary.attemptedProblems > 0
        ? 'In-progress challenges'
        : 'No pending attempts',
      badge: `${summary.attemptedProblems} In Progress`,
    },
    {
      title: 'Completion Rate',
      value: `${summary.completionRate}%`,
      icon: <Percent size={22} color="#6366F1" />,
      bgIcon: '#EEF2FF',
      footer: summary.totalProblems > 0 
        ? `${summary.solvedProblems} of ${summary.totalProblems} complete`
        : 'Awaiting problem library',
      badge: `${summary.completionRate}% Done`,
    },
  ];

  return (
    <section className="summary-cards-section" aria-label="Coding Practice Summary">
      <div className="summary-cards-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-title">{card.title}</span>
              <div className="summary-icon-box" style={{ backgroundColor: card.bgIcon }}>
                {card.icon}
              </div>
            </div>

            <div className="summary-card-value">
              {card.value}
            </div>

            <div className="summary-card-footer">
              <Info size={13} style={{ flexShrink: 0 }} />
              <span>{card.footer}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
