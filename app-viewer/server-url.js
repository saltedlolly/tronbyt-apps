export const TRONBYT_SERVER_STORAGE_KEY = 'tronbyt.apps.verifiedServerUrl';

export function normalizeServerUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Enter your Tronbyt Server address.');
  }

  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new Error('The server address must use http:// or https://.');
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('Enter a valid server address.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('The server address must use http:// or https://.');
  }
  if (!url.hostname || url.username || url.password) {
    throw new Error('Enter a server address without credentials.');
  }
  if ((url.pathname && url.pathname !== '/') || url.search || url.hash) {
    throw new Error('Enter the server address only, without a page path.');
  }

  return url.origin;
}

export function buildCommunityInstallUrl(serverUrl, appSlug) {
  if (!appSlug) {
    throw new Error('An app identifier is required.');
  }

  const baseUrl = normalizeServerUrl(serverUrl);
  return new URL(`/install/community/${encodeURIComponent(appSlug)}`, baseUrl).href;
}

export function buildServerConnectionUrl(serverUrl, state) {
  const baseUrl = normalizeServerUrl(serverUrl);
  const connectionUrl = new URL('/integrations/apps-viewer/connect', baseUrl);
  connectionUrl.searchParams.set('state', state);
  return connectionUrl.href;
}
