import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

interface LudoPawn {
  id: string;
  playerIndex: number;
  position: number; // -1 = home yard, 0-51 = track, 52-57 = home column
  color: string;
}

export class LudoEngine extends BaseGameEngine {
  private diceValue: number = 6;
  private isRolling: boolean = false;
  private currentTurnPlayer: number = 0;
  private pawns: LudoPawn[] = [];
  private playerColors = ['#F43F5E', '#10B981', '#00F0FF', '#FFB800']; // Red, Green, Blue, Yellow

  protected setupWorker(): void {
    this.resetGame();
  }

  private resetGame(): void {
    this.pawns = [];
    const count = this.config.playerCount || 4;
    for (let p = 0; p < count; p++) {
      for (let i = 0; i < 4; i++) {
        this.pawns.push({
          id: `p-${p}-${i}`,
          playerIndex: p,
          position: -1,
          color: this.playerColors[p % this.playerColors.length]
        });
      }
    }
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;
    const gridSize = size / 15;

    ctx.clearRect(0, 0, size, size);

    // Board Surface
    ctx.fillStyle = '#080A0F';
    ctx.fillRect(0, 0, size, size);

    // 4 Corner Home Yards
    const yards = [
      { r: 0, c: 0, color: '#F43F5E' },
      { r: 0, c: 9, color: '#10B981' },
      { r: 9, c: 9, color: '#FFB800' },
      { r: 9, c: 0, color: '#00F0FF' }
    ];

    for (const y of yards) {
      ctx.fillStyle = y.color;
      ctx.fillRect(y.c * gridSize, y.r * gridSize, 6 * gridSize, 6 * gridSize);
      ctx.fillStyle = '#0F131D';
      ctx.fillRect((y.c + 1) * gridSize, (y.r + 1) * gridSize, 4 * gridSize, 4 * gridSize);
    }

    // Center Victory Triangle
    ctx.beginPath();
    ctx.moveTo(6 * gridSize, 6 * gridSize);
    ctx.lineTo(9 * gridSize, 6 * gridSize);
    ctx.lineTo(7.5 * gridSize, 7.5 * gridSize);
    ctx.fillStyle = '#10B981';
    ctx.fill();

    // Draw Track Cells
    ctx.strokeStyle = '#1F2738';
    ctx.lineWidth = 1;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Only draw cross arms
        const isArm = (r >= 6 && r <= 8) || (c >= 6 && c <= 8);
        const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
        if (isArm && !isCenter) {
          ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
        }
      }
    }

    // Center Animated 3D Dice Display
    const diceSize = gridSize * 2.2;
    const dcX = size / 2 - diceSize / 2;
    const dcY = size / 2 - diceSize / 2;

    ctx.fillStyle = '#1A2234';
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(dcX, dcY, diceSize, diceSize, 12);
    ctx.fill();
    ctx.stroke();

    // Dice Pips / Number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${diceSize * 0.55}px "Orbitron", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.isRolling ? '?' : this.diceValue.toString(),
      size / 2,
      size / 2
    );

    // Pawns display in Yards
    for (const p of this.pawns) {
      if (p.position === -1) {
        // Draw in yard base
        const yOff = p.playerIndex < 2 ? 2.5 * gridSize : 11.5 * gridSize;
        const xOff = (p.playerIndex === 0 || p.playerIndex === 3) ? 2.5 * gridSize : 11.5 * gridSize;

        ctx.beginPath();
        ctx.arc(xOff, yOff, gridSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  public handleInput(event: InputEventData): void {
    if (event.type === 'pointerdown') {
      const size = parseFloat(this.canvas.style.width) || 600;
      const diceSize = (size / 15) * 2.2;
      const dcX = size / 2 - diceSize / 2;
      const dcY = size / 2 - diceSize / 2;

      // Click on center dice
      if (
        event.x >= dcX &&
        event.x <= dcX + diceSize &&
        event.y >= dcY &&
        event.y <= dcY + diceSize &&
        !this.isRolling
      ) {
        this.rollDice();
      }
    }
  }

  private rollDice(): void {
    this.isRolling = true;
    audioManager.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
      count++;
      if (count >= 8) {
        clearInterval(interval);
        this.isRolling = false;
        audioManager.playPieceSnap();

        const move: GameMove = {
          diceRoll: this.diceValue,
          playerIndex: this.currentTurnPlayer,
          timestamp: Date.now()
        };
        this.playMove(move);
      }
    }, 60);
  }

  public playMove(move: GameMove): boolean {
    this.history.push(move);
    this.config.onMovePlayed(move);
    this.currentTurnPlayer = (this.currentTurnPlayer + 1) % (this.config.playerCount || 4);
    this.config.onTurnChange(this.currentTurnPlayer);
    return true;
  }

  public validateMove(move: GameMove): boolean {
    return true;
  }

  public getBoardState(): any {
    return { diceValue: this.diceValue, turn: this.currentTurnPlayer };
  }

  public undo(): boolean {
    return false;
  }
}
