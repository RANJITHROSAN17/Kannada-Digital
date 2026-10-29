# End-to-end analysis — Kannada Saathi (Kannada-Digital)

**Date:** 29 October 2026 · **Commit analyzed:** `ec9adaf` (plus the live deploy) · **Method:** full source read of all 65 files, `npm run typecheck`, `npm test`, `npm run build`, live-site verification, and comparison with the earlier `docs/REVIEW.md`.

---

## 1. Architecture at a glance

```
Static React 18 + TypeScript + Vite 8 + Tailwind 3 SPA (HashRouter)
├── 111 phrases / 8 situations / 6 branching role-plays / culture notes / quiz
├── 290 bundled Kannada MP3s (public/audio) + offline service worker
├── Services: speech (TTS+STT), translation (Google gtx → MyMemory, keyless),
│             assistant (offline retrieval + optional proxy), storage (localStorage),
│             micLevel (getUserMedia level meter), pronunciationAudio (MP3 lookup)
├── Hooks: useProgress (all persisted learner state), useSpeech, useBridge (voice bridge)
├── Bridge: continuous recognition + live captions + mic diagnostics (this session's work)
└── CI: typecheck + 133 tests + build + audit gate, then GitHub Pages deploy
```

Everything is client-side: no server, no API key, works offline except live translation.

## 2. What works end-to-end (verified this pass)

- **All 10 routes render** with exactly one `<h1>` each; unknown routes redirect home.
- **Typecheck clean**, **133/133 tests pass**, **production build ✓**.
- **Live site** (`ranjithrosan17.github.io/Kannada-Digital/`) serves the latest bundle with the embedded home-page bridge, live captions and the mic-level diagnostic.
- **Offline shell**: bundled Noto Sans Kannada + Inter fonts (zero external requests), 290 audio MP3s, cache-first service worker, PWA manifest.
- **Keyless live translation** for any sentence not in the phrasebook (Google gtx → MyMemory chain), with honest error states.
- **Two-way voice bridge** on the home page and `/bridge`: speak → Kannada audio → other person replies → English back, with `ನೀವು` forms, continuous recognition, live captions and one-tap mic diagnostics.
- **Honest dataset**: 111 phrases, each tagged `verified-usage` / `needs-native-review`, with an integrity test suite.

## 3. Issues found by this fresh end-to-end read

### P0 — real bugs (fixed)

| # | Where | Issue | Fix |
|---|---|---|---|
| B1 | `services/translation.ts` | `createTimeout()` registers an abort listener via `addEventListener('abort', () => controller.abort())` but `removeEventListener` is called with a **fresh arrow function** — the listener is never removed. Every translation leaks a listener on the passed-in `AbortSignal`. | Hoist the handler into a named function and remove that exact reference. |
| B2 | `hooks/useProgress.tsx` | `queueRef` is written on every render but never read — dead code. | Removed. |
| B3 | `README.md` | Test counts stale (83/106 → 133). | Updated after the final test run. |

### P1 — functional gaps (fixed)

| # | Gap | Fix |
|---|---|---|
| F1 | **The bridge conversation vanishes on refresh.** The full page says so in its own footer text ("This log only lives in this tab"). For a live demo this is a real gap. | Persist the transcript + both sides' recognised lines to `localStorage` (`services/bridgeStore.ts`) and restore automatically on mount; `Clear conversation` wipes it. |
| F2 | **No offline state feedback.** The app is offline-first, but when the judge's laptop loses Wi-Fi mid-demo nothing tells the user that live translation won't work. | `useOnlineStatus` hook + amber banner in the app shell: "You're offline — the phrasebook works; live translation needs the network." |
| F3 | **No social/share meta tags** on `index.html` (og/twitter cards). | Added `og:`/`twitter:` meta tags. |

### P2 — small robustness items reviewed and cleared

- `speech.ts` `listenOnce` restart/retry logic, `stopSpeaking` cleanup, `speak()` recorded-audio fallback — all correct after this session's fixes (see `listenOnce.test.ts`).
- `translation.ts` chunking, quota/HTML-block detection, timeout handling — correct.
- `storage.ts` hydration of corrupt/partial progress — correct (never crashes).
- `useSpeech` unmount cleanup stops recognition + audio — correct.
- `VoicePracticePage` typed-fallback path, `QuizPage` best-score handling, `ConversationsPage` free-text resolution — correct.
- Accessibility: skip-link, aria labels, focus rings, `prefers-reduced-motion` — present.

## 4. Feature map (what exists today)

| Feature | Status | Where |
|---|---|---|
| Situation-based phrasebook (111 phrases) | ✅ | `/situations`, `/phrasebook` |
| Search (script/translit/meaning/keywords) | ✅ | phrasebook + ask box |
| "What do I say?" offline assistant + live translation | ✅ | home, `/situations` |
| Voice practice with text-similarity feedback | ✅ | `/practice` |
| Branching role-play conversations | ✅ | `/conversations` |
| Quiz (4 types + matching round) | ✅ | `/quiz` |
| Favorites + recent history + streaks | ✅ | `/favorites`, home progress card |
| Culture, regional variants, numbers | ✅ | `/culture` |
| Live voice bridge (home + full page) | ✅ | home, `/bridge` |
| Live captions, mic diagnostics | ✅ | bridge panel |
| Offline PWA (SW + manifest + bundled audio) | ✅ | `dist/` |
| Bridge conversation persistence | ✅ (new) | `services/bridgeStore.ts` |
| Offline banner | ✅ (new) | app shell |

## 5. Verification plan after the changes

1. `npm run typecheck` — clean
2. `npm test` — all tests (old + new for the bridge store, offline hook, restored conversation)
3. `npm run build` + live deploy via GitHub Actions
4. Live-site bundle check (contains the new banner + persistence strings)
