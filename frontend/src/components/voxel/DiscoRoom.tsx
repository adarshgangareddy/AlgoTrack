import React from 'react';

export const DiscoRoom: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-room-wrapper disco-room ${className}`}>
      <svg viewBox="0 0 200 180" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft ground shadow */}
        <polygon points="100,175 188,125 100,75 12,125" fill="rgba(10, 8, 30, 0.6)" />

        {/* Room Floor (Matrix Glowing Checkerboard) */}
        <polygon points="100,160 182,112 100,64 18,112" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        
        {/* Glowing Matrix Grid Tiles */}
        <g opacity="0.85">
          <polygon points="100,160 82,149 100,138 118,149" fill="#047857" stroke="#10B981" strokeWidth="1" />
          <polygon points="64,138 46,127 64,116 82,127" fill="#065F46" stroke="#34D399" strokeWidth="1" />
          <polygon points="136,138 118,127 136,116 154,127" fill="#065F46" stroke="#34D399" strokeWidth="1" />
          <polygon points="100,138 82,127 100,116 118,127" fill="#047857" stroke="#6EE7B7" strokeWidth="1" />
          <polygon points="100,116 82,105 100,94 118,105" fill="#065F46" stroke="#34D399" strokeWidth="1" />
          <polygon points="136,116 118,105 136,94 154,105" fill="#047857" stroke="#10B981" strokeWidth="1" />
          <polygon points="64,116 46,105 64,94 82,105" fill="#047857" stroke="#10B981" strokeWidth="1" />
        </g>

        {/* Dance Floor Podium plaque in center */}
        <polygon points="100,146 114,138 100,130 86,138" fill="#18181B" stroke="#A855F7" strokeWidth="1" />
        <text x="91" y="139" fill="#E2E8F0" fontSize="4.5" fontWeight="800" fontFamily="monospace">DEV BEAT</text>

        {/* Left Wall (Dark Cyber Wall with Neon Green Audio Monitors) */}
        <polygon points="18,112 18,32 100,5 100,64" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        
        {/* Left Wall Big Equalizer / Speaker Stacks */}
        <polygon points="25,50 45,43 45,95 25,102" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
        <circle cx="35" cy="58" r="4.5" fill="#10B981" />
        <circle cx="35" cy="72" r="4.5" fill="#10B981" />
        <circle cx="35" cy="86" r="4.5" fill="#10B981" />

        <polygon points="50,41 70,34 70,86 50,93" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
        <circle cx="60" cy="49" r="4.5" fill="#10B981" />
        <circle cx="60" cy="63" r="4.5" fill="#10B981" />
        <circle cx="60" cy="77" r="4.5" fill="#10B981" />

        {/* Right Wall (Dark Cyber Wall with DJ Screen & Neon Green Speakers) */}
        <polygon points="100,64 100,5 182,32 182,112" fill="#0F172A" stroke="#334155" strokeWidth="1" />

        {/* Right Wall DJ Visual Screen */}
        <polygon points="108,36 150,50 150,78 108,64" fill="#581C87" stroke="#C084FC" strokeWidth="1.5" />
        <polygon points="112,40 146,51 146,74 112,63" fill="#3B0764" />
        {/* Triangle DJ graphic */}
        <polygon points="129,48 140,65 118,65" fill="#E879F9" opacity="0.8" />

        {/* Hanging Disco Ball (Sparkling in Center) */}
        <line x1="100" y1="5" x2="100" y2="35" stroke="#94A3B8" strokeWidth="1.2" />
        <circle cx="100" cy="42" r="9" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
        {/* Mirror tiles on disco ball */}
        <line x1="93" y1="42" x2="107" y2="42" stroke="#94A3B8" strokeWidth="0.8" />
        <line x1="95" y1="38" x2="105" y2="38" stroke="#94A3B8" strokeWidth="0.8" />
        <line x1="95" y1="46" x2="105" y2="46" stroke="#94A3B8" strokeWidth="0.8" />
        {/* Disco sparkle rays */}
        <path d="M100,30 L100,32 M100,52 L100,54 M88,42 L90,42 M110,42 L112,42" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="103" cy="39" r="1.5" fill="#FFFFFF" />

        {/* 3 Pixel Characters Dancing */}
        {/* Character 1 (Left - Brown Jacket) */}
        <g transform="translate(60, 95)">
          <ellipse cx="6" cy="28" rx="6" ry="2" fill="rgba(0,0,0,0.4)" />
          <rect x="3" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="7" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="3" y="17" width="3" height="7" fill="#1E293B" />
          <rect x="7" y="17" width="3" height="7" fill="#1E293B" />
          <rect x="2" y="8" width="9" height="10" fill="#B45309" rx="1" />
          <rect x="3" y="2" width="7" height="6" fill="#FCD34D" rx="1" />
          <rect x="2" y="1" width="9" height="3" fill="#451A03" />
        </g>

        {/* Character 2 (Center - DJ with Shades) */}
        <g transform="translate(94, 98)">
          <ellipse cx="6" cy="28" rx="6" ry="2" fill="rgba(0,0,0,0.4)" />
          <rect x="3" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="7" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="3" y="17" width="3" height="7" fill="#2563EB" />
          <rect x="7" y="17" width="3" height="7" fill="#2563EB" />
          <rect x="2" y="8" width="9" height="10" fill="#0F172A" rx="1" />
          <rect x="3" y="2" width="7" height="6" fill="#FCD34D" rx="1" />
          <rect x="2" y="1" width="9" height="3" fill="#18181B" />
          <rect x="3" y="4" width="7" height="2" fill="#0F172A" />
        </g>

        {/* Character 3 (Right - Blue Tee) */}
        <g transform="translate(130, 100)">
          <ellipse cx="6" cy="28" rx="6" ry="2" fill="rgba(0,0,0,0.4)" />
          <rect x="3" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="7" y="24" width="3" height="4" fill="#FFFFFF" />
          <rect x="3" y="17" width="3" height="7" fill="#475569" />
          <rect x="7" y="17" width="3" height="7" fill="#475569" />
          <rect x="2" y="8" width="9" height="10" fill="#0284C7" rx="1" />
          <rect x="3" y="2" width="7" height="6" fill="#FCD34D" rx="1" />
          <rect x="2" y="1" width="9" height="3" fill="#3B82F6" />
        </g>
      </svg>
    </div>
  );
};
