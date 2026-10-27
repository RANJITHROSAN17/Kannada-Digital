import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './components/ProgressContext';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider><App /></ProgressProvider>
    </MemoryRouter>,
  );
}

describe.each([
  ['/', /speak kannada/i],
  ['/situations', /everyday situations/i],
  ['/practice', /role-play practice/i],
  ['/quiz', /quick quiz/i],
  ['/voice', /voice practice/i],
  ['/ask', /ask in english/i],
  ['/saved', /your progress/i],
  ['/about', /about kannada saathi/i],
  ['/situations/market', /market & shopping/i],
  ['/does-not-exist', /could not find that page/i],
])('route %s', (path, heading) => {
  it('renders without crashing', () => {
    renderAt(path);
    expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
  });
});

describe('app shell', () => {
  it('shows the brand and the daily streak', () => {
    renderAt('/');
    expect(screen.getByText('Kannada Saathi')).toBeInTheDocument();
    expect(screen.getByTitle('Days in a row')).toBeInTheDocument();
  });
  it('exposes the primary navigation', () => {
    renderAt('/');
    expect(screen.getAllByRole('link', { name: 'Situations' }).length).toBeGreaterThan(0);
  });
});
