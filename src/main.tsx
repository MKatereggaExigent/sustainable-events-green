
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startVersionCheck } from './utils/versionCheck'

// Start automatic version checking to prevent cache issues
startVersionCheck();

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
