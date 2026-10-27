import type { CategoryId, MatchPair, QuizQuestion } from '../types';
import { phrases } from './phrases';

/**
 * Quiz content.
 *
 * Two sources are combined:
 *  1. `curatedQuestions` — hand-written scenario judgement questions that the
 *     phrase list alone cannot produce (what do you say *next*, and why).
 *  2. `generateQuiz()` — built from the real phrase dataset, so every run
 *     quizzes actual content and distractors come from the same category.
 *
 * A seeded RNG keeps test runs deterministic while still re-shuffling for the
 * learner on every new attempt.
 */
export const curatedQuestions: QuizQuestion[] = [
  {
    id: 'cq-01',
    type: 'scenario',
    category: 'shopping',
    prompt: 'A shopkeeper holds up a shirt you like. You want the price before anything else. What do you say?',
    options: [
      'ಇದರ ಬೆಲೆ ಎಷ್ಟು?',
      'ಇದು ತುಂಬಾ ದುಬಾರಿ ಆಗಿದೆ.',
      'ಬೇರೆ ಬಣ್ಣ ಇದೆಯೇ?',
      'ರಸೀದಿ ಕೊಡಿ.',
    ],
    answerIndex: 0,
    explanation:
      'ಇದರ ಬೆಲೆ ಎಷ್ಟು? = "How much is this?" Asking the price first is normal; commenting on cost comes later if at all.',
    sourcePhraseId: 'shopping-01',
  },
  {
    id: 'cq-02',
    type: 'kn-to-en',
    category: 'transport',
    prompt: 'What does this line mean?',
    promptKannada: 'ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
    options: [
      'Where is the bus station, please?',
      'When does the bus leave, please?',
      'Is this the bus for the station?',
      'How much is the ticket to the station?',
    ],
    answerIndex: 0,
    explanation:
      'ಎಲ್ಲಿದೆ = "where is it". ದಯವಿಟ್ಟು makes it polite; ಹೊತ್ತು would be needed for a time question.',
    sourcePhraseId: 'transport-01',
  },
  {
    id: 'cq-03',
    type: 'scenario',
    category: 'transport',
    prompt: 'An auto driver says the meter has "no commission". What is the calmest way to insist on the meter?',
    options: [
      'ಸರಿ, ಮೀಟರ್‌ನಲ್ಲಿಯೇ ಹೋಗುತ್ತೇನೆ.',
      'ಬೇಗ ಹೋಗಿ, ನನಗೆ ಟೈಮ್ ಇಲ್ಲ.',
      'ನನಗೆ ಸಹಾಯ ಬೇಕು.',
      'ಇನ್ನೂ ಬೇಡ.',
    ],
    answerIndex: 0,
    explanation:
      '"Okay, I will go by the meter" states your choice without accusing anyone. The other lines either pressure the driver or change the subject.',
    sourcePhraseId: 'transport-06',
  },
  {
    id: 'cq-04',
    type: 'kn-to-en',
    category: 'everyday',
    prompt: 'What does this line mean?',
    promptKannada: 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.',
    options: ["I did not understand.", 'I do not need it.', 'I am late.', 'I am new here.'],
    answerIndex: 0,
    explanation:
      'ಅರ್ಥವಾಗಲಿಲ್ಲ = "it did not become clear". Saying this is respected far more than nodding along and getting it wrong later.',
    sourcePhraseId: 'everyday-11',
  },
  {
    id: 'cq-05',
    type: 'en-to-kn',
    category: 'everyday',
    prompt: 'How do you ask someone to speak slowly?',
    options: [
      'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತಾಡಿ.',
      'ದಯವಿಟ್ಟು ಜೋರಾಗಿ ಮಾತಾಡಿ.',
      'ಮತ್ತೊಮ್ಮೆ ಬರೆಯಿರಿ.',
      'ಬೇಗ ಮಾಡಿ.',
    ],
    answerIndex: 0,
    explanation:
      'ನಿಧಾನವಾಗಿ = slowly, ಮಾತಾಡಿ = speak. The first alternative asks them to speak loudly, and ಕೊನೆಯ one asks them to hurry.',
    sourcePhraseId: 'everyday-12',
  },
  {
    id: 'cq-06',
    type: 'listen',
    category: 'food',
    prompt: 'A waiter asks you one question. Which one was it?',
    options: [
      'ಬೇರೆ ಏನಾದರೂ ಸೇರಿಸವುದೇ?',
      'ಬಿಲ್ ಕೊಡಿ.',
      'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ.',
      'ಎಷ್ಟು ಹೊತ್ತಾಗುತ್ತದೆ?',
    ],
    answerIndex: 0,
    explanation:
      'ಸೇರಿಸವುದೇ? = "shall I add anything?" — the follow-up you get after ordering. The other three are things you would say, not hear.',
    sourcePhraseId: null,
  },
  {
    id: 'cq-07',
    type: 'scenario',
    category: 'health',
    prompt: 'The pharmacist has just handed you a strip. What is the one question that prevents a dosage mistake?',
    options: [
      'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಅಥವಾ ಊಟದ ನಂತರ?',
      'ಇದರ ಬೆಲೆ ಎಷ್ಟು?',
      'ನಾಳೆ ಸಿಗುತ್ತದೆಯೇ?',
      'ರಸೀದಿ ಕೊಡಿ.',
    ],
    answerIndex: 0,
    explanation:
      'Empty stomach or after food. Two choices make the answer one word, so you cannot misunderstand it.',
    sourcePhraseId: 'health-06',
  },
  {
    id: 'cq-08',
    type: 'en-to-kn',
    category: 'shopping',
    prompt: 'How do you ask for exactly two of something?',
    options: ['ಎರಡು ಕೊಡಿ.', 'ಒಂದು ಕೊಡಿ.', 'ನಾಲ್ಕು ಕೊಡಿ.', 'ಇನ್ನೂ ಬೇಡ.'],
    answerIndex: 0,
    explanation: 'ಎರಡು = two, ಕೊಡಿ = give (polite). Numbers plus ಕೊಡಿ work in any shop in the state.',
    sourcePhraseId: 'shopping-13',
  },
  {
    id: 'cq-09',
    type: 'kn-to-en',
    category: 'food',
    prompt: 'What does this line mean?',
    promptKannada: 'ಇನ್ನೂ ಬೇಡ.',
    options: ['Nothing more, thanks.', 'Bring it quickly.', 'It is too spicy.', 'I am still hungry.'],
    answerIndex: 0,
    explanation:
      'ಇನ್ನೂ = more/yet, ಬೇಡ = do not want. It is the standard polite way to stop a refill or an upsell.',
    sourcePhraseId: 'food-10',
  },
  {
    id: 'cq-10',
    type: 'scenario',
    category: 'travel',
    prompt: 'You want a photograph inside a temple complex. What do you do first?',
    options: [
      'Ask ಫೋಟೋ ತೆಗೆಯಬಹುದೇ? and check the notice board.',
      'Take it quietly — nobody checks.',
      'Ask ಬಿಸಿ ನೀರು ಸಿಗುತ್ತದೆಯೇ?',
      'Ask for the entry fee instead.',
    ],
    answerIndex: 0,
    explanation:
      'Many religious premises ban cameras or phones outright. Asking one sentence costs nothing and prevents a real confrontation.',
    sourcePhraseId: 'travel-09',
  },
  {
    id: 'cq-11',
    type: 'en-to-kn',
    category: 'health',
    prompt: 'How do you ask how often to take a medicine?',
    options: [
      'ಈ ಔಷಧ ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ ಸೇವಿಸಬೇಕು?',
      'ಈ ಔಷಧ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ?',
      'ಔಷಧಿ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?',
      'ನನಗೆ ಗಾಯವಾಗಿದೆಯೇ?',
    ],
    answerIndex: 0,
    explanation: 'ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ = "how many times per day". The others ask something different entirely.',
    sourcePhraseId: 'health-05',
  },
  {
    id: 'cq-12',
    type: 'kn-to-en',
    category: 'everyday',
    prompt: 'An auto driver replies: "ಬನ್ನಿ ಸಾರ್." What did he mean?',
    options: ['You are welcome / come again.', 'Get out of the auto.', 'It is too far.', 'I have no change.'],
    answerIndex: 0,
    explanation:
      'ಬನ್ನಿ literally means "come", and it is used as "you are welcome" and "please come in". Context decides which.',
    sourcePhraseId: 'everyday-01',
  },
];

