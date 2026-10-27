import { Link } from 'react-router-dom';
import { BookOpenCheck, Flame, RotateCcw, Star, Target, Trash2 } from 'lucide-react';
import { PHRASE_BY_ID, PHRASES } from '../data/phrases';
import { useProgress } from '../components/ProgressContext';
import { PhraseCard } from '../components/PhraseCard';

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
      <Link to="/situations" className="btn-soft mt-4">Browse situations</Link>
    </div>
  );
}

export default function SavedPage() {
  const { progress, reset } = useProgress();
  const favourites = progress.favourites.map((id) => PHRASE_BY_ID[id]).filter(Boolean);
  const learned = progress.learned.map((id) => PHRASE_BY_ID[id]).filter(Boolean);

  const doReset = () => {
    if (window.confirm('Reset all progress, favourites and quiz scores on this device?')) reset();
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Your progress</h1>
          <p className="mt-1 text-sm text-ink-500">Saved privately in this browser. Nothing is sent anywhere.</p>
        </div>
        <button type="button" onClick={doReset} className="chip hover:border-rose-300 hover:text-rose-600">
          <Trash2 className="h-3.5 w-3.5" /> Reset progress
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Flame, value: `${progress.streak}d`, label: 'Streak' },
          { icon: BookOpenCheck, value: `${learned.length}/${PHRASES.length}`, label: 'Phrases learned' },
          { icon: Target, value: `${progress.bestQuiz}%`, label: 'Best quiz' },
          { icon: Star, value: progress.quizAttempts, label: 'Quiz attempts' },
        ].map(({ icon: IconComponent, value, label }) => (
          <div key={label} className="card p-4">
            <IconComponent className="h-4 w-4 text-saffron-500" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold text-ink-800">{value}</p>
            <p className="text-xs text-ink-400">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-800">
          <Star className="h-4 w-4 text-rose-500" /> Saved phrases ({favourites.length})
        </h2>
        {favourites.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {favourites.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} showSituation compact />)}
          </div>
        ) : <EmptyState title="Nothing saved yet" text="Tap Save on any phrase card to keep it here for quick revision." />}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-800">
          <BookOpenCheck className="h-4 w-4 text-leaf-600" /> Marked as learned ({learned.length})
        </h2>
        {learned.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {learned.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} showSituation compact />)}
          </div>
        ) : <EmptyState title="No phrases marked yet" text="Mark a phrase as learned once you can say it without looking." />}
      </section>

      <p className="flex items-center justify-center gap-2 text-xs text-ink-400">
        <RotateCcw className="h-3 w-3" /> Progress uses localStorage; clearing site data resets it.
      </p>
    </div>
  );
}
