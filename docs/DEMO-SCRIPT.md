# 3–5 minute demo script

Read-aloud timing is marked. Rehearse twice with the app on `npm run dev` in a **fresh profile** (so progress starts
at zero — the zeros are part of the story). Have Chrome open; on Android/Chrome you get mic recognition, on desktop
Chrome you get TTS with a fallback voice.

Before you start: zoom 100 %, mobile frame visible in the corner, terminal closed, notifications off.

---

### 0:00–0:15 — the hook (home page)

> "This is someone arriving at Mysuru bus stand at 6 a.m. They can read English, they cannot say anything in
> Kannada. Public life here runs on spoken Kannada — so the cost is not embarrassment, it is a missed stop, an
> overpaid fare, a wrong dosage time. Kannada Saathi is the companion for exactly that moment.
> Problem statement: **Kannada in Everyday Life**."

### 0:15–0:40 — situation-first content

Click **Situations → Hospital & pharmacy**.

> "The app is organised by the moment you are in, not by vocabulary topic. One hundred and eleven reviewed phrases
> across eight situations. Every card is the same shape: Kannada script, reader transliteration, English meaning,
> when to use it — and audio."

Press the **speaker** button on any card. Then open **Pronunciation tip**.

> "That is a real Kannada recording bundled with the app — not a browser voice that may not exist. It plays on
> any laptop or phone, and it is precached, so it still works with the Wi-Fi off."

### 0:40–1:00 — "What do I say?" (the assistant, offline)

Home → **What do I say?** → type `I have fever since two days` → *Find my line*.

> "Now the part that needs no API key and no network: describe the problem in English, and it retrieves the Kannada
> line you actually need, ranked from the same dataset. This is retrieval over verified data, not a model guessing
> sentences — which is why I can trust what it shows."

Click the top result's play button.

### 1:00–1:25 — role-play with coaching

**Scenes → Boarding a bus** → click *Say this* on the first reply.

> "Learning a phrase is not the hard part; surviving the reply is. So there is a branching simulator: the conductor
> answers, and each of my options gets a coaching note — why this works, or what it signals."

Click the option marked *Leave it, go ahead* to surface the **risky** note.

> "A reply like this is understood but reads as refusing to pay. It is explained, not failed — that is how a real
> conversation teaches. There are six scenes like this: market, tea shop, clinic, auto, hotel."

### 1:25–1:45 — voice practice, honestly labelled

**Practice** page.

> "Voice practice: `kn-IN` recognition where the browser supports it, a typed fallback where it does not, and this
> capability dashboard that reports what this browser can and cannot do. The score is text similarity against the
> target — I deliberately do not show a pronunciation percentage, because there is no reliable Kannada acoustic
> model in the browser. Saying so is the feature."

Tap the mic once (show the permission/error path), then *Compare*.

### 1:45–2:00 — proof of a real product: persistence + learning loop

Bookmark a phrase → **Favorites** → refresh the page (F5) → favourites still there → **Quiz** → answer one →
immediate feedback → show *Best score* and *Attempts*.

> "Favourites persist on device with no account and no server. The quiz draws its questions from the same reviewed
> data, keeps your best score while counting every attempt, and hands your misses back as review cards.
> React, TypeScript, Vite, Tailwind, Web Speech, localStorage — 83 tests pass, including tests on the dataset
> itself: script purity, every conversation branch reachable, every answer index valid.
> Repo and live URL are in the submission. ಧನ್ಯವಾದಗಳು — thank you."

---

## If you only get 60 seconds

Home → one situation → play a phrase → "What do I say?" with the fever query → one role-play turn with the risky
coaching note → refresh to show persisted favourites. Those five beats are the product.

## Failure drills (rehearse these so nothing surprises you)

| If this happens | Say / do |
| --- | --- |
| No audio at all | "This profile has no speech voice installed — the app detects that and switches to the transliteration path. That fallback is tested." |
| Mic permission denied / no recognition | "Desktop Chrome routes recognition to a network service. On the practice page the typed comparison does the same exercise, and the capability panel already told us the truth." |
| Venue Wi-Fi dies | "Deliberate: nothing is fetched at runtime. The whole app is the bundle." |
| Someone asks "is this AI?" | "The ranking, retrieval and role-play are deterministic over curated data. An LLM is optional, behind my own proxy, and the key never ships in the frontend — `VITE_` variables are inlined into the JS, so a provider secret there would be public." |
| Someone asks about translation accuracy | "107 lines are standard everyday Kannada; 4 are colloquial and visibly badged `needs-native-review`, and the regional table is marked the same way. A native-speaker review pass is the documented next step — the review flag is a field on every phrase, so a correction is a one-line data change." |

## Keyboard quick-reference for a smooth run

`Tab` moves through nav and cards · `Esc` closes the mobile menu · search box is `⌘/Ctrl`-clickable directly ·
quiz options lock after answering (no score editing) · `#/favorites` after a refresh is the persistence proof.
