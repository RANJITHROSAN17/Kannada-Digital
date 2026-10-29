/**
 * Live microphone level meter.
 *
 * `getUserMedia` + an `AnalyserNode` give us the raw input level — the one
 * signal that tells a real microphone problem apart from a Chrome speech
 * service problem. Used by the bridge's "Test microphone" diagnostic.
 */
export interface MicLevelHandle {
  stop: () => void;
}

export interface MicLevelCallbacks {
  /** 0..1 input level, updated per animation frame. */
  onLevel: (level: number) => void;
  /** Friendly message when capture cannot start. */
  onError: (message: string) => void;
}

/** RMS of the time-domain waveform, scaled to a 0..1 meter level. */
function computeLevel(analyser: AnalyserNode): number {
  const size = analyser.fftSize;
  const data = new Uint8Array(size);
  analyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let index = 0; index < size; index += 1) {
    const value = (data[index] - 128) / 128;
    sum += value * value;
  }
  const rms = Math.sqrt(sum / size);
  // Speech typically sits around 0.03–0.3 RMS; scale so a normal voice
  // fills most of the meter.
  return Math.min(1, rms * 3.5);
}

export function startMicLevel(callbacks: MicLevelCallbacks): MicLevelHandle {
  const { onLevel, onError } = callbacks;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    onError('This browser has no microphone access API.');
    return { stop: () => undefined };
  }
  if (typeof AudioContext === 'undefined' && typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext === 'undefined') {
    onError('This browser has no audio engine to measure the microphone.');
    return { stop: () => undefined };
  }

  const AudioContextCtor =
    typeof AudioContext !== 'undefined'
      ? AudioContext
      : (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  let stopped = false;
  let frame: number | null = null;
  let cleanup: (() => void) | null = null;

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      if (stopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const context = new AudioContextCtor();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const tick = () => {
        if (stopped) return;
        onLevel(computeLevel(analyser));
        frame = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        stream.getTracks().forEach((track) => track.stop());
        try {
          context.close();
        } catch {
          /* context already closed */
        }
      };
    })
    .catch((error: unknown) => {
      if (stopped) return;
      const name = error instanceof Error ? error.name : String(error);
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        onError('Microphone permission was blocked for this site. Allow it in the address bar → site settings.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        onError('No microphone was found on this device.');
      } else {
        onError(`Could not open the microphone (${name}).`);
      }
    });

  return {
    stop: () => {
      stopped = true;
      cleanup?.();
      cleanup = null;
    },
  };
}
