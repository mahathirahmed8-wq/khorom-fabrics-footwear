// Ensure window.fetch is safely assignable in all environments
try {
  if (typeof window !== 'undefined') {
    let _f = window.fetch ? window.fetch.bind(window) : undefined;
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || !desc.set) {
      try {
        Object.defineProperty(window, 'fetch', {
          get: () => _f,
          set: (v) => { _f = v; },
          configurable: true,
          enumerable: true,
        });
      } catch (_) {}
    }
  }
} catch (_) {}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
