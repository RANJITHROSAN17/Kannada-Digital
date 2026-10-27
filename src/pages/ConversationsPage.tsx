import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MessagesSquare,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { conversations, scenarioById } from '../data/conversations';
import { phrases } from '../data/phrases';
import { getCategory } from '../data/categories';
import { suggestPhrases } from '../utils/search';
import type { ConversationOption, ConversationScenario } from '../types';
import { useProgress } from '../hooks/useProgress';
import { speak } from '../services/speech';
import { Card, Chip, EmptyState, Meter, SectionHeading, ScriptText, StatusLine } from '../components/ui';
import { cn } from '../utils/cn';

function PlayLine({ text, label }: { text: string; label: string }) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        className="text-ink-400 transition hover:text-saffron-700"
        aria-label={label}
        title={label}
        onClick={() => {
          const result = speak(text, { rate: 0.82 });
          setNote(
            !result.started
              ? 'This browser cannot play audio. Read the transliteration instead.'
              : result.source === 'recording'
                ? 'Played recorded Kannada pronunciation'
                : result.usedKannadaVoice
                  ? `Played with ${result.voiceName}`
                  : `No Kannada voice installed — played with ${result.voiceName}, use the transliteration for exact sounds`,
          );
        }}
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>
      {note ? <span className="text-[10px] text-ink-400">{note}</span> : null}
    </span>
  );
}

