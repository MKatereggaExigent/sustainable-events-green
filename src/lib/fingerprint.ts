import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

/**
 * Initialize FingerprintJS
 * This should be called once when the app loads
 */
export async function initFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

/**
 * Get the device fingerprint
 * Returns a unique identifier for this device/browser
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Failed to get device fingerprint:', error);
    return 'unknown';
  }
}

/**
 * Get detailed fingerprint components
 * Useful for debugging and analytics
 */
export async function getDetailedFingerprint(): Promise<any> {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();
    return {
      visitorId: result.visitorId,
      confidence: result.confidence,
      components: result.components,
    };
  } catch (error) {
    console.error('Failed to get detailed fingerprint:', error);
    return null;
  }
}

