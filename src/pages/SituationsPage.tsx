import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Landmark, MessagesSquare, Search } from 'lucide-react';
import { categories, getCategory } from '../data/categories';
import { phrases } from '../data/phrases';
import { culturalNotes } from '../data/culture';
import { conversations } from '../data/conversations';
import { ScenarioCard } from '../components/ScenarioCard';
import { PhraseCard } from '../components/PhraseCard';
import { AskWhatToSayBox } from '../components/AskWhatToSayBox';
import { Card, Chip, EmptyState, SectionHeading } from '../components/ui';
import { useProgress } from '../hooks/useProgress';

/** Grid of all eight situations. */
export function SituationsPage() {
  const progress = useProgress();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow="Situation first"
        title="Pick the moment you are about to face"
        description="Each situation holds the sentences that actually end the interaction — asked, answered, done."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <ScenarioCard
            key={category.id}
            category={category}
            touched={progress.categoryActivity[category.id] ?? 0}
          />
        ))}
      </div>
      <div className="mt-8">
        <AskWhatToSayBox />
      </div>
    </div>
  );
}

/** One situation: its phrases, related role-play scene and cultural notes. */
export function SituationDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find((item) => item.id === categoryId);

  const scoped = useMemo(
    () => phrases.filter((phrase) => phrase.category === category?.id),
    [category?.id],
  );
  const relatedScenes = useMemo(
    () => conversations.filter((scenario) => scenario.category === category?.id),
    [category?.id],
  );
  const notes = useMemo(() => {
    if (!category) return [];
    const words = category.title.toLowerCase().split(/[\s&]+/);
    return culturalNotes.filter((note) =>
      words.some((word) => word.length > 3 && `${note.title} ${note.body}`.toLowerCase().includes(word)),
    );
  }, [category]);

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="That situation does not exist"
          description="The link may be stale. All eight everyday situations are listed on the Situations page."
          action={
            <Link to="/situations" className="btn-primary mt-1">
              Back to situations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      </div>
    );
  }

  const meta = getCategory(category.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Link
        to="/situations"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All situations
      </Link>

      <header className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-extrabold text-ink-800 sm:text-3xl">{meta.title}</h1>
            <p className="knn mt-1 text-lg text-saffron-700" lang="kn">
              {meta.kannadaTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{meta.blurb}</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Chip tone="accent">{scoped.length} phrases</Chip>
            {relatedScenes.length ? (
              <Link to={`/conversations/${relatedScenes[0].id}`} className="btn-accent !py-2">
                <MessagesSquare className="h-4 w-4" aria-hidden="true" />
                Role-play this
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Phrases in this situation
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {scoped.map((phrase) => (
            <li key={phrase.id}>
              <PhraseCard phrase={phrase} />
            </li>
          ))}
        </ul>
      </section>

      {relatedScenes.length ? (
        <section className="mt-8">
          <SectionHeading title="Practise it as a conversation" description="Rehearse the same situation end to end." />
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedScenes.map((scenario) => (
              <Link
                key={scenario.id}
                to={`/conversations/${scenario.id}`}
                className="card flex items-center justify-between gap-3 p-4 text-left transition hover:shadow-lift"
              >
                <span>
                  <span className="block text-sm font-bold text-ink-800">{scenario.title}</span>
                  <span className="knn block text-sm text-ink-400" lang="kn">
                    {scenario.kannadaTitle}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-saffron-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {notes.length ? (
        <section className="mt-8">
          <SectionHeading
            title="Context that makes it land"
            description="Etiquette and speech notes for this situation, not decoration."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink-800">
                  <Landmark className="h-4 w-4 text-saffron-500" aria-hidden="true" />
                  {note.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{note.body}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
