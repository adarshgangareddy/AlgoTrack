import React from 'react';

export const DevLabRoom: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-room-wrapper dev-lab-room ${className}`}>
      <svg viewBox="0 0 200 170" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow underneath room */}
        <polygon points="100,165 190,115 100,70 10,115" fill="rgba(10, 8, 30, 0.55)" />

        {/* Room Floor (Isometric Diamond) */}
        <polygon points="100,150 185,103 100,56 15,103" fill="#E2E8F0" />
        <polygon points="100,150 185,103 100,56 15,103" stroke="#CBD5E1" strokeWidth="1" />
        {/* Floor Tiles Grid */}
        <path d="M43,87 L128,134 M72,71 L157,118 M128,71 L43,118 M157,87 L72,134" stroke="#CBD5E1" strokeWidth="0.8" opacity="0.6" />
        {/* Yellow floor warning square */}
        <polygon points="135,115 155,104 140,96 120,107" fill="#FEF08A" stroke="#FACC15" strokeWidth="1" />

        {/* Left Wall (Isometric Back-Left) */}
        <polygon points="15,103 15,25 100,0 100,56" fill="#F8FAFC" />
        <polygon points="15,103 15,25 100,0 100,56" stroke="#E2E8F0" strokeWidth="1" />

        {/* Right Wall (Isometric Back-Right) */}
        <polygon points="100,56 100,0 185,25 185,103" fill="#EDF2F7" />
        <polygon points="100,56 100,0 185,25 185,103" stroke="#E2E8F0" strokeWidth="1" />

        {/* Left Wall Decor: "01" Orange Banner & Server Monitors */}
        <polygon points="18,32 38,26 38,55 18,61" fill="#F97316" />
        <text x="22" y="50" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">01</text>
        
        {/* Server status monitors on left wall */}
        <polygon points="44,28 92,14 92,45 44,59" fill="#1E293B" />
        <rect x="48" y="32" width="18" height="10" rx="1" fill="#0F172A" transform="skewY(-15)" />
        <line x1="50" y1="36" x2="63" y2="33" stroke="#34D399" strokeWidth="1.5" />
        <line x1="50" y1="39" x2="59" y2="37" stroke="#38BDF8" strokeWidth="1.5" />

        <rect x="70" y="26" width="18" height="10" rx="1" fill="#0F172A" transform="skewY(-15)" />
        <line x1="72" y1="30" x2="84" y2="27" stroke="#F43F5E" strokeWidth="1.5" />
        <line x1="72" y1="33" x2="81" y2="31" stroke="#FBBF24" strokeWidth="1.5" />

        {/* Right Wall Decor: "ROOMS.xyz / DEV LAB" Neon Board */}
        <polygon points="110,14 175,32 175,56 110,38" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <text x="114" y="30" fill="#3B82F6" fontSize="7" fontWeight="800" fontFamily="monospace" transform="skewY(15)">ROOMS.xyz</text>
        <text x="114" y="42" fill="#EC4899" fontSize="9" fontWeight="900" fontFamily="sans-serif" transform="skewY(15)">DEV LAB</text>

        {/* Standing Whiteboard/Chart on Right Wall */}
        <polygon points="120,44 140,50 140,78 120,72" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="123" y1="52" x2="137" y2="56" stroke="#3B82F6" strokeWidth="1.5" />
        <line x1="123" y1="58" x2="133" y2="61" stroke="#F97316" strokeWidth="1.5" />

        {/* Workstation Desk (Center) */}
        {/* Desk Surface */}
        <polygon points="75,80 125,65 140,75 90,90" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
        {/* Desk Legs */}
        <line x1="76" y1="80" x2="76" y2="105" stroke="#64748B" strokeWidth="2.5" />
        <line x1="125" y1="65" x2="125" y2="90" stroke="#64748B" strokeWidth="2.5" />
        <line x1="90" y1="90" x2="90" y2="115" stroke="#64748B" strokeWidth="2.5" />
        <line x1="140" y1="75" x2="140" y2="100" stroke="#64748B" strokeWidth="2.5" />

        {/* Dual Computer Monitors on Desk */}
        {/* Main Monitor */}
        <polygon points="98,58 116,52 116,68 98,74" fill="#0F172A" />
        <polygon points="100,60 114,55 114,66 100,71" fill="#38BDF8" opacity="0.8" />
        <line x1="107" y1="71" x2="107" y2="76" stroke="#64748B" strokeWidth="2" />
        <polygon points="102,76 112,73 115,75 105,78" fill="#94A3B8" />

        {/* Ergonomic Office Chair */}
        <circle cx="106" cy="98" r="7" fill="#F97316" />
        <path d="M106,91 L106,85" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
        <circle cx="106" cy="106" r="3" fill="#334155" />

        {/* Floor Accessories */}
        {/* Beach ball / orb */}
        <circle cx="75" cy="120" r="6" fill="#38BDF8" />
        <path d="M72,116 Q75,120 72,124" stroke="#F43F5E" strokeWidth="2" fill="none" />
        {/* Trash bin */}
        <ellipse cx="52" cy="92" rx="4" ry="2" fill="#64748B" />
        <rect x="48" y="92" width="8" height="9" fill="#94A3B8" rx="1" />
      </svg>
    </div>
  );
};
