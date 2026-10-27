/**
 * Browser Web Speech API wrapper.
 *
 * Design rule: never claim a capability the browser does not have. Everything
 * the UI reports about voices, recognition and pronunciation scoring comes
 * from these checks, and every entry point degrades to a typed fallback.
 */

export interface SpeechCapabilities {
  /** Text-to-speech engine exists at all. */
  ttsSupported: boolean;
  /** A voice whose language starts with "kn" is installed. */
  kannadaVoiceAvailable: boolean;
  /** Name of the Kannada voice when found (for the "using X" note). */
  kannadaVoiceName: string | null;
  /** Any voice at all — used for the "no Kannada voice, but…" fallback. */
  anyVoiceAvailable: boolean;
  /** Speech recognition constructor exists. */
  recognitionSupported: boolean;
  /** Whether recognition was created with lang="kn-IN" successfully. */
  kannadaRecognitionRequested: boolean;
  /** getUserMedia exists, i.e. the mic can even be requested. */
  microphoneAvailable: boolean;
  /** True when running on https/localhost, required for mic access. */
  secureContext: boolean;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  // Some environments expose the property but leave it null.
  return window.speechSynthesis ?? null;
}

function readVoices(): SpeechSynthesisVoice[] {
  const synth = getSynthesis();
  if (!synth?.getVoices) return [];
  const voices = synth.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices;
}

function findKannadaVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const byLang = voices.find((voice) => (voice.lang ?? '').toLowerCase().startsWith('kn'));
  if (byLang) return byLang;
  // Some browsers label the voice by name only.
  return voices.find((voice) => /kannada/i.test(voice.name)) ?? null;
}

/**
 * Detect what this browser can actually do. `onvoiceschanged` fires late in
 * Chrome, so the caller can subscribe for updates instead of reading once.
 */
export function detectCapabilities(): SpeechCapabilities {
  const synth = getSynthesis();
  const ttsSupported = Boolean(synth?.speak);
  const voices = ttsSupported ? readVoices() : [];
  const kannadaVoice = findKannadaVoice(voices);
  const Recognition = getRecognitionCtor();
  const isSecure =
    typeof window === 'undefined' ||
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  return {
    ttsSupported,
    kannadaVoiceAvailable: Boolean(kannadaVoice),
    kannadaVoiceName: kannadaVoice?.name ?? null,
    anyVoiceAvailable: voices.length > 0,
    recognitionSupported: Boolean(Recognition),
    kannadaRecognitionRequested: Boolean(Recognition),
    microphoneAvailable:
      typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    secureContext: isSecure,
  };
}

/** Subscribe to voice list changes (Chrome loads them asynchronously). */
export function onVoicesChanged(callback: () => void): () => void {
  const synth = getSynthesis();
  if (!synth) return () => undefined;
  synth.addEventListener?.('voiceschanged', callback);
  return () => synth.removeEventListener?.('voiceschanged', callback);
}

export interface SpeakOptions {
  /** Prefer the Kannada voice; falls back to the browser default. */
  preferKannada?: boolean;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface SpeakResult {
  started: boolean;
  /** The voice actually used, so the UI can be explicit about what it did. */
  voiceName: string | null;
  usedKannadaVoice: boolean;
  /** Present when playback was not possible. */
  reason?: 'no-tts' | 'no-voices' | 'empty-text' | 'interrupted';
}

/**
 * Speak a line. Kannada text is only handed to a Kannada voice; if the browser
 * has no Kannada voice we still speak the transliteration with the default
 * voice (clearly reported) rather than silently mangling Kannada script.
 */
export function speak(text: string, options: SpeakOptions = {}): SpeakResult {
  const { preferKannada = true, rate = 0.85, onStart, onEnd, onError } = options;
  const trimmed = text.trim();
  if (!trimmed) return { started: false, voiceName: null, usedKannadaVoice: false, reason: 'empty-text' };

  const synth = getSynthesis();
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    return { started: false, voiceName: null, usedKannadaVoice: false, reason: 'no-tts' };
  }
  const voices = readVoices();
  if (!voices.length) {
    return { started: false, voiceName: null, usedKannadaVoice: false, reason: 'no-voices' };
  }

