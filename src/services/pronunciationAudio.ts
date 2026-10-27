/**
 * Bundled Kannada pronunciation lookup.
 *
 * Browser speech synthesis cannot be trusted for Kannada: most desktop and
 * Linux browsers ship no `kn-IN` voice at all, and feeding Kannada Unicode to
 * an English voice produces silence or garbled output. Every speakable line in
 * the dataset therefore ships as a small MP3 recorded with a real Kannada
 * neural voice. The browser engine remains only as a fallback for text that is
 * not in the bundled dataset.
 */
import audioManifest from '../data/pronunciation-audio.json';

const BASE = import.meta.env.BASE_URL || './';
const manifest = audioManifest as Record<string, string>;

/** Match the normalisation used when the MP3s and manifest were generated. */
export function normalizeSpeakableText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Return a deployment-safe URL for the recorded pronunciation of `text`, or
 * `null` when no recording is bundled. `base: './'` plus HashRouter means a
 * relative `./audio/...` URL resolves correctly on GitHub Pages sub-paths too.
 */
export function pronunciationAudioUrl(text: string): string | null {
  const key = normalizeSpeakableText(text);
  const file = manifest[key];
  if (!file) return null;
  return `${BASE}audio/${file}`;
}

export function hasPronunciationAudio(text: string): boolean {
  return pronunciationAudioUrl(text) !== null;
}

export function recordedPronunciationCount(): number {
  return Object.keys(manifest).length;
}
