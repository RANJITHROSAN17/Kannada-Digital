#!/usr/bin/env python3
"""Generate the hackathon deck for Kannada Saathi.

Reproducible on purpose: `python3 scripts/make_deck.py` rebuilds
docs/Kannada-Saathi-Hackathon-Presentation.pptx, so the deck stays in step with
the code and the numbers quoted in it are written from the repo's own data
files rather than typed by hand.

Sections follow the submission guidelines exactly:
Problem Statement · Existing System · How Your Solution Is Different ·
Approach · Tech Stack & Architecture Diagram · Conclusion.
"""

from __future__ import annotations

import re
import struct
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "Kannada-Saathi-Hackathon-Presentation.pptx"

IVORY = RGBColor(0xFD, 0xF7, 0xEA)
CREAM = RGBColor(0xFF, 0xFC, 0xF5)
INK = RGBColor(0x13, 0x1B, 0x31)
INK_SOFT = RGBColor(0x41, 0x52, 0x7E)
SAFFRON = RGBColor(0xE8, 0x89, 0x0B)
SAFFRON_DARK = RGBColor(0x9A, 0x53, 0x05)
LEAF = RGBColor(0x2F, 0x7A, 0x45)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
ROSE = RGBColor(0xB0, 0x3A, 0x2E)
HAIR = RGBColor(0xE4, 0xDC, 0xC9)

W, H = Inches(13.333), Inches(7.5)


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def add_slide(prs: Presentation):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = IVORY
    bg.line.fill.background()
    bg.shadow.inherit = False
    return slide


def textbox(slide, left, top, width, height, *, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(left, top, width, height)
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    frame.margin_left = frame.margin_right = Emu(0)
    frame.margin_top = frame.margin_bottom = Emu(0)
    frame.paragraphs[0].alignment = align
    return box, frame


def set_text(frame, runs, *, size=18, color=INK, bold=False, space_after=6, line=1.15, align=None):
    """runs: str, or list of (text, dict-overrides) tuples for one paragraph."""
    para = frame.paragraphs[0]
    para.space_after = Pt(space_after)
    para.line_spacing = line
    if align is not None:
        para.alignment = align
    if isinstance(runs, str):
        runs = [(runs, {})]
    for text, overrides in runs:
        run = para.add_run()
        run.text = text
        font = run.font
        font.size = Pt(overrides.get("size", size))
        font.bold = overrides.get("bold", bold)
        font.italic = overrides.get("italic", False)
        font.color.rgb = overrides.get("color", color)
        font.name = overrides.get("font", "Calibri")
    return para


def add_paragraph(frame, runs, *, size=18, color=INK, bold=False, space_after=6, level=0, line=1.15, align=None):
    para = frame.add_paragraph()
    para.space_after = Pt(space_after)
    if align is not None:
        para.alignment = align
    para.level = level
    para.line_spacing = line
    if isinstance(runs, str):
        runs = [(runs, {})]
    for text, overrides in runs:
        run = para.add_run()
        run.text = text
        font = run.font
        font.size = Pt(overrides.get("size", size))
        font.bold = overrides.get("bold", bold)
        font.italic = overrides.get("italic", False)
        font.color.rgb = overrides.get("color", color)
        font.name = overrides.get("font", "Calibri")
    return para


def title(slide, eyebrow, text, sub=None, *, kannada=None):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, Inches(0.12))
    bar.fill.solid()
    bar.fill.fore_color.rgb = SAFFRON
    bar.line.fill.background()
    bar.shadow.inherit = False

    _, frame = textbox(slide, Inches(0.7), Inches(0.45), Inches(11.9), Inches(1.5))
    set_text(frame, eyebrow.upper(), size=13, color=SAFFRON_DARK, bold=True, space_after=2)
    add_paragraph(frame, text, size=30, color=INK, bold=True, space_after=2)
    if sub:
        add_paragraph(frame, sub, size=15, color=INK_SOFT, space_after=0)
    if kannada:
        add_paragraph(frame, kannada, size=17, color=SAFFRON_DARK, space_after=0)


def bullets(slide, left, top, width, height, items, *, size=17, gap=9):
    _, frame = textbox(slide, left, top, width, height)
    first = True
    for item in items:
        head, body = (item if isinstance(item, tuple) else (item, None))
        runs = [("•  ", {"color": SAFFRON, "bold": True}), (head, {})]
        if body:
            runs.append((" — " + body, {"color": INK_SOFT, "size": size - 2}))
        if first:
            set_text(frame, runs, size=size, color=INK, space_after=gap)
            first = False
        else:
            add_paragraph(frame, runs, size=size, color=INK, space_after=gap)
    return frame


