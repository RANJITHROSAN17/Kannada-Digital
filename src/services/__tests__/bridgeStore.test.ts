import { afterEach, describe, expect, it } from 'vitest';
import {
  clearBridgeSnapshot,
  loadBridgeSnapshot,
  saveBridgeSnapshot,
} from '../bridgeStore';
import type { BridgeSideState } from '../../hooks/useBridge';

const KEY = 'kannada-saathi:bridge:v1';

const your: BridgeSideState = {
  input: 'Where is the bus stand?',
  interim: '',
  output: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
  roman: 'bas nildana ellide?',
  engine: 'google',
  status: 'done',
};

const them: BridgeSideState = {
  input: 'ಇಲ್ಲಿಂದ ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
  interim: '',
  output: 'The bus stand is here.',
  engine: 'mymemory',
  status: 'done',
};

afterEach(() => {
  window.localStorage.clear();
});

describe('bridgeStore', () => {
  it('round-trips a saved conversation', () => {
    saveBridgeSnapshot([{ id: 0, side: 'you', text: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', roman: 'bas nildana ellide?', engine: 'google' }], your, them);

    const snapshot = loadBridgeSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.transcript).toHaveLength(1);
    expect(snapshot?.transcript[0]?.text).toBe('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?');
    expect(snapshot?.your.output).toBe('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?');
    expect(snapshot?.them.output).toBe('The bus stand is here.');
    expect(snapshot?.savedAt).toBeTruthy();
  });

  it('returns null when nothing is stored', () => {
    expect(loadBridgeSnapshot()).toBeNull();
  });

  it('returns null on corrupt JSON and never throws', () => {
    window.localStorage.setItem(KEY, '{not json at all');
    expect(loadBridgeSnapshot()).toBeNull();
  });

  it('filters invalid transcript entries and malformed sides', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        transcript: [
          { id: 1, side: 'you', text: 'ok' },
          { id: 2, side: 'alien', text: 'bad' },
          'nope',
        ],
        your: { input: 'x', output: 'y' },
        them: 'garbage',
        savedAt: 'now',
      }),
    );

    const snapshot = loadBridgeSnapshot();
    expect(snapshot?.transcript).toHaveLength(1);
    expect(snapshot?.them.input).toBe('');
    expect(snapshot?.your.output).toBe('y');
  });

  it('clear removes the snapshot', () => {
    saveBridgeSnapshot([], your, them);
    expect(loadBridgeSnapshot()).not.toBeNull();
    clearBridgeSnapshot();
    expect(loadBridgeSnapshot()).toBeNull();
  });
});
