import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Compass,
  Home,
  Landmark,
  Languages,
  Menu,
  MessagesSquare,
  Mic,
  Star,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useProgress } from '../hooks/useProgress';

/**
 * Labels are kept short so the row never wraps at the 1024px breakpoint; the
 * full feature names are the <h1> of each page (and the mobile menu repeats
 * these same routes).
 */
export const navItems = [
  { to: '/', label: 'Home', full: 'Home', icon: Home, end: true },
  { to: '/situations', label: 'Situations', full: 'Real-life situations', icon: Compass },
  { to: '/practice', label: 'Practice', full: 'Voice practice', icon: Mic },
  { to: '/bridge', label: 'Bridge', full: 'Live voice bridge', icon: Languages },
  { to: '/conversations', label: 'Scenes', full: 'Conversation practice', icon: MessagesSquare },
  { to: '/phrasebook', label: 'Phrasebook', full: 'Searchable phrasebook', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', full: 'Quiz & matching', icon: Brain },
  { to: '/favorites', label: 'Favorites', full: 'My favorites', icon: Star },
  { to: '/culture', label: 'Culture', full: 'Culture & region', icon: Landmark },
];

const mobileItems = navItems.filter((item) =>
  ['/', '/situations', '/practice', '/bridge', '/favorites'].includes(item.to),
);

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <NavLink to="/" className="flex items-center gap-2.5" onClick={onClick}>
      <span
        aria-hidden="true"
        className="knn grid h-10 w-10 place-items-center rounded-xl bg-ink-800 text-xl font-bold text-saffron-400 shadow-card"
      >
        ಕ
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight text-ink-800">Kannada Saathi</span>
        <span className="block text-[11px] font-medium text-ink-400">ನಮ್ಮ ಕನ್ನಡ ಸಂಗಾತಿ</span>
      </span>
    </NavLink>
  );
}

function NavItem({ item, onNavigate }: { item: (typeof navItems)[number]; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition xl:px-3 xl:text-sm',
          isActive ? 'bg-ink-800 text-ivory-50 shadow-card' : 'text-ink-500 hover:bg-white hover:text-ink-800',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

/** Sticky header + a mobile bottom tab bar. Both share one nav definition. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { favorites } = useProgress();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink-800 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ivory-50"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-ivory-100/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Brand />

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-saffron-200 bg-saffron-50 px-2.5 py-1 text-xs font-bold text-saffron-700 sm:inline-flex">
              <Star className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {favorites.length} saved
            </span>
            <button
              type="button"
              className="btn-ghost !px-2.5 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="animate-fade-up border-t border-ink-100 bg-white/95 px-3 py-3 lg:hidden"
          >
            <ul className="mx-auto grid max-w-6xl gap-1 sm:grid-cols-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavItem item={item} onNavigate={() => setOpen(false)} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1 pb-24 lg:pb-10">
        {children}
      </main>

      <footer className="border-t border-ink-100 bg-ivory-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-ink-600">Kannada Saathi</span> · Speak Kannada. Navigate
            Karnataka with confidence.
          </p>
          <p className="max-w-md">
            Built for the Kannada Digital Innovation Hackathon 2026 (HackerRank Campus Crew · NIE Mysuru) —
            problem statement: <span className="font-semibold text-ink-500">Kannada in Everyday Life</span>.
            Phrases are a reviewed starter set, not a dictionary.
          </p>
        </div>
      </footer>

      <nav
        aria-label="Quick tabs"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition',
                      isActive ? 'bg-saffron-50 text-saffron-700' : 'text-ink-400 hover:text-ink-700',
                    )
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
