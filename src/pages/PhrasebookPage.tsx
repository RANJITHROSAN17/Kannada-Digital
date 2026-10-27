import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, History, SearchX, SlidersHorizontal, Star } from 'lucide-react';
import { phrases } from '../data/phrases';
import { categories } from '../data/categories';
import { searchPhrases } from '../utils/search';
import type { CategoryId } from '../types';
import { PhraseCard } from '../components/PhraseCard';
import { Card, Chip, EmptyState, SectionHeading } from '../components/ui';
import { useProgress } from '../hooks/useProgress';
import { cn } from '../utils/cn';

type SortMode = 'relevance' | 'category' | 'shortest';

export function PhrasebookPage() {
  const progress = useProgress();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const scored = searchPhrases(deferredQuery, phrases, {
      category,
      onlyFavorites,
      favorites: progress.favorites,
    });
    if (sort === 'shortest') {
      return scored.slice().sort((a, b) => a.phrase.kannada.length - b.phrase.kannada.length);
    }
    if (sort === 'category') {
      const order = categories.map((item) => item.id);
      return scored
        .slice()
        .sort(
          (a, b) =>
            order.indexOf(a.phrase.category) - order.indexOf(b.phrase.category) || b.score - a.score,
        );
    }
    return scored;
  }, [deferredQuery, category, onlyFavorites, progress.favorites, sort]);

  const visible = showAll ? results : results.slice(0, 24);
  const recent = useMemo(
    () =>
      progress.recent
        .map((id) => phrases.find((phrase) => phrase.id === id))
        .filter((phrase): phrase is (typeof phrases)[number] => Boolean(phrase)),
    [progress.recent],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow={`${phrases.length} reviewed lines`}
        title="Searchable phrasebook"
        description="Search Kannada script, transliteration, English meaning or any keyword. Results rank the meaning match first."
      />

      <Card className="sticky top-[72px] z-30 mb-5 p-3 sm:p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <div className="relative flex-1">
            <label htmlFor="phrase-search" className="sr-only">
              Search phrases
            </label>
            <input
              id="phrase-search"
              type="search"
              className="field !pl-9"
              placeholder="Try “water”, “nildana”, “how much”, “ಎಷ್ಟು”"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowAll(false);
              }}
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="phrase-cat" className="sr-only">
              Filter by situation
            </label>
            <select
              id="phrase-cat"
              className="field !w-auto !py-2.5"
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryId | 'all')}
            >
              <option value="all">All situations</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <label htmlFor="phrase-sort" className="sr-only">
              Sort results
            </label>
            <select
              id="phrase-sort"
              className="field !w-auto !py-2.5"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
            >
              <option value="relevance">Relevance</option>
              <option value="category">By situation</option>
              <option value="shortest">Shortest first</option>
            </select>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={onlyFavorites}
            onClick={() => setOnlyFavorites((value) => !value)}
            className={cn(
              'chip transition',
              onlyFavorites
                ? 'border-saffron-300 bg-saffron-50 text-saffron-700'
                : 'border-ink-100 bg-white text-ink-400 hover:text-ink-700',
            )}
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            My favourites {progress.favorites.length ? `(${progress.favorites.length})` : ''}
          </button>

          {categories.map((item) => {
            const count = phrases.filter((phrase) => phrase.category === item.id).length;
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(active ? 'all' : item.id)}
                className={cn(
                  'chip transition',
                  active
                    ? 'border-ink-600 bg-ink-800 text-ivory-50'
                    : 'border-ink-100 bg-white text-ink-400 hover:text-ink-700',
                )}
              >
                {item.title}
                <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}

          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-400">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {results.length} result{results.length === 1 ? '' : 's'}
          </span>
        </div>
      </Card>

      {visible.length ? (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {visible.map(({ phrase, matchedOn, score }) => (
              <li key={phrase.id}>
                <PhraseCard
                  phrase={phrase}
                  query={deferredQuery}
                  footer={
                    deferredQuery.trim() ? (
                      <p className="text-[11px] text-ink-400">
                        Matched on <span className="font-semibold text-ink-500">{matchedOn}</span>
                        {score > 0 ? ` · score ${score}` : ''}
                      </p>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
          {!showAll && results.length > visible.length ? (
            <div className="mt-5 text-center">
              <button type="button" className="btn-ghost" onClick={() => setShowAll(true)}>
                Show all {results.length} results
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="No phrase matches that yet"
          description={
            onlyFavorites && !progress.favorites.length
              ? 'You have not saved any favourites. Open a phrase card and tap the bookmark — it stays on this device.'
              : 'Try a shorter word like “bus”, “water”, “price”, “fever” or “where”, or clear the situation filter.'
          }
          action={
            <button
              type="button"
              className="btn-primary mt-1"
              onClick={() => {
                setQuery('');
                setCategory('all');
                setOnlyFavorites(false);
              }}
            >
              Reset filters
            </button>
          }
        />
      )}

      {recent.length ? (
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-400">
            <History className="h-4 w-4" aria-hidden="true" />
            Recently viewed
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((phrase) => (
              <Chip key={phrase.id} tone="info" className="!py-1.5">
                <BookOpen className="h-3 w-3 text-saffron-600" aria-hidden="true" />
                <span className="knn">{phrase.kannada}</span>
              </Chip>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Looking for a saved line?{' '}
            <Link to="/favorites" className="link">
              Open My Favorites
            </Link>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
