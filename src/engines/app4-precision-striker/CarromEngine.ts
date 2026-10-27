import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

interface PhysicsBody {
  id: string;
  type: 'striker' | 'queen' | 'white' | 'black';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isPocketed: boolean;
  color: string;
}

export class CarromEngine extends BaseGameEngine {
  private bodies: PhysicsBody[] = [];
  private strikerBaselineX: number = 0.5; // 0 to 1 along baseline
  private isAiming: boolean = false;
  private aimStartX: number = 0;
  private aimStartY: number = 0;
  private aimCurrentX: number = 0;
  private aimCurrentY: number = 0;
  private score: { p1: number; p2: number } = { p1: 0, p2: 0 };
  private friction: number = 0.982;

  protected setupWorker(): void {
    this.resetBoard();
  }

  private resetBoard(): void {
    this.bodies = [];
    const size = 600;
    const center = size / 2;

    // Center Queen (Red)
    this.bodies.push({
      id: 'queen',
      type: 'queen',
      x: center,
      y: center,
      vx: 0,
      vy: 0,
      radius: 12,
      mass: 1.0,
      isPocketed: false,
      color: '#F43F5E'
    });

    // 1st Ring (6 alternating white & black coins around queen)
    const ringRadius = 26;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const isWhite = i % 2 === 0;
      this.bodies.push({
        id: `coin-${i}`,
        type: isWhite ? 'white' : 'black',
        x: center + Math.cos(angle) * ringRadius,
        y: center + Math.sin(angle) * ringRadius,
        vx: 0,
        vy: 0,
        radius: 12,
        mass: 1.0,
        isPocketed: false,
        color: isWhite ? '#F8FAFC' : '#1E293B'
      });
    }

