import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  motivationalHeading?: string;
  motivationalText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  heading,
  subheading,
  motivationalHeading = 'Master Algorithms One Problem at a Time.',
  motivationalText = 'Join thousands of engineers organizing their coding practice, mastering patterns, and building genuine interview confidence.',
}) => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        
        {/* ====================================================================
            LEFT SIDE: ALGOTRACK BRANDING, ILLUSTRATION & MOTIVATION (DESKTOP)
            ==================================================================== */}
        <div className="auth-brand-side">
          {/* Top Logo & Back to Home */}
          <div className="auth-brand-header">
            <Link to="/" className="auth-logo-link">
              <div className="auth-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#18181B" />
                  <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#38BDF8" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.75" strokeLinejoin="round" />
                  <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                  <circle cx="15" cy="12" r="1.5" fill="#F97316" />
                  <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                  <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                  <path d="M15 12H18" stroke="#818CF8" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx="18" cy="12" r="1.75" fill="#818CF8" />
                </svg>
              </div>
              <span className="auth-logo-text">AlgoTrack</span>
            </Link>

            <Link to="/" className="back-home-link">
              <ArrowLeft size={16} />
              <span>Back to home</span>
            </Link>
          </div>

          {/* Center Illustration with Coding & Algorithm Visuals */}
          <div className="auth-illustration-container">
            <svg viewBox="0 0 420 340" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-svg-illustration">
              {/* Soft sky-blue and pastel ambient backdrops */}
              <circle cx="210" cy="170" r="140" fill="#E0F2FE" />
              <circle cx="310" cy="90" r="45" fill="#F0FDF4" />
              <circle cx="90" cy="240" r="55" fill="#FFF7ED" />

              {/* Main Laptop / Code IDE Workspace */}
              <g transform="translate(85, 75)">
                {/* Laptop Screen Bezel */}
                <rect x="0" y="0" width="250" height="155" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                {/* Screen Header Bar */}
                <rect x="0" y="0" width="250" height="26" rx="14" fill="#1E293B" />
                <circle cx="14" cy="13" r="3.5" fill="#EF4444" />
                <circle cx="24" cy="13" r="3.5" fill="#F59E0B" />
                <circle cx="34" cy="13" r="3.5" fill="#10B981" />
                <text x="50" y="17" fill="#94A3B8" fontSize="10" fontFamily="monospace">algo_two_pointers.py</text>

                {/* Code Lines in Screen */}
                <rect x="16" y="38" width="85" height="7" rx="3" fill="#38BDF8" />
                <rect x="30" y="52" width="120" height="6" rx="3" fill="#F472B6" />
                <rect x="30" y="65" width="95" height="6" rx="3" fill="#94A3B8" />
                <rect x="44" y="78" width="140" height="6" rx="3" fill="#34D399" />
                <rect x="44" y="91" width="110" height="6" rx="3" fill="#FBBF24" />
                <rect x="30" y="104" width="70" height="6" rx="3" fill="#A78BFA" />
                <rect x="16" y="117" width="50" height="6" rx="3" fill="#38BDF8" />

                {/* Laptop Base */}
                <path d="M-20 155 L270 155 L250 170 L0 170 Z" fill="#334155" />
                <rect x="100" y="156" width="50" height="5" rx="2" fill="#64748B" />
              </g>

              {/* Floating Algorithm Tree Badge (Left) */}
              <g transform="translate(30, 40)" className="floating-badge-1">
                <rect x="0" y="0" width="115" height="62" rx="12" fill="#FFFFFF" filter="drop-shadow(0 8px 18px rgba(2, 132, 199, 0.15))" />
                <circle cx="25" cy="31" r="14" fill="#E0F2FE" />
                <path d="M25 24 L20 31 M25 24 L30 31 M20 31 L18 38 M20 31 L22 38" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" />
                <text x="46" y="27" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">Binary Tree</text>
                <text x="46" y="42" fill="#0284C7" fontSize="10" fontWeight="600" fontFamily="sans-serif">DFS & BFS</text>
              </g>

              {/* Floating Solved Milestone Badge (Right) */}
              <g transform="translate(280, 180)" className="floating-badge-2">
                <rect x="0" y="0" width="115" height="65" rx="12" fill="#FFFFFF" filter="drop-shadow(0 8px 18px rgba(16, 185, 129, 0.15))" />
                <circle cx="25" cy="32" r="14" fill="#DCFCE7" />
                <path d="M20 32 L23 35 L30 28" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="46" y="27" fill="#0F172A" fontSize="11" fontWeight="700" fontFamily="sans-serif">Solved ✓</text>
                <text x="46" y="42" fill="#16A34A" fontSize="10" fontWeight="700" fontFamily="sans-serif">+100 Problems</text>
              </g>

              {/* Little Floating Pixel Star */}
              <g transform="translate(290, 45)">
                <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#FBBF24" />
              </g>
            </svg>
          </div>

          {/* Motivational Copy */}
          <div className="auth-brand-motivation">
            <div className="motivation-pill">
              <Sparkles size={13} />
              <span>Structured Interview Prep</span>
            </div>
            <h2 className="motivation-heading">{motivationalHeading}</h2>
            <p className="motivation-desc">{motivationalText}</p>

            <div className="motivation-checks">
              <div className="check-item">
                <CheckCircle2 size={16} className="text-sky" />
                <span>Curated ~400 Problem Library</span>
              </div>
              <div className="check-item">
                <CheckCircle2 size={16} className="text-sky" />
                <span>16+ Core Algorithmic Patterns</span>
              </div>
              <div className="check-item">
                <CheckCircle2 size={16} className="text-sky" />
                <span>Personal Notes & Solutions Archive</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT SIDE: CLEAN AUTHENTICATION CARD & FORM
            ==================================================================== */}
        <div className="auth-form-side">
          <div className="auth-card-wrapper">
            
            {/* Mobile Header with Logo & Back link */}
            <div className="mobile-auth-header">
              <Link to="/" className="auth-logo-link">
                <div className="auth-logo-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="6" fill="#18181B" />
                    <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#38BDF8" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.75" />
                    <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                    <circle cx="15" cy="12" r="1.5" fill="#F97316" />
                    <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                    <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                  </svg>
                </div>
                <span className="auth-logo-text">AlgoTrack</span>
              </Link>

              <Link to="/" className="mobile-back-link">
                <ArrowLeft size={16} />
              </Link>
            </div>

            {/* Form Title & Subtitle */}
            <div className="auth-form-heading-group">
              <h1 className="auth-main-title">{heading}</h1>
              <p className="auth-sub-title">{subheading}</p>
            </div>

            {/* Child Form Content */}
            <div className="auth-form-content">
              {children}
            </div>

            {/* Trust Footer */}
            <div className="auth-trust-footer">
              <ShieldCheck size={14} className="text-muted" />
              <span>Secure authentication powered by Supabase Auth</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
