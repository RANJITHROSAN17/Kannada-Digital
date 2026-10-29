# Kannada Saathi — Desktop App

A Windows desktop application (Electron + Whisper + espeak-ng) that works
**offline** for voice: no Google servers, no API key, no network required for
speech recognition or Kannada TTS.

## What's bundled

| Component | Purpose | Size |
|---|---|---|
| `whisper-cli` (Windows .exe) | Offline speech recognition | ~10 MB |
| `ggml-small.bin` | Whisper model (English + Kannada) | ~487 MB |
| `espeak-ng` (Windows .exe) | Offline Kannada text-to-speech | ~5 MB |
| `espeak-ng-data/` | espeak-ng voice data | ~10 MB |

## Voice flow (offline)

```
You speak English → Whisper transcribes → translate to Kannada (online)
                     → espeak-ng speaks Kannada

They speak Kannada → Whisper --translate → English text shown
```

The Kannada side uses Whisper's `--translate` mode, which reliably produces
clean English (the model confuses Indic scripts in transcribe mode — a known
Whisper limitation for Indic languages).

## Build locally

```bash
# 1. Build whisper.cpp for Windows
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp && cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
# Copy build\bin\whisper-cli.exe to desktop\bin\

# 2. Download the model
curl -L -o desktop/bin/ggml-small.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# 3. Build espeak-ng for Windows
git clone https://github.com/espeak-ng/espeak-ng.git
cd espeak-ng && cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
# Copy build\src\espeak-ng.exe to desktop\bin\
# Copy build\espeak-ng-data to desktop\bin\

# 4. Build the app
cd desktop
npm install
npm run dist
```

The `.exe` appears in `release/`.

## Run in dev mode

```bash
# Need the binaries in desktop/bin/ first (see above)
cd desktop
npm run dev
```

This starts the Vite dev server and opens the app in Electron.

## Architecture

```
desktop/
├── main.cjs          Electron main process (window, IPC, permissions)
├── preload.cjs       Context bridge (safe IPC API for renderer)
├── whisper.cjs       Whisper runner (spawn whisper-cli, parse output)
├── tts.cjs           TTS runner (spawn espeak-ng, return WAV)
└── package.json      electron-builder config
```

The renderer (React app) calls `window.desktopAPI.recognize()` and
`window.desktopAPI.speak()` — these are bridged to the main process, which
spawns the native binaries. The web build (no Electron) uses browser APIs
instead; `src/services/speech.ts` detects which mode it's in.

## CI

`.github/workflows/desktop.yml` builds everything on `windows-latest` and
publishes the `.exe` to GitHub Releases when a `v*` tag is pushed.
