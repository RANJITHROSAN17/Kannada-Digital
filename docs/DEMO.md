# Demo script — 3 minutes

Use this verbatim while screen-sharing. Every step below was verified in a real browser
(1280 px desktop and 390 px mobile) with 0 console errors.

**Setup (do before the call):** `npm install && npm run dev`, open `http://localhost:5173`,
set the browser zoom to 100%, and (optionally) open DevTools → Device Toolbar → 390 px for the
mobile part. No login, no API key, no internet needed.

---

## 0:00–0:20 — The problem

> "A student who lands in Mysuru for their first semester can read English, but the bus
> conductor, the vegetable vendor and the pharmacy counter all speak Kannada. Translators give
> them single words. What they need is the whole sentence, its sound, and the politeness that
> makes it work. So I built **Kannada Saathi** — an offline companion organised by the moment
> you are in, not by grammar topic."

**Show:** the home screen. Point at the hero, the four stats and the phrase of the day.
Mention the streak counter increments once per day.

## 0:20–0:55 — Situation-based phrasebook

1. Click **Start with a situation**.
2. Click **Market & shopping**.
3. Point at `ಇದು ಎಷ್ಟು?` — Kannada script, `Idu eshtu?` transliteration, English meaning,
   the "When" guidance and the cultural note.
4. Click the **speaker icon** to play audio. Click **Save** and **Mark learned**.

> "Every card has four layers: the script, a roman version a beginner can actually pronounce,
> the meaning, and the social context. The Kannada font is bundled in the repo, so it renders
> even on a machine with no Kannada fonts installed — and the whole app works offline."

## 0:55–1:25 — Search + offline assistant

1. Go to **Situations** and type `fever` in the search box → the health phrase appears instantly.
2. Click **Ask** → click the example chip *"How much does this cost?"* (or type it).
3. Show the returned `ಇದು ಎಷ್ಟು?` and the "Also useful" alternatives.

> "The assistant is not an API call. Thirteen everyday intents are matched against the bundled
> phrasebook with weighted ranking, so it works with no internet, no key and no cost — and a
> native speaker can improve its answers by editing one TypeScript file."

## 1:25–2:00 — Role-play + quiz

1. Click **Practice** → **Catching the right bus** → choose *"Does this go to Mysuru?"* → show
   the "Nice choice" coaching note and the phrase card → **Continue conversation**.
2. Click **Quiz** → answer one question → show instant feedback → mention the matching round
   and that a completed quiz writes the best score to `localStorage`.

> "Knowing a phrase and *using* it are different. Branching role-plays teach the decision, and
> the quiz proves recall. Scores, favourites and streaks all persist after a reload."

## 2:00–2:25 — Voice practice

1. Click **Voice** → **Listen** → then use **Typed practice**: type `Namaskara`, click **Check**,
   show the 100% similarity score.
2. Mention the mic button uses browser speech recognition where available.

> "Speech recognition is browser-dependent, so I designed a typed fallback that scores the
> same way. The demo never depends on a microphone or a cloud API."

## 2:25–2:50 — Mobile + offline + deployment

1. Switch to the 390 px device view → show the bottom tab bar and situation cards.
2. Click **Saved** → show that the phrase saved earlier is still there after a reload.

> "It is a PWA: after the first visit a service worker caches the app shell, so this works with
> no signal in a bus stand. One relative-base build deploys to GitHub Pages, Netlify or a plain
> folder — the CI workflow runs typecheck, 93 tests and the production build on every push."

## 2:50–3:00 — Close

> "Problem statement #3: Kannada in Everyday Life. Everything is in the repo — README,
> engineering review, architecture, screenshots and a submission checklist. Thank you."

---

## 30-second version

1. Home → **Start with a situation** → **Market & shopping** (show a phrase card + audio).
2. **Ask** → "How much does this cost?" → show `ಇದು ಎಷ್ಟು?`.
3. **Saved** → show progress persisting.
4. One line: *"Offline, no API key, 64 phrases, 93 tests, deployable in one click."*

---

## If something goes wrong on the judge's machine

| Situation | What to say / do |
|---|---|
| No audio / no `kn-IN` voice | "The browser has no Kannada voice installed — the transliteration and typed practice are the designed fallback." Show the Voice page capability chips. |
| Mic blocked or unsupported | Use **Typed practice**; it produces the same similarity score. |
| No internet | Everything works — that is the point. Show the service worker and `dist/` folder. |
| Kannada boxes on an old browser | The font is bundled; hard-refresh once (Cmd/Ctrl+Shift+R) to clear an older cached CSS. |
| npm install fails | `npm run preview` after a pre-built `dist/` is included in the submission ZIP; or use the live URL. |

## Likely judge questions — short answers

- **Why not use an LLM?** Cost, latency, offline access, and hallucinated translations for a
  language learners cannot verify. The intent engine is deterministic and auditable; an LLM proxy
  could be added later behind a server.
- **How accurate is the Kannada?** Hand-curated starter set of 64 high-frequency phrases; the
  dataset is one file meant to be reviewed by a native speaker, and tests guard its structure.
- **What is the tech stack?** React 18 + strict TypeScript, Vite, Tailwind, React Router,
  Web Speech API, Vitest, service worker. No backend.
- **How do you measure learning?** Per-situation learned counts, streaks, quiz best scores and
  voice similarity scores, all stored locally with no account required.