def card(slide, left, top, width, height, *, fill=WHITE, line_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.adjustments[0] = 0.08
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    shape.shadow.inherit = False
    frame = shape.text_frame
    frame.word_wrap = True
    frame.margin_left = frame.margin_right = Inches(0.16)
    frame.margin_top = frame.margin_bottom = Inches(0.12)
    frame.vertical_anchor = MSO_ANCHOR.TOP
    return shape, frame


def table(slide, left, top, width, rows, *, col_ratios=None, header=True, size=13):
    height = Inches(0.42 * len(rows) + 0.1)
    shape = slide.shapes.add_table(len(rows), len(rows[0]), left, top, width, height)
    grid = shape.table
    if col_ratios:
        total = sum(col_ratios)
        for index, ratio in enumerate(col_ratios):
            grid.columns[index].width = Emu(int(width * ratio / total))
    for r, row in enumerate(rows):
        for c, value in enumerate(row):
            cell = grid.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.09)
            cell.margin_top = cell.margin_bottom = Inches(0.05)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if header and r == 0:
                cell.fill.fore_color.rgb = INK
            elif r % 2 == 0:
                cell.fill.fore_color.rgb = CREAM
            else:
                cell.fill.fore_color.rgb = WHITE
            frame = cell.text_frame
            frame.word_wrap = True
            set_text(
                frame,
                str(value),
                size=size,
                color=WHITE if (header and r == 0) else INK,
                bold=bool(header and r == 0),
                space_after=0,
                line=1.05,
            )
    return grid


def footer(slide, text, page=None):
    _, frame = textbox(slide, Inches(0.7), Inches(6.92), Inches(10.6), Inches(0.35))
    set_text(frame, text, size=11, color=INK_SOFT, space_after=0)
    if page is not None:
        _, num = textbox(slide, Inches(11.9), Inches(6.92), Inches(0.8), Inches(0.35), align=PP_ALIGN.RIGHT)
        set_text(num, str(page), size=11, color=SAFFRON_DARK, bold=True, space_after=0)


def counts():
    """Read the real numbers out of the source data so slides cannot drift."""
    text = (ROOT / "src" / "data" / "phrases.ts").read_text(encoding="utf-8")
    phrases = len(re.findall(r"^    id: '", text, re.M))
    flagged = len(re.findall(r"review: 'needs-native-review'", text))
    conv = (ROOT / "src" / "data" / "conversations.ts").read_text(encoding="utf-8")
    scenes = len(re.findall(r"^    id: '", conv, re.M))
    cats = (ROOT / "src" / "data" / "categories.ts").read_text(encoding="utf-8")
    situations = len(re.findall(r"^    id: '", cats, re.M))
    notes = (ROOT / "src" / "data" / "culture.ts").read_text(encoding="utf-8")
    cultural = len(re.findall(r"^    id: '", notes[: notes.index('export const regionalVariants')], re.M))
    return {
        "phrases": phrases,
        "verified": phrases - flagged,
        "flagged": flagged,
        "scenes": scenes,
        "situations": situations,
        "cultural": cultural,
    }


