import React, { useState, useEffect, useRef } from 'react';
import { Search, X, LayoutDashboard, BarChart2, Layers, Tag, History, User } from 'lucide-react';

interface DashboardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const DashboardSearchModal: React.FC<DashboardSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', title: 'Dashboard Overview', desc: 'Summary cards and practice statistics', icon: <LayoutDashboard size={16} /> },
    { id: 'activity-overview', title: 'Coding Activity Chart', desc: 'Weekly and 12-week activity visualization', icon: <BarChart2 size={16} /> },
    { id: 'difficulty-progress', title: 'Difficulty Breakdown', desc: 'Easy, Medium, and Hard progress metrics', icon: <Layers size={16} /> },
    { id: 'topic-progress', title: 'Topic Progress', desc: 'Arrays, Strings, Trees, Dynamic Programming...', icon: <Tag size={16} /> },
    { id: 'recent-activity', title: 'Recent Activity', desc: 'Latest attempts and problem solve history', icon: <History size={16} /> },
    { id: 'profile', title: 'User Profile & Security', desc: 'Account metadata and Supabase session', icon: <User size={16} /> },
  ];

  const filtered = sections.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div className="dashboard-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={18} color="#64748B" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Jump to section or search algorithms (e.g. Activity, Arrays, Topics)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="search-modal-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              No sections match "{query}". Problem title indexing will be enabled in Phase 4.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="search-result-item"
                onClick={() => {
                  onNavigateSection(item.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#0284C7' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{item.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Jump</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
