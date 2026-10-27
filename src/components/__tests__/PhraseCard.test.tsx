import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PhraseCard } from '../PhraseCard';
import { ProgressProvider } from '../../hooks/useProgress';
import { phrases } from '../../data/phrases';
import { progressStorageKey } from '../../services/storage';

function renderCard(phrase = phrases[0]) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider>
        <PhraseCard phrase={phrase} />
      </ProgressProvider>
    </MemoryRouter>,
  );
}

describe('<PhraseCard />', () => {
  it('shows script, transliteration, meaning and usage together', () => {
    renderCard();
    const phrase = phrases[0];
    expect(screen.getByText(phrase.kannada)).toBeInTheDocument();
    expect(screen.getByText(phrase.transliteration)).toBeInTheDocument();
    expect(screen.getByText(phrase.english)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(phrase.usage.slice(0, 18).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
  });

  it('gives every control an accessible name', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /save to favourites/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy phrase/i })).toBeInTheDocument();
    // jsdom has no speech voices: the play button must say so and be disabled.
    expect(screen.getByRole('button', { name: /audio not supported|playback unavailable/i })).toBeDisabled();
    expect(screen.getByText(/Audio not supported here/i)).toBeInTheDocument();
  });

  it('saves and removes a favourite, and the write reaches localStorage', () => {
    renderCard();
    const button = screen.getByRole('button', { name: /save to favourites/i });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: /remove from favourites/i })).toHaveAttribute('aria-pressed', 'true');
    const stored = JSON.parse(window.localStorage.getItem(progressStorageKey) ?? '{}');
    expect(stored.favorites).toEqual([phrases[0].id]);

    fireEvent.click(screen.getByRole('button', { name: /remove from favourites/i }));
    const after = JSON.parse(window.localStorage.getItem(progressStorageKey) ?? '{}');
    expect(after.favorites).toEqual([]);
  });

  it('labels a colloquial phrase for review instead of hiding it', () => {
    const flagged = phrases.find((phrase) => phrase.review === 'needs-native-review');
    expect(flagged).toBeDefined();
    renderCard(flagged);
    expect(screen.getByText(/awaiting native review/i)).toBeInTheDocument();
  });

  it('reveals the pronunciation tip only on demand', () => {
    const withTip = phrases.find((phrase) => phrase.pronunciationTip)!;
    renderCard(withTip);
    const toggle = screen.getByRole('button', { name: /pronunciation tip/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(withTip.pronunciationTip!)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(withTip.pronunciationTip!)).toBeInTheDocument();
  });
});
