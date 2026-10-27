import { describe, expect, it } from 'vitest';
import { answerInEnglish, searchPhrases, terms } from './search';

describe('terms()', () => {
  it('drops stop words and punctuation', () => {
    expect(terms('How much does THIS cost?')).toEqual(['much', 'this', 'cost']);
  });
  it('returns an empty list for stop-word-only input', () => {
    expect(terms('how do i')).toEqual([]);
  });
});

describe.each([
  ['how much does this cost?', 'market-1'],
  ['I have a fever', 'health-1'],
  ['Do you take UPI?', 'market-8'],
  ['please speak slowly', 'basics-8'],
  ['I am lost', 'directions-6'],
  ['help! call the police', 'emergency-2'],
  ['less spicy please', 'food-3'],
  ['which bus goes to mysuru', 'transport-2'],
])('searchPhrases(%s)', (query, expectedId) => {
  it(`ranks ${expectedId} first`, () => {
    expect(searchPhrases(query)[0]?.id).toBe(expectedId);
  });
});

describe('searchPhrases()', () => {
  it('returns nothing for an empty query', () => {
    expect(searchPhrases('')).toEqual([]);
    expect(searchPhrases('   ')).toEqual([]);
  });
  it('respects the limit', () => {
    expect(searchPhrases('bus ticket price', 3)).toHaveLength(3);
  });
  it('finds phrases by Kannada script', () => {
    expect(searchPhrases('ಎಷ್ಟು').length).toBeGreaterThan(0);
  });
  it('never returns duplicates', () => {
    const results = searchPhrases('price cost how much', 12).map((phrase) => phrase.id);
    expect(new Set(results).size).toBe(results.length);
  });
  it('returns nothing for gibberish', () => {
    expect(searchPhrases('zzzqqqxxvv')).toEqual([]);
  });
});

describe('answerInEnglish()', () => {
  it('returns a phrase, an intent hint and alternatives', () => {
    const answer = answerInEnglish('How much is this?');
    expect(answer).not.toBeNull();
    expect(answer?.phrase.id).toBe('market-1');
    expect(answer?.hint).toBe('asking about price');
    expect(answer?.alternatives.length).toBeGreaterThan(0);
  });
  it('uses a generic hint for unknown intents', () => {
    expect(answerInEnglish('ticket')?.hint).toBe('travelling by bus or train');
  });
  it('returns null when nothing matches', () => {
    expect(answerInEnglish('zzzqqqxxvv')).toBeNull();
  });
});
