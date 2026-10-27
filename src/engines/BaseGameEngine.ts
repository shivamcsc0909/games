import { EngineConfig, GameMove, InputEventData } from '../types/engine';
import { IGameEngine } from './IGameEngine';

export abstract class BaseGameEngine implements IGameEngine {
  protected canvas!: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected container!: HTMLElement;
  protected config!: EngineConfig;
  protected isRunning: boolean = false;
  protected animFrameId: number = 0;
  protected history: GameMove[] = [];
  protected botLevel: number = 1;
  protected dpr: number = 1;
  protected resizeObserver: ResizeObserver | null = null;

  async init(canvas: HTMLCanvasElement, container: HTMLElement, config: EngineConfig): Promise<void> {
    this.canvas = canvas;
    this.container = container;
    this.config = config;
    this.ctx = canvas.getContext('2d');
    this.botLevel = config.botDifficulty;
    this.dpr = window.devicePixelRatio || 1;

    this.setupResizeObserver();
    this.resizeCanvas();
    this.setupWorker();
    this.startLoop();
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(this.container);
  }

  protected resizeCanvas(): void {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    
    // Scale for High-DPI screens
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  protected startLoop(): void {
    let lastTime = performance.now();
    const loop = (currentTime: number) => {
      if (!this.isRunning) return;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      this.render(deltaTime);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.isRunning = true;
    this.animFrameId = requestAnimationFrame(loop);
  }

  public setBotLevel(level: number): void {
    this.botLevel = Math.max(1, Math.min(100, level));
  }

  public abstract render(deltaTime: number): void;
  public abstract handleInput(event: InputEventData): void;
  public abstract playMove(move: GameMove): boolean;
  public abstract validateMove(move: GameMove): boolean;
  public abstract getBoardState(): any;
  public abstract undo(): boolean;
  protected abstract setupWorker(): void;

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
