import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  EMPTY_PROGRESS, loadProgress, markActive, saveProgress, type Progress,
} from '../lib/storage';

interface ProgressContextValue {
  progress: Progress;
  toggleFavourite: (id: string) => void;
  toggleLearned: (id: string) => void;
  recordQuiz: (score: number) => void;
  recordVoice: (id: string, score: number) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => markActive(loadProgress()));

  useEffect(() => { saveProgress(progress); }, [progress]);

  const toggleFavourite = useCallback((id: string) => {
    setProgress((current) => ({ ...current, favourites: toggle(current.favourites, id) }));
  }, []);
  const toggleLearned = useCallback((id: string) => {
    setProgress((current) => ({ ...current, learned: toggle(current.learned, id) }));
  }, []);
  const recordQuiz = useCallback((score: number) => {
    setProgress((current) => ({
      ...current,
      quizAttempts: current.quizAttempts + 1,
      bestQuiz: Math.max(current.bestQuiz, score),
    }));
  }, []);
  const recordVoice = useCallback((id: string, score: number) => {
    setProgress((current) => ({
      ...current,
      voiceBest: { ...current.voiceBest, [id]: Math.max(current.voiceBest[id] ?? 0, score) },
    }));
  }, []);
  const reset = useCallback(() => setProgress({ ...EMPTY_PROGRESS }), []);

  const value = useMemo(
    () => ({ progress, toggleFavourite, toggleLearned, recordQuiz, recordVoice, reset }),
    [progress, toggleFavourite, toggleLearned, recordQuiz, recordVoice, reset],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider');
  return context;
}
