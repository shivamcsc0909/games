import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

type Stone = 'black' | 'white' | null;

export class GoEngine extends BaseGameEngine {
  private boardSize: number = 19;
  private grid: Stone[][] = [];
  private currentTurn: 'black' | 'white' = 'black';
  private captures: { black: number; white: number } = { black: 0, white: 0 };

  protected setupWorker(): void {
    this.resetBoard();
  }

  private resetBoard(): void {
    this.grid = Array(this.boardSize)
      .fill(null)
      .map(() => Array(this.boardSize).fill(null));
    this.currentTurn = 'black';
    this.captures = { black: 0, white: 0 };
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;
    const margin = 28;
    const playableSize = size - margin * 2;
    const step = playableSize / (this.boardSize - 1);

    ctx.clearRect(0, 0, size, size);

    // Traditional Kaya Wooden Board Tint
    ctx.fillStyle = '#2A1F16';
    ctx.fillRect(0, 0, size, size);

    // Outer Border
    ctx.strokeStyle = '#3D2D1F';
    ctx.lineWidth = 4;
    ctx.strokeRect(margin / 2, margin / 2, size - margin, size - margin);

    // Grid lines
    ctx.strokeStyle = '#D9A74A';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.boardSize; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(margin, margin + i * step);
      ctx.lineTo(size - margin, margin + i * step);
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      ctx.moveTo(margin + i * step, margin);
      ctx.lineTo(margin + i * step, size - margin);
      ctx.stroke();
    }

    // Star points (Hoshi) on 19x19
    const starIndices = [3, 9, 15];
    ctx.fillStyle = '#D9A74A';
    for (const r of starIndices) {
      for (const c of starIndices) {
        ctx.beginPath();
        ctx.arc(margin + c * step, margin + r * step, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Placed Stones
    const stoneRadius = step * 0.46;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const stone = this.grid[r][c];
        if (stone) {
          const cx = margin + c * step;
          const cy = margin + r * step;

          ctx.beginPath();
          ctx.arc(cx, cy, stoneRadius, 0, Math.PI * 2);

          if (stone === 'black') {
            const grad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, stoneRadius);
            grad.addColorStop(0, '#334155');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
          } else {
            const grad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, stoneRadius);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(1, '#CBD5E1');
            ctx.fillStyle = grad;
          }
          ctx.fill();

          ctx.strokeStyle = stone === 'black' ? '#000000' : '#94A3B8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  public handleInput(event: InputEventData): void {
    if (event.type !== 'pointerdown') return;
    const size = parseFloat(this.canvas.style.width) || 600;
    const margin = 28;
    const step = (size - margin * 2) / (this.boardSize - 1);

    const c = Math.round((event.x - margin) / step);
    const r = Math.round((event.y - margin) / step);

    if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
      if (!this.grid[r][c]) {
        const move: GameMove = {
          to: { row: r, col: c },
          piece: this.currentTurn,
          playerIndex: this.currentTurn === 'black' ? 0 : 1,
          timestamp: Date.now()
        };
        this.playMove(move);
      }
    }
  }

  public playMove(move: GameMove): boolean {
    const { row, col } = move.to;
    this.grid[row][col] = this.currentTurn;
    audioManager.playPieceSnap();

    // Switch turn
    this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
    this.history.push(move);
    this.config.onMovePlayed(move);
    this.config.onTurnChange(this.currentTurn === 'black' ? 0 : 1);
    return true;
  }

  public validateMove(move: GameMove): boolean {
    return true;
  }

  public getBoardState(): any {
    return { grid: this.grid, turn: this.currentTurn, captures: this.captures };
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    const lastMove = this.history.pop()!;
    this.grid[lastMove.to.row][lastMove.to.col] = null;
    this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
    return true;
  }
}
