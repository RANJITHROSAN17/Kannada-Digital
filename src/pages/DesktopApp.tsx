import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Mic,
  MessagesSquare,
  BookOpen,
  Brain,
  Star,
  Landmark,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useProgress } from '../hooks/useProgress';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { detectCapabilities } from '../services/speech';
import { isDesktop } from '../services/desktop';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/situations', label: 'Situations', icon: Compass },
  { to: '/practice', label: 'Practice', icon: Mic },
  { to: '/bridge', label: 'Bridge', icon: MessagesSquare },
  { to: '/conversations', label: 'Scenes', icon: MessagesSquare },
  { to: '/phrasebook', label: 'Phrasebook', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: Brain },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/culture', label: 'Culture', icon: Landmark },
];

/**
 * Desktop shell: a left sidebar + content area. Simpler than the web
 * Layout — no mobile bottom bar, no hamburger menu. The sidebar is always
 * visible because a desktop window has the width for it.
 */
export function DesktopApp({ children }: { children: React.ReactNode }) {
  const { favorites } = useProgress();
  const online = useOnlineStatus();
  const [caps] = useState(() => detectCapabilities());
  const desktop = isDesktop();

  const engineLabel = desktop
    ? caps.desktopRecognition
      ? 'Voice: Whisper (offline)'
      : 'Voice: not configured'
    : 'Voice: browser';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ivory-50">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-ink-100 bg-white">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="text-xl">🇮🇳</span>
          <div>
            <p className="text-sm font-bold text-ink-900">Kannada Saathi</p>
            <p className="text-[10px] text-ink-400">Desktop · v1.0</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {item.to === '/favorites' && favorites.length > 0 && (
                  <span className="ml-auto rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                    {favorites.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 px-4 py-3">
          <p className="text-[10px] text-ink-400">{engineLabel}</p>
          <p className="text-[10px] text-ink-400">
            {online ? 'Network: online' : 'Network: offline'}
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {!online ? (
          <div className="border-b border-amber-300 bg-amber-50 px-6 py-2">
            <p className="text-[13px] font-semibold text-amber-900">
              You're offline — the phrasebook, situations and quizzes work. Live translation needs the network.
            </p>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
