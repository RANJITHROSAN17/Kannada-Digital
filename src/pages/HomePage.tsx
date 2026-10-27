import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Flame, Mic, Quote, Sun } from 'lucide-react';
import { categories } from '../data/categories';
import { phrases } from '../data/phrases';
import { conversations } from '../data/conversations';
import { ScenarioCard } from '../components/ScenarioCard';
import { AskWhatToSayBox } from '../components/AskWhatToSayBox';
import { PhraseCard } from '../components/PhraseCard';
import { Card, Meter, SectionHeading, ScriptText } from '../components/ui';
import { useProgress } from '../hooks/useProgress';
import { useSpeech } from '../hooks/useSpeech';
import { hasPronunciationAudio } from '../services/pronunciationAudio';
import { dailyPhrase, summarizeProgress } from '../utils/progress';

export function HomePage() {
  const progress = useProgress();
  const { capabilities, speakPhrase } = useSpeech();
  const today = useMemo(() => dailyPhrase(), []);
  const canHearToday =
    hasPronunciationAudio(today.kannada) ||
    (capabilities.ttsSupported && capabilities.anyVoiceAvailable);
  const summary = useMemo(
    () => summarizeProgress(progress, conversations.length),
    [progress],
  );

  const recent = useMemo(
    () =>
      progress.recent
        .map((id) => phrases.find((phrase) => phrase.id === id))
        .filter((phrase): phrase is (typeof phrases)[number] => Boolean(phrase))
        .slice(0, 3),
    [progress.recent],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden rounded-3xl border border-ink-100 bg-ink-800 px-5 py-9 text-ivory-50 shadow-lift sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-saffron-500/25 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/10 blur-2xl"
        />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-ivory-50/20 bg-ivory-50/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-saffron-200">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            Code · Create · Celebrate Kannada
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Speak Kannada.
            <br />
            <span className="text-saffron-400">Navigate Karnataka with confidence.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-100/80 sm:text-base">
            Not another vocabulary app. Kannada Saathi is a companion you open at a bus stand, a
            vegetable stall or a hospital counter — real sentences, readable pronunciation and the
            cultural note that makes them land.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/practice" className="btn-accent">
              <Mic className="h-4 w-4" aria-hidden="true" />
              Start Speaking Kannada
            </Link>
            <Link
              to="/situations"
              className="btn border border-ivory-50/25 bg-ivory-50/10 text-ivory-50 hover:bg-ivory-50/20"
            >
              Explore Real-Life Situations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-left">
            {[
              {
                label: 'Phrases in the app',
                value: phrases.length,
                hint: `${phrases.filter((p) => p.review === 'verified-usage').length} standard · ${
                  phrases.filter((p) => p.review === 'needs-native-review').length
                } flagged for native review`,
              },
              { label: 'Life situations', value: categories.length, hint: 'bus to hospital to temple' },
              { label: 'Role-play scenes', value: conversations.length, hint: 'branching, with coaching notes' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-ivory-50/15 bg-ivory-50/5 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-ivory-100/60">{item.label}</dt>
                <dd className="text-lg font-extrabold tabular-nums text-ivory-50">{item.value}</dd>
                {'hint' in item && item.hint ? (
                  <dd className="mt-0.5 text-[10px] leading-tight text-ivory-100/60">{item.hint}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- daily + progress */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-ink-100 bg-ivory-50 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-700">
              <Quote className="h-4 w-4 text-saffron-500" aria-hidden="true" />
              Phrase of the day
            </h2>
            <span className="text-[11px] font-medium text-ink-400">
              {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="p-4">
            <p className="knn text-2xl font-semibold text-ink-800 sm:text-3xl" lang="kn">
              {today.kannada}
            </p>
            <p className="mt-2 text-sm font-medium italic text-ink-400">{today.transliteration}</p>
            <p className="mt-1 text-sm font-semibold text-ink-600">{today.english}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-accent !py-2"
                disabled={!canHearToday}
                onClick={() => speakPhrase(today)}
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
                Hear it in Kannada
              </button>
              <button
                type="button"
                className="btn-ghost !py-2"
                onClick={() => progress.toggleFavorite(today.id)}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                {progress.isFavorite(today.id) ? 'Saved today' : 'Save to favourites'}
              </button>
              <Link to={`/situations/${today.category}`} className="btn-ghost !py-2">
                More in this situation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {!canHearToday ? (
              <p className="mt-2 text-[11px] text-ink-400">
                Audio is unavailable in this browser. The transliteration is the pronunciation guide.
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-700">Your progress</h2>
            {summary.streakDays > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-saffron-50 px-2 py-0.5 text-[11px] font-bold text-saffron-700">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                {summary.streakDays} day{summary.streakDays === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
          <div className="mt-4 space-y-3.5">
            <Meter value={summary.overallPercent} label="Overall confidence" />
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Phrases opened', value: summary.phrasesViewed },
                { label: 'Heard aloud', value: summary.phrasesListened },
                { label: 'Favourites', value: summary.favoritesCount },
                { label: 'Scenes done', value: `${summary.scenariosCompleted}/${summary.scenariosTotal}` },
              ].map((item) => (
                <li key={item.label} className="rounded-xl border border-ink-100 bg-ivory-50 px-2.5 py-2">
                  <span className="block text-[11px] text-ink-400">{item.label}</span>
                  <span className="text-base font-extrabold tabular-nums text-ink-800">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] leading-relaxed text-ink-400">
              {summary.phrasesViewed === 0
                ? 'Everything here is counted from what you actually do — open a card or play a phrase and it starts moving.'
                : `Best quiz score ${summary.quizBest ? `${summary.quizBest.score}/${summary.quizBest.total}` : '—'} · ${summary.quizAttempts} attempt${summary.quizAttempts === 1 ? '' : 's'} · practiced on ${summary.activeDaysThisWeek} of the last 7 days.`}
            </p>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------------- ask box */}
      <section className="mt-6">
        <AskWhatToSayBox />
      </section>

      {/* ------------------------------------------------------- situations */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Start with the moment"
          title="Real-life situations"
          description="Eight everyday pressures, each with the exact sentences that resolve them."
          action={
            <Link to="/phrasebook" className="btn-ghost !py-2">
              Open full phrasebook
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <ScenarioCard
              key={category.id}
              category={category}
              touched={progress.categoryActivity[category.id] ?? 0}
            />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- voice + recent */}
      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-ink-700">Quick voice check</h2>
              <p className="mt-0.5 text-xs text-ink-400">
                {capabilities.recognitionSupported
                  ? 'This browser exposes speech recognition. Say a phrase and compare it with the target.'
                  : 'This browser has no speech recognition, so the practice page uses a typed comparison instead.'}
              </p>
            </div>
            <Link to="/practice" className="btn-primary !py-2">
              Practice
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {phrases
              .filter((phrase) => phrase.difficulty === 'beginner')
              .slice(0, 2)
              .map((phrase) => (
                <li key={phrase.id}>
                  <PhraseCard phrase={phrase} compact />
                </li>
              ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink-700">Recently viewed</h2>
          {recent.length ? (
            <ul className="mt-3 space-y-2">
              {recent.map((phrase) => (
                <li key={phrase.id} className="rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
                  <ScriptText size="sm" className="text-ink-800">
                    {phrase.kannada}
                  </ScriptText>
                  <p className="text-[12px] text-ink-400">{phrase.english}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Nothing yet. Browse a situation and the three most recent phrases appear here — this list is
              real history, stored only on this device.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
