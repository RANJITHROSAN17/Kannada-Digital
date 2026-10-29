/**
 * Kannada romanisation for text that is NOT in the bundled phrasebook.
 *
 * The phrasebook ships a human-reviewed transliteration per phrase, but live
 * translation (see `src/services/translation.ts`) can produce any sentence.
 * This module fills the same two jobs the reviewed transliteration serves:
 *
 *  1. a readable Latin rendering on screen, marked approximate (~) so nobody
 *     mistakes it for a reviewed dictionary entry;
 *  2. a `fallbackText` for browser speech synthesis when no Kannada voice is
 *     installed — feeding Kannada Unicode to an English voice produces
 *     silence, so the romanised string is spoken instead.
 *
 * Style: reader-friendly (no IAST diacritics), matching the phrasebook —
 * "ನಮಸ್ಕಾರ" → "Namaskara", "ಬಸ್ ನಿಲ್ದಾಣ" → "bas niladhana". Long vowels
 * and retroflexes are collapsed because the goal is "the sounds a beginner
 * can read out loud", not academic transcription.
 */

/** Standalone vowels + vowel signs + nasal marks → reader-friendly sounds. */
const VOWELS: Record<string, string> = {
  // Standalone vowels
  'ಅ': 'a', 'ಆ': 'a', 'ಇ': 'i', 'ಈ': 'i', 'ಉ': 'u', 'ಊ': 'u', 'ಋ': 'r', 'ಌ': 'l',
  'ಎ': 'e', 'ಏ': 'e', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'o', 'ಔ': 'au',
  // Vowel signs (attached to a consonant)
  'ಾ': 'a', 'ಿ': 'i', 'ೀ': 'i', 'ು': 'u', 'ೂ': 'u', 'ೃ': 'r',
  'ೆ': 'e', 'ೇ': 'e', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'o', 'ೌ': 'au',
  // Nasal / mark characters. The anusvara (ಂ) is handled with assimilation
  // below; only the candrabindu and visarga live here.
  'ಁ': '', 'ಃ': 'h',
};

/** Consonants with their inherent 'a' vowel baked in (e.g. ಕ → "ka"). */
const CONSONANTS: Record<string, string> = {
  'ಕ': 'ka', 'ಖ': 'kha', 'ಗ': 'ga', 'ಘ': 'gha', 'ಙ': 'nga',
  'ಚ': 'ca', 'ಛ': 'cha', 'ಜ': 'ja', 'ಝ': 'jha', 'ಞ': 'nya',
  'ಟ': 'ta', 'ಠ': 'tha', 'ಡ': 'da', 'ಢ': 'dha', 'ಣ': 'na',
  'ತ': 'ta', 'ಥ': 'tha', 'ದ': 'da', 'ಧ': 'dha', 'ನ': 'na',
  'ಪ': 'pa', 'ಫ': 'pha', 'ಬ': 'ba', 'ಭ': 'bha', 'ಮ': 'ma',
  'ಯ': 'ya', 'ರ': 'ra', 'ಲ': 'la', 'ಳ': 'la', 'ವ': 'va',
  'ಶ': 'sha', 'ಷ': 'sha', 'ಸ': 'sa', 'ಹ': 'ha',
};

const VIRAMA = '್';
const ANUSVARA = 'ಂ';

/**
 * Anusvara assimilation. ಂ is a nasal sound that changes to match the
 * consonant after it: ಸಂಗೀತ → "sangeeta", ಒಂದು → "ondu". At the end of a
 * word (or before a vowel) it reads as "m".
 */
function nasalFor(next: string | undefined): string {
  if (!next || !(next in CONSONANTS)) return 'm';
  if ('ಕಖಗಘಙ'.includes(next)) return 'ng';
  if ('ಚಛಜಝಞ'.includes(next)) return 'ny';
  if ('ಪಫಬಭಮ'.includes(next)) return 'm';
  return 'n';
}

/**
 * Romanise Kannada text. Non-Kannada characters pass through unchanged, so
 * mixed input (English words inside a Kannada sentence) survives.
 */
export function romanizeKannada(text: string): string {
  if (!text) return '';

  const chars = Array.from(text);
  let out = '';

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];

    if (ch === ANUSVARA) {
      out += nasalFor(chars[i + 1]);
      continue;
    }

    if (ch in VOWELS) {
      out += VOWELS[ch];
      continue;
    }

    if (ch in CONSONANTS) {
      const base = CONSONANTS[ch];
      const next = chars[i + 1];

      // Consonant + vowel sign: replace the inherent 'a' with the sign sound
      // (ಕಿ → "ki", ಕೀ → "ki", ಕೈ → "kai").
      if (next !== undefined && next in VOWELS) {
        out += base.slice(0, -1) + VOWELS[next];
        i += 1;
        continue;
      }

      if (next === VIRAMA) {
        i += 1;
        const after = chars[i + 1];

        if (after !== undefined && after in CONSONANTS) {
          // Conjunct (ಜ್ಞ → "nya" after dropping both inherent vowels,
          // ಪ್ಪ → "pa", ಕ್ಷ → "ksa"). The second consonant keeps its vowel
          // unless a sign follows (ಕ್ಷಿ → "ksi").
          const second = CONSONANTS[after];
          const sign = chars[i + 2];
          if (sign !== undefined && sign in VOWELS) {
            out += base.slice(0, -1) + second.slice(0, -1) + VOWELS[sign];
            i += 2;
          } else {
            out += base.slice(0, -1) + second;
            i += 1;
          }
          continue;
        }

        // Trailing virama: the inherent vowel is killed (ಬಸ್ → "bas").
        out += base.slice(0, -1);
        continue;
      }

      out += base;
      continue;
    }

    out += ch;
  }

  return out;
}
