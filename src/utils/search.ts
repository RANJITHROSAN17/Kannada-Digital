import type { CategoryId, Phrase } from '../types';
import { normalizeKannada, normalizeText, tokenize } from './text';

/**
 * Ranking rules for the phrasebook search and the offline assistant.
 *
 * A field weight of 0 means the field cannot match on its own. Exact-ish
 * matches on the English meaning outrank loose transliteration hits, because
 * a learner searching "how much" wants the price question first.
 */
const WEIGHTS = {
  englishExact: 12,
  englishPhrase: 8,
  englishWord: 5,
  keyword: 4,
  kannada: 6,
  translitExact: 6,
  translitWord: 3,
  usage: 1,
} as const;

export interface ScoredPhrase {
  phrase: Phrase;
  score: number;
  /** Which field produced the strongest hit — shown as a chip in the UI. */
  matchedOn: 'meaning' | 'kannada' | 'transliteration' | 'keyword' | 'usage';
}

export interface SearchOptions {
  category?: CategoryId | 'all';
  onlyFavorites?: boolean;
  favorites?: string[];
  limit?: number;
}

export function scorePhrase(phrase: Phrase, query: string): ScoredPhrase | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return { phrase, score: 0, matchedOn: 'meaning' };

  const haystack = {
    english: normalizeText(phrase.english),
    kannada: normalizeKannada(phrase.kannada),
    translit: normalizeText(phrase.transliteration),
    keywords: phrase.keywords.map((keyword) => normalizeText(keyword)),
    usage: normalizeText(phrase.usage),
  };

  const queryWords = tokenize(query);
  let score = 0;
  let matchedOn: ScoredPhrase['matchedOn'] = 'meaning';
  const bump = (value: number, field: ScoredPhrase['matchedOn']) => {
    if (value > 0 && score < value) matchedOn = field;
    score += value;
  };

  // Whole-phrase match on the English meaning is the strongest possible hit.
  if (haystack.english === normalizedQuery) bump(WEIGHTS.englishExact, 'meaning');
  else if (haystack.english.includes(normalizedQuery)) bump(WEIGHTS.englishPhrase, 'meaning');

  // Kannada script query: allow matching without the vowel-sign subtleties.
  if (haystack.kannada && normalizedQuery.length > 1 && haystack.kannada.includes(normalizeKannada(query))) {
    bump(WEIGHTS.kannada, 'kannada');
  }

  if (haystack.translit === normalizedQuery) bump(WEIGHTS.translitExact, 'transliteration');

  for (const word of queryWords) {
    if (word.length < 2) continue;
    if (haystack.english.split(' ').includes(word)) bump(WEIGHTS.englishWord, 'meaning');
    else if (haystack.english.includes(word)) bump(2, 'meaning');

    if (haystack.translit.split(' ').includes(word)) bump(WEIGHTS.translitWord, 'transliteration');
    else if (haystack.translit.includes(word)) bump(1, 'transliteration');

    if (haystack.keywords.some((keyword) => keyword === word)) bump(WEIGHTS.keyword, 'keyword');
    else if (haystack.keywords.some((keyword) => keyword.includes(word))) bump(2, 'keyword');

    if (haystack.usage.includes(word)) bump(WEIGHTS.usage, 'usage');
  }

  if (score <= 0) return null;
  return { phrase, score, matchedOn };
}

/** Search the real dataset. Empty query returns everything in dataset order. */
export function searchPhrases(
  query: string,
  dataset: Phrase[],
  options: SearchOptions = {},
): ScoredPhrase[] {
  const { category = 'all', onlyFavorites = false, favorites = [], limit } = options;

  let pool = dataset;
  if (category !== 'all') pool = pool.filter((phrase) => phrase.category === category);
  if (onlyFavorites) pool = pool.filter((phrase) => favorites.includes(phrase.id));

  const trimmed = query.trim();
  const scored = trimmed
    ? pool
        .map((phrase) => scorePhrase(phrase, trimmed))
        .filter((entry): entry is ScoredPhrase => entry !== null && entry.score > 0)
        .sort((a, b) => b.score - a.score || a.phrase.id.localeCompare(b.phrase.id))
    : pool.map((phrase) => ({ phrase, score: 0, matchedOn: 'meaning' as const }));

  return typeof limit === 'number' ? scored.slice(0, limit) : scored;
}

/**
 * "What do I say when …?" — used by the offline assistant. It treats the whole
 * sentence as a bag of concepts rather than looking for a literal translation,
 * which is what makes it work without any API.
 */
export function suggestPhrases(question: string, dataset: Phrase[], limit = 4): ScoredPhrase[] {
  const results = searchPhrases(question, dataset, { limit: 40 });
  const seen = new Set<string>();
  const out: ScoredPhrase[] = [];

  for (const result of results) {
    if (seen.has(result.phrase.id)) continue;
    seen.add(result.phrase.id);
    out.push(result);
    if (out.length >= limit) break;
  }
  return out;
}
