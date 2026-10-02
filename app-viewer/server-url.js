export const TRONBYT_SERVER_STORAGE_KEY = 'tronbyt.apps.verifiedServerUrl';
export const APP_VIEWER_PROTOCOL = 1;
export const CONNECTION_MAX_AGE_MS = 10 * 60 * 1000;
export const CONNECTION_HELP_DELAY_MS = 20 * 1000;

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
  const validHostname = /^[a-z\d._-]+$/i.test(url.hostname) || /^\[[a-f\d:.]+\]$/i.test(url.hostname);
  if (!url.hostname || !validHostname) {
    throw new Error('Enter a valid server address.');
  }
  if (url.username || url.password) {
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

export function buildServerConnectionUrl(serverUrl, state, protocol = APP_VIEWER_PROTOCOL) {
  const baseUrl = normalizeServerUrl(serverUrl);
  const connectionUrl = new URL('/integrations/apps-viewer/connect', baseUrl);
  connectionUrl.searchParams.set('protocol', String(protocol));
  connectionUrl.searchParams.set('state', state);
  return connectionUrl.href;
}

export function parseStoredConnection(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.serverUrl === 'string') {
      const verifiedAt = typeof parsed.verifiedAt === 'string' && !Number.isNaN(Date.parse(parsed.verifiedAt))
        ? parsed.verifiedAt
        : null;
      return {
        serverUrl: normalizeServerUrl(parsed.serverUrl),
        protocol: Number.isInteger(parsed.protocol) ? parsed.protocol : null,
        verifiedAt
      };
    }
  } catch {
    // Addresses saved by the earlier, unversioned implementation were strings.
  }

  try {
    return { serverUrl: normalizeServerUrl(value), protocol: null, verifiedAt: null };
  } catch {
    return null;
  }
}

export function serializeStoredConnection(serverUrl, protocol = APP_VIEWER_PROTOCOL, verifiedAt = new Date().toISOString()) {
  return JSON.stringify({
    serverUrl: normalizeServerUrl(serverUrl),
    protocol,
    verifiedAt
  });
}

export function validateConnectionCallback(pending, returnedState, returnedProtocol, now = Date.now()) {
  if (!pending || typeof pending !== 'object' || typeof pending.state !== 'string') {
    return { valid: false, clearPending: false, reason: 'missing' };
  }
  if (pending.state !== returnedState) {
    return { valid: false, clearPending: false, reason: 'state' };
  }
  if (typeof pending.createdAt !== 'number' || now - pending.createdAt > CONNECTION_MAX_AGE_MS) {
    return { valid: false, clearPending: true, reason: 'expired' };
  }
  if (pending.protocol !== APP_VIEWER_PROTOCOL || returnedProtocol !== String(APP_VIEWER_PROTOCOL)) {
    return { valid: false, clearPending: true, reason: 'protocol' };
  }
  if (typeof pending.serverUrl !== 'string') {
    return { valid: false, clearPending: true, reason: 'server' };
  }
  try {
    normalizeServerUrl(pending.serverUrl);
  } catch {
    return { valid: false, clearPending: true, reason: 'server' };
  }
  return { valid: true, clearPending: true, reason: null };
}

export function connectionHelpDelay(createdAt, now = Date.now()) {
  return Math.max(0, CONNECTION_HELP_DELAY_MS - (now - createdAt));
}
