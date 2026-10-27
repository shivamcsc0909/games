import { create } from 'zustand';
import { UserProfile, GameProgress, PvPTier, DailyQuest } from '../types/user';
import { GAMES_CATALOG } from '../data/gamesCatalog';

const STORAGE_KEY = 'cyber_arena_user_v1';

function getInitialProgress(gameId: string): GameProgress {
  return {
    gameId,
    botLevel: 1,
    botXP: 0,
    botStars: 0,
    pvpElo: 1200,
    pvpTier: 'Bronze',
    pvpWins: 0,
    pvpLosses: 0,
    pvpDraws: 0,
    winStreak: 0,
    highestWinStreak: 0,
    tutorialCompleted: false
  };
}

function calculateTier(elo: number): PvPTier {
  if (elo >= 2400) return 'Grandmaster';
  if (elo >= 2000) return 'Diamond';
  if (elo >= 1700) return 'Platinum';
  if (elo >= 1400) return 'Gold';
  if (elo >= 1200) return 'Silver';
  return 'Bronze';
}

function loadSavedProfile(): UserProfile {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user profile', e);
    }
  }

  const initialProgression: Record<string, GameProgress> = {};
  GAMES_CATALOG.forEach((g) => {
    initialProgression[g.id] = getInitialProgress(g.id);
  });

  return {
    id: `guest-${Math.random().toString(36).substring(2, 9)}`,
    username: 'CyberStriker',
    countryCode: 'IN',
    avatar: '⚡',
    totalXP: 2450,
    level: 5,
    progression: initialProgression
  };
}

interface UserState {
  profile: UserProfile;
  quests: DailyQuest[];
  isProgressionModalOpen: boolean;
  activeProgressionTab: 'bot' | 'pvp';

  openProgressionModal: (tab?: 'bot' | 'pvp') => void;
  closeProgressionModal: () => void;
  addXP: (amount: number, gameId?: string) => void;
  recordBotWin: (gameId: string, stars: number) => void;
  recordPvPMatch: (gameId: string, result: 'win' | 'loss' | 'draw', eloDelta: number) => void;
  completeTutorial: (gameId: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: loadSavedProfile(),
  quests: [
    { id: 'q1', title: 'Win 2 Matches vs Bot in Chess Arena', rewardXP: 250, progress: 1, maxProgress: 2, completed: false },
    { id: 'q2', title: 'Complete 1 Step-by-Step Interactive Tutorial', rewardXP: 150, progress: 0, maxProgress: 1, completed: false },
    { id: 'q3', title: 'Play 1 Carrom or Crokinole Strike Match', rewardXP: 300, progress: 1, maxProgress: 1, completed: true }
  ],
  isProgressionModalOpen: false,
  activeProgressionTab: 'bot',

  openProgressionModal: (tab = 'bot') => set({ isProgressionModalOpen: true, activeProgressionTab: tab }),
  closeProgressionModal: () => set({ isProgressionModalOpen: false }),

  addXP: (amount: number, gameId?: string) => {
    set((state) => {
      const newTotalXP = state.profile.totalXP + amount;
      const newLevel = Math.floor(1 + Math.sqrt(newTotalXP / 100));
      
      const newProgression = { ...state.profile.progression };
      if (gameId && newProgression[gameId]) {
        const gameProg = { ...newProgression[gameId] };
        gameProg.botXP += amount;
        gameProg.botLevel = Math.floor(1 + Math.sqrt(gameProg.botXP / 50));
        newProgression[gameId] = gameProg;
      }

      const updatedProfile = {
        ...state.profile,
        totalXP: newTotalXP,
        level: newLevel,
        progression: newProgression
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
  },

  recordBotWin: (gameId: string, stars: number) => {
    set((state) => {
      const progression = { ...state.profile.progression };
      const current = progression[gameId] || getInitialProgress(gameId);
      const updated: GameProgress = {
        ...current,
        botStars: Math.max(current.botStars, stars),
        botLevel: current.botLevel + 1,
        botXP: current.botXP + 150 * stars
      };
      progression[gameId] = updated;
      const updatedProfile = { ...state.profile, progression };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
    get().addXP(200, gameId);
  },

  recordPvPMatch: (gameId: string, result: 'win' | 'loss' | 'draw', eloDelta: number) => {
    set((state) => {
      const progression = { ...state.profile.progression };
      const current = progression[gameId] || getInitialProgress(gameId);
      const newElo = Math.max(100, current.pvpElo + eloDelta);
      const isWin = result === 'win';
      const newStreak = isWin ? current.winStreak + 1 : 0;
      
      const updated: GameProgress = {
        ...current,
        pvpElo: newElo,
        pvpTier: calculateTier(newElo),
        pvpWins: isWin ? current.pvpWins + 1 : current.pvpWins,
        pvpLosses: result === 'loss' ? current.pvpLosses + 1 : current.pvpLosses,
        pvpDraws: result === 'draw' ? current.pvpDraws + 1 : current.pvpDraws,
        winStreak: newStreak,
        highestWinStreak: Math.max(current.highestWinStreak, newStreak)
      };
      progression[gameId] = updated;
      const updatedProfile = { ...state.profile, progression };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
  },

  completeTutorial: (gameId: string) => {
    set((state) => {
      const progression = { ...state.profile.progression };
      const current = progression[gameId] || getInitialProgress(gameId);
      progression[gameId] = {
        ...current,
        tutorialCompleted: true
      };
      const updatedProfile = { ...state.profile, progression };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
    get().addXP(300, gameId);
  }
}));
