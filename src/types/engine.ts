export interface GameMove {
  from?: any;
  to?: any;
  piece?: string;
  captured?: string;
  diceRoll?: number;
  flickVector?: { x: number; y: number };
  notation?: string;
  playerIndex: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface EngineConfig {
  gameId: string;
  isLandscape: boolean;
  playerCount: number;
  soundEnabled: boolean;
  theme: 'cyber-dark' | 'neon-arcade' | 'tournament';
  botDifficulty: number; // 1 to 100
  onMovePlayed: (move: GameMove) => void;
  onGameOver: (winnerIndex: number, score: number) => void;
  onTurnChange: (activePlayerIndex: number) => void;
}

export interface InputEventData {
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'keydown' | 'click';
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  key?: string;
  button?: number;
}

export interface TutorialStep {
  stepIndex: number;
  title: string;
  instruction: string;
  highlightSquares?: { row: number; col: number }[];
  ghostMove?: { from: { row: number; col: number }; to: { row: number; col: number } };
  expectedMove?: { from: any; to: any };
}
