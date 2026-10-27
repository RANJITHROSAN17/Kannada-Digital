import { describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS, loadProgress, markActive, read, saveProgress, write } from './storage';

describe('read/write', () => {
  it('round-trips JSON values', () => {
    write('demo', { a: 1, b: ['x'] });
    expect(read('demo', null)).toEqual({ a: 1, b: ['x'] });
  });
  it('returns the fallback for missing keys', () => {
    expect(read('missing', 42)).toBe(42);
  });
  it('returns the fallback for corrupt JSON', () => {
    window.localStorage.setItem('kannada-saathi:broken', '{not json');
    expect(read('broken', 'fallback')).toBe('fallback');
  });
});

describe('progress', () => {
  it('starts empty', () => {
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });
  it('persists and reloads progress', () => {
    saveProgress({ ...EMPTY_PROGRESS, favourites: ['basics-1'], bestQuiz: 80 });
    expect(loadProgress().favourites).toEqual(['basics-1']);
    expect(loadProgress().bestQuiz).toBe(80);
  });
  it('merges missing fields with defaults', () => {
    window.localStorage.setItem('kannada-saathi:progress', JSON.stringify({ streak: 3 }));
    expect(loadProgress().streak).toBe(3);
    expect(loadProgress().favourites).toEqual([]);
  });
});

describe('markActive()', () => {
  const today = '2026-10-27';
  const yesterday = '2026-10-26';
  it('starts a streak on first visit', () => {
    expect(markActive(EMPTY_PROGRESS, today).streak).toBe(1);
  });
  it('does not double-count the same day', () => {
    const progress = { ...EMPTY_PROGRESS, lastActive: today, streak: 4 };
    expect(markActive(progress, today).streak).toBe(4);
  });
  it('increments consecutive days', () => {
    const progress = { ...EMPTY_PROGRESS, lastActive: new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10), streak: 2 };
    expect(markActive(progress, today).streak).toBe(3);
  });
  it('resets after a gap', () => {
    const progress = { ...EMPTY_PROGRESS, lastActive: '2026-01-01', streak: 9 };
    expect(markActive(progress, today).streak).toBe(1);
  });
  it('accepts an explicit yesterday value', () => {
    expect(yesterday).toBe('2026-10-26');
  });
});
