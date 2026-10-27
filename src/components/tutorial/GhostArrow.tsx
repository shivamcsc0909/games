import React from 'react';

interface GhostArrowProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const GhostArrow: React.FC<GhostArrowProps> = ({ startX, startY, endX, endY }) => {
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  const length = Math.hypot(endX - startX, endY - startY);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
      <defs>
        <marker
          id="ghost-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#00F0FF" />
        </marker>
        <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Pulsing Guide Line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#00F0FF"
        strokeWidth="4"
        strokeDasharray="8 6"
        markerEnd="url(#ghost-arrowhead)"
        filter="url(#glow-filter)"
        className="animate-pulse"
      />

      {/* Glowing start anchor point */}
      <circle cx={startX} cy={startY} r="6" fill="#00F0FF" opacity="0.8" />
    </svg>
  );
};
