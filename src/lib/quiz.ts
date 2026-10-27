import { PHRASES } from '../data/phrases';
import type { MatchPair, QuizQuestion } from '../types';

/** Small deterministic PRNG so quiz builds are testable. */
export function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Build a multiple-choice round: Kannada prompt, four English options. */
export function buildQuestions(count = 6, seed = Date.now()): QuizQuestion[] {
  const random = rng(seed);
  const pool = shuffle(PHRASES, random).slice(0, Math.min(count, PHRASES.length));
  const allMeanings = PHRASES.map((phrase) => phrase.en);

  return pool.map((phrase, index) => {
    const distractors = shuffle(
      allMeanings.filter((meaning) => meaning !== phrase.en),
      random,
    ).slice(0, 3);
    return {
      id: `q-${seed}-${index}`,
      phraseId: phrase.id,
      kn: phrase.kn,
      rom: phrase.rom,
      correct: phrase.en,
      options: shuffle([phrase.en, ...distractors], random),
    };
  });
}

export function buildMatchPairs(count = 5, seed = Date.now() + 1): MatchPair[] {
  const random = rng(seed);
  return shuffle(PHRASES, random)
    .slice(0, Math.min(count, PHRASES.length))
    .map((phrase) => ({ phraseId: phrase.id, kn: phrase.kn, en: phrase.en }));
}

export function percentage(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
