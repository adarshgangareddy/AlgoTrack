// src/components/layout/AppNavbar.tsx
// AlgoTrack: Fixed Global Top Navigation Bar across Dashboard, Problems, and Profile

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  LogOut, 
  Code2, 
  LayoutDashboard, 
  ChevronDown,
  Menu,
  X,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AppNavbar.css';

interface AppNavbarProps {
  onOpenSearch?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ onOpenSearch }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Coder';
  const displayEmail = profile?.email || user?.email || '';

  const getInitials = (name?: string) => {
    if (!name) return 'AT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' && !location.hash;
    if (path === '/problems') return location.pathname === '/problems' || location.pathname.startsWith('/problems/');
    if (path === '/history') return location.pathname === '/dashboard' && (location.hash === '#recent-activity' || location.hash === '#history');
    return false;
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    if (location.pathname === '/dashboard') {
      e.preventDefault();
      const el = document.getElementById('recent-activity');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/dashboard#recent-activity');
      }
    }
  };

  return (
    <header className="app-global-navbar">
      <div className="app-navbar-container">
        {/* Left: Brand Logo + Primary Nav Links */}
        <div className="navbar-left-group">
          {/* Logo linking directly to /dashboard */}
          <Link to="/dashboard" className="navbar-brand-logo" title="AlgoTrack Dashboard">
            <div className="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#18181B" />
                <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#0284C7" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1.75" strokeLinejoin="round" />
                <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                <circle cx="15" cy="12" r="1.5" fill="#0284C7" />
                <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                <path d="M15 12H18" stroke="#F97316" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="18" cy="12" r="1.75" fill="#F97316" />
              </svg>
            </div>
            <span className="brand-title">AlgoTrack</span>
          </Link>

          <span className="navbar-divider">|</span>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links-nav" aria-label="Main Navigation">
            <Link 
              to="/dashboard" 
              className={`nav-tab-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/problems" 
              className={`nav-tab-link ${isActive('/problems') ? 'active' : ''}`}
            >
              <Code2 size={15} />
              <span>Problems</span>
            </Link>

            {/* Problems History in Navbar */}
            <Link 
              to="/dashboard#recent-activity" 
              className={`nav-tab-link ${isActive('/history') ? 'active' : ''}`}
              onClick={handleHistoryClick}
              title="Recent Problems History & Activity"
            >
              <History size={15} />
              <span>Problems History</span>
            </Link>
          </nav>
        </div>

        {/* Right: Search Symbol/Name + Direct Profile Icon & Dropdown */}
        <div className="navbar-right-group">
          {/* Search Trigger with Symbol & Name */}
          <button
            type="button"
            className="navbar-search-btn"
            onClick={() => {
              if (onOpenSearch) {
                onOpenSearch();
              } else {
                navigate('/problems');
              }
            }}
            title="Search challenges and topics (Ctrl+K)"
          >
            <Search size={14} />
            <span className="search-btn-label">Search</span>
            <span className="search-kbd-chip">Ctrl+K</span>
          </button>

          {/* User Profile: Clicking Avatar Opens My Profile & Analytics Directly */}
          <div className="navbar-profile-wrapper" ref={dropdownRef}>
            <div className="navbar-profile-pill-group">
              {/* Profile icon links directly to /profile */}
              <Link
                to="/profile"
                className="navbar-avatar-direct-btn"
                title="Open My Profile & Analytics"
              >
                <div className="navbar-avatar-circle">
                  {getInitials(displayName)}
                </div>
                <span className="navbar-user-chip-name">{displayName.split(' ')[0]}</span>
              </Link>

              {/* Chevron toggles quick account menu */}
              <button
                type="button"
                className="navbar-avatar-menu-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                title="User Account Menu"
              >
                <ChevronDown size={13} className={`dropdown-arrow ${dropdownOpen ? 'rotated' : ''}`} />
              </button>
            </div>

            {dropdownOpen && (
              <div className="navbar-dropdown-card">
                <div className="dropdown-user-info">
                  <span className="user-name">{displayName}</span>
                  <span className="user-email">{displayEmail}</span>
                </div>

                <div className="dropdown-divider"></div>

                <Link 
                  to="/profile" 
                  className="dropdown-menu-item highlighted"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={14} />
                  <span>My Profile & Analytics</span>
                </Link>

                <Link 
                  to="/dashboard#recent-activity" 
                  className="dropdown-menu-item"
                  onClick={(e) => {
                    setDropdownOpen(false);
                    handleHistoryClick(e);
                  }}
                >
                  <History size={14} />
                  <span>Problems History</span>
                </Link>

                <Link 
                  to="/problems" 
                  className="dropdown-menu-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Code2 size={14} />
                  <span>Problems Library</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-menu-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile 3-Lines Hamburger Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="navbar-mobile-backdrop" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true" 
          />
          <div className="navbar-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Drawer">
            {/* Drawer Top Bar */}
            <div className="mobile-drawer-top">
              <Link to="/dashboard" className="mobile-drawer-brand" onClick={() => setMobileMenuOpen(false)}>
                <div className="brand-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="6" fill="#18181B" />
                    <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#0284C7" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1.75" strokeLinejoin="round" />
                    <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                    <circle cx="15" cy="12" r="1.5" fill="#0284C7" />
                    <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                    <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
                    <path d="M15 12H18" stroke="#F97316" strokeWidth="1.75" strokeLinecap="round" />
                    <circle cx="18" cy="12" r="1.75" fill="#F97316" />
                  </svg>
                </div>
                <span className="brand-title">AlgoTrack</span>
              </Link>

              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card in Drawer */}
            <Link 
              to="/profile" 
              className="mobile-drawer-profile-card"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="navbar-avatar-circle">
                {getInitials(displayName)}
              </div>
              <div className="mobile-drawer-user-info">
                <span className="drawer-user-name">{displayName}</span>
                <span className="drawer-user-email">{displayEmail}</span>
              </div>
            </Link>

            {/* Quick Search in Drawer */}
            <button
              type="button"
              className="mobile-drawer-search-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSearch) onOpenSearch();
                else navigate('/problems');
              }}
            >
              <Search size={15} />
              <span>Search Problems...</span>
            </button>

            {/* Navigation Links */}
            <nav className="mobile-drawer-nav">
              <Link 
                to="/dashboard" 
                className={`mobile-drawer-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/problems" 
                className={`mobile-drawer-link ${isActive('/problems') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Code2 size={18} />
                <span>Problems Library</span>
              </Link>
              <Link 
                to="/dashboard#recent-activity" 
                className={`mobile-drawer-link ${isActive('/history') ? 'active' : ''}`}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleHistoryClick(e);
                }}
              >
                <History size={18} />
                <span>Problems History</span>
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-drawer-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>My Profile & Analytics</span>
              </Link>
            </nav>

            {/* Drawer Footer with Log Out */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="mobile-drawer-logout-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
