import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, CornerDownLeft, Languages, Sparkles, Volume2 } from 'lucide-react';
import { askAssistant, assistantMode, assistantLabel } from '../services/assistant';
import type { AssistantAnswer } from '../services/assistant';
import { phrases } from '../data/phrases';
import { PhraseCard } from './PhraseCard';
import { Card, Chip, StatusLine } from './ui';
import { speak } from '../services/speech';
import { translateToKannada } from '../services/translation';
import { romanizeKannada } from '../utils/romanize';

/**
 * "What do I say?" — ask in English, get real dataset answers.
 *
 * Works offline against the bundled phrasebook. When a developer configures
 * VITE_AI_PROXY_URL the same question is also sent to their proxy and the
 * reply is appended; every failure path falls back to the offline answer.
 */
export function AskWhatToSayBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [pending, setPending] = useState(false);
  const [live, setLive] = useState<{ kannada: string; roman: string; engine: string } | null>(null);
  const [livePending, setLivePending] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [copiedLive, setCopiedLive] = useState(false);

  const examples = [
    'where is the bus stand',
    'how much for one kilo',
    'I have fever since two days',
    'what is the project status',
  ];

  // A new question invalidates a previous live translation.
  useEffect(() => {
    setLive(null);
    setLiveError(null);
    setCopiedLive(false);
  }, [question]);

  /**
   * Live translation for sentences the reviewed phrasebook does not contain.
   * This is what makes "What is the project status?" work — the offline
   * retrieval is a starter set, not a dictionary.
   */
  const runLive = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLivePending(true);
    setLiveError(null);
    setLive(null);
    try {
      const result = await translateToKannada(trimmed);
      setLive({
        kannada: result.text,
        roman: romanizeKannada(result.text),
        engine: result.engine,
      });
    } catch (error) {
      setLiveError(
        error instanceof Error && error.message
          ? error.message
          : 'Live translation failed — check your network and try again.',
      );
    } finally {
      setLivePending(false);
    }
  };

  const playLive = () => {
    if (!live) return;
    const audio = speak(live.kannada, { rate: 0.82, fallbackText: live.roman });
    if (!audio.started) {
      setLiveError('This browser has no audio engine to play the Kannada line.');
    }
  };

  const copyLive = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(live.kannada);
      setCopiedLive(true);
      window.setTimeout(() => setCopiedLive(false), 1600);
    } catch {
      window.alert('Clipboard blocked by your browser. Long-press or select the text to copy it.');
    }
  };

  const run = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setAnswer({ mode: assistantMode, suggestions: [], guidance: 'Type what you are trying to say, in English.' });
      return;
    }
    setPending(true);
    try {
      setAnswer(await askAssistant(trimmed));
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-saffron-100 text-saffron-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink-800">What do I say?</h3>
            <p className="text-[11px] text-ink-400">Ask in English, get the Kannada line you need</p>
          </div>
        </div>
        <Chip tone={assistantMode === 'offline' ? 'good' : 'accent'}>
          {assistantMode === 'offline' ? 'Offline · no API key' : `AI proxy: ${assistantLabel}`}
        </Chip>
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <label htmlFor="ask-what-to-say" className="sr-only">
          Describe the situation in English
        </label>
        <input
          id="ask-what-to-say"
          className="field"
          placeholder="e.g. I want to ask where the washroom is"
          value={question}
          autoFocus={autoFocus}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" className="btn-primary sm:w-auto" disabled={pending}>
          {pending ? 'Searching…' : 'Find my line'}
          <CornerDownLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            className="rounded-full border border-ink-100 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-400 hover:border-saffron-300 hover:text-saffron-700"
            onClick={() => {
              setQuestion(example);
              void run(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>

      {answer ? (
        <div className="mt-4 space-y-3">
          <StatusLine tone={answer.suggestions.length ? 'info' : 'warn'}>
            {answer.guidance}
            {answer.degraded ? <span className="mt-1 block text-rose-700">{answer.degraded}</span> : null}
          </StatusLine>

          {answer.extra ? (
            <div className="rounded-xl border border-saffron-200 bg-saffron-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-saffron-700">From your AI proxy</p>
              <p className="mt-1 text-sm text-ink-700">{answer.extra}</p>
              <p className="mt-1.5 text-[11px] text-ink-400">
                Model output is not reviewed — verify any Kannada it writes with a native speaker before
                repeating it.
              </p>
            </div>
          ) : null}

          {answer.suggestions.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {answer.suggestions.map(({ phrase }) => (
                <li key={phrase.id}>
                  <PhraseCard phrase={phrase} compact />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <div className="rounded-xl border border-saffron-200 bg-saffron-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-saffron-700">
                  New sentence? Live translation
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
                  The phrasebook is a reviewed starter set ({phrases.length} lines). For any sentence it
                  does not contain — like “what is the project status” — translate it live. No API key.
                </p>
                {!live && !liveError ? (
                  <button
                    type="button"
                    className="btn-accent mt-3 !py-2"
                    onClick={() => void runLive()}
                    disabled={livePending || !question.trim()}
                  >
                    <Languages className="h-4 w-4" aria-hidden="true" />
                    {livePending ? 'Translating…' : 'Translate this live to Kannada'}
                  </button>
                ) : null}
                {live ? (
                  <div className="mt-3 rounded-xl border border-ink-100 bg-white p-3.5">
                    <p className="knn text-xl font-semibold text-ink-800" lang="kn">
                      {live.kannada}
                    </p>
                    <p className="mt-1 text-sm font-medium italic text-ink-400">≈ {live.roman}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" className="btn-primary !py-2" onClick={playLive}>
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                        Play Kannada audio
                      </button>
                      <Chip tone="info">via {live.engine}</Chip>
                      <button type="button" className="btn-ghost !py-2" onClick={() => void copyLive()}>
                        {copiedLive ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copy
                      </button>
                    </div>
                    <p className="mt-2.5 text-[11px] leading-relaxed text-ink-400">
                      Machine translation — the romanisation is approximate. Verify with a native speaker
                      before repeating an important line.
                    </p>
                  </div>
                ) : null}
                {liveError ? (
                  <div className="mt-2">
                    <StatusLine tone="error">{liveError}</StatusLine>
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-[13px] text-ink-400">
                Or{' '}
                <Link to="/phrasebook" className="link">
                  browse the phrasebook
                </Link>{' '}
                for reviewed everyday lines that work offline.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}
