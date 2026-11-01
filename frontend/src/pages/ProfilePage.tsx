import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  TrendingUp, 
  Award, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Loader2, 
  Mail, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { 
  fetchUserProfileAnalytics, 
  type ProfileAnalyticsData 
} from '../services/profileService';
import { AppNavbar } from '../components/layout/AppNavbar';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Algo Developer';
  const displayEmail = profile?.email || user?.email || '';
  const displayUsername = profile?.username || user?.user_metadata?.username || displayEmail.split('@')[0];
  const targetRole = profile?.target_role || 'Software Engineer';
  const bio = profile?.bio || 'Preparing for top-tier software engineering algorithmic interviews.';
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026';

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await fetchUserProfileAnalytics(user.id);
          if (isMounted) setAnalytics(data);
        } catch (err) {
          console.error('Failed to load profile analytics:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [user?.id]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading && !analytics) {
    return (
      <div className="profile-loading-screen">
        <Loader2 size={36} className="spin-icon text-sky" />
        <p>Loading full performance profile & analytics...</p>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalAttempted: 0,
    totalUnsolved: 2913,
    totalProblems: 2913,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    activeDaysCount: 0,
  };

  return (
    <div className="profile-page-root">
      {/* 1. Fixed Global Top Navigation Bar */}
      <AppNavbar />

      {/* Sub-header Breadcrumb Bar */}
      <div className="profile-sub-navbar">
        <div className="profile-container profile-sub-inner">
          <div className="profile-sub-left">
            <Link to="/dashboard" className="profile-back-btn" title="Back to Dashboard">
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </Link>
            <span className="profile-sub-sep">/</span>
            <span className="profile-sub-crumb">Developer Profile & Analytics</span>
          </div>

          <div className="profile-sub-actions">
            <button
              type="button"
              className="profile-logout-pill-btn"
              onClick={handleLogout}
              title="Sign out of your account"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <main className="profile-main-layout">
        <div className="profile-container profile-grid">
          
          {/* ==============================================================
              LEFT COLUMN — User Identity Card & Quick Stats
              ============================================================== */}
          <aside className="profile-identity-col">
            <div className="profile-card profile-user-card">
              <div className="user-avatar-wrap">
                <div className="profile-avatar-circle">
                  {getInitials(displayName)}
                </div>
                <span className="profile-online-badge" title="Active"></span>
              </div>

              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-handle">@{displayUsername}</p>

              <div className="profile-role-pill">
                <Sparkles size={12} color="#0284C7" />
                <span>{targetRole}</span>
              </div>

              {bio && <p className="profile-bio-text">{bio}</p>}

              <div className="profile-meta-list">
                <div className="profile-meta-item">
                  <Mail size={14} className="text-muted" />
                  <span>{displayEmail}</span>
                </div>
                <div className="profile-meta-item">
                  <Calendar size={14} className="text-muted" />
                  <span>Joined {joinedDate}</span>
                </div>
                <div className="profile-meta-item">
                  <ShieldCheck size={14} color="#10B981" />
                  <span className="text-emerald">Supabase Verified</span>
                </div>
              </div>

              <div className="profile-streak-banner">
                <div className="streak-icon-box">
                  <Flame size={20} color="#F97316" />
                </div>
                <div className="streak-text-box">
                  <span className="streak-number">{stats.currentStreak} Day{stats.currentStreak === 1 ? '' : 's'}</span>
                  <span className="streak-label">Current Practice Streak</span>
                </div>
              </div>
            </div>

            {/* Learning Insights Card */}
            <div className="profile-card profile-insights-card">
              <h3 className="profile-card-title">
                <Award size={16} color="#0284C7" />
                <span>Learning Insights</span>
              </h3>

              <div className="insight-row">
                <span className="insight-label">Top Pattern:</span>
                <span className="insight-value highlighted">{analytics?.insights.mostPracticedTopic}</span>
              </div>

              <div className="insight-row">
                <span className="insight-label">Strongest Level:</span>
                <span className={`insight-value diff-${analytics?.insights.strongestDifficulty.toLowerCase()}`}>
                  {analytics?.insights.strongestDifficulty}
                </span>
              </div>

              <div className="insight-row">
                <span className="insight-label">Focus Area:</span>
                <span className="insight-value">{analytics?.insights.weakestTopic}</span>
              </div>

              <div className="insight-row">
                <span className="insight-label">Consistency:</span>
                <span className="insight-value">{analytics?.insights.practiceConsistency}</span>
              </div>
            </div>
          </aside>

          {/* ==============================================================
              RIGHT COLUMN — Performance Analytics & Progress Charts
              ============================================================== */}
          <section className="profile-analytics-col">
            
            {/* 1. Solved Breakdown Cards */}
            <div className="profile-stats-grid">
              <div className="stat-summary-card total">
                <div className="stat-card-top">
                  <span className="stat-card-title">Total Solved</span>
                  <Trophy size={18} color="#0284C7" />
                </div>
                <div className="stat-card-value">
                  {stats.totalSolved} <span className="stat-card-total">/ {stats.totalProblems}</span>
                </div>
                <div className="stat-card-bar">
                  <div className="stat-progress-fill" style={{ width: `${Math.min(100, (stats.totalSolved / stats.totalProblems) * 100)}%` }} />
                </div>
              </div>

              <div className="stat-summary-card easy">
                <div className="stat-card-top">
                  <span className="stat-card-title">Easy Solved</span>
                  <CheckCircle2 size={18} color="#059669" />
                </div>
                <div className="stat-card-value text-emerald">
                  {stats.easySolved} <span className="stat-card-total">/ 763</span>
                </div>
                <div className="stat-card-bar">
                  <div className="stat-progress-fill easy" style={{ width: `${Math.min(100, (stats.easySolved / 763) * 100)}%` }} />
                </div>
              </div>

              <div className="stat-summary-card medium">
                <div className="stat-card-top">
                  <span className="stat-card-title">Medium Solved</span>
                  <Clock size={18} color="#D97706" />
                </div>
                <div className="stat-card-value text-amber">
                  {stats.mediumSolved} <span className="stat-card-total">/ 1,464</span>
                </div>
                <div className="stat-card-bar">
                  <div className="stat-progress-fill medium" style={{ width: `${Math.min(100, (stats.mediumSolved / 1464) * 100)}%` }} />
                </div>
              </div>

              <div className="stat-summary-card hard">
                <div className="stat-card-top">
                  <span className="stat-card-title">Hard Solved</span>
                  <CircleDot size={18} color="#DC2626" />
                </div>
                <div className="stat-card-value text-rose">
                  {stats.hardSolved} <span className="stat-card-total">/ 686</span>
                </div>
                <div className="stat-card-bar">
                  <div className="stat-progress-fill hard" style={{ width: `${Math.min(100, (stats.hardSolved / 686) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* 2. Practice Activity Heatmap (GitHub Style 365 Days) */}
            <div className="profile-card profile-heatmap-card">
              <div className="card-header-flex">
                <h3 className="profile-card-title">
                  <Calendar size={17} color="#0284C7" />
                  <span>Practice Activity (Last 365 Days)</span>
                </h3>
                <span className="heatmap-active-days">{stats.activeDaysCount} Active Days</span>
              </div>
              <p className="profile-card-subtitle">
                Visualizing your authentic problem solving and study consistency over time.
              </p>

              <div className="heatmap-scroll-container">
                <div className="heatmap-calendar-grid">
                  {analytics?.activityHeatmap.map((day, idx) => {
                    const level = day.count >= 4 ? 4 : day.count >= 2 ? 3 : day.count >= 1 ? 2 : 0;
                    return (
                      <div 
                        key={idx}
                        className={`heatmap-cell level-${level}`}
                        title={`${day.date}: ${day.count} problem${day.count === 1 ? '' : 's'} solved / recorded`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="heatmap-legend">
                <span>Less</span>
                <span className="heatmap-cell level-0"></span>
                <span className="heatmap-cell level-2"></span>
                <span className="heatmap-cell level-3"></span>
                <span className="heatmap-cell level-4"></span>
                <span>More</span>
              </div>
            </div>

            {/* 3. Topic-Wise Performance */}
            <div className="profile-card profile-topics-card">
              <h3 className="profile-card-title">
                <TrendingUp size={17} color="#0284C7" />
                <span>Topic & Pattern Mastery</span>
              </h3>
              <p className="profile-card-subtitle">
                Progress tracking across algorithmic interview topics.
              </p>

              <div className="topic-bars-grid">
                {analytics?.topicStats.map((item) => (
                  <div key={item.topic} className="topic-bar-row">
                    <div className="topic-bar-header">
                      <span className="topic-name">{item.topic}</span>
                      <span className="topic-counts">
                        <strong>{item.solved}</strong> / {item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="topic-bar-track">
                      <div 
                        className="topic-bar-fill" 
                        style={{ width: `${Math.max(2, item.percentage)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Recent Problem Activity */}
            <div className="profile-card profile-recent-activity-card">
              <h3 className="profile-card-title">
                <Clock size={17} color="#0284C7" />
                <span>Recent Problem Activity</span>
              </h3>

              {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                <div className="recent-activity-list">
                  {analytics.recentActivity.map((item) => (
                    <div key={item.id} className="recent-activity-item">
                      <div className="activity-item-left">
                        <span className={`activity-status-dot ${item.actionType}`} />
                        <div className="activity-info">
                          <span className="activity-problem-title">{item.problemTitle}</span>
                          <span className="activity-timestamp">
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="activity-item-right">
                        <span className={`activity-diff-badge ${item.difficulty.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                        <Link 
                          to={`/problems/${item.problemId}`}
                          className="activity-open-link"
                          title="Open in Workspace"
                        >
                          <span>Workspace</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="recent-activity-empty">
                  <p>No recent activity logs recorded yet. Start solving problems to track your learning journey!</p>
                  <Link to="/problems" className="profile-btn-primary">
                    <span>Browse Problems</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              )}
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};
