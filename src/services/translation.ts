/**
 * Live translation for sentences that are NOT in the bundled phrasebook.
 *
 * Kannada Saathi is offline-first: the phrasebook, situations, role-play and
 * quizzes ship as data and work with no network. But real life asks sentences
 * nobody reviewed — "What is the project status?" — and a fixed transliteration
 * list cannot answer them. This service answers anything, with no API key:
 *
 *   1. Google's public translate endpoint (best Kannada quality),
 *   2. MyMemory as an automatic fallback (CORS-open, no key),
 *   3. otherwise a `TranslationError` — the UI then says so honestly instead of
 *      showing a fake translation.
 *
 * Ported from the LiveBridge project's translation chain and trimmed to what
 * this app needs: no rate-limit state, no audit logging, strict TypeScript.
 */

import { hasKannadaScript } from '../utils/text';

export type TranslationEngine = 'google' | 'mymemory' | 'identity';

export interface TranslationResult {
  /** The translated text. */
  text: string;
  /** Which engine produced it, so the UI can be honest about the source. */
  engine: TranslationEngine;
}

export interface TranslateOptions {
  /** Abort the request early (e.g. the user navigated away). */
  signal?: AbortSignal;
  /** Per-request timeout in milliseconds (default 12s). */
  timeoutMs?: number;
}

export type TranslationErrorCode =
  | 'INVALID_INPUT'
  | 'INPUT_TOO_LONG'
  | 'PRIMARY_HTTP_ERROR'
  | 'PRIMARY_INVALID_JSON'
  | 'PRIMARY_INVALID_RESPONSE'
  | 'PRIMARY_EMPTY_RESPONSE'
  | 'FALLBACK_HTTP_ERROR'
  | 'FALLBACK_INVALID_JSON'
  | 'FALLBACK_INVALID_RESPONSE'
  | 'FALLBACK_QUOTA_EXCEEDED'
  | 'FALLBACK_EMPTY_RESPONSE'
  | 'NETWORK_ERROR'
  | 'REQUEST_TIMEOUT'
  | 'ALL_PROVIDERS_FAILED';

export class TranslationError extends Error {
  readonly code: TranslationErrorCode;

  constructor(message: string, code: TranslationErrorCode, cause?: unknown) {
    super(message, { cause });
    this.name = 'TranslationError';
    this.code = code;
  }
}

const GOOGLE_TRANSLATE_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';
const MAX_INPUT_CHARACTERS = 5000;
const REQUEST_TIMEOUT_MS = 12000;
/** MyMemory caps an individual query at 500 UTF-8 bytes. */
const MYMEMORY_MAX_BYTES = 500;

/**
 * Which direction to translate. Kannada script in the input means the speaker
 * said Kannada; anything else is treated as English.
 */
export function detectSourceLanguage(text: string): 'kn' | 'en' {
  return hasKannadaScript(text) ? 'kn' : 'en';
}

/* -------------------------------------------------------------------------- */
/* Request plumbing                                                           */
/* -------------------------------------------------------------------------- */

interface TimeoutHandle {
  signal: AbortSignal;
  clear: () => void;
}

function createTimeout(timeoutMs: number, external?: AbortSignal): TimeoutHandle {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  // The same handler reference must be used for add and remove — passing a
  // fresh arrow function to removeEventListener would never match and leak
  // the listener on every translation.
  const onExternalAbort = () => controller.abort();
  if (external?.aborted) {
    // The caller aborted before this request started (e.g. the bridge
    // cleared the conversation while the first provider was still
    // answering): fail fast instead of waiting for the timer.
    controller.abort();
  } else {
    external?.addEventListener?.('abort', onExternalAbort, { once: true });
  }
  return {
    signal: controller.signal,
    clear: () => {
      window.clearTimeout(timer);
      external?.removeEventListener?.('abort', onExternalAbort);
    },
  };
}

