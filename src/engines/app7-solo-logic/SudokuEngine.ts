import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

export class SudokuEngine extends BaseGameEngine {
  private initialGrid: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
  private currentGrid: number[][] = [];
  private selectedCell: { row: number; col: number } | null = null;
  private selectedNumber: number = 1;

  protected setupWorker(): void {
    this.currentGrid = this.initialGrid.map((r) => [...r]);
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;
    const cellSize = size / 9;

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#080A0F';
    ctx.fillRect(0, 0, size, size);

    // Selected cell highlight
    if (this.selectedCell) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fillRect(
        this.selectedCell.col * cellSize,
        this.selectedCell.row * cellSize,
        cellSize,
        cellSize
      );
    }

    // Grid lines
    for (let i = 0; i <= 9; i++) {
      const isThick = i % 3 === 0;
      ctx.strokeStyle = isThick ? '#00F0FF' : '#1F2738';
      ctx.lineWidth = isThick ? 2.5 : 1;

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
    }

    // Digits
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${cellSize * 0.55}px "Orbitron", sans-serif`;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.currentGrid[r][c];
        if (val !== 0) {
          const isInitial = this.initialGrid[r][c] !== 0;
          ctx.fillStyle = isInitial ? '#FFFFFF' : '#00F0FF';
          ctx.fillText(
            val.toString(),
            c * cellSize + cellSize / 2,
            r * cellSize + cellSize / 2
          );
        }
      }
    }
  }

  public handleInput(event: InputEventData): void {
    const size = parseFloat(this.canvas.style.width) || 600;
    const cellSize = size / 9;
    const c = Math.floor(event.x / cellSize);
    const r = Math.floor(event.y / cellSize);

    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
      if (event.type === 'pointerdown') {
        this.selectedCell = { row: r, col: c };
        audioManager.playPiecePick();
      }
    }
  }

  public setDigit(digit: number): void {
    if (!this.selectedCell) return;
    const { row, col } = this.selectedCell;
    if (this.initialGrid[row][col] !== 0) return; // Read-only clue

    this.currentGrid[row][col] = digit;
    audioManager.playPieceSnap();

    const move: GameMove = {
      to: { row, col },
      metadata: { digit },
      playerIndex: 0,
      timestamp: Date.now()
    };
    this.playMove(move);
  }

  public playMove(move: GameMove): boolean {
    this.history.push(move);
    this.config.onMovePlayed(move);
    return true;
  }

  public validateMove(move: GameMove): boolean {
    return true;
  }

  public getBoardState(): any {
    return { grid: this.currentGrid };
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    this.history.pop();
    return true;
  }
}
