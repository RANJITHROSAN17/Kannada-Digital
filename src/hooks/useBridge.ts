import { useEffect, useRef, useState } from 'react';
import { detectCapabilities, listenOnce, speak, stopSpeaking } from '../services/speech';
import { startMicLevel, type MicLevelHandle } from '../services/micLevel';
import {
  translateToEnglish,
  translateToKannada,
  type TranslationEngine,
} from '../services/translation';
import { romanizeKannada } from '../utils/romanize';
import type { SpeechCapabilities } from '../services/speech';

/**
 * The ಸಂವಿಧಾನ (bridge) conversation engine, shared by the dedicated
 * `/bridge` page and the home page's "speak & hear" panel.
 *
 * Turn flow:
 *   1. You speak/type English → translates live → plays the Kannada line so
 *      the other person hears it in their language.
 *   2. They reply in Kannada → recognised → translated → played back in
 *      English so you hear (and read) the answer.
 *
 * Every sentence works, not just reviewed phrases: translation runs live
 * (Google → MyMemory, no API key). The typed boxes keep the bridge usable
 * without a microphone.
 */

export type BridgeSide = 'you' | 'them';

export interface BridgeSideState {
  /** What you said / they said (recognised or typed). */
  input: string;
  /** Live recognition text while listening. */
  interim: string;
  /** The translated line: Kannada for your side, English for theirs. */
  output?: string;
  /** Reader-friendly romanisation of a live-translated Kannada line. */
  roman?: string;
  /** Which engine produced the translation. */
  engine?: TranslationEngine;
  status: 'idle' | 'listening' | 'translating' | 'done' | 'error';
  error?: string;
}

export interface BridgeTranscriptEntry {
  id: number;
  side: BridgeSide;
  text: string;
  roman?: string;
  engine?: TranslationEngine;
}

export interface MicTestResult {
  status: 'idle' | 'testing' | 'ok' | 'fail';
  detail: string;
}

const initialSide: BridgeSideState = { input: '', interim: '', status: 'idle' };

export interface BridgeHook {
  capabilities: SpeechCapabilities;
  your: BridgeSideState;
  them: BridgeSideState;
  autoFlow: boolean;
  setAutoFlow: (value: boolean) => void;
  transcript: BridgeTranscriptEntry[];
  copiedKey: string | null;
  /** Result of the one-tap microphone self-test (diagnostics). */
  micTest: MicTestResult;
  /** Live 0..1 microphone input level while testing (null = not metering). */
  micLevel: number | null;
  testMicrophone: () => void;
  setYourInput: (value: string) => void;
  setTheirInput: (value: string) => void;
  setYourError: (message: string) => void;
  setThemError: (message: string) => void;
  startYourMic: () => void;
  startTheirMic: () => void;
  stopListening: () => void;
  clearConversation: () => void;
  runYourTranslation: (text?: string) => Promise<void>;
  runTheirTranslation: (text?: string) => Promise<void>;
  copyText: (text: string, key: string) => Promise<void>;
}

