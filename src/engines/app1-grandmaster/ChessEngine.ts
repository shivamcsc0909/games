import { BaseGameEngine } from '../BaseGameEngine';
import { GameMove, InputEventData } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export class ChessEngine extends BaseGameEngine {
  private board: (ChessPiece | null)[][] = [];
  private selectedSquare: { row: number; col: number } | null = null;
  private legalMoves: { row: number; col: number }[] = [];
  private currentTurn: PieceColor = 'w';
  private draggedPiece: { piece: ChessPiece; origin: { row: number; col: number }; x: number; y: number } | null = null;
  private isBotThinking: boolean = false;

  protected setupWorker(): void {
    this.resetBoard();
  }

  private resetBoard(): void {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Pawns
    for (let c = 0; c < 8; c++) {
      this.board[1][c] = { type: 'p', color: 'b' };
      this.board[6][c] = { type: 'p', color: 'w' };
    }

    // Pieces layout
    const backRow: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let c = 0; c < 8; c++) {
      this.board[0][c] = { type: backRow[c], color: 'b' };
      this.board[7][c] = { type: backRow[c], color: 'w' };
    }

    this.currentTurn = 'w';
    this.selectedSquare = null;
    this.legalMoves = [];
  }

  public render(deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = parseFloat(this.canvas.style.width) || 600;
    const sqSize = size / 8;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw Board Grid
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        ctx.fillStyle = isLight ? '#1A2234' : '#0F1420';
        ctx.fillRect(c * sqSize, r * sqSize, sqSize, sqSize);

        // Highlight selected square
        if (this.selectedSquare && this.selectedSquare.row === r && this.selectedSquare.col === c) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.fillRect(c * sqSize, r * sqSize, sqSize, sqSize);
        }
      }
    }

    // 2. Draw Legal Move Dots
    for (const move of this.legalMoves) {
      const cx = (move.col + 0.5) * sqSize;
      const cy = (move.row + 0.5) * sqSize;
      const targetPiece = this.board[move.row][move.col];

      if (targetPiece) {
        // Capture ring
        ctx.beginPath();
        ctx.arc(cx, cy, sqSize * 0.42, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      } else {
        // Move dot
        ctx.beginPath();
        ctx.arc(cx, cy, sqSize * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.fill();
      }
    }

    // 3. Draw Pieces
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // If this piece is being dragged, skip drawing it on the square
        if (this.draggedPiece && this.draggedPiece.origin.row === r && this.draggedPiece.origin.col === c) {
          continue;
        }
        const piece = this.board[r][c];
        if (piece) {
          this.drawPiece(ctx, piece, c * sqSize + sqSize / 2, r * sqSize + sqSize / 2, sqSize * 0.7);
        }
      }
    }

    // 4. Draw Dragged Piece
    if (this.draggedPiece) {
      this.drawPiece(ctx, this.draggedPiece.piece, this.draggedPiece.x, this.draggedPiece.y, sqSize * 0.85);
    }
  }

  private drawPiece(ctx: CanvasRenderingContext2D, piece: ChessPiece, x: number, y: number, size: number): void {
    const symbols: Record<PieceColor, Record<PieceType, string>> = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px sans-serif`;

    if (piece.color === 'w') {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#A855F7';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
      ctx.shadowBlur = 8;
    }

    ctx.fillText(symbols[piece.color][piece.type], x, y);
    ctx.restore();
  }

  public handleInput(event: InputEventData): void {
    const size = parseFloat(this.canvas.style.width) || 600;
    const sqSize = size / 8;
    const col = Math.floor(event.x / sqSize);
    const row = Math.floor(event.y / sqSize);

    if (row < 0 || row >= 8 || col < 0 || col >= 8) {
      if (event.type === 'pointerup') {
        this.draggedPiece = null;
      }
      return;
    }

    if (event.type === 'pointerdown') {
      const piece = this.board[row][col];
      if (piece && piece.color === this.currentTurn) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.calculateLegalMoves(row, col);
        this.draggedPiece = {
          piece,
          origin: { row, col },
          x: event.x,
          y: event.y
        };
        audioManager.playPiecePick();
      } else if (this.selectedSquare) {
        // Attempt move to clicked square
        this.attemptMove(this.selectedSquare, { row, col });
      }
    } else if (event.type === 'pointermove') {
      if (this.draggedPiece) {
        this.draggedPiece.x = event.x;
        this.draggedPiece.y = event.y;
      }
    } else if (event.type === 'pointerup') {
      if (this.draggedPiece) {
        const from = this.draggedPiece.origin;
        const to = { row, col };
        this.attemptMove(from, to);
        this.draggedPiece = null;
      }
    }
  }

  private attemptMove(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
    const isLegal = this.legalMoves.some((m) => m.row === to.row && m.col === to.col);
    if (isLegal) {
      const move: GameMove = {
        from,
        to,
        piece: this.board[from.row][from.col]?.type,
        captured: this.board[to.row][to.col]?.type,
        playerIndex: this.currentTurn === 'w' ? 0 : 1,
        timestamp: Date.now()
      };
      this.playMove(move);
      return true;
    } else {
      if (from.row !== to.row || from.col !== to.col) {
        this.selectedSquare = null;
        this.legalMoves = [];
      }
      return false;
    }
  }

  public playMove(move: GameMove): boolean {
    const from = move.from;
    const to = move.to;
    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const captured = this.board[to.row][to.col];
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    if (captured) {
      audioManager.playCapture();
    } else {
      audioManager.playPieceSnap();
    }

    this.history.push(move);
    this.config.onMovePlayed(move);

    // Switch turn
    this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';
    this.selectedSquare = null;
    this.legalMoves = [];
    this.config.onTurnChange(this.currentTurn === 'w' ? 0 : 1);

    // Check if Bot turn
    if (this.currentTurn === 'b' && !this.isBotThinking) {
      this.scheduleBotMove();
    }

    return true;
  }

  private scheduleBotMove(): void {
    this.isBotThinking = true;
    setTimeout(() => {
      this.executeBotMove();
      this.isBotThinking = false;
    }, 450);
  }

  private executeBotMove(): void {
    // Collect all legal black moves
    const allMoves: { from: { row: number; col: number }; to: { row: number; col: number }; score: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === 'b') {
          const legals = this.calculateLegalMoves(r, c);
          for (const to of legals) {
            const target = this.board[to.row][to.col];
            let score = 0;
            if (target) {
              const values: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
              score = values[target.type];
            }
            allMoves.push({ from: { row: r, col: c }, to, score });
          }
        }
      }
    }

    if (allMoves.length === 0) {
      // Checkmate or Stalemate
      this.config.onGameOver(0, 100);
      return;
    }

    // Sort by capture score
    allMoves.sort((a, b) => b.score - a.score);
    // With dynamic bot difficulty blunder chance
    const blunderRate = Math.max(0.05, 0.4 - (this.botLevel * 0.007));
    const chosenMove = Math.random() < blunderRate
      ? allMoves[Math.floor(Math.random() * allMoves.length)]
      : allMoves[0];

    this.playMove({
      from: chosenMove.from,
      to: chosenMove.to,
      piece: this.board[chosenMove.from.row][chosenMove.from.col]?.type,
      captured: this.board[chosenMove.to.row][chosenMove.to.col]?.type,
      playerIndex: 1,
      timestamp: Date.now()
    });
  }

  private calculateLegalMoves(row: number, col: number): { row: number; col: number }[] {
    const piece = this.board[row][col];
    if (!piece) return [];
    const moves: { row: number; col: number }[] = [];
    const dir = piece.color === 'w' ? -1 : 1;

    if (piece.type === 'p') {
      // Forward 1
      if (this.isWithinBounds(row + dir, col) && !this.board[row + dir][col]) {
        moves.push({ row: row + dir, col });
        // Initial 2-step
        const startRow = piece.color === 'w' ? 6 : 1;
        if (row === startRow && !this.board[row + 2 * dir][col]) {
          moves.push({ row: row + 2 * dir, col });
        }
      }
      // Captures
      [-1, 1].forEach((dc) => {
        if (this.isWithinBounds(row + dir, col + dc)) {
          const target = this.board[row + dir][col + dc];
          if (target && target.color !== piece.color) {
            moves.push({ row: row + dir, col: col + dc });
          }
        }
      });
    } else if (piece.type === 'n') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightOffsets.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (this.isWithinBounds(nr, nc)) {
          const target = this.board[nr][nc];
          if (!target || target.color !== piece.color) {
            moves.push({ row: nr, col: nc });
          }
        }
      });
    } else {
      // Ray sliding for Rook, Bishop, Queen, King
      const directions: Record<string, number[][]> = {
        r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
        b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
        k: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
      };
      const rayDirs = directions[piece.type] || [];
      const maxDist = piece.type === 'k' ? 1 : 7;

      for (const [dr, dc] of rayDirs) {
        for (let step = 1; step <= maxDist; step++) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (!this.isWithinBounds(nr, nc)) break;
          const target = this.board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: nr, col: nc });
            }
            break;
          }
        }
      }
    }

    return moves;
  }

  private isWithinBounds(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  public validateMove(move: GameMove): boolean {
    return true;
  }

  public getBoardState(): any {
    return { board: this.board, turn: this.currentTurn };
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    this.history.pop();
    this.resetBoard();
    return true;
  }
}
