import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgressProvider } from '../../hooks/useProgress';
import { HomePage } from '../HomePage';

/**
 * The home page must carry the live bridge itself — the mic conversation is
 * the one feature a first-time visitor should reach without navigating.
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

function renderHome() {
  return render(
    <MemoryRouter>
      <ProgressProvider>
        <HomePage />
      </ProgressProvider>
    </MemoryRouter>,
  );
}

describe('HomePage — speak & hear bridge', () => {
  it('shows the two-way mic bridge on the landing page', () => {
    renderHome();
    expect(screen.getByText('You talk — English')).toBeInTheDocument();
    expect(screen.getByText('They reply — Kannada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Where is the bus stand?' })).toBeInTheDocument();
  });

  it('translates a one-tap sentence from the home page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeJson([
          [['ಯೋಜನೆಯ ಸ್ಥಿತಿ ಏನು?']],
          null,
          'en',
          'kn',
        ]),
      ),
    );

    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'What is the project status?' }));

    await waitFor(() => {
      expect(screen.getByText('ಯೋಜನೆಯ ಸ್ಥಿತಿ ಏನು?')).toBeInTheDocument();
    });
    expect(screen.getByText('via google')).toBeInTheDocument();
  });

  it('reports a clear error when the home bridge is offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeJson(null, false, 503)));

    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'Where is the bus stand?' }));

    await waitFor(() => {
      expect(screen.getByText(/translation is currently unavailable/i)).toBeInTheDocument();
    });
  });
});
