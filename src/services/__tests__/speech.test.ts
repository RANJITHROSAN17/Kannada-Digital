import { describe, expect, it, vi } from 'vitest';
import { detectCapabilities, listenOnce, pronunciationAssessmentSupported, speak, stopSpeaking } from '../speech';

/**
 * jsdom implements neither speechSynthesis nor SpeechRecognition, which is
 * exactly the worst-case browser. The contract under test is that every call
 * degrades with a clear reason instead of throwing or pretending.
 */
describe('capability detection in an unsupported browser', () => {
  it('reports no TTS, no voices and no recognition', () => {
    const capabilities = detectCapabilities();
    expect(capabilities.ttsSupported).toBe(false);
    expect(capabilities.kannadaVoiceAvailable).toBe(false);
    expect(capabilities.kannadaVoiceName).toBeNull();
    expect(capabilities.recognitionSupported).toBe(false);
  });

  it('never claims acoustic pronunciation scoring', () => {
    expect(pronunciationAssessmentSupported()).toBe(false);
  });
});

describe('speak()', () => {
  it('refuses politely instead of throwing', () => {
    const result = speak('ನಮಸ್ಕಾರ');
    expect(result.started).toBe(false);
    expect(result.reason).toBe('no-tts');
    expect(result.usedKannadaVoice).toBe(false);
  });

  it('flags empty text separately from an unsupported engine', () => {
    expect(speak('   ').reason).toBe('empty-text');
  });

  it('stopSpeaking is safe to call at any time', () => {
    expect(() => stopSpeaking()).not.toThrow();
  });
});

describe('listenOnce()', () => {
  it('calls back with an unsupported error and a typed-fallback message', () => {
    const onError = vi.fn();
    const handle = listenOnce({ onFinal: vi.fn(), onError });
    expect(onError).toHaveBeenCalledTimes(1);
    const [code, message] = onError.mock.calls[0] as [string, string];
    expect(code).toBe('unsupported');
    expect(message.toLowerCase()).toContain('type');
    expect(() => handle.stop()).not.toThrow();
  });

  it('does not throw when no error handler is supplied', () => {
    expect(() => listenOnce({ onFinal: vi.fn() })).not.toThrow();
  });
});
