import { beforeEach, describe, expect, it } from 'vitest';
import {
  activeDaysThisWeek,
  completeScenarioIn,
  computeStreak,
  emptyProgress,
  hydrateProgress,
  loadProgress,
  markViewedIn,
  recordPracticeIn,
  recordQuizIn,
  saveProgress,
  toggleFavoriteIn,
  progressStorageKey,
} from '../storage';
import { todayIso } from '../../utils/text';

describe('hydrateProgress', () => {
  it('falls back to a clean state for missing or corrupt payloads', () => {
    expect(hydrateProgress(null)).toEqual(emptyProgress);
    expect(hydrateProgress('not json {')).toEqual(emptyProgress);
    expect(hydrateProgress('{"favorites": "oops"}').favorites).toEqual([]);
  });

  it('keeps valid fields and drops malformed ones', () => {
    const state = hydrateProgress(
      JSON.stringify({
        favorites: ['food-01', 42, null],
        recent: ['health-02'],
        practice: { 'food-01': { similarity: 77, said: 'bill kodi', method: 'typed', at: 'now', phraseId: 'food-01', targetKannada: 'ಬಿಲ್ ಕೊಡಿ.' }, bad: { nope: true } },
        quizAttempts: 3,
      }),
    );
    expect(state.favorites).toEqual(['food-01']);
    expect(state.recent).toEqual(['health-02']);
    expect(Object.keys(state.practice)).toEqual(['food-01']);
    expect(state.quizAttempts).toBe(3);
    expect(state.bestQuiz).toBeNull();
  });
});

describe('progress mutations', () => {
  beforeEach(() => window.localStorage.clear());

  it('toggles favourites on and off without duplicating', () => {
    let state = toggleFavoriteIn(emptyProgress, 'food-01');
    expect(state.favorites).toContain('food-01');
    state = toggleFavoriteIn(state, 'food-01');
    expect(state.favorites).not.toContain('food-01');
  });

  it('records a real interaction and caps the recent list at 12', () => {
    let state = emptyProgress;
    for (let i = 0; i < 20; i += 1) {
      state = markViewedIn(state, `phrase-${i}`, 'food');
    }
    expect(state.recent).toHaveLength(12);
    expect(state.recent[0]).toBe('phrase-19');
    expect(state.categoryActivity.food).toBe(20);
  });

  it('keeps the better practice attempt for a phrase', () => {
    let state = recordPracticeIn(emptyProgress, {
      phraseId: 'transport-01',
      targetKannada: 'ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
      said: 'bus station where',
      similarity: 41,
      method: 'typed',
      at: '2026-10-24T10:00:00.000Z',
    });
    state = recordPracticeIn(state, {
      phraseId: 'transport-01',
      targetKannada: 'ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
      said: 'dayavittu bus nildana ellide',
      similarity: 96,
      method: 'speech-recognition',
      at: '2026-10-24T10:05:00.000Z',
    });
    // A worse third try must not overwrite the best.
    state = recordPracticeIn(state, {
      phraseId: 'transport-01',
      targetKannada: 'ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
      said: 'nildana',
      similarity: 12,
      method: 'typed',
      at: '2026-10-24T10:06:00.000Z',
    });
    expect(state.practice['transport-01'].similarity).toBe(96);
    expect(state.practice['transport-01'].method).toBe('speech-recognition');
  });

  it('remembers the best quiz score while counting every attempt', () => {
    let state = recordQuizIn(emptyProgress, { score: 8, total: 10, durationMs: 4000, missed: [] });
    expect(state.bestQuiz?.score).toBe(8);
    state = recordQuizIn(state, { score: 3, total: 10, durationMs: 2000, missed: ['a'] });
    expect(state.bestQuiz?.score).toBe(8);
    expect(state.quizAttempts).toBe(2);
    state = recordQuizIn(state, { score: 10, total: 10, durationMs: 9000, missed: [] });
    expect(state.bestQuiz?.score).toBe(10);
    expect(state.quizAttempts).toBe(3);
  });

  it('marks a scenario complete only once', () => {
    let state = completeScenarioIn(emptyProgress, 'bus-conductor');
    state = completeScenarioIn(state, 'bus-conductor');
    expect(state.completedScenarios).toEqual(['bus-conductor']);
  });

  it('survives a save/load round trip (this is what a refresh exercises)', () => {
    const state = toggleFavoriteIn(markViewedIn(emptyProgress, 'food-01', 'food'), 'food-01');
    saveProgress(state);
    const loaded = loadProgress();
    expect(loaded.favorites).toEqual(['food-01']);
    expect(loaded.recent).toEqual(['food-01']);
    expect(loaded.activeDays).toContain(todayIso());
    expect(window.localStorage.getItem(progressStorageKey)).toContain('favorites');
  });
});

describe('streak helpers', () => {
  it('is zero when nothing has been recorded', () => {
    expect(computeStreak([])).toBe(0);
    expect(activeDaysThisWeek([])).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const days = ['2026-10-24', '2026-10-23', '2026-10-22', '2026-10-19'];
    expect(computeStreak(days, '2026-10-24')).toBe(3);
  });

  it('stays alive the morning after a session', () => {
    expect(computeStreak(['2026-10-23'], '2026-10-24')).toBe(1);
  });

  it('breaks on a gap', () => {
    expect(computeStreak(['2026-10-24', '2026-10-22'], '2026-10-24')).toBe(1);
  });
});
