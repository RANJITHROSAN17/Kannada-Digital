import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookMarked, Compass, Languages, Shapes } from 'lucide-react';
import { culturalNotes, regionalVariants } from '../data/culture';
import { numbers } from '../data/phrases';
import { phrases } from '../data/phrases';
import { useProgress } from '../hooks/useProgress';
import { Card, Chip, SectionHeading, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

const kindMeta: Record<string, { label: string; icon: typeof Compass; tone: string }> = {
  etiquette: { label: 'Etiquette', icon: Compass, tone: 'bg-saffron-100 text-saffron-700' },
  speech: { label: 'How speech works', icon: Languages, tone: 'bg-ink-50 text-ink-600' },
  script: { label: 'Script', icon: Shapes, tone: 'bg-leaf-100 text-leaf-600' },
  regional: { label: 'Regional', icon: BookMarked, tone: 'bg-sky-50 text-sky-700' },
  culture: { label: 'Culture', icon: BookMarked, tone: 'bg-violet-50 text-violet-700' },
};

export function CulturePage() {
  const progress = useProgress();
  const reviewNeeded = useMemo(() => phrases.filter((phrase) => phrase.review === 'needs-native-review'), []);
  const verifiedShare = Math.round(((phrases.length - reviewNeeded.length) / phrases.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow="Not decoration"
        title="Language and culture, stated carefully"
        description="Kannada Saathi keeps context beside the sentence it belongs to. Where we are not certain, the app says so instead of guessing."
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink-800">Dataset honesty</h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-400">
              {phrases.length} phrases ship in this build. {verifiedShare}% are standard everyday Kannada that a
              learner can use anywhere in Karnataka. The remaining {reviewNeeded.length} are colloquial or
              regional lines kept because they are genuinely what you hear — each one is labelled, and the app
              never presents them as universal.
            </p>
          </div>
          <Chip tone="warn">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {reviewNeeded.length} awaiting native review
          </Chip>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {reviewNeeded.slice(0, 6).map((phrase) => (
            <li key={phrase.id} className="rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
              <span className="knn block text-[14px] font-semibold text-ink-700" lang="kn">
                {phrase.kannada}
              </span>
              <span className="block text-[11px] text-ink-400">
                {phrase.english} · {phrase.category}
                {progress.isFavorite(phrase.id) ? ' · saved' : ''}
              </span>
            </li>
          ))}
        </ul>
        <StatusLine tone="info">
          Corrections from Kannada speakers are the intended next step for this project: the review flag is a
          real field on every phrase, so a fix is a one-line data change.
        </StatusLine>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">Cultural notes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {culturalNotes.map((note) => {
            const meta = kindMeta[note.kind] ?? kindMeta.culture;
            const Icon = meta.icon;
            return (
              <Card key={note.id} className="flex flex-col p-4">
                <div className="flex items-center gap-2">
                  <span className={cn('grid h-7 w-7 place-items-center rounded-lg', meta.tone)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-[14px] font-bold leading-snug text-ink-800">{note.title}</h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-400">{note.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Chip tone="neutral">{meta.label}</Chip>
                  {note.caution ? (
                    <Chip tone="warn">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      verify locally
                    </Chip>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-400">Regional variants</h2>
        <p className="mb-3 max-w-3xl text-[13px] leading-relaxed text-ink-400">
          Reported variation, not a dictionary of dialects. Each row is marked for review because a word that is
          normal in one region can sound odd 200 km away — which is exactly why the app teaches the standard
          form first.
        </p>
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-ink-800 text-ivory-50">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Standard
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Reported variant
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Meaning
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Where it is said
                </th>
              </tr>
            </thead>
            <tbody>
              {regionalVariants.map((item) => (
                <tr key={item.id} className="border-t border-ink-100 align-top odd:bg-ivory-50">
                  <td className="px-3 py-2.5">
                    <span className="knn block text-[15px] font-semibold text-ink-800" lang="kn">
                      {item.standard}
                    </span>
                    <span className="block text-[11px] italic text-ink-400">{item.standardTranslit}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="knn block text-[15px] text-ink-700" lang="kn">
                      {item.variant}
                    </span>
                    <span className="block text-[11px] italic text-ink-400">{item.variantTranslit}</span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-600">{item.english}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-ink-500">{item.region}</span>
                    <Chip tone="warn" className="mt-1.5">
                      needs native review
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-400">Numbers you will need</h2>
        <p className="mb-3 max-w-3xl text-[13px] leading-relaxed text-ink-400">
          Bargaining, tickets, ages and flat numbers all run on these. Kannada has its own digits — prices on
          boards usually use Arabic numerals, forms sometimes do not.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {numbers.map((item) => (
            <li key={item.digit} className="card px-3 py-2.5 text-center">
              <span className="knn block text-lg font-bold text-ink-800" lang="kn">
                {item.kannadaWord}
              </span>
              <span className="block text-[11px] italic text-ink-400">{item.transliteration}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-saffron-700">
                {item.digit} · {item.english}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-ink-800">Put it to work</h2>
            <p className="mt-1 text-[13px] text-ink-400">
              Situations, role-play and the quiz all draw from this reviewed set.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/situations" className="btn-primary !py-2">
              Browse situations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/phrasebook" className="btn-ghost !py-2">
              Open phrasebook
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
