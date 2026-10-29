/**
 * Kannada Saathi — Electron preload bridge.
 *
 * Exposes a minimal, safe API to the renderer. The renderer never touches
 * Node directly — it calls window.desktopAPI.recognize / .speak and gets
 * results back.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  /**
   * Recognise a captured utterance. `pcm` is an array of Float32 samples;
   * `translate` mode returns English for Kannada input.
   */
  recognize: (pcm, sampleRate, lang, translate) =>
    ipcRenderer.invoke('recognize:once', { pcm, sampleRate, lang, translate }),

  /**
   * Speak text in a language code ('kn', 'en'). Returns a base64 WAV.
   */
  speak: (text, lang) =>
    ipcRenderer.invoke('tts:speak', { text, lang }),

  isDesktop: () => true,

  getInfo: () => ipcRenderer.invoke('desktop:info'),
});
