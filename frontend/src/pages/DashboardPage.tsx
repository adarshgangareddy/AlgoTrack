import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ActivityOverview } from '../components/dashboard/ActivityOverview';
import { DifficultyProgress } from '../components/dashboard/DifficultyProgress';
import { TopicProgress } from '../components/dashboard/TopicProgress';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { QuickActions } from '../components/dashboard/QuickActions';
import { DashboardSearchModal } from '../components/dashboard/DashboardSearchModal';
import { UserProfileModal } from '../components/dashboard/UserProfileModal';
import { 
  fetchUserDashboardData, 
  createEmptyDashboardData, 
  type DashboardData 
} from '../services/dashboardService';
import '../components/dashboard/DashboardLayout.css';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Dashboard UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<DashboardData>(createEmptyDashboardData());
  const [loading, setLoading] = useState(true);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Coder';

  // Load real data from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await fetchUserDashboardData(user.id);
          if (isMounted) setDashboardData(data);
        } catch (err) {
          console.error('[AlgoTrack] Error loading dashboard data:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'profile') {
      setProfileModalOpen(true);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-app-container">
      {/* 1. Left Sidebar Navigation */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeSection={activeSection}
        onSelectSection={(sec) => scrollToSection(sec)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* 2. Main Wrapper */}
      <div className={`dashboard-main-wrapper ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        {/* Top Header */}
        <DashboardHeader
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        {/* Dashboard Content Body */}
        <main className="dashboard-content-body" id="overview">
          {/* Section 4: Welcome Banner Card */}
          <div className="dashboard-welcome-banner">
            <div className="welcome-banner-text">
              <div className="welcome-badge-pill">
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" color="#0284C7" />
                    <span>Syncing Practice Metrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} color="#0284C7" />
                    <span>AlgoTrack Practice Engine</span>
                  </>
                )}
              </div>
              <h1 className="welcome-heading">
                Hello, {displayName}!
              </h1>
              <p className="welcome-subtitle">
                Here's your coding practice overview. Track your problem-solving consistency, explore algorithmic patterns, and master coding interviews.
              </p>
            </div>

            {/* Custom Colourful Coding Illustration */}
            <div className="welcome-banner-illustration" aria-hidden="true">
              <svg width="200" height="130" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Desk Surface */}
                <rect x="20" y="95" width="160" height="8" rx="4" fill="#0284C7" fillOpacity="0.25" />
                
                {/* Laptop Base & Screen */}
                <rect x="55" y="45" width="90" height="52" rx="6" fill="#18181B" />
                <rect x="60" y="50" width="80" height="42" rx="3" fill="#0F172A" />
                {/* Code syntax lines */}
                <rect x="66" y="56" width="30" height="3" rx="1.5" fill="#38BDF8" />
                <rect x="74" y="62" width="45" height="3" rx="1.5" fill="#FDE047" />
                <rect x="74" y="68" width="36" height="3" rx="1.5" fill="#34D399" />
                <rect x="74" y="74" width="40" height="3" rx="1.5" fill="#F472B6" />
                <rect x="66" y="80" width="22" height="3" rx="1.5" fill="#38BDF8" />

                {/* Floating Algorithm Graph Node Badges */}
                <circle cx="35" cy="40" r="14" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
                <path d="M30 40L34 36L38 40L34 44L30 40Z" fill="#F97316" />

                <circle cx="165" cy="35" r="14" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
                <path d="M161 35H169M165 31V39" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />

                {/* Glowing Coffee Cup */}
                <rect x="150" y="80" width="14" height="15" rx="3" fill="#F97316" />
                <path d="M164 84C166 84 167 86 167 88C167 90 166 92 164 92" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                <path d="M154 75C154 73 156 71 157 70" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Section 5: 4 Main Summary Cards */}
          <SummaryCards 
            summary={dashboardData.summary} 
            isLibraryLoaded={dashboardData.isLibraryLoaded} 
          />

          {/* Section 6: Large Activity Visualization (Equa-inspired) */}
          <ActivityOverview 
            activityData={dashboardData.dailyActivity} 
          />

          {/* Sections 7 & 8: Split Grid for Difficulty & Topic Progress */}
          <div className="dashboard-split-grid">
            <DifficultyProgress 
              difficulties={dashboardData.difficulties} 
              isLibraryLoaded={dashboardData.isLibraryLoaded}
            />

            <TopicProgress 
              topics={dashboardData.topics} 
              isLibraryLoaded={dashboardData.isLibraryLoaded}
            />
          </div>

          {/* Sections 9 & 10: Lower Grid for Recent Activity & Quick Actions */}
          <div className="dashboard-bottom-grid">
            <RecentActivity 
              activityList={dashboardData.recentActivity} 
            />

            <QuickActions 
              onScrollToActivity={() => scrollToSection('activity-overview')} 
            />
          </div>
        </main>
      </div>

      {/* Global Command / Search Modal (Ctrl+K) */}
      <DashboardSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigateSection={(sec) => scrollToSection(sec)}
      />

      {/* User Profile & Account Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
