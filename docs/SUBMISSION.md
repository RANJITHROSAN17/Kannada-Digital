# Unstop submission checklist — Kannada Saathi

> ⚠️ **Deadline conflict:** one supplied PDF says the window closes **25 October 2026, 10:00 PM IST**; the
> other says **31 October 2026, 10:00 PM IST**. **Trust the Unstop listing** and submit at least a day early.

## 1. What to submit

- [ ] **Repository URL:** `https://github.com/RANJITHROSAN17/Kannada-Digital` (public, `main`).
- [ ] **Live URL:** enable *Settings → Pages → Source: GitHub Actions*; `.github/workflows/deploy.yml`
      publishes to `https://ranjithrosan17.github.io/Kannada-Digital/`. No env vars required.
      Fast alternative: drag the built `dist/` to [Netlify Drop](https://app.netlify.com/drop).
- [ ] **Demo video** (2–3 min): follow [`docs/DEMO-SCRIPT.md`](DEMO-SCRIPT.md).
- [ ] **Presentation:** [`docs/Kannada-Saathi-Hackathon-Presentation.pptx`](Kannada-Saathi-Hackathon-Presentation.pptx)
      (13 slides, all six required sections). Regenerate with `python3 scripts/make_deck.py` after data changes.
- [ ] **Write-up:** this README + [`docs/PROJECT-SUMMARY.md`](PROJECT-SUMMARY.md) +
      [`docs/REVIEW.md`](REVIEW.md).
- [ ] Confirm no secrets, `.env` files with keys, `node_modules/` or `dist/` in the repo.

## 2. Ready-to-paste short description (≈50 words)

> **Kannada Saathi** is an offline-first companion for people new to Karnataka. It organises 111 reviewed
> Kannada phrases into 8 real-life situations, with transliteration, audio, cultural notes, six branching
> conversation simulators, a quiz, voice practice and an offline "what do I say?" assistant. No backend, no
> API key — it works on any phone, even without signal.

## 3. Ready-to-paste long description (≈150 words)

> **Kannada Saathi — Problem Statement #3: Kannada in Everyday Life.**
> Newcomers to Karnataka can read English but cannot *say* anything useful at a bus stand, market, pharmacy or
> canteen. Kannada Saathi organises learning by the moment you are in rather than by grammar topic. Eight
> situations hold 111 curated sentences, each with Kannada script, plain transliteration, English meaning,
> usage guidance, pronunciation tips and browser text-to-speech. Four phrases are explicitly flagged for native
> review instead of being presented as certain. Six branching conversation simulators coach tone and register;
> a seeded quiz and a typed/speech comparison tool verify recall; favourites, streaks and best scores persist
> locally. An offline retrieval assistant answers "what should I say?" from the bundled dataset with no API
> key — an optional developer proxy is strictly additive and degrades gracefully. The app ships as an
> installable PWA with bundled Kannada and Latin fonts, zero runtime network requests, 80 automated tests,
> strict TypeScript and CI. Built with React 18, Vite, Tailwind CSS and the Web Speech API.

## 4. Feature list for the form

```
1. 8 everyday situations, 111 reviewed Kannada phrases, 6 conversation simulators
2. Kannada script + transliteration + English + usage + cultural notes + audio
3. Bundled Noto Sans Kannada + Inter fonts — Kannada renders offline on any device
4. Offline "what do I say?" assistant; optional AI proxy isolated behind a server URL
5. Searchable phrasebook with multilingual search and situation filters
6. Quiz with 4 question types, seeded randomness, best score and review of misses
7. Voice practice: capability detection, typed fallback, honest text-similarity score
8. Favourites, streaks, progress, error boundary, accessible headings and focus states
9. PWA: manifest + service worker; one relative-base build deploys anywhere
10. 80 tests, strict TypeScript, 0 npm audit vulnerabilities, CI + Pages workflows, PPTX + docs + screenshots
```

## 5. Tech stack for the form

```
React 18 · TypeScript 5.6 (strict) · Vite 8.3.5 · Tailwind CSS 3 · react-router-dom 7.18.4 (HashRouter)
Web Speech API · Vitest 4.1.12 + Testing Library + jsdom · Service Worker / PWA
GitHub Actions (CI + Pages) · No backend · No database · No runtime network request
```

## 6. Demo video script (follows `docs/DEMO-SCRIPT.md`)

| Time | Visual | Voice-over |
|---|---|---|
| 0:00–0:20 | Home | Problem: newcomers cannot *say* Kannada in daily transactions. |
| 0:20–0:50 | Situations → a phrase card → audio → favourite | Four layers of a phrase; Kannada font is bundled, works offline. |
| 0:50–1:15 | "What do I say?" → "How much does this cost?" | Offline retrieval assistant, "Offline · no API key" badge. |
| 1:15–1:45 | Scenes → Boarding a bus → choose a reply | Branching simulator explains tone instead of just failing. |
| 1:45–2:10 | Quiz → answer → result | Four question types, best score persists. |
| 2:10–2:30 | Practice → typed fallback | Honest similarity score; no fake accent rating. |
| 2:30–2:50 | 390 px mobile view → Favorites after reload | PWA, responsive, progress persistence. |
| 2:50–3:00 | README + repo root | "80 tests, CI, one-click deploy. Thank you." |

**Tips:** 1280×720 or 1920×1080, zoom 100%, hide bookmarks bar, silence notifications, use a quiet mic,
move the cursor slowly. Export MP4 (H.264, <100 MB) or upload unlisted to YouTube/Drive and paste the link.

## 7. Final pre-submit gate

```bash
npm install
npm run typecheck     # 0 errors
npm test              # 80 passed
npm run build         # dist/ with hashed JS/CSS + 2 woff2 fonts
npm audit             # 0 vulnerabilities
npm run preview       # click through once at http://localhost:4173
```

Then push to `main`, confirm the green CI badge, enable GitHub Pages, copy the live URL into Unstop, upload the
video and paste the description above. The engineering evidence for judges is in [`docs/REVIEW.md`](REVIEW.md).
