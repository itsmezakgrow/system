// Compatibility polyfill for iframe and extension fetch patching
try {
  let originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return originalFetch;
    },
    set(newFetch) {
      originalFetch = newFetch;
    },
  });
} catch (_) {
  // Ignore if already configured
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
