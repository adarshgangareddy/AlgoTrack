import React, { useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import './AuthModalPlaceholder.css';

interface AuthModalPlaceholderProps {
  isOpen: boolean;
  actionTitle: string;
  onClose: () => void;
}

export const AuthModalPlaceholder: React.FC<AuthModalPlaceholderProps> = ({
  isOpen,
  actionTitle,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container card-saas" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-badge">
            <Sparkles size={13} className="text-orange" />
            <span>Phase 1 Architecture Preview</span>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h3 id="modal-title" className="modal-title">
            {actionTitle === 'Sign In' ? 'Authentication Opens in Phase 2' : 'Get Started in Phase 2'}
          </h3>

          <p className="modal-description">
            AlgoTrack is currently in its <strong>Phase 1 Public Release</strong>, focusing on the 
            visual design system, the 400-problem library structure, and pattern tracking frameworks.
          </p>

          <div className="modal-features-list">
            <div className="modal-feature-item">
              <div className="modal-icon-circle">
                <Check size={14} />
              </div>
              <div>
                <strong>Current Phase 1:</strong> Explore the full public homepage, pattern directory, and illustrative workspace previews below.
              </div>
            </div>
            <div className="modal-feature-item">
              <div className="modal-icon-circle purple">
                <Check size={14} />
              </div>
              <div>
                <strong>Upcoming Phase 2:</strong> Personal accounts, solution saving, custom note archives, and consistency tracking.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-primary w-full"
            onClick={onClose}
          >
            <span>Continue Exploring Preview</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
