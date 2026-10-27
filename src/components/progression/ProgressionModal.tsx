import React from 'react';
import { X, Trophy, Bot, Flame, Shield, Star, CheckCircle, Zap, Globe, Award } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { PvPTier } from '../../types/user';

export const ProgressionModal: React.FC = () => {
  const {
    isProgressionModalOpen,
    closeProgressionModal,
    activeProgressionTab,
    openProgressionModal,
    profile
  } = useUserStore();

  if (!isProgressionModalOpen) return null;

  const progressionList = Object.entries(profile.progression).map(([gameId, prog]) => {
    const game = GAMES_CATALOG.find((g) => g.id === gameId);
    return { game, prog };
  }).filter((item) => item.game !== undefined);

  const getTierColor = (tier: PvPTier) => {
    switch (tier) {
      case 'Grandmaster': return 'from-red-500 to-rose-700 text-rose-300 border-rose-500/50';
      case 'Diamond': return 'from-cyan-400 to-blue-600 text-cyan-200 border-cyan-400/50';
      case 'Platinum': return 'from-emerald-400 to-teal-600 text-emerald-200 border-emerald-400/50';
      case 'Gold': return 'from-amber-400 to-yellow-600 text-amber-200 border-amber-400/50';
      case 'Silver': return 'from-slate-300 to-slate-500 text-slate-200 border-slate-400/50';
      default: return 'from-amber-700 to-yellow-900 text-amber-300 border-amber-700/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-cyber-card border border-cyber-border rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-cyber-border flex items-center justify-between bg-cyber-dark/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-accent to-cyber-neon flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg text-white">{profile.username}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40 font-mono">
                  Lvl {profile.level}
                </span>
                <span className="text-xs font-mono text-slate-400">Flag: 🇮🇳 {profile.countryCode}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Total Player XP: {profile.totalXP.toLocaleString()} XP</p>
            </div>
          </div>

          <button
            onClick={closeProgressionModal}
            className="p-2 rounded-xl bg-cyber-dark hover:bg-cyber-border text-slate-400 hover:text-white transition-colors border border-cyber-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyber-border bg-cyber-dark/40 px-5 pt-3 gap-4">
          <button
            onClick={() => openProgressionModal('bot')}
            className={`flex items-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeProgressionTab === 'bot'
                ? 'border-cyber-neon text-cyber-neon'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Bot Practice Mastery (Level 1 → ∞)</span>
          </button>

          <button
            onClick={() => openProgressionModal('pvp')}
            className={`flex items-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeProgressionTab === 'pvp'
                ? 'border-cyber-gold text-cyber-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Global PvP League (ELO & Tiers)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeProgressionTab === 'bot' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-cyber-dark border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyber-neon" />
                    Client-Side Bot Mastery Engine
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Practice across all 45 games. Defeat bots to unlock higher AI tiers, earn stars, and gain XP.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-display font-black text-cyber-neon">
                    {Object.values(profile.progression).reduce((acc, p) => acc + p.botStars, 0)} ★
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">TOTAL STARS</div>
                </div>
              </div>

              {/* Bot Progression Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {progressionList.slice(0, 12).map(({ game, prog }) => (
                  <div
                    key={prog.gameId}
                    className="p-3.5 rounded-xl bg-cyber-dark/80 border border-cyber-border hover:border-purple-500/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{game?.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Bot Level {prog.botLevel}
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= prog.botStars ? 'fill-current' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-400">
                      {prog.botXP} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-cyber-dark border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-cyber-gold" />
                    Worldwide Ranked ELO League
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Match with human opponents worldwide. Glicko-2 & ELO ratings are updated with anti-cheat validation.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-cyber-rose font-display font-bold text-lg">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{Math.max(...Object.values(profile.progression).map((p) => p.highestWinStreak))}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">TOP STREAK</div>
                  </div>
                </div>
              </div>

              {/* PvP Rankings Table */}
              <div className="overflow-x-auto rounded-xl border border-cyber-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cyber-dark text-[11px] font-mono uppercase text-slate-400 border-b border-cyber-border">
                    <tr>
                      <th className="py-2.5 px-4">Game</th>
                      <th className="py-2.5 px-3">Rating</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">W / L / D</th>
                      <th className="py-2.5 px-3">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/60 bg-cyber-card">
                    {progressionList.slice(0, 10).map(({ game, prog }) => (
                      <tr key={prog.gameId} className="hover:bg-cyber-border/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <span>{game?.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-cyber-accent">
                          {prog.pvpElo}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border bg-gradient-to-r ${getTierColor(prog.pvpTier)}`}>
                            {prog.pvpTier}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          <span className="text-emerald-400 font-bold">{prog.pvpWins}</span>
                          <span className="text-slate-500"> / </span>
                          <span className="text-rose-400 font-bold">{prog.pvpLosses}</span>
                          <span className="text-slate-500"> / </span>
                          <span className="text-slate-400">{prog.pvpDraws}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {prog.winStreak > 0 ? (
                            <span className="flex items-center gap-1 text-cyber-gold font-bold">
                              <Flame className="w-3 h-3 fill-current" /> {prog.winStreak}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
