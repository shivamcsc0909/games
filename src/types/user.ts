export type PvPTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Grandmaster';

export interface GameProgress {
  gameId: string;
  botLevel: number;
  botXP: number;
  botStars: number;
  pvpElo: number;
  pvpTier: PvPTier;
  pvpWins: number;
  pvpLosses: number;
  pvpDraws: number;
  winStreak: number;
  highestWinStreak: number;
  tutorialCompleted: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  countryCode: string;
  avatar: string;
  totalXP: number;
  level: number;
  progression: Record<string, GameProgress>;
}

export interface DailyQuest {
  id: string;
  title: string;
  rewardXP: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
}
