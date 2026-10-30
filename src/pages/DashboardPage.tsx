import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  User, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  Calendar,
  Layers,
  KeyRound
} from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'AlgoTrack Engineer';
  const displayEmail = profile?.email || user?.email || 'N/A';
  const displayId = user?.id || 'N/A';
  const createdAt = profile?.created_at || user?.created_at ? new Date(profile?.created_at || user?.created_at || '').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Just now';

  return (
    <div className="dashboard-placeholder-page">
      {/* Top Navbar */}
      <header className="dashboard-nav">
        <div className="container dashboard-nav-container">
          <Link to="/" className="dash-logo-link">
            <div className="dash-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#18181B" />
                <path d="M7 12L11 8L15 12L11 16L7 12Z" fill="#38BDF8" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.75" />
                <circle cx="11" cy="8" r="1.5" fill="#38BDF8" />
                <circle cx="15" cy="12" r="1.5" fill="#F97316" />
                <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
                <circle cx="7" cy="12" r="1.5" fill="#38BDF8" />
              </svg>
            </div>
            <span className="dash-logo-text">AlgoTrack</span>
          </Link>

          <div className="dash-nav-actions">
            <Link to="/" className="btn btn-secondary dash-home-btn">
              <ArrowLeft size={15} />
              <span>Homepage</span>
            </Link>

            <button
              type="button"
              className="btn btn-primary dash-logout-btn"
              onClick={handleSignOut}
              title="Sign out of your session"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container dash-main-container">
        
        {/* Verification Success Banner */}
        <div className="dash-status-banner">
          <div className="status-icon-wrap">
            <ShieldCheck size={20} className="text-green" />
          </div>
          <div className="status-text-wrap">
            <h4 className="status-title">Phase 2: Authentication Session Verified & Active</h4>
            <p className="status-desc">
              Your Supabase user session and profile have been successfully loaded. The full personal practice workspace and problem tracking dashboards will be developed in Phase 3.
            </p>
          </div>
          <span className="status-pill-badge">Phase 2 Protected</span>
        </div>

        {/* User Profile Card */}
        <div className="dash-profile-card card-saas">
          <div className="profile-card-header">
            <div className="profile-avatar-large">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <div className="profile-name-row">
                <h1 className="profile-user-name">{displayName}</h1>
                <span className="auth-tier-pill">
                  <Sparkles size={12} className="text-gold" />
                  <span>Verified User</span>
                </span>
              </div>
              <p className="profile-user-email">{displayEmail}</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field-item">
              <span className="field-title">
                <User size={14} /> Full Name
              </span>
              <span className="field-value">{displayName}</span>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <Mail size={14} /> Registered Email
              </span>
              <span className="field-value">{displayEmail}</span>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <Calendar size={14} /> Account Created
              </span>
              <span className="field-value">{createdAt}</span>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <KeyRound size={14} /> Supabase Auth UID
              </span>
              <span className="field-value font-mono text-xs">{displayId}</span>
            </div>
          </div>

          <div className="profile-card-footer">
            <div className="supabase-status-indicator">
              <span className={`status-indicator-dot ${isConfigured ? 'live' : 'demo'}`}></span>
              <span>
                {isConfigured
                  ? 'Connected to Live Supabase Project'
                  : 'Local Development Test Session (Configure .env.local with Supabase URL & Key)'}
              </span>
            </div>
          </div>
        </div>

        {/* Phase 3 Notice Card */}
        <div className="dash-phase3-notice card-saas">
          <div className="notice-icon-box">
            <Layers size={22} className="text-sky" />
          </div>
          <div className="notice-content">
            <h3 className="notice-title">Ready for Phase 3: Personal Practice & Problem Workspaces</h3>
            <p className="notice-desc">
              Authentication is fully wired up! In the next phase, this space will transform into your personal algorithmic dashboard with ~400 curated interview problems, active progress meters, solution saving, and notes archives.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
