import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CategoryId, PracticeAttempt, ProgressState } from '../types';
import {
  completeScenarioIn,
  loadProgress,
  markCopiedIn,
  markListenedIn,
  markViewedIn,
  recordPracticeIn,
  recordQuizIn,
  saveProgress,
  storageAvailable,
  toggleFavoriteIn,
  emptyProgress,
} from '../services/storage';
import type { QuizResult } from '../types';

/**
 * One provider owns every piece of persisted learner state, so favourites,
 * recent history and progress cannot drift out of sync between pages.
 */
interface ProgressContextValue extends ProgressState {
  persistenceEnabled: boolean;
  isFavorite: (phraseId: string) => boolean;
  toggleFavorite: (phraseId: string) => void;
  viewPhrase: (phraseId: string, category: CategoryId) => void;
  listenPhrase: (phraseId: string) => void;
  copyPhrase: (phraseId: string) => void;
  recordPractice: (attempt: PracticeAttempt) => void;
  completeScenario: (scenarioId: string) => void;
  recordQuiz: (result: Omit<QuizResult, 'at'>) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  // Persist after render; a try/catch inside saveProgress keeps quota errors
  // from breaking the UI.
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Keep two tabs in sync (e.g. a demo window plus a phone preview).
  useEffect(() => {
    if (!storageAvailable) return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== 'kannada-saathi:progress:v1') return;
      setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((updater: (current: ProgressState) => ProgressState) => {
    setProgress((current) => updater(current));
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...progress,
      persistenceEnabled: storageAvailable,
      isFavorite: (phraseId) => progress.favorites.includes(phraseId),
      toggleFavorite: (phraseId) => update((current) => toggleFavoriteIn(current, phraseId)),
      viewPhrase: (phraseId, category) => update((current) => markViewedIn(current, phraseId, category)),
      listenPhrase: (phraseId) => update((current) => markListenedIn(current, phraseId)),
      copyPhrase: (phraseId) => update((current) => markCopiedIn(current, phraseId)),
      recordPractice: (attempt) => update((current) => recordPracticeIn(current, attempt)),
      completeScenario: (scenarioId) => update((current) => completeScenarioIn(current, scenarioId)),
      recordQuiz: (result) => update((current) => recordQuizIn(current, result)),
      resetProgress: () => update(() => ({ ...emptyProgress })),
    }),
    [progress, update],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside <ProgressProvider>');
  return context;
}
