import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bus,
  BookOpen,
  GraduationCap,
  MapPin,
  MessagesSquare,
  Plane,
  ShoppingBag,
  Stethoscope,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../types';
import { phrases } from '../data/phrases';
import { ScriptText } from './ui';
import { cn } from '../utils/cn';

/** Icon name is stored as data (serialisable), resolved here at render time. */
const icons: Record<string, LucideIcon> = {
  Bus,
  ShoppingBag,
  Utensils,
  Stethoscope,
  GraduationCap,
  MapPin,
  MessagesSquare,
  Plane,
};

export interface ScenarioCardProps {
  category: Category;
  /** Category id to mark as "in progress" using the learner's own activity. */
  touched?: number;
  variant?: 'full' | 'compact';
}

export function ScenarioCard({ category, touched = 0, variant = 'full' }: ScenarioCardProps) {
  const Icon = icons[category.icon] ?? BookOpen;
  const total = phrases.filter((phrase) => phrase.category === category.id).length;
  const preview = phrases.filter((phrase) => phrase.category === category.id).slice(0, 2);
  const percent = total ? Math.min(100, Math.round((Math.min(touched, total) / total) * 100)) : 0;

  return (
    <Link
      to={`/situations/${category.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100/70 bg-white text-left shadow-card transition',
        'hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5',
        variant === 'compact' ? 'p-3.5' : 'p-4 sm:p-5',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', category.accent)}
      />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            category.accent,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold leading-snug text-ink-800">{category.title}</h3>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-400">{total} phrases</span>
          </div>
          <ScriptText size="sm" className="text-ink-400">
            {category.kannadaTitle}
          </ScriptText>
        </div>
      </div>

      {variant === 'full' ? (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-400">{category.blurb}</p>
          <ul className="mt-3 space-y-1.5">
            {preview.map((phrase) => (
              <li key={phrase.id} className="truncate text-[13px] text-ink-500">
                <span className="knn">{phrase.kannada}</span>
                <span className="ml-2 italic text-ink-400">{phrase.english}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex-1" aria-hidden="true">
          <span className="block h-1.5 w-full rounded-full bg-ivory-200">
            <span
              className="block h-full rounded-full bg-saffron-500 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-600 group-hover:text-saffron-700">
          {percent > 0 ? `${percent}% opened` : 'Open'}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
      <span className="sr-only">{`Opens the ${category.title} situation with ${total} Kannada phrases.`}</span>
    </Link>
  );
}
