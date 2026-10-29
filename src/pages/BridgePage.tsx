import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Circle,
  Copy,
  Info,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Square,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { detectCapabilities, listenOnce, speak, stopSpeaking } from '../services/speech';
import {
  translateToEnglish,
  translateToKannada,
  type TranslationEngine,
} from '../services/translation';
import { romanizeKannada } from '../utils/romanize';
import { Card, Chip, SectionHeading, ScriptText, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

/**
 * ಸಂವಿಧಾನ — Live Bridge.
 *
 * The bridge between two people who do not share a language:
 *
 *   1. You speak English (or type it). The app translates it and plays the
 *      Kannada line out loud so the other person hears it in their language.
 *   2. They reply in Kannada. The app listens, translates to English and plays
 *      it back, so you hear — and read — the answer in your language.
 *
 * Every sentence works, not just reviewed phrases: translation runs live
 * (Google → MyMemory, no API key). The typed boxes keep the whole bridge
 * usable in browsers without speech recognition.
 */

type Side = 'you' | 'them';

interface SideState {
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

interface TranscriptEntry {
  id: number;
  side: Side;
  text: string;
  roman?: string;
  engine?: TranslationEngine;
}

const initialSide: SideState = { input: '', interim: '', status: 'idle' };

/** One-tap starter sentences — straight from the everyday situations. */
const QUICK_SENTENCES = [
  'Where is the bus stand?',
  'What is the project status?',
  'How much for one kilo?',
  'I have fever since two days.',
  'Hello, nice to meet you.',
  'Thank you very much.',
];

export function BridgePage() {
  const [capabilities] = useState(() => detectCapabilities());
  const [your, setYour] = useState<SideState>(initialSide);
  const [them, setThem] = useState<SideState>(initialSide);
  const [autoFlow, setAutoFlow] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const listenerRef = useRef<{ stop: () => void } | null>(null);
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
      stopSpeaking();
    },
    [],
  );

  /* ------------------------------------------------------------- helpers */

  const canMic =
    capabilities.recognitionSupported &&
    capabilities.microphoneAvailable &&
    capabilities.secureContext;

  const pushTranscript = (side: Side, text: string, roman?: string, engine?: TranslationEngine) => {
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
    setYour((state) => ({ ...state, status: state.status === 'listening' ? 'idle' : state.status, interim: '' }));
    setThem((state) => ({ ...state, status: state.status === 'listening' ? 'idle' : state.status, interim: '' }));
  };

  const clearConversation = () => {
    stopListening();
    setYour({ ...initialSide });
    setThem({ ...initialSide });
    setTranscript([]);
  };

  /* ----------------------------------------------------------- your side */

  const startYourMic = () => {
    if (your.status === 'listening') {
      stopListening();
      return;
    }
    if (!canMic) {
      setYour((state) => ({
        ...state,
        status: 'error',
        error: 'This browser cannot listen (no speech recognition, no mic, or not on https). Type the sentence below — the bridge works the same.',
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
      onError: (_code, message) => {
        setYour((state) => ({ ...state, status: 'error', error: message, interim: '' }));
      },
    });
  };

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

  /* ----------------------------------------------------------- their side */

  const startTheirMic = () => {
    if (them.status === 'listening') {
      stopListening();
      return;
    }
    if (!canMic) {
      setThem((state) => ({
        ...state,
        status: 'error',
        error: 'This browser cannot listen (no speech recognition, no mic, or not on https). Type their reply below — it still translates.',
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
      onError: (_code, message) => {
        setThem((state) => ({ ...state, status: 'error', error: message, interim: '' }));
      },
    });
  };

  const runTheirTranslation = async (text?: string) => {
    const input = (text ?? them.input).trim();
    if (!input) {
      setThem((state) => ({ ...state, status: 'error', error: 'Listen to their reply first, or type it in Kannada.' }));
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

  /* ------------------------------------------------------------- render */

  const listeningSide: Side | null = your.status === 'listening' ? 'you' : them.status === 'listening' ? 'them' : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading
        level="h1"
        eyebrow="Live bridge · ಸಂವಿಧಾನ"
        title="Speak your language, hear theirs"
        description="Talk in English — the app plays it in Kannada audio so the other person hears it. They reply in Kannada — you hear it back in English. Every sentence works, not just the phrasebook."
        action={
          <Link to="/practice" className="btn-ghost !py-2">
            <Mic className="h-4 w-4" aria-hidden="true" />
            Practice instead
          </Link>
        }
      />

      {/* ------------------------------------------------- capability banner */}
      <Card className="mb-5 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400">
          <ShieldCheck className="h-4 w-4 text-leaf-500" aria-hidden="true" />
          What this browser can do
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            {
              ok: capabilities.recognitionSupported,
              label: 'Speech recognition',
              detail: capabilities.recognitionSupported
                ? 'Available — your browser sends audio to its own speech service.'
                : 'Not in this browser — use the typed boxes; nothing else changes.',
            },
            {
              ok: capabilities.microphoneAvailable && capabilities.secureContext,
              label: 'Microphone',
              detail: !capabilities.secureContext
                ? 'Needs https or localhost.'
                : capabilities.microphoneAvailable
                  ? 'Available — allow it when asked.'
                  : 'getUserMedia not available here.',
            },
            {
              ok: capabilities.ttsSupported,
              label: 'Audio playback',
              detail: capabilities.kannadaVoiceAvailable
                ? `Kannada voice found: ${capabilities.kannadaVoiceName}`
                : capabilities.ttsSupported
                  ? 'No system Kannada voice — playback uses the romanisation.'
                  : 'No speech engine — read the text aloud yourself.',
            },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2 rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                  item.ok ? 'bg-leaf-500' : 'bg-amber-400',
                )}
              >
                {item.ok ? (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6.5 4.5 9 10 3" />
                  </svg>
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-ink-700">{item.label}</span>
                <span className="block text-[11px] leading-snug text-ink-400">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* --------------------------------------------------------- flow bar */}
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-3.5">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-saffron-500"
            checked={autoFlow}
            onChange={(event) => setAutoFlow(event.target.checked)}
          />
          Auto-continue — after the Kannada audio, listen for their reply
        </label>
        <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={clearConversation}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Clear conversation
        </button>
        {listeningSide ? (
          <button type="button" className="btn-ghost !py-1.5 !text-xs !border-rose-200 !bg-rose-50 !text-rose-700" onClick={stopListening}>
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Stop listening
          </button>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------------------------------------------ your turn */}
        <Card className="flex flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink-700">You talk — English</h2>
            <Chip tone="info">your side</Chip>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">
            Tap the mic and speak, or type. Every new sentence is translated live — “What is the project
            status?” works even though it is not in the phrasebook.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className={cn(
                'btn h-12 w-12 shrink-0 !rounded-full !p-0 shadow-card',
                your.status === 'listening'
                  ? '!bg-rose-600 !text-white animate-pulse-ring'
                  : '!bg-ink-800 !text-ivory-50',
              )}
              onClick={startYourMic}
              aria-label={your.status === 'listening' ? 'Stop listening' : 'Speak English'}
              title={your.status === 'listening' ? 'Stop listening' : 'Speak English'}
            >
              {your.status === 'listening' ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              {your.status === 'listening' && your.interim ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <Circle className="h-2.5 w-2.5 animate-ping fill-current" aria-hidden="true" />
                  {your.interim}
                </p>
              ) : null}
              <p className="text-[11px] font-medium text-ink-400">
                {your.status === 'listening' ? 'Listening… speak now' : your.status === 'translating' ? 'Translating…' : 'Tap 🎤 or type below'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="field"
              placeholder="Type an English sentence…"
              value={your.input}
              onChange={(event) => setYour((state) => ({ ...state, input: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void runYourTranslation();
              }}
            />
            <button
              type="button"
              className="btn-accent sm:w-auto"
              onClick={() => void runYourTranslation()}
              disabled={your.status === 'translating'}
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              Kannada line
            </button>
          </div>

          {your.status === 'error' && your.error ? (
            <StatusLine tone="error">
              <MicOff className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              {your.error}
            </StatusLine>
          ) : null}

          {your.output ? (
            <div className="mt-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <Chip tone="accent">Kannada audio — they hear this</Chip>
                {your.engine && your.engine !== 'identity' ? (
                  <Chip tone="info">via {your.engine}</Chip>
                ) : null}
              </div>
              <ScriptText size="lg" className="mt-2 block text-ink-800">
                {your.output}
              </ScriptText>
              {your.roman ? (
                <p className="mt-1 text-sm font-medium italic text-ink-400">≈ {your.roman}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary !py-2"
                  onClick={() => {
                    const text = your.output;
                    if (!text) return;
                    const audio = speak(text, { rate: 0.82, fallbackText: your.roman });
                    if (!audio.started) {
                      setYour((state) => ({ ...state, error: 'This browser has no audio engine to play the Kannada line.' }));
                    }
                  }}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Play audio
                </button>
                <button type="button" className="btn-ghost !py-2" onClick={() => { if (your.output) void copyText(your.output, 'you'); }}>
                  {copiedKey === 'you' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        {/* ------------------------------------------------------ their turn */}
        <Card className="flex flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink-700">They reply — Kannada</h2>
            <Chip tone="accent">their side</Chip>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">
            Hand over the phone, tap the mic and let them answer in Kannada. You hear the reply in English.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className={cn(
                'btn h-12 w-12 shrink-0 !rounded-full !p-0 shadow-card',
                them.status === 'listening'
                  ? '!bg-rose-600 !text-white animate-pulse-ring'
                  : '!bg-ink-800 !text-ivory-50',
              )}
              onClick={startTheirMic}
              aria-label={them.status === 'listening' ? 'Stop listening' : 'Listen for their Kannada reply'}
              title={them.status === 'listening' ? 'Stop listening' : 'Listen for their Kannada reply'}
            >
              {them.status === 'listening' ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              {them.status === 'listening' && them.interim ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <Circle className="h-2.5 w-2.5 animate-ping fill-current" aria-hidden="true" />
                  {them.interim}
                </p>
              ) : null}
              <p className="text-[11px] font-medium text-ink-400">
                {them.status === 'listening' ? 'Listening in Kannada (kn-IN)…' : them.status === 'translating' ? 'Translating…' : 'Tap 🎤 or type below'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="field"
              placeholder="Type their reply in Kannada…"
              value={them.input}
              onChange={(event) => setThem((state) => ({ ...state, input: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void runTheirTranslation();
              }}
            />
            <button
              type="button"
              className="btn-accent sm:w-auto"
              onClick={() => void runTheirTranslation()}
              disabled={them.status === 'translating'}
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              English for you
            </button>
          </div>

          {them.status === 'error' && them.error ? (
            <StatusLine tone="error">
              <MicOff className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              {them.error}
            </StatusLine>
          ) : null}

          {them.output ? (
            <div className="mt-3 rounded-2xl border border-leaf-500/30 bg-leaf-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <Chip tone="good">You hear — English</Chip>
                {them.engine && them.engine !== 'identity' ? (
                  <Chip tone="info">via {them.engine}</Chip>
                ) : null}
              </div>
              <p className="mt-2 text-lg font-semibold text-ink-800">{them.output}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary !py-2"
                  onClick={() => {
                    const text = them.output;
                    if (!text) return;
                    const audio = speak(text, { preferKannada: false, rate: 0.9 });
                    if (!audio.started) {
                      setThem((state) => ({ ...state, error: 'This browser has no audio engine to play the reply.' }));
                    }
                  }}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Play reply
                </button>
                <button type="button" className="btn-ghost !py-2" onClick={() => { if (them.output) void copyText(them.output, 'them'); }}>
                  {copiedKey === 'them' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* ------------------------------------------------- quick starters */}
      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-saffron-600" aria-hidden="true" />
          <h2 className="text-sm font-bold text-ink-700">Start with the moment — one tap</h2>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {QUICK_SENTENCES.map((sentence) => (
            <button
              key={sentence}
              type="button"
              className="rounded-full border border-saffron-200 bg-saffron-50 px-3 py-1.5 text-xs font-semibold text-saffron-700 transition hover:bg-saffron-100"
              onClick={() => {
                setYour((state) => ({ ...state, input: sentence }));
                void runYourTranslation(sentence);
              }}
            >
              {sentence}
            </button>
          ))}
        </div>
      </Card>

      {/* ---------------------------------------------------- transcript */}
      <Card className="mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-700">This conversation</h2>
          {transcript.length ? (
            <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={clearConversation}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
        {transcript.length ? (
          <ul className="scroll-slim mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {transcript.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3 py-2.5',
                  entry.side === 'you' ? 'border-ink-100 bg-ivory-50' : 'border-leaf-500/30 bg-leaf-100',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                    entry.side === 'you' ? 'bg-ink-800 text-ivory-50' : 'bg-leaf-500 text-white',
                  )}
                  aria-hidden="true"
                >
                  {entry.side === 'you' ? 'You' : 'ಅವರು'}
                </span>
                <div className="min-w-0 flex-1">
                  {entry.side === 'you' ? (
                    <ScriptText size="sm" className="block font-semibold text-ink-800">
                      {entry.text}
                    </ScriptText>
                  ) : (
                    <p className="text-sm font-semibold text-ink-800">{entry.text}</p>
                  )}
                  {entry.roman ? (
                    <p className="mt-0.5 text-[11px] font-medium italic text-ink-400">≈ {entry.roman}</p>
                  ) : null}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {entry.engine && entry.engine !== 'identity' ? (
                      <Chip tone="info" className="!text-[10px]">via {entry.engine}</Chip>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-ink-100 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-500 hover:text-saffron-700"
                      onClick={() => {
                        const audio = speak(entry.text, {
                          rate: 0.82,
                          preferKannada: entry.side === 'them',
                          fallbackText: entry.roman,
                        });
                        if (!audio.started) {
                          window.alert('This browser has no audio engine to play this line.');
                        }
                      }}
                    >
                      <Volume2 className="h-3 w-3" aria-hidden="true" />
                      Play
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-400">
            Nothing yet. This log only lives in this tab — refresh and start a fresh bridge. (Refreshing is
            safe: your favourites and progress are stored on this device.)
          </p>
        )}
      </Card>

      {/* ------------------------------------------------------- honesty notes */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-ink-400">
            Live translation needs the internet and falls back through two free engines (no API key). If
            both fail, the bridge says so instead of guessing. The phrasebook, situations and practice keep
            working with zero network.
          </p>
        </Card>
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-ink-400">
            Live-translated Kannada is machine output — the romanisation is approximate. Keep{' '}
            <span className="knn font-semibold" lang="kn">ನೀವು</span> forms with anyone older, and confirm
            an important line with a native speaker before relying on it.
          </p>
        </Card>
      </div>
    </div>
  );
}