    // Striker
    this.spawnStriker(size);
  }

  private spawnStriker(size: number): void {
    const baselineY = size - 70;
    const minX = 100;
    const maxX = size - 100;
    const posX = minX + this.strikerBaselineX * (maxX - minX);

    // Remove existing striker if any
    this.bodies = this.bodies.filter((b) => b.type !== 'striker');

    this.bodies.push({
      id: 'striker',
      type: 'striker',
      x: posX,
      y: baselineY,
      vx: 0,
      vy: 0,
      radius: 18,
      mass: 2.8,
      isPocketed: false,
      color: '#00F0FF'
    });
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;

    // Update 2D Rigid Body Physics
    this.updatePhysics(deltaTime, size);

    // Draw Carrom Wooden Board
    ctx.clearRect(0, 0, size, size);

    // Board Surface
    ctx.fillStyle = '#1A140F';
    ctx.fillRect(0, 0, size, size);

    // Wooden Border Frame
    ctx.strokeStyle = '#382818';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, size - 16, size - 16);

    // 4 Corner Pockets
    const pocketRadius = 22;
    const pockets = [
      { x: 32, y: 32 },
      { x: size - 32, y: 32 },
      { x: 32, y: size - 32 },
      { x: size - 32, y: size - 32 }
    ];

    for (const p of pockets) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, pocketRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#080A0F';
      ctx.fill();
      ctx.strokeStyle = '#1F2738';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Center Floral Circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 42, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFB800';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Baseline Rails
    ctx.strokeStyle = '#4A3B2C';
    ctx.lineWidth = 2;
    // Bottom Baseline
    ctx.beginPath();
    ctx.moveTo(100, size - 70);
    ctx.lineTo(size - 100, size - 70);
    ctx.stroke();
    // Baseline red circles
    [100, size - 100].forEach((bx) => {
      ctx.beginPath();
      ctx.arc(bx, size - 70, 15, 0, Math.PI * 2);
      ctx.strokeStyle = '#F43F5E';
      ctx.stroke();
    });

    // Draw Aiming Line with Reflection Guideline
    if (this.isAiming) {
      const striker = this.bodies.find((b) => b.type === 'striker');
      if (striker) {
        const dx = this.aimStartX - this.aimCurrentX;
        const dy = this.aimStartY - this.aimCurrentY;

        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(striker.x + dx * 2, striker.y + dy * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Carrom Pieces
    for (const b of this.bodies) {
      if (b.isPocketed) continue;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      ctx.strokeStyle = b.type === 'striker' ? '#00F0FF' : '#000000';
      ctx.lineWidth = b.type === 'striker' ? 3 : 1.5;
      ctx.stroke();

      // Striker Inner Ring
      if (b.type === 'striker') {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.stroke();
      }
    }
  }

  private updatePhysics(dt: number, size: number): void {
    const boundMin = 20;
    const boundMax = size - 20;
    const pockets = [
      { x: 32, y: 32 },
      { x: size - 32, y: 32 },
      { x: 32, y: size - 32 },
      { x: size - 32, y: size - 32 }
    ];

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (b.isPocketed) continue;

      // Update position
      b.x += b.vx;
      b.y += b.vy;

      // Apply kinetic friction
      b.vx *= this.friction;
      b.vy *= this.friction;

      if (Math.abs(b.vx) < 0.05) b.vx = 0;
      if (Math.abs(b.vy) < 0.05) b.vy = 0;

      // Wall rebounds
      if (b.x - b.radius < boundMin) {
        b.x = boundMin + b.radius;
        b.vx = -b.vx * 0.85;
      } else if (b.x + b.radius > boundMax) {
        b.x = boundMax - b.radius;
        b.vx = -b.vx * 0.85;
      }
      if (b.y - b.radius < boundMin) {
        b.y = boundMin + b.radius;
        b.vy = -b.vy * 0.85;
      } else if (b.y + b.radius > boundMax) {
        b.y = boundMax - b.radius;
        b.vy = -b.vy * 0.85;
      }

      // Check pocket collision
      for (const p of pockets) {
        const dist = Math.hypot(b.x - p.x, b.y - p.y);
        if (dist < 26) {
          b.isPocketed = true;
          b.vx = 0;
          b.vy = 0;
          audioManager.playCapture();
          if (b.type === 'white') this.score.p1 += 10;
          if (b.type === 'black') this.score.p2 += 10;
          if (b.type === 'queen') this.score.p1 += 30;
          break;
        }
      }

      // Circle-Circle collisions
      for (let j = i + 1; j < this.bodies.length; j++) {
        const b2 = this.bodies[j];
        if (b2.isPocketed) continue;

        const dx = b2.x - b.x;
        const dy = b2.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Separate overlap
          const overlap = 0.5 * (minDist - dist);
          b.x -= nx * overlap;
          b.y -= ny * overlap;
          b2.x += nx * overlap;
          b2.y += ny * overlap;

          // Elastic collision impulse
          const kx = b.vx - b2.vx;
          const ky = b.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / (b.mass + b2.mass);

          b.vx -= p * b2.mass * nx * 0.95;
          b.vy -= p * b2.mass * ny * 0.95;
          b2.vx += p * b.mass * nx * 0.95;
          b2.vy += p * b.mass * ny * 0.95;

          audioManager.playPieceSnap();
        }
      }
    }
  }

  public handleInput(event: InputEventData): void {
    const striker = this.bodies.find((b) => b.type === 'striker');
    if (!striker) return;

    if (event.type === 'pointerdown') {
      const dist = Math.hypot(event.x - striker.x, event.y - striker.y);
      if (dist < striker.radius * 2) {
        this.isAiming = true;
        this.aimStartX = event.x;
        this.aimStartY = event.y;
        this.aimCurrentX = event.x;
        this.aimCurrentY = event.y;
      }
    } else if (event.type === 'pointermove') {
      if (this.isAiming) {
        this.aimCurrentX = event.x;
        this.aimCurrentY = event.y;
      }
    } else if (event.type === 'pointerup') {
      if (this.isAiming) {
        this.isAiming = false;
        const dx = this.aimStartX - this.aimCurrentX;
        const dy = this.aimStartY - this.aimCurrentY;
        const force = Math.min(Math.hypot(dx, dy) * 0.22, 28);
        const angle = Math.atan2(dy, dx);

        striker.vx = Math.cos(angle) * force;
        striker.vy = Math.sin(angle) * force;
        audioManager.playStrikerFlick();

        const move: GameMove = {
          flickVector: { x: striker.vx, y: striker.vy },
          playerIndex: 0,
          timestamp: Date.now()
        };
        this.playMove(move);
      }
    }
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
    return { score: this.score, bodiesCount: this.bodies.length };
  }

  public undo(): boolean {
    return false;
  }
}
