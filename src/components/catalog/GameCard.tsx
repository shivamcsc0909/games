import React, { useRef, useEffect, useState } from 'react';
import { Bot, Globe, BookOpen, Users, Sparkles } from 'lucide-react';
import { GameMetadata } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../audio/AudioManager';

interface GameCardProps {
  game: GameMetadata;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { launchGame } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const animFrameRef = useRef<number>(0);

  // Micro-preview animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const renderPreview = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Cyber ambient grid background
      ctx.fillStyle = '#080A0F';
      ctx.fillRect(0, 0, w, h);

      if (game.engineId === 'app1_grandmaster') {
        // Chess board micro-preview
        const sq = w / 8;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#141A28' : '#0B0E14';
            ctx.fillRect(c * sq, r * sq, sq, sq);
          }
        }
        // Animated highlight square
        const animCol = Math.floor((Math.sin(time) + 1) * 3.5);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillRect(animCol * sq, 4 * sq, sq, sq);
      } else if (game.engineId === 'app2_twisty_cube') {
        // 3D Rubik's Isometric Cube Micro-render
        const cx = w / 2;
        const cy = h / 2;
        const rot = time * 0.8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(isHovered ? rot : 0.4);
        const s = 34;
        const colors = ['#00F0FF', '#7928CA', '#FFB800', '#10B981', '#F43F5E', '#FFFFFF'];
        [-s/2, 0].forEach((offY, idx) => {
          ctx.fillStyle = colors[idx % colors.length];
          ctx.fillRect(-s/2, offY, s, s/2);
          ctx.strokeStyle = '#080A0F';
          ctx.lineWidth = 2;
          ctx.strokeRect(-s/2, offY, s, s/2);
        });
        ctx.restore();
      } else if (game.engineId === 'app4_precision_striker') {
        // Carrom Striker trajectory preview
        ctx.fillStyle = '#1A1510';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#3E2F1F';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, w - 12, h - 12);

        // Center circle
        ctx.beginPath();
        ctx.arc(w/2, h/2, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFB800';
        ctx.stroke();

        // Pulsing Striker
        const pulse = 10 + Math.sin(time * 3) * 2;
        ctx.beginPath();
        ctx.arc(w/2, h - 25, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#00F0FF';
        ctx.fill();
      } else {
        // Mind Gym / Geometric nodes preview
        ctx.fillStyle = '#0B0E14';
        ctx.fillRect(0, 0, w, h);
        const count = 6;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + time * 0.5;
          const px = w/2 + Math.cos(angle) * (20 + (isHovered ? 8 : 0));
          const py = h/2 + Math.sin(angle) * (20 + (isHovered ? 8 : 0));
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#00F0FF' : '#7928CA';
          ctx.fill();
        }
      }

      if (isHovered) {
        animFrameRef.current = requestAnimationFrame(renderPreview);
      }
    };

    renderPreview();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered, game.engineId]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Grandmaster':
      case 'Extreme':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Master':
      case 'Hard':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Advanced':
      case 'Intermediate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        audioManager.playPiecePick();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-accent/60 transition-all duration-300 overflow-hidden hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] hover:-translate-y-1"
    >
      {/* Top Banner & Micro Preview Canvas */}
      <div className="relative h-28 w-full bg-cyber-dark overflow-hidden flex items-center justify-center border-b border-cyber-border/60">
        <canvas
          ref={canvasRef}
          width={280}
          height={112}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />

        {/* Live Players Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyber-dark/85 backdrop-blur-sm border border-cyber-border text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
          <Users className="w-3 h-3 text-slate-400" />
          <span className="text-slate-200">{game.livePlayerCount}</span>
        </div>

        {/* Player Count Tag */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-cyber-accent/15 border border-cyber-accent/40 text-[10px] font-mono text-cyber-accent font-bold">
          {game.minPlayers === game.maxPlayers ? `${game.minPlayers}P` : `${game.minPlayers}P-${game.maxPlayers}P`}
        </div>

        {/* Country of Origin */}
        <div className="absolute bottom-2 left-2.5 text-[11px] font-sans text-slate-400 drop-shadow">
          {game.origin}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-sm text-white group-hover:text-cyber-accent transition-colors leading-tight">
              {game.name}
            </h3>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${getDifficultyBadge(game.difficulty)}`}>
              {game.difficulty}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.difficultyReason}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyber-border/40 text-slate-400 border border-cyber-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-cyber-border/60 grid grid-cols-2 gap-1.5">
          {game.hasBotMode ? (
            <button
              onClick={() => {
                audioManager.playPieceSnap();
                launchGame(game.id, 'bot');
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-cyber-dark hover:bg-cyber-accent/20 border border-cyber-border hover:border-cyber-accent/50 text-[11px] font-semibold text-slate-200 hover:text-cyber-accent transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Play Bot</span>
            </button>
          ) : (
            <button
              onClick={() => {
                audioManager.playPieceSnap();
                launchGame(game.id, 'bot');
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-cyber-dark hover:bg-cyber-accent/20 border border-cyber-border hover:border-cyber-accent/50 text-[11px] font-semibold text-slate-200 hover:text-cyber-accent transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solo Play</span>
            </button>
          )}

          {game.hasPvPMode ? (
            <button
              onClick={() => {
                audioManager.playPieceSnap();
                launchGame(game.id, 'pvp');
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-cyber-accent text-cyber-dark font-bold text-[11px] hover:bg-white shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Find Match</span>
            </button>
          ) : game.hasTutorial ? (
            <button
              onClick={() => {
                audioManager.playPieceSnap();
                launchGame(game.id, 'tutorial');
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[11px] font-bold text-purple-300 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
