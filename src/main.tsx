import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Purge any stale legacy service worker to ensure fresh game code loads immediately
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);

