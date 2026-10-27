import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { PHRASE_BY_ID } from '../data/phrases';
import { buildMatchPairs, buildQuestions, percentage, rng, shuffle } from '../lib/quiz';
import { useProgress } from '../components/ProgressContext';
import { PhraseCard } from '../components/PhraseCard';

type Phase = 'mcq' | 'match' | 'result';

export default function QuizPage() {
  const { progress, recordQuiz } = useProgress();
  const [seed, setSeed] = useState(() => Date.now());
  const questions = useMemo(() => buildQuestions(6, seed), [seed]);
  const pairs = useMemo(() => buildMatchPairs(5, seed + 1), [seed]);
  const rightOptions = useMemo(() => shuffle(pairs, rng(seed + 2)), [pairs, seed]);

  const [phase, setPhase] = useState<Phase>('mcq');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mcqCorrect, setMcqCorrect] = useState(0);
  const [misses, setMisses] = useState<string[]>([]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);

  const total = questions.length + pairs.length;
  const correct = mcqCorrect + matched.length;
  const score = percentage(correct, total);
  const question = questions[qIndex];

  const retry = () => {
    setSeed(Date.now() + Math.floor(Math.random() * 100000));
    setPhase('mcq'); setQIndex(0); setSelected(null);
    setMcqCorrect(0); setMisses([]); setLeftPick(null); setMatched([]); setWrong(false);
  };

  const selectAnswer = (answer: string) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === question.correct) setMcqCorrect((value) => value + 1);
    else setMisses((value) => [...value, question.phraseId]);
  };

  const nextQuestion = () => {
    setSelected(null);
    if (qIndex + 1 >= questions.length) setPhase('match');
    else setQIndex((value) => value + 1);
  };

  const pickRight = (phraseId: string) => {
    if (!leftPick || matched.includes(phraseId) || matched.includes(leftPick)) return;
    if (leftPick === phraseId) {
      const updated = [...matched, phraseId];
      setMatched(updated);
      setLeftPick(null);
      setWrong(false);
      if (updated.length === pairs.length) {
        const final = percentage(mcqCorrect + updated.length, total);
        recordQuiz(final);
        setPhase('result');
      }
    } else {
      setWrong(true);
      setLeftPick(null);
      window.setTimeout(() => setWrong(false), 1800);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Quick quiz</h1>
          <p className="mt-1 text-sm text-ink-500">Six meaning questions, then a five-pair matching round.</p>
        </div>
        <span className="chip border-saffron-200 bg-saffron-50 text-saffron-700">
          <Trophy className="h-3.5 w-3.5" /> Best {progress.bestQuiz}%
        </span>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-ivory-100" aria-label="Quiz progress">
        <div className="h-full rounded-full bg-saffron-500 transition-all" style={{ width: `${(correct / total) * 100}%` }} />
      </div>

      {phase === 'mcq' && question && (
        <section className="card animate-fade-up p-6">
          <p className="label">Question {qIndex + 1} of {questions.length}</p>
          <h2 className="mt-2 text-sm font-medium text-ink-500">What does this mean?</h2>
          <p lang="kn" className="font-kannada mt-3 text-3xl font-semibold text-ink-800">{question.kn}</p>
          <p className="mt-1 text-sm text-saffron-700">{question.rom}</p>

          <div className="mt-6 space-y-2">
            {question.options.map((option, index) => {
              const isCorrect = option === question.correct;
              const isSelected = option === selected;
              const revealed = selected !== null;
              return (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => selectAnswer(option)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    revealed && isCorrect ? 'border-leaf-500 bg-leaf-100 text-leaf-600'
                      : revealed && isSelected ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : revealed ? 'border-ivory-200 bg-white/60 text-ink-400'
                          : 'border-ivory-300 bg-white text-ink-700 hover:border-saffron-400 hover:shadow-card'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    {option}
                    {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                  </span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-5 animate-fade-up">
              <p className={`text-sm font-semibold ${selected === question.correct ? 'text-leaf-600' : 'text-rose-600'}`}>
                {selected === question.correct ? 'Correct!' : `Not quite — the answer is “${question.correct}”.`}
              </p>
              <button type="button" onClick={nextQuestion} className="btn-primary mt-3 w-full">
                {qIndex + 1 === questions.length ? 'Go to matching round' : 'Next question'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      )}

      {phase === 'match' && (
        <section className="card animate-fade-up p-6">
          <p className="label">Matching round</p>
          <h2 className="mt-2 text-lg font-bold text-ink-800">Match the Kannada to its meaning</h2>
          <p className="mt-1 text-sm text-ink-500">Tap a Kannada phrase, then tap its English meaning.</p>
          <p className="mt-3 text-xs font-semibold text-ink-400">{matched.length}/{pairs.length} matched</p>
          {wrong && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Not a pair — try again.</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              {pairs.map((pair) => (
                <button
                  key={`l-${pair.phraseId}`}
                  type="button"
                  disabled={matched.includes(pair.phraseId)}
                  onClick={() => { setLeftPick(pair.phraseId); setWrong(false); }}
                  className={`font-kannada w-full rounded-xl border px-3 py-3 text-left text-base transition ${
                    matched.includes(pair.phraseId) ? 'border-leaf-500 bg-leaf-100 text-leaf-600 opacity-70'
                      : leftPick === pair.phraseId ? 'border-saffron-500 bg-saffron-50'
                        : 'border-ivory-300 bg-white hover:border-saffron-400'
                  }`}
                >
                  {pair.kn}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {rightOptions.map((pair) => (
                <button
                  key={`r-${pair.phraseId}`}
                  type="button"
                  disabled={matched.includes(pair.phraseId)}
                  onClick={() => pickRight(pair.phraseId)}
                  className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                    matched.includes(pair.phraseId) ? 'border-leaf-500 bg-leaf-100 text-leaf-600 opacity-70'
                      : 'border-ivory-300 bg-white hover:border-saffron-400'
                  }`}
                >
                  {pair.en}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === 'result' && (
        <section className="card animate-pop-in p-7 text-center">
          <Trophy className="mx-auto h-12 w-12 text-saffron-500" />
          <h2 className="mt-4 text-3xl font-bold text-ink-800">{score}%</h2>
          <p className="mt-1 text-ink-600">{correct} of {total} correct · best {Math.max(progress.bestQuiz, score)}%</p>
          <p className="mt-2 text-sm text-ink-400">
            {score >= 85 ? 'Excellent — you are ready for a real conversation.'
              : score >= 50 ? 'Good start. Rehearse the misses below and try again.'
                : 'Keep going — repeat the situation pages, then come back.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={retry} className="btn-primary"><RotateCcw className="h-4 w-4" /> New quiz</button>
          </div>
          {misses.length > 0 && (
            <div className="mt-8 space-y-3 text-left">
              <h3 className="text-sm font-bold text-ink-700">Review these</h3>
              {misses.map((id) => PHRASE_BY_ID[id] && <PhraseCard key={id} phrase={PHRASE_BY_ID[id]} compact showSituation />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
