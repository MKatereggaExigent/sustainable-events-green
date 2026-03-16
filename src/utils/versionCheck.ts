/**
 * Version Check Utility
 * Automatically detects when a new version is deployed and forces a reload
 */

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_KEY = 'app_version';

let currentVersion: string | null = null;
let checkInterval: NodeJS.Timeout | null = null;

/**
 * Get the current deployed version from the server
 */
async function fetchCurrentVersion(): Promise<string | null> {
  try {
    const response = await fetch('/version.json?t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.version || null;
  } catch (error) {
    console.warn('Failed to fetch version:', error);
    return null;
  }
}

/**
 * Check if a new version is available and reload if necessary
 */
async function checkForNewVersion(): Promise<void> {
  const newVersion = await fetchCurrentVersion();
  
  if (!newVersion) {
    return;
  }
  
  // First time - just store the version
  if (!currentVersion) {
    currentVersion = newVersion;
    localStorage.setItem(VERSION_KEY, newVersion);
    return;
  }
  
  // Version changed - reload the page
  if (newVersion !== currentVersion) {
    console.log('New version detected:', newVersion, '(current:', currentVersion + ')');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Store new version
    localStorage.setItem(VERSION_KEY, newVersion);
    
    // Force reload from server (bypass cache)
    window.location.reload();
  }
}

/**
 * Start periodic version checking
 */
export function startVersionCheck(): void {
  // Get initial version
  currentVersion = localStorage.getItem(VERSION_KEY);
  
  // Check immediately
  checkForNewVersion();
  
  // Check periodically
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  checkInterval = setInterval(checkForNewVersion, VERSION_CHECK_INTERVAL);
}

/**
 * Stop version checking
 */
export function stopVersionCheck(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Force a version check now
 */
export function forceVersionCheck(): Promise<void> {
  return checkForNewVersion();
}

