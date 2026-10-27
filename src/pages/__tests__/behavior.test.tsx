import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '../../hooks/useProgress';
import { PhrasebookPage } from '../PhrasebookPage';
import { FavoritesPage } from '../FavoritesPage';
import { QuizPage } from '../QuizPage';
import { ConversationDetailPage } from '../ConversationsPage';
import { SituationDetailPage, SituationsPage } from '../SituationsPage';
import { phrases } from '../../data/phrases';
import { progressStorageKey } from '../../services/storage';

/**
 * Behavioural coverage of the functional requirements: open a situation,
 * search, save a favourite and still have it after a reload, run a conversation
 * to the end, and get immediate quiz feedback.
 */

const readStored = () => JSON.parse(window.localStorage.getItem(progressStorageKey) ?? '{}');

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider>
        <Routes>
          <Route path="/situations" element={<SituationsPage />} />
          <Route path="/situations/:categoryId" element={<SituationDetailPage />} />
          <Route path="/conversations/:scenarioId" element={<ConversationDetailPage />} />
          <Route path="/phrasebook" element={<PhrasebookPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </ProgressProvider>
    </MemoryRouter>,
  );
}

describe('Situations', () => {
  it('lists all eight everyday situations as working links', () => {
    renderAt('/situations');
    const cards = screen.getAllByRole('link', { name: /opens the .* situation/i });
    expect(cards).toHaveLength(8);
    expect(screen.getByText('Transport & buses')).toBeInTheDocument();
    expect(screen.getByText('Hospital & pharmacy')).toBeInTheDocument();
  });

  it('opens one situation and shows its Kannada phrases', () => {
    renderAt('/situations/health');
    const target = phrases.find((phrase) => phrase.category === 'health')!;
    expect(screen.getByRole('heading', { name: 'Hospital & pharmacy', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(target.kannada).length).toBeGreaterThan(0);
  });

  it('falls back with a clear message for an unknown situation id', () => {
    renderAt('/situations/not-a-real-situation');
    expect(screen.getByText('That situation does not exist')).toBeInTheDocument();
  });
});

describe('Phrasebook search', () => {
  it('filters the real dataset as the learner types', () => {
    renderAt('/phrasebook');
    const search = screen.getByRole('searchbox', { name: /search phrases/i });

    fireEvent.change(search, { target: { value: 'washroom' } });
    // Matched words are wrapped in <mark>, so assert on the highlighted run
    // plus the Kannada line rather than the whole sentence.
    expect(screen.getByText('washroom')).toBeInTheDocument();
    expect(screen.getByText('ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?')).toBeInTheDocument();
    // Only the first page of results is mounted, so assert on a phrase that is.
    expect(screen.queryByText('ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('ದಯವಿಟ್ಟು ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?')).toBeInTheDocument();
  });

  it('narrows results with the situation filter and can show only favourites', () => {
    renderAt('/phrasebook');
    fireEvent.change(screen.getByRole('searchbox', { name: /search phrases/i }), {
      target: { value: 'water' },
    });
    fireEvent.change(screen.getByLabelText(/filter by situation/i), { target: { value: 'travel' } });
    expect(screen.getByText(/^\d+ results?$/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /my favourites/i }));
    expect(screen.getByText('No phrase matches that yet')).toBeInTheDocument();
  });
});

describe('Favourites persistence', () => {
  it('survives an unmount + remount, i.e. a browser refresh', () => {
    const view = renderAt('/phrasebook');
    const saveButtons = screen.getAllByRole('button', { name: /save to favourites/i });
    fireEvent.click(saveButtons[0]);
    fireEvent.click(saveButtons[1]);

    expect(readStored().favorites).toHaveLength(2);

    view.unmount();
    renderAt('/favorites');

    expect(screen.getByText(/2 phrases kept for the moments/i)).toBeInTheDocument();
    expect(screen.queryByText(/No favourites yet/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove from favourites/i })).toHaveLength(2);
  });
});

describe('Conversation simulator', () => {
  it('runs a scene to completion and records it', async () => {
    renderAt('/conversations/bus-conductor');
    expect(screen.getByRole('heading', { name: 'Boarding a bus', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Conductors open with the destination question/)).toBeInTheDocument();

    for (let step = 0; step < 6; step += 1) {
      const sayThis = screen.queryAllByText('Say this');
      if (!sayThis.length) break;
      const button = sayThis[0].closest('button');
      if (!button) break;
      fireEvent.click(within(button as HTMLElement).getByText('Say this'));
      if (screen.queryByText('Scene complete')) break;
    }

    await waitFor(() => expect(screen.getByText('Scene complete')).toBeInTheDocument());
    expect(screen.getByText(/Name the destination first/)).toBeInTheDocument();
    expect(readStored().completedScenarios).toContain('bus-conductor');
  });

  it('offers free-text answers that resolve against the real phrasebook', () => {
    renderAt('/conversations/bus-conductor');
    const box = screen.getByRole('textbox', { name: /type what you want to say/i });
    fireEvent.change(box, { target: { value: 'how far' } });
    const useBest = screen.getByRole('button', { name: /use best match/i });
    expect(useBest).toBeEnabled();

    // The suggestion list is populated from the real dataset, and using it adds
    // a "You said" bubble plus the other person's reply to the transcript.
    expect(screen.getAllByText(/ನಿಲ್ದಾಣ|ಹತ್ತಿರ|ದೂರ/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText('You said')).toHaveLength(0);

    fireEvent.click(useBest);
    expect(screen.getByText('You said')).toBeInTheDocument();
    expect(screen.getAllByText('They say')).toHaveLength(2);
  });
});

describe('Quiz', () => {
  it('starts a round, gives immediate feedback and moves on', () => {
    renderAt('/quiz');
    expect(screen.getByText('Best score')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));
    const questionCard = screen.getByRole('list');
    const options = within(questionCard).getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(3);

    fireEvent.click(options[0]);
    expect(screen.getByText(/Correct\.|Not quite\./)).toBeInTheDocument();
    const nextButton = screen.getByRole('button', {
      name: /next question|go to matching round/i,
    });
    expect(nextButton).toBeEnabled();
    // Options lock after the answer so the score cannot be edited afterwards.
    expect(options[1]).toBeDisabled();

    fireEvent.click(nextButton);
    expect(screen.getByText('Round progress')).toBeInTheDocument();
  });
});
