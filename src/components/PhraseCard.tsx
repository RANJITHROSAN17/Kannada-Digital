import { useState } from 'react';
import { Check, Copy, Heart, Info, Volume2 } from 'lucide-react';
import { SITUATION_BY_ID } from '../data/phrases';
import { speak } from '../lib/speech';
import type { Phrase } from '../types';
import { useProgress } from './ProgressContext';

interface Props {
  phrase: Phrase;
  showSituation?: boolean;
  compact?: boolean;
}

export function PhraseCard({ phrase, showSituation = false, compact = false }: Props) {
  const { progress, toggleFavourite, toggleLearned } = useProgress();
  const [copied, setCopied] = useState(false);
  const [audioNote, setAudioNote] = useState('');
  const isFav = progress.favourites.includes(phrase.id);
  const isLearned = progress.learned.includes(phrase.id);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${phrase.kn}\n${phrase.rom}\n${phrase.en}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setAudioNote('Copy is unavailable in this browser.');
    }
  };

  const play = () => {
    const ok = speak(phrase.kn);
    setAudioNote(ok ? '' : 'Audio not available on this device — use the transliteration below.');
    if (!ok) window.setTimeout(() => setAudioNote(''), 4000);
  };

  return (
    <article className={`card animate-fade-up p-4 ${compact ? '' : 'sm:p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showSituation && (
            <p className="label mb-1.5 text-saffron-600">
              {SITUATION_BY_ID[phrase.situationId]?.title ?? 'Kannada'}
            </p>
          )}
          <p lang="kn" className="font-kannada text-[1.55rem] font-semibold leading-snug text-ink-800">
            {phrase.kn}
          </p>
          <p className="mt-1 text-sm font-medium text-saffron-700">{phrase.rom}</p>
          <p className="mt-1 text-[0.95rem] text-ink-600">{phrase.en}</p>
        </div>
        <button type="button" onClick={play} className="btn-icon shrink-0" aria-label={`Listen to ${phrase.rom}`} title="Listen">
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {!compact && (
        <div className="mt-3 space-y-2">
          <p className="flex gap-2 text-sm text-ink-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
            <span><span className="font-semibold text-ink-600">When:</span> {phrase.when}</span>
          </p>
          {phrase.note && (
            <p className="rounded-xl bg-saffron-50 px-3 py-2 text-sm text-ink-600">
              <span className="font-semibold">Cultural note:</span> {phrase.note}
            </p>
          )}
        </div>
      )}

      {(copied || audioNote) && (
        <p className="mt-2 text-xs font-medium text-leaf-600" role="status">{copied ? 'Copied to clipboard' : audioNote}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ivory-200 pt-3">
        <button
          type="button"
          onClick={() => toggleFavourite(phrase.id)}
          aria-pressed={isFav}
          className={`chip transition ${isFav ? 'border-rose-200 bg-rose-50 text-rose-600' : ''}`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
          {isFav ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => toggleLearned(phrase.id)}
          aria-pressed={isLearned}
          className={`chip transition ${isLearned ? 'border-leaf-500 bg-leaf-100 text-leaf-600' : ''}`}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {isLearned ? 'Learned' : 'Mark learned'}
        </button>
        <button type="button" onClick={copy} className="chip ml-auto" aria-label="Copy phrase">
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copy
        </button>
      </div>
    </article>
  );
}
