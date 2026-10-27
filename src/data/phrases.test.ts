import { describe, expect, it } from 'vitest';
import { NUMBERS, PHRASES, PHRASE_BY_ID, SITUATIONS, SITUATION_BY_ID, phrasesForSituation } from './phrases';
import { SCENES } from './scenes';

const KANNADA = /[\u0C80-\u0CFF]/;

describe('phrase dataset integrity', () => {
  it('has unique phrase ids', () => {
    const ids = PHRASES.map((phrase) => phrase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('indexes every phrase by id', () => {
    expect(Object.keys(PHRASE_BY_ID)).toHaveLength(PHRASES.length);
    PHRASES.forEach((phrase) => expect(PHRASE_BY_ID[phrase.id]).toBe(phrase));
  });

  it('references a real situation from every phrase', () => {
    PHRASES.forEach((phrase) => expect(SITUATION_BY_ID[phrase.situationId]).toBeDefined());
  });

  it('keeps every required field non-empty', () => {
    PHRASES.forEach((phrase) => {
      expect(phrase.kn.trim()).not.toBe('');
      expect(phrase.rom.trim()).not.toBe('');
      expect(phrase.en.trim()).not.toBe('');
      expect(phrase.when.trim()).not.toBe('');
      expect(phrase.tags.length).toBeGreaterThan(0);
    });
  });

  it('uses Kannada script for every phrase', () => {
    PHRASES.forEach((phrase) => expect(phrase.kn).toMatch(KANNADA));
  });

  it('uses readable ASCII transliteration', () => {
    PHRASES.forEach((phrase) => expect(phrase.rom).toMatch(/^[\x20-\x7E]+$/));
  });

  it('uses unique Kannada strings across the whole dataset', () => {
    // Duplicate prompts would make quiz answers ambiguous.
    const scripts = PHRASES.map((phrase) => phrase.kn);
    expect(new Set(scripts).size).toBe(scripts.length);
  });

  it('uses unique English meanings across the whole dataset', () => {
    const meanings = PHRASES.map((phrase) => phrase.en);
    expect(new Set(meanings).size).toBe(meanings.length);
  });

  it('has no duplicate English meanings inside a situation', () => {
    SITUATIONS.forEach((situation) => {
      const meanings = phrasesForSituation(situation.id).map((phrase) => phrase.en);
      expect(new Set(meanings).size).toBe(meanings.length);
    });
  });

  it('gives every situation at least six phrases', () => {
    SITUATIONS.forEach((situation) => expect(phrasesForSituation(situation.id).length).toBeGreaterThanOrEqual(6));
  });

  it('has unique situation ids and titles', () => {
    expect(new Set(SITUATIONS.map((situation) => situation.id)).size).toBe(SITUATIONS.length);
    expect(new Set(SITUATIONS.map((situation) => situation.title)).size).toBe(SITUATIONS.length);
  });

  it('ships ten Kannada numerals', () => {
    expect(NUMBERS).toHaveLength(10);
    NUMBERS.forEach((number) => expect(number.kn).toMatch(KANNADA));
  });
});

describe('role-play scenes', () => {
  it('has unique scene ids', () => {
    expect(new Set(SCENES.map((scene) => scene.id)).size).toBe(SCENES.length);
  });

  it('points every reply option at a real phrase', () => {
    SCENES.forEach((scene) => scene.turns.forEach((turn) => turn.options.forEach((option) => {
      expect(PHRASE_BY_ID[option.phraseId], `${scene.id}: ${option.phraseId}`).toBeDefined();
    })));
  });

  it('offers exactly one recommended reply per turn', () => {
    SCENES.forEach((scene) => scene.turns.forEach((turn) => {
      expect(turn.options.filter((option) => option.good)).toHaveLength(1);
      expect(turn.options.length).toBeGreaterThanOrEqual(2);
    }));
  });

  it('gives each option different feedback text', () => {
    SCENES.forEach((scene) => scene.turns.forEach((turn) => {
      expect(new Set(turn.options.map((option) => option.feedback)).size).toBe(turn.options.length);
    }));
  });
});
