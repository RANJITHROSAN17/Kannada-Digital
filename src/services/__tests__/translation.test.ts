import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectSourceLanguage,
  translateToEnglish,
  translateToKannada,
  translateText,
  TranslationError,
} from '../translation';

/**
 * The translation service hits two public endpoints with no API key. These
 * tests mock `fetch` so the provider chain (Google → MyMemory) is covered
 * deterministically: success, fallback, quota, chunking and offline errors.
 */

interface FakeResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function fakeJson(payload: unknown, ok = true, status = 200): FakeResponse {
  return { ok, status, json: async () => payload };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectSourceLanguage', () => {
  it('detects Kannada script', () => {
    expect(detectSourceLanguage('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?')).toBe('kn');
  });

  it('treats anything else as English', () => {
    expect(detectSourceLanguage('Where is the bus stand?')).toBe('en');
  });
});

describe('translateText — Google provider', () => {
  it('returns the Google translation and marks the engine', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeJson([
          [['ಯೋಜನೆಯ ಸ್ಥಿತಿ ಏನು?']],
          null,
          'en',
          'kn',
        ]),
      ),
    );

    const result = await translateText('What is the project status?', 'en', 'kn');
    expect(result.text).toBe('ಯೋಜನೆಯ ಸ್ಥಿತಿ ಏನು?');
    expect(result.engine).toBe('google');
  });

  it('returns identity when source and target match', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const result = await translateText('Hello', 'en', 'en');
    expect(result).toEqual({ text: 'Hello', engine: 'identity' });
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('refuses empty input', async () => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(translateText('   ', 'en', 'kn')).rejects.toBeInstanceOf(TranslationError);
  });
});

describe('translateText — MyMemory fallback', () => {
  it('falls back when Google answers with an HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(fakeJson(null, false, 503))
        .mockResolvedValueOnce(
          fakeJson({
            responseStatus: 200,
            responseData: { translatedText: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?' },
          }),
        ),
    );

    const result = await translateText('Where is the bus stand?', 'en', 'kn');
    expect(result.engine).toBe('mymemory');
    expect(result.text).toBe('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?');
  });

  it('throws ALL_PROVIDERS_FAILED when both providers fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeJson(null, false, 500)));

    await expect(translateText('Hello there', 'en', 'kn')).rejects.toMatchObject({
      code: 'ALL_PROVIDERS_FAILED',
    });
  });

  it('splits long input into 500-byte chunks for MyMemory', async () => {
    const longText = 'word '.repeat(200).trim(); // ~1000 bytes → 2+ chunks
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(fakeJson(null, false, 500))
        .mockResolvedValue(fakeJson({ responseStatus: 200, responseData: { translatedText: 'ok' } })),
    );

    const result = await translateText(longText, 'en', 'kn');
    expect(result.engine).toBe('mymemory');
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('surfaces a MyMemory quota message instead of showing it as a translation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeJson({
          responseStatus: 200,
          quotaFinished: true,
          responseData: { translatedText: 'MYMEMORY WARNING: DAILY LIMIT' },
        }),
      ),
    );

    await expect(translateText('Hello', 'en', 'kn')).rejects.toMatchObject({
      code: 'ALL_PROVIDERS_FAILED',
    });
  });
});

describe('translateToKannada / translateToEnglish', () => {
  it('auto-detects the source and refuses to translate Kannada to Kannada', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const result = await translateToKannada('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?');
    expect(result.engine).toBe('identity');
  });

  it('translates Kannada speech recognition output back to English', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeJson([
          [['Where is the bus stand?']],
          null,
          'kn',
          'en',
        ]),
      ),
    );

    const result = await translateToEnglish('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?');
    expect(result.text).toBe('Where is the bus stand?');
    expect(result.engine).toBe('google');
  });
});
