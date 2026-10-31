import React from 'react';

export const ArcadeRoom: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-room-wrapper arcade-room ${className}`}>
      <svg viewBox="0 0 190 170" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <polygon points="95,165 180,115 95,70 10,115" fill="rgba(10, 8, 30, 0.55)" />

        {/* Room Floor (Wood Grain Basketball Court Isometric Diamond) */}
        <polygon points="95,150 175,103 95,56 15,103" fill="#D97706" />
        {/* Wood planks */}
        <path d="M35,91 L115,138 M55,79 L135,126 M75,67 L155,114" stroke="#B45309" strokeWidth="1" opacity="0.6" />
        {/* Half-court arc line */}
        <path d="M45,115 Q95,125 145,100" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.8" />
        {/* Court Key box */}
        <polygon points="80,140 110,122 100,116 70,134" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.8" />

        {/* Left Wall (Pink Neon Cyber Wall) */}
        <polygon points="15,103 15,25 95,0 95,56" fill="#F43F5E" />
        {/* Neon circuit / pipes */}
        <path d="M22,50 L45,42 L45,70 L65,63" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="50" r="3" fill="#38BDF8" />
        <circle cx="65" cy="63" r="3" fill="#38BDF8" />
        {/* Neon sign on left wall: "CODE" */}
        <text x="25" y="38" fill="#FDE047" fontSize="10" fontWeight="900" fontFamily="sans-serif" transform="skewY(-15)">ALGO</text>

        {/* Right Wall (Purple/Pink Neon Wall with Basketball Hoop) */}
        <polygon points="95,56 95,0 175,25 175,103" fill="#EC4899" />
        {/* Circular graffiti stamp: "CODE CLUB" */}
        <circle cx="140" cy="45" r="22" stroke="#F472B6" strokeWidth="2" strokeDasharray="4 2" fill="none" />
        <text x="122" y="48" fill="#FDF2F8" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" transform="skewY(15)">CODE CLUB</text>

        {/* Basketball Backboard on Right Wall */}
        <polygon points="115,22 145,31 145,51 115,42" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="123" y="30" width="12" height="10" stroke="#F97316" strokeWidth="1.2" fill="none" transform="skewY(15)" />
        {/* Orange Hoop & Net */}
        <ellipse cx="130" cy="48" rx="8" ry="3" fill="none" stroke="#F97316" strokeWidth="2" />
        <path d="M123,49 L127,57 L133,57 L137,49" stroke="#E2E8F0" strokeWidth="1" fill="none" />

        {/* Retro Wooden Bench on Left with Boombox */}
        <polygon points="35,92 65,82 72,87 42,97" fill="#92400E" />
        <line x1="38" y1="94" x2="38" y2="105" stroke="#78350F" strokeWidth="2" />
        <line x1="68" y1="84" x2="68" y2="95" stroke="#78350F" strokeWidth="2" />
        {/* Boombox on Bench */}
        <polygon points="46,85 58,81 62,84 50,88" fill="#475569" />
        <rect x="48" y="81" width="10" height="5" fill="#1E293B" transform="skewY(-15)" />
        <circle cx="50" cy="85" r="1.5" fill="#38BDF8" />
        <circle cx="56" cy="83" r="1.5" fill="#38BDF8" />

        {/* Basketball on Floor */}
        <circle cx="62" cy="120" r="6" fill="#F97316" />
        <path d="M57,120 Q62,115 67,120" stroke="#7C2D12" strokeWidth="1.2" fill="none" />
        <path d="M62,114 L62,126" stroke="#7C2D12" strokeWidth="1.2" />

        {/* Pixel Character with Sunglasses & Jacket Standing on Court */}
        <g transform="translate(130, 90)">
          {/* Shadow */}
          <ellipse cx="12" cy="35" rx="8" ry="3" fill="rgba(0,0,0,0.35)" />
          {/* Shoes */}
          <rect x="6" y="30" width="5" height="5" fill="#FFFFFF" rx="1" />
          <rect x="13" y="30" width="5" height="5" fill="#FFFFFF" rx="1" />
          {/* Jeans */}
          <rect x="7" y="22" width="4" height="9" fill="#2563EB" />
          <rect x="13" y="22" width="4" height="9" fill="#2563EB" />
          {/* Jacket */}
          <rect x="5" y="10" width="14" height="13" fill="#D97706" rx="2" />
          <rect x="9" y="11" width="6" height="12" fill="#18181B" />
          {/* Head */}
          <rect x="7" y="2" width="10" height="9" fill="#FBBF24" rx="2" />
          {/* Hair */}
          <rect x="6" y="0" width="12" height="4" fill="#78350F" rx="1" />
          {/* Sunglasses */}
          <rect x="7" y="4" width="10" height="3" fill="#0F172A" rx="1" />
          <line x1="12" y1="4" x2="12" y2="7" stroke="#FBBF24" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
