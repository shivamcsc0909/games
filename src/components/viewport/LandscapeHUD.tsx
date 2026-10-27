import React, { useState, useEffect } from 'react';
import { Bot, User, Clock, Flag, RotateCcw, Volume2, VolumeX, MessageSquare, Award } from 'lucide-react';
import { GameMetadata } from '../../types/game';
import { GameMove } from '../../types/engine';
import { useAudioStore } from '../../store/useAudioStore';

interface LandscapeHUDProps {
  game: GameMetadata;
  activePlayerIndex: number;
  moves: GameMove[];
  onResign: () => void;
  onUndo: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

export const LandscapeHUD: React.FC<LandscapeHUDProps> = ({
  game,
  activePlayerIndex,
  moves,
  onResign,
  onUndo,
  onReset,
  children
}) => {
  const { isMuted, toggleMute } = useAudioStore();
  const [timerP1, setTimerP1] = useState<number>(300); // 5:00
  const [timerP2, setTimerP2] = useState<number>(300);

  // Clock countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (activePlayerIndex === 0) {
        setTimerP1((t) => Math.max(0, t - 1));
      } else {
        setTimerP2((t) => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activePlayerIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex items-stretch overflow-hidden select-none bg-cyber-dark">
      {/* LEFT PANEL: Opponent Avatar, Level, Clock */}
      <div className="w-56 lg:w-64 border-r border-cyber-border bg-cyber-card/70 backdrop-blur-md p-4 flex flex-col justify-between flex-shrink-0">
        {/* Opponent Card (Top) */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          activePlayerIndex === 1
            ? 'bg-purple-950/30 border-cyber-neon shadow-[0_0_15px_rgba(121,40,202,0.3)]'
            : 'bg-cyber-dark/80 border-cyber-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg">
              <Bot className="w-5 h-5 text-cyber-neon" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>CyberAI Bot</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                  Master
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">1850 ELO</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Clock
            </span>
            <span className={`text-sm font-bold ${activePlayerIndex === 1 ? 'text-cyber-neon' : 'text-slate-400'}`}>
              {formatTime(timerP2)}
            </span>
          </div>
        </div>

        {/* Game Info & Tags */}
        <div className="p-3 rounded-xl bg-cyber-dark/50 border border-cyber-border/60 space-y-1.5">
          <div className="text-[11px] font-mono text-cyber-accent uppercase font-bold">
            {game.name}
          </div>
          <div className="text-[10px] text-slate-400">
            {game.origin}
          </div>
          <div className="flex gap-1 pt-1">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyber-border text-slate-300">
              {game.difficulty}
            </span>
          </div>
        </div>

        {/* Player Card (Bottom) */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          activePlayerIndex === 0
            ? 'bg-cyan-950/30 border-cyber-accent shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            : 'bg-cyber-dark/80 border-cyber-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg">
              <User className="w-5 h-5 text-cyber-accent" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>You (Player)</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Ranked
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">1420 ELO</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Clock
            </span>
            <span className={`text-sm font-bold ${activePlayerIndex === 0 ? 'text-cyber-accent' : 'text-slate-400'}`}>
              {formatTime(timerP1)}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: Game Viewport with Aspect-Ratio Containment */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-cyber-dark">
        {children}
      </div>

      {/* RIGHT PANEL: Move History & Controls */}
      <div className="w-56 lg:w-64 border-l border-cyber-border bg-cyber-card/70 backdrop-blur-md p-4 flex flex-col justify-between flex-shrink-0">
        {/* Move History */}
        <div className="flex-1 flex flex-col min-h-0 mb-4">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
            <span>Move Notation</span>
            <span className="text-cyber-accent">{moves.length} Moves</span>
          </div>
          <div className="flex-1 overflow-y-auto rounded-xl bg-cyber-dark/80 border border-cyber-border/80 p-2 space-y-1 font-mono text-xs">
            {moves.length > 0 ? (
              moves.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 rounded bg-cyber-card/50 text-[11px] text-slate-300"
                >
                  <span className="text-slate-500">#{idx + 1}</span>
                  <span className={m.playerIndex === 0 ? 'text-cyber-accent' : 'text-purple-400'}>
                    {m.piece ? m.piece.toUpperCase() : 'Move'} {m.to ? `➔ (${m.to.row ?? ''}${m.to.col ?? ''})` : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 text-[11px] py-8">
                Game started. Make your first move!
              </div>
            )}
          </div>
        </div>

        {/* Emote / Chat Quick Bar */}
        <div className="flex items-center justify-between gap-1 mb-4 p-1.5 rounded-xl bg-cyber-dark/60 border border-cyber-border">
          {['👋', '🔥', '🧠', '👑', '⚡'].map((emoji) => (
            <button
              key={emoji}
              className="p-1 rounded-lg hover:bg-cyber-border text-sm transition-transform active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Game Action Controls */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onUndo}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyber-dark hover:bg-cyber-border border border-cyber-border text-xs text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyber-dark hover:bg-cyber-border border border-cyber-border text-xs text-slate-300 transition-colors"
            >
              Reset
            </button>
          </div>

          <button
            onClick={onResign}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs text-rose-300 font-semibold transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Resign Match
          </button>
        </div>
      </div>
    </div>
  );
};
