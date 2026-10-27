import type { CategoryId, Phrase } from '../types';
import { phrases } from '../data/phrases';
import { categories } from '../data/categories';
import { suggestPhrases, type ScoredPhrase } from '../utils/search';

/**
 * The "What should I say?" helper.
 *
 * Default mode is `offline`: it retrieves from the bundled dataset, so it
 * works with no network, no key and no backend — which is what a hackathon demo
 * needs to be reliable. If (and only if) a developer supplies their own proxy
 * URL, the same question is additionally sent there and the answers are
 * merged. The provider secret never lives in this app: the proxy holds it.
 */

export type AssistantMode = 'offline' | 'proxy';

const PROXY_URL = (import.meta.env.VITE_AI_PROXY_URL ?? '').trim();
const MODEL_LABEL = (import.meta.env.VITE_AI_MODEL_LABEL ?? '').trim();

export const assistantMode: AssistantMode = PROXY_URL ? 'proxy' : 'offline';
export const assistantLabel = PROXY_URL ? MODEL_LABEL || 'custom proxy' : 'offline dataset retrieval';

export interface AssistantAnswer {
  mode: AssistantMode;
  /** Best-matching phrases from the bundled dataset. */
  suggestions: ScoredPhrase[];
  /** A short "how to handle this moment" note, generated from the data. */
  guidance: string;
  /** Free text from the optional proxy, when configured. */
  extra?: string;
  degraded?: string;
}

const CATEGORY_HINTS: Record<CategoryId, string> = {
  transport: 'Name the place first, then the ask. Bus and auto conversations in Karnataka run on destinations and numbers.',
  shopping: 'Lead with the quantity or the item, then ask the price. Prices are quoted in rupees per kilo or per piece.',
  food: 'Order everything in one sentence — drink plus food — and ask for the bill separately at the end.',
  health: 'Give duration, body part and pain. Doctors answer best to short factual sentences; confirm dosage out loud.',
  campus: 'Politeness verbs (ಹೇಳಿ, ಕೊಡಿ, ಮಾಡಿ) carry the tone. Admitting you are still learning is respected, not penalised.',
  directions: 'Ask for the place, then confirm with ಎಷ್ಟು ದೂರ? and ಇಲ್ಲಿಂದ ನಡೆದೊಂದು ಆಗುತ್ತದೆಯೇ? before you start walking.',
  everyday: 'One greeting and one ಧನ್ಯವಾದಗಳು change how a whole interaction goes. Keep ನೀವು forms with anyone older.',
  travel: 'Confirm money, timings and what is included before you hand over an ID or a bag.',
};

function buildGuidance(hits: ScoredPhrase[]): string {
  if (!hits.length) {
    return 'Nothing in the bundled phrasebook matches that yet. Try one keyword such as "bus", "water", "price", "fever" or "where", or browse the situations.';
  }
  const category = hits[0].phrase.category;
  const count = new Set(hits.map((hit) => hit.phrase.category)).size;
  const base = CATEGORY_HINTS[category];
  if (count > 1) {
    return `${base} Matching phrases were found in ${count} situations, so check the category chip on each card.`;
  }
  return `${base} Everything below comes from the "${categories.find((c) => c.id === category)?.title}" situation.`;
}

export interface AskOptions {
  /** Limit the search to one situation, e.g. from inside a scenario page. */
  category?: CategoryId;
  dataset?: Phrase[];
  signal?: AbortSignal;
}

export async function askAssistant(question: string, options: AskOptions = {}): Promise<AssistantAnswer> {
  const dataset = options.dataset ?? phrases;
  const trimmed = question.trim();

  if (!trimmed) {
    return { mode: assistantMode, suggestions: [], guidance: 'Type what you are trying to say, in English.' };
  }

  const scoped = options.category ? dataset.filter((phrase) => phrase.category === options.category) : dataset;
  const suggestions = suggestPhrases(trimmed, scoped.length ? scoped : dataset, 5);
  const answer: AssistantAnswer = {
    mode: assistantMode,
    suggestions,
    guidance: buildGuidance(suggestions),
  };

  if (!PROXY_URL) return answer;

  // Optional augmentation. Failure is never fatal: the offline answer is
  // already useful, so a broken proxy only adds a note.
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: trimmed,
        // The proxy is allowed to be a plain echo: we give it the same context
        // a human tutor would see.
        context: suggestions.slice(0, 3).map((hit) => hit.phrase),
      }),
      signal: options.signal,
    });
    if (!response.ok) throw new Error(`proxy responded ${response.status}`);
    const data = (await response.json()) as { reply?: string; text?: string };
    const reply = (data.reply ?? data.text ?? '').trim();
    if (reply) answer.extra = reply;
  } catch (error) {
    answer.degraded = `AI proxy unavailable (${
      error instanceof Error ? error.message : 'unknown error'
    }). Showing offline dataset answers only.`;
  }
  return answer;
}
