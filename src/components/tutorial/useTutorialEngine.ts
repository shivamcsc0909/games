import { useState, useCallback } from 'react';
import { TutorialStep } from '../../types/engine';
import { audioManager } from '../../audio/AudioManager';

export function useTutorialEngine(steps: TutorialStep[], onComplete: () => void) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const activeStep = steps[currentStepIndex] || null;

  const validateUserAction = useCallback((move: { from: any; to: any }): boolean => {
    if (!activeStep || !activeStep.expectedMove) return true;

    const expected = activeStep.expectedMove;
    const isFromMatch = JSON.stringify(move.from) === JSON.stringify(expected.from);
    const isToMatch = JSON.stringify(move.to) === JSON.stringify(expected.to);

    if (isFromMatch && isToMatch) {
      audioManager.playCapture();
      setErrorFeedback(null);
      if (currentStepIndex + 1 < steps.length) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        audioManager.playVictoryFanfare();
        onComplete();
      }
      return true;
    } else {
      audioManager.playErrorBuzz();
      setErrorFeedback('Incorrect move for this lesson. Follow the highlighted ghost arrow!');
      setTimeout(() => setErrorFeedback(null), 2500);
      return false;
    }
  }, [activeStep, currentStepIndex, steps.length, onComplete]);

  const resetTutorial = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setErrorFeedback(null);
  };

  return {
    currentStepIndex,
    totalSteps: steps.length,
    activeStep,
    isCompleted,
    errorFeedback,
    validateUserAction,
    resetTutorial
  };
}
