import { describe, expect, it } from 'vitest';
import { capabilities, editDistance, normalise, similarity, speak } from './speech';

describe('normalise()', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalise('  Namaskara!  ')).toBe('namaskara');
  });
  it('removes diacritics and collapses whitespace', () => {
    expect(normalise('Namas\u0301kāra   bhāṣe')).toBe('namaskara bhase');
  });
  it('handles an empty string', () => {
    expect(normalise('')).toBe('');
  });
});

describe('editDistance()', () => {
  it('is zero for identical strings', () => { expect(editDistance('abc', 'abc')).toBe(0); });
  it('counts a single substitution', () => { expect(editDistance('abc', 'abd')).toBe(1); });
  it('counts insertions and deletions', () => { expect(editDistance('abc', 'ab')).toBe(1); });
  it('is symmetric', () => { expect(editDistance('kannada', 'kanada')).toBe(editDistance('kanada', 'kannada')); });
});

describe('similarity()', () => {
  it('scores an exact match as 100', () => { expect(similarity('Namaskara', 'namaskara')).toBe(100); });
  it('is case and punctuation tolerant', () => { expect(similarity('IDU ESHTU?', 'idu eshtu')).toBe(100); });
  it('forgives a small typo', () => { expect(similarity('namaskra', 'namaskara')).toBeGreaterThan(70); });
  it('scores unrelated phrases low', () => { expect(similarity('hello', 'ambulance beku')).toBeLessThan(40); });
  it('never returns a negative score', () => { expect(similarity('a', 'namaskara')).toBeGreaterThanOrEqual(0); });
  it('returns zero for empty input', () => { expect(similarity('', 'namaskara')).toBe(0); });
});

describe('browser speech fallbacks', () => {
  it('reports capabilities without throwing in jsdom', () => {
    const caps = capabilities();
    expect(typeof caps.synthesis).toBe('boolean');
    expect(typeof caps.recognition).toBe('boolean');
  });
  it('returns false when speech synthesis is unavailable', () => {
    expect(speak('ನಮಸ್ಕಾರ')).toBe(false);
  });
});