/** Pairs used by the English-to-Kannada matching round. */
const matchSourceIds = [
  'everyday-05',
  'shopping-01',
  'transport-05',
  'food-07',
  'health-08',
  'directions-05',
  'everyday-07',
  'travel-01',
];

export function buildMatchRound(pick = 5, rng: () => number = Math.random): MatchPair[] {
  const pool = matchSourceIds
    .map((id) => phrases.find((phrase) => phrase.id === id))
    .filter((phrase): phrase is NonNullable<typeof phrase> => Boolean(phrase));
  return shuffle(pool.slice(), rng)
    .slice(0, pick)
    .map((phrase) => ({
      id: phrase.id,
      kannada: phrase.kannada,
      english: phrase.english,
    }));
}

/** Mulberry32: tiny deterministic PRNG so tests are stable and seeds re-mix. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface GeneratedQuestionSpec {
  phraseId: string;
  type: 'en-to-kn' | 'kn-to-en';
}

function distractorsFor(category: CategoryId, excludeId: string, count: number, rng: () => number) {
  const sameCategory = phrases.filter((p) => p.category === category && p.id !== excludeId);
  const rest = phrases.filter((p) => p.category !== category);
  // Prefer same-category options: they are the mistakes a learner really makes.
  return shuffle(sameCategory.length >= count ? sameCategory : sameCategory.concat(rest), rng).slice(0, count);
}

/**
 * Build one quiz attempt: a mix of dataset-generated meaning questions and
 * curated judgement questions. Never returns duplicate phrase targets.
 */
