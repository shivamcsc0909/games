import { create } from 'zustand';
import { GameMetadata, HubCategory, GameDifficulty, PlayerCountTag } from '../types/game';
import { GAMES_CATALOG } from '../data/gamesCatalog';

interface GameState {
  // Navigation & View
  currentView: 'catalog' | 'game' | 'tutorial';
  activeGame: GameMetadata | null;
  activeHub: HubCategory | 'all';
  
  // Filtering & Search
  searchQuery: string;
  selectedPlayerCount: PlayerCountTag | 'all';
  selectedDifficulty: GameDifficulty | 'all';
  playModeFilter: 'all' | 'bot' | 'pvp';

  // Session & Multiplayer
  onlinePlayerCount: number;
  sidebarCollapsed: boolean;
  activeMatchId: string | null;

  // Actions
  setCurrentView: (view: 'catalog' | 'game' | 'tutorial') => void;
  setActiveGame: (game: GameMetadata | null) => void;
  setActiveHub: (hub: HubCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlayerCount: (count: PlayerCountTag | 'all') => void;
  setSelectedDifficulty: (difficulty: GameDifficulty | 'all') => void;
  setPlayModeFilter: (mode: 'all' | 'bot' | 'pvp') => void;
  toggleSidebar: () => void;
  launchGame: (gameId: string, mode: 'bot' | 'pvp' | 'tutorial') => void;
  exitGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentView: 'catalog',
  activeGame: null,
  activeHub: 'all',
  searchQuery: '',
  selectedPlayerCount: 'all',
  selectedDifficulty: 'all',
  playModeFilter: 'all',
  onlinePlayerCount: 14890,
  sidebarCollapsed: false,
  activeMatchId: null,

  setCurrentView: (view) => set({ currentView: view }),
  setActiveGame: (game) => set({ activeGame: game }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedPlayerCount: (selectedPlayerCount) => set({ selectedPlayerCount }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setPlayModeFilter: (playModeFilter) => set({ playModeFilter }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  launchGame: (gameId: string, mode: 'bot' | 'pvp' | 'tutorial') => {
    const game = GAMES_CATALOG.find((g) => g.id === gameId);
    if (!game) return;
    set({
      activeGame: game,
      currentView: mode === 'tutorial' ? 'tutorial' : 'game',
      activeMatchId: mode === 'pvp' ? `room-${Math.random().toString(36).substring(2, 8)}` : null
    });
  },

  exitGame: () => set({ activeGame: null, currentView: 'catalog', activeMatchId: null })
}));
