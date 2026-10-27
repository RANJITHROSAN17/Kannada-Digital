import { PHRASES, SITUATION_BY_ID } from '../data/phrases';
import type { Phrase } from '../types';
import { normalise } from './speech';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'i', 'me', 'my', 'is', 'am', 'are', 'do', 'does', 'did',
  'to', 'in', 'on', 'at', 'for', 'of', 'and', 'or', 'please', 'can', 'you',
  'how', 'what', 'where', 'when', 'should', 'want', 'need', 'say', 'saying',
]);

/**
 * Common learner intents. Regexes are matched against the normalised English
 * question; the listed phrase ids get a strong boost. This keeps the assistant
 * genuinely useful offline instead of being a naive substring filter.
 */
const INTENTS: { pattern: RegExp; phraseIds: string[]; hint: string }[] = [
  { pattern: /\b(how much|price|cost|rate|fare|expensive|discount|cheap)\b/, phraseIds: ['market-1', 'transport-3', 'market-3'], hint: 'asking about price' },
  { pattern: /\b(bus|train|station|stop|ticket|route|platform)\b/, phraseIds: ['transport-1', 'transport-2', 'transport-3', 'transport-4', 'transport-5'], hint: 'travelling by bus or train' },
  { pattern: /\b(mysuru|mysore|bengaluru|bangalore|hampi|coorg|gokarna|mangaluru|hubballi|airport|destination)\b/, phraseIds: ['transport-2', 'transport-1'], hint: 'confirming a destination' },
  { pattern: /\b(auto|rickshaw|taxi|cab|meter)\b/, phraseIds: ['transport-7', 'transport-8'], hint: 'taking an auto or taxi' },
  { pattern: /\b(fever|sick|ill|pain|hurt|headache|stomach|doctor|hospital)\b/, phraseIds: ['health-1', 'health-2', 'health-7'], hint: 'describing a health problem' },
  { pattern: /\b(medicine|tablet|dosage|dose|pharmacy|tablets)\b/, phraseIds: ['health-3', 'health-4', 'health-5', 'health-6'], hint: 'buying or taking medicine' },
  { pattern: /\b(food|eat|order|meal|spicy|water|restaurant|hotel|dinner|lunch)\b/, phraseIds: ['food-1', 'food-2', 'food-3', 'food-4'], hint: 'ordering food' },
  { pattern: /\b(where|direction|lost|left|right|straight|near|far|address)\b/, phraseIds: ['directions-1', 'directions-2', 'directions-6', 'directions-8'], hint: 'asking for directions' },
  { pattern: /\b(help|emergency|police|ambulance|danger|lost phone)\b/, phraseIds: ['emergency-1', 'emergency-2', 'emergency-3', 'emergency-4'], hint: 'getting urgent help' },
  { pattern: /\b(hello|hi|greet|thanks|thank you|sorry|please|bye)\b/, phraseIds: ['basics-1', 'basics-2', 'basics-3', 'basics-4'], hint: 'basic politeness' },
  { pattern: /\b(understand|repeat|slow|again|learn|kannada|speak)\b/, phraseIds: ['basics-7', 'basics-8', 'work-3', 'work-4', 'work-7'], hint: 'managing a conversation' },
  { pattern: /\b(work|office|college|class|meeting|name|introduce)\b/, phraseIds: ['work-1', 'work-2', 'work-6', 'work-8'], hint: 'college or workplace' },
  { pattern: /\b(buy|shop|shopping|vegetables|bag|bill|upi|pay)\b/, phraseIds: ['market-2', 'market-5', 'market-6', 'market-8'], hint: 'shopping' },
];

export function terms(text: string): string[] {
  return normalise(text)
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function phraseHaystack(phrase: Phrase): string {
  return normalise([phrase.en, phrase.rom, ...phrase.tags, SITUATION_BY_ID[phrase.situationId]?.title ?? ''].join(' '));
}

function score(phrase: Phrase, query: string, boosts: Map<string, number>): number {
  const q = normalise(query);
  const words = terms(query);
  const haystack = phraseHaystack(phrase);
  let points = 0;

  if (q && (normalise(phrase.en) === q || normalise(phrase.rom) === q)) points += 120;
  if (q && (haystack.includes(q) || normalise(phrase.en).includes(q))) points += 45;
  if (q && phrase.kn.includes(query.trim())) points += 100;

  for (const word of words) {
    if (haystack.split(' ').includes(word)) points += 12;
    else if (haystack.includes(word)) points += 6;
  }

  points += boosts.get(phrase.id) ?? 0;
  // Shorter, high-signal phrases win ties (easier to say in a real conversation).
  points += Math.max(0, 8 - phrase.kn.length / 6);
  return points;
}

/** Rank the bundled phrase dataset against a free-text query. */
export function searchPhrases(query: string, limit = 8): Phrase[] {
  if (!query.trim()) return [];
  const matching = INTENTS.filter((intent) => intent.pattern.test(normalise(query)));
  // A phrase boosted by several matching intents accumulates their evidence;
  // the per-intent weight is shared so no single broad intent dominates.
  const boosts = new Map<string, number>();
  for (const intent of matching) {
    for (const id of intent.phraseIds) {
      boosts.set(id, (boosts.get(id) ?? 0) + 60 / Math.max(1, matching.length));
    }
  }
  return PHRASES.map((phrase) => ({ phrase, points: score(phrase, query, boosts) }))
    .filter((entry) => entry.points > 8)
    .sort((a, b) => b.points - a.points || a.phrase.id.localeCompare(b.phrase.id))
    .slice(0, limit)
    .map((entry) => entry.phrase);
}

export interface AssistantAnswer {
  phrase: Phrase;
  hint: string;
  alternatives: Phrase[];
}

/**
 * Offline "ask in English" assistant: retrieves the most useful Kannada
 * sentence for a plain-English need. No API key and no network required.
 */
export function answerInEnglish(query: string): AssistantAnswer | null {
  const matches = searchPhrases(query, 4);
  if (!matches.length) return null;
  const hint = INTENTS.find((intent) => intent.pattern.test(normalise(query)))?.hint ?? 'your situation';
  return { phrase: matches[0], hint, alternatives: matches.slice(1) };
}
