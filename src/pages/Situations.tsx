import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SITUATIONS } from '../data/phrases';
import { searchPhrases } from '../lib/search';
import { SituationCard } from '../components/SituationCard';
import { PhraseCard } from '../components/PhraseCard';

export default function SituationsPage() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => searchPhrases(query, 12), [query]);
  const visibleSituations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SITUATIONS;
    return SITUATIONS.filter((situation) =>
      [situation.title, situation.knTitle, situation.blurb].join(' ').toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-2xl font-bold text-ink-800">Everyday situations</h1>
        <p className="mt-1 text-sm text-ink-500">
          {SITUATIONS.length} moments · search by what you need to say, in English or Kannada.
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “how much”, “bus”, “fever”, “ನೀರು”…"
          className="w-full rounded-2xl border border-ivory-300 bg-white py-3.5 pl-11 pr-11 text-sm text-ink-800 shadow-card placeholder:text-ink-400 focus:border-saffron-400"
          aria-label="Search phrases and situations"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:bg-ivory-100" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim() && (
        <section aria-live="polite">
          <h2 className="mb-3 text-sm font-bold text-ink-600">
            {matches.length ? `${matches.length} phrase${matches.length === 1 ? '' : 's'} matching “${query}”` : 'No phrase matches'}
          </h2>
          {matches.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {matches.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} showSituation compact />)}
            </div>
          ) : (
            <p className="card p-5 text-sm text-ink-500">
              Nothing found. Try a simple English need like “I am lost” or “how much” — or use the{' '}
              <a href="#/ask" className="font-semibold text-saffron-700 underline">Ask in English</a> assistant.
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-600">All situations</h2>
        {visibleSituations.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSituations.map((situation) => <SituationCard key={situation.id} situation={situation} />)}
          </div>
        ) : (
          <p className="card p-5 text-sm text-ink-500">No situation matches that name.</p>
        )}
      </section>
    </div>
  );
}
