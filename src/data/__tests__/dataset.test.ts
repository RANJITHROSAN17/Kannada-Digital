import { describe, expect, it } from 'vitest';
import { phrases, numbers } from '../phrases';
import { categories } from '../categories';
import { conversations } from '../conversations';
import { culturalNotes, regionalVariants } from '../culture';
import { buildMatchRound, createRng, curatedQuestions, generateQuiz } from '../quiz';
import type { CategoryId } from '../../types';

/**
 * Dataset integrity tests.
 *
 * A phrasebook app is only as good as its data, and the risk in an
 * AI-assisted build is silently wrong or mixed-script content. These tests run
 * against the real dataset that ships in the bundle.
 */

const KANNADA = /[\u0c80-\u0cff]/;
const OTHER_INDIC = /[\u0900-\u097f\u0980-\u09ff\u0b80-\u0bff\u0c00-\u0c7f\u0a80-\u0aff\u0d00-\u0d7f]/;
const CJK = /[\u3000-\u9fff\uf900-\ufaff]/;
const categoryIds = categories.map((category) => category.id);

describe('phrase dataset', () => {
  it('is a useful starter size and covers all eight situations', () => {
    expect(phrases.length).toBeGreaterThanOrEqual(80);
    for (const id of categoryIds) {
      const count = phrases.filter((phrase) => phrase.category === id).length;
      expect(count, `category ${id} needs at least 10 phrases`).toBeGreaterThanOrEqual(10);
    }
  });

  it('has unique ids and no empty content', () => {
    const ids = new Set<string>();
    for (const phrase of phrases) {
      expect(ids.has(phrase.id), `duplicate id ${phrase.id}`).toBe(false);
      ids.add(phrase.id);
      expect(phrase.english.trim().length).toBeGreaterThan(2);
      expect(phrase.transliteration.trim().length).toBeGreaterThan(1);
      expect(phrase.usage.trim().length).toBeGreaterThan(20);
    }
  });

  it('puts Kannada script in the Kannada field only', () => {
    for (const phrase of phrases) {
      expect(KANNADA.test(phrase.kannada), `kannada field missing script: ${phrase.id}`).toBe(true);
      expect(OTHER_INDIC.test(phrase.kannada), `wrong script mixed in ${phrase.id}`).toBe(false);
      expect(CJK.test(phrase.kannada), `non-Kannada glyph in ${phrase.id}`).toBe(false);
      expect(KANNADA.test(phrase.transliteration), `transliteration must stay latin: ${phrase.id}`).toBe(false);
      expect(KANNADA.test(phrase.english), `english meaning must not hold Kannada: ${phrase.id}`).toBe(false);
    }
  });

  it('uses only known categories, lowercase keywords and valid review flags', () => {
    for (const phrase of phrases) {
      expect(categoryIds).toContain(phrase.category);
      expect(phrase.keywords.length).toBeGreaterThanOrEqual(2);
      for (const keyword of phrase.keywords) {
        expect(keyword).toBe(keyword.toLowerCase());
        expect(keyword.trim().length).toBeGreaterThan(1);
      }
      expect(['verified-usage', 'needs-native-review']).toContain(phrase.review);
      expect(['neutral', 'polite', 'casual', 'formal']).toContain(phrase.politeness);
      expect(['beginner', 'intermediate']).toContain(phrase.difficulty);
    }
  });

  it('labels colloquial or regional lines for native review', () => {
    const flagged = phrases.filter((phrase) => phrase.review === 'needs-native-review');
    expect(flagged.length).toBeGreaterThan(0);
    expect(flagged.length).toBeLessThan(phrases.length / 4);
  });

  it('exposes every phrase to its own category lookup', () => {
    for (const category of categories) {
      const scoped = phrases.filter((phrase) => phrase.category === (category.id as CategoryId));
      expect(scoped.every((phrase) => phrase.category === category.id)).toBe(true);
    }
  });

  it('keeps the example from the brief present and correct', () => {
    const example = phrases.find((phrase) => phrase.english.toLowerCase().includes('where is the bus station'));
    expect(example).toBeDefined();
    expect(example?.kannada).toContain('ಬಸ್ ನಿಲ್ದಾಣ');
    expect(example?.transliteration).toMatch(/bus nildana/i);
  });

  it('provides twelve number references with Kannada words', () => {
    expect(numbers).toHaveLength(12);
    for (const item of numbers) {
      expect(KANNADA.test(item.kannadaWord)).toBe(true);
    }
  });
});

