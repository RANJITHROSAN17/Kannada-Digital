import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Circle,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Square,
  Volume2,
} from 'lucide-react';
import { phrases } from '../data/phrases';
import { categories } from '../data/categories';
import type { CategoryId, Phrase } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { useProgress } from '../hooks/useProgress';
import { similarityScore } from '../utils/text';
import { Card, Chip, Meter, SectionHeading, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

const practicePool = phrases.filter((phrase) => phrase.category !== 'everyday' || phrase.difficulty === 'beginner');

/** Verbal label for a similarity band, phrased around text match only. */
function bandFor(score: number): { label: string; tone: 'good' | 'accent' | 'warn' | 'error' } {
  if (score >= 85) return { label: 'Very close — this is what people expect to hear', tone: 'good' };
  if (score >= 60) return { label: 'Understandable, a couple of sounds are off', tone: 'accent' };
  if (score >= 30) return { label: 'A listener would ask you to repeat it', tone: 'warn' };
  return { label: 'Not matching the target words yet', tone: 'error' };
}

export function VoicePracticePage() {
  const { capabilities, status, setStatus, speakPhrase, stop, playingId, startListening } = useSpeech();
  const progress = useProgress();

  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [target, setTarget] = useState<Phrase>(() => practicePool[0]);
  const [typed, setTyped] = useState('');
  const [heard, setHeard] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [attempts, setAttempts] = useState<number[]>([]);

  const pool = useMemo(
    () => (category === 'all' ? practicePool : practicePool.filter((phrase) => phrase.category === category)),
    [category],
  );

  const pickRandom = useCallback(() => {
    const next = pool[Math.floor(Math.random() * pool.length)] ?? practicePool[0];
    setTarget(next);
    setHeard('');
    setTyped('');
    setInterim('');
    progress.viewPhrase(next.id, next.category);
  }, [pool, progress]);

  const current = heard || typed;
  const score = current.trim() ? similarityScore(target.kannada, current) : null;
  const band = score === null ? null : bandFor(score);

  const submit = (value: string, method: 'speech-recognition' | 'typed') => {
    const text = value.trim();
    if (!text) {
      setStatus({ kind: 'error', message: 'Nothing to compare yet — speak or type the phrase first.' });
      return;
    }
    const similarity = similarityScore(target.kannada, text);
    progress.recordPractice({
      phraseId: target.id,
      targetKannada: target.kannada,
      said: text,
      similarity,
      method,
      at: new Date().toISOString(),
    });
    setAttempts((list) => [similarity, ...list].slice(0, 5));
    setStatus({
      kind: 'done',
      message: `Compared against the target text (${method === 'typed' ? 'typed' : 'recognised speech'}).`,
    });
  };

  const toggleMic = () => {
    if (listening) {
      setListening(false);
      setInterim('');
      return;
    }
    setHeard('');
    setInterim('');
    setListening(true);
    startListening({
      onInterim: (text) => setInterim(text),
      onResult: (text) => {
        setListening(false);
        setInterim('');
        setHeard(text);
        submit(text, 'speech-recognition');
      },
    });
  };

  // Any recognition error (permission denied, no mic, no network) must leave
  // the UI in a usable state, with the text fallback still in focus.
  useEffect(() => {
    if (status.kind === 'error') {
      setListening(false);
      setInterim('');
    }
  }, [status.kind]);

  const micBlocked = !capabilities.recognitionSupported || !capabilities.microphoneAvailable;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading
        eyebrow="Voice of Kannada"
        title="Voice practice with honest feedback"
        description="Say the line, or type what you heard yourself say. You get a text-match score against the target — never a fake “accent rating”."
      />

      {/* ------------------------------------------------- capability dashboard */}
      <Card className="mb-5 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400">
          <ShieldCheck className="h-4 w-4 text-leaf-500" aria-hidden="true" />
          What this browser can do
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            {
              ok: capabilities.ttsSupported && capabilities.anyVoiceAvailable,
              label: 'Text-to-speech playback',
              detail: capabilities.kannadaVoiceAvailable
                ? `Kannada voice found: ${capabilities.kannadaVoiceName}`
                : capabilities.anyVoiceAvailable
                  ? 'Voices installed, but none for Kannada — playback uses your default voice'
                  : 'No system voices available',
            },
            {
              ok: capabilities.recognitionSupported,
              label: 'Speech recognition (kn-IN)',
              detail: capabilities.recognitionSupported
                ? 'Available. Recognition runs in your browser/OS and may need the network.'
                : 'Not implemented in this browser — the text box below is the fallback.',
            },
            {
              ok: capabilities.microphoneAvailable && capabilities.secureContext,
              label: 'Microphone access',
              detail:
                !capabilities.secureContext
                  ? 'Needs https or localhost'
                  : capabilities.microphoneAvailable
                    ? 'Available — your browser will ask for permission'
                    : 'No getUserMedia in this context',
            },
            {
              ok: false,
              label: 'Acoustic pronunciation scoring',
              detail: 'Not included — no reliable Kannada scoring model. Feedback is text similarity only.',
            },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2 rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                  item.ok ? 'bg-leaf-500' : item.label.startsWith('Acoustic') ? 'bg-ink-100' : 'bg-amber-400',
                )}
              >
                {item.ok ? (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6.5 4.5 9 10 3" />
                  </svg>
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-ink-700">{item.label}</span>
                <span className="block text-[11px] leading-snug text-ink-400">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ------------------------------------------------------------ target */}
        <Card className="lg:col-span-3 overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-800 px-4 py-3 text-ivory-50">
            <div className="flex items-center gap-2">
              <label htmlFor="practice-cat" className="text-[11px] font-semibold uppercase tracking-wide text-ivory-100/70">
                Situation
              </label>
              <select
                id="practice-cat"
                className="rounded-lg border border-ivory-50/20 bg-ink-700 px-2 py-1 text-xs font-semibold text-ivory-50"
                value={category}
                onChange={(event) => setCategory(event.target.value as CategoryId | 'all')}
              >
                <option value="all">Any</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn !bg-saffron-500 !py-1.5 !text-xs hover:!bg-saffron-600" onClick={pickRandom}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              New phrase
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-saffron-600">Say this</p>
            <p className="knn mt-2 text-2xl font-semibold text-ink-800 sm:text-3xl" lang="kn">
              {target.kannada}
            </p>
            <p className="mt-1.5 text-sm font-medium italic text-ink-400">{target.transliteration}</p>
            <p className="mt-1 text-sm font-semibold text-ink-600">{target.english}</p>
            {target.pronunciationTip ? (
              <StatusLine tone="info">Pronunciation tip: {target.pronunciationTip}</StatusLine>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary !py-2"
                disabled={!capabilities.ttsSupported || !capabilities.anyVoiceAvailable}
                onClick={() => (playingId === target.id ? stop() : speakPhrase(target))}
              >
                {playingId === target.id ? <Square className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
                {playingId === target.id ? 'Stop' : 'Hear the target'}
              </button>
              <Link to={`/situations/${target.category}`} className="btn-ghost !py-2">
                See all in this situation
              </Link>
              <button
                type="button"
                className={cn('btn !py-2', progress.isFavorite(target.id) ? 'btn-accent' : 'btn-ghost')}
                onClick={() => progress.toggleFavorite(target.id)}
              >
                {progress.isFavorite(target.id) ? 'Saved' : 'Save this phrase'}
              </button>
            </div>
            {!capabilities.ttsSupported || !capabilities.anyVoiceAvailable ? (
              <p className="mt-2 text-[11px] text-ink-400">
                Playback is unavailable here, so use the transliteration line as your model.
              </p>
            ) : null}
          </div>

          {/* ---------------------------------------------------- mic controls */}
          <div className="border-t border-ink-100 bg-ivory-50 p-4 sm:p-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={toggleMic}
                disabled={micBlocked}
                aria-pressed={listening}
                className={cn(
                  'grid h-16 w-16 shrink-0 place-items-center rounded-full text-white transition',
                  micBlocked
                    ? 'cursor-not-allowed bg-ink-100 text-ink-400'
                    : listening
                      ? 'animate-pulse-ring bg-rose-600 hover:bg-rose-700'
                      : 'bg-ink-800 hover:bg-ink-700',
                )}
              >
                {listening ? <Square className="h-6 w-6" aria-hidden="true" /> : <Mic className="h-6 w-6" aria-hidden="true" />}
                <span className="sr-only">{listening ? 'Stop listening' : 'Start speaking'}</span>
              </button>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-sm font-bold text-ink-700">
                  {micBlocked
                    ? 'Microphone input is not available in this browser'
                    : listening
                      ? 'Listening — say the whole line, then tap stop'
                      : 'Tap to speak the phrase'}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-400">
                  {micBlocked
                    ? 'Recognition is not implemented here, so use the text box below: type what you would say and we compare it with the target.'
                    : 'Recognition uses kn-IN. If it fails or you deny permission, the text box keeps the whole exercise working.'}
                </p>
                {listening ? (
                  <p className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-700 sm:justify-start">
                    <Circle className="h-2.5 w-2.5 animate-ping fill-current" aria-hidden="true" />
                    {interim || '…'}
                  </p>
                ) : null}
              </div>
            </div>

            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                submit(typed, 'typed');
              }}
            >
              <label htmlFor="practice-input" className="label !mb-1 flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
                Type what you said (Kannada or transliteration)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="practice-input"
                  className="field"
                  placeholder="e.g. Dayavittu bus nildana ellide"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                />
                <button type="submit" className="btn-accent sm:w-auto">
                  Compare
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className="chip border-ink-100 bg-white text-ink-400 hover:text-ink-700" onClick={() => setTyped(target.kannada)}>
                  Fill in Kannada script
                </button>
                <button type="button" className="chip border-ink-100 bg-white text-ink-400 hover:text-ink-700" onClick={() => setTyped(target.transliteration)}>
                  Fill in transliteration
                </button>
                <button
                  type="button"
                  className="chip border-ink-100 bg-white text-ink-400 hover:text-ink-700"
                  onClick={() => {
                    setTyped('');
                    setHeard('');
                    setStatus({ kind: 'idle' });
                  }}
                >
                  Clear
                </button>
              </div>
            </form>

            {heard ? <StatusLine tone="info">Recognised: “{heard}”</StatusLine> : null}
            {status.kind === 'error' ? (
              <StatusLine tone="error">
                <MicOff className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {status.message}
              </StatusLine>
            ) : null}
            {status.kind === 'done' && !band ? <StatusLine tone="info">{status.message}</StatusLine> : null}

            {score !== null && band ? (
              <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink-800">Text match</h3>
                  <span className="text-2xl font-extrabold tabular-nums text-ink-800">{score}%</span>
                </div>
                <div className="mt-2">
                  <Meter value={score} label="Against the target sentence" tone={band.tone === 'good' ? 'good' : 'accent'} />
                </div>
                <p className="mt-2 text-[13px] font-semibold text-ink-600">{band.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
                  This compares the words you produced with the target words. It is not an acoustic
                  pronunciation score: no speech model can reliably judge Kannada phonemes in the browser,
                  and we would rather tell you that than show a made-up number.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {attempts.map((attempt, index) => (
                    <Chip key={`attempt-${index}`} tone={attempt >= 85 ? 'good' : attempt >= 60 ? 'accent' : 'warn'}>
                      {attempt}% {index === 0 ? 'latest' : ''}
                    </Chip>
                  ))}
                </div>
                <button type="button" className="btn-primary mt-3 !py-2" onClick={pickRandom}>
                  Next phrase
                </button>
              </div>
            ) : null}
          </div>
        </Card>

        {/* ------------------------------------------------------- practice log */}
        <Card className="lg:col-span-2 p-4">
          <h2 className="text-sm font-bold text-ink-700">Practice log</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">
            Best attempt per phrase, kept on this device. {progress.practice[target.id] ? 'This phrase already has one.' : 'Nothing recorded for this phrase yet.'}
          </p>
          <ul className="mt-3 space-y-2">
            {Object.values(progress.practice)
              .sort((a, b) => b.at.localeCompare(a.at))
              .slice(0, 6)
              .map((attempt) => (
                <li key={`${attempt.phraseId}-${attempt.at}`} className="rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="knn min-w-0 flex-1 truncate text-[13px] text-ink-700" lang="kn">
                      {attempt.targetKannada}
                    </span>
                    <span className="shrink-0 text-xs font-extrabold tabular-nums text-ink-800">{attempt.similarity}%</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-400">
                    {attempt.method === 'typed' ? 'typed' : 'spoken'} · {new Date(attempt.at).toLocaleString()}
                  </p>
                </li>
              ))}
            {!Object.keys(progress.practice).length ? (
              <li className="rounded-xl border border-dashed border-ink-100 px-3 py-6 text-center text-[12px] text-ink-400">
                Your attempts appear here once you compare a phrase.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
