import { describe, expect, it, vi } from 'vitest';
import { detectCapabilities, listenOnce, pronunciationAssessmentSupported, speak, stopSpeaking } from '../speech';
import { hasPronunciationAudio } from '../pronunciationAudio';
import { phrases } from '../../data/phrases';
import { curatedQuestions } from '../../data/quiz';

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
  it('refuses politely instead of throwing when neither recordings nor TTS can play', () => {
    // Simulate a browser where HTMLAudioElement exists but refuses to play.
    // speechSynthesis is absent in jsdom, so the final reason must be no-tts.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => {
      throw new Error('Not implemented: HTMLMediaElement.prototype.play');
    });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
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

describe('bundled Kannada recordings', () => {
  it('has a recording for every phrase in the dataset', () => {
    expect(phrases.length).toBeGreaterThan(100);
    for (const phrase of phrases) {
      expect(hasPronunciationAudio(phrase.kannada)).toBe(true);
    }
  });

  it('has a recording for every curated listening-question answer', () => {
    const listening = curatedQuestions.filter((q) => q.type === 'listen');
    expect(listening.length).toBeGreaterThan(0);
    for (const question of listening) {
      expect(hasPronunciationAudio(question.options[question.answerIndex])).toBe(true);
    }
  });

  it('prefers the recorded Kannada MP3 over browser speech synthesis', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    const result = speak('ನಮಸ್ಕಾರ');

    expect(result.started).toBe(true);
    expect(result.source).toBe('recording');
    expect(result.usedKannadaVoice).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
    expect(() => stopSpeaking()).not.toThrow();
    expect(pause).toHaveBeenCalled();
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