/** Scenario picker. */
export function ConversationsPage() {
  const progress = useProgress();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeading level="h1"
        eyebrow="Role-play"
        title="Real-life conversation simulator"
        description="Six scenes that happen to everyone in Karnataka. Choose your reply, see what comes back, and read why it worked."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {conversations.map((scenario) => {
          const done = progress.completedScenarios.includes(scenario.id);
          const turns = scenario.nodes.length;
          return (
            <Link
              key={scenario.id}
              to={`/conversations/${scenario.id}`}
              className="card group flex flex-col p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink-800">{scenario.title}</h2>
                  <ScriptText size="sm" className="text-saffron-700">
                    {scenario.kannadaTitle}
                  </ScriptText>
                </div>
                {done ? (
                  <Chip tone="good">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Done
                  </Chip>
                ) : (
                  <Chip tone="accent">{turns} turns</Chip>
                )}
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-400">{scenario.setting}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  {getCategory(scenario.category).title}
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-700 group-hover:text-saffron-700">
                  {done ? 'Run again' : 'Start'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Card className="mt-6 flex items-start gap-3 p-4">
        <MessagesSquare className="mt-0.5 h-5 w-5 shrink-0 text-saffron-600" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-ink-400">
          Every scene is written from the bundled dataset — no API key, no network, nothing to break during a
          demo. “Type your own” searches the same phrasebook, so free answers still land on real Kannada.
        </p>
      </Card>
    </div>
  );
}

interface TranscriptEntry {
  id: string;
  side: 'other' | 'you';
  kannada: string;
  transliteration: string;
  english: string;
  note?: string;
  explanation?: string;
  tone?: ConversationOption['tone'];
  alternatives: ConversationOption['alternatives'];
}

function ScenarioRunner({ scenario }: { scenario: ConversationScenario }) {
  const progress = useProgress();
  const [nodeIndex, setNodeIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: 'open',
      side: 'other',
      kannada: scenario.nodes[0].line.kannada,
      transliteration: scenario.nodes[0].line.transliteration,
      english: scenario.nodes[0].line.english,
      note: scenario.nodes[0].line.note,
      alternatives: [],
    },
  ]);
  const [lastOption, setLastOption] = useState<TranscriptEntry | null>(null);
  const [finished, setFinished] = useState(false);
  const [ownText, setOwnText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const node = scenario.nodes[Math.min(nodeIndex, scenario.nodes.length - 1)];

  const choose = (option: ConversationOption) => {
    const you: TranscriptEntry = {
      id: `${option.id}-you`,
      side: 'you',
      kannada: option.kannada,
      transliteration: option.transliteration,
      english: option.english,
      alternatives: [],
    };
    const other: TranscriptEntry = {
      id: `${option.id}-other`,
      side: 'other',
      kannada: option.reply.kannada,
      transliteration: option.reply.transliteration,
      english: option.reply.english,
      note: option.reply.note,
      explanation: option.explanation,
      tone: option.tone,
      alternatives: option.alternatives,
    };
    setTranscript((list) => [...list, you, other]);
    setLastOption(other);
    setOwnText('');

    if (option.next === 'end') {
      setFinished(true);
      progress.completeScenario(scenario.id);
    } else {
      const nextIndex = scenario.nodes.findIndex((item) => item.id === option.next);
      if (nextIndex >= 0) {
        setNodeIndex(nextIndex);
        setTranscript((list) => [
          ...list,
          {
            id: `${option.next}-${nextIndex}`,
            side: 'other',
            kannada: scenario.nodes[nextIndex].line.kannada,
            transliteration: scenario.nodes[nextIndex].line.transliteration,
            english: scenario.nodes[nextIndex].line.english,
            note: scenario.nodes[nextIndex].line.note,
            alternatives: [],
          },
        ]);
      }
    }
    const anchor = bottomRef.current;
    if (anchor && typeof anchor.scrollIntoView === 'function') {
      window.requestAnimationFrame(() => anchor.scrollIntoView({ block: 'end', behavior: 'smooth' }));
    }
  };

  const reset = () => {
    setNodeIndex(0);
    setFinished(false);
    setLastOption(null);
    setOwnText('');
    setTranscript([
      {
        id: 'open',
        side: 'other',
        kannada: scenario.nodes[0].line.kannada,
        transliteration: scenario.nodes[0].line.transliteration,
        english: scenario.nodes[0].line.english,
        note: scenario.nodes[0].line.note,
        alternatives: [],
      },
    ]);
  };

  /** Free-text answers resolve against the real phrasebook, never a mock AI. */
  const suggestions = useMemo(
    () => (ownText.trim() ? suggestPhrases(ownText, phrases, 3) : []),
    [ownText],
  );

  const useSuggestion = (kannada: string) => {
    const match = node.options.find((option) => option.kannada === kannada);
    if (match) {
      choose(match);
      return;
    }
    const phrase = phrases.find((item) => item.kannada === kannada);
    if (!phrase) return;
    const custom: TranscriptEntry = {
      id: `typed-${Date.now()}`,
      side: 'you',
      kannada: phrase.kannada,
      transliteration: phrase.transliteration,
      english: phrase.english,
      alternatives: [],
    };
    // A phrasebook line that is not one of this scene's scripted replies still
    // works: the scene keeps going from the next scripted turn, so a free
    // answer never dead-ends the role-play. The coaching note explains that the
    // line came from the phrasebook rather than from this scene.
    const coaching =
      'That line comes from the phrasebook rather than this scene, so the other person simply picks the conversation back up.';
    setOwnText('');

    const isLastNode = nodeIndex === scenario.nodes.length - 1;
    if (isLastNode) {
      setTranscript((list) => [
        ...list,
        custom,
        {
          id: `typed-reply-${Date.now()}`,
          side: 'other',
          kannada: 'ಸರಿ, ಅರ್ಥವಾಯ್ತು. ಧನ್ಯವಾದಗಳು.',
          transliteration: 'Sari, arthavaytu. Dhanyavadagalu.',
          english: 'Okay, understood. Thank you.',
          explanation: coaching,
          alternatives: [],
        },
      ]);
      setLastOption({
        id: `typed-coaching-${Date.now()}`,
        side: 'other',
        kannada: '',
        transliteration: '',
        english: '',
        explanation: coaching,
        alternatives: [],
      });
      setFinished(true);
      progress.completeScenario(scenario.id);
      return;
    }

    const nextIndex = nodeIndex + 1;
    const nextLine = scenario.nodes[nextIndex].line;
    setTranscript((list) => [
      ...list,
      custom,
      {
        id: `next-${nextIndex}`,
        side: 'other',
        kannada: nextLine.kannada,
        transliteration: nextLine.transliteration,
        english: nextLine.english,
        note: nextLine.note,
        explanation: coaching,
        alternatives: [],
      },
    ]);
    setLastOption({
      id: `typed-coaching-${Date.now()}`,
      side: 'other',
      kannada: nextLine.kannada,
      transliteration: nextLine.transliteration,
      english: nextLine.english,
      explanation: coaching,
      alternatives: [],
    });
    setNodeIndex(nextIndex);
  };

  const percent = Math.round(
    ((finished ? scenario.nodes.length : nodeIndex) / scenario.nodes.length) * 100,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3 flex h-full flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-ink-800 px-4 py-3 text-ivory-50">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold">{scenario.title}</h1>
            <p className="truncate text-[11px] text-ivory-100/70">{scenario.setting}</p>
          </div>
          <button type="button" onClick={reset} className="btn !bg-ivory-50/10 !py-1.5 !text-[11px] hover:!bg-ivory-50/20">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restart
          </button>
        </div>

        <div className="scroll-slim max-h-[52vh] flex-1 space-y-3 overflow-y-auto bg-ivory-50 p-4">
          {transcript.map((entry) => (
            <div
              key={entry.id}
              className={cn('flex', entry.side === 'you' ? 'justify-end' : 'justify-start')}
              aria-live="polite"
            >
              <div
                className={cn(
                  'max-w-[85%] animate-pop-in rounded-2xl px-3.5 py-2.5 shadow-sm',
                  entry.side === 'you'
                    ? 'rounded-br-md bg-ink-800 text-ivory-50'
                    : 'rounded-bl-md border border-ink-100 bg-white text-ink-800',
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  {entry.side === 'you' ? 'You said' : 'They say'}
                </p>
                <p className="knn mt-1 text-lg font-semibold leading-relaxed" lang="kn">
                  {entry.kannada}
                </p>
                <p className={cn('text-[12px] italic', entry.side === 'you' ? 'text-ivory-100/70' : 'text-ink-400')}>
                  {entry.transliteration}
                </p>
                <p className={cn('mt-0.5 text-[13px] font-medium', entry.side === 'you' ? 'text-saffron-200' : 'text-ink-600')}>
                  {entry.english}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <PlayLine text={entry.kannada} label={`Play ${entry.side === 'you' ? 'your line' : 'their line'}`} />
                  {entry.note ? (
                    <span className="text-[10px] text-ink-400">{entry.note}</span>
                  ) : null}
                </div>
                {entry.explanation ? (
                  <p
                    className={cn(
                      'mt-2 rounded-xl border px-2.5 py-2 text-[12px] leading-relaxed',
                      entry.tone === 'risky'
                        ? 'border-amber-300/70 bg-amber-50 text-amber-900'
                        : 'border-leaf-500/25 bg-leaf-100 text-leaf-600',
                    )}
                  >
                    <span className="font-bold">{entry.tone === 'risky' ? 'Careful — ' : 'Why this works: '}</span>
                    {entry.explanation}
                  </p>
                ) : null}
                {entry.alternatives?.length ? (
                  <div className="mt-2 border-t border-ink-100 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">You could also say</p>
                    <ul className="mt-1 space-y-1.5">
                      {entry.alternatives.map((alt) => (
                        <li key={alt.kannada} className="rounded-lg bg-ivory-50 px-2 py-1.5">
                          <span className="knn text-[13px] text-ink-700" lang="kn">
                            {alt.kannada}
                          </span>
                          <span className="block text-[11px] italic text-ink-400">{alt.transliteration}</span>
                          <span className="block text-[11px] text-ink-500">{alt.english}</span>
                          {alt.note ? <span className="block text-[10px] text-ink-400">{alt.note}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {finished ? (
            <div className="animate-fade-up rounded-2xl border border-leaf-500/30 bg-leaf-100 p-3.5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-leaf-600">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Scene complete
              </h3>
              <ul className="mt-2 space-y-1.5">
                {scenario.takeaways.map((tip) => (
                  <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-ink-600">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron-600" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink-100 p-4">
          {finished ? (
            <div className="flex flex-wrap gap-2">
              {scenario.nodes[0] ? (
                <button type="button" className="btn-primary !py-2" onClick={reset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Run it again
                </button>
              ) : null}
              <Link to="/conversations" className="btn-ghost !py-2">
                Pick another scene
              </Link>
              <Link to="/favorites" className="btn-ghost !py-2">
                Review saved phrases
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-400">Your reply</p>
              <ul className="space-y-2">
                {node.options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => choose(option)}
                      className="w-full rounded-xl border border-ink-100 bg-white p-3 text-left transition hover:border-saffron-300 hover:bg-saffron-50 focus-visible:border-saffron-400"
                    >
                      <span className="knn block text-[15px] font-semibold text-ink-800" lang="kn">
                        {option.kannada}
                      </span>
                      <span className="mt-0.5 block text-[12px] italic text-ink-400">{option.transliteration}</span>
                      <span className="mt-0.5 block text-[13px] font-medium text-ink-600">{option.english}</span>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-saffron-700">
                        Say this
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <form
                className="mt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const first = suggestions[0];
                  if (first) useSuggestion(first.phrase.kannada);
                }}
              >
                <label htmlFor="own-line" className="label">
                  Or type what you want to say (English or Kannada)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="own-line"
                    className="field"
                    placeholder="e.g. I want to ask how far it is"
                    value={ownText}
                    onChange={(event) => setOwnText(event.target.value)}
                  />
                  <button type="submit" className="btn-accent sm:w-auto" disabled={!suggestions.length}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Use best match
                  </button>
                </div>
                {ownText.trim() ? (
                  <div className="mt-2 space-y-1.5">
                    {suggestions.length ? (
                      suggestions.map((hit) => (
                        <button
                          key={hit.phrase.id}
                          type="button"
                          onClick={() => useSuggestion(hit.phrase.kannada)}
                          className="flex w-full items-center gap-2 rounded-lg border border-ink-100 bg-ivory-50 px-2.5 py-1.5 text-left hover:border-saffron-300"
                        >
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-saffron-600" aria-hidden="true" />
                          <span className="knn min-w-0 flex-1 truncate text-[13px] text-ink-700" lang="kn">
                            {hit.phrase.kannada}
                          </span>
                          <span className="shrink-0 text-[11px] text-ink-400">{hit.phrase.english}</span>
                        </button>
                      ))
                    ) : (
                      <StatusLine tone="warn">
                        No phrasebook match for that yet — pick one of the suggested replies instead.
                      </StatusLine>
                    )}
                  </div>
                ) : null}
              </form>
            </>
          )}
        </div>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink-700">Scene progress</h2>
          <div className="mt-3">
            <Meter value={percent} label={`Turn ${Math.min(nodeIndex + 1, scenario.nodes.length)} of ${scenario.nodes.length}`} />
          </div>
          <dl className="mt-3 space-y-2 text-[12px]">
            <div>
              <dt className="font-bold uppercase tracking-wide text-ink-400">You are</dt>
              <dd className="text-ink-600">{scenario.whoYouAre}</dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wide text-ink-400">Goal</dt>
              <dd className="text-ink-600">{scenario.goal}</dd>
            </div>
          </dl>
        </Card>

        {lastOption?.explanation ? (
          <Card className="p-4">
            <h2 className="text-sm font-bold text-ink-700">Coaching note</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{lastOption.explanation}</p>
          </Card>
        ) : null}

        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink-700">Phrases to keep</h2>
          <p className="mt-0.5 text-[11px] text-ink-400">
            Saved lines reappear on the My Favorites page and work offline.
          </p>
          <ul className="mt-3 space-y-2">
            {phrases
              .filter((phrase) => phrase.category === scenario.category)
              .slice(0, 4)
              .map((phrase) => (
                <li key={phrase.id}>
                  <div className="rounded-xl border border-ink-100 bg-ivory-50 px-3 py-2">
                    <span className="knn block text-[13px] font-semibold text-ink-700" lang="kn">
                      {phrase.kannada}
                    </span>
                    <span className="block text-[11px] text-ink-400">{phrase.english}</span>
                    <div className="mt-1.5 flex items-center justify-between">
                      <button
                        type="button"
                        className="chip border-ink-100 bg-white text-ink-500 hover:text-saffron-700"
                        onClick={() => progress.toggleFavorite(phrase.id)}
                      >
                        {progress.isFavorite(phrase.id) ? 'Saved' : 'Save'}
                      </button>
                      <PlayLine text={phrase.kannada} label="Play phrase" />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function ConversationDetailPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const scenario = scenarioId ? scenarioById(scenarioId) : undefined;

  if (!scenario) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="That scene is not in the bundle"
          description={`Available scenes: ${conversations.map((item) => item.title).join(', ')}.`}
          action={
            <Link to="/conversations" className="btn-primary mt-1">
              Back to conversations
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Link
        to="/conversations"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400 hover:text-ink-700"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
        All scenes
      </Link>
      <ScenarioRunner key={scenario.id} scenario={scenario} />
    </div>
  );
}
