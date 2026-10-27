/** Tiny typed localStorage wrapper. Safe in SSR/jsdom and private mode. */

const PREFIX = 'kannada-saathi:';

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Storage can be disabled; the app still works in memory for this session. */
  }
}

export interface Progress {
  favourites: string[];
  learned: string[];
  quizAttempts: number;
  bestQuiz: number;
  voiceBest: Record<string, number>;
  lastActive: string;
  streak: number;
}

export const EMPTY_PROGRESS: Progress = {
  favourites: [],
  learned: [],
  quizAttempts: 0,
  bestQuiz: 0,
  voiceBest: {},
  lastActive: '',
  streak: 0,
};

export function loadProgress(): Progress {
  const stored = read<Partial<Progress>>('progress', {});
  return { ...EMPTY_PROGRESS, ...stored };
}

export function saveProgress(progress: Progress): void {
  write('progress', progress);
}

/** Bump a once-per-day streak. Returns the updated progress. */
export function markActive(progress: Progress, today = new Date().toISOString().slice(0, 10)): Progress {
  if (progress.lastActive === today) return progress;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = progress.lastActive === yesterday ? progress.streak + 1 : 1;
  return { ...progress, lastActive: today, streak };
}
