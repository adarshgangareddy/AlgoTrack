import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  User, 
  LogOut, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onToggleMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleMobileMenu,
  onOpenSearch,
  onOpenProfile,
}) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
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

  return (
    <header className="dashboard-top-header">
      {/* Left: Mobile Menu & Global Search Bar */}
      <div className="header-left-actions">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search / Command Bar Trigger */}
        <div 
          className="header-search-bar" 
          onClick={onOpenSearch} 
          role="button" 
          tabIndex={0}
          title="Search dashboard sections (Ctrl+K)"
        >
          <Search size={16} />
          <span>Search dashboard, topics & activity...</span>
          <span className="kbd-shortcut">Ctrl+K</span>
        </div>
      </div>

      {/* Right: User Profile Menu */}
      <div className="header-right-actions">
        <div className="header-profile-menu-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="header-profile-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-expanded={profileDropdownOpen}
            aria-label="User account menu"
          >
            <div className="user-avatar-circle">
              {getInitials(displayName)}
            </div>
            <span className="header-profile-name">{displayName}</span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {/* Profile Dropdown Card */}
          {profileDropdownOpen && (
            <div className="profile-dropdown-card">
              <div className="profile-dropdown-header">
                <span className="dropdown-user-name">{displayName}</span>
                <span className="dropdown-user-email">{displayEmail}</span>
                <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <ShieldCheck size={12} /> Supabase Verified
                </span>
              </div>

              <div className="dropdown-menu-list">
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenProfile();
                  }}
                >
                  <User size={15} />
                  <span>View Profile</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/');
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Public Homepage</span>
                </button>

                <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                <button
                  type="button"
                  className="dropdown-menu-item logout-danger"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
