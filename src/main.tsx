import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './components/ProgressContext';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </HashRouter>
  </React.StrictMode>,
);

// Offline support is progressive: skip in dev and when unsupported.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}
