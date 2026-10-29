/**
 * Kannada Saathi — desktop recognition runner.
 *
 * Spawns whisper-cli with a temporary WAV file, transcribes (or translates)
 * the audio, and returns the text. One recognition at a time; extra requests
 * are queued so the UI never sees overlapping whisper processes.
 */
const { spawn } = require('child_process');
const { promises: fs } = require('fs');
const os = require('os');
const path = require('path');

let whisperPath = null;
let modelPath = null;

/**
 * Point the runner at the bundled binaries. In the packaged app these live
 * under resources/; in dev they are in the desktop/ tree.
 */
function configure(binaryPath, modelFilePath) {
  whisperPath = binaryPath;
  modelPath = modelFilePath;
}

/**
 * Write a 16 kHz mono 16-bit PCM WAV file. Renderer AudioContext data is
 * Float32 in [-1, 1]; whisper-cli expects exactly this format.
 */
function writeWav(filePath, samples) {
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Downsample Float32 audio from sourceRate to 16 kHz. Linear interpolation
 * is sufficient for speech recognition.
 */
function downsample(input, sourceRate) {
  if (sourceRate === 16000) return input;
  const ratio = sourceRate / 16000;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIdx = i * ratio;
    const i0 = Math.floor(srcIdx);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = srcIdx - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

const queue = [];
let running = false;

async function runNext() {
  if (running) return;
  running = true;
  while (queue.length > 0) {
    const job = queue.shift();
    try {
      const result = await transcribe(job.pcm, job.lang, job.translate);
      job.resolve(result);
    } catch (error) {
      job.reject(error);
    }
  }
  running = false;
}

function transcribe(pcmSamples, lang, translate) {
  return new Promise((resolve, reject) => {
    const wavPath = path.join(
      os.tmpdir(),
      `kannadasaathi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`,
    );
    writeWav(wavPath, pcmSamples);

    const args = [
      '-m', modelPath,
      '-l', lang,
      '-f', wavPath,
      '--no-timestamps',
      '--no-fallback',
      '-t', '2',
      '-bs', '1',
    ];
    if (translate) args.push('--translate');

    const child = spawn(whisperPath, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill();
      reject(new Error('Recognition timed out after 30 seconds.'));
    }, 30000);

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      fs.unlink(wavPath).catch(() => {});
      reject(new Error(`Could not start the speech engine: ${err.message}`));
    });
    child.on('close', async (code) => {
      clearTimeout(timer);
      await fs.unlink(wavPath).catch(() => {});
      if (killed) return;
      if (code !== 0) {
        const detail = stderr.split('\n').filter(Boolean).pop() || `exit code ${code}`;
        if (process.env.KANNADA_DESKTOP_DEBUG) {
          console.error('[whisper debug] args:', JSON.stringify(args));
          console.error('[whisper debug] code:', code);
          console.error('[whisper debug] stderr:', stderr.slice(0, 500));
          console.error('[whisper debug] stdout:', stdout.slice(0, 200));
        }
        reject(new Error(`The speech engine failed: ${detail}`));
        return;
      }
      // whisper-cli prints the transcription as the final non-empty stdout line.
      const lines = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const text = lines.length > 0 ? lines[lines.length - 1] : '';
      resolve(text);
    });
  });
}

/**
 * Recognise a captured utterance. `pcm` is a Float32Array at any sample
 * rate; it is downsampled to 16 kHz here. `translate` mode returns English
 * for Kannada input — used by the "they reply" side so the learner sees
 * readable text without depending on Kannada script output from the model.
 */
async function recognize(pcm, sourceRate, lang, translate = false) {
  if (!whisperPath || !modelPath) {
    throw new Error('The speech engine is not configured.');
  }
  const sampleRate = sourceRate || 16000;
  const samples = downsample(pcm, sampleRate);
  if (samples.length < 160) {
    throw new Error('The recording was too short to recognise.');
  }
  const promise = new Promise((resolve, reject) => {
    queue.push({ pcm: samples, lang, translate, resolve, reject });
  });
  runNext();
  return promise;
}

module.exports = { configure, recognize, writeWav, downsample };
