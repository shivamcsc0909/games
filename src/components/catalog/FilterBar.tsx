import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { GameDifficulty, PlayerCountTag } from '../../types/game';

const PLAYER_FILTERS: { label: string; value: PlayerCountTag | 'all' }[] = [
  { label: 'All Players', value: 'all' },
  { label: '1P Solo', value: '1P' },
  { label: '2P Duel', value: '2P' },
  { label: '3P Hex', value: '3P' },
  { label: '4P FFA/Teams', value: '4P' },
  { label: '6P-8P Party', value: '6P' }
];

const DIFFICULTY_FILTERS: { label: string; value: GameDifficulty | 'all' }[] = [
  { label: 'All Difficulties', value: 'all' },
  { label: 'Basic / Easy', value: 'Basic' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced / Hard', value: 'Advanced' },
  { label: 'Grandmaster / Extreme', value: 'Grandmaster' }
];

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedPlayerCount,
    setSelectedPlayerCount,
    selectedDifficulty,
    setSelectedDifficulty,
    playModeFilter,
    setPlayModeFilter
  } = useGameStore();

  const hasActiveFilters = searchQuery !== '' || selectedPlayerCount !== 'all' || selectedDifficulty !== 'all' || playModeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlayerCount('all');
    setSelectedDifficulty('all');
    setPlayModeFilter('all');
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Upper search & mode bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 45 games, rules, origins..."
            className="w-full pl-9 pr-9 py-2 bg-cyber-card border border-cyber-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-accent transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Play Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-cyber-card border border-cyber-border rounded-xl w-full md:w-auto overflow-x-auto">
          {(['all', 'bot', 'pvp'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPlayModeFilter(mode)}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                playModeFilter === mode
                  ? 'bg-cyber-accent text-cyber-dark shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode === 'bot' ? 'Vs Bot AI' : 'Worldwide PvP'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-500 text-[11px] font-mono mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>FILTER:</span>
        </div>

        {/* Player Count Chips */}
        {PLAYER_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedPlayerCount(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
              selectedPlayerCount === f.value
                ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'bg-cyber-dark/80 border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}

        <div className="w-px h-4 bg-cyber-border mx-1 flex-shrink-0" />

        {/* Difficulty Filter Chips */}
        {DIFFICULTY_FILTERS.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDifficulty(d.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
              selectedDifficulty === d.value
                ? 'bg-cyber-gold/15 border-cyber-gold text-cyber-gold shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                : 'bg-cyber-dark/80 border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {d.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-mono text-cyber-rose hover:underline ml-2 flex-shrink-0"
          >
            <X className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
