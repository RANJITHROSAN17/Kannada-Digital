# Engineering review — Kannada Digital (`Kannada-Digital`)

**Reviewer:** Arena.ai Agent Mode · **Date:** 27 October 2026
**Scope:** `RANJITHROSAN17/Kannada-Digital`, `main` and `backup/web-app-2026-10-27`,
full commit history, attached hackathon briefs, source, tests, build and a real-browser run.
**Goal:** turn the repository into a working, demo-ready product for the
Kannada Digital Innovation Hackathon 2026 submission.

---

## 1. Executive summary

| | Before | After |
|---|---|---|
| Runnable product | ❌ No build possible — `index.html` pointed at a `src/` that did not exist | ✅ Full app runs with `npm install && npm run dev` |
| Relevance to hackathon | ❌ `main` contained an unrelated Python static analyser (Vexar-MCP) | ✅ `main` is the Kannada Saathi hackathon product |
| Source files | 0 application files | 30 TypeScript/TSX source files |
| Automated tests | 0 (Vitest configured but setup file + tests missing) | **93 passing tests in 7 files** |
| Typecheck | Fails (no sources) | 0 errors in strict mode |
| Production build | Fails | 260 KB JS / 81 KB gzip + 29 KB CSS + 89 KB bundled font |
| Real-browser verification | n/a | 10 routes + 6 interaction flows, **0 console/page errors** |
| Kannada rendering | Broken on machines without a Kannada font | Bundled Noto Sans Kannada woff2, verified |
| Deployment | None | GitHub Pages workflow + Netlify config + static-folder instructions |
| Documentation | README describing features that did not exist | README + review + architecture + demo + submission docs + 12 real screenshots |

**Verdict:** the repository was a *scaffold with an excellent written concept but no implementation*.
It is now a complete, offline-capable MVP that a judge can use within 60 seconds of cloning.

---

## 2. What I found (severity-ranked)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | **Blocker** | `main` did not contain the hackathon project at all — it was a Python `mcp_doctor` static analyser pushed from a different project. | `git ls-tree main` showed `pyproject.toml`, `src/mcp_doctor/…`, `.github/roadmap.json`. |
| F2 | **Blocker** | The web-app scaffold on the backup branch had **no `src/` directory**, yet `index.html` loads `/src/main.tsx` and `vite.config.ts` requires `src/test/setup.ts`. | `npm run build` could not resolve the entry module; `npm test` would fail on the missing setup file. |
| F3 | **Blocker** | `README.md` documented 8 situations, 80 tests, screenshots, a GitHub Pages workflow and a voice assistant — **none of which were in the repo**. | Referenced `docs/screenshots/*.png` and `.github/workflows/*` that did not exist. |
| F4 | **High** | `index.html` loaded Google Fonts from the network while the product claims to be offline-first. On a Linux judge machine (or in an offline demo) Kannada rendered as empty boxes. | Verified in headless Chromium: `ಒಂದು ಕೆಜಿ ಕೊಡಿ` rendered as □□□□. |
| F5 | **High** | `favicon.svg`, `manifest.webmanifest`, service worker and PWA metadata were missing. | `<link rel="icon" href="./favicon.svg">` returned 404. |
| F6 | **High** | No data layer. The product idea (situation-based phrasebook, role-play, quiz, assistant) had no dataset, no types and no logic. | Only config files on the branch. |
| F7 | **Medium** | `vite.config.ts` used `base: '/'`, which breaks GitHub Pages project sites served from `/Kannada-Digital/`. | Asset URLs would resolve to the domain root. |
| F8 | **Medium** | `.env.example` advertised `VITE_AI_PROXY_URL` / `VITE_AI_MODEL_LABEL` for an AI coach that was never implemented — misleading for judges and a security foot-gun (any `VITE_` value ships to the client). | No code read those variables. |
| F9 | **Medium** | `tsconfig.json` had `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride` — good, but untested against real code. | Any new code had to satisfy strict mode. |
| F10 | **Medium** | Git history on `main` was noisy: 6 commits of uploads/deletions from two different projects, plus three dependabot branches with vulnerable dependency bumps. | `git log --all` showed `Add files via upload`, `Delete src`, `Delete tests directory`. |
| F11 | **Low** | `README` and `LICENSE` mixed two projects (MIT Python analyser + web app). | Repo description still described `mcp_doctor`. |

**Positive findings worth keeping:** the scaffold's design system (warm ivory + deep indigo +
saffron), the mobile-first intent, the honest "no API key" stance, the strict TypeScript config,
`HashRouter` choice, and the README's problem statement (`#3 Kannada in Everyday Life`) were all
well thought through. I kept and built on all of them.

---

## 3. What I changed

1. **Replaced `main` with the hackathon product.** The unrelated Python snapshot was preserved on
   branch `archive/vexar-mcp-snapshot`; the earlier web-app scaffold is on
   `backup/web-app-2026-10-27`. `main` now has a single clean snapshot commit of the app.
2. **Built the full app** (30 source files): typed dataset (8 situations, 64 phrases, 10 numerals,
   4 role-play scenes), search/retrieval engine, quiz engine, speech helpers, progress storage,
   9 pages, shared components and a global progress context.
