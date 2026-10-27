import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useUserStore } from '../../store/useUserStore';
import { IGameEngine } from '../../engines/IGameEngine';
import { ChessEngine } from '../../engines/app1-grandmaster/ChessEngine';
import { RubiksCubeEngine } from '../../engines/app2-twisty-cube/RubiksCubeEngine';
import { CarromEngine } from '../../engines/app4-precision-striker/CarromEngine';
import { LudoEngine } from '../../engines/app3-royal-race/LudoEngine';
import { GoEngine } from '../../engines/app5-mind-territory/GoEngine';
import { SudokuEngine } from '../../engines/app7-solo-logic/SudokuEngine';
import { LandscapeHUD } from './LandscapeHUD';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { useTutorialEngine } from '../tutorial/useTutorialEngine';
import { GameMove } from '../../types/engine';

export const GameViewport: React.FC = () => {
  const { activeGame, currentView, exitGame } = useGameStore();
  const { addXP, recordBotWin, recordPvPMatch, completeTutorial } = useUserStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<IGameEngine | null>(null);

  const [moves, setMoves] = useState<GameMove[]>([]);
  const [activePlayer, setActivePlayer] = useState<number>(0);

  // Tutorial Steps sample for Chess / Tactical Lessons
  const tutorialSteps = [
    {
      stepIndex: 0,
      title: 'Pawn Forward Advance',
      instruction: 'Drag your central e2 white pawn forward two squares to e4 to claim the center of the board.',
      highlightSquares: [{ row: 6, col: 4 }, { row: 4, col: 4 }],
      ghostMove: { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } },
      expectedMove: { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } }
    },
    {
      stepIndex: 1,
      title: 'Knight Outpost Leap',
      instruction: 'Jump your g1 knight over pawns to f3, eyeing the central squares.',
      highlightSquares: [{ row: 7, col: 6 }, { row: 5, col: 5 }],
      ghostMove: { from: { row: 7, col: 6 }, to: { row: 5, col: 5 } },
      expectedMove: { from: { row: 7, col: 6 }, to: { row: 5, col: 5 } }
    },
    {
      stepIndex: 2,
      title: 'Bishop Tactical Diagonal',
      instruction: 'Develop your f1 bishop along the open diagonal to c4, threatening the f7 weakness.',
      highlightSquares: [{ row: 7, col: 5 }, { row: 4, col: 2 }],
      ghostMove: { from: { row: 7, col: 5 }, to: { row: 4, col: 2 } },
      expectedMove: { from: { row: 7, col: 5 }, to: { row: 4, col: 2 } }
    }
  ];

  const tutorial = useTutorialEngine(tutorialSteps, () => {
    if (activeGame) {
      completeTutorial(activeGame.id);
    }
  });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !activeGame) return;

    let engine: IGameEngine;

    switch (activeGame.engineId) {
      case 'app1_grandmaster':
        engine = new ChessEngine();
        break;
      case 'app2_twisty_cube':
        engine = new RubiksCubeEngine();
        break;
      case 'app3_royal_race':
        engine = new LudoEngine();
        break;
      case 'app4_precision_striker':
        engine = new CarromEngine();
        break;
      case 'app5_mind_territory':
        engine = new GoEngine();
        break;
      case 'app7_solo_logic':
        engine = new SudokuEngine();
        break;
      default:
        engine = new ChessEngine();
        break;
    }

    engineRef.current = engine;
    setMoves([]);
    setActivePlayer(0);

    engine.init(canvasRef.current, containerRef.current, {
      gameId: activeGame.id,
      isLandscape: true,
      playerCount: activeGame.minPlayers,
      soundEnabled: true,
      theme: 'cyber-dark',
      botDifficulty: 25,
      onMovePlayed: (move: GameMove) => {
        setMoves((prev) => [...prev, move]);
        if (currentView === 'tutorial' && move.from && move.to) {
          tutorial.validateUserAction({ from: move.from, to: move.to });
        }
      },
      onGameOver: (winnerIndex: number, score: number) => {
        if (winnerIndex === 0) {
          recordBotWin(activeGame.id, 3);
        } else {
          recordPvPMatch(activeGame.id, 'loss', -15);
        }
      },
      onTurnChange: (turnIndex: number) => {
        setActivePlayer(turnIndex);
      }
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [activeGame?.id, activeGame?.engineId, currentView]);

  // Pointer & Touch Events
  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    engineRef.current.handleInput({
      type: e.type as any,
      x,
      y,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  if (!activeGame) return null;

  return (
    <LandscapeHUD
      game={activeGame}
      activePlayerIndex={activePlayer}
      moves={moves}
      onResign={() => exitGame()}
      onUndo={() => engineRef.current?.undo()}
      onReset={() => {
        setMoves([]);
        engineRef.current?.destroy();
        if (canvasRef.current && containerRef.current && engineRef.current) {
          engineRef.current.init(canvasRef.current, containerRef.current, {
            gameId: activeGame.id,
            isLandscape: true,
            playerCount: activeGame.minPlayers,
            soundEnabled: true,
            theme: 'cyber-dark',
            botDifficulty: 25,
            onMovePlayed: (m) => setMoves((prev) => [...prev, m]),
            onGameOver: () => {},
            onTurnChange: setActivePlayer
          });
        }
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
          onPointerUp={handlePointer}
          className="rounded-2xl border border-cyber-border shadow-[0_0_40px_rgba(0,0,0,0.8)] touch-none cursor-pointer"
        />

        {/* Sudoku Digit Dock Overlay if active */}
        {activeGame.engineId === 'app7_solo_logic' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-cyber-card/95 border border-cyber-border rounded-xl backdrop-blur-md shadow-lg">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => {
                  if (engineRef.current instanceof SudokuEngine) {
                    (engineRef.current as SudokuEngine).setDigit(digit);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-cyber-dark hover:bg-cyber-accent hover:text-cyber-dark text-slate-100 font-bold font-mono text-sm border border-cyber-border transition-colors"
              >
                {digit}
              </button>
            ))}
          </div>
        )}

        {/* Tutorial Overlay if in tutorial mode */}
        {currentView === 'tutorial' && (
          <TutorialOverlay
            currentStepIndex={tutorial.currentStepIndex}
            totalSteps={tutorial.totalSteps}
            activeStep={tutorial.activeStep}
            isCompleted={tutorial.isCompleted}
            errorFeedback={tutorial.errorFeedback}
            boardDimensions={{
              width: parseFloat(canvasRef.current?.style.width || '600'),
              height: parseFloat(canvasRef.current?.style.height || '600'),
              squareSize: parseFloat(canvasRef.current?.style.width || '600') / 8
            }}
            onReset={tutorial.resetTutorial}
            onFinish={() => exitGame()}
          />
        )}
      </div>
    </LandscapeHUD>
  );
};
