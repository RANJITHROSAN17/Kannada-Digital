import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { SITUATION_BY_ID, phrasesForSituation } from '../data/phrases';
import { SCENES } from '../data/scenes';
import { Icon } from '../components/Icon';
import { PhraseCard } from '../components/PhraseCard';
import NotFoundPage from './NotFound';

export default function SituationDetailPage() {
  const { id = '' } = useParams();
  const situation = SITUATION_BY_ID[id];
  if (!situation) return <NotFoundPage />;

  const phrases = phrasesForSituation(id);
  const scene = SCENES.find((item) => item.situationId === id);

  return (
    <div className="space-y-6">
      <Link to="/situations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-saffron-700">
        <ArrowLeft className="h-4 w-4" /> All situations
      </Link>

      <header className={`card bg-gradient-to-br ${situation.gradient} p-6`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">
          <Icon name={situation.icon} className={`h-6 w-6 ${situation.accent}`} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-800">{situation.title}</h1>
        <p lang="kn" className="font-kannada text-base text-ink-500">{situation.knTitle}</p>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">{situation.blurb}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">{phrases.length} phrases</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {scene && (
            <Link to="/practice" className="btn-primary">
              <MessageCircle className="h-4 w-4" /> Rehearse this scene
            </Link>
          )}
          <Link to="/quiz" className="btn-soft">
            <Star className="h-4 w-4" /> Quiz me
          </Link>
          <Link to="/voice" className="btn-soft">Practise pronunciation</Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {phrases.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} />)}
      </div>
    </div>
  );
}
