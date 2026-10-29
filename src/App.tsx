import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/Layout';
import { DesktopApp } from './pages/DesktopApp';
import { ProgressProvider } from './hooks/useProgress';
import { isDesktop } from './services/desktop';
import { HomePage } from './pages/HomePage';
import { BridgePage } from './pages/BridgePage';
import { SituationDetailPage, SituationsPage } from './pages/SituationsPage';
import { VoicePracticePage } from './pages/VoicePracticePage';
import { ConversationDetailPage, ConversationsPage } from './pages/ConversationsPage';
import { PhrasebookPage } from './pages/PhrasebookPage';
import { QuizPage } from './pages/QuizPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CulturePage } from './pages/CulturePage';

/**
 * HashRouter is a deliberate choice for a hackathon deliverable: the same
 * `dist/` folder can be dropped on GitHub Pages, Netlify or a college LAN
 * server with zero rewrite rules, and a deep link like
 * `#/situations/health` still works on refresh.
 *
 * Desktop mode (Electron): the DesktopApp shell (sidebar + content) replaces
 * the mobile-first AppShell. All routes are identical — only the chrome
 * around them changes.
 */
function renderRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bridge" element={<BridgePage />} />
      <Route path="/situations" element={<SituationsPage />} />
      <Route path="/situations/:categoryId" element={<SituationDetailPage />} />
      <Route path="/practice" element={<VoicePracticePage />} />
      <Route path="/conversations" element={<ConversationsPage />} />
      <Route path="/conversations/:scenarioId" element={<ConversationDetailPage />} />
      <Route path="/phrasebook" element={<PhrasebookPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/culture" element={<CulturePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const desktop = isDesktop();
  return (
    <ProgressProvider>
      <HashRouter>
        {desktop ? <DesktopApp>{renderRoutes()}</DesktopApp> : <AppShell>{renderRoutes()}</AppShell>}
      </HashRouter>
    </ProgressProvider>
  );
}
