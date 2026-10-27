import { useCallback, useEffect, useRef, useState } from 'react';
import type { Phrase } from '../types';
import {
  detectCapabilities,
  listenOnce,
  onVoicesChanged,
  speak,
  stopSpeaking,
  type ListenErrorCode,
  type SpeechCapabilities,
} from '../services/speech';

export interface SpeechStatus {
  kind: 'idle' | 'speaking' | 'listening' | 'error' | 'done';
  /** Text safe to show to the user, e.g. "Using Google ಕನ್ನడా voice". */
  message?: string;
  code?: ListenErrorCode;
}

/**
 * Single source of truth for what speech the browser can do, plus the small
 * state machine both the phrase cards and the practice page share.
 */
export function useSpeech() {
  const [capabilities, setCapabilities] = useState<SpeechCapabilities>(() => detectCapabilities());
  const [status, setStatus] = useState<SpeechStatus>({ kind: 'idle' });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const listenRef = useRef<{ stop: () => void } | null>(null);

  // Chrome reports voices a tick after mount, so re-detect when they arrive.
  useEffect(() => {
    const unsubscribe = onVoicesChanged(() => setCapabilities(detectCapabilities()));
    const timer = window.setTimeout(() => setCapabilities(detectCapabilities()), 400);
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
      stopSpeaking();
      listenRef.current?.stop();
    };
  }, []);

  const speakPhrase = useCallback(
    (phrase: Phrase) => {
      const result = speak(phrase.kannada, {
        // If browser TTS is the only option, speak the Latin transliteration
        // rather than handing Kannada Unicode to an English voice.
        fallbackText: phrase.transliteration,
        onEnd: () => {
          setPlayingId(null);
          setStatus({ kind: 'idle' });
        },
        onError: (message) => {
          setPlayingId(null);
          setStatus({ kind: 'error', message });
        },
      });

      if (!result.started) {
        const reason =
          result.reason === 'no-tts'
            ? 'This browser has no speech synthesis engine. Read the transliteration aloud instead.'
            : result.reason === 'no-voices'
              ? 'No system voices are installed yet, so playback is unavailable.'
              : 'Nothing to play for this card.';
        setStatus({ kind: 'error', message: reason });
        setPlayingId(null);
        return result;
      }

      const message =
        result.source === 'recording'
          ? 'Playing recorded Kannada pronunciation — works even without a system Kannada voice.'
          : result.usedKannadaVoice
            ? `Playing with the Kannada voice: ${result.voiceName}`
            : `No Kannada voice is installed, so this used ${result.voiceName}. Read the transliteration for the correct sounds.`;
      setStatus({ kind: 'done', message });
      setPlayingId(phrase.id);
      return result;
    },
    [],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    listenRef.current?.stop();
    listenRef.current = null;
    setPlayingId(null);
    setStatus({ kind: 'idle' });
  }, []);

  /**
   * Dictate one phrase. Callers receive the transcript and must handle the
   * `unsupported` / permission errors themselves — that is where the typed
   * fallback lives.
   */
  const startListening = useCallback(
    (handlers: {
      onResult: (text: string, confidence: number | null) => void;
      onInterim?: (text: string) => void;
    }) => {
      setStatus({ kind: 'listening', message: 'Listening in Kannada (kn-IN)…' });
      let sawResult = false;

      listenRef.current = listenOnce({
        lang: 'kn-IN',
        onInterim: (text) => handlers.onInterim?.(text),
        onFinal: (text, confidence) => {
          sawResult = true;
          setStatus({ kind: 'idle' });
          handlers.onResult(text, confidence);
        },
        onError: (code, message) => {
          setStatus({ kind: 'error', code, message });
          setPlayingId(null);
        },
        onEnd: () => {
          if (!sawResult) setStatus({ kind: 'idle', message: 'No speech captured. Try again or type it.' });
        },
      });

      return () => listenRef.current?.stop();
    },
    [],
  );

  return {
    capabilities,
    status,
    setStatus,
    playingId,
    speakPhrase,
    stop,
    startListening,
  };
}
