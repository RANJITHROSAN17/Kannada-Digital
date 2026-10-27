# Engineering review — Kannada Saathi

**Reviewer:** Arena.ai Agent Mode · **Date:** 27 October 2026
**Subject:** `RANJITHROSAN17/Kannada-Digital`, the Kannada Saathi submission for the
**Kannada Digital Innovation Hackathon 2026** (problem statement #3 — *Kannada in Everyday Life*).
**Method:** full source read, dependency/config audit, `npm run typecheck`, `npm test`, `npm run build`,
`npm audit`, and a real headless-Chromium pass over every route and the main interaction flows at
1280 px and 390 px.

---

## 1. Executive summary

This was **already a strong, working submission** — not a scaffold. At the reviewed commit
(`70b2037`, "Add my local project files") the repository contained 65 files: a complete React/TypeScript
app, **111 curated phrases** across **8 situations**, **6 branching conversation scenes**, culture notes,
a quiz, voice practice, favourites, an offline assistant, an error boundary, **80 automated tests**, six
captured screenshots, a 13-slide `.pptx`, a deck generator, a project summary, a presentation outline and
a demo script. Typecheck, tests and the production build all passed before I changed anything.

The review therefore focused on **demo-day risk**: things that work on the developer's machine but fail on a
judge's laptop, on a college LAN, or with no internet. Those were real, and are now fixed.

| | Before review | After review |
|---|---|---|
| Kannada rendering on a machine without a Kannada font | ❌ tofu boxes (external Google Fonts only) | ✅ bundled Noto Sans Kannada, verified loaded |
| Runtime network requests | 1+ (fonts.googleapis.com / gstatic) | **0** — both fonts bundled |
| Offline-first claim vs. reality | ⚠️ data bundled, but no service worker or manifest | ✅ PWA manifest + cache-first service worker |
| Deploy portability | ⚠️ `base: '/'`, Pages required `VITE_BASE_PATH` from repo name | ✅ `base: './'` — one `dist/` works anywhere |
| Heading structure | ⚠️ 7 of 10 routes had no `<h1>` | ✅ exactly one `<h1>` per route |
| CI | ⚠️ checks only inside the deploy job on `main` | ✅ dedicated `ci.yml` on every push/PR + deploy job |
| Console noise | ⚠️ React Router v7 future-flag warnings | ✅ future flags opted in |
| Tests / typecheck / build | ✅ 80 passing, 0 errors | ✅ 80 passing, 0 errors (unchanged) |
| Browser verification | ✅ claimed 0 console errors | ✅ independently re-verified, 0 errors |

---

## 2. Findings, by severity

| # | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | **High** | `index.html` loaded Inter + Noto Sans Kannada from `fonts.googleapis.com`. On a Linux container or a judge's machine with no system Kannada font, every Kannada string rendered as empty boxes, and the app made a network request despite claiming to be offline-first. | Confirmed in headless Chromium: `ನಮ್ಮ ಕನ್ನಡ ಸಂಗಾತಿ` rendered as □□□□; `document.fonts.check()` false. |
| F2 | **High** | The README and `PROJECT-SUMMARY.md` described an offline-first PWA, but there was no `manifest.webmanifest` and no service worker — `PROJECT-SUMMARY.md` even listed "A PWA install path" as a *future* enhancement. | `public/` contained only `favicon.svg`. |
| F3 | **Medium** | `vite.config.ts` defaulted to `base: '/'`, so a plain `npm run build` produces a `dist/` that breaks on a GitHub Pages sub-path. The deploy workflow compensated by deriving `VITE_BASE_PATH` from the repo name — fragile for forks, Netlify, Vercel and LAN folders, and easy to forget locally. | `const base = env.VITE_BASE_PATH \|\| '/'`. |
| F4 | **Medium** | `SectionHeading` always rendered `<h2>`, so **7 of 10 routes had no `<h1>`** — screen-reader heading navigation and document outline started at level 2. | `src/components/ui.tsx`; verified with a DOM query across all routes. |
| F5 | **Medium** | The deploy job ran `npx vite build` (bypassing the `npm run build` typecheck gate) and omitted `actions/configure-pages`. There was no CI workflow for pull requests or non-`main` branches. | `.github/workflows/deploy.yml`; only one workflow in the repo. |
| F6 | **Low** | React Router v6 emitted two v7 future-flag warnings in every test run and in the dev console — cosmetic, but it makes a demo log look unhealthy. | `npm test` stderr, `behavior.test.tsx` and `PhraseCard.test.tsx`. |
| F7 | **Low** | `.env.example` told users `VITE_BASE_PATH` was "needed" for Pages; the README repeated it. After the relative-base fix this is wrong. The optional `VITE_AI_PROXY_URL` documentation was accurate and worth keeping. | `.env.example`, README §2 deploy table. |
| F8 | **Info** | `npm audit` reports 8 advisories in the **dev toolchain only**: 2 critical (`vitest`, `tinypool`), 1 high (`vite`), 5 moderate (`react-router-dom`, `esbuild`, `vite-node`, `@vitest/mocker`, `react-router`). Non-breaking fixes are unavailable — patched versions require major upgrades (Vite 8, Vitest 4, React Router 7). No advisory affects shipped browser code. | `npm audit --json`; installed versions Vite 5.4.21, Vitest 2.1.9, react-router-dom 6.30.6. |
| F9 | **Info** | Repository history mixed two unrelated projects (an earlier Python `mcp_doctor` snapshot and this app) with manual upload/delete commits. The correct app commit is preserved as `archive/vexar-mcp-snapshot`; an independent clean-room rebuild is preserved as `alternative/arena-rebuild`. | `git log --all`. |

### What was already excellent (kept unchanged)

- **Honest dataset**: 107 `verified-usage` phrases and 4 explicitly flagged `needs-native-review`, with a
  dataset-integrity suite that checks Kannada vowel signs, duplicate ids, dangling scene nodes and deterministic
  quiz generation. This is unusually rigorous for a hackathon entry.
- **Capability-aware speech**: `services/speech.ts` returns typed reasons (`no-tts`, `no-voices`,
  `permission-denied`, …) instead of throwing; the UI states plainly when no `kn-IN` voice exists and offers a
  typed fallback. No fake "accent score".
- **Isolated optional AI**: `services/assistant.ts` works fully offline; a developer-supplied proxy is strictly
  optional, its failures degrade gracefully, and no provider secret is ever placed in a `VITE_` variable.
- **ErrorBoundary**, single versioned localStorage key, deterministic seeded quiz, `lang="kn"` markup, skip link,
  focus rings, `aria-live` regions and `prefers-reduced-motion` support.
- **Submission artefacts**: the PPTX, deck generator, project summary, outline and demo script are rare and
  valuable at a hackathon.

---

## 3. Changes applied

1. **Bundled both fonts.** `src/assets/noto-sans-kannada.woff2` (89 KB) and `src/assets/inter-latin.woff2`
   (48 KB), two `@font-face` blocks in `src/index.css` with correct `unicode-range`, `Saathi Kannada` placed
   first in the Tailwind `kannada` stack **and** appended to the `sans` stack so plain Kannada text nodes (e.g.
   the header tagline) also render. Removed both `preconnect` links and the Google Fonts stylesheet from
   `index.html`. SIL OFL 1.1 licences added in `docs/licenses/`.
2. **Real offline PWA.** Added `public/manifest.webmanifest` and `public/sw.js` (cache-first same-origin GET,
   shell fallback to `index.html`, versioned cache cleanup). `src/main.tsx` registers the worker **only in
   production** so development never serves stale assets.
3. **Portable build.** `vite.config.ts` now defaults to `base: './'`; `deploy.yml` uses `npm run build` with no
   env var and adds `actions/configure-pages@v5`. Added `.github/workflows/ci.yml` (typecheck → test → build)
   on every push/PR.
4. **Accessible headings.** `SectionHeading` now accepts `level?: 'h1' | 'h2'`; the page-level instance on
   each route uses `level="h1"`, in-page sections stay at `h2`. Home and the situation/conversation detail pages
   keep their existing explicit `<h1>`.
5. **Cleaner output.** React Router v7 future flags opted in for `HashRouter` and test `MemoryRouter`s.
6. **Accurate docs.** `.env.example` and README now describe the optional base path correctly; README gained a
   review summary, three new screenshots, updated verification numbers, font licences and links to this review
   and the submission checklist. `PROJECT-SUMMARY.md` marks the PWA item as done. All 12 screenshots in
   `docs/screenshots/` were re-captured from the fixed build in real Chromium.

No dataset phrase, quiz rule, speech behaviour, route or test assertion was changed.

---

## 4. Verification evidence

```text
npm run typecheck  → 0 errors (strict, noUnusedLocals, noUnusedParameters)
npm test           → 80 passed, 7 files, ~7.5 s, no React Router warnings
npm run build      → dist/assets/index-*.js   373.46 kB │ gzip 114.81 kB
                     dist/assets/index-*.css   39.08 kB │ gzip   7.37 kB
                     dist/assets/*.woff2        89 KB + 48 KB
npm audit          → 8 dev-only advisories (documented; no runtime exposure)

Headless Chromium 156 (1280×900 and 390×844), 10 routes:
  - every route has exactly one h1 and renders its expected title
  - bundled fonts: Saathi Kannada:loaded, Inter:loaded; document.fonts.check() === true
  - header tagline computed font-family includes 'Saathi Kannada'
  - zero external requests; 0 console / page / request errors
  - offline assistant: "How much does this cost?" returns the price phrase, mode label
    "Offline · no API key"
  - phrasebook search "fever" filters the real dataset
  - voice practice typed fallback produces a score
  - quiz: full 10-question round → matching round → result screen
  - favourites survive a full page reload
  - mobile scrollWidth 390 px (no horizontal overflow)
```

CI (`.github/workflows/ci.yml`) reproduces typecheck, tests and build on every push, so a judge can verify the
above from a fresh clone.

---

## 5. Judging alignment

| Criterion | Evidence in this repo |
|---|---|
| Relevance | Explicitly targets problem statement #3, with #2 voice support; README maps features to real-life moments. |
| Working prototype | Two commands to run; no keys, backend or account; verified in a real browser. |
| Innovation | Moment-based organisation, offline retrieval assistant, `tone: risky` coaching in conversations, explicit native-review flags on data. |
| Technical quality | Strict TypeScript, layered services/hooks/utils, 80 tests including dataset integrity, CI, PWA, error boundary. |
| Impact | 111 everyday phrases, 8 situations, 6 scenes; works on a low-cost Android phone offline. |
| Documentation | README, PROJECT-SUMMARY, REVIEW, SUBMISSION, DEMO-SCRIPT, PRESENTATION-OUTLINE, PPTX, 12 screenshots. |

---

## 6. Remaining recommendations (non-blocking)

1. **Native-speaker review** of the 4 `needs-native-review` phrases before any public release; the flag already
   exists — resolve it rather than hiding it.
2. **Dev-dependency major upgrades after the hackathon**: Vite 8 / Vitest 4 / React Router 7 clear the 8
   `npm audit` advisories. Do this on a branch with a full browser pass; upgrading during submission week is
   unnecessary risk because the advisories are dev-tooling only and do not ship to the browser.
3. **Kannada TTS**: document per-OS installation of a `kn-IN` voice, or bundle short recordings of the most
   common phrases. The current UI already degrades honestly.
4. **Speech recognition is network-backed in Chrome** and absent in iOS Safari — keep the typed fallback in the
   demo script (it is already there).
5. **Confirm the submission deadline**: the two supplied PDFs disagree (25 Oct vs 31 Oct 2026, 10 PM IST).
   Trust the Unstop listing and submit early.
6. **Repository hygiene**: delete the stale dependabot branches after the event; keep
   `archive/vexar-mcp-snapshot` and `alternative/arena-rebuild` only if you want the history.

---

## 7. Sign-off

Kannada Saathi was already a submission-worthy project. The changes above remove the two things most likely to
fail in front of a judge — **missing Kannada glyphs and a hard dependency on network fonts** — and back the
"offline-first" claim with a real service worker and manifest. A fresh clone now installs, tests, builds,
deploys and renders correctly with no internet access.
