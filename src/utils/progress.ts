import type { CategoryId, ProgressState } from '../types';
import { phrases } from '../data/phrases';
import { categories } from '../data/categories';
import { computeStreak, activeDaysThisWeek } from '../services/storage';

export interface CategoryProgress {
  id: CategoryId;
  title: string;
  available: number;
  touched: number;
  /** 0-100, how much of this situation the learner has opened. */
  percent: number;
}

export interface ProgressSummary {
  phrasesViewed: number;
  phrasesListened: number;
  phrasesCopied: number;
  favoritesCount: number;
  practicedCount: number;
  /** Mean similarity across practiced phrases, or null when unpracticed. */
  practiceAverage: number | null;
  scenariosCompleted: number;
  scenariosTotal: number;
  quizBest: { score: number; total: number; at: string } | null;
  quizAttempts: number;
  streakDays: number;
  activeDaysThisWeek: number;
  /** 0-100 across the whole app, driven only by real interactions. */
  overallPercent: number;
  byCategory: CategoryProgress[];
}

/**
 * Derive every number the UI shows from stored activity. Nothing here is
 * seeded, rounded up or invented: a brand-new learner sees zeros.
 */
export function summarizeProgress(progress: ProgressState, scenariosTotal = 0): ProgressSummary {
  const viewedCategories = Object.keys(progress.categoryActivity) as CategoryId[];
  const phrasesViewed = new Set(progress.recent).size;

  const byCategory: CategoryProgress[] = categories.map((category) => {
    const available = phrases.filter((phrase) => phrase.category === category.id).length;
    const touched = viewedCategories.includes(category.id) ? (progress.categoryActivity[category.id] ?? 0) : 0;
    return {
      id: category.id,
      title: category.title,
      available,
      touched,
      percent: available ? Math.min(100, Math.round((Math.min(touched, available) / available) * 100)) : 0,
    };
  });

  const practiceValues = Object.values(progress.practice);
  const practiceAverage = practiceValues.length
    ? Math.round(practiceValues.reduce((sum, attempt) => sum + attempt.similarity, 0) / practiceValues.length)
    : null;

  const categoryCoverage = byCategory.reduce((sum, item) => sum + item.percent, 0) / (byCategory.length || 1);
  const practicePart = practiceAverage !== null ? Math.min(practiceAverage, 100) : 0;
  const quizPart = progress.bestQuiz
    ? Math.round((progress.bestQuiz.score / Math.max(progress.bestQuiz.total, 1)) * 100)
    : 0;
  const scenarioPart = scenariosTotal
    ? Math.round((progress.completedScenarios.length / scenariosTotal) * 100)
    : 0;

  const overallPercent = Math.round(
    Math.min(
      100,
      categoryCoverage * 0.3 + practicePart * 0.2 + quizPart * 0.3 + scenarioPart * 0.2,
    ),
  );

  return {
    phrasesViewed: Math.max(phrasesViewed, byCategory.reduce((sum, item) => sum + Math.min(item.touched, item.available), 0)),
    phrasesListened: progress.listened.length,
    phrasesCopied: progress.copied.length,
    favoritesCount: progress.favorites.length,
    practicedCount: practiceValues.length,
    practiceAverage,
    scenariosCompleted: progress.completedScenarios.length,
    scenariosTotal,
    quizBest: progress.bestQuiz
      ? { score: progress.bestQuiz.score, total: progress.bestQuiz.total, at: progress.bestQuiz.at }
      : null,
    quizAttempts: progress.quizAttempts,
    streakDays: computeStreak(progress.activeDays),
    activeDaysThisWeek: activeDaysThisWeek(progress.activeDays),
    overallPercent,
    byCategory,
  };
}

/** Deterministic daily phrase so a demo shows the same line all day. */
export function dailyPhrase(date = new Date()) {
  const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  const key = year * 372 + month * 31 + day;
  return phrases[key % phrases.length];
}
