import { Link } from 'react-router-dom';
import { Info, Mic } from 'lucide-react';
import { BridgePanel } from '../components/BridgePanel';
import { Card, SectionHeading } from '../components/ui';

/**
 * ಸಂವಿಧಾನ — Live Bridge (full page).
 *
 * The conversation engine lives in `useBridge` and the UI in `BridgePanel`,
 * which the home page also embeds compactly. This page adds the page frame:
 * the heading, the route entry point and the honesty notes.
 */
export function BridgePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading
        level="h1"
        eyebrow="Live bridge · ಸಂವಿಧಾನ"
        title="Speak your language, hear theirs"
        description="Talk in English — the app plays it in Kannada audio so the other person hears it. They reply in Kannada — you hear it back in English. Every sentence works, not just the phrasebook."
        action={
          <Link to="/practice" className="btn-ghost !py-2">
            <Mic className="h-4 w-4" aria-hidden="true" />
            Practice instead
          </Link>
        }
      />

      <BridgePanel variant="full" />

      {/* ------------------------------------------------------- honesty notes */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-ink-400">
            Live translation needs the internet and falls back through two free engines (no API key). If
            both fail, the bridge says so instead of guessing. The phrasebook, situations and practice keep
            working with zero network.
          </p>
        </Card>
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-ink-400">
            Live-translated Kannada is machine output — the romanisation is approximate. Keep{' '}
            <span className="knn font-semibold" lang="kn">ನೀವು</span> forms with anyone older, and confirm
            an important line with a native speaker before relying on it.
          </p>
        </Card>
      </div>
    </div>
  );
}
