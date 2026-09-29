/**
 * Authoritative API Configuration & URL Resolver
 * 
 * Manages routing between local development, Vercel frontend deployments,
 * and the Render backend service.
 */

const RENDER_BACKEND_URL = "https://urban-pulse-guardian-ai.onrender.com";

/**
 * Resolves the full URL for backend API requests.
 * 
 * - If VITE_API_URL is explicitly configured, it takes highest precedence.
 * - In local browser environments (localhost, 127.0.0.1, .local), uses relative
 *   paths to allow the local Vite/Express dev server or proxy to handle requests.
 * - In production environments (e.g. deployed on Vercel), routes directly to the
 *   deployed Render backend service.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 1. Explicit override via Vite environment variable
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    return `${base}${cleanPath}`;
  }

  // 2. Local development environment check
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local")
    ) {
      return cleanPath;
    }
  }

  // 3. Deployed production fallback (Render Backend)
  return `${RENDER_BACKEND_URL}${cleanPath}`;
}