export function useBridge(): BridgeHook {
  const [capabilities] = useState<SpeechCapabilities>(() => detectCapabilities());
  const [your, setYour] = useState<BridgeSideState>(initialSide);
  const [them, setThem] = useState<BridgeSideState>(initialSide);
  const [autoFlow, setAutoFlow] = useState(false);
  const [transcript, setTranscript] = useState<BridgeTranscriptEntry[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [micTest, setMicTest] = useState<MicTestResult>({ status: 'idle', detail: '' });
  const [micLevel, setMicLevel] = useState<number | null>(null);

  const listenerRef = useRef<{ stop: () => void } | null>(null);
  const levelStopRef = useRef<MicLevelHandle | null>(null);
  const levelErrorRef = useRef<string | null>(null);
  const levelMovedRef = useRef(false);
  const pendingTestErrorRef = useRef<{ code: string; message: string } | null>(null);
  const autoFlowRef = useRef(false);
  const autoArmedRef = useRef(false);
  const entryIdRef = useRef(0);

  useEffect(() => {
    autoFlowRef.current = autoFlow;
  }, [autoFlow]);

  // Leaving the page must never leave the microphone or audio running.
  useEffect(
    () => () => {
      listenerRef.current?.stop();
      levelStopRef.current?.stop();
      stopSpeaking();
    },
    [],
  );

  const canMic =
    capabilities.recognitionSupported &&
    capabilities.microphoneAvailable &&
    capabilities.secureContext;

  const pushTranscript = (
    side: BridgeSide,
    text: string,
    roman?: string,
    engine?: TranslationEngine,
  ) => {
    setTranscript((list) => [
      ...list,
      { id: entryIdRef.current++, side, text, roman, engine },
    ]);
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      window.alert('Clipboard blocked by your browser. Long-press or select the text to copy it.');
    }
  };

  const stopListening = () => {
    listenerRef.current?.stop();
    listenerRef.current = null;
    stopSpeaking();
    setYour((state) => ({
      ...state,
      status: state.status === 'listening' ? 'idle' : state.status,
      interim: '',
    }));
    setThem((state) => ({
      ...state,
      status: state.status === 'listening' ? 'idle' : state.status,
      interim: '',
    }));
  };

  const clearConversation = () => {
    stopListening();
    setYour({ ...initialSide });
    setThem({ ...initialSide });
    setTranscript([]);
  };

  const setYourInput = (value: string) =>
    setYour((state) => ({ ...state, input: value }));
  const setTheirInput = (value: string) =>
    setThem((state) => ({ ...state, input: value }));
  const setYourError = (message: string) =>
    setYour((state) => ({ ...state, status: 'error', error: message }));
  const setThemError = (message: string) =>
    setThem((state) => ({ ...state, status: 'error', error: message }));

  /* ----------------------------------------------------------- your side */

  const runYourTranslation = async (text?: string) => {
    const input = (text ?? your.input).trim();
    if (!input) {
      setYour((state) => ({ ...state, status: 'error', error: 'Say or type an English sentence first.' }));
      return;
    }

    setYour((state) => ({ ...state, status: 'translating', error: undefined }));
    try {
      const result = await translateToKannada(input);
      const roman = romanizeKannada(result.text);
      setYour((state) => ({
        ...state,
        status: 'done',
        input,
        output: result.text,
        roman,
        engine: result.engine,
      }));
      pushTranscript('you', result.text, roman, result.engine);

      // Play the line the other person hears. Recorded phrasebook audio is
      // used when the sentence exists in the dataset; otherwise the browser
      // speech engine speaks it (or its romanisation, if no Kannada voice).
      autoArmedRef.current = autoFlowRef.current;
      const audio = speak(result.text, {
        rate: 0.82,
        fallbackText: roman,
        onEnd: () => {
          if (autoArmedRef.current && canMic) {
            // Auto-continue: hand the phone over, let them answer.
            startTheirMic();
          }
        },
      });
      if (!audio.started) {
        setYour((state) => ({
          ...state,
          error: 'This browser has no audio engine to play the Kannada line. Show them the text.',
        }));
      }
    } catch (error) {
      setYour((state) => ({
        ...state,
        status: 'error',
        error:
          error instanceof Error && error.message
            ? error.message
            : 'Translation failed. Check your network and try again.',
      }));
    }
  };

  const startYourMic = () => {
    if (your.status === 'listening') {
      stopListening();
      return;
    }
    if (!canMic) {
      setYour((state) => ({
        ...state,
        status: 'error',
        error:
          'This browser cannot listen (no speech recognition, no mic, or not on https). Type the sentence below — the bridge works the same.',
      }));
      return;
    }
    stopSpeaking();
    setYour((state) => ({ ...state, status: 'listening', interim: '', error: undefined }));
    listenerRef.current = listenOnce({
      lang: 'en-US',
      onInterim: (text) => setYour((state) => ({ ...state, interim: text })),
      onFinal: (text) => {
        setYour((state) => ({ ...state, input: text, interim: '', status: 'idle' }));
        void runYourTranslation(text);
      },
      onEnd: () => {
        // The browser ended the session without hearing anything. If an
        // error was already shown, keep it; otherwise let the user tap again.
        setYour((state) => ({
          ...state,
          status: state.status === 'listening' ? 'idle' : state.status,
          interim: '',
        }));
      },
      onError: (code, message) => {
        setYour((state) => ({ ...state, status: 'error', error: `${message} (error code: ${code})`, interim: '' }));
      },
    });
  };

  /* ----------------------------------------------------------- their side */

  const runTheirTranslation = async (text?: string) => {
    const input = (text ?? them.input).trim();
    if (!input) {
      setThem((state) => ({
        ...state,
        status: 'error',
        error: 'Listen to their reply first, or type it in Kannada.',
      }));
      return;
    }

    setThem((state) => ({ ...state, status: 'translating', error: undefined }));
    try {
      const result = await translateToEnglish(input);
      setThem((state) => ({
        ...state,
        status: 'done',
        input,
        output: result.text,
        engine: result.engine,
      }));
      pushTranscript('them', result.text, undefined, result.engine);

      // Speak the reply back to you in English.
      const audio = speak(result.text, { preferKannada: false, rate: 0.9 });
      if (!audio.started) {
        setThem((state) => ({
          ...state,
          error: 'This browser has no audio engine to play the reply. Read the text above.',
        }));
      }
    } catch (error) {
      setThem((state) => ({
        ...state,
        status: 'error',
        error:
          error instanceof Error && error.message
            ? error.message
            : 'Translation failed. Check your network and try again.',
      }));
    }
  };

  const startTheirMic = () => {
    if (them.status === 'listening') {
      stopListening();
      return;
    }
    if (!canMic) {
      setThem((state) => ({
        ...state,
        status: 'error',
        error:
          'This browser cannot listen (no speech recognition, no mic, or not on https). Type their reply below — it still translates.',
      }));
      return;
    }
    stopSpeaking();
    setThem((state) => ({ ...state, status: 'listening', interim: '', error: undefined }));
    listenerRef.current = listenOnce({
      lang: 'kn-IN',
      onInterim: (text) => setThem((state) => ({ ...state, interim: text })),
      onFinal: (text) => {
        setThem((state) => ({ ...state, input: text, interim: '', status: 'idle' }));
        void runTheirTranslation(text);
      },
      onEnd: () => {
        setThem((state) => ({
          ...state,
          status: state.status === 'listening' ? 'idle' : state.status,
          interim: '',
        }));
      },
      onError: (code, message) => {
        setThem((state) => ({ ...state, status: 'error', error: `${message} (error code: ${code})`, interim: '' }));
      },
    });
  };

  /* -------------------------------------------------- microphone self-test */

  /**
   * One-tap diagnostic: runs a live microphone level meter AND a real
   * recognition session. Together they tell apart (a) a microphone that
   * cannot capture audio at all, (b) a microphone that works but a broken
   * Chrome speech service, and (c) a working microphone hearing real words.
   */
  const testMicrophone = () => {
    if (!canMic) {
      setMicTest({
        status: 'fail',
        detail:
          'This browser cannot listen — speech recognition: ' +
          `${capabilities.recognitionSupported ? 'present' : 'missing'}, ` +
          `microphone: ${capabilities.microphoneAvailable ? 'available' : 'missing'}, ` +
          `https: ${capabilities.secureContext}. Use the typed boxes instead.`,
      });
      return;
    }

    levelMovedRef.current = false;
    levelErrorRef.current = null;
    pendingTestErrorRef.current = null;
    setMicLevel(0);
    setMicTest({
      status: 'testing',
      detail: 'Say one word, then pause — the level bar should move while you speak.',
    });

    listenerRef.current?.stop();
    levelStopRef.current?.stop();
    levelStopRef.current = startMicLevel({
      onLevel: (level) => {
        setMicLevel(level);
        if (level > 0.04) levelMovedRef.current = true;
      },
      onError: (message) => {
        levelErrorRef.current = message;
      },
    });

    const finish = (status: 'ok' | 'fail', detail: string) => {
      levelStopRef.current?.stop();
      levelStopRef.current = null;
      setMicLevel(null);
      listenerRef.current = null;
      setMicTest({ status, detail });
    };

    const noAudioDetail =
      'No audio reached the page. Check Windows: Settings → Privacy → Microphone ' +
      '(allow apps to access the microphone), and your microphone device in the volume mixer.';

    listenerRef.current = listenOnce({
      lang: 'en-US',
      onInterim: (text) =>
        setMicTest((state) =>
          state.status === 'testing'
            ? { status: 'testing', detail: `Heard so far: "${text}" — keep going or pause.` }
            : state,
        ),
      onFinal: (text) => finish('ok', `Heard: "${text}" — your microphone works.`),
      onError: (code, message) => {
        // Retryable errors (no-speech, network, aborted) get one silent
        // retry inside listenOnce — wait for its outcome via onEnd.
        pendingTestErrorRef.current = { code, message };
      },
      onEnd: () => {
        if (levelErrorRef.current) {
          finish('fail', `${levelErrorRef.current} The browser cannot capture audio at all.`);
          return;
        }
        const pending = pendingTestErrorRef.current;
        if (pending?.code === 'no-speech') {
          if (levelMovedRef.current) {
            finish(
              'fail',
              "Microphone is working (the level bar moved), but Chrome's speech service heard nothing — " +
                'a Chrome-side problem. Try Microsoft Edge, or the typed boxes.',
            );
          } else {
            finish('fail', noAudioDetail);
          }
          return;
        }
        if (pending) {
          finish('fail', `${pending.message} (error code: ${pending.code})`);
          return;
        }
        if (levelMovedRef.current) {
          finish(
            'fail',
            'Microphone is working, but the recognition session ended without hearing anything — ' +
              'a Chrome-side problem. Try Microsoft Edge, or the typed boxes.',
          );
        } else {
          finish('fail', noAudioDetail);
        }
      },
    });
  };

  return {
    capabilities,
    your,
    them,
    autoFlow,
    setAutoFlow,
    transcript,
    copiedKey,
    micTest,
    micLevel,
    testMicrophone,
    setYourInput,
    setTheirInput,
    setYourError,
    setThemError,
    startYourMic,
    startTheirMic,
    stopListening,
    clearConversation,
    runYourTranslation,
    runTheirTranslation,
    copyText,
  };
}
