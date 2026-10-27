import type { CategoryId, PracticeAttempt, ProgressState, QuizResult } from '../types';
import { todayIso } from '../utils/text';

/**
 * Local persistence. The app has to survive private mode, a blocked storage
 * API or a quota error, so every read and write is defensive. Progress is kept
 * under one versioned key so a future migration has an obvious place to hook.
 */
const STORAGE_KEY = 'kannada-saathi:progress:v1';
const MAX_RECENT = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

export const emptyProgress: ProgressState = {
  favorites: [],
  recent: [],
  categoryActivity: {},
  listened: [],
  copied: [],
  practice: {},
  completedScenarios: [],
  bestQuiz: null,
  quizAttempts: 0,
  activeDays: [],
};

function isStorageAvailable(): boolean {
  try {
    const probe = '__ks_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = typeof window !== 'undefined' && isStorageAvailable();

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Merge a stored payload with the defaults so older/partial data never crashes. */
export function hydrateProgress(raw: string | null): ProgressState {
  if (!raw) return { ...emptyProgress };
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;

    const practice: Record<string, PracticeAttempt> = {};
    if (parsed.practice && typeof parsed.practice === 'object') {
      for (const [id, attempt] of Object.entries(parsed.practice)) {
        if (attempt && typeof attempt.similarity === 'number' && typeof attempt.said === 'string') {
          practice[id] = attempt;
        }
      }
    }

    const bestQuiz =
      parsed.bestQuiz && typeof parsed.bestQuiz.score === 'number' && typeof parsed.bestQuiz.total === 'number'
        ? parsed.bestQuiz
        : null;

    const categoryActivity: ProgressState['categoryActivity'] = {};
    if (parsed.categoryActivity && typeof parsed.categoryActivity === 'object') {
      for (const [key, value] of Object.entries(parsed.categoryActivity)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          categoryActivity[key as CategoryId] = value;
        }
      }
    }

    return {
      favorites: asStringArray(parsed.favorites),
      recent: asStringArray(parsed.recent),
      categoryActivity,
      listened: asStringArray(parsed.listened),
      copied: asStringArray(parsed.copied),
      practice,
      completedScenarios: asStringArray(parsed.completedScenarios),
      bestQuiz,
      quizAttempts: typeof parsed.quizAttempts === 'number' ? parsed.quizAttempts : 0,
      activeDays: asStringArray(parsed.activeDays),
    };
  } catch {
    // Corrupt JSON: start clean rather than blocking the whole app.
    return { ...emptyProgress };
  }
}

export function loadProgress(): ProgressState {
  if (!storageAvailable) return { ...emptyProgress };
  return hydrateProgress(window.localStorage.getItem(STORAGE_KEY));
}

export function saveProgress(progress: ProgressState): void {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota or security error: progress simply stays in memory for this session.
  }
}

/** Record that the learner did something today (drives the streak display). */
function touchDay(progress: ProgressState): ProgressState {
  const today = todayIso();
  if (progress.activeDays.includes(today)) return progress;
  return { ...progress, activeDays: [...progress.activeDays, today].slice(-120) };
}

export function toggleFavoriteIn(progress: ProgressState, phraseId: string): ProgressState {
  const favorites = progress.favorites.includes(phraseId)
    ? progress.favorites.filter((id) => id !== phraseId)
    : [phraseId, ...progress.favorites];
  return touchDay({ ...progress, favorites });
}

export function markViewedIn(
  progress: ProgressState,
  phraseId: string,
  category: CategoryId,
): ProgressState {
  const recent = [phraseId, ...progress.recent.filter((id) => id !== phraseId)].slice(0, MAX_RECENT);
  const categoryActivity = {
    ...progress.categoryActivity,
    [category]: (progress.categoryActivity[category] ?? 0) + 1,
  };
  return touchDay({ ...progress, recent, categoryActivity });
}

export function markListenedIn(progress: ProgressState, phraseId: string): ProgressState {
  if (progress.listened.includes(phraseId)) return progress;
  return touchDay({ ...progress, listened: [phraseId, ...progress.listened] });
}

export function markCopiedIn(progress: ProgressState, phraseId: string): ProgressState {
  if (progress.copied.includes(phraseId)) return progress;
  return touchDay({ ...progress, copied: [phraseId, ...progress.copied] });
}

export function recordPracticeIn(progress: ProgressState, attempt: PracticeAttempt): ProgressState {
  const previous = progress.practice[attempt.phraseId];
  // Keep the better attempt: a summary that shows a regression the learner has
  // already fixed is discouraging and less truthful about their level.
  const best = !previous || attempt.similarity > previous.similarity ? attempt : previous;
  return touchDay({ ...progress, practice: { ...progress.practice, [attempt.phraseId]: best } });
}

export function completeScenarioIn(progress: ProgressState, scenarioId: string): ProgressState {
  if (progress.completedScenarios.includes(scenarioId)) return progress;
  return touchDay({ ...progress, completedScenarios: [...progress.completedScenarios, scenarioId] });
}

/**
 * Best score is what is remembered; every attempt is counted. A worse repeat
 * therefore cannot erase progress, and "attempts" stays honest.
 */
export function recordQuizIn(progress: ProgressState, result: Omit<QuizResult, 'at'>): ProgressState {
  const at = new Date().toISOString();
  const candidate: QuizResult = { ...result, at };
  const previous = progress.bestQuiz;
  const bestQuiz = !previous || candidate.score > previous.score ? candidate : previous;
  return touchDay({
    ...progress,
    bestQuiz,
    quizAttempts: progress.quizAttempts + 1,
  });
}

/** Shift a yyyy-mm-dd key by whole days, staying in the learner's timezone. */
function shiftDay(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return todayIso(date);
}

/**
 * Consecutive days of activity, counted back from today. 0 until the learner
 * really has done something — nothing here is pre-seeded.
 */
export function computeStreak(activeDays: string[], today = todayIso()): number {
  if (!activeDays.length) return 0;
  const set = new Set(activeDays);

  // A streak still counts if the most recent activity was yesterday.
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  if (!set.has(cursor)) return 0;

  let streak = 0;
  while (set.has(cursor) && streak <= 365) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/** Human summary of how many of the last 7 days had activity. */
export function activeDaysThisWeek(activeDays: string[], today = todayIso()): number {
  const set = new Set(activeDays);
  let count = 0;
  for (let i = 0; i < 7; i += 1) {
    if (set.has(shiftDay(today, -i))) count += 1;
  }
  return count;
}

export const progressStorageKey = STORAGE_KEY;
export { MAX_RECENT, DAY_MS };
