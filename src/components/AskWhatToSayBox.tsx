import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import { askAssistant, assistantMode, assistantLabel } from '../services/assistant';
import type { AssistantAnswer } from '../services/assistant';
import { phrases } from '../data/phrases';
import { PhraseCard } from './PhraseCard';
import { Card, Chip, StatusLine } from './ui';

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

  const examples = ['where is the bus stand', 'how much for one kilo', 'I have fever since two days'];

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
            <p className="text-sm text-ink-400">
              No match in the {phrases.length}-phrase starter set.{' '}
              <Link to="/phrasebook" className="link">
                Browse the phrasebook
              </Link>{' '}
              instead.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
