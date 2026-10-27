/** Text helpers shared by search, practice scoring and the offline assistant. */

/** Lowercase, strip punctuation/combining marks, collapse spaces. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f\u200b-\u200d\u2028\u2029]/g, '')
    .replace(/[.,!?;:"'`\u2018\u2019\u201c\u201c()\[\]_~*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A Kannada string can encode the same sound with different combining
 * sequences. Comparing the normalized forms keeps search reliable on
 * transliteration-tolerant input ("nildana" vs "nildAnA").
 */
export function normalizeKannada(value: string): string {
  return normalizeText(value).replace(/[^0-9a-z\u0c80-\u0cff ]/g, '');
}

/** Tokens a query is split into; single-letter noise is dropped. */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);
}

/** Levenshtein distance, used for "did you mean" and pronunciation practice. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous = current.slice();
  }
  return previous[b.length];
}

/**
 * 0-100 similarity between what a learner said and the target phrase.
 *
 * This is a *string* comparison, not an acoustic pronunciation score, and the
 * UI says so. It is deliberately generous about word order because speech
 * recognition frequently splits a Kannada sentence differently to how it is
 * written.
 */
export function similarityScore(target: string, said: string): number {
  const t = normalizeKannada(target);
  const s = normalizeKannada(said);
  if (!t) return 0;
  if (!s) return 0;
  if (t === s) return 100;

  const distance = editDistance(t, s);
  const raw = Math.round(((t.length - distance) / t.length) * 100);

  // Reward shared words: "bus nildana ellide" vs "bus station ellide" should
  // not collapse to a low score even though the characters differ.
  const targetTokens = new Set(tokenize(target));
  const saidTokens = new Set(tokenize(said));
  let shared = 0;
  targetTokens.forEach((token) => {
    if (saidTokens.has(token)) shared += 1;
  });
  const tokenScore = targetTokens.size ? (shared / targetTokens.size) * 100 : 0;

  return Math.max(0, Math.min(100, Math.round(Math.max(raw, tokenScore * 0.9 + raw * 0.1))));
}

/** Split `text` into matched/unmatched chunks so the UI can highlight hits. */
export function highlightChunks(text: string, query: string): { text: string; matched: boolean }[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [{ text, matched: false }];

  const escaped = tokens
    .sort((a, b) => b.length - a.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!escaped.length) return [{ text, matched: false }];

  // `split` with a capture group returns the matched separators as their own
  // entries, so a chunk is "matched" exactly when it equals a query token.
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, matched: tokens.includes(normalizeText(part)) }));
}

/** True when the string contains at least one Kannada letter. */
export function hasKannadaScript(value: string): boolean {
  return /[\u0c85-\u0ce3]/.test(value);
}

/** Today as yyyy-mm-dd in the learner's own timezone (used for real streaks). */
export function todayIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
