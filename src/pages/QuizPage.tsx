import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Check,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  Shuffle,
  Target,
  Volume2,
  X,
} from 'lucide-react';
import { generateQuiz, buildMatchRound, createRng, quizTypes } from '../data/quiz';
import { phraseById } from '../data/phrases';
import type { MatchPair, QuizQuestion } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useSpeech } from '../hooks/useSpeech';
import { speak } from '../services/speech';
import { hasPronunciationAudio } from '../services/pronunciationAudio';
import { PhraseCard } from '../components/PhraseCard';
import { Card, Chip, Meter, SectionHeading, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

type Phase = 'intro' | 'quiz' | 'match' | 'result';

interface Answer {
  questionId: string;
  chosen: number;
  correct: boolean;
}

/** One quiz attempt, seeded so a retry genuinely changes the mix. */
function buildAttempt(seed: number, size: number) {
  const rng = createRng(seed);
  return { questions: generateQuiz(size, rng), pairs: buildMatchRound(5, rng) };
}

function MatchRound({
  pairs,
  onDone,
}: {
  pairs: MatchPair[];
  onDone: (correct: number, total: number) => void;
}) {
  const shuffledEnglish = useMemo(() => pairs.slice().reverse(), [pairs]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  const matchedCount = Object.keys(resolved).length;

  const chooseKannada = (pairId: string) => {
    if (!selectedEnglish) return;
    if (selectedEnglish === pairId) {
      const next = { ...resolved, [pairId]: pairId };
      setResolved(next);
      setSelectedEnglish(null);
      setWrongPair(null);
      if (Object.keys(next).length === pairs.length) {
        onDone(pairs.length, pairs.length);
      }
      return;
    }
    setWrongPair(pairId);
    // A wrong tap is feedback, not a penalty: clear it after a beat.
    window.setTimeout(() => setWrongPair(null), 650);
  };

  const finishWithErrors = () => onDone(Object.keys(resolved).length, pairs.length);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink-800">Matching round</h2>
          <p className="text-[13px] text-ink-400">
            Tap an English meaning, then its Kannada line. {matchedCount}/{pairs.length} matched.
          </p>
        </div>
        <Chip tone="accent">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          Matching round
        </Chip>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">English meaning</p>
          {shuffledEnglish.map((pair) => {
            const done = Boolean(resolved[pair.id]);
            const active = selectedEnglish === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                disabled={done}
                aria-pressed={active}
                onClick={() => setSelectedEnglish(active ? null : pair.id)}
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-left text-[13px] font-medium transition',
                  done
                    ? 'border-leaf-500/30 bg-leaf-100 text-leaf-600'
                    : active
                      ? 'border-saffron-400 bg-saffron-50 text-ink-800'
                      : 'border-ink-100 bg-white text-ink-600 hover:border-saffron-300',
                )}
              >
                {done ? <Check className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" /> : null}
                {pair.english}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Kannada</p>
          {pairs.map((pair) => {
            const done = Boolean(resolved[pair.id]);
            return (
              <button
                key={pair.id}
                type="button"
                disabled={done || !selectedEnglish}
                onClick={() => chooseKannada(pair.id)}
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-left transition',
                  done
                    ? 'border-leaf-500/30 bg-leaf-100'
                    : wrongPair === pair.id
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-ink-100 bg-white hover:border-saffron-300',
                  !selectedEnglish && !done && 'opacity-60',
                )}
              >
                <span className={cn('knn text-[15px] font-semibold', done ? 'text-leaf-600' : 'text-ink-800')} lang="kn">
                  {pair.kannada}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <StatusLine tone={wrongPair ? 'warn' : 'info'}>
        {wrongPair
          ? 'Not that one. Read the transliteration and try the other line — no penalty, this is practice.'
          : matchedCount === pairs.length
            ? 'All matched.'
            : 'Pairs lock in as you go.'}
      </StatusLine>

      {matchedCount < pairs.length ? (
        <button type="button" className="btn-ghost mt-3 !py-2" onClick={finishWithErrors}>
          Skip the rest ({pairs.length - matchedCount} left)
        </button>
      ) : null}
    </Card>
  );
}

export function QuizPage() {
  const progress = useProgress();
  const { capabilities } = useSpeech();
  const [heardAnswer, setHeardAnswer] = useState(false);
  const [size, setSize] = useState(10);
  const [seed, setSeed] = useState(() => Date.now());
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [matchScore, setMatchScore] = useState<{ correct: number; total: number } | null>(null);
  const startedAt = useRef<number>(0);

  const attempt = useMemo(() => buildAttempt(seed, size), [seed, size]);
  const question: QuizQuestion | undefined = attempt.questions[index];
  const listenOption = question?.type === 'listen' ? question.options[question.answerIndex] : '';
  const canPlayListen =
    hasPronunciationAudio(listenOption) ||
    (capabilities.ttsSupported && capabilities.anyVoiceAvailable);

  const score = useMemo(() => {
    const mcq = answers.filter((answer) => answer.correct).length;
    return mcq + (matchScore?.correct ?? 0);
  }, [answers, matchScore]);
  const total = attempt.questions.length + (matchScore?.total ?? 5);

  // Reset the listening helper whenever the question changes.
  useEffect(() => setHeardAnswer(false), [index, phase]);

  const answer = useCallback(
    (optionIndex: number) => {
      if (!question || chosen !== null) return;
      const correct = optionIndex === question.answerIndex;
      setChosen(optionIndex);
      setAnswers((list) => [...list, { questionId: question.id, chosen: optionIndex, correct }]);
    },
    [chosen, question],
  );

  const next = () => {
    setChosen(null);
    if (index + 1 < attempt.questions.length) {
      setIndex((value) => value + 1);
      return;
    }
    setPhase('match');
  };

  const start = () => {
    setSeed(Date.now());
    setHeardAnswer(false);
    setIndex(0);
    setAnswers([]);
    setChosen(null);
    setMatchScore(null);
    startedAt.current = Date.now();
    setPhase('quiz');
  };

  const finishMatch = (correct: number, matchTotal: number) => {
    setMatchScore({ correct, total: matchTotal });
    progress.recordQuiz({
      score: answers.filter((a) => a.correct).length + correct,
      total: attempt.questions.length + matchTotal,
      durationMs: Date.now() - startedAt.current,
      missed: answers.filter((a) => !a.correct).map((a) => a.questionId),
    });
    setPhase('result');
  };

  const missedQuestions = answers.filter((answerItem) => !answerItem.correct);
  const missedPhrases = missedQuestions
    .map((answerItem) => attempt.questions.find((q) => q.id === answerItem.questionId))
    .map((questionItem) => (questionItem?.sourcePhraseId ? phraseById(questionItem.sourcePhraseId) : undefined))
    .filter((phrase): phrase is NonNullable<typeof phrase> => Boolean(phrase));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow="Guided practice"
        title="Quiz yourself before you need it"
        description="Four question types built from the same reviewed dataset: meaning both ways, listening, and real-life judgement. Repeated attempts keep your best score."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Best score</p>
          <p className="mt-1 text-xl font-extrabold text-ink-800">
            {progress.bestQuiz ? `${progress.bestQuiz.score}/${progress.bestQuiz.total}` : '—'}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Attempts</p>
          <p className="mt-1 text-xl font-extrabold text-ink-800">{progress.quizAttempts}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Questions available</p>
          <p className="mt-1 text-xl font-extrabold text-ink-800">
            {attempt.questions.length + 5}
            <span className="ml-1 text-[11px] font-semibold text-ink-400">this round</span>
          </p>
        </Card>
      </div>

      {phase === 'intro' ? (
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink-800">
            <Target className="h-4 w-4 text-saffron-600" aria-hidden="true" />
            Set your round
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
            Questions are drawn fresh from the {attempt.questions.length + 5}-item pool every time, so a
            second attempt is never the same test. A matching round closes every attempt.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Length</span>
            {[6, 10, 14].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => setSize(option)}
                className={cn(
                  'chip transition',
                  size === option
                    ? 'border-ink-600 bg-ink-800 text-ivory-50'
                    : 'border-ink-100 bg-white text-ink-500 hover:text-ink-800',
                )}
              >
                {option} questions
              </button>
            ))}
          </div>
          <button type="button" className="btn-accent mt-4" onClick={start}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Start quiz
          </button>
        </Card>
      ) : null}

      {phase === 'quiz' && question ? (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Chip tone="info">
              {index + 1}/{attempt.questions.length}
            </Chip>
            <div className="flex items-center gap-1.5">
              <Chip tone="accent">{quizTypes[question.type]}</Chip>
              <Chip tone="neutral">{question.category}</Chip>
            </div>
          </div>

          <div className="mt-3">
            <Meter value={((index + (chosen !== null ? 1 : 0)) / attempt.questions.length) * 100} label="Round progress" showValue={false} />
          </div>

          {question.promptKannada ? (
            <p className="knn mt-4 rounded-xl border border-ink-100 bg-ivory-50 p-3.5 text-center text-2xl font-semibold text-ink-800" lang="kn">
              {question.promptKannada}
            </p>
          ) : null}

          <h2 className="mt-3 whitespace-pre-line text-[15px] font-bold leading-relaxed text-ink-700">
            {question.prompt}
          </h2>
          {question.type === 'listen' ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 bg-ivory-50 p-3">
              <button
                type="button"
                className="btn-primary !py-1.5 !text-xs"
                disabled={!canPlayListen || heardAnswer}
                onClick={() => {
                  // The audio source is the correct option itself: the learner
                  // must recognise it, not read it.
                  speak(listenOption, { rate: 0.8 });
                  setHeardAnswer(true);
                }}
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                {heardAnswer ? 'Play again' : 'Play the line'}
              </button>
              <span className="text-[11px] text-ink-400">
                {canPlayListen
                  ? 'Listen once, then pick what you heard.'
                  : 'Audio is unavailable here, so read the options instead — the listening skill is the same.'}
              </span>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.answerIndex;
              const isChosen = optionIndex === chosen;
              const revealed = chosen !== null;
              return (
                <li key={`${question.id}-${optionIndex}`}>
                  <button
                    type="button"
                    disabled={revealed}
                    onClick={() => answer(optionIndex)}
                    className={cn(
                      'w-full rounded-xl border px-3.5 py-2.5 text-left transition',
                      !revealed && 'border-ink-100 bg-white hover:border-saffron-300 hover:bg-saffron-50',
                      revealed && isCorrect && 'border-leaf-500/40 bg-leaf-100',
                      revealed && isChosen && !isCorrect && 'border-rose-300 bg-rose-50',
                      revealed && !isCorrect && !isChosen && 'border-ink-100 bg-white opacity-60',
                    )}
                  >
                    <span className="flex items-start gap-2">
                      {revealed && isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" aria-hidden="true" />
                      ) : null}
                      {revealed && isChosen && !isCorrect ? (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                      ) : null}
                      <span className={cn('knn text-[15px] font-medium text-ink-800', !/[\u0c80-\u0cff]/.test(option) && '!font-sans')}>
                        {option}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {chosen !== null ? (
            <div className="mt-3 animate-fade-up space-y-3">
              <StatusLine tone={answers[answers.length - 1]?.correct ? 'good' : 'warn'}>
                {answers[answers.length - 1]?.correct ? 'Correct. ' : 'Not quite. '}
                {question.explanation}
              </StatusLine>
              <button type="button" className="btn-primary" onClick={next}>
                {index + 1 === attempt.questions.length ? 'Go to matching round' : 'Next question'}
              </button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {phase === 'match' ? (
        <MatchRound
          pairs={attempt.pairs}
          onDone={(correct, matchTotal) => {
            setMatchScore({ correct, total: matchTotal });
            window.setTimeout(() => finishMatch(correct, matchTotal), 350);
          }}
        />
      ) : null}

      {phase === 'result' ? (
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-saffron-100 text-saffron-700">
              <Award className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-3 text-3xl font-extrabold text-ink-800">
              {score}
              <span className="text-lg font-bold text-ink-400">/{total}</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-400">
              {Math.round((score / Math.max(total, 1)) * 100)}% correct ·{' '}
              {progress.bestQuiz && progress.bestQuiz.score === score
                ? 'this is your best score'
                : `best so far ${progress.bestQuiz?.score ?? 0}/${progress.bestQuiz?.total ?? total}`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" className="btn-accent" onClick={start}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                New round
              </button>
              <Link to="/phrasebook" className="btn-ghost">
                Back to phrasebook
              </Link>
            </div>
          </Card>

          {missedPhrases.length ? (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">
                Review these {missedPhrases.length} phrase{missedPhrases.length === 1 ? '' : 's'}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {missedPhrases.map((phrase) => (
                  <li key={phrase.id}>
                    <PhraseCard phrase={phrase} compact />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <StatusLine tone="good">
              Clean run — every question was right. Try a longer round or the situations you have not opened.
            </StatusLine>
          )}
        </div>
      ) : null}
    </div>
  );
}
