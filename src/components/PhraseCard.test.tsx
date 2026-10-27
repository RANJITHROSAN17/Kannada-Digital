import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PhraseCard } from './PhraseCard';
import { ProgressProvider } from './ProgressContext';
import { PHRASE_BY_ID } from '../data/phrases';
import { loadProgress } from '../lib/storage';

const phrase = PHRASE_BY_ID['market-1'];

function renderCard() {
  return render(
    <ProgressProvider>
      <PhraseCard phrase={phrase} />
    </ProgressProvider>,
  );
}

describe('<PhraseCard />', () => {
  it('shows Kannada, transliteration, meaning and usage guidance', () => {
    renderCard();
    expect(screen.getByText(phrase.kn)).toBeInTheDocument();
    expect(screen.getByText(phrase.rom)).toBeInTheDocument();
    expect(screen.getByText(phrase.en)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(phrase.when.slice(0, 12)))).toBeInTheDocument();
  });

  it('toggles a favourite and persists it', () => {
    renderCard();
    const button = screen.getByRole('button', { name: /save/i });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /saved/i })).toHaveAttribute('aria-pressed', 'true');
    expect(loadProgress().favourites).toContain(phrase.id);
    fireEvent.click(screen.getByRole('button', { name: /saved/i }));
    expect(loadProgress().favourites).not.toContain(phrase.id);
  });

  it('marks a phrase as learned', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /mark learned/i }));
    expect(loadProgress().learned).toContain(phrase.id);
  });

  it('degrades gracefully when audio is unavailable', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /listen to/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/audio not available/i);
  });

  it('renders compact cards without the guidance block', () => {
    render(
      <ProgressProvider>
        <PhraseCard phrase={phrase} compact />
      </ProgressProvider>,
    );
    expect(screen.queryByText(/^When:/)).not.toBeInTheDocument();
  });
});