  const kannadaVoice = preferKannada ? findKannadaVoice(voices) : null;
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = rate;
  utterance.pitch = 1;
  if (kannadaVoice) {
    utterance.voice = kannadaVoice;
    utterance.lang = kannadaVoice.lang;
  } else {
    utterance.lang = navigator.languages?.[0] ?? 'en-IN';
  }

  synth.cancel();
  let finished = false;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };
  utterance.onerror = (event) => {
    if (finished) return;
    finished = true;
    const name = (event as SpeechSynthesisErrorEvent).error;
    // "interrupted"/"canceled" happen on every rapid re-click; they are not user errors.
    if (name === 'interrupted' || name === 'canceled') {
      onEnd?.();
      return;
    }
    onError?.(`Playback failed (${name}). Your browser blocked the speech engine.`);
  };

  try {
    synth.speak(utterance);
  } catch {
    return { started: false, voiceName: null, usedKannadaVoice: false, reason: 'no-tts' };
  }

  return {
    started: true,
    voiceName: kannadaVoice?.name ?? utterance.voice?.name ?? 'browser default voice',
    usedKannadaVoice: Boolean(kannadaVoice),
  };
}

export function stopSpeaking(): void {
  getSynthesis()?.cancel();
}

export type ListenErrorCode =
  | 'unsupported'
  | 'insecure-context'
  | 'permission-denied'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface ListenHandle {
  stop: () => void;
}

export interface ListenOptions {
  lang?: string;
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal: (text: string, confidence: number | null) => void;
  onError?: (code: ListenErrorCode, message: string) => void;
  onEnd?: () => void;
}

/**
 * One-shot dictation. Chrome's implementation sends audio to a network
 * service, so `network` errors are surfaced separately from permission ones —
 * the difference matters for a demo on venue Wi-Fi.
 */
export function listenOnce(options: ListenOptions): ListenHandle {
  const { lang = 'kn-IN', onStart, onInterim, onFinal, onError, onEnd } = options;
  const Recognition = getRecognitionCtor();

  if (!Recognition) {
    onError?.('unsupported', 'This browser has no speech recognition engine. Type the phrase instead.');
    return { stop: () => undefined };
  }
  if (typeof window !== 'undefined' && !window.isSecureContext && !/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    onError?.('insecure-context', 'Microphone access needs https (or localhost). Open the app over https to speak.');
    return { stop: () => undefined };
  }

  const recognition = new Recognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  let stoppedByUs = false;
  let delivered = false;

  recognition.onstart = () => onStart?.();

  recognition.onresult = (event: any) => {
    const results = event?.results;
    if (!results || !results.length) return;
    const last = results[results.length - 1];
    const alternative = last?.[0];
    const transcript: string = alternative?.transcript ?? '';
    const confidence: number | null =
      typeof alternative?.confidence === 'number' ? alternative.confidence : null;

    if (!transcript) return;
    if (last.isFinal) {
      delivered = true;
      onFinal(transcript.trim(), confidence);
    } else {
      onInterim?.(transcript.trim());
    }
  };

  recognition.onerror = (event: any) => {
    const code = String(event?.error ?? 'unknown') as ListenErrorCode;
    if (code === 'aborted' && stoppedByUs) return;
    const friendly: Record<string, string> = {
      'no-speech': 'No speech was detected. Tap the mic and say the whole sentence in one go.',
      'not-allowed': 'Microphone permission was blocked. Allow it in the address bar, or type the phrase.',
      'permission-denied': 'Microphone permission was denied. You can type the phrase instead.',
      'audio-capture': 'No microphone was found. Type the phrase instead.',
      network: 'Speech recognition needs the network and could not reach it. Type the phrase instead.',
      'service-not-allowed': 'The browser blocked its speech service. Type the phrase instead.',
    };
    onError?.(code in friendly ? (code as ListenErrorCode) : 'unknown', friendly[code] ?? `Recognition error: ${code}`);
  };

  recognition.onend = () => {
    if (!delivered && !stoppedByUs) onEnd?.();
    else onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    onError?.('unknown', 'Could not start recognition. Type the phrase instead.');
  }

  return {
    stop: () => {
      stoppedByUs = true;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

/**
 * How honest can the UI be about scoring? There is no acoustic model here, so
 * we only ever report text similarity. This function exists to make that
 * limitation explicit and testable.
 */
export function pronunciationAssessmentSupported(): false {
  return false;
}
