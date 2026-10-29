import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BridgePage } from '../BridgePage';

/**
 * The bridge is the one page whose value is "any sentence works". These tests
 * cover the one-tap chips and the offline error path with a mocked network.
 */

interface FakeResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function fakeJson(payload: unknown, ok = true, status = 200): FakeResponse {
  return { ok, status, json: async () => payload };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderBridge() {
  return render(
    <MemoryRouter>
      <BridgePage />
    </MemoryRouter>,
  );
}

describe('BridgePage', () => {
  it('renders both sides of the conversation', () => {
    renderBridge();
    expect(screen.getByText('You talk — English')).toBeInTheDocument();
    expect(screen.getByText('They reply — Kannada')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /auto-continue/i })).toBeInTheDocument();
  });

  it('translates a one-tap sentence to Kannada and shows the engine', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeJson([
          [['ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?']],
          null,
          'en',
          'kn',
        ]),
      ),
    );

    renderBridge();
    fireEvent.click(screen.getByRole('button', { name: 'Where is the bus stand?' }));

    // The line appears twice: in the result card and in the conversation log.
    await waitFor(() => {
      expect(screen.getAllByText('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getAllByText('via google').length).toBeGreaterThanOrEqual(1);
  });

  it('keeps the typed box working when translation is offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeJson(null, false, 503)));

    renderBridge();
    fireEvent.click(screen.getByRole('button', { name: 'Where is the bus stand?' }));

    await waitFor(() => {
      expect(screen.getByText(/translation is currently unavailable/i)).toBeInTheDocument();
    });
    // The input keeps the sentence so the user can retry or copy it.
    expect(screen.getByPlaceholderText('Type an English sentence…')).toHaveValue('Where is the bus stand?');
  });

  it('shows what the browser can do, honestly', () => {
    renderBridge();
    expect(screen.getByText('What this browser can do')).toBeInTheDocument();
    // jsdom has neither speech recognition nor speech synthesis — the page
    // must still render and point to the typed fallback.
    expect(screen.getAllByText(/Type an English sentence…|not in this browser/i).length).toBeGreaterThan(0);
  });

  it('diagnoses a microphone that sends no audio to the page', async () => {
    // Fake speech recognition so the hook believes the browser can listen.
    class FakeRecognition {
      static list: FakeRecognition[] = [];
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {}
      stop() {}
      abort() {}
      emitError(code: string) {
        this.onerror?.({ error: code });
      }
      emitEnd() {
        this.onend?.();
      }
      constructor() {
        FakeRecognition.list.push(this);
      }
    }
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition =
      FakeRecognition;
    // jsdom has no audio engine — the level meter must report that clearly.
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
      configurable: true,
    });

    try {
      renderBridge();
      fireEvent.click(screen.getByRole('button', { name: 'Test microphone' }));

      // First session hears nothing → retried once inside listenOnce.
      FakeRecognition.list[0].emitError('no-speech');
      FakeRecognition.list[0].emitEnd();
      // The retry hears nothing either → the test reports the diagnosis.
      FakeRecognition.list[1].emitError('no-speech');
      FakeRecognition.list[1].emitEnd();

      await waitFor(() =>
        expect(screen.getByText(/The browser cannot capture audio at all/)).toBeInTheDocument(),
      );
    } finally {
      delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      delete (navigator as unknown as { mediaDevices?: unknown }).mediaDevices;
    }
  });
});
