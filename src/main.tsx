import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Ask user to refresh and apply the new service worker
    if (confirm('New version available — update now?')) {
      updateSW && updateSW(true);
    }
  },
  onOfflineReady() {
    // Optional: notify user the app is ready to work offline
    console.log('App is ready to work offline');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
