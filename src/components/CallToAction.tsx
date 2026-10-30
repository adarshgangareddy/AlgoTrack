import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import './CallToAction.css';

interface CallToActionProps {
  onGetStartedClick: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onGetStartedClick }) => {
  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <div className="cta-card card-saas">
          {/* Subtle top pill */}
          <div className="cta-badge">
            <span className="cta-badge-dot"></span>
            <span>Ready to Begin?</span>
          </div>

          <h2 className="cta-heading">Make Every Problem Count.</h2>

          <p className="cta-description">
            Build a consistent coding habit and turn every problem into progress.
          </p>

          <div className="cta-action-wrap">
            <button 
              type="button" 
              className="btn btn-primary btn-lg cta-btn"
              onClick={onGetStartedClick}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            <span className="cta-secondary-text">Your coding journey starts here.</span>
          </div>

          {/* Value checkmarks */}
          <div className="cta-benefits-row">
            <div className="benefit-item">
              <CheckCircle2 size={16} className="text-orange" />
              <span>400 Curated Patterns</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={16} className="text-orange" />
              <span>Personal Notes & Code Storage</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={16} className="text-orange" />
              <span>No Pressure, High Consistency</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
