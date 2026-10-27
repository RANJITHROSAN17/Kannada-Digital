import { Link } from 'react-router-dom';
import { BookOpen, Code2, Heart, MapPin, ShieldCheck, WifiOff } from 'lucide-react';
import { PHRASES, SITUATIONS } from '../data/phrases';
import { SCENES } from '../data/scenes';

const STACK = [
  ['React 18 + TypeScript', 'Component UI, strict typing, zero runtime type errors.'],
  ['Vite 5 + Tailwind CSS 3', 'Fast dev server and a small, themeable production bundle.'],
  ['React Router (HashRouter)', 'Deep links that work on any static host with no rewrite rules.'],
  ['Web Speech API', 'Optional Kannada text-to-speech and speech recognition in the browser.'],
  ['Vitest + Testing Library', 'Dataset integrity, search, quiz, speech and storage unit tests.'],
  ['Service worker', 'Caches the app shell so the phrasebook keeps working offline.'],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header>
        <h1 className="text-2xl font-bold text-ink-800">About Kannada Saathi</h1>
        <p lang="kn" className="font-kannada mt-1 text-ink-500">ಕನ್ನಡ ಸಾಥಿ — ಕನ್ನಡ ಕಲಿಯೋಣ</p>
      </header>

      <section className="card p-6">
        <span className="chip border-saffron-200 bg-saffron-50 text-saffron-700">Problem statement #3</span>
        <h2 className="mt-4 text-lg font-bold text-ink-800">Kannada in Everyday Life</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          People who arrive in Karnataka for a job, a college seat, a hospital visit or a holiday can
          usually read English, but cannot <em>say</em> anything useful in Kannada. Word-for-word
          translators give them nouns; what they need is a sentence, its sound, and the social tone
          that makes it land. Bus conductors, market vendors, pharmacy counters and canteens all run
          on spoken Kannada.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Kannada Saathi is organised <strong>by the moment you are in</strong>, not by grammar topic.
          Pick a situation and get the exact sentence in Kannada script, a readable transliteration,
          the English meaning, when to use it, browser audio, and the cultural note that keeps it
          polite. Then rehearse it in a branching role-play, say it aloud, and prove it in a quiz.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          It also supports problem statements #1 (guided practice and vocabulary) and #2 (voice
          practice), but the primary lens is real-world use.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: MapPin, value: SITUATIONS.length, label: 'everyday situations' },
          { icon: BookOpen, value: PHRASES.length, label: 'curated phrases' },
          { icon: Code2, value: SCENES.length, label: 'role-play scenes' },
        ].map(({ icon: IconComponent, value, label }) => (
          <div key={label} className="card p-5 text-center">
            <IconComponent className="mx-auto h-5 w-5 text-saffron-500" />
            <p className="mt-2 text-2xl font-bold text-ink-800">{value}</p>
            <p className="text-xs text-ink-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink-800">What you can do</h2>
        <ul className="mt-3 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
          {[
            'Browse 8 real-life situations with per-situation progress',
            'Search phrases in English, transliteration or Kannada script',
            'Hear any phrase with browser text-to-speech (kn-IN)',
            'Ask in plain English and get the right Kannada sentence offline',
            'Rehearse branching conversations with coaching feedback',
            'Take a scored quiz with meaning and matching rounds',
            'Practise pronunciation with speech recognition or typed fallback',
            'Save favourites, track a daily streak, keep your best scores',
            'Install it as a PWA and use the whole phrasebook offline',
          ].map((item) => (
            <li key={item} className="flex gap-2"><span className="text-saffron-500">•</span> {item}</li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink-800">Technology</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {STACK.map(([name, detail]) => (
            <div key={name} className="flex flex-col gap-0.5 border-b border-ivory-200 pb-2 last:border-0 sm:flex-row sm:gap-4">
              <dt className="w-56 shrink-0 font-semibold text-ink-700">{name}</dt>
              <dd className="text-ink-500">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="card p-5">
          <WifiOff className="h-5 w-5 text-leaf-600" />
          <h3 className="mt-2 text-sm font-bold text-ink-800">Offline by design</h3>
          <p className="mt-1 text-sm text-ink-500">
            All content is bundled. No backend, no account, no API key. A service worker caches the
            app shell after the first visit, so it works on a college LAN or with no signal.
          </p>
        </div>
        <div className="card p-5">
          <ShieldCheck className="h-5 w-5 text-ink-500" />
          <h3 className="mt-2 text-sm font-bold text-ink-800">Private by default</h3>
          <p className="mt-1 text-sm text-ink-500">
            Progress lives only in your browser’s localStorage. Speech is handled by the browser;
            no recording is stored or transmitted. There is no analytics or tracking code.
          </p>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink-800"><Heart className="h-4 w-4 text-rose-500" /> Credits & content note</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          The phrase set is a hand-curated starter collection of everyday Kannada. Transliteration is
          intentionally plain ASCII so a beginner can read it aloud without linguistic training; it is
          a learning aid, not a formal ISO transliteration. A native speaker can review and extend the
          entire dataset by editing <code className="rounded bg-ivory-100 px-1 text-xs">src/data/phrases.ts</code> —
          no UI changes needed. Dataset integrity is protected by unit tests.
        </p>
        <p className="mt-3 text-sm text-ink-500">
          Built for the Kannada Digital Innovation Hackathon 2026 · HackerRank Campus Crew, NIE Mysuru.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/situations" className="btn-primary">Start learning</Link>
          <Link to="/quiz" className="btn-soft">Take the quiz</Link>
        </div>
      </section>
    </div>
  );
}
