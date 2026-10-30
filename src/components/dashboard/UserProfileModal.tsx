import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Algo Developer';
  const displayEmail = profile?.email || user?.email || 'user@example.com';
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member';
  const userUid = user?.id || 'simulated-user-uid';

  const getInitials = (name?: string) => {
    if (!name) return 'AT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div 
        className="dashboard-search-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#0284C7" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              User Profile
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Header */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', 
            borderRadius: '16px',
            border: '1px solid #BAE6FD',
            marginBottom: '20px'
          }}
        >
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              flexShrink: 0
            }}
          >
            {getInitials(displayName)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayEmail}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', background: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                AlgoTrack Member
              </span>
            </div>
          </div>
        </div>

        {/* Account Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <Calendar size={16} color="#0284C7" />
              <span>Joined Date</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{joinedDate}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span>Supabase Connection</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: isConfigured ? '#10B981' : '#F59E0B' }}>
              {isConfigured ? 'Active & Verified' : 'Local Auth Fallback'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <KeyRound size={16} color="#6366F1" />
              <span>Account UID</span>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
              {userUid.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
