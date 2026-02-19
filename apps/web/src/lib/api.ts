/**
 * Base URL for API requests. Empty in dev (uses Vite proxy).
 * Set VITE_API_URL in production (e.g. https://ullatchi-api.vercel.app)
 */
export const apiBase = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase}${p}`;
}