export function generateQuiz(size = 10, rng: () => number = Math.random): QuizQuestion[] {
  const specs: GeneratedQuestionSpec[] = shuffle(phrases.slice(), rng)
    .slice(0, size)
    .map((phrase, index) => ({
      phraseId: phrase.id,
      type: index % 2 === 0 ? 'en-to-kn' : 'kn-to-en',
    }));

  const generated: QuizQuestion[] = specs.map(({ phraseId, type }) => {
    const phrase = phrases.find((p) => p.id === phraseId);
    if (!phrase) throw new Error(`Unknown phrase id in quiz generator: ${phraseId}`);

    const distractors = distractorsFor(phrase.category, phrase.id, 3, rng);

    if (type === 'en-to-kn') {
      const options = shuffle([phrase.kannada, ...distractors.map((d) => d.kannada)], rng);
      return {
        id: `gen-${phrase.id}-en2kn`,
        type,
        category: phrase.category,
        prompt: `How do you say this in Kannada?\n${phrase.english}`,
        options,
        answerIndex: options.indexOf(phrase.kannada),
        explanation: `${phrase.kannada} — "${phrase.transliteration}". ${phrase.usage}`,
        sourcePhraseId: phrase.id,
      };
    }

    const options = shuffle([phrase.english, ...distractors.map((d) => d.english)], rng);
    return {
      id: `gen-${phrase.id}-kn2en`,
      type,
      category: phrase.category,
      prompt: 'What does this Kannada line mean?',
      promptKannada: phrase.kannada,
      options,
      answerIndex: options.indexOf(phrase.english),
      explanation: `"${phrase.transliteration}" — ${phrase.usage}`,
      sourcePhraseId: phrase.id,
    };
  });

  // Mix in a couple of curated scenario questions every attempt, so repeated
  // attempts still have fresh judgement content rather than only vocabulary.
  const curated = shuffle(curatedQuestions.slice(), rng).slice(0, Math.max(2, Math.round(size / 4)));
  return shuffle(generated.concat(curated), rng).slice(0, size);
}

export const quizTypes: Record<QuizQuestion['type'], string> = {
  'en-to-kn': 'English → Kannada',
  'kn-to-en': 'Kannada → English',
  scenario: 'Real-life judgement',
  listen: 'Listening',
};
