/**
 * Speech layer.
 *
 * Design rule: never claim a capability the browser does not have, and never
 * make the speaker button depend on a `kn-IN` voice that most browsers do not
 * ship. Every static Kannada line in the app is played from a bundled MP3
 * recorded with a real Kannada voice. Browser speech synthesis is kept only as
 * a fallback for text that is not in the dataset, and it speaks the
 * transliteration when no Kannada voice is available.
 *
 * Desktop mode (Electron): when window.desktopAPI is present, recognition
 * uses bundled Whisper (offline, no Google servers) and Kannada TTS uses
 * bundled espeak-ng — both run locally with no network and no API key.
 */
import { pronunciationAudioUrl } from './pronunciationAudio';
import { isDesktop, desktopRecognize, desktopSpeak } from './desktop';
import { hasKannadaScript } from '../utils/text';

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
  /** Running inside the Electron desktop shell with Whisper available. */
  desktopRecognition: boolean;
  /** Running inside the Electron desktop shell with espeak-ng available. */
  desktopKannadaTts: boolean;
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

  // Desktop shell: Whisper recognition and espeak-ng TTS replace browser APIs.
  const desktop = isDesktop();
  const desktopRecognition = desktop; // whisper is always bundled in the exe
  const desktopKannadaTts = desktop; // espeak-ng is always bundled in the exe

  return {
    ttsSupported,
    kannadaVoiceAvailable: Boolean(kannadaVoice) || desktopKannadaTts,
    kannadaVoiceName: kannadaVoice?.name ?? (desktopKannadaTts ? 'espeak-ng (bundled)' : null),
    anyVoiceAvailable: voices.length > 0 || desktopKannadaTts,
    recognitionSupported: Boolean(Recognition) || desktopRecognition,
    kannadaRecognitionRequested: Boolean(Recognition) || desktopRecognition,
    microphoneAvailable:
      typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    secureContext: isSecure,
    desktopRecognition,
    desktopKannadaTts,
  };
}

/** Subscribe to voice list changes (Chrome loads them asynchronously). */
export function onVoicesChanged(callback: () => void): () => void {
  const synth = getSynthesis();
  if (!synth) return () => undefined;
  synth.addEventListener?.('voiceschanged', callback);
  return () => synth.removeEventListener?.('voiceschanged', callback);
}

export type SpeakSource = 'recording' | 'browser-tts' | 'desktop-tts';

export interface SpeakOptions {
  /** Prefer the Kannada voice; falls back to the browser default. */
  preferKannada?: boolean;
  rate?: number;
  /** Latin-script text to speak when the browser has no Kannada voice. */
  fallbackText?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface SpeakResult {
  started: boolean;
  /** The voice actually used, so the UI can be explicit about what it did. */
  voiceName: string | null;
  usedKannadaVoice: boolean;
  source: SpeakSource;
  /** Present when playback was not possible. */
  reason?: 'no-tts' | 'no-voices' | 'empty-text' | 'playback-failed';
}

let currentAudio: HTMLAudioElement | null = null;
let pendingSpeakTimer: number | null = null;
let speechWatchdog: number | null = null;

function clearPendingSpeak(): void {
  if (pendingSpeakTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }
}

function clearWatchdog(): void {
  if (speechWatchdog !== null && typeof window !== 'undefined') {
    window.clearTimeout(speechWatchdog);
    speechWatchdog = null;
  }
}

function stopCurrentAudio(): void {
  if (!currentAudio) return;
  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  } catch {
    /* already stopped or not seekable yet */
  }
  currentAudio.onplaying = null;
  currentAudio.onended = null;
  currentAudio.onerror = null;
  currentAudio = null;
}

/** Stop any recorded audio, pending speech or recognition-safe cleanup. */
export function stopSpeaking(): void {
  clearPendingSpeak();
  clearWatchdog();
  stopCurrentAudio();
  getSynthesis()?.cancel();
}

/**
 * Play the bundled Kannada MP3 for `text`. Returns `null` when HTMLAudioElement
 * cannot even be constructed here, so the caller can fall through to browser
 * TTS instead of failing silently.
 */
