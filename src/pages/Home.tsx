import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Flame, Headphones, MessageCircle, Mic2, Sparkles, Star, Target } from 'lucide-react';
import { PHRASES, SITUATIONS } from '../data/phrases';
import { SituationCard } from '../components/SituationCard';
import { PhraseCard } from '../components/PhraseCard';
import { useProgress } from '../components/ProgressContext';

function Stat({ icon: IconComponent, value, label }: { icon: typeof Flame; value: string | number; label: string }) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ivory-100 text-saffron-600">
        <IconComponent className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-bold leading-none text-ink-800">{value}</p>
        <p className="mt-1 text-xs text-ink-400">{label}</p>
      </div>
    </div>
  );
}

const FEATURES = [
  { to: '/practice', icon: MessageCircle, title: 'Role-play a scene', text: 'Choose the right reply and get instant coaching.', tint: 'bg-ink-50 text-ink-600' },
  { to: '/voice', icon: Mic2, title: 'Practise out loud', text: 'Listen, speak, and see how close you got.', tint: 'bg-saffron-50 text-saffron-700' },
  { to: '/quiz', icon: Star, title: 'Prove it in a quiz', text: 'Six quick questions and a matching round.', tint: 'bg-leaf-100 text-leaf-600' },
];

export default function HomePage() {
  const { progress } = useProgress();
  const phraseOfTheDay = PHRASES[Math.floor(Date.now() / 86_400_000) % PHRASES.length];

  return (
    <div className="space-y-9">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-700 to-ink-600 px-6 py-9 text-white shadow-lift sm:px-10 sm:py-12">
        <span aria-hidden="true" className="font-kannada pointer-events-none absolute -right-4 -top-8 text-[11rem] leading-none text-white/5">ಕ</span>
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-saffron-200">
            <Sparkles className="h-3.5 w-3.5" /> Learn Kannada for real life, not for exams
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Speak Kannada <span className="text-saffron-400">where it matters.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-100 sm:text-base">
            Bus stands, markets, pharmacies, canteens. Pick the moment you are in and get the exact
            sentence — in Kannada script, easy roman letters, with sound and the cultural note that
            makes it polite.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/situations" className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-3 text-sm font-bold text-ink-900 transition hover:bg-saffron-400">
              Start with a situation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/ask" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Ask in English
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-100/80">
            <Headphones className="h-3.5 w-3.5" /> Works offline · no login · no API key · {PHRASES.length} curated phrases
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Your progress">
        <Stat icon={Flame} value={`${progress.streak}d`} label="Current streak" />
        <Stat icon={BookOpenCheck} value={progress.learned.length} label="Phrases learned" />
        <Stat icon={Target} value={`${progress.bestQuiz}%`} label="Best quiz score" />
        <Stat icon={Star} value={progress.favourites.length} label="Saved phrases" />
      </section>

      <section aria-labelledby="potd-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="potd-heading" className="text-lg font-bold text-ink-800">Phrase of the day</h2>
            <p className="text-sm text-ink-400">One useful sentence, every day.</p>
          </div>
          <Link to="/situations" className="text-sm font-semibold text-saffron-700 hover:underline">Browse all</Link>
        </div>
        <PhraseCard phrase={phraseOfTheDay} showSituation />
      </section>

      <section aria-labelledby="moments-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="moments-heading" className="text-lg font-bold text-ink-800">Jump into a moment</h2>
            <p className="text-sm text-ink-400">Organised by where you are, not by grammar topic.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SITUATIONS.map((situation) => <SituationCard key={situation.id} situation={situation} />)}
        </div>
      </section>

      <section aria-labelledby="practice-heading">
        <h2 id="practice-heading" className="mb-3 text-lg font-bold text-ink-800">Make it stick</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {FEATURES.map(({ to, icon: IconComponent, title, text, tint }) => (
            <Link key={to} to={to} className="card group flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink-800 group-hover:text-saffron-700">{title}</span>
                <span className="mt-1 block text-sm leading-snug text-ink-500">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
