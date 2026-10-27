/** Browser speech helpers — progressive enhancement, never a hard dependency. */

export interface SpeechCapabilities {
  synthesis: boolean;
  kannadaVoice: boolean;
  recognition: boolean;
}

type RecognitionResult = { transcript: string };
type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<RecognitionResult>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function capabilities(): SpeechCapabilities {
  const Ctor = recognitionCtor();
  const synthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voices = synthesis ? window.speechSynthesis.getVoices() : [];
  return {
    synthesis,
    kannadaVoice: voices.some((voice) => voice.lang.toLowerCase().startsWith('kn')),
    recognition: Ctor !== null,
  };
}

/** Speak Kannada text. Returns false when the browser cannot do it. */
export function speak(text: string, lang = 'kn-IN'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((voice) => voice.lang.toLowerCase().startsWith('kn'));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Listen once and resolve with the transcript (or null on error/unsupported).
 * A timeout prevents a hung promise when the user denies microphone access.
 */
export function listenOnce(lang = 'kn-IN', timeoutMs = 8000): Promise<string | null> {
  const Ctor = recognitionCtor();
  if (!Ctor) return Promise.resolve(null);
  return new Promise((resolve) => {
    const recognition = new Ctor();
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => {
      try { recognition.stop(); } catch { /* ignore */ }
      finish(null);
    }, timeoutMs);
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const first = event.results?.[0]?.[0];
      finish(first?.transcript ?? null);
    };
    recognition.onerror = () => finish(null);
    recognition.onend = () => finish(null);
    try {
      recognition.start();
    } catch {
      finish(null);
    }
  });
}

/** Normalise text for forgiving comparison: lowercase, strip punctuation/diacritics. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance (small strings only — used for pronunciation scoring). */
export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return prev[b.length];
}

/** 0–100 similarity, tolerant of small pronunciation/spelling differences. */
export function similarity(heard: string, expected: string): number {
  const a = normalise(heard);
  const b = normalise(expected);
  if (!a || !b) return 0;
  if (a === b) return 100;
  const distance = editDistance(a, b);
  return Math.max(0, Math.round((1 - distance / Math.max(a.length, b.length)) * 100));
}
