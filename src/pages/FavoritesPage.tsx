import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, Star, Trash2 } from 'lucide-react';
import { phrases } from '../data/phrases';
import { categories } from '../data/categories';
import { PhraseCard } from '../components/PhraseCard';
import { Card, EmptyState, SectionHeading } from '../components/ui';
import { useProgress } from '../hooks/useProgress';

export function FavoritesPage() {
  const progress = useProgress();

  const grouped = useMemo(() => {
    const saved = progress.favorites
      .map((id) => phrases.find((phrase) => phrase.id === id))
      .filter((phrase): phrase is (typeof phrases)[number] => Boolean(phrase));
    return categories
      .map((category) => ({
        category,
        items: saved.filter((phrase) => phrase.category === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [progress.favorites]);

  const savedCount = grouped.reduce((sum, group) => sum + group.items.length, 0);

  const asText = () =>
    grouped
      .map(
        (group) =>
          `${group.category.title.toUpperCase()} — ${group.category.kannadaTitle}\n` +
          group.items
            .map((phrase) => `• ${phrase.kannada}\n  ${phrase.transliteration}\n  ${phrase.english}`)
            .join('\n'),
      )
      .join('\n\n');

  const download = () => {
    const blob = new Blob([asText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kannada-saathi-favourites.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(asText());
    } catch {
      window.alert('Your browser blocked clipboard access. Use “Save as .txt” instead.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow="Saved on this device"
        title="My Favorites"
        description={
          savedCount
            ? `${savedCount} phrase${savedCount === 1 ? '' : 's'} kept for the moments you know are coming.`
            : 'Bookmark any phrase and it waits for you here — no account, no server.'
        }
        action={
          savedCount ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost !py-2" onClick={() => void copyAll()}>
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Copy all
              </button>
              <button type="button" className="btn-ghost !py-2" onClick={download}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Save as .txt
              </button>
              <button
                type="button"
                className="btn-ghost !py-2 !text-rose-700 hover:!bg-rose-50"
                onClick={() => {
                  if (window.confirm('Remove all saved phrases from this device?')) {
                    progress.favorites.forEach((id) => progress.toggleFavorite(id));
                  }
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          ) : null
        }
      />

      {savedCount ? (
        <div className="space-y-6">
          {grouped.map(({ category, items }) => (
            <section key={category.id}>
              <Card className="mb-3 flex flex-wrap items-center justify-between gap-2 border-ink-100 bg-ivory-50 px-4 py-2.5">
                <h2 className="flex items-baseline gap-2 text-sm font-bold text-ink-700">
                  {category.title}
                  <span className="knn text-[13px] font-medium text-saffron-700" lang="kn">
                    {category.kannadaTitle}
                  </span>
                </h2>
                <span className="text-[11px] font-semibold text-ink-400">
                  {items.length} saved
                  <Link to={`/situations/${category.id}`} className="ml-2 text-saffron-700 hover:underline">
                    open situation
                  </Link>
                </span>
              </Card>
              <ul className="grid gap-3 md:grid-cols-2">
                {items.map((phrase) => (
                  <li key={phrase.id}>
                    <PhraseCard phrase={phrase} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No favourites yet"
          description="Tap the bookmark on any phrase — in a situation, in the phrasebook or from a search. They persist here after a refresh, stored in this browser only."
          action={
            <Link to="/situations" className="btn-primary mt-1">
              Browse situations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      )}
    </div>
  );
}
