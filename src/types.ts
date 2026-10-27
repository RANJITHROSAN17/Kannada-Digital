/** Domain types for Kannada Saathi. All data is bundled; no network calls. */

export interface Phrase {
  /** Stable identifier, e.g. "market-1". */
  id: string;
  situationId: string;
  /** Kannada script (Unicode). */
  kn: string;
  /** Learner-friendly ASCII transliteration. */
  rom: string;
  /** Plain-English meaning. */
  en: string;
  /** Short guidance on when to say it. */
  when: string;
  /** Optional politeness / cultural note. */
  note?: string;
  /** Extra search keywords (English + transliterated synonyms). */
  tags: string[];
}

export interface Situation {
  id: string;
  title: string;
  knTitle: string;
  /** Lucide icon name (resolved in components/Icon.tsx). */
  icon: string;
  blurb: string;
  /** Tailwind gradient classes for the card. */
  gradient: string;
  /** Tailwind text colour for the icon chip. */
  accent: string;
}

export interface ReplyOption {
  phraseId: string;
  /** Short label shown on the button (English gloss of the option). */
  label: string;
  /** Coaching shown after choosing. */
  feedback: string;
  /** Whether this is the recommended reply. */
  good: boolean;
}

export interface SceneTurn {
  /** What the other person says (or the situation prompt). */
  promptKn: string;
  promptRom: string;
  promptEn: string;
  options: ReplyOption[];
}

export interface Scene {
  id: string;
  situationId: string;
  title: string;
  intro: string;
  turns: SceneTurn[];
}

export interface QuizQuestion {
  id: string;
  phraseId: string;
  kn: string;
  rom: string;
  correct: string;
  options: string[];
}

export interface MatchPair {
  phraseId: string;
  kn: string;
  en: string;
}
