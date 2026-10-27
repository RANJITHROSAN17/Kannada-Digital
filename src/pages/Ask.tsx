import { useState, type FormEvent } from 'react';
import { Lightbulb, Search, WandSparkles } from 'lucide-react';
import { answerInEnglish, type AssistantAnswer } from '../lib/search';
import { PhraseCard } from '../components/PhraseCard';
import { speak } from '../lib/speech';

const EXAMPLES = [
  'How much does this cost?',
  'I have a fever',
  'Which bus goes to Mysuru?',
  'I am lost',
  'Please make it less spicy',
  'Do you take UPI?',
  'Please speak slowly',
];

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [searched, setSearched] = useState(false);

  const run = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setAnswer(answerInEnglish(trimmed));
    setSearched(true);
  };

  const submit = (event: FormEvent) => { event.preventDefault(); run(query); };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-ink-800">Ask in English</h1>
        <p className="mt-1 text-sm text-ink-500">
          Describe what you need to say. The offline assistant retrieves the most useful Kannada
          sentence from the bundled phrasebook — no API key, no internet, no data leaving your device.
        </p>
      </header>

      <form onSubmit={submit} className="card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. how do I ask the price?"
            className="w-full rounded-xl border border-ivory-300 bg-white py-3 pl-10 pr-3 text-sm"
            aria-label="Describe what you want to say"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={!query.trim()}>
          <WandSparkles className="h-4 w-4" /> Find a phrase
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => run(example)} className="chip hover:border-saffron-400 hover:text-saffron-700">
            {example}
          </button>
        ))}
      </div>

      {!searched && (
        <section className="card flex items-start gap-3 p-5">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-saffron-500" />
          <div>
            <h2 className="text-sm font-bold text-ink-800">How it works</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              Your question is matched against twelve everyday intents (price, transport, health,
              food, directions, help, and more) and then ranked against {64} curated phrases using
              keyword, transliteration and Kannada-script signals. It is deliberately small and
              auditable — a native speaker can improve the answers by editing{' '}
              <code className="rounded bg-ivory-100 px-1 text-xs">src/data/phrases.ts</code>.
            </p>
          </div>
        </section>
      )}

      {searched && !answer && (
        <section className="card p-6 text-center">
          <p className="text-sm font-semibold text-ink-700">No confident match for “{query}”.</p>
          <p className="mt-1 text-sm text-ink-500">Try a shorter phrase, or browse the situation cards instead.</p>
        </section>
      )}

      {answer && (
        <div className="animate-fade-up space-y-4" aria-live="polite">
          <p className="text-sm text-ink-500">
            For <span className="font-semibold text-ink-700">{query}</span> — you are <strong>{answer.hint}</strong>. Say:
          </p>
          <PhraseCard phrase={answer.phrase} showSituation />
          {answer.alternatives.length > 0 && (
            <section>
              <h2 className="label mb-2">Also useful</h2>
              <div className="space-y-2">
                {answer.alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => speak(alt.kn)}
                    className="card flex w-full items-center justify-between gap-3 p-3 text-left transition hover:border-saffron-400"
                  >
                    <span>
                      <span lang="kn" className="font-kannada block text-base font-semibold text-ink-800">{alt.kn}</span>
                      <span className="block text-xs text-saffron-700">{alt.rom}</span>
                      <span className="block text-xs text-ink-500">{alt.en}</span>
                    </span>
                    <span className="btn-icon shrink-0"><span className="sr-only">Play</span>▶</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
