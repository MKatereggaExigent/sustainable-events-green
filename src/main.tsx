
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startVersionCheck, checkVersionBeforeLoad } from './utils/versionCheck'

// Check version BEFORE loading the app to catch stale caches
checkVersionBeforeLoad().then(() => {
  // Start automatic version checking to prevent cache issues
  startVersionCheck();

  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
}).catch(error => {
  console.error('Failed to check version:', error);
  // Render anyway if version check fails
  createRoot(document.getElementById("root")!).render(<App />);
});
