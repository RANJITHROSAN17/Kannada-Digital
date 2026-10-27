import { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Copy, Info, Quote, Volume2, VolumeX } from 'lucide-react';
import type { Phrase } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useSpeech } from '../hooks/useSpeech';
import { Card, Chip, IconButton, StatusLine } from './ui';
import { highlightChunks } from '../utils/text';
import { cn } from '../utils/cn';

/** Highlight matched search terms inside a line without using innerHTML. */
function Highlighted({ text, query }: { text: string; query?: string }) {
  const chunks = query?.trim() ? highlightChunks(text, query) : [{ text, matched: false }];
  return (
    <>
      {chunks.map((chunk, index) =>
        chunk.matched ? (
          <mark key={`${index}-${chunk.text}`} className="rounded bg-saffron-100 px-0.5 text-ink-900">
            {chunk.text}
          </mark>
        ) : (
          <span key={`${index}-${chunk.text}`}>{chunk.text}</span>
        ),
      )}
    </>
  );
}

export interface PhraseCardProps {
  phrase: Phrase;
  /** Highlight hits from the current search query. */
  query?: string;
  compact?: boolean;
  /** Extra node shown under the meaning (e.g. the scenario it belongs to). */
  footer?: React.ReactNode;
}

/**
 * The one place a phrase is rendered: Kannada script, transliteration,
 * English meaning, playback, copy, bookmark, pronunciation tip and an honest
 * review badge. Used by Situations, Phrasebook, Favorites and search results.
 */
export function PhraseCard({ phrase, query, compact = false, footer }: PhraseCardProps) {
  const { isFavorite, toggleFavorite, viewPhrase, listenPhrase, copyPhrase } = useProgress();
  const { capabilities, speakPhrase, playingId, status } = useSpeech();
  const [showTip, setShowTip] = useState(false);
  const [copied, setCopied] = useState(false);

  const favorite = isFavorite(phrase.id);
  const playing = playingId === phrase.id;

  const handlePlay = () => {
    const result = speakPhrase(phrase);
    if (result.started) listenPhrase(phrase.id);
  };

  const handleCopy = async () => {
    const payload = `${phrase.kannada}\n${phrase.transliteration}\n${phrase.english}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      copyPhrase(phrase.id);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API needs a secure context; select-the-text fallback instead.
      setCopied(false);
      window.alert('Your browser blocked clipboard access. Long-press or select the text to copy it.');
    }
  };

  const canPlay = capabilities.ttsSupported && capabilities.anyVoiceAvailable;

  return (
    <Card
      className={cn(
        'group relative flex flex-col gap-3 p-4 transition hover:shadow-lift',
        compact && 'p-3.5',
      )}
      onClick={(event) => {
        // Count deliberate attention only: a click on the card body or moving
        // focus into it. Button clicks handle their own tracking.
        const target = event.target as HTMLElement;
        if (!target.closest('button')) viewPhrase(phrase.id, phrase.category);
      }}
      onFocusCapture={() => viewPhrase(phrase.id, phrase.category)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="knn text-xl font-semibold text-ink-800 sm:text-2xl" lang="kn">
            <Highlighted text={phrase.kannada} query={query} />
          </p>
          <p className="mt-1.5 text-sm font-medium italic text-ink-400">
            <Highlighted text={phrase.transliteration} query={query} />
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton
            label={playing ? 'Stop playback' : canPlay ? 'Play pronunciation' : 'Playback unavailable in this browser'}
            onClick={handlePlay}
            tone="accent"
            disabled={!canPlay}
            aria-busy={playing}
          >
            {playing ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
          </IconButton>
          <IconButton
            label={favorite ? 'Remove from favourites' : 'Save to favourites'}
            onClick={() => toggleFavorite(phrase.id)}
            active={favorite}
          >
            {favorite ? <BookmarkCheck className="h-4 w-4 text-saffron-600" /> : <Bookmark className="h-4 w-4" />}
          </IconButton>
          <IconButton label={copied ? 'Copied' : 'Copy phrase'} onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-leaf-500" /> : <Copy className="h-4 w-4" />}
          </IconButton>
        </div>
      </div>

      <p className="text-sm font-semibold text-ink-600">
        <Highlighted text={phrase.english} query={query} />
      </p>

      {!compact ? (
        <p className="text-[13px] leading-relaxed text-ink-400">
          <span className="font-semibold text-ink-500">When to use: </span>
          <Highlighted text={phrase.usage} query={query} />
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <Chip tone="info">{phrase.politeness}</Chip>
        <Chip tone="info">{phrase.difficulty}</Chip>
        {phrase.review === 'needs-native-review' ? (
          <Chip tone="warn">Regional / colloquial — awaiting native review</Chip>
        ) : null}
        {phrase.pronunciationTip ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-ink-100 bg-white px-2.5 py-1 text-xs font-semibold text-ink-500 hover:border-saffron-300 hover:text-saffron-700"
            onClick={() => setShowTip((value) => !value)}
            aria-expanded={showTip}
          >
            <Info className="h-3.5 w-3.5" />
            {showTip ? 'Hide tip' : 'Pronunciation tip'}
          </button>
        ) : null}
        {!canPlay ? (
          <Chip tone="warn">
            <VolumeX className="h-3.5 w-3.5" /> Audio not supported here
          </Chip>
        ) : null}
      </div>

      {showTip && phrase.pronunciationTip ? (
        <StatusLine tone="info">
          <Quote className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          {phrase.pronunciationTip}
          {phrase.literal ? <span className="mt-1 block not-italic text-ink-400">Word by word: {phrase.literal}</span> : null}
        </StatusLine>
      ) : null}

      {playing || status.kind === 'error' ? (
        <StatusLine tone={status.kind === 'error' ? 'error' : 'info'}>{status.message}</StatusLine>
      ) : null}

      {footer}
    </Card>
  );
}
