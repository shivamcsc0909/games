import { EngineConfig, GameMove, InputEventData } from '../types/engine';

export interface IGameEngine {
  init(canvas: HTMLCanvasElement, container: HTMLElement, config: EngineConfig): Promise<void>;
  render(deltaTime: number): void;
  handleInput(event: InputEventData): void;
  playMove(move: GameMove): boolean;
  validateMove(move: GameMove): boolean;
  setBotLevel(level: number): void;
  getBoardState(): any;
  undo(): boolean;
  destroy(): void;
}
