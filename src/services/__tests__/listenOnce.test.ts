/**
 * Regression tests for the LiveBridge-style recognition flow in
 * `listenOnce`: continuous recognition, accumulation of every interim/final
 * result (older builds dropped earlier words when only the last result was
 * read), auto-finalize after a pause, and one silent restart when the
 * browser ends a session on its own.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listenOnce } from '../speech';

class FakeRecognition {
  static instances: FakeRecognition[] = [];

  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onstart: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
    this.onstart?.();
  }

  stop() {
    this.started = false;
    this.onend?.();
  }

  abort() {
    this.started = false;
  }

  /** Simulate a Chrome `onresult` event. */
  emitResult(
    results: Array<{ transcript: string; isFinal: boolean }>,
    resultIndex = 0,
  ) {
    this.onresult?.({
      resultIndex,
      results: results.map((result) => ({
        isFinal: result.isFinal,
        0: { transcript: result.transcript, confidence: 1 },
      })),
    });
  }

  emitEnd() {
    this.onend?.();
  }

  emitError(error: string) {
    this.onerror?.({ error });
  }
}

beforeEach(() => {
  FakeRecognition.instances = [];
  (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition =
    FakeRecognition;
  vi.useFakeTimers();
});

afterEach(() => {
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  vi.useRealTimers();
});

describe('listenOnce() continuous accumulation', () => {
  it('shows every interim word in the live caption, then finalizes after a pause', () => {
    const onInterim = vi.fn();
    const onFinal = vi.fn();
    const handle = listenOnce({ lang: 'en-US', onInterim, onFinal });
    const recognition = FakeRecognition.instances[0];

    // First phrase, still interim.
    recognition.emitResult([{ transcript: 'What is the project', isFinal: false }]);
    expect(onInterim).toHaveBeenLastCalledWith('What is the project');

    // The same phrase plus newer words, still interim.
    recognition.emitResult(
      [
        { transcript: 'What is the project', isFinal: false },
        { transcript: ' status?', isFinal: false },
      ],
      0,
    );
    expect(onInterim).toHaveBeenLastCalledWith('What is the project status?');

    // The sentence becomes final — no finalize yet, more speech could come.
    recognition.emitResult([{ transcript: 'What is the project status?', isFinal: true }]);
    expect(onFinal).not.toHaveBeenCalled();

    // Pause → auto-finalize.
    vi.advanceTimersByTime(900);
    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]?.[0]).toBe('What is the project status?');
    // The caption is cleared once the turn is delivered.
    expect(onInterim).toHaveBeenLastCalledWith('');
    expect(handle.stop).toBeTypeOf('function');
  });

  it('accumulates multiple final chunks into one sentence (the old last-result bug)', () => {
    const onFinal = vi.fn();
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal });
    const recognition = FakeRecognition.instances[0];

    recognition.emitResult([{ transcript: 'I want to', isFinal: true }]);
    recognition.emitResult(
      [
        { transcript: 'I want to', isFinal: true },
        { transcript: ' go to the market', isFinal: true },
      ],
      1,
    );
    vi.advanceTimersByTime(900);

    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]?.[0]).toBe('I want to go to the market');
  });

  it('delivers the sentence immediately when the user stops listening', () => {
    const onFinal = vi.fn();
    const handle = listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal });
    const recognition = FakeRecognition.instances[0];

    recognition.emitResult([{ transcript: 'Thank you very much', isFinal: true }]);
    handle.stop();

    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]?.[0]).toBe('Thank you very much');
    expect(recognition.started).toBe(false);
  });

  it('restarts silently once when the browser ends the session on its own', () => {
    const onFinal = vi.fn();
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal });
    const first = FakeRecognition.instances[0];

    first.emitEnd(); // unexpected end, nothing heard yet
    expect(FakeRecognition.instances).toHaveLength(2);

    const second = FakeRecognition.instances[1];
    second.emitResult([{ transcript: 'Hello there', isFinal: true }]);
    vi.advanceTimersByTime(900);
    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]?.[0]).toBe('Hello there');
  });

  it('does not restart after a permission error, and surfaces the friendly message', () => {
    const onError = vi.fn();
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal: vi.fn(), onError });
    const recognition = FakeRecognition.instances[0];

    recognition.emitError('not-allowed');
    recognition.emitEnd();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBe('not-allowed');
    expect(FakeRecognition.instances).toHaveLength(1);
  });

  it('retries once on a transient network error', () => {
    const onError = vi.fn();
    const onFinal = vi.fn();
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal, onError });
    const first = FakeRecognition.instances[0];

    first.emitError('network');
    first.emitEnd();
    expect(FakeRecognition.instances).toHaveLength(2);

    const second = FakeRecognition.instances[1];
    second.emitResult([{ transcript: 'Hello', isFinal: true }]);
    vi.advanceTimersByTime(900);
    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]?.[0]).toBe('Hello');
  });

  it('retries once when nothing was heard (no-speech)', () => {
    const onError = vi.fn();
    const onFinal = vi.fn();
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal, onError });
    const first = FakeRecognition.instances[0];

    first.emitError('no-speech');
    first.emitEnd();
    expect(FakeRecognition.instances).toHaveLength(2);

    // The retry hears the user.
    const second = FakeRecognition.instances[1];
    second.emitResult([{ transcript: 'Hi', isFinal: true }]);
    vi.advanceTimersByTime(900);
    expect(onFinal.mock.calls[0]?.[0]).toBe('Hi');
  });

  it('does not restart twice after repeated transient errors', () => {
    listenOnce({ lang: 'en-US', onInterim: vi.fn(), onFinal: vi.fn(), onError: vi.fn() });
    const first = FakeRecognition.instances[0];
    first.emitError('network');
    first.emitEnd();
    expect(FakeRecognition.instances).toHaveLength(2);

    const second = FakeRecognition.instances[1];
    second.emitError('network');
    second.emitEnd();
    expect(FakeRecognition.instances).toHaveLength(2); // no third session
  });

  it('speaks with continuous mode, like LiveBridge', () => {
    listenOnce({ lang: 'kn-IN', onInterim: vi.fn(), onFinal: vi.fn() });
    const recognition = FakeRecognition.instances[0];
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.lang).toBe('kn-IN');
  });
});
