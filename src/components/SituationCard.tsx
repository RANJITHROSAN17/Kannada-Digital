import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { phrasesForSituation } from '../data/phrases';
import type { Situation } from '../types';
import { useProgress } from './ProgressContext';
import { Icon } from './Icon';

export function SituationCard({ situation }: { situation: Situation }) {
  const { progress } = useProgress();
  const phrases = phrasesForSituation(situation.id);
  const done = phrases.filter((phrase) => progress.learned.includes(phrase.id)).length;
  const pct = phrases.length ? Math.round((done / phrases.length) * 100) : 0;

  return (
    <Link
      to={`/situations/${situation.id}`}
      className={`group card relative overflow-hidden bg-gradient-to-br ${situation.gradient} p-5 transition hover:-translate-y-0.5 hover:shadow-lift`}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          <Icon name={situation.icon} className={`h-5 w-5 ${situation.accent}`} />
        </span>
        <ChevronRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink-800">{situation.title}</h3>
      <p lang="kn" className="font-kannada text-sm text-ink-500">{situation.knTitle}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-ink-500">{situation.blurb}</p>
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-saffron-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs font-medium text-ink-400">{done}/{phrases.length} learned</p>
      </div>
    </Link>
  );
}
