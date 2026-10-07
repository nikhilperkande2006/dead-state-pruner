import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely register offline service worker
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        // Silently catch in dev or iframes
        console.debug('ServiceWorker registration note:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
