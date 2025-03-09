import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeSupabase } from './lib/supabase';
import { initializeConfig } from './lib/environment';

// First initialize environment configuration to get API keys
// Then initialize Supabase with those keys
const initializeApp = async () => {
  try {
    await initializeConfig();
    await initializeSupabase();
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// Wait for initialization before rendering
initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});