import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// React Testing Library cleanup + a fresh localStorage per test, because the
// app persists favourites/progress through localStorage.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom implements neither speechSynthesis nor SpeechRecognition. That is the
// worst-case browser we must survive, so the app's own guards are under test
// here rather than being stubbed away.
