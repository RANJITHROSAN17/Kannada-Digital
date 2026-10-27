# Presentation outline — Kannada Saathi

13 slides, ~6 minutes of talking. A ready-made deck is at
[`Kannada-Saathi-Hackathon-Presentation.pptx`](Kannada-Saathi-Hackathon-Presentation.pptx) — this outline is the
speaker notes version, and covers every section the submission guidelines require.

| # | Slide | Say this | Visual |
| --- | --- | --- | --- |
| 1 | Title | "Kannada Saathi — Speak Kannada. Navigate Karnataka with confidence." Problem statement #3, Kannada in Everyday Life. Individual entry. | Brand mark ಕ, tagline, hackathon + NIE Mysuru credit |
| 2 | Problem statement | Public life in Karnataka runs on spoken Kannada: conductor, vendor, pharmacy, hospital desk, college office. Signage puts Kannada first. Newcomers are English-literate but functionally silent. | Photo-free, text + 4 icons of real moments |
| 3 | Who is affected, and what they lose | Students, transferred staff, nurses, patients and caregivers, tourists. Cost: a missed stop, an overpaid fare, a wrong dosage time, a conversation through a third person. | Table: group → situation lost |
| 4 | Existing system and its gaps | Translate = words, no tone, no situation. Duolingo-style = weeks to a usable sentence. Videos = passive. PDFs = script without sound. Asking a friend = unavailable at 6 a.m. | 5-column gap table |
| 5 | Solution in one line | An offline companion organised **by the moment you are in**: script + transliteration + meaning + when-to-use + audio + culture, then rehearse it, then prove it. | App hero screenshot |
| 6 | How your solution is different | Situation-first, not word-first. Tone labelled (polite/casual/formal). Role-play that *explains* a risky reply. Local-first: no key, no backend, works on venue Wi-Fi. Honest AI boundaries. | 4 badges: offline · honest fallbacks · role-play · reviewed data |
| 7 | Approach | 8 situations × 111 reviewed phrases as typed data → compiled in. One progress context + versioned localStorage. Speech capability layer with typed failure reasons. Shared normalisation for search/assistant/practice. Optional AI strictly behind your own proxy. | Flow diagram (slide 10 also) |
| 8 | Feature walkthrough | 1) open *Hospital & pharmacy* 2) "What do I say?" → "I have fever since two days" 3) role-play the bus scene 4) mic practice + typed fallback 5) quiz + matching, best score kept 6) favourites after refresh | Live app (recommended) |
| 9 | Proof in the browser | Six captures from the running build — home, situations, a role-play reply, the quiz result with review cards, the voice-practice capability dashboard, and the 390 px layout. Say that these are captures, not comps, and that the same commit passes `tsc` and 80 tests. | 6 screenshots from `docs/screenshots/` |
| 10 | Tech stack & architecture | React 18 + TS strict + Vite 5 + Tailwind 3 + lucide; react-router HashRouter (zero rewrite rules on any static host); Web Speech APIs; localStorage; Vitest 80 tests. **No backend, no runtime fetch.** | Architecture diagram |
| 11 | Honesty & data governance | 107 phrases `verified-usage`, 4 badged `needs-native-review`; regional variants marked, never taught as universal; **no acoustic pronunciation score** — text similarity only, stated in the UI; dataset tests assert script purity, graph reachability, quiz validity. | Screenshot of a flagged card + the capability dashboard |
| 12 | Impact & limitations | Impact: one real transaction per situation in ~8 minutes; less social cost of trying; fewer dosage errors; a reviewable dataset others can grow. Limits: desktop Kannada TTS is rare, recognition is network-backed, 111 phrases ≠ a dictionary, needs a native review pass. | Two columns |
| 13 | Conclusion & next | Done: full MVP, tests, docs, deploy. Next: native review pass, PWA offline install, situation packs for government counters, experimental scoring behind a flag. Repo + live URL. | QR/links, thanks — ಧನ್ಯವಾದಗಳು |

## Rules that keep this deck winning

* Every claim on a slide is demoable in the app or visible in the repo.
* Never say "AI-powered" without saying which part is retrieval and which part is optional.
* Keep the honesty slide (#11). Judges see dozens of language apps; a project that states what it will *not* fake
  stands out.
* End by naming the problem statement again — it proves the submission matches the brief.

## 3–5 minute explanation video (per the guidelines)

Guideline timing → what to record:

| Time | Content |
| --- | --- |
| 0:00–0:45 | Problem statement #3 read out in your own words; who is affected; the requirement: help people learn and use Kannada in travel, shopping, education, healthcare, transport, workplaces |
| 0:45–1:30 | Existing system: translate apps, videos, phrasebooks — show one concrete gap (a hospital counter needs a sentence + sound + tone) |
| 1:30–3:30 | Live demo: situations → one phrase card (play, copy, bookmark) → "What do I say?" → role-play a bus scene including the coaching note → voice practice, including the *unsupported* fallback → quiz + matching → refresh to show favourites persisting |
| 3:30–4:30 | Tech stack + architecture diagram; explain offline-first data, localStorage persistence, Web Speech capability layer, optional proxy with the key held server-side; mention 80 tests |
| 4:30–5:00 | Conclusion: impact, known limitations, next steps; repo + live URL on screen |

Recording tips: 1920×1080, browser at desktop width then one mobile shot at 390 px, no face needed, screen
capture with voice-over, and keep the terminal out of frame except when you deliberately run `npm test`.