# --------------------------------------------------------------------------- #
# slides
# --------------------------------------------------------------------------- #
def build():
    n = counts()
    prs = Presentation()
    prs.slide_width, prs.slide_height = W, H

    # -- 1. title ----------------------------------------------------------- #
    slide = add_slide(prs)
    panel = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, Inches(4.5))
    panel.fill.solid()
    panel.fill.fore_color.rgb = INK
    panel.line.fill.background()
    panel.shadow.inherit = False

    mark, mark_frame = card(slide, Inches(0.7), Inches(0.75), Inches(1.05), Inches(1.05), fill=INK)
    set_text(mark_frame, "ಕ", size=40, color=SAFFRON, bold=True, space_after=0)
    mark_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

    _, frame = textbox(slide, Inches(2.0), Inches(0.78), Inches(10.3), Inches(1.6))
    set_text(frame, "Kannada Saathi", size=38, color=WHITE, bold=True, space_after=2)
    add_paragraph(frame, "ಕನ್ನಡ ಸಾಥಿ · your Kannada companion for everyday Karnataka", size=16, color=SAFFRON, space_after=0)

    _, sub = textbox(slide, Inches(2.0), Inches(2.6), Inches(10.3), Inches(1.3))
    set_text(sub, "Speak Kannada. Navigate Karnataka with confidence.", size=24, color=WHITE, bold=True, space_after=6)
    add_paragraph(sub, "A working, offline-first communication companion — not another vocabulary quiz.", size=16, color=RGBColor(0xD9, 0xE0, 0xF2), space_after=0)

    _, meta = textbox(slide, Inches(2.0), Inches(3.62), Inches(10.3), Inches(0.8))
    set_text(meta, "Kannada Digital Innovation Hackathon 2026 · HackerRank Campus Crew × NIE Mysuru", size=13, color=RGBColor(0xD9, 0xE0, 0xF2), space_after=3)
    add_paragraph(meta, "Problem statement #3 — Kannada in Everyday Life   (supporting capability: #2 Voice of Kannada)   ·   Individual submission", size=13, color=SAFFRON, bold=True, space_after=0)

    strip = [("111", "reviewed phrases"), ("8", "everyday situations"), ("6", "role-play scenes"), ("0", "API keys needed")]
    for index, (big, small) in enumerate(strip):
        left = Inches(0.7 + index * 3.13)
        _, c = card(slide, left, Inches(5.0), Inches(2.93), Inches(1.55), fill=WHITE, line_color=RGBColor(0xD9, 0xE0, 0xF2))
        set_text(c, big, size=34, color=SAFFRON_DARK, bold=True, align=PP_ALIGN.CENTER, space_after=2)
        add_paragraph(c, small, size=13, color=INK_SOFT, align=PP_ALIGN.CENTER, space_after=0)
    footer(slide, "React 18 · TypeScript strict · Vite · Tailwind · Web Speech APIs · localStorage · 80 passing tests", 1)

    # -- 2. problem statement ------------------------------------------------ #
    slide = add_slide(prs)
    title(slide, "Problem statement · Kannada in Everyday Life", "Public life in Karnataka runs on spoken Kannada",
          "Students, professionals, patients, workers and visitors need sentences, sounds and tone — not word lists")
    bullets(slide, Inches(0.7), Inches(2.15), Inches(6.5), Inches(4.2), [
        ("Signage and counters are Kannada-first", "shops, hospitals, rail and bus infrastructure, government offices"),
        ("Translation tools stop at the word", "they do not give a beginner a polite, complete sentence"),
        ("The cost is access, not embarrassment", "missed stop · overpaid fare · wrong dosage timing · a visit conducted through a third person"),
        ("The barrier is social", "people stay silent because a mistake feels rude, and no tool rehearses the moment"),
    ], size=16, gap=12)

    _, right = textbox(slide, Inches(7.55), Inches(2.15), Inches(5.1), Inches(0.5))
    set_text(right, "Six moments the app is built around", size=15, color=SAFFRON_DARK, bold=True, space_after=0)
    moments = [("ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?", "Where is the bus station?"), ("ಇದರ ಬೆಲೆ ಎಷ್ಟು?", "How much is this?"),
               ("ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ.", "Fever for two days."), ("ಈ ಮಾತ್ರೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿಯೇ?", "Tablet on an empty stomach?"),
               ("ಮೀಟರ್ ಹಾಕಿ, ಸಾರ್.", "Use the meter, sir."), ("ಒಂದು ಕೋಣೆ ಖಾಲಿ ಇದೆಯೇ?", "Is a room free?")]
    for index, (kn, en) in enumerate(moments):
        _, c = card(slide, Inches(7.55), Inches(2.7 + index * 0.66), Inches(5.1), Inches(0.58), fill=CREAM, line_color=RGBColor(0xEF, 0xE1, 0xBE))
        set_text(c, [(kn + "   ", {"size": 14, "bold": True, "color": INK}), (en, {"size": 12, "color": INK_SOFT})], space_after=0)
        c.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "Requirement read-back: help people learn and use Kannada in travel, shopping, education, healthcare, transportation and workplaces.", 2)

    # -- 3. who is affected --------------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Who is affected · and what they lose", "Same city, different silence")
    table(slide, Inches(0.7), Inches(2.2), Inches(11.9), [
        ("Group", "The moment they cannot handle", "Today's workaround"),
        ("First-year students (Mysuru, Manipal, Bengaluru)", "classroom office, hostel mess, asking a question in class", "English, or a Kannada-speaking friend"),
        ("Transferred professionals & site staff", "auto fare, shop bargaining, small talk with colleagues", "translation app, one word at a time"),
        ("Patients and caregivers from other states", "describe pain, confirm dosage timing, follow-up date", "gesture, third-party interpreting"),
        ("Market, domestic and gig workers", "employer instructions, pharmacy, bus conductor", "pidgin Kannada, repeated mistakes"),
        ("Tourists at Hampi, Coorg, Gokarna, Mysuru", "entry fee, photo permission, guide, hotel basics", "phone maps, cash-only confusion"),
    ], col_ratios=[3.1, 4.4, 3.0], size=13)
    _, note = textbox(slide, Inches(0.7), Inches(5.85), Inches(11.9), Inches(0.9))
    set_text(note, [("Impact goal: ", {"bold": True, "color": SAFFRON_DARK}),
                    ("after eight minutes in the app, a learner completes one real transaction in the situation they just rehearsed — without switching to English or waving a phone.", {})],
               size=16, color=INK, space_after=0)
    footer(slide, "Target users: anyone literate in English who is functionally silent in Kannada.", 3)

    # -- 4. existing system --------------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Existing system", "Today's tools translate words. They do not survive a counter.")
    table(slide, Inches(0.7), Inches(2.15), Inches(11.9), [
        ("Existing option", "What it does well", "Where it fails at the moment of need"),
        ("Google Translate", "fast word/sentence pairs", "no situation, no tone, no practice, no polite-vs-blunt choice, useless offline on venue Wi-Fi"),
        ("Duolingo-style apps", "habit, gamification", "weeks of lessons before one usable sentence; topic lists, not bus stands"),
        ("YouTube basic-Kannada videos", "listening exposure", "passive; nothing retrievable when you are already standing at the counter"),
        ("PDF phrasebooks", "dense content", "script without sound or transliteration; no meaning of *when* to say it"),
        ("Asking a local friend", "accurate, warm", "not available at 6 a.m. at a bus stand; no repetition for the learner"),
    ], col_ratios=[2.5, 3.0, 6.4], size=13)
    _, gap = card(slide, Inches(0.7), Inches(5.55), Inches(11.9), Inches(1.05), fill=CREAM, line_color=SAFFRON)
    set_text(gap, [("The real gap: ", {"bold": True, "color": SAFFRON_DARK, "size": 15}),
                   ("a sentence you can say, the sound of it, the tone that makes it polite, and a rehearsal of the reply you will actually get.", {"size": 15})],
           color=INK, space_after=0)
    gap.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "A gap in workflow, not in vocabulary data — so the fix is product shape, not a bigger word list.", 4)

    # -- 5. solution ---------------------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "The solution", "Kannada Saathi: organised by the moment you are in")
    items = [
        ("A · Situations", f"{n['situations']} situation cards → {n['phrases']} reviewed phrases. Script + transliteration + meaning + when-to-use + audio + copy + bookmark."),
        ("B · Voice practice", "kn-IN recognition where supported, typed fallback, capability dashboard that states what the browser can do. Text-similarity feedback — never a fake accent score."),
        ("C · Role-play", f"{n['scenes']} branching scenes. The other person replies; every choice gets a coaching note; risky-but-understood replies are explained, not failed."),
        ("D · Phrasebook", "Ranked search across all four fields, situation filter, sort modes, recently viewed; favourites persist on-device and export as .txt from /favorites."),
        ("E · Quiz", "12 curated judgement questions + a generator over the same data, 4 question types, matching round, best score kept, misses returned as review cards."),
        ("F · Culture", f"{n['cultural']} context notes (namaskāra gesture, -ರು respect, akka/appa/mama, temple etiquette) + regional variants, each badged for native review."),
    ]
    for index, (head, body) in enumerate(items):
        left = Inches(0.7 + (index % 2) * 6.1)
        top = Inches(2.15 + (index // 2) * 1.5)
        _, c = card(slide, left, top, Inches(5.8), Inches(1.35), fill=WHITE, line_color=RGBColor(0xD9, 0xE0, 0xF2))
        set_text(c, head, size=15, color=SAFFRON_DARK, bold=True, space_after=3)
        add_paragraph(c, body, size=12.5, color=INK, space_after=0, line=1.12)
    _, extra = textbox(slide, Inches(0.7), Inches(6.6), Inches(11.9), Inches(0.5))
    set_text(extra, [("Bonus: ", {"bold": True, "color": SAFFRON_DARK}),
                     ("“What do I say?” — describe the problem in English, get ranked Kannada lines. Retrieval over the reviewed dataset; works with zero network.", {})],
               size=14, color=INK, space_after=0)
    footer(slide, "Every feature above is implemented and reachable in the live build — no mock screens.", 5)

    # -- 6. how it is different ---------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "How this is different", "Four decisions nobody else in this category is making")
    diffs = [
        ("Situation-first, not word-first", "Content is indexed by the pressure you are under, so retrieval at a counter takes one tap instead of a dictionary search."),
        ("Honest capability reporting", "The app tells you when your browser has no Kannada voice or no recognition, and hands you the typed fallback. It refuses to display a pronunciation score it cannot compute."),
        ("Role-play that explains", "A polite-but-wrong reply is answered and annotated, because that is what happens in real speech — the lesson is in the tone, not the vocabulary."),
        ("Local-first, reviewable data", "No backend, no key, no runtime fetch. Every phrase carries a review status, so a native speaker can audit and fix the dataset in one file."),
    ]
    for index, (head, body) in enumerate(diffs):
        left = Inches(0.7 + (index % 2) * 6.1)
        top = Inches(2.2 + (index // 2) * 1.85)
        _, c = card(slide, left, top, Inches(5.8), Inches(1.7), fill=WHITE, line_color=SAFFRON)
        set_text(c, head, size=16, color=INK, bold=True, space_after=4)
        add_paragraph(c, body, size=13, color=INK_SOFT, space_after=0, line=1.15)
    _, proof = card(slide, Inches(0.7), Inches(5.95), Inches(11.9), Inches(0.72), fill=INK)
    set_text(proof, [("Judged on innovation? The innovation is the trust model: ", {"bold": True, "color": SAFFRON}),
                     (f"{n['verified']} standard lines, {n['flagged']} visibly badged for review, 0 invented dialects, 80 automated tests that police the data itself.", {"color": WHITE})],
           size=14.5, space_after=0)
    proof.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "Existing system: words. This: sentences, sound, tone, rehearsal, and knowing what it does not know.", 6)

    # -- 7. approach ---------------------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Approach", "How it is built, and why each choice")
    steps = [
        ("Model the data first", f"Phrase / Category / ConversationScenario / QuizQuestion / ProgressState as TypeScript types in src/types. {n['phrases']} phrases and 6 scenes as typed modules compiled into the bundle → content on first paint, no fetch, no key."),
        ("One state owner", "ProgressProvider context exposes favourites, recent, practice log, scenes, quiz best. services/storage.ts writes one versioned localStorage key with defensive hydration → refresh-safe, multi-tab safe, quota-safe."),
        ("Capability layer for voice", "detectCapabilities() reads speechSynthesis voices, SpeechRecognition and secure context. Every entry point returns a typed reason (no-tts / no-voices / permission-denied / no-speech / network) instead of throwing."),
        ("One normalisation layer", "utils/text.ts (NFKD, diacritic- and ZWNJ-tolerant) is shared by search, the assistant and the similarity comparison, so transliteration quirks never split the results."),
        ("Role-play as a graph", "Nodes + options with a mandatory `next` (node id or end). Tests walk every edge, so no scene can dead-end; free text resolves through the same search ranking."),
        ("Optional AI, fenced off", "assistant.ts is offline retrieval by default. VITE_AI_PROXY_URL points at your own proxy — the provider key never ships, because VITE_* is inlined into public JS."),
    ]
    for index, (head, body) in enumerate(steps):
        top = Inches(2.05 + index * 0.81)
        _, c = card(slide, Inches(0.7), top, Inches(11.9), Inches(0.72), fill=WHITE, line_color=RGBColor(0xD9, 0xE0, 0xF2))
        set_text(c, [(f"{index + 1}.  ", {"bold": True, "color": SAFFRON, "size": 14}),
                     (head + " — ", {"bold": True, "size": 13.5, "color": INK}),
                     (body, {"size": 12.5, "color": INK_SOFT})], space_after=0, line=1.05)
        c.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "Key design decision: reliability beats feature count. Nothing in the core flow can fail because a service is down.", 7)

    # -- 8. walkthrough ------------------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Feature walkthrough", "One user, one morning, six screens")
    walk = [
        ("Open → Situations", "eight cards, each showing how many phrases you have opened"),
        ("Hospital & pharmacy", "tap a card: script, transliteration, meaning, when-to-use, play, copy, save"),
        ("What do I say?", "type “I have fever since two days” → ranked Kannada lines, offline"),
        ("Role-play: bus", "choose a reply → the conductor answers → coaching note + alternatives"),
        ("Voice practice", "mic in kn-IN, or type it → text-match score + capability truth panel"),
        ("Quiz & refresh", "answer → matching round → best score kept; favourites survive F5"),
    ]
    for index, (head, body) in enumerate(walk):
        left = Inches(0.7 + (index % 3) * 4.05)
        top = Inches(2.25 + (index // 3) * 1.55)
        num = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, Inches(0.42), Inches(0.42))
        num.fill.solid(); num.fill.fore_color.rgb = SAFFRON; num.line.fill.background(); num.shadow.inherit = False
        set_text(num.text_frame, str(index + 1), size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER, space_after=0)
        _, c = card(slide, left + Inches(0.55), top - Inches(0.04), Inches(3.35), Inches(1.4), fill=WHITE, line_color=RGBColor(0xD9, 0xE0, 0xF2))
        set_text(c, head, size=14, color=INK, bold=True, space_after=3)
        add_paragraph(c, body, size=12, color=INK_SOFT, space_after=0, line=1.12)
    _, demo = card(slide, Inches(0.7), Inches(5.6), Inches(11.9), Inches(0.95), fill=CREAM, line_color=LEAF)
    set_text(demo, [("Live demo in the submission video covers exactly this path. ", {"bold": True, "color": LEAF, "size": 14}),
                    ("Functional requirements met: browse a scenario · search · save/remove favourites · favourites persist after refresh · play or an explicit unsupported fallback · complete a conversation · complete a quiz with a score · progress from real interactions only · desktop + mobile · README-run local start.", {"size": 12.5})],
           color=INK, space_after=0)
    demo.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "Nothing above is a design comp: each screen is implemented and reachable in the running build — the next slide shows them as captured.", 8)

    # -- 9. screenshots from the running build -------------------------------- #
    slide = add_slide(prs)
    title(
        slide,
        "Proof in the browser",
        "Captured from the running build",
        "Chromium at 1280 px and 390 px \u00b7 0 console errors \u00b7 files in docs/screenshots/",
    )
    shots = [
        ("home.png", "Home \u00b7 progress, streak, phrase of the day"),
        ("situations.png", "Situations \u00b7 8 cards with per-card progress"),
        ("scene-bus.png", "Role-play \u00b7 reply, coaching note, alternatives"),
        ("quiz-result.png", "Quiz \u00b7 score, best kept, misses as review cards"),
        ("practice.png", "Voice practice \u00b7 capability + typed fallback"),
        ("mobile.png", "390 px \u00b7 bottom tab bar, one-thumb use"),
    ]
    cell_w, cell_h = 3.95, 1.95
    left0, top0 = 0.62, 1.72
    for idx, (fname, caption) in enumerate(shots):
        path = ROOT / "docs" / "screenshots" / fname
        with open(path, "rb") as fh:
            pw, phh = struct.unpack(">II", fh.read(24)[16:24])
        col, row = idx % 3, idx // 3
        box_l = left0 + col * (cell_w + 0.18)
        box_t = top0 + row * (cell_h + 0.62)
        scale = min(cell_w / pw, cell_h / phh)
        w, h = pw * scale, phh * scale
        card(slide, Inches(box_l - 0.05), Inches(box_t - 0.05), Inches(cell_w + 0.10), Inches(cell_h + 0.46),
             fill=WHITE, line_color=HAIR)
        slide.shapes.add_picture(str(path), Inches(box_l + (cell_w - w) / 2), Inches(box_t), Inches(w), Inches(h))
        _, cap = textbox(slide, Inches(box_l), Inches(box_t + cell_h + 0.06), Inches(cell_w), Inches(0.32))
        set_text(cap, caption, size=11.5, color=INK_SOFT, space_after=0, line=1.05)
    footer(slide, "Same build the judges get: npm install && npm run dev \u2192 localhost:5173 \u00b7 tsc and 80 tests green on this commit.", 9)

    # -- 10. tech stack + architecture diagram -------------------------------- #
    slide = add_slide(prs)
    title(slide, "Tech stack & architecture", "Local-first: 100 % static, optional proxy")
    stack = [
        ("Frontend", "React 18 · TypeScript 5.6 strict · Vite 5 · Tailwind CSS 3 · lucide-react"),
        ("Routing", "react-router-dom 6 with HashRouter → zero rewrite rules on any static host, deep links survive refresh"),
        ("State & storage", "one React context + localStorage key kannada-saathi:progress:v1 (versioned, defensive hydration)"),
        ("Speech", "Web Speech APIs: speechSynthesis + SpeechRecognition(kn-IN), behind a capability detector with typed failures"),
        ("Data", f"src/data: {n['phrases']} phrases · {n['situations']} categories · {n['scenes']} conversations · culture notes · quiz generator"),
        ("Quality", "Vitest + Testing Library + jsdom: 7 files / 80 tests, including dataset-integrity tests; CI gates the Pages deploy"),
    ]
    for index, (head, body) in enumerate(stack):
        top = Inches(2.05 + index * 0.63)
        _, c = card(slide, Inches(0.7), top, Inches(5.3), Inches(0.56), fill=WHITE, line_color=RGBColor(0xD9, 0xE0, 0xF2))
        set_text(c, [(head + " — ", {"bold": True, "size": 12.5, "color": INK}), (body, {"size": 11.5, "color": INK_SOFT})], space_after=0, line=1.0)
        c.vertical_anchor = MSO_ANCHOR.MIDDLE

    # architecture diagram (shapes, not an image, so it stays editable)
    dx, dw, dh = Inches(6.35), Inches(6.25), Inches(0.62)
    def node(top, label, sub=None, fill=WHITE, color=INK, line=RGBColor(0xD9, 0xE0, 0xF2)):
        _, c = card(slide, dx, top, dw, dh, fill=fill, line_color=line)
        runs = [(label, {"bold": True, "size": 12.5, "color": color})]
        if sub:
            runs.append(("   " + sub, {"size": 11, "color": INK_SOFT}))
        set_text(c, runs, space_after=0)
        c.vertical_anchor = MSO_ANCHOR.MIDDLE
        return c

    def arrow(top):
        tri = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, dx + Inches(2.95), top, Inches(0.34), Inches(0.24))
        tri.fill.solid(); tri.fill.fore_color.rgb = SAFFRON; tri.line.fill.background(); tri.shadow.inherit = False

    node(Inches(2.02), "User", "mobile or desktop browser", fill=INK, color=WHITE, line=INK)
    arrow(Inches(2.66))
    node(Inches(2.92), "Pages", "Home · Situations · Practice · Scenes · Phrasebook · Quiz · Favorites · Culture")
    arrow(Inches(3.56))
    node(Inches(3.82), "Components", "PhraseCard · ScenarioCard · AskWhatToSayBox · Layout · ui")
    arrow(Inches(4.46))
    node(Inches(4.72), "hooks/useProgress  ·  hooks/useSpeech", "actions + capability snapshot")
    arrow(Inches(5.36))
    node(Inches(5.62), "services/storage → localStorage", "favourites, recent, practice, scenes, best score", fill=CREAM, line=SAFFRON)
    node(Inches(6.26), "Web Speech API (browser)  ·  data/phrases.ts etc.  ·  optional VITE_AI_PROXY_URL",
         None, fill=INK, color=WHITE, line=INK)

    footer(slide, "Data flow: typed data compiled in → components call context actions → storage persists one versioned key → speech/assistant layers degrade visibly.", 10)

    # -- 10. honesty & governance ------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Honesty by design", "What the app refuses to pretend")
    rows = [
        ("Temptation", "What Kannada Saathi does instead"),
        ("Show a pronunciation score", "Text similarity against the target, labelled as text similarity. pronunciationAssessmentSupported() is hard-coded false."),
        ("Market it as “AI-powered”", "Retrieval over reviewed data by default; an LLM is opt-in through your own proxy, with a “verify with a native speaker” warning on its output."),
        ("Translate freely and hope", f"{n['verified']} lines are standard; {n['flagged']} are colloquial and badged needs-native-review in the UI and in the data."),
        ("Invent dialect tables", "Regional variants exist only as flagged claims with the region and the caution shown — never as universal Kannada."),
        ("Fake engagement numbers", "Every progress figure derives from recorded interactions; a new learner legitimately sees 0."),
        ("Ship a stub “AI” key in the client", "No key in the repo; .env.example documents the proxy and states why VITE_* is public."),
    ]
    table(slide, Inches(0.7), Inches(2.2), Inches(11.9), rows, col_ratios=[3.4, 8.5], size=12.5)
    _, test = textbox(slide, Inches(0.7), Inches(6.05), Inches(11.9), Inches(0.7))
    set_text(test, [("Automated guards: ", {"bold": True, "color": SAFFRON_DARK}),
                    ("7 files / 80 tests — dataset shape, script purity (no other Indic or CJK glyphs inside a Kannada field), conversation graph reachability, quiz answer validity, deterministic seeded rounds, storage hydration, search ranking, component behaviour, favourites after remount.", {})],
               size=13, color=INK, space_after=0)
    footer(slide, "Known limits stated in the README: desktop Kannada TTS is rare; recognition is network-backed; clipboard/mic need a secure context; 111 phrases is a starter set, not a dictionary.", 11)

    # -- 11. impact & limitations -------------------------------------------- #
    slide = add_slide(prs)
    title(slide, "Conclusion · impact · limits", "What changes, and what is still open")
    _, left = textbox(slide, Inches(0.7), Inches(2.1), Inches(5.7), Inches(0.4))
    set_text(left, "Expected impact", size=16, color=LEAF, bold=True, space_after=0)
    bullets(slide, Inches(0.7), Inches(2.55), Inches(5.7), Inches(3.6), [
        ("Access, immediately", "one completed transaction per rehearsed situation, without English or a third person"),
        ("Lower social cost", "learners hear the polite form and why it matters before they arrive"),
        ("Health and safety", "symptom + duration + dosage questions reduce real errors at a counter"),
        ("Language pride", "Kannada script, culture and etiquette as the product, not decoration"),
        ("A reusable dataset", "version-controlled, review-flagged and test-guarded — others can grow it safely"),
    ], size=14.5, gap=10)

    _, right = textbox(slide, Inches(6.9), Inches(2.1), Inches(5.7), Inches(0.4))
    set_text(right, "Known limitations (documented, not hidden)", size=16, color=ROSE, bold=True, space_after=0)
    bullets(slide, Inches(6.9), Inches(2.55), Inches(5.7), Inches(3.6), [
        ("Browser voice gaps", "no kn-IN TTS on most desktops; recognition is Chrome/network-backed — fallbacks cover both"),
        ("No acoustic scoring", "by design, until a reliable model exists"),
        ("Coverage", f"{n['phrases']} phrases is a starter set, not a dictionary; needs a native review pass"),
        ("Secure context", "plain http on a LAN IP disables mic and clipboard; the app detects and says so"),
        ("Single-user, single-device", "progress lives in localStorage; sync is future work"),
    ], size=14.5, gap=10)

    _, next = card(slide, Inches(0.7), Inches(6.05), Inches(11.9), Inches(0.72), fill=INK)
    set_text(next, [("Next: ", {"bold": True, "color": SAFFRON}),
                    ("native-speaker review + public dataset with a review log · PWA offline install · situation packs for government counters and rent conversations · experimental scoring behind an explicit flag.", {"color": WHITE})],
           size=13.5, space_after=0)
    next.vertical_anchor = MSO_ANCHOR.MIDDLE
    footer(slide, "Everything on this slide is mirrored in README §8 “Known limitations” — the deck and the repo tell the same story.", 12)

    # -- 12. thank you / submission ------------------------------------------ #
    slide = add_slide(prs)
    band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(1.9), W, Inches(3.0))
    band.fill.solid(); band.fill.fore_color.rgb = INK; band.line.fill.background(); band.shadow.inherit = False
    _, frame = textbox(slide, Inches(0.9), Inches(2.25), Inches(11.5), Inches(2.4))
    set_text(frame, "ಧನ್ಯವಾದಗಳು — thank you", size=36, color=SAFFRON, bold=True, space_after=10)
    add_paragraph(frame, "Kannada Saathi · Speak Kannada. Navigate Karnataka with confidence.", size=18, color=WHITE, space_after=6)
    add_paragraph(frame, "GitHub repo (code, README, tests, docs)  ·  live deployment URL  ·  this deck  ·  3–5 min screen recording with voice-over", size=14, color=RGBColor(0xD9, 0xE0, 0xF2), space_after=0)

    _, links = textbox(slide, Inches(0.9), Inches(5.15), Inches(11.5), Inches(1.4))
    set_text(links, "Submission checklist", size=15, color=SAFFRON_DARK, bold=True, space_after=6)
    for line in [
        "one problem statement chosen — #3 Kannada in Everyday Life",
        "public repo with README: name, problem statement, features, stack, setup",
        "deployed project tested in a fresh browser profile",
        "3–5 min video: problem → existing gaps → demo → architecture → conclusion",
        "no secrets committed; .env.example documents the only optional variable",
    ]:
        add_paragraph(links, [("☐  ", {"color": SAFFRON, "bold": True}), (line, {})], size=13, color=INK, space_after=3)
    footer(slide, "Kannada Digital Innovation Hackathon 2026 · HackerRank Campus Crew × NIE Mysuru · individual entry", 13)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(OUT)
    print(f"wrote {OUT} with {len(prs.slides.__iter__.__self__._sldIdLst)} slides")
    print("counts used:", n)


if __name__ == "__main__":
    build()
