import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  onAuthPlaceholderClick?: (action: string) => void;
  isNightMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isNightMode = true, onToggleTheme }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);

      // Simple scroll spy in DOM order
      const sections = ['problem-library', 'progress-tracking', 'how-it-works', 'features', 'faq'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="brand-logo"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a 
                href="#features" 
                className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#how-it-works" 
                className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'how-it-works')}
              >
                How It Works
              </a>
            </li>
            <li>
              <a 
                href="#problem-library" 
                className={`nav-link ${activeSection === 'problem-library' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'problem-library')}
              >
                Problem Library
              </a>
            </li>
            <li>
              <a 
                href="#progress-tracking" 
                className={`nav-link ${activeSection === 'progress-tracking' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'progress-tracking')}
              >
                Progress Tracking
              </a>
            </li>
            <li>
              <a 
                href="#faq" 
                className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'faq')}
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        {/* Right CTA / Auth Entrypoints */}
        <div className="navbar-actions">
          {/* Celestial Theme Toggle */}
          {onToggleTheme && (
            <button 
              type="button" 
              className="navbar-theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle celestial sky background"
              title={isNightMode ? 'Switch to Day Sky' : 'Switch to Night Sky'}
            >
              <div className="toggle-capsule">
                <span className={`toggle-orb ${isNightMode ? 'night' : 'day'}`}>
                  {isNightMode ? <Moon size={13} /> : <Sun size={13} />}
                </span>
              </div>
            </button>
          )}

          {user ? (
            <Link 
              to="/dashboard" 
              className="btn btn-primary nav-getstarted-btn"
              title="Open Dashboard"
            >
              <span>Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-ghost nav-signin-btn"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary nav-getstarted-btn"
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-nav" aria-label="Mobile Navigation">
              <ul className="mobile-nav-links">
                <li>
                  <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')}>
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#problem-library" onClick={(e) => handleNavClick(e, 'problem-library')}>
                    Problem Library
                  </a>
                </li>
                <li>
                  <a href="#progress-tracking" onClick={(e) => handleNavClick(e, 'progress-tracking')}>
                    Progress Tracking
                  </a>
                </li>
                <li>
                  <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>
                    FAQ
                  </a>
                </li>
              </ul>

              <div className="mobile-menu-actions">
                {onToggleTheme && (
                  <button 
                    type="button" 
                    className="navbar-theme-toggle w-full"
                    onClick={onToggleTheme}
                    style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <div className="toggle-capsule">
                      <span className={`toggle-orb ${isNightMode ? 'night' : 'day'}`}>
                        {isNightMode ? <Moon size={13} /> : <Sun size={13} />}
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>
                      {isNightMode ? 'Celestial Night' : 'Day Sky Mode'}
                    </span>
                  </button>
                )}

                {user ? (
                  <Link 
                    to="/dashboard"
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="btn btn-secondary w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register"
                      className="btn btn-primary w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Get Started</span>
                      <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