function playRecordedAudio(url: string, text: string, options: SpeakOptions): SpeakResult | null {
  if (typeof Audio === 'undefined') return null;

  stopCurrentAudio();
  clearPendingSpeak();
  clearWatchdog();

  let audio: HTMLAudioElement;
  try {
    audio = new Audio(url);
  } catch {
    return null;
  }
  audio.preload = 'auto';

  let settled = false;
  const finish = (fn?: () => void) => {
    if (settled) return;
    settled = true;
    stopCurrentAudio();
    fn?.();
  };

  const fallbackToBrowser = () => {
    if (settled) return;
    // Mark first: HTMLMediaElement can fire both `error` and a rejected play()
    // promise for the same failure.
    settled = true;
    stopCurrentAudio();
    const fallback = speakWithBrowserTts(text, options);
    if (!fallback.started) {
      options.onError?.('Recorded audio could not play and this browser has no speech engine. Read the transliteration aloud.');
    }
  };

  audio.onplaying = () => options.onStart?.();
  audio.onended = () => finish(() => options.onEnd?.());
  audio.onerror = fallbackToBrowser;

  currentAudio = audio;
  try {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(fallbackToBrowser);
    }
  } catch {
    currentAudio = null;
    return null;
  }

  return {
    started: true,
    voiceName: 'Kannada voice (recorded)',
    usedKannadaVoice: true,
    source: 'recording',
  };
}

/**
 * Browser speech synthesis fallback. Improvements over the old implementation:
 *  - speaks the transliteration when no Kannada voice exists (not raw Kannada
 *    Unicode handed to an English voice, which is usually silent);
 *  - defers `speak()` after `cancel()` to avoid Chrome's cancel/speak race;
 *  - calls `resume()` for browsers that pause the engine after a cancel;
 *  - watchdogs an engine that never fires `start`/`end`/`error`.
 */
function speakWithBrowserTts(text: string, options: SpeakOptions): SpeakResult {
  const { preferKannada = true, rate = 0.85, fallbackText, onStart, onEnd, onError } = options;
  const synth = getSynthesis();
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    return { started: false, voiceName: null, usedKannadaVoice: false, source: 'browser-tts', reason: 'no-tts' };
  }

  const voices = readVoices();
  const kannadaVoice = preferKannada ? findKannadaVoice(voices) : null;
  const textToSpeak = kannadaVoice ? text : (fallbackText?.trim() || text);
  if (!textToSpeak) {
    return { started: false, voiceName: null, usedKannadaVoice: false, source: 'browser-tts', reason: 'empty-text' };
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = rate;
  utterance.pitch = 1;
  if (kannadaVoice) {
    utterance.voice = kannadaVoice;
    utterance.lang = kannadaVoice.lang;
  } else if (fallbackText?.trim()) {
    utterance.lang = 'en-IN';
  } else {
    utterance.lang = 'kn-IN';
  }

  // Stop anything already playing, then start on the next tick. Chrome reliably
  // drops a speak() that is called in the same task as cancel().
  stopSpeaking();
  let finished = false;
  const done = (fn?: () => void) => {
    if (finished) return;
    finished = true;
    clearWatchdog();
    clearPendingSpeak();
    fn?.();
  };

  utterance.onstart = () => {
    clearWatchdog();
    onStart?.();
  };
  utterance.onend = () => done(() => onEnd?.());
  utterance.onerror = (event) => {
    const name = (event as SpeechSynthesisErrorEvent).error;
    // "interrupted"/"canceled" happen on every rapid re-click; they are not user errors.
    if (name === 'interrupted' || name === 'canceled') {
      done(() => onEnd?.());
      return;
    }
    done(() => onError?.(`Playback failed (${name}). Your browser blocked the speech engine.`));
  };

  if (typeof window !== 'undefined') {
    speechWatchdog = window.setTimeout(() => {
      if (!finished) {
        finished = true;
        clearPendingSpeak();
        onError?.('The speech engine did not start. Check the speaker/volume and try again.');
      }
    }, 4000);
  }

  pendingSpeakTimer = typeof window !== 'undefined'
    ? window.setTimeout(() => {
        pendingSpeakTimer = null;
        try {
          synth.resume();
          synth.speak(utterance);
        } catch {
          done(() => onError?.('The speech engine refused to start. Read the transliteration aloud.'));
        }
      }, 0)
    : null;

  const voiceName = kannadaVoice?.name ?? (fallbackText?.trim() ? 'English fallback voice' : 'browser default voice');
  return {
    started: true,
    voiceName,
    usedKannadaVoice: Boolean(kannadaVoice),
    source: 'browser-tts',
  };
}

/**
 * Speak a line. Prefers the bundled Kannada recording; only text that is not in
 * the dataset reaches browser speech synthesis.
 */
