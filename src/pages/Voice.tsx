import { useState } from 'react';
import { Keyboard, Mic, Shuffle, Volume2 } from 'lucide-react';
import { PHRASES, SITUATIONS, phrasesForSituation } from '../data/phrases';
import { capabilities, listenOnce, similarity, speak } from '../lib/speech';
import { useProgress } from '../components/ProgressContext';
import { PhraseCard } from '../components/PhraseCard';

export default function VoicePage() {
  const { progress, recordVoice } = useProgress();
  const [phraseId, setPhraseId] = useState(PHRASES[0].id);
  const [status, setStatus] = useState('');
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const caps = capabilities();
  const phrase = PHRASES.find((item) => item.id === phraseId) ?? PHRASES[0];
  const best = progress.voiceBest[phrase.id] ?? 0;

  const select = (id: string) => { setPhraseId(id); setScore(null); setTyped(''); setStatus(''); };

  const evaluate = (heard: string) => {
    const value = similarity(heard, phrase.rom);
    setScore(value);
    recordVoice(phrase.id, value);
    setStatus(value >= 80 ? 'Great — that was very close!' : value >= 50 ? 'Good attempt — listen once more and repeat.' : 'Try again slowly, using the roman letters as a guide.');
  };

  const startListening = async () => {
    setListening(true);
    setStatus('Listening… say the phrase aloud.');
    const heard = await listenOnce();
    setListening(false);
    if (heard) { setTyped(heard); evaluate(heard); }
    else setStatus('Could not capture audio. Use the typed practice below — it scores the same way.');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-ink-800">Voice practice</h1>
        <p className="mt-1 text-sm text-ink-500">
          Hear a phrase, say it out loud, and get a forgiveness-based similarity score. Everything is
          processed in your browser — no audio is uploaded.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Browser capabilities">
        <span className={`chip ${caps.synthesis ? 'border-leaf-500 bg-leaf-100 text-leaf-600' : ''}`}>
          <Volume2 className="h-3.5 w-3.5" /> Audio {caps.synthesis ? 'available' : 'unavailable'}
        </span>
        <span className={`chip ${caps.kannadaVoice ? 'border-leaf-500 bg-leaf-100 text-leaf-600' : ''}`}>
          Kannada voice {caps.kannadaVoice ? 'installed' : 'not installed'}
        </span>
        <span className={`chip ${caps.recognition ? 'border-leaf-500 bg-leaf-100 text-leaf-600' : ''}`}>
          <Mic className="h-3.5 w-3.5" /> Mic {caps.recognition ? 'available' : 'not supported'}
        </span>
      </div>

      <section className="card p-5">
        <label htmlFor="phrase-select" className="label">Choose a phrase</label>
        <div className="mt-2 flex gap-2">
          <select
            id="phrase-select"
            value={phrase.id}
            onChange={(event) => select(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-ivory-300 bg-white px-3 py-2.5 text-sm text-ink-700"
          >
            {SITUATIONS.map((situation) => (
              <optgroup key={situation.id} label={situation.title}>
                {phrasesForSituation(situation.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.rom} — {item.en}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={() => select(PHRASES[Math.floor(Math.random() * PHRASES.length)].id)} className="btn-icon" aria-label="Random phrase" title="Surprise me">
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="card animate-fade-up p-6 text-center">
        <p className="label">Say this</p>
        <p lang="kn" className="font-kannada mt-3 text-3xl font-semibold text-ink-800">{phrase.kn}</p>
        <p className="mt-2 text-lg font-medium text-saffron-700">{phrase.rom}</p>
        <p className="mt-1 text-sm text-ink-500">{phrase.en}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => speak(phrase.kn)} className="btn-soft">
            <Volume2 className="h-4 w-4" /> Listen
          </button>
          <button
            type="button"
            onClick={startListening}
            disabled={listening || !caps.recognition}
            className={`btn-primary ${listening ? 'animate-pulse-ring' : ''}`}
          >
            <Mic className="h-4 w-4" /> {listening ? 'Listening…' : 'Speak it'}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-400">Best score for this phrase: {best}%</p>
      </section>

      {status && <p role="status" className="rounded-xl bg-ivory-100 px-4 py-3 text-sm text-ink-600">{status}</p>}

      {score !== null && (
        <section className="card animate-pop-in p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink-700">Similarity score</p>
            <p className="text-2xl font-bold text-saffron-600">{score}%</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ivory-100">
            <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-leaf-500' : score >= 50 ? 'bg-saffron-500' : 'bg-rose-400'}`} style={{ width: `${score}%` }} />
          </div>
          {typed && <p className="mt-3 text-sm text-ink-500">Heard / typed: <span className="font-medium text-ink-700">{typed}</span></p>}
        </section>
      )}

      <section className="card p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-700"><Keyboard className="h-4 w-4" /> Typed practice (works on every browser)</p>
        <p className="mt-1 text-sm text-ink-500">Type the romanised phrase as you would say it. Spelling differences are forgiven.</p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => { event.preventDefault(); if (typed.trim()) evaluate(typed); }}
        >
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={`e.g. ${phrase.rom}`}
            className="min-w-0 flex-1 rounded-xl border border-ivory-300 bg-white px-3 py-2.5 text-sm"
            aria-label="Type the phrase"
          />
          <button type="submit" className="btn-primary" disabled={!typed.trim()}>Check</button>
        </form>
      </section>

      <PhraseCard phrase={phrase} compact />
      {!caps.kannadaVoice && (
        <p className="text-xs leading-relaxed text-ink-400">
          Tip: Chrome and Edge on Windows/Android usually include a Kannada voice. If none is installed,
          the app still shows the transliteration and the typed practice path, so the demo never breaks.
        </p>
      )}
    </div>
  );
}
