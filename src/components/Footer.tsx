import React from 'react';
import { ArrowUp } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        <div className="footer-main-row">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <a 
              href="/" 
              className="brand-logo footer-logo"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              aria-label="AlgoTrack Home"
            >
              <div className="brand-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#18181B" />
                  <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#EA580C" fillOpacity="0.25" stroke="#F97316" strokeWidth="1.75" strokeLinejoin="round" />
                  <circle cx="11" cy="8" r="1.5" fill="#F97316" />
                  <circle cx="15" cy="12" r="1.5" fill="#FB923C" />
                  <circle cx="11" cy="16" r="1.5" fill="#F97316" />
                  <circle cx="7" cy="12" r="1.5" fill="#F97316" />
                  <path d="M15 12H18" stroke="#818CF8" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx="18" cy="12" r="1.75" fill="#818CF8" />
                </svg>
              </div>
              <span className="brand-name">AlgoTrack</span>
            </a>

            <p className="footer-tagline">
              Your Coding Journey, Organized.
            </p>

            <p className="footer-description">
              A structured coding interview preparation and personal progress-tracking platform designed to help engineers practice deliberately, internalize core patterns, and build lasting interview confidence.
            </p>
          </div>

          {/* Navigation Links Col */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-title">Quick Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#problem-library" onClick={(e) => scrollToSection(e, 'problem-library')}>
                  Problem Library
                </a>
              </li>
              <li>
                <a href="#progress-tracking" onClick={(e) => scrollToSection(e, 'progress-tracking')}>
                  Progress Tracking
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Philosophy / Statement Col */}
          <div className="footer-statement-col">
            <h4 className="footer-nav-title">Platform Philosophy</h4>
            <p className="statement-quote">
              "Practice smarter. Track your progress. Build confidence."
            </p>
            <div className="statement-badge">
              <span className="badge-bullet"></span>
              <span>Single Public Homepage • Phase 1</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-row">
          <div className="copyright-text">
            © 2026 AlgoTrack. All rights reserved.
          </div>

          <button 
            type="button" 
            className="back-to-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
