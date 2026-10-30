import React from 'react';

export const VoxelCrab: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-crab-wrapper ${className}`}>
      <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top sign / white speech block */}
        <g transform="translate(32, 10)">
          <path d="M4 0 H52 V22 H4 Z" fill="#FFFFFF" />
          <path d="M0 4 H4 V22 H0 Z" fill="#E2E8F0" />
          <path d="M4 22 H52 V26 H4 Z" fill="#CBD5E1" />
        </g>

        {/* Main Red Voxel Body */}
        {/* Top face */}
        <path d="M26 34 L60 22 L94 34 L60 46 Z" fill="#FF5353" />
        {/* Left side face */}
        <path d="M26 34 L60 46 L60 76 L26 64 Z" fill="#D62828" />
        {/* Right side face */}
        <path d="M60 46 L94 34 L94 64 L60 76 Z" fill="#991B1B" />

        {/* Big Voxel Eyes */}
        {/* Left Eye */}
        <path d="M34 26 L46 22 L46 32 L34 36 Z" fill="#FFFFFF" />
        <path d="M38 27 L44 25 L44 31 L38 33 Z" fill="#18181B" />
        
        {/* Right Eye */}
        <path d="M74 22 L86 26 L86 36 L74 32 Z" fill="#FFFFFF" />
        <path d="M76 25 L82 27 L82 33 L76 31 Z" fill="#18181B" />

        {/* Front pincers / mouth blocks */}
        <path d="M44 54 L60 48 L60 62 L44 68 Z" fill="#EF4444" />
        <path d="M60 48 L76 54 L76 68 L60 62 Z" fill="#B91C1C" />

        {/* Left Legs */}
        {/* Leg 1 */}
        <path d="M20 44 L28 40 L28 72 L20 76 Z" fill="#DC2626" />
        <path d="M12 70 L20 66 L20 86 L12 90 Z" fill="#B91C1C" />
        {/* Leg 2 */}
        <path d="M10 40 L18 36 L18 64 L10 68 Z" fill="#EF4444" />
        <path d="M4 64 L12 60 L12 80 L4 84 Z" fill="#991B1B" />

        {/* Right Legs */}
        {/* Leg 1 */}
        <path d="M92 40 L100 44 L100 76 L92 72 Z" fill="#991B1B" />
        <path d="M100 66 L108 70 L108 90 L100 86 Z" fill="#7F1D1D" />
        {/* Leg 2 */}
        <path d="M102 36 L110 40 L110 68 L102 64 Z" fill="#B91C1C" />
        <path d="M108 60 L116 64 L116 84 L108 80 Z" fill="#7F1D1D" />
      </svg>
    </div>
  );
};
