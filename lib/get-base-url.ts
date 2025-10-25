/**
 * Get the base URL for the application
 * Automatically detects environment and returns appropriate base URL
 *
 * Usage:
 * - Local development: Uses window.location (supports localhost, IP addresses, etc.)
 * - Production: Uses NEXT_PUBLIC_SITE_URL from environment variable
 *
 * @returns {string} Base URL without trailing slash
 */
export function getBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check if running on localhost or local IP (development mode)
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' ||
                       hostname === '127.0.0.1' ||
                       hostname.startsWith('192.168.') ||
                       hostname.startsWith('10.') ||
                       hostname.startsWith('172.16.');

    if (isLocalhost) {
      // Use current window location for local development
      return `${window.location.protocol}//${window.location.host}`;
    }
  }

  // Use environment variable for production or server-side
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl) {
    // Remove trailing slash if present
    return envUrl.replace(/\/$/, '');
  }

  // Fallback to linkist.ai if no env variable is set
  console.warn('NEXT_PUBLIC_SITE_URL not set, using fallback: https://linkist.ai');
  return 'https://linkist.ai';
}

/**
 * Get the base domain (without protocol)
 * Useful for display purposes
 *
 * @returns {string} Base domain without protocol (e.g., "linkist.ai" or "localhost:3001")
 */
export function getBaseDomain(): string {
  const baseUrl = getBaseUrl();
  return baseUrl.replace(/^https?:\/\//, '');
}
