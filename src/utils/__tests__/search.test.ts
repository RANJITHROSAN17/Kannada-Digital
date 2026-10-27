import { describe, expect, it } from 'vitest';
import { phrases } from '../../data/phrases';
import { scorePhrase, searchPhrases, suggestPhrases } from '../search';

describe('searchPhrases', () => {
  it('returns the whole dataset for an empty query', () => {
    expect(searchPhrases('', phrases)).toHaveLength(phrases.length);
    expect(searchPhrases('   ', phrases)).toHaveLength(phrases.length);
  });

  it('finds the price question from an English keyword', () => {
    const results = searchPhrases('how much', phrases);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((hit) => hit.phrase.english.toLowerCase().includes('how much'))).toBe(true);
  });

  it('matches Kannada script input, not just Latin text', () => {
    const results = searchPhrases('ಎಷ್ಟು', phrases);
    expect(results.length).toBeGreaterThan(3);
    expect(results.every((hit) => hit.phrase.kannada.includes('ಎಷ್ಟು') || hit.score > 0)).toBe(true);
  });

  it('matches on transliteration', () => {
    const results = searchPhrases('nildana', phrases);
    expect(results.some((hit) => hit.phrase.transliteration.toLowerCase().includes('nildana'))).toBe(true);
  });

  it('ranks an exact meaning match above loose keyword noise', () => {
    const results = searchPhrases('Where is the washroom?', phrases);
    expect(results[0].phrase.english).toMatch(/washroom/i);
  });

  it('filters by category', () => {
    const results = searchPhrases('water', phrases, { category: 'food' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((hit) => hit.phrase.category === 'food')).toBe(true);
  });

  it('filters by favourites', () => {
    const target = phrases[0];
    const results = searchPhrases('', phrases, { onlyFavorites: true, favorites: [target.id] });
    expect(results.map((hit) => hit.phrase.id)).toEqual([target.id]);
  });

  it('returns nothing for a query that is genuinely absent', () => {
    expect(searchPhrases('xylophone-quantum', phrases)).toHaveLength(0);
  });

  it('reports which field matched', () => {
    const hit = searchPhrases('dhanyavadagalu', phrases)[0];
    expect(['transliteration', 'meaning', 'keyword']).toContain(hit.matchedOn);
  });
});

describe('scorePhrase', () => {
  it('gives a neutral result for an empty query instead of scoring zero matches', () => {
    const scored = scorePhrase(phrases[0], '');
    expect(scored).not.toBeNull();
    expect(scored?.score).toBe(0);
  });

  it('returns null when nothing matches', () => {
    expect(scorePhrase(phrases[0], 'zzz-nothing')).toBeNull();
  });
});

describe('suggestPhrases (offline assistant ranking)', () => {
  it('resolves an English situation to usable Kannada lines', () => {
    const hits = suggestPhrases('I need to know the price of tomatoes', phrases, 4);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(4);
    expect(hits[0].phrase.kannada).toMatch(/[\u0c80-\u0cff]/);
  });

  it('surfaces medical vocabulary for a symptom question', () => {
    const hits = suggestPhrases('I have had a fever for two days', phrases, 3);
    expect(hits.map((hit) => hit.phrase.id)).toContain('health-02');
  });

  it('never repeats a phrase id', () => {
    const hits = suggestPhrases('bus stop ticket', phrases, 5);
    const ids = hits.map((hit) => hit.phrase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is empty for gibberish so the UI can show its fallback', () => {
    expect(suggestPhrases('qqqq wwww', phrases, 4)).toHaveLength(0);
  });
});
