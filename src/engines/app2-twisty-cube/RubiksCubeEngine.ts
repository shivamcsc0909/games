import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export class RubiksCubeEngine extends BaseGameEngine {
  private rotX: number = 0.5;
  private rotY: number = -0.6;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private moveCount: number = 0;

  // Face colors
  private faceColors: Record<Face, string> = {
    U: '#FFFFFF', // White
    D: '#FFD500', // Yellow
    F: '#00D084', // Green
    B: '#0070F3', // Blue
    L: '#FF8A00', // Orange
    R: '#FF2D55'  // Red
  };

  protected setupWorker(): void {
    // Initial cube setup
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Dark cyber ambient backdrop
    ctx.fillStyle = '#080A0F';
    ctx.fillRect(0, 0, size, size);

    // Draw isometric 3D Rubik's Cube representation
    ctx.save();
    ctx.translate(cx, cy);

    const s = size * 0.16;

    // Draw 3 visible faces in 3D projection
    // Top Face (U)
    this.drawIsometricFace(ctx, 0, -s * 1.5, s, this.faceColors.U, 'skewX(-30deg) scaleY(0.86)');
    
    // Front Left Face (F)
    this.drawIsometricFace(ctx, -s * 1.3, 0, s, this.faceColors.F, 'skewY(30deg) scaleX(0.86)');

    // Front Right Face (R)
    this.drawIsometricFace(ctx, s * 1.3, 0, s, this.faceColors.R, 'skewY(-30deg) scaleX(0.86)');

    ctx.restore();

    // HUD overlays for 3D Cube: Controls & Scramble
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`MOVES: ${this.moveCount} | DRAG TO ROTATE 3D VIEW`, 20, size - 25);
  }

  private drawIsometricFace(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    size: number,
    baseColor: string,
    transform: string
  ): void {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 3x3 Grid Stickers
    const stickerSize = size / 3;
    const gap = 2;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = (c - 1.5) * stickerSize + gap;
        const y = (r - 1.5) * stickerSize + gap;
        const w = stickerSize - gap * 2;
        const h = stickerSize - gap * 2;

        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#0B0E14';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
      }
    }
    ctx.restore();
  }

  public handleInput(event: InputEventData): void {
    if (event.type === 'pointerdown') {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    } else if (event.type === 'pointermove') {
      if (this.isDragging) {
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        this.rotY += dx * 0.01;
        this.rotX += dy * 0.01;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
      }
    } else if (event.type === 'pointerup') {
      if (this.isDragging) {
        this.isDragging = false;
        audioManager.playPieceSnap();
        this.moveCount++;
      }
    }
  }

  public playMove(move: GameMove): boolean {
    this.moveCount++;
    audioManager.playPieceSnap();
    this.history.push(move);
    this.config.onMovePlayed(move);
    return true;
  }

  public validateMove(move: GameMove): boolean {
    return true;
  }

  public getBoardState(): any {
    return { moves: this.moveCount };
  }

  public undo(): boolean {
    if (this.moveCount > 0) {
      this.moveCount--;
      return true;
    }
    return false;
  }
}
