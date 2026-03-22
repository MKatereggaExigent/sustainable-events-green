/**
 * Version Check Utility
 * Automatically detects when a new version is deployed and forces a reload
 */

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_KEY = 'app_version';
const LAST_RELOAD_KEY = 'last_reload_time';
const MIN_RELOAD_INTERVAL = 10 * 1000; // Minimum 10 seconds between reloads

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
        'Pragma': 'no-cache',
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
 * Clear all browser caches aggressively
 */
async function clearAllCaches(): Promise<void> {
  try {
    // Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cleared', cacheNames.length, 'cache(s)');
    }

    // Clear localStorage except version info
    const version = localStorage.getItem(VERSION_KEY);
    localStorage.clear();
    if (version) {
      localStorage.setItem(VERSION_KEY, version);
    }

    // Clear sessionStorage
    sessionStorage.clear();
  } catch (error) {
    console.warn('Failed to clear caches:', error);
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
    console.log('🔄 New version detected:', newVersion, '(current:', currentVersion + ')');

    // Prevent reload loops
    const lastReload = localStorage.getItem(LAST_RELOAD_KEY);
    const now = Date.now();
    if (lastReload && (now - parseInt(lastReload)) < MIN_RELOAD_INTERVAL) {
      console.warn('⚠️ Skipping reload - too soon after last reload');
      return;
    }

    // Store reload time
    localStorage.setItem(LAST_RELOAD_KEY, now.toString());

    // Store new version
    localStorage.setItem(VERSION_KEY, newVersion);

    // Clear all caches
    await clearAllCaches();

    // Force hard reload from server (bypass all caches)
    console.log('🔄 Forcing hard reload...');
    window.location.href = window.location.href.split('?')[0] + '?v=' + newVersion;
  }
}

/**
 * Start periodic version checking
 */
export function startVersionCheck(): void {
  // Get initial version
  currentVersion = localStorage.getItem(VERSION_KEY);

  console.log('🔍 Version check started. Current version:', currentVersion || 'unknown');

  // Check immediately
  checkForNewVersion();

  // Check periodically
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(checkForNewVersion, VERSION_CHECK_INTERVAL);
}

/**
 * Check version BEFORE app loads (blocking check)
 * This should be called in index.html before loading the main app
 */
export async function checkVersionBeforeLoad(): Promise<void> {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const serverVersion = await fetchCurrentVersion();

  if (!serverVersion) {
    console.warn('⚠️ Could not fetch server version');
    return;
  }

  // If versions don't match, clear caches immediately
  if (storedVersion && storedVersion !== serverVersion) {
    console.log('🔄 Version mismatch detected on load. Clearing caches...');
    await clearAllCaches();
    localStorage.setItem(VERSION_KEY, serverVersion);
  } else if (!storedVersion) {
    // First time visit
    localStorage.setItem(VERSION_KEY, serverVersion);
  }
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

