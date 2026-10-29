/**
 * Kannada Saathi — Electron main process.
 *
 * Wraps the built React app in a desktop window and provides two native
 * capabilities the browser cannot offer reliably:
 *
 *   1. Offline speech recognition via whisper.cpp (no Google servers,
 *      no network, no API key). English is transcribed directly; Kannada
 *      is translated to English via whisper's --translate mode, which
 *      sidesteps the model's known Indic-script confusion.
 *   2. Kannada speech synthesis via espeak-ng (works without any
 *      system-installed TTS voices).
 *
 * The renderer talks to this process through the preload bridge.
 */
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

const whisper = require('./whisper.cjs');
const tts = require('./tts.cjs');

// Resolve bundled binary paths. In dev these live under desktop/bin/; in a
// packaged app they are in resources/ (electron-builder extraResources).
function resolveResource(name) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, name);
  }
  return path.join(__dirname, 'bin', name);
}

function configureEngines() {
  const whisperBin = resolveResource('whisper-cli');
  const modelFile = resolveResource(path.join('models', 'ggml-small.bin'));
  const espeakBin = resolveResource('espeak-ng');
  const espeakData = resolveResource('espeak-ng-data');

  // Guard against missing files so the app degrades to typed input instead
  // of crashing at startup.
  if (!fs.existsSync(whisperBin) || !fs.existsSync(modelFile)) {
    console.warn('[desktop] whisper binary or model not found — recognition unavailable');
  } else {
    whisper.configure(whisperBin, modelFile);
  }

  if (!fs.existsSync(espeakBin)) {
    console.warn('[desktop] espeak-ng binary not found — Kannada TTS unavailable');
  } else {
    tts.configure(espeakBin, fs.existsSync(espeakData) ? espeakData : null);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Kannada Saathi',
    backgroundColor: '#FDF7EA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

// Allow microphone access without a browser permission prompt — the user
// asked for the desktop app precisely to avoid browser quirks.
function allowMic() {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'media' || permission === 'audioCapture');
  });
}

app.whenReady().then(() => {
  configureEngines();
  allowMic();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/* -------------------------------------------------------------------------- */
/* IPC handlers                                                                */
/* -------------------------------------------------------------------------- */

ipcMain.handle('recognize:once', async (_event, payload) => {
  const { pcm, sampleRate, lang, translate } = payload;
  if (!Array.isArray(pcm) || pcm.length === 0) {
    throw new Error('No audio was captured.');
  }
  const samples = Float32Array.from(pcm);
  const text = await whisper.recognize(samples, sampleRate, lang, Boolean(translate));
  return { text };
});

ipcMain.handle('tts:speak', async (_event, payload) => {
  const { text, lang } = payload;
  if (!text || !text.trim()) {
    throw new Error('Nothing to speak.');
  }
  const audio = await tts.speak(text, lang || 'en');
  return { audio };
});

ipcMain.handle('desktop:info', () => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    whisperConfigured: fs.existsSync(resolveResource('whisper-cli')),
    ttsConfigured: fs.existsSync(resolveResource('espeak-ng')),
  };
});