export function speak(text: string, options: SpeakOptions = {}): SpeakResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { started: false, voiceName: null, usedKannadaVoice: false, source: 'browser-tts', reason: 'empty-text' };
  }

  // Desktop mode: espeak-ng for Kannada text not in the phrasebook.
  // Fire-and-forget — the WAV arrives async and plays via a data-URI Audio.
  if (isDesktop() && hasKannadaScript(trimmed)) {
    stopCurrentAudio();
    clearPendingSpeak();
    clearWatchdog();
    desktopSpeak(trimmed, 'kn')
      .then((audio) => {
        if (currentAudio) return; // user started another speak first
        const audioEl = new Audio(`data:audio/wav;base64,${audio}`);
        audioEl.onplaying = () => options.onStart?.();
        audioEl.onended = () => {
          if (currentAudio === audioEl) currentAudio = null;
          options.onEnd?.();
        };
        audioEl.onerror = () => {
          if (currentAudio === audioEl) currentAudio = null;
          options.onError?.('Desktop TTS playback failed.');
        };
        currentAudio = audioEl;
        audioEl.play().catch(() => {
          if (currentAudio === audioEl) currentAudio = null;
          options.onError?.('Desktop TTS playback failed.');
        });
      })
      .catch((err: Error) => {
        options.onError?.(`Desktop TTS failed: ${err.message}`);
        speakWithBrowserTts(trimmed, options);
      });
    return {
      started: true,
      voiceName: 'espeak-ng (bundled)',
      usedKannadaVoice: true,
      source: 'desktop-tts',
    };
  }

  const url = pronunciationAudioUrl(trimmed);
  if (url) {
    const recorded = playRecordedAudio(url, trimmed, options);
    if (recorded) return recorded;
  }
  return speakWithBrowserTts(trimmed, options);
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
 * Desktop recognition: capture audio via getUserMedia, collect PCM samples,
 * and send them to the main process for Whisper transcription.
 *
 * Uses ScriptProcessorNode (deprecated but universally supported) instead of
 * AudioWorklet to avoid a separate worklet file — reliability matters more
 * than the deprecation warning here.
 */
