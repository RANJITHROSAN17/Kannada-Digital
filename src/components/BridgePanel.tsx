import {
  Check,
  Circle,
  Copy,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Square,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { speak } from '../services/speech';
import { useBridge } from '../hooks/useBridge';
import { Card, Chip, ScriptText, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

/**
 * Live microphone input level while the self-test runs. A flat bar while
 * speaking means no audio is reaching the page at all.
 */
function MicLevelBar({ level }: { level: number | null }) {
  const pct = Math.round((level ?? 0) * 100);
  const moving = level !== null && level > 0.04;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-75 ease-out',
          moving ? 'bg-leaf-500' : 'bg-ink-300',
        )}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Live caption while the microphone is open — the words appear as they are
 * recognised, like LiveBridge's caption panel. After a final result the
 * recognised sentence stays visible until the translation takes over.
 */
function LiveCaption({
  status,
  interim,
  input,
  script,
}: {
  status: 'idle' | 'listening' | 'translating' | 'done' | 'error';
  interim: string;
  input: string;
  script: 'en' | 'kn';
}) {
  if (status === 'listening') {
    return (
      <div className="mt-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          <Circle className="h-3 w-3 animate-ping fill-current" aria-hidden="true" />
          Listening — words appear here as you speak
        </p>
        <p className="mt-1.5 min-h-[2.75rem] text-base font-semibold leading-snug text-ink-800">
          {interim || <span className="font-normal italic text-ink-400">Start talking now…</span>}
        </p>
        <p className="mt-1 text-[10px] leading-snug text-rose-600/80">
          Tip: don't click anywhere else while speaking — Chrome stops listening when you do.
        </p>
      </div>
    );
  }
  if (status === 'translating' && input) {
    return (
      <div className="mt-2.5 rounded-2xl border border-ink-100 bg-ivory-50 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Heard</p>
        {script === 'kn' ? (
          <ScriptText size="lg" className="mt-1 block font-semibold text-ink-800">
            {input}
          </ScriptText>
        ) : (
          <p className="mt-1 text-base font-semibold text-ink-800">{input}</p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * The ಸಂವಿಧಾನ bridge UI, in two sizes:
 *  - `full`    — the `/bridge` page: capability dashboard, transcript, chips.
 *  - `compact` — embedded on the home page: the same two-way mic conversation
 *    without the extras, so "speak and hear" is one tap from the landing page.
 */

export const QUICK_SENTENCES = [
  'Where is the bus stand?',
  'What is the project status?',
  'How much for one kilo?',
  'I have fever since two days.',
  'Hello, nice to meet you.',
  'Thank you very much.',
];

interface BridgePanelProps {
  variant?: 'full' | 'compact';
  /** One-tap starter sentences; empty array hides the chips. */
  quickSentences?: string[];
}

export function BridgePanel({
  variant = 'full',
  quickSentences = QUICK_SENTENCES,
}: BridgePanelProps) {
  const {
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
  } = useBridge();

  const isFull = variant === 'full';
  const listeningSide =
    your.status === 'listening' ? 'you' : them.status === 'listening' ? 'them' : null;

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------- capability banner */}
      {isFull ? (
        <Card className="p-4">
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
      ) : (
        <StatusLine tone={capabilities.recognitionSupported ? 'info' : 'warn'}>
          {capabilities.recognitionSupported
            ? capabilities.secureContext
              ? 'Microphone ready — tap 🎤 and speak. If you allow it, the browser listens.'
              : 'Microphone needs https or localhost — or type below; the bridge still works.'
            : 'This browser has no speech recognition — type below; the bridge still works.'}
        </StatusLine>
      )}

      {/* --------------------------------------------------------- flow bar */}
      <Card className="flex flex-wrap items-center gap-3 p-3.5">
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
          <button
            type="button"
            className="btn-ghost !py-1.5 !text-xs !border-rose-200 !bg-rose-50 !text-rose-700"
            onClick={stopListening}
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Stop listening
          </button>
        ) : null}
        <button
          type="button"
          className="btn-ghost !py-1.5 !text-xs"
          onClick={testMicrophone}
          disabled={micTest.status === 'testing'}
        >
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          {micTest.status === 'testing' ? 'Testing microphone…' : 'Test microphone'}
        </button>
      </Card>

      {micTest.status !== 'idle' ? (
        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink-700">Microphone check</h2>
          {micTest.status === 'testing' ? (
            <div className="mt-2 space-y-2">
              <p className="text-[13px] leading-relaxed text-ink-500">{micTest.detail}</p>
              <MicLevelBar level={micLevel} />
            </div>
          ) : (
            <StatusLine tone={micTest.status === 'ok' ? 'good' : 'error'}>{micTest.detail}</StatusLine>
          )}
        </Card>
      ) : null}

      {/* ------------------------------------------------------------ your turn */}
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
            <p className="text-[11px] font-medium text-ink-400">
              {your.status === 'listening'
                ? 'Listening… speak now'
                : your.status === 'translating'
                  ? 'Translating…'
                  : 'Tap 🎤 or type below'}
            </p>
          </div>
        </div>

        <LiveCaption status={your.status} interim={your.interim} input={your.input} script="en" />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="field"
            placeholder="Type an English sentence…"
            value={your.input}
            onChange={(event) => setYourInput(event.target.value)}
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
                    setYourError('This browser has no audio engine to play the Kannada line.');
                  }
                }}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Play audio
              </button>
              <button
                type="button"
                className="btn-ghost !py-2"
                onClick={() => {
                  if (your.output) void copyText(your.output, 'you');
                }}
              >
                {copiedKey === 'you' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ------------------------------------------------------------ their turn */}
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
            <p className="text-[11px] font-medium text-ink-400">
              {them.status === 'listening'
                ? 'Listening in Kannada (kn-IN)…'
                : them.status === 'translating'
                  ? 'Translating…'
                  : 'Tap 🎤 or type below'}
            </p>
          </div>
        </div>

        <LiveCaption status={them.status} interim={them.interim} input={them.input} script="kn" />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="field"
            placeholder="Type their reply in Kannada…"
            value={them.input}
            onChange={(event) => setTheirInput(event.target.value)}
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
                    setThemError('This browser has no audio engine to play the reply.');
                  }
                }}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Play reply
              </button>
              <button
                type="button"
                className="btn-ghost !py-2"
                onClick={() => {
                  if (them.output) void copyText(them.output, 'them');
                }}
              >
                {copiedKey === 'them' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ------------------------------------------------- quick starters */}
      {quickSentences.length ? (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-saffron-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-ink-700">Start with the moment — one tap</h2>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {quickSentences.map((sentence) => (
              <button
                key={sentence}
                type="button"
                className="rounded-full border border-saffron-200 bg-saffron-50 px-3 py-1.5 text-xs font-semibold text-saffron-700 transition hover:bg-saffron-100"
                onClick={() => {
                  setYourInput(sentence);
                  void runYourTranslation(sentence);
                }}
              >
                {sentence}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {/* ---------------------------------------------------- transcript */}
      {isFull ? (
        <Card className="p-4">
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
                        <Chip tone="info" className="!text-[10px]">
                          via {entry.engine}
                        </Chip>
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
      ) : null}
    </div>
  );
}
