export type HubCategory = 
  | 'chess_arena'
  | 'cube_lab'
  | 'royal_race'
  | 'striker_physics'
  | 'mind_gym';

export type GameDifficulty = 'Basic' | 'Easy' | 'Intermediate' | 'Advanced' | 'Hard' | 'Master' | 'Grandmaster' | 'Extreme';

export type PlayerCountTag = '1P' | '2P' | '3P' | '4P' | '6P' | '8P';

export interface GameMetadata {
  id: string;
  name: string;
  nativeName?: string;
  origin: string;
  hub: HubCategory;
  engineId: 'app1_grandmaster' | 'app2_twisty_cube' | 'app3_royal_race' | 'app4_precision_striker' | 'app5_mind_territory' | 'app6_tiles_melds' | 'app7_solo_logic';
  minPlayers: number;
  maxPlayers: number;
  difficulty: GameDifficulty;
  difficultyReason: string;
  tags: string[];
  livePlayerCount: number;
  hasTutorial: boolean;
  hasBotMode: boolean;
  hasPvPMode: boolean;
  aspectRatio: '16:9' | '4:3' | '1:1';
}

export interface HubInfo {
  id: HubCategory;
  title: string;
  subtitle: string;
  iconName: string;
  gameCount: number;
  gradient: string;
}
