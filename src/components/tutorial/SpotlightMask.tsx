import React from 'react';

interface SpotlightSquare {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpotlightMaskProps {
  squares: SpotlightSquare[];
  boardWidth: number;
  boardHeight: number;
}

export const SpotlightMask: React.FC<SpotlightMaskProps> = ({ squares, boardWidth, boardHeight }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox={`0 0 ${boardWidth} ${boardHeight}`}
    >
      <defs>
        <mask id="spotlight-mask">
          {/* Fill entire canvas with white (which keeps darkness) */}
          <rect x="0" y="0" width={boardWidth} height={boardHeight} fill="white" />
          {/* Cut out black holes where squares should be fully visible */}
          {squares.map((sq, idx) => (
            <rect
              key={idx}
              x={sq.x}
              y={sq.y}
              width={sq.width}
              height={sq.height}
              rx="4"
              fill="black"
            />
          ))}
        </mask>
      </defs>

      {/* Dim overlay with cutouts */}
      <rect
        x="0"
        y="0"
        width={boardWidth}
        height={boardHeight}
        fill="rgba(8, 10, 15, 0.75)"
        mask="url(#spotlight-mask)"
      />

      {/* Glowing neon borders around spotlight squares */}
      {squares.map((sq, idx) => (
        <rect
          key={`border-${idx}`}
          x={sq.x}
          y={sq.y}
          width={sq.width}
          height={sq.height}
          rx="4"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2.5"
          className="animate-pulse"
        />
      ))}
    </svg>
  );
};
