# Kannada Saathi — project summary

*Problem statement #3: **Kannada in Everyday Life** (supporting capability: #2 Voice of Kannada)*
*Kannada Digital Innovation Hackathon 2026 · HackerRank Campus Crew · NIE Mysuru · individual entry*

---

## 1. Problem

Karnataka's public life runs on Kannada. Bus conductors, market vendors, pharmacy counters, hospital reception
desks, college offices, auto drivers and temple watchmen all speak it by default. The state's official-language
policy puts Kannada first on shop boards, notices and signage.

Newcomers — students, transferred employees, nurses, labourers, tourists, families accompanying a patient — are
usually literate in English and Hindi but functionally silent in Kannada. The consequence is not embarrassment, it
is **loss of access**:

* a missed stop because nobody was asked;
* an overpaid auto fare because "ಮೀಟರ್ ಹಾಕಿ" was not said;
* a medicine taken at the wrong time because the dosage question felt too heavy to ask;
* a landlord conversation conducted entirely through a third person.

Word-level translation tools do not fix this. What a person needs at a counter is a *sentence*, its *sound*, and
the *tone* that makes it polite rather than blunt.

## 2. Who is affected

| Group | Situation they lose |
| --- | --- |
| First-year students (Mysuru, Manipal, Bengaluru) | classroom, office, hostel mess, directions |
| Transferred professionals & guards/staff | workplace small talk, services, shopping |
| Patients & caregivers from other states | symptom description, dosage, follow-up date |
| Market vendors' new customers | price, weight, change, receipt |
| Tourists at Hampi, Coorg, Gokarna, Mysuru | entry fee, permission, guide, hotel basics |
| Anyone accompanying an elderly relative | everything at a government counter |

## 3. Solution

**Kannada Saathi** — "ನಮ್ಮ ಕನ್ನಡ ಸಂಗಾತಿ" — is a mobile-first, offline-first companion organised **by the moment you
are in**, not by vocabulary topic.

1. **Eight situations, 111 reviewed phrases.** Each card = Kannada script + reader transliteration + English
   meaning + *when to use* + pronunciation tip + audio (where the browser allows) + copy + bookmark.
2. **"What do I say?"** — describe the problem in English, get ranked Kannada lines from the dataset. Works with
   no network and no API key.
3. **Voice practice with honest feedback.** Mic input through `SpeechRecognition(kn-IN)`, a typed fallback, and a
   visible capability dashboard. Feedback is *text similarity*, and the app explicitly refuses to advertise an
   acoustic pronunciation score it does not have.
4. **Six branching role-plays** — bus conductor, vegetable market, tea shop, clinic, auto ride, hotel check-in —
   where a "risky" reply is *explained*, alternatives are offered, and free text resolves to real dataset lines.
5. **Searchable phrasebook + favourites** — ranked across all four fields, filtered by situation, persisted in
   `localStorage` so it survives a refresh; plus copy-all/export to `.txt`.
6. **Quiz & matching** — 12 curated judgement questions plus a generator over the same data; 4 question types,
   a pair-matching round, immediate feedback, best-score-kept/attempt-counted progress, and a review list of the
   exact phrases you missed.
7. **Cultural and regional context** treated as product content: namaskāra as gesture, the -ರು respect marker,
   akka/appa/mama address norms, footwear and camera etiquette, the head tilt, spoken vs written Kannada — and a
   regional-variant table in which every row is badged *needs native review* rather than passed off as universal.

## 4. Why it is different from the existing system

| Today's option | Gap | Kannada Saathi |
| --- | --- | --- |
| Google Translate | word/sentence pairs, no situation, no tone, no practice | moment-first, tone-labelled, rehearsable |
| Duolingo-style apps | gamified vocabulary, weeks to first usable sentence | usable in eight minutes, at the counter |
| YouTube "basic Kannada" videos | passive, no retrieval at the moment of need | searchable, one line per need |
| Phrasebook PDFs | script without sound or transliteration | script + transliteration + meaning + audio where available |
| Asking a Kannada friend | not available at 6 a.m. at a bus stand | on-device, offline, no network |

Differentiators judges can see in the demo: **local-first reliability** (nothing to break on venue Wi-Fi),
**honest AI boundaries** (no fake pronunciation scores, no invented dialects, flagged dataset review), and
**role-play that explains a wrong-but-understood reply instead of failing you**.

## 5. How it works (approach)

* Data as typed modules, compiled into the bundle → first paint already has content; zero runtime fetches.
* One reducer-like context (`useProgress`) owns favourites, recent history, practice log, completed scenes and quiz
  best — persisted under a single versioned `localStorage` key with defensive hydration.
* A capability layer for speech: `detectCapabilities()` + typed failure reasons, so the UI reports what *this*
  browser can do instead of assuming.
* One normalisation layer (Kannada/ASCII-aware, diacritic-insensitive) shared by search, the assistant and the
  practice comparison.
* Optional AI only behind `VITE_AI_PROXY_URL`, with the secret held server-side by the developer's proxy; offline
  answer always remains valid, and proxy failures degrade visibly.
* Tests on the data itself (script purity, graph reachability, quiz answer validity) because an AI-assisted build's
  real risk is silently wrong content, not a broken build.

## 6. Expected impact

* **Immediate:** a learner completes one real transaction per situation without switching to English.
* **Language access:** lowers the social cost of speaking Kannada to a stranger, which is the actual barrier.
* **Dignity and safety:** hospital and dosage phrases reduce miscommunication where the stakes are health.
* **Cultural respect:** learners hear the polite form, and see why it matters, before they arrive.
* **Reusable artefact:** the dataset is version-controlled and reviewable, so a Kannada speaker can grow it into a
  public-good phrasebook; the review flags make the remaining uncertainty explicit instead of hidden.

## 7. Scope for a future version

1. Native-speaker review pass (and a public, attributed dataset with a review log).
2. Offline Kannada TTS via a bundled small model, or a documented `kn-IN` voice install path per OS.
3. A real pronunciation-scoring experiment with a forced-alignment model, behind an explicit "experimental" flag.
4. Situation packs for government counters, rent/agreement conversations and parent–teacher meetings.
5. A PWA install path (manifest + service worker) for one-tap offline use.
6. An "add a phrase" contribution flow with the same validation tests the bundled data must pass.
