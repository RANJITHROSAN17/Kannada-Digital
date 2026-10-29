/**
 * Kannada Saathi — desktop integration layer.
 *
 * When the app runs inside the Electron desktop shell, this module talks to
 * the main process through the preload bridge (window.desktopAPI). It provides:
 *
 *   - recognize(pcm, sampleRate, lang, translate): offline Whisper recognition
 *   - speak(text, lang): offline espeak-ng Kannada speech synthesis
 *   - isDesktop(): whether the desktop shell is active
 *   - getDesktopInfo(): engine status for the UI
 *
 * On the plain web build, window.desktopAPI is undefined and every call
 * degrades gracefully — the web app keeps using browser APIs.
 */

export interface DesktopInfo {
  platform: string;
  version: string;
  whisperConfigured: boolean;
  ttsConfigured: boolean;
}

interface DesktopAPI {
  recognize: (
    pcm: number[],
    sampleRate: number,
    lang: string,
    translate: boolean,
  ) => Promise<{ text: string }>;
  speak: (text: string, lang: string) => Promise<{ audio: string }>;
  isDesktop: () => boolean;
  getInfo: () => Promise<DesktopInfo>;
}

declare global {
  interface Window {
    desktopAPI?: DesktopAPI;
  }
}

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && Boolean(window.desktopAPI);
}

export async function desktopRecognize(
  pcm: Float32Array,
  sampleRate: number,
  lang: string,
  translate: boolean,
): Promise<string> {
  if (!isDesktop()) {
    throw new Error('Desktop recognition is only available in the desktop app.');
  }
  const result = await window.desktopAPI!.recognize(
    Array.from(pcm),
    sampleRate,
    lang,
    translate,
  );
  return result.text;
}

export async function desktopSpeak(
  text: string,
  lang: string,
): Promise<string> {
  if (!isDesktop()) {
    throw new Error('Desktop synthesis is only available in the desktop app.');
  }
  const result = await window.desktopAPI!.speak(text, lang);
  return result.audio; // base64 WAV
}

export async function getDesktopInfo(): Promise<DesktopInfo> {
  if (!isDesktop()) return { platform: 'web', version: '0', whisperConfigured: false, ttsConfigured: false };
  return window.desktopAPI!.getInfo();
}
