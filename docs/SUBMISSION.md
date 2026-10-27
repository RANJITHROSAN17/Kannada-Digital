# Submission checklist — Unstop

> ⚠️ **Dates:** the two attached PDFs disagree with the message brief. One says the window closes
> **25 October 2026, 10:00 PM IST**, the other says **31 October 2026, 10:00 PM IST**.
> **Trust the Unstop listing** and submit at least a day early.

## Deliverables

- [ ] GitHub repository (public): `https://github.com/RANJITHROSAN17/Kannada-Digital`
- [ ] Live URL — enable **Settings → Pages → Source: GitHub Actions**, then the
      `deploy-pages.yml` workflow publishes `https://ranjithrosan17.github.io/Kannada-Digital/`.
      Alternative: drag `dist/` to Netlify Drop for an instant URL.
- [ ] Demo video (2–3 minutes, screen recording with voice-over — script below).
- [ ] Project description / abstract (ready-to-paste text below).
- [ ] Slide deck or PDF (optional): use the README screenshots; 6 slides suggested below.
- [ ] This repository's `README.md`, `docs/REVIEW.md` and `docs/DEMO.md` as supporting material.
- [ ] Confirm the repo contains no secrets, `.env` files with keys, or `node_modules/`.

## Ready-to-paste short description (≈50 words)

> **Kannada Saathi** is an offline-first web app that helps newcomers to Karnataka speak Kannada
> in real situations — buses, markets, pharmacies and canteens. It offers 64 curated phrases with
> transliteration and audio, an offline English-to-Kannada assistant, branching role-plays,
> quizzes and voice practice. No backend, no API key; works on any phone.

## Ready-to-paste long description (≈150 words)

> **Kannada Saathi — Problem Statement #3: Kannada in Everyday Life.**
> People arriving in Karnataka for college, work or healthcare can read English but cannot *say*
> anything useful in Kannada. Kannada Saathi organises learning by the moment you are in rather
> than by grammar topic. Eight everyday situations contain 64 curated sentences, each with Kannada
> script, plain-ASCII transliteration, English meaning, usage guidance, cultural notes and browser
> text-to-speech. A free-text search and an offline intent-based assistant answer questions like
> "how much does this cost?" with the exact sentence to say. Four branching role-plays coach the
> learner through real conversations; a scored quiz and a speech-similarity tool verify recall and
> pronunciation; favourites, streaks and best scores persist locally. The app is a PWA that works
> offline, bundles its own Kannada font, needs no account or API key, and has 93 automated tests
> plus CI. Built with React 18, strict TypeScript, Vite, Tailwind CSS and the Web Speech API.

## Features list for the form (copy/paste)

```
1. 8 real-life situations with 64 curated Kannada phrases
2. Kannada script + readable transliteration + English meaning + cultural notes
3. Browser text-to-speech (kn-IN) with a bundled Kannada font for guaranteed rendering
4. Offline "Ask in English" assistant — 13 intents, no API key or network
5. Free-text search across Kannada, transliteration, English and tags
6. 4 branching role-play conversations with coaching feedback
7. Quiz: 6 meaning questions + 5-pair matching, scoring, best score, review of misses
8. Voice practice: speech recognition + typed fallback with similarity scoring
9. Progress: favourites, learned phrases, daily streak, quiz and voice records
10. Offline PWA (service worker + manifest), responsive 390 px mobile layout
11. 93 automated tests, strict TypeScript, CI workflow, one-click deploy
```

## Tech stack for the form

```
React 18 · TypeScript (strict) · Vite 5 · Tailwind CSS 3 · React Router 6 (HashRouter)
Web Speech API · Vitest + Testing Library · Service Worker / PWA · GitHub Actions
No backend · No database · No external API · No runtime network dependency
```

## Demo video script (2–3 min, follows `docs/DEMO.md`)

| Time | Visual | Voice-over |
|---|---|---|
| 0:00–0:20 | Home screen | State the problem: newcomers cannot *say* Kannada in daily transactions. |
| 0:20–0:55 | Situations → Market → phrase card → audio → Save | Show the four layers of a phrase and the bundled Kannada font. |
| 0:55–1:25 | Search "fever" → Ask "How much does this cost?" | Explain the offline intent engine, no API key. |
| 1:25–2:00 | Practice role-play → Quiz | Rehearsal and recall, instant feedback, persisted scores. |
| 2:00–2:25 | Voice practice typed fallback | Works even without a microphone or a Kannada voice. |
| 2:25–2:50 | 390 px mobile view → Saved after reload | PWA, offline, responsive, progress persistence. |
| 2:50–3:00 | README + repo root | "93 tests, CI, one-click deploy. Thank you." |

**Recording tips:** 1280×720 or 1920×1080, browser zoom 100%, hide bookmarks bar, disable
notifications, use a quiet mic, and keep the cursor movements slow. Export MP4 (H.264) under
100 MB, or upload to YouTube/Drive as an unlisted link and paste it in the Unstop field.

## Suggested 6-slide deck

1. **Title** — Kannada Saathi + tagline + hackathon + problem statement #3.
2. **Problem** — who is affected and why translators are not enough.
3. **Solution** — moment-based organisation; screenshot of the situation grid.
4. **Features** — 4 screenshots: phrase card, Ask, role-play, quiz/voice.
5. **Technology & quality** — architecture diagram, 93 tests, CI, offline PWA, bundled font.
6. **Impact & next steps** — 8 minutes to a real transaction; native-speaker review, more
   regional variants, recorded audio.

## Final pre-submit check

```bash
npm install
npm run typecheck     # 0 errors
npm test              # 93 passed
npm run build         # dist/ created
npm run preview       # open http://localhost:4173 and click through once
```

Then: push to `main`, confirm the green CI badge, enable GitHub Pages, copy the live URL into
Unstop, upload the video, and paste the description above.
