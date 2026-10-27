# Architecture

Kannada Saathi is a **static single-page application with no server**. Everything — content,
logic, styling, font and speech — ships in `dist/` and runs in the browser.

```
                       ┌──────────────────────────────┐
                       │        src/data/*.ts         │
                       │  64 phrases · 8 situations   │
                       │  4 role-play scenes · numerals│
                       └──────────────┬───────────────┘
                                      │ single source of truth
        ┌─────────────────┬──────────┼───────────┬──────────────────┐
        ▼                 ▼          ▼           ▼                  ▼
   lib/search.ts    lib/quiz.ts  lib/speech.ts  lib/storage.ts   components/
   13 intents +      seeded MCQ   TTS/ASR +      typed local-     PhraseCard,
   weighted rank     + matching   similarity     Storage + streak  SituationCard,
                                                                   ProgressContext
        └─────────────────┴──────────┼───────────┴──────────────────┘
                                      ▼
                          pages/ (9 route components)
                                      ▼
                     App.tsx (header · bottom nav · routes)
                                      ▼
             HashRouter → Vite build → dist/ (+ sw.js, font, manifest)
```

## Key decisions

| Decision | Why |
|---|---|
| **Bundled TypeScript dataset** | Zero network calls, instant search, trivial to review/translate. `PHRASE_BY_ID` and `SITUATION_BY_ID` give O(1) lookups. |
| **Plain-ASCII transliteration** | A beginner can read "Idu eshtu?" aloud without Unicode diacritics or linguistic training. |
| **HashRouter** | Deep links work on any static host with no rewrite rules — critical for GitHub Pages and college LAN demos. |
| **Relative base (`base: './'`)** | One build works at `/`, at `/Kannada-Digital/`, or from a folder. Override only via `VITE_BASE_PATH`. |
| **Locally bundled Kannada font** | Linux containers and some judge laptops have no Kannada font; external Google Fonts also break offline demos. 89 KB woff2 solves both. |
| **Offline intent retrieval, not an LLM** | No API key, no cost, no latency, no hallucinated translations, fully auditable. `INTENTS` map + weighted token scoring is ~100 lines and testable. |
| **Web Speech API as progressive enhancement** | Works well on Chrome/Edge; on unsupported browsers the UI reports capability and offers typed practice + transliteration. Nothing crashes. |
| **localStorage for progress** | No account, no server, no GDPR surface. `read()/write()` handle disabled storage and corrupt JSON. |
| **Service worker registered only in `PROD`** | Avoids stale-cache confusion during development; in production it caches the shell so the phrasebook survives going offline. |
| **Strict TypeScript + Vitest** | 93 tests cover dataset integrity, ranking, quiz determinism, speech scoring, storage and all routes. Dataset bugs (e.g. duplicate Kannada prompts) are caught automatically. |

## Module map

| Path | Responsibility |
|---|---|
| `src/types.ts` | `Phrase`, `Situation`, `Scene`, `QuizQuestion`, `MatchPair` interfaces. |
| `src/data/phrases.ts` | All content + derived indexes + `phrasesForSituation()`. |
| `src/data/scenes.ts` | Branching role-play scenes; options reference real phrase ids. |
| `src/lib/search.ts` | `terms()`, `searchPhrases()`, `answerInEnglish()` — 13 intents with accumulated evidence. |
| `src/lib/quiz.ts` | Seeded PRNG, Fisher-Yates shuffle, question/pair builders, `percentage()`. |
| `src/lib/speech.ts` | Capability detection, `speak()`, `listenOnce()`, `normalise()`, `editDistance()`, `similarity()`. |
| `src/lib/storage.ts` | Namespaced localStorage helpers, `Progress`, `markActive()` streak logic. |
| `src/components/` | `PhraseCard`, `SituationCard`, `Icon`, `ProgressContext`. |
| `src/pages/` | Home, Situations, SituationDetail, Practice, Quiz, Voice, Ask, Saved, About, NotFound. |
| `public/sw.js`, `manifest.webmanifest`, `favicon.svg` | PWA shell. |
| `.github/workflows/` | CI (typecheck/test/build) and GitHub Pages deployment. |

## How to extend the content

1. Add a phrase object to `PHRASES` in `src/data/phrases.ts` with a unique `id`, a valid
   `situationId`, Kannada `kn`, ASCII `rom`, English `en`, a `when` hint, optional `note`, and
   search `tags`.
2. Add a new situation to `SITUATIONS` (icon name must exist in `components/Icon.tsx`).
3. Optionally add a scene to `src/data/scenes.ts`; every option must reference a real phrase id.
4. Run `npm test` — integrity tests enforce unique ids, unique Kannada prompts, unique English
   meanings, Kannada script, ASCII transliteration, ≥6 phrases per situation, and valid scene
   references.
5. If the new content introduces a common learner intent, add a regex to `INTENTS` in
   `src/lib/search.ts` and a ranking test in `src/lib/search.test.ts`.

No UI code changes are required to add content — the pages derive everything from the dataset.
