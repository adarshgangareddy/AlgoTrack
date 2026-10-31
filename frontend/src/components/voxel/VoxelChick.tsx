import React from 'react';

export const VoxelChick: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-chick-wrapper ${className}`}>
      <svg viewBox="0 0 110 110" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Yellow Voxel Body */}
        {/* Top face */}
        <path d="M25 35 L60 18 L95 35 L60 52 Z" fill="#FDE047" />
        {/* Left face */}
        <path d="M25 35 L60 52 L60 85 L25 68 Z" fill="#FACC15" />
        {/* Right face */}
        <path d="M60 52 L95 35 L95 68 L60 85 Z" fill="#CA8A04" />

        {/* Orange Beak */}
        <path d="M60 48 L76 56 L60 64 L44 56 Z" fill="#FB923C" />
        <path d="M44 56 L60 64 L60 74 L44 66 Z" fill="#EA580C" />
        <path d="M60 64 L76 56 L76 66 L60 74 Z" fill="#C2410C" />

        {/* Big Pixel Eye on Left */}
        <path d="M38 40 L48 45 L48 55 L38 50 Z" fill="#18181B" />
        <path d="M44 43 L48 45 L48 49 L44 47 Z" fill="#FFFFFF" />

        {/* Big Pixel Eye on Right */}
        <path d="M72 45 L82 40 L82 50 L72 55 Z" fill="#18181B" />
        <path d="M72 45 L76 43 L76 47 L72 49 Z" fill="#FFFFFF" />

        {/* Yellow Voxel Wings */}
        {/* Left Wing */}
        <path d="M12 45 L25 38 L25 65 L12 72 Z" fill="#FACC15" />
        <path d="M12 45 L25 38 L20 35 L7 42 Z" fill="#FEF08A" />
        <path d="M7 42 L12 45 L12 72 L7 69 Z" fill="#EAB308" />

        {/* Right Wing */}
        <path d="M95 38 L108 45 L108 72 L95 65 Z" fill="#A16207" />
        <path d="M95 38 L108 45 L113 42 L100 35 Z" fill="#CA8A04" />
        <path d="M108 45 L113 42 L113 69 L108 72 Z" fill="#854D0E" />

        {/* Feet / Perch Blocks */}
        <path d="M42 85 L52 90 L52 98 L42 93 Z" fill="#EA580C" />
        <path d="M68 90 L78 85 L78 93 L68 98 Z" fill="#C2410C" />
      </svg>
    </div>
  );
};
