import React, { useMemo } from 'react';
import { GAMES_CATALOG, HUBS_DATA } from '../../data/gamesCatalog';
import { useGameStore } from '../../store/useGameStore';
import { FilterBar } from './FilterBar';
import { GameCard } from './GameCard';

export const GameDiscovery: React.FC = () => {
  const {
    activeHub,
    searchQuery,
    selectedPlayerCount,
    selectedDifficulty,
    playModeFilter
  } = useGameStore();

  const currentHubInfo = useMemo(() => {
    if (activeHub === 'all') return null;
    return HUBS_DATA.find((h) => h.id === activeHub) || null;
  }, [activeHub]);

  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      // Hub filter
      if (activeHub !== 'all' && game.hub !== activeHub) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(q);
        const matchesNative = game.nativeName?.toLowerCase().includes(q) ?? false;
        const matchesOrigin = game.origin.toLowerCase().includes(q);
        const matchesTags = game.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesNative && !matchesOrigin && !matchesTags) {
          return false;
        }
      }

      // Player Count filter
      if (selectedPlayerCount !== 'all') {
        const countNum = parseInt(selectedPlayerCount.replace('P', ''), 10);
        if (countNum < game.minPlayers || countNum > game.maxPlayers) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        if (selectedDifficulty === 'Basic' && !['Basic', 'Easy'].includes(game.difficulty)) return false;
        if (selectedDifficulty === 'Intermediate' && game.difficulty !== 'Intermediate') return false;
        if (selectedDifficulty === 'Advanced' && !['Advanced', 'Hard'].includes(game.difficulty)) return false;
        if (selectedDifficulty === 'Grandmaster' && !['Master', 'Grandmaster', 'Extreme'].includes(game.difficulty)) return false;
      }

      // Play Mode filter
      if (playModeFilter === 'bot' && !game.hasBotMode) return false;
      if (playModeFilter === 'pvp' && !game.hasPvPMode) return false;

      return true;
    });
  }, [activeHub, searchQuery, selectedPlayerCount, selectedDifficulty, playModeFilter]);

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 md:p-6 select-none">
      {/* Hub Hero Banner */}
      {currentHubInfo ? (
        <div className={`relative mb-6 p-6 rounded-2xl bg-gradient-to-r ${currentHubInfo.gradient} border border-cyber-border/80 overflow-hidden`}>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient opacity-20 pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyber-accent">
              FEATURED HUB
            </span>
            <h2 className="text-xl md:text-3xl font-display font-black text-white uppercase mt-1">
              {currentHubInfo.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 font-sans">
              {currentHubInfo.subtitle} • {currentHubInfo.gameCount} Tournament-Ready Titles
            </p>
          </div>
        </div>
      ) : (
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-r from-cyber-accent/15 via-cyber-neon/15 to-transparent border border-cyber-border/80">
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyber-accent">
              45 LEGENDARY TITLES
            </span>
            <h2 className="text-xl md:text-3xl font-display font-black text-white uppercase mt-1">
              Master Gaming Portal
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Compete vs Client-Side Web Worker AI or battle players worldwide in high-performance landscape mode.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <FilterBar />

      {/* Games Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
        <span>SHOWING {filteredGames.length} OF 45 TITLES</span>
        {searchQuery && <span>FILTERED BY "{searchQuery.toUpperCase()}"</span>}
      </div>

      {/* Responsive Game Cards Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-cyber-border rounded-2xl bg-cyber-card/40">
          <span className="text-3xl mb-3">🔍</span>
          <h3 className="font-display font-bold text-slate-200">No Matching Games Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Try adjusting your search criteria, player counts, or selecting another game category.
          </p>
        </div>
      )}
    </div>
  );
};
