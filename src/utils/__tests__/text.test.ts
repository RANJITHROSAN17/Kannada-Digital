import { describe, expect, it } from 'vitest';
import {
  editDistance,
  hasKannadaScript,
  highlightChunks,
  normalizeKannada,
  normalizeText,
  similarityScore,
  todayIso,
  tokenize,
} from '../text';

describe('normalizeText', () => {
  it('lowercases, strips punctuation and collapses whitespace', () => {
    expect(normalizeText('  Where  is the BUS STATION??  ')).toBe('where is the bus station');
  });

  it('removes combining marks so accented transliteration still matches', () => {
    expect(normalizeText('nildāṇa')).toBe('nildana');
  });

  it('drops zero-width joiners used in Kannada orthography', () => {
    expect(normalizeKannada('ಸ್ಟಾಕ್\u200cನಲ್ಲಿ')).toBe(normalizeKannada('ಸ್ಟಾಕ್ನಲ್ಲಿ'));
  });
});

describe('tokenize', () => {
  it('drops one-letter noise words', () => {
    expect(tokenize('a bus to Bengaluru')).toEqual(['bus', 'to', 'bengaluru']);
  });
});

describe('editDistance', () => {
  it('is zero for identical strings', () => {
    expect(editDistance('bus', 'bus')).toBe(0);
  });

  it('counts substitutions and insertions', () => {
    expect(editDistance('kitta', 'kittu')).toBe(1);
    expect(editDistance('', 'abc')).toBe(3);
  });
});

describe('similarityScore', () => {
  it('returns 100 for an exact target match', () => {
    const target = 'ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?';
    expect(similarityScore(target, target)).toBe(100);
  });

  it('returns 0 for empty input instead of a fake score', () => {
    expect(similarityScore('ನನಗೆ ನೀರು ಬೇಕು', '   ')).toBe(0);
  });

  it('is order-insensitive enough to reward shared words', () => {
    const target = 'dayavittu bus nildana ellide';
    const swapped = 'bus nildana dayavittu ellide';
    expect(similarityScore(target, swapped)).toBeGreaterThanOrEqual(90);
  });

  it('penalises an unrelated sentence', () => {
    expect(similarityScore('ನನಗೆ ನೀರು ಬೇಕು', 'ಬಿಲ್ ಕೊಡಿ')).toBeLessThan(40);
  });

  it('never exceeds 100 or drops below 0', () => {
    const score = similarityScore('ನಮಸ್ಕಾರ', 'ನಮಸ್ಕಾರ ಜಾಸ್ತಿ ಚೆನ್ನಾಗಿದೆ ಬಹಳ ಸಂತೋಷ ಆಯಿತು ನಮಸ್ಕಾರ');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('highlightChunks', () => {
  it('marks the chunks that match the query tokens', () => {
    const parts = highlightChunks('Where is the bus station, please?', 'bus station');
    expect(parts.filter((part) => part.matched).map((part) => part.text.trim())).toEqual(['bus', 'station']);
  });

  it('returns the whole string untouched for an empty query', () => {
    expect(highlightChunks('ನಮಸ್ಕಾರ', '  ')).toEqual([{ text: 'ನಮಸ್ಕಾರ', matched: false }]);
  });
});

describe('script + date helpers', () => {
  it('detects Kannada letters', () => {
    expect(hasKannadaScript('ಬಸ್ ನಿಲ್ದಾಣ')).toBe(true);
    expect(hasKannadaScript('bus nildana')).toBe(false);
  });

  it('formats a local yyyy-mm-dd key (no timezone drift)', () => {
    expect(todayIso(new Date(2026, 9, 24))).toBe('2026-10-24');
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