3. **Bundled the Kannada font locally** (`src/assets/noto-sans-kannada.woff2`, 89 KB) with a
   proper `@font-face` and the SIL OFL 1.1 licence in `docs/licenses/`. Removed all external
   font/script requests — the app now has **zero network dependencies at runtime**.
4. **Made deployment portable:** `base: './'` + `HashRouter` means one `dist/` works on a domain
   root, a GitHub Pages sub-path, Netlify, Vercel, or a plain folder. Added
   `.github/workflows/ci.yml` (typecheck/test/build) and `deploy-pages.yml` (Pages), plus
   `netlify.toml`.
5. **Added the PWA layer:** `favicon.svg`, `manifest.webmanifest`, and a cache-first
   `public/sw.js` registered only in production builds.
6. **Corrected configuration claims:** `.env.example` now documents the single optional
   `VITE_BASE_PATH`; removed references to a non-existent AI proxy. README, `index.html` and all
   docs describe what actually ships.
7. **Added 93 unit/integration tests** — dataset integrity (unique ids, Kannada script present,
   ASCII transliteration, no duplicate prompts/meanings, scene option integrity), search ranking
   for 8 real queries, quiz generation/scoring determinism, speech normalisation/similarity,
   storage fallbacks and streaks, component behaviour, and smoke tests for all 10 routes.
8. **Captured 12 real screenshots** at 1280 px and 390 px from headless Chromium and referenced
   them in the README — no mockups, no missing image links.
9. **Fixed a data bug found by browser testing:** `ಬಿಲ್ ಕೊಡಿ` appeared twice with two different
   English meanings, which would have produced ambiguous quiz answers. One phrase is now
   `ಬಿಲ್ ತನ್ನಿ`, and two new integrity tests prevent regressions.

---

## 4. Verification evidence

```text
npm run typecheck  → 0 errors (strict / noUnusedLocals / noUnusedParameters)
npm test           → 93 passed, 7 files, ~6 s
npm run build      → dist/assets/index-*.js     260.24 kB │ gzip 80.98 kB
                     dist/assets/index-*.css     28.94 kB │ gzip  5.80 kB
                     dist/assets/*.woff2         90.80 kB
Chromium 156 (1280×900 and 390×844):
  - 10 routes rendered with correct <h1>, 0 console errors, 0 page errors
  - search "fever" returns "I have a fever"
  - Ask in English "How much does this cost?" returns "ಇದು ಎಷ್ಟು?"
  - quiz: 6 MCQs → matching round → 100% result → progress persisted to localStorage
  - role-play: choosing a reply shows coaching feedback
  - voice: typed practice returns a 100% similarity score
  - favourites survive a full page reload
  - mobile scrollWidth = 390 px (no horizontal overflow)
  - bundled font loads: document.fonts.check(...) === true
```

Continuous integration (`.github/workflows/ci.yml`) re-runs typecheck, tests and build on every
push, so the above is reproducible by a judge cloning the repo.

---

## 5. Judging alignment

| Typical criterion | How this repo answers it |
|---|---|
| Relevance to problem statement | Explicitly targets #3, with #1/#2 support; the README maps every feature to a real-life moment. |
| Working prototype | Runs with two commands, no keys/backend, verified in a real browser. |
| Innovation | Intent-based **offline** retrieval assistant instead of an API wrapper; moment-based organisation instead of topic-based vocabulary; cultural notes; speech scoring with typed fallback. |
| Technical quality | Strict TypeScript, layered modules, 93 tests, CI, PWA, accessible responsive UI. |
| Impact / usability | Works on a ₹10k Android phone, offline, in a market or a bus stand; content is editable by a native speaker without code changes. |
| Documentation | README + 4 docs + real screenshots + demo script + submission checklist. |

---

## 6. Remaining recommendations (not blockers)

1. **Native-speaker review of the dataset.** 64 phrases are a starter set. A Kannada speaker
   should review pronunciation, register and regional variants before scaling to hundreds.
2. **Speech recognition is browser-dependent.** Chrome/Edge on Windows/Android work best;
   iOS Safari lacks `SpeechRecognition`. The typed fallback and TTS keep the demo working
   everywhere — mention this proactively if a judge uses an iPhone.
3. **Voice quality depends on installed system voices.** The app detects a missing `kn-IN`
   voice and says so; bundling recorded audio for the 64 phrases would remove that dependency
   (adds ~3–6 MB and requires recording rights).
4. **Add regional variants (problem statement #4)** as a future dataset dimension — e.g.
   Coastal/Mysuru/North Karnataka synonyms — once the core set is reviewed.
5. **Optional analytics-free feedback form** if deployed publicly, to collect phrase requests.
6. **Delete the old dependabot branches** (`dependabot/npm_and_yarn/*`) — they reference the
   older lockfile and are no longer needed.

---

## 7. Review sign-off

The repository is **submission-ready**: a fresh clone installs, tests, builds and serves a fully
interactive product with no external dependencies. The earlier concept README is now backed by
real code, real tests, real screenshots and reproducible deployment.
