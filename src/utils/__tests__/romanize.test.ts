import { describe, expect, it } from 'vitest';
import { romanizeKannada } from '../romanize';

/**
 * Reader-friendly romanisation (no IAST diacritics), matching the phrasebook
 * style. Long vowels and retroflexes collapse because the goal is "the sounds
 * a beginner can read out loud", not academic transcription.
 */
describe('romanizeKannada', () => {
  it('adds the inherent vowel to consonants (ನ → na)', () => {
    expect(romanizeKannada('ನಮಸ್ಕಾರ')).toBe('namaskara');
  });

  it('handles vowel signs (ಸ್ಕಾರ → skara)', () => {
    expect(romanizeKannada('ಸ್ಕಾರ')).toBe('skara');
    expect(romanizeKannada('ಮಣ್ಣು')).toBe('mannu');
  });

  it('kills the inherent vowel on a trailing virama (ಬಸ್ → bas)', () => {
    expect(romanizeKannada('ಬಸ್')).toBe('bas');
  });

  it('handles conjuncts (ಜ್ಞ, ಕ್ಷ, ಪ್ಪ)', () => {
    expect(romanizeKannada('ಜ್ಞಾನ')).toBe('jnyana');
    expect(romanizeKannada('ಕ್ಷೇತ್ರ')).toBe('kshetra');
    expect(romanizeKannada('ಅಪ್ಪ')).toBe('appa');
  });

  it('assimilates the anusvara before a consonant (ಂ → ng / n / m)', () => {
    expect(romanizeKannada('ಸಂಗೀತ')).toBe('sanggita');
    expect(romanizeKannada('ಒಂದು')).toBe('ondu');
  });

  it('handles full sentences', () => {
    expect(romanizeKannada('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?')).toBe('bas nildana ellide?');
    expect(romanizeKannada('ಎಲ್ಲಿದೆ')).toBe('ellide');
    expect(romanizeKannada('ನಾನು ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರವಿದೆ')).toMatch(/^nanu eradu/);
    expect(romanizeKannada('ನಾನು ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರವಿದೆ')).toMatch(/jvaravide$/);
  });

  it('passes non-Kannada characters through unchanged', () => {
    expect(romanizeKannada('Wi-Fi ಪಾಸ್‌ವರ್ಡ್')).toContain('Wi-Fi');
  });

  it('handles empty input', () => {
    expect(romanizeKannada('')).toBe('');
  });
});
