/**
 * Resolves API base URL for local FastAPI dev vs production.
 */
const LOCAL_API = 'http://localhost:8000';

export function resolveApiBaseUrl() {
  const isDev = process.env.NODE_ENV === 'development';
  const envUrl = String(process.env.REACT_APP_API_BASE_URL || '').trim().replace(/\/+$/, '');

  if (isDev) {
    if (!envUrl || /eventthone\.com/i.test(envUrl)) {
      return LOCAL_API;
    }
    return envUrl;
  }

  if (envUrl) return envUrl;

  // Same-origin works when nginx proxies /api and /static/uploads/ to the backend.
  if (typeof window !== 'undefined' && window.location?.origin) {
    return String(window.location.origin).replace(/\/+$/, '');
  }

  return LOCAL_API;
}
