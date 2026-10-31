import React from 'react';

export const VoxelCoin: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`voxel-coin-wrapper ${className}`}>
      <svg viewBox="0 0 90 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Golden 3D Coin Isometric faces */}
        {/* Front face / hexagon coin */}
        <path d="M45 10 L78 28 L78 68 L45 86 L12 68 L12 28 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
        
        {/* 3D Extruded side depth */}
        <path d="M45 86 L78 68 L86 73 L53 91 Z" fill="#CA8A04" />
        <path d="M78 28 L78 68 L86 73 L86 33 Z" fill="#A16207" />
        <path d="M45 10 L78 28 L86 33 L53 15 Z" fill="#EAB308" />

        {/* Inner coin embossed pattern */}
        <path d="M45 22 L68 35 L68 62 L45 75 L22 62 L22 35 Z" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
        
        {/* Star / Algo symbol in coin center */}
        <path d="M45 36 L48 44 L56 46 L50 51 L52 59 L45 54 L38 59 L40 51 L34 46 L42 44 Z" fill="#EAB308" />
        
        {/* Specular highlights */}
        <path d="M26 36 L45 25 L64 36" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