async function fetchJson(
  url: string,
  timeoutMs: number,
  externalSignal?: AbortSignal,
): Promise<unknown> {
  const { signal, clear } = createTimeout(timeoutMs, externalSignal);
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new TranslationError(
        `The translation service responded with HTTP ${response.status}.`,
        'NETWORK_ERROR',
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TranslationError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TranslationError('The translation request timed out.', 'REQUEST_TIMEOUT', error);
    }
    throw new TranslationError(
      'Translation is offline: no network connection was available.',
      'NETWORK_ERROR',
      error,
    );
  } finally {
    clear();
  }
}

/* -------------------------------------------------------------------------- */
/* Provider 1 — Google public endpoint                                        */
/* -------------------------------------------------------------------------- */

async function translateWithGoogle(
  text: string,
  source: string,
  target: string,
  options: TranslateOptions,
): Promise<string> {
  const query = new URLSearchParams({
    client: 'gtx',
    sl: source === 'auto' ? 'auto' : source,
    tl: target,
    dt: 't',
    q: text,
  });

  const data = await fetchJson(`${GOOGLE_TRANSLATE_ENDPOINT}?${query}`, options.timeoutMs ?? REQUEST_TIMEOUT_MS, options.signal);

  if (!Array.isArray(data) || !Array.isArray((data as unknown[])[0])) {
    // Google answers blocked requests with an HTML "Sorry" page; JSON parsing
    // either fails or this shape check catches it.
    throw new TranslationError(
      'The primary translation provider returned an unexpected response.',
      'PRIMARY_INVALID_RESPONSE',
    );
  }

  const translated = (data as unknown[][])[0]
    .filter((item): item is [string] => Array.isArray(item) && typeof item[0] === 'string')
    .map((item) => item[0])
    .join('')
    .trim();

  if (!translated) {
    throw new TranslationError(
      'The primary translation provider returned empty text.',
      'PRIMARY_EMPTY_RESPONSE',
    );
  }

  return translated;
}

/* -------------------------------------------------------------------------- */
/* Provider 2 — MyMemory fallback                                             */
/* -------------------------------------------------------------------------- */

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Split long text into chunks that fit MyMemory's 500-byte request limit.
 * Word boundaries are preferred; a single over-long word is split by
 * character.
 */
