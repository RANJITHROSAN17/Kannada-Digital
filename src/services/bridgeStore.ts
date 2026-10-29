import type { BridgeSideState, BridgeTranscriptEntry } from '../hooks/useBridge';

/**
 * The bridge conversation survives a refresh. The transcript and both sides'
 * recognised lines are persisted under one versioned key; listening/translating
 * status is deliberately transient (it is never restored — the learner taps
 * the mic again).
 */
const KEY = 'kannada-saathi:bridge:v1';

export interface BridgeSnapshot {
  transcript: BridgeTranscriptEntry[];
  your: Pick<BridgeSideState, 'input' | 'output' | 'roman' | 'engine'>;
  them: Pick<BridgeSideState, 'input' | 'output' | 'engine'>;
  savedAt: string;
}

type SidePart = Pick<BridgeSideState, 'input' | 'output' | 'roman' | 'engine'>;

function sideFrom(raw: unknown): SidePart {
  if (!raw || typeof raw !== 'object') return { input: '' };
  const record = raw as Record<string, unknown>;
  const side: SidePart = { input: '' };
  if (typeof record.input === 'string') side.input = record.input;
  if (typeof record.output === 'string') side.output = record.output;
  if (typeof record.roman === 'string') side.roman = record.roman;
  if (record.engine === 'google' || record.engine === 'mymemory' || record.engine === 'identity') {
    side.engine = record.engine;
  }
  return side;
}

function isValidEntry(entry: unknown): entry is BridgeTranscriptEntry {
  if (!entry || typeof entry !== 'object') return false;
  const record = entry as Record<string, unknown>;
  return (
    typeof record.id === 'number' &&
    (record.side === 'you' || record.side === 'them') &&
    typeof record.text === 'string'
  );
}

export function loadBridgeSnapshot(): BridgeSnapshot | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BridgeSnapshot>;
    if (!parsed || !Array.isArray(parsed.transcript)) return null;
    return {
      transcript: parsed.transcript.filter(isValidEntry),
      your: sideFrom(parsed.your),
      them: sideFrom(parsed.them),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
    };
  } catch {
    // Corrupt JSON: start with a fresh conversation rather than blocking.
    return null;
  }
}

export function saveBridgeSnapshot(
  transcript: BridgeTranscriptEntry[],
  your: BridgeSideState,
  them: BridgeSideState,
): void {
  try {
    const snapshot: BridgeSnapshot = {
      transcript,
      your: {
        input: your.input,
        output: your.output,
        roman: your.roman,
        engine: your.engine,
      },
      them: {
        input: them.input,
        output: them.output,
        engine: them.engine,
      },
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // Private mode / quota: the conversation simply stays in memory.
  }
}

export function clearBridgeSnapshot(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