function listenOnceDesktop(options: ListenOptions): ListenHandle {
  const { lang = 'kn-IN', onStart, onFinal, onError, onEnd } = options;
  // Map browser lang codes to whisper codes: 'kn-IN' → 'kn', 'en-US' → 'en'.
  const whisperLang = lang.startsWith('kn') ? 'kn' : 'en';
  // Kannada audio is translated to English — whisper reliably confuses
  // Indic scripts in transcribe mode, but --translate produces clean English.
  const translate = whisperLang === 'kn';

  let audioCtx: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let silentGain: GainNode | null = null;
  let mediaStream: MediaStream | null = null;
  const chunks: Float32Array[] = [];
  let stopped = false;
  let busy = false;
  let sampleRate = 16000;

  const cleanup = () => {
    try { processor?.disconnect(); } catch { /* noop */ }
    try { silentGain?.disconnect(); } catch { /* noop */ }
    try { audioCtx?.close(); } catch { /* noop */ }
    try { mediaStream?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    audioCtx = null;
    processor = null;
    silentGain = null;
    mediaStream = null;
  };

  const finishWithAudio = async () => {
    if (busy) return;
    busy = true;

    const total = chunks.reduce((s, c) => s + c.length, 0);
    const pcm = new Float32Array(total);
    let offset = 0;
    for (const c of chunks) {
      pcm.set(c, offset);
      offset += c.length;
    }
    chunks.length = 0;

    if (pcm.length < 1600) {
      onError?.('no-speech', 'No speech was detected. Tap the mic and say the whole sentence in one go.');
      onEnd?.();
      busy = false;
      cleanup();
      return;
    }

    try {
      const text = await desktopRecognize(pcm, sampleRate, whisperLang, translate);
      if (text.trim()) {
        onFinal(text.trim(), null);
      } else {
        onError?.('no-speech', 'No speech was detected. Tap the mic and say the whole sentence in one go.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Recognition failed.';
      onError?.('unknown', message);
    } finally {
      onEnd?.();
      busy = false;
      cleanup();
    }
  };

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    onError?.('audio-capture', 'No microphone was found. Type the phrase instead.');
    onEnd?.();
    return { stop: () => undefined };
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      mediaStream = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctx();
      sampleRate = audioCtx.sampleRate;
      const source = audioCtx.createMediaStreamSource(stream);
      processor = audioCtx.createScriptProcessor(4096, 1, 1);
      silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (stopped) return;
        const input = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      onStart?.();
    })
    .catch((err: Error) => {
      if (stopped) return;
      const isPermission = err.name === 'NotAllowedError';
      onError?.(
        isPermission ? 'permission-denied' : 'audio-capture',
        isPermission
          ? 'Microphone permission was blocked. Allow it in the app settings, or type the phrase.'
          : `Could not access the microphone: ${err.message}`,
      );
      onEnd?.();
    });

  return {
    stop: () => {
      if (stopped || busy) return;
      stopped = true;
      try { processor?.disconnect(); } catch { /* noop */ }
      finishWithAudio();
    },
  };
}

/**
 * One-shot dictation, LiveBridge-style.
 *
 * Desktop mode: audio is captured via getUserMedia → AudioContext →
 * ScriptProcessorNode, downsampled and sent to the main process where
 * Whisper transcribes it offline. English is transcribed directly; Kannada
 * is translated to English via whisper's --translate mode (the model
 * reliably confuses Indic scripts in transcribe mode).
 *
 * Web mode: webkitSpeechRecognition with continuous accumulation, 900ms
 * auto-finalize, and one retry on transient errors.
 */
export function listenOnce(options: ListenOptions): ListenHandle {
  if (isDesktop()) {
    return listenOnceDesktop(options);
  }
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

  // Everything the handlers share, kept outside `createSession` so a restart
  // starts from the same state instead of a fresh closure.
  const accumulated = { final: '' };
  let delivered = false;
  let stoppedByUs = false;
  let restarting = false;
  let lastError: string | null = null;
  let finalizeTimer: number | null = null;
  let session: SpeechRecognitionLike | null = null;

  const clearFinalize = () => {
    if (finalizeTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(finalizeTimer);
      finalizeTimer = null;
    }
  };

  /** Errors that a retry can plausibly fix (transient network drops, a missed first attempt, Chrome cancelling a session on its own). */
  const retryableError = (code: string | null) =>
    code === null || code === 'network' || code === 'no-speech' || code === 'aborted';

  /** Deliver the recognized sentence and close the turn. */
  const finishTurn = () => {
    if (delivered || !accumulated.final.trim()) return;
    delivered = true;
    clearFinalize();
    const text = accumulated.final.trim();
    accumulated.final = '';
    onInterim?.('');
    onFinal(text, null);
  };

  const createSession = (): SpeechRecognitionLike => {
    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => onStart?.();

    recognition.onresult = (event: any) => {
      const results = event?.results;
      if (!results || !results.length) return;
      let interim = '';
      let final = '';
      for (let index = event.resultIndex ?? 0; index < results.length; index += 1) {
        const result = results[index];
        const transcript: string = result?.[0]?.transcript ?? '';
        if (result?.isFinal) final += transcript;
        else interim += transcript;
      }

      if (final.trim()) {
        // Chrome's separate final chunks can carry leading spaces — collapse
        // them so the sentence reads as one line.
        accumulated.final = `${accumulated.final} ${final}`.replace(/\s+/g, ' ').trim();
        // Finalize the turn shortly after the pause, unless more speech
        // arrives and reschedules it.
        clearFinalize();
        finalizeTimer = typeof window !== 'undefined'
          ? window.setTimeout(() => {
              finalizeTimer = null;
              finishTurn();
            }, 900)
          : null;
      }

      // Live caption: everything heard so far, final parts + current words.
      onInterim?.(`${accumulated.final} ${interim}`.replace(/\s+/g, ' ').trim());
    };

    recognition.onerror = (event: any) => {
      const code = String(event?.error ?? 'unknown') as ListenErrorCode;
      if (code === 'aborted' && stoppedByUs) return;
      lastError = code;
      const friendly: Record<string, string> = {
        'aborted': 'Listening was stopped before your words came through — clicking anywhere on the page, or another app taking the microphone, cancels Chrome\'s listening. Tap the mic again and speak in one go.',
        'no-speech': 'No speech was detected. Tap the mic and say the whole sentence in one go.',
        'not-allowed': 'Microphone permission was blocked. Allow it in the address bar, or type the phrase.',
        'permission-denied': 'Microphone permission was denied. You can type the phrase instead.',
        'audio-capture': 'No microphone was found. Type the phrase instead.',
        network: 'Speech recognition needs the network and could not reach it. Type the phrase instead.',
        'service-not-allowed': 'The browser blocked its speech service. Type the phrase instead.',
      };
      onError?.(code as ListenErrorCode, friendly[code] ?? `Recognition error: ${code}`);
    };

    recognition.onend = () => {
      if (stoppedByUs || delivered) return;
      if (accumulated.final.trim()) {
        // The browser ended the session after the last final result.
        finishTurn();
        return;
      }
      // Retry once on transient failures (network drop, nothing heard on the
      // first attempt). Permission/hardware errors won't fix themselves.
      if (!restarting && retryableError(lastError)) {
        restarting = true;
        try {
          session = createSession();
          session.start();
          return;
        } catch {
          /* fall through to onEnd */
        }
      }
      onEnd?.();
    };

    return recognition;
  };

  try {
    session = createSession();
    session.start();
    onInterim?.('');
  } catch {
    onError?.('unknown', 'Could not start recognition. Type the phrase instead.');
  }

  return {
    stop: () => {
      stoppedByUs = true;
      clearFinalize();
      if (!delivered && accumulated.final.trim()) finishTurn();
      try {
        session?.stop();
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