function splitIntoUtf8Chunks(text: string, maximumBytes = MYMEMORY_MAX_BYTES): string[] {
  if (utf8ByteLength(text) <= maximumBytes) return [text];

  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if (utf8ByteLength(word) > maximumBytes) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      let characterChunk = '';
      for (const character of word) {
        const candidate = characterChunk + character;
        if (utf8ByteLength(candidate) > maximumBytes) {
          if (characterChunk) chunks.push(characterChunk);
          characterChunk = character;
        } else {
          characterChunk = candidate;
        }
      }
      if (characterChunk) current = characterChunk;
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (utf8ByteLength(candidate) > maximumBytes) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateMyMemoryChunk(
  text: string,
  source: string,
  target: string,
  options: TranslateOptions,
): Promise<string> {
  const query = new URLSearchParams({ q: text, langpair: `${source}|${target}` });

  const data = await fetchJson(`${MYMEMORY_ENDPOINT}?${query}`, options.timeoutMs ?? REQUEST_TIMEOUT_MS, options.signal);

  if (typeof data !== 'object' || data === null) {
    throw new TranslationError(
      'The fallback provider returned an unexpected response.',
      'FALLBACK_INVALID_RESPONSE',
    );
  }

  const record = data as Record<string, unknown>;
  if (record.quotaFinished === true) {
    throw new TranslationError(
      'The fallback translation quota has been reached.',
      'FALLBACK_QUOTA_EXCEEDED',
    );
  }

  const translated = record.responseData as Record<string, unknown> | undefined;
  const translatedText = typeof translated?.translatedText === 'string' ? translated.translatedText : '';

  if (Number(record.responseStatus) !== 200 || !translatedText.trim()) {
    throw new TranslationError(
      typeof record.responseDetails === 'string' && record.responseDetails
        ? record.responseDetails
        : 'The fallback provider returned an invalid response.',
      'FALLBACK_INVALID_RESPONSE',
    );
  }

  // MyMemory returns its own warning banner in the text field when the daily
  // character limit is hit; that must not be shown as a translation.
  if (/MYMEMORY WARNING|INVALID|DAILY|EXCEEDED/i.test(translatedText)) {
    throw new TranslationError(
      'The fallback provider rejected the request.',
      'FALLBACK_INVALID_RESPONSE',
    );
  }

  return translatedText.trim();
}

async function translateWithMyMemory(
  text: string,
  source: string,
  target: string,
  options: TranslateOptions,
): Promise<string> {
  const chunks = splitIntoUtf8Chunks(text);
  const translated: string[] = [];

  // Sequentially, so a burst of sentences never trips the provider's limits.
  for (const chunk of chunks) {
    translated.push(await translateMyMemoryChunk(chunk, source, target, options));
  }

  return translated.join(' ').trim();
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

function cleanInput(text: string): string {
  return text
    .replace(/[ -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Translate `text` from `sourceLang` to `targetLang`.
 *
 * Throws `TranslationError` when both providers fail — the caller decides how
 * to degrade (offline note, phrasebook suggestion, typed input kept usable).
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  options: TranslateOptions = {},
): Promise<TranslationResult> {
  const clean = cleanInput(text);

  if (!clean) {
    throw new TranslationError('Nothing to translate — the input was empty.', 'INVALID_INPUT');
  }
  if (clean.length > MAX_INPUT_CHARACTERS) {
    throw new TranslationError(
      `Translation input cannot exceed ${MAX_INPUT_CHARACTERS} characters.`,
      'INPUT_TOO_LONG',
    );
  }

  const source = sourceLang.trim().toLowerCase();
  const target = targetLang.trim().toLowerCase();

  // Google Translate supports sl=auto for automatic source language detection.
  const resolvedSource = source === 'auto' ? 'auto' : source;

  if (resolvedSource === target) {
    return { text: clean, engine: 'identity' };
  }

  try {
    const googleText = await translateWithGoogle(clean, source, target, options);
    return { text: googleText, engine: 'google' };
  } catch (primaryError) {
    try {
      const fallbackText = await translateWithMyMemory(clean, source, target, options);
      return { text: fallbackText, engine: 'mymemory' };
    } catch (fallbackError) {
      throw new TranslationError(
        'Translation is currently unavailable — check your network and try again.',
        'ALL_PROVIDERS_FAILED',
        fallbackError,
      );
    }
  }
}

/**
 * Auto-detect the source language (Kannada script vs English) and translate
 * to Kannada. Used by the "What do I say?" live translation and the bridge
 * page's "you speak" side.
 */
export async function translateToKannada(
  text: string,
  options: TranslateOptions = {},
): Promise<TranslationResult> {
  const clean = cleanInput(text);
  if (!clean) {
    throw new TranslationError('Nothing to translate — the input was empty.', 'INVALID_INPUT');
  }
  const source = detectSourceLanguage(clean);
  if (source === 'kn') {
    return { text: clean, engine: 'identity' };
  }
  return translateText(clean, source, 'kn', options);
}

/**
 * Auto-detect the source language and translate to English. Used by the
 * bridge page's "they reply" side: the recognised Kannada speech becomes
 * readable (and speakable) English for the learner.
 */
export async function translateToEnglish(
  text: string,
  options: TranslateOptions = {},
): Promise<TranslationResult> {
  const clean = cleanInput(text);
  if (!clean) {
    throw new TranslationError('Nothing to translate — the input was empty.', 'INVALID_INPUT');
  }
  const source = detectSourceLanguage(clean);
  if (source === 'en') {
    return { text: clean, engine: 'identity' };
  }
  return translateText(clean, source, 'en', options);
}
