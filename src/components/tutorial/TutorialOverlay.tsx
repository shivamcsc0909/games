import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { TutorialStep } from '../../types/engine';
import { GhostArrow } from './GhostArrow';
import { SpotlightMask } from './SpotlightMask';

interface TutorialOverlayProps {
  currentStepIndex: number;
  totalSteps: number;
  activeStep: TutorialStep | null;
  isCompleted: boolean;
  errorFeedback: string | null;
  boardDimensions: { width: number; height: number; squareSize: number };
  onReset: () => void;
  onFinish: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentStepIndex,
  totalSteps,
  activeStep,
  isCompleted,
  errorFeedback,
  boardDimensions,
  onReset,
  onFinish
}) => {
  const { width, height, squareSize } = boardDimensions;

  // Compute spotlight coordinates from step highlightSquares
  const spotlightSquares = (activeStep?.highlightSquares || []).map((sq) => ({
    x: sq.col * squareSize,
    y: sq.row * squareSize,
    width: squareSize,
    height: squareSize
  }));

  // Compute ghost arrow start/end
  const ghostArrow = activeStep?.ghostMove
    ? {
        startX: (activeStep.ghostMove.from.col + 0.5) * squareSize,
        startY: (activeStep.ghostMove.from.row + 0.5) * squareSize,
        endX: (activeStep.ghostMove.to.col + 0.5) * squareSize,
        endY: (activeStep.ghostMove.to.row + 0.5) * squareSize
      }
    : null;

  return (
    <>
      {/* SVG Spotlight Mask */}
      {spotlightSquares.length > 0 && (
        <SpotlightMask
          squares={spotlightSquares}
          boardWidth={width}
          boardHeight={height}
        />
      )}

      {/* SVG Ghost Arrow Guide */}
      {ghostArrow && (
        <GhostArrow
          startX={ghostArrow.startX}
          startY={ghostArrow.startY}
          endX={ghostArrow.endX}
          endY={ghostArrow.endY}
        />
      )}

      {/* Error Feedback Toast */}
      {errorFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-bounce">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorFeedback}</span>
        </div>
      )}

      {/* Tutorial Floating HUD Control Card */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-cyber-card/95 backdrop-blur-md border border-cyber-border rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] select-none">
        {!isCompleted ? (
          <div className="space-y-3">
            {/* Header & Steps */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyber-accent" />
                <span className="text-xs font-mono font-bold text-cyber-accent uppercase tracking-wider">
                  Lesson {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'bg-cyber-accent w-4'
                        : idx < currentStepIndex
                        ? 'bg-cyber-emerald'
                        : 'bg-cyber-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            {activeStep && (
              <div>
                <h4 className="text-sm font-display font-bold text-white leading-tight">
                  {activeStep.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeStep.instruction}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Lesson Completed Celebration View */
          <div className="text-center space-y-3 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-display font-black text-white text-base">
                Tutorial Completed!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                You've mastered the essential tactics! Ready for Bot Level 1.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-xs text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Replay
              </button>
              <button
                onClick={onFinish}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-cyber-accent hover:bg-white text-cyber-dark font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              >
                <span>Play vs Bot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
