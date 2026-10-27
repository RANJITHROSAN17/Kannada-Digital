import { useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { SCENES } from '../data/scenes';
import { PHRASE_BY_ID, SITUATION_BY_ID } from '../data/phrases';
import { Icon } from '../components/Icon';
import { PhraseCard } from '../components/PhraseCard';
import type { ReplyOption } from '../types';

export default function PracticePage() {
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [choice, setChoice] = useState<ReplyOption | null>(null);
  const [score, setScore] = useState(0);

  const scene = SCENES.find((item) => item.id === sceneId);

  const restart = () => { setTurn(0); setChoice(null); setScore(0); };
  const exit = () => { setSceneId(null); restart(); };
  const choose = (option: ReplyOption) => {
    setChoice(option);
    if (option.good) setScore((value) => value + 1);
  };
  const next = () => {
    setChoice(null);
    setTurn((value) => value + 1);
  };

  if (!scene) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-ink-800">Role-play practice</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Rehearse a real conversation before it happens. At every step you choose what to say and
            get a short coaching note explaining why the reply works (or does not).
          </p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCENES.map((item) => {
            const situation = SITUATION_BY_ID[item.situationId];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSceneId(item.id); restart(); }}
                className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ivory-100">
                  <Icon name={situation?.icon ?? 'Sparkles'} className={`h-5 w-5 ${situation?.accent ?? 'text-ink-500'}`} />
                </span>
                <h2 className="mt-4 text-base font-bold text-ink-800 group-hover:text-saffron-700">{item.title}</h2>
                <p className="mt-1 text-sm text-ink-500">{item.intro}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {item.turns.length} turns · {situation?.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const finished = turn >= scene.turns.length;
  const current = scene.turns[turn];
  const chosenPhrase = choice ? PHRASE_BY_ID[choice.phraseId] : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button type="button" onClick={exit} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-saffron-700">
        <ArrowLeft className="h-4 w-4" /> All scenes
      </button>

      <header className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label">Role-play</p>
            <h1 className="mt-1 text-xl font-bold text-ink-800">{scene.title}</h1>
          </div>
          <span className="chip border-saffron-200 bg-saffron-50 text-saffron-700">
            <Sparkles className="h-3.5 w-3.5" /> {score}/{scene.turns.length}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ivory-100">
          <div className="h-full rounded-full bg-saffron-500 transition-all" style={{ width: `${(Math.min(turn, scene.turns.length) / scene.turns.length) * 100}%` }} />
        </div>
      </header>

      {finished ? (
        <section className="card animate-pop-in p-7 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-leaf-500" />
          <h2 className="mt-4 text-2xl font-bold text-ink-800">Scene complete!</h2>
          <p className="mt-2 text-ink-600">
            You chose the recommended reply in <strong>{score} of {scene.turns.length}</strong> turns.
          </p>
          <p className="mt-1 text-sm text-ink-400">
            {score === scene.turns.length
              ? 'Perfect run — try the same scene without looking at the transliteration.'
              : 'Replay it and focus on the turns you missed; the coaching notes explain each choice.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} className="btn-primary"><RotateCcw className="h-4 w-4" /> Try again</button>
            <button type="button" onClick={exit} className="btn-soft">Choose another scene</button>
          </div>
        </section>
      ) : (
        <>
          <section className="card animate-fade-up p-5">
            <p className="label">They say · turn {turn + 1}</p>
            <p lang="kn" className="font-kannada mt-2 text-2xl font-semibold text-ink-800">{current.promptKn}</p>
            <p className="mt-1 text-sm font-medium text-saffron-700">{current.promptRom}</p>
            <p className="mt-2 text-sm text-ink-500">{current.promptEn}</p>
          </section>

          <section>
            <p className="label mb-2">What do you say?</p>
            <div className="space-y-2">
              {current.options.map((option, index) => {
                const phrase = PHRASE_BY_ID[option.phraseId];
                const disabled = choice !== null;
                const isChosen = choice?.phraseId === option.phraseId && index === current.options.findIndex((o) => o.phraseId === choice?.phraseId);
                return (
                  <button
                    key={`${option.phraseId}-${index}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => choose(option)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isChosen
                        ? option.good ? 'border-leaf-500 bg-leaf-100' : 'border-rose-300 bg-rose-50'
                        : disabled ? 'border-ivory-200 bg-white/60 opacity-60' : 'border-ivory-300 bg-white hover:border-saffron-400 hover:shadow-card'
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-xs font-bold text-ink-500">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-800">{option.label}</span>
                        {phrase && <span className="font-kannada mt-0.5 block text-sm text-ink-500">{phrase.kn}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {choice && chosenPhrase && (
            <section className="animate-fade-up space-y-3" aria-live="polite">
              <div className={`flex items-start gap-3 rounded-2xl border p-4 ${choice.good ? 'border-leaf-500 bg-leaf-100' : 'border-rose-300 bg-rose-50'}`}>
                {choice.good
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />
                  : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
                <div>
                  <p className="text-sm font-bold text-ink-800">{choice.good ? 'Nice choice' : 'Not the best reply'}</p>
                  <p className="mt-1 text-sm text-ink-600">{choice.feedback}</p>
                </div>
              </div>
              <PhraseCard phrase={chosenPhrase} compact />
              <button type="button" onClick={next} className="btn-primary w-full">
                {turn + 1 === scene.turns.length ? 'See result' : 'Continue conversation'}
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
