/**
 * Shared domain types for Kannada Saathi.
 *
 * Everything the app renders comes from the typed datasets in `src/data`.
 * There is no server: phrase review status, categories and progress shapes all
 * live here so data + UI + tests agree on one contract.
 */

export type CategoryId =
  | 'transport'
  | 'shopping'
  | 'food'
  | 'health'
  | 'campus'
  | 'directions'
  | 'everyday'
  | 'travel';

/**
 * Honesty flag for the starter dataset.
 * - `verified-usage`: everyday standard Kannada, high confidence.
 * - `needs-native-review`: reported by users/secondary sources (regional or
 *   colloquial speech). The UI shows a visible caution badge for these, so we
 *   never present a local variant as universally correct.
 */
export type ReviewStatus = 'verified-usage' | 'needs-native-review';

export type Politeness = 'neutral' | 'polite' | 'casual' | 'formal';

export type Difficulty = 'beginner' | 'intermediate';

export interface Phrase {
  /** Stable id used for favourites/recent history keys. Never renumbered. */
  id: string;
  category: CategoryId;
  /** Kannada sentence, in Kannada script. */
  kannada: string;
  /** Reader-friendly romanisation for beginners (not academic IAST). */
  transliteration: string;
  /** Natural English meaning. */
  english: string;
  /** When a learner should actually use this line. */
  usage: string;
  /** Optional word-by-word gloss for learners who want to see the grammar. */
  literal?: string;
  politeness: Politeness;
  difficulty: Difficulty;
  /** Lowercase search terms (English concepts, objects, places). */
  keywords: string[];
  pronunciationTip?: string;
  review: ReviewStatus;
  /** Fill-in slots such as "ನನ್ನ ಹೆಸರು ___" so learners can personalise. */
  slot?: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  kannadaTitle: string;
  /** Emoji-free icon name resolved to a lucide icon in the UI layer. */
  icon: string;
  blurb: string;
  /** Tailwind gradient utility classes for the scenario card. */
  accent: string;
}

export interface ConversationOption {
  id: string;
  /** What the user says, in Kannada. */
  kannada: string;
  transliteration: string;
  english: string;
  /** Line the other person replies with. */
  reply: ConversationLine;
  /** Why this option is appropriate (or what it signals). */
  explanation: string;
  /** Extra lines the learner could use instead at this point. */
  alternatives: ConversationLine[];
  /** Next node id, or "end" to finish the scene. */
  next: string;
  /** Optional consequence badge shown in the feedback chip. */
  tone?: 'smooth' | 'risky' | 'neutral';
}

export interface ConversationLine {
  speaker: 'other' | 'user';
  kannada: string;
  transliteration: string;
  english: string;
  note?: string;
}

export interface ConversationNode {
  id: string;
  /** What the other person says to open this turn. */
  line: ConversationLine;
  /** Optional Hindi/English context the learner may hear first. */
  options: ConversationOption[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  kannadaTitle: string;
  category: CategoryId;
  setting: string;
  whoYouAre: string;
  goal: string;
  start: string;
  nodes: ConversationNode[];
  /** Shown on completion: what the learner can now do. */
  takeaways: string[];
}

export type QuizQuestionType = 'en-to-kn' | 'kn-to-en' | 'scenario' | 'listen';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  category: CategoryId;
  prompt: string;
  /** Kannada prompt line, shown in script when relevant. */
  promptKannada?: string;
  options: string[];
  /** Index into `options`. */
  answerIndex: number;
  explanation: string;
  /** Phrase id this question was derived from (null for scenario questions). */
  sourcePhraseId: string | null;
}

/** Pair-matching round: match English meaning to the Kannada line. */
export interface MatchPair {
  id: string;
  kannada: string;
  english: string;
}

export interface CulturalNote {
  id: string;
  title: string;
  body: string;
  kind: 'etiquette' | 'speech' | 'script' | 'regional' | 'culture';
  /** True when the note involves variants that need native-speaker review. */
  caution?: boolean;
  sources?: string;
}

export interface RegionalVariant {
  id: string;
  standard: string;
  standardTranslit: string;
  variant: string;
  variantTranslit: string;
  english: string;
  region: string;
  review: ReviewStatus;
}

/** Real, locally stored progress. Never fabricated. */
export interface ProgressState {
  favorites: string[];
  /** Most recent phrase ids first, capped at 12. */
  recent: string[];
  /** category id -> number of times a phrase in it was opened/played. */
  categoryActivity: Partial<Record<CategoryId, number>>;
  /** Phrase ids whose pronunciation was played at least once. */
  listened: string[];
  /** Phrase ids copied to clipboard. */
  copied: string[];
  /** Practice attempts keyed by phrase id. */
  practice: Record<string, PracticeAttempt>;
  /** Completed conversation scenario ids. */
  completedScenarios: string[];
  /** Best quiz result recorded so far (a worse repeat never erases it). */
  bestQuiz: QuizResult | null;
  /** How many quiz attempts the learner has actually completed. */
  quizAttempts: number;
  /** ISO date strings (yyyy-mm-dd) on which the learner did something. */
  activeDays: string[];
}

export interface PracticeAttempt {
  phraseId: string;
  targetKannada: string;
  said: string;
  /** 0-100 similarity between what was recognised/typed and the target. */
  similarity: number;
  /** Recognition engine used, so the UI can be honest about the source. */
  method: 'speech-recognition' | 'typed';
  at: string;
}

export interface QuizResult {
  score: number;
  total: number;
  /** Milliseconds the attempt took. */
  durationMs: number;
  at: string;
  /** Question ids answered wrong, so the retry can target them. */
  missed: string[];
}
