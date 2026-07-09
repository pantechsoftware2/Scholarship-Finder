const LOCAL_API_URL = 'http://localhost:5000';
const PRODUCTION_API_URL = 'https://scholarship-finder-backend-seven.vercel.app';

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const envUrl = normalizeUrl(process.env.REACT_APP_API_URL);
  if (envUrl) {
    return envUrl;
  }

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0';

  return isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL;
}

