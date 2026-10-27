import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  // jsdom does not implement scrolling or the Web Speech API. Stub just enough
  // so component smoke tests can render without noisy "not implemented" errors.
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
