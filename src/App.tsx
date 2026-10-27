import { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Flame, Home, MessageSquareText, Mic2, Sparkles, Star } from 'lucide-react';
import { useProgress } from './components/ProgressContext';
import HomePage from './pages/Home';
import SituationsPage from './pages/Situations';
import SituationDetailPage from './pages/SituationDetail';
import PracticePage from './pages/Practice';
import QuizPage from './pages/Quiz';
import VoicePage from './pages/Voice';
import AskPage from './pages/Ask';
import SavedPage from './pages/Saved';
import AboutPage from './pages/About';
import NotFoundPage from './pages/NotFound';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/situations', label: 'Situations', icon: MessageSquareText, end: false },
  { to: '/practice', label: 'Practice', icon: Sparkles, end: false },
  { to: '/quiz', label: 'Quiz', icon: Star, end: false },
  { to: '/saved', label: 'Saved', icon: Flame, end: false },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function Header() {
  const { progress } = useProgress();
  return (
    <header className="sticky top-0 z-30 border-b border-ivory-200 bg-ivory-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Kannada Saathi home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800 text-lg font-bold text-saffron-400 shadow-card">
            <span className="font-kannada">ಕ</span>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-ink-800">Kannada Saathi</span>
            <span className="block font-kannada text-[0.7rem] text-ink-400">ಕನ್ನಡ ಸಾಥಿ</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-ink-800 text-white' : 'text-ink-500 hover:bg-ivory-100 hover:text-ink-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/voice"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-ink-800 text-white' : 'text-ink-500 hover:bg-ivory-100'}`}
          >
            Voice
          </NavLink>
          <NavLink
            to="/ask"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-ink-800 text-white' : 'text-ink-500 hover:bg-ivory-100'}`}
          >
            Ask
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <span className="chip border-saffron-200 bg-saffron-50 text-saffron-700" title="Days in a row">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {progress.streak} day{progress.streak === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Mobile navigation">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV.map(({ to, label, icon: IconComponent, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold transition ${
                  isActive ? 'text-saffron-700' : 'text-ink-400'
                }`
              }
            >
              <IconComponent className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-14 max-w-6xl px-4 pb-28 text-center text-xs text-ink-400 md:pb-10">
      <p>
        Built for the <span className="font-semibold text-ink-500">Kannada Digital Innovation Hackathon 2026</span> ·
        Problem statement #3 — Kannada in Everyday Life.
      </p>
      <p className="mt-1.5 flex flex-wrap items-center justify-center gap-3">
        <Link to="/about" className="underline underline-offset-2 hover:text-saffron-700">About & credits</Link>
        <Link to="/voice" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-saffron-700 md:hidden"><Mic2 className="h-3 w-3" /> Voice</Link>
        <Link to="/ask" className="underline underline-offset-2 hover:text-saffron-700 md:hidden">Ask in English</Link>
        <span>100% offline · no account · no tracking</span>
      </p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/situations" element={<SituationsPage />} />
          <Route path="/situations/:id" element={<SituationDetailPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/voice" element={<VoicePage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
