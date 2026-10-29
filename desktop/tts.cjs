/**
 * Kannada Saathi — desktop TTS runner.
 *
 * Uses espeak-ng to speak text in the requested language. The WAV output is
 * returned as base64 so the renderer can play it with a plain <audio> element
 * — no extra native audio dependencies.
 */
const { spawn } = require('child_process');
const { promises: fs } = require('fs');
const os = require('os');
const path = require('path');

let espeakPath = null;
let dataPath = null;

function configure(binaryPath, dataDir) {
  espeakPath = binaryPath;
  dataPath = dataDir;
}

/**
 * Speak `text` in `lang` (e.g. 'kn', 'en') and return a WAV as base64.
 * espeak-ng writes a 22 kHz mono 16-bit WAV; that is fine for playback.
 */
function speak(text, lang = 'en') {
  return new Promise((resolve, reject) => {
    if (!espeakPath) {
      reject(new Error('The speech synthesis engine is not configured.'));
      return;
    }
    const wavPath = path.join(
      os.tmpdir(),
      `kannadasaathi-tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`,
    );

    const args = ['-v', lang, '-w', wavPath, text];
    const env = { ...process.env };
    if (dataPath) env.ESPEAK_DATA_PATH = dataPath;

    const child = spawn(espeakPath, args, { windowsHide: true, env });
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Speech synthesis timed out.'));
    }, 10000);

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Could not start the speech engine: ${err.message}`));
    });
    child.on('close', async (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const detail = stderr.split('\n').filter(Boolean).pop() || `exit code ${code}`;
        reject(new Error(`The speech engine failed: ${detail}`));
        return;
      }
      try {
        const buf = await fs.readFile(wavPath);
        await fs.unlink(wavPath).catch(() => {});
        resolve(buf.toString('base64'));
      } catch (err) {
        reject(new Error(`Could not read the generated speech audio: ${err.message}`));
      }
    });
  });
}

module.exports = { configure, speak };