describe('conversation scenarios', () => {
  it('ships enough scenes for the feature to work with no API', () => {
    expect(conversations.length).toBeGreaterThanOrEqual(5);
  });

  it('has a connected graph: every option resolves to a real node or the end', () => {
    for (const scenario of conversations) {
      const nodeIds = new Set(scenario.nodes.map((node) => node.id));
      expect(nodeIds.has(scenario.start), `${scenario.id} starts at a missing node`).toBe(true);
      expect(scenario.takeaways.length).toBeGreaterThanOrEqual(2);

      for (const node of scenario.nodes) {
        expect(node.options.length, `${scenario.id}/${node.id} needs options`).toBeGreaterThan(0);
        for (const option of node.options) {
          expect(KANNADA.test(option.kannada)).toBe(true);
          expect(option.explanation.trim().length).toBeGreaterThan(20);
          expect(option.reply.kannada.trim().length).toBeGreaterThan(0);
          expect(option.next === 'end' || nodeIds.has(option.next), `${option.id} points nowhere`).toBe(true);
          if (option.next !== 'end') {
            const nextNode = scenario.nodes.find((item) => item.id === option.next);
            expect(nextNode, `${option.id} -> missing node ${option.next}`).toBeTruthy();
          }
          for (const alt of option.alternatives) {
            expect(KANNADA.test(alt.kannada)).toBe(true);
          }
        }
      }

      // The scene must actually be finishable: some option reaches "end".
      const reachesEnd = scenario.nodes.some((node) =>
        node.options.some((option) => option.next === 'end'),
      );
      expect(reachesEnd, `${scenario.id} has no path to the end`).toBe(true);
    }
  });

  it('references only real categories', () => {
    for (const scenario of conversations) {
      expect(categoryIds).toContain(scenario.category);
    }
  });
});

describe('quiz content', () => {
  it('has at least ten curated questions with a valid answer index', () => {
    expect(curatedQuestions.length).toBeGreaterThanOrEqual(10);
    for (const question of curatedQuestions) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(question.options.length);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
      if (question.sourcePhraseId) {
        expect(phrases.some((phrase) => phrase.id === question.sourcePhraseId)).toBe(true);
      }
    }
  });

  it('generates a solvable, de-duplicated round from the real dataset', () => {
    const rng = createRng(42);
    const quiz = generateQuiz(10, rng);
    expect(quiz).toHaveLength(10);

    const seenPhrases = new Set<string>();
    for (const question of quiz) {
      expect(question.options[question.answerIndex]).toBeTruthy();
      expect(new Set(question.options).size, `duplicate options in ${question.id}`).toBe(question.options.length);

      if (question.sourcePhraseId) {
        expect(seenPhrases.has(question.sourcePhraseId), `phrase reused: ${question.sourcePhraseId}`).toBe(false);
        seenPhrases.add(question.sourcePhraseId);
      }
      if (question.type === 'en-to-kn') {
        expect(KANNADA.test(question.options[question.answerIndex])).toBe(true);
      }
      if (question.type === 'kn-to-en') {
        expect(KANNADA.test(question.promptKannada ?? '')).toBe(true);
      }
    }
  });

  it('is deterministic for a fixed seed and different across seeds', () => {
    const a = generateQuiz(8, createRng(7)).map((question) => question.id);
    const b = generateQuiz(8, createRng(7)).map((question) => question.id);
    const c = generateQuiz(8, createRng(99)).map((question) => question.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('builds matching rounds only from phrases that exist', () => {
    const pairs = buildMatchRound(5, createRng(3));
    expect(pairs.length).toBe(5);
    for (const pair of pairs) {
      const phrase = phrases.find((item) => item.id === pair.id);
      expect(phrase?.kannada).toBe(pair.kannada);
      expect(phrase?.english).toBe(pair.english);
    }
  });
});

describe('cultural data', () => {
  it('classifies every note and flags cautions', () => {
    const kinds = new Set(['etiquette', 'speech', 'script', 'regional', 'culture']);
    for (const note of culturalNotes) {
      expect(kinds.has(note.kind)).toBe(true);
      expect(note.body.trim().length).toBeGreaterThan(60);
    }
    expect(culturalNotes.some((note) => note.kind === 'etiquette')).toBe(true);
  });

  it('never states a regional variant as certain', () => {
    for (const variant of regionalVariants) {
      expect(variant.review).toBe('needs-native-review');
      expect(variant.region.trim().length).toBeGreaterThan(10);
      expect(KANNADA.test(variant.standard)).toBe(true);
      expect(KANNADA.test(variant.variant)).toBe(true);
    }
  });
});
