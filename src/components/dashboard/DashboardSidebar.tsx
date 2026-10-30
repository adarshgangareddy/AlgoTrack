import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Code2, 
  BarChart3, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onOpenProfile: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeSection,
  onSelectSection,
  onOpenProfile,
}) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="dashboard-modal-backdrop" 
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{ zIndex: 99 }}
        />
      )}

      <aside className={`dashboard-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className={`sidebar-header ${isCollapsed ? 'is-collapsed' : ''}`}>
          {isCollapsed ? (
            <button
              type="button"
              className="sidebar-collapsed-brand-btn"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <div className="brand-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            </button>
          ) : (
            <>
              <Link to="/dashboard" className="sidebar-brand" onClick={onCloseMobile}>
                <div className="brand-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              {/* Desktop Collapse Toggle */}
              <button 
                type="button" 
                className="sidebar-toggle-btn"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav-container">
          <div className="sidebar-nav-top">
            {/* Main Navigation */}
            <div className="nav-section">
              {!isCollapsed && <span className="nav-section-title">Main Menu</span>}

              <button
                type="button"
                className={`nav-item-btn ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  onSelectSection('overview');
                  onCloseMobile();
                }}
                title="Overview"
              >
                <LayoutDashboard size={18} />
                {!isCollapsed && <span>Overview</span>}
              </button>

              <button
                type="button"
                className="nav-item-btn disabled"
                title="Problems Library (Phase 4)"
              >
                <Code2 size={18} />
                {!isCollapsed && (
                  <>
                    <span>Problems</span>
                    <span className="nav-badge">Phase 4</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="nav-item-btn disabled"
                title="Advanced Analytics (Phase 5)"
              >
                <BarChart3 size={18} />
                {!isCollapsed && (
                  <>
                    <span>Analytics</span>
                    <span className="nav-badge">Phase 5</span>
                  </>
                )}
              </button>
            </div>

            {/* Account & Profile Navigation */}
            <div className="nav-section" style={{ marginTop: '28px' }}>
              {!isCollapsed && <span className="nav-section-title">Account</span>}

              <button
                type="button"
                className="nav-item-btn"
                onClick={() => {
                  onOpenProfile();
                  onCloseMobile();
                }}
                title="Your Profile"
              >
                <User size={18} />
                {!isCollapsed && <span>Profile</span>}
              </button>

              <button
                type="button"
                className="nav-item-btn disabled"
                title="Settings (Phase 5)"
              >
                <Settings size={18} />
                {!isCollapsed && (
                  <>
                    <span>Settings</span>
                    <span className="nav-badge">Soon</span>
                  </>
                )}
              </button>

              <Link
                to="/"
                className="nav-item-btn"
                onClick={onCloseMobile}
                title="View Homepage"
              >
                <ExternalLink size={18} />
                {!isCollapsed && <span>Public Home</span>}
              </Link>
            </div>
          </div>

          {/* Bottom Logout & User Profile Quick View */}
          <div className="sidebar-nav-bottom">
            <button
              type="button"
              className="nav-item-btn"
              onClick={handleLogout}
              style={{ color: '#EF4444' }}
              title="Sign Out"
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            {!isCollapsed && (
              <div 
                className="sidebar-user-pill" 
                onClick={onOpenProfile} 
                role="button" 
                tabIndex={0}
                title="Click to view profile"
              >
                <div className="user-avatar-circle">
                  {getInitials(profile?.full_name || user?.user_metadata?.full_name || user?.email)}
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Algo Developer'}
                  </span>
                  <span className="user-pill-status">
                    <Sparkles size={11} /> Authenticated
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
