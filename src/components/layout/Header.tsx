import React from 'react';
import { Volume2, VolumeX, Users, Trophy, Flame, Sparkles, Maximize, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useUserStore } from '../../store/useUserStore';
import { useAudioStore } from '../../store/useAudioStore';

export const Header: React.FC = () => {
  const { onlinePlayerCount, currentView, exitGame } = useGameStore();
  const { profile, quests, openProgressionModal } = useUserStore();
  const { isMuted, toggleMute } = useAudioStore();

  const totalElo = Object.values(profile.progression).reduce((acc, p) => acc + p.pvpElo, 0);
  const avgElo = Math.round(totalElo / Object.keys(profile.progression).length);
  const activeQuest = quests[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-14 border-b border-cyber-border bg-cyber-card/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none flex-shrink-0">
      {/* Brand Logo & Back Action */}
      <div className="flex items-center gap-4">
        {currentView !== 'catalog' && (
          <button
            onClick={exitGame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyber-border/60 hover:bg-cyber-accent/20 hover:text-cyber-accent border border-cyber-border text-xs font-mono text-slate-300 transition-colors"
          >
            ← ARENA HUB
          </button>
        )}

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => exitGame()}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-accent to-cyber-neon flex items-center justify-center font-display font-black text-cyber-dark text-sm shadow-[0_0_12px_rgba(0,240,255,0.5)]">
            45
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm tracking-wider text-white uppercase flex items-center gap-1.5">
              CYBER<span className="text-cyber-accent">ARENA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent font-mono border border-cyber-accent/30">PRO</span>
            </h1>
          </div>
        </div>

        {/* Live Online Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyber-dark/80 border border-cyber-border text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-ping" />
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 font-semibold">{onlinePlayerCount.toLocaleString()}</span>
          <span className="text-slate-500 text-[10px]">LIVE</span>
        </div>
      </div>

      {/* Center: Daily Quest Progress */}
      {activeQuest && (
        <div
          onClick={() => openProgressionModal('bot')}
          className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-cyber-dark/60 border border-cyber-border/80 hover:border-cyber-accent/40 cursor-pointer transition-all max-w-sm"
        >
          <Sparkles className="w-4 h-4 text-cyber-gold flex-shrink-0" />
          <div className="text-left overflow-hidden">
            <div className="text-[11px] font-medium text-slate-300 truncate">
              {activeQuest.title}
            </div>
            <div className="w-40 h-1.5 bg-cyber-border rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyber-gold to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(activeQuest.progress / activeQuest.maxProgress) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyber-gold font-bold">+{activeQuest.rewardXP}XP</span>
        </div>
      )}

      {/* Right: Sound, Fullscreen & Player Profile Badge */}
      <div className="flex items-center gap-2.5">
        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-2 rounded-lg border transition-all ${
            isMuted
              ? 'bg-cyber-dark border-cyber-border text-slate-500 hover:text-slate-300'
              : 'bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent/20'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-lg bg-cyber-dark border border-cyber-border text-slate-400 hover:text-cyber-accent hover:border-cyber-accent/30 transition-all"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Player Profile & Dual Progression Trigger */}
        <button
          onClick={() => openProgressionModal('pvp')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-gradient-to-r from-cyber-border/40 to-cyber-dark hover:border-cyber-accent/50 border border-cyber-border transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 flex items-center justify-center text-sm">
            {profile.avatar}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-semibold text-slate-200">{profile.username}</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyber-gold/20 text-cyber-gold border border-cyber-gold/30">
                Lvl {profile.level}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono text-slate-400">
              <Trophy className="w-3 h-3 text-cyber-accent" />
              <span>{avgElo} ELO</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
