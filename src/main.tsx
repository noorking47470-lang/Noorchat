import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Register PWA service worker with automatic cache updates
registerSW({
  immediate: true,
  onRegistered(r) {
    console.log('Noor Chat Service Worker successfully registered:', r);
  },
  onRegisterError(error) {
    console.error('Noor Chat Service Worker registration error:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
