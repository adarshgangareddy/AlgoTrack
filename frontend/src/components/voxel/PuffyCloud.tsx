import React from 'react';

interface PuffyCloudProps {
  className?: string;
  tint?: 'white' | 'sunset' | 'glow';
}

export const PuffyCloud: React.FC<PuffyCloudProps> = ({ className = '', tint = 'white' }) => {
  const isSunset = tint === 'sunset';
  const isGlow = tint === 'glow';

  return (
    <div className={`puffy-cloud-wrapper ${className} ${tint}`}>
      <svg viewBox="0 0 160 70" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={isSunset ? "sunsetGrad" : "cloudGrad"} x1="0%" y1="0%" x2="0%" y2="100%">
            {isSunset ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.75" />
              </>
            ) : isGlow ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="80%" stopColor="#E0F2FE" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.7" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.75" />
              </>
            )}
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(15, 23, 42, 0.25)" />
          </filter>
        </defs>

        <g filter="url(#softShadow)">
          {/* Main puffy cloud body */}
          <ellipse cx="80" cy="46" rx="65" ry="18" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          <circle cx="50" cy="38" r="22" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          <circle cx="82" cy="30" r="26" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          <circle cx="112" cy="36" r="20" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          <circle cx="132" cy="45" r="14" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          <circle cx="28" cy="45" r="14" fill={`url(#${isSunset ? "sunsetGrad" : "cloudGrad"})`} />
          
          {/* Specular highlights on top puffs */}
          <ellipse cx="80" cy="18" rx="14" ry="4" fill="#FFFFFF" opacity="0.6" />
          <ellipse cx="48" cy="24" rx="10" ry="3" fill="#FFFFFF" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
};
