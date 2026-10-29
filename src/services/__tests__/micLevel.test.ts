import { afterEach, describe, expect, it, vi } from 'vitest';
import { startMicLevel } from '../micLevel';

describe('startMicLevel()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as unknown as { mediaDevices?: unknown }).mediaDevices;
  });

  it('reports a clear error when the browser has no microphone API', () => {
    const onError = vi.fn();
    startMicLevel({ onLevel: vi.fn(), onError });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toContain('no microphone access API');
  });

  it('reports a clear error when the browser has no audio engine', () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
      configurable: true,
    });
    const onError = vi.fn();
    startMicLevel({ onLevel: vi.fn(), onError });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toContain('no audio engine');
  });

  it('reports a permission error when the browser refuses the microphone', async () => {
    class FakeAudioContext {
      createMediaStreamSource() {
        return { connect: () => undefined };
      }
      createAnalyser() {
        return { fftSize: 0, connect: () => undefined, getByteTimeDomainData: () => undefined };
      }
      close() {
        return Promise.resolve();
      }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(
          Object.assign(new Error('denied'), { name: 'NotAllowedError' }),
        ),
      },
      configurable: true,
    });

    const onError = vi.fn();
    startMicLevel({ onLevel: vi.fn(), onError });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toContain('Microphone permission was blocked');
  });
});
