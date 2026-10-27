import { describe, expect, it } from 'vitest';
import { buildMatchPairs, buildQuestions, percentage, rng, shuffle } from './quiz';
import { PHRASE_BY_ID } from '../data/phrases';

describe('rng()', () => {
  it('is deterministic for a given seed', () => {
    const a = rng(42); const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('stays within [0, 1)', () => {
    const random = rng(7);
    for (let i = 0; i < 50; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('shuffle()', () => {
  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4];
    shuffle(input, rng(1));
    expect(input).toEqual([1, 2, 3, 4]);
  });
  it('keeps all elements', () => {
    expect(shuffle([1, 2, 3, 4], rng(2)).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('buildQuestions()', () => {
  it('builds the requested number of questions', () => {
    expect(buildQuestions(6, 123)).toHaveLength(6);
  });
  it('always includes the correct meaning among four unique options', () => {
    buildQuestions(10, 999).forEach((question) => {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.correct);
    });
  });
  it('references real phrases', () => {
    buildQuestions(8, 555).forEach((question) => expect(PHRASE_BY_ID[question.phraseId]).toBeDefined());
  });
  it('is deterministic for the same seed', () => {
    expect(buildQuestions(5, 77)).toEqual(buildQuestions(5, 77));
  });
  it('produces different sets for different seeds', () => {
    expect(buildQuestions(5, 1)[0].phraseId).not.toBe(buildQuestions(5, 2)[0].phraseId);
  });
  it('uses unique question ids', () => {
    const questions = buildQuestions(6, 31);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
  });
});

describe('buildMatchPairs()', () => {
  it('builds five unique pairs', () => {
    const pairs = buildMatchPairs(5, 12);
    expect(pairs).toHaveLength(5);
    expect(new Set(pairs.map((pair) => pair.phraseId)).size).toBe(5);
  });
  it('never reuses the same meaning twice', () => {
    const pairs = buildMatchPairs(5, 88);
    expect(new Set(pairs.map((pair) => pair.en)).size).toBe(pairs.length);
  });
});

describe('percentage()', () => {
  it.each([[0, 0, 0], [3, 4, 75], [1, 3, 33], [5, 5, 100]])(
    'scores %i/%i as %i', (correct, total, expected) => {
      expect(percentage(correct, total)).toBe(expected);
    },
  );
});
