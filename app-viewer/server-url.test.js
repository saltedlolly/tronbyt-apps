import test from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_VIEWER_PROTOCOL,
  CONNECTION_HELP_DELAY_MS,
  CONNECTION_MAX_AGE_MS,
  buildCommunityInstallUrl,
  buildServerConnectionUrl,
  connectionHelpDelay,
  normalizeServerUrl,
  parseStoredConnection,
  serializeStoredConnection,
  validateConnectionCallback
} from './server-url.js';

test('normalizes Tronbyt server addresses', () => {
  assert.equal(normalizeServerUrl('https://umbrel.local:19191/'), 'https://umbrel.local:19191');
  assert.equal(normalizeServerUrl('umbrel.local:19191'), 'https://umbrel.local:19191');
  assert.equal(normalizeServerUrl('http://192.168.1.20:8000'), 'http://192.168.1.20:8000');
  assert.equal(
    normalizeServerUrl('http://192.168.1.20:19192/auth/login'),
    'http://192.168.1.20:19192'
  );
  assert.equal(
    normalizeServerUrl('https://umbrel.local:19191/devices/example?tab=apps#community'),
    'https://umbrel.local:19191'
  );
});

test('rejects unsafe addresses', () => {
  assert.throws(() => normalizeServerUrl('javascript:alert(1)'), /valid server address|http:\/\/ or https:\/\//);
  assert.throws(() => normalizeServerUrl('https://user:password@example.test'), /without credentials/);
});

test('builds an encoded community install URL', () => {
  assert.equal(
    buildCommunityInstallUrl('https://umbrel.local:19191', 'solar beams'),
    'https://umbrel.local:19191/install/community/solar%20beams'
  );
});

test('builds a server connection URL with one-time state', () => {
  assert.equal(
    buildServerConnectionUrl('http://umbrel.local:19192', 'test-state'),
    'http://umbrel.local:19192/integrations/apps-viewer/connect?protocol=1&state=test-state'
  );
});

test('stores the verified protocol and verification time with the address', () => {
  const verifiedAt = '2026-10-02T12:00:00.000Z';
  const stored = serializeStoredConnection('http://umbrel.local:19192', APP_VIEWER_PROTOCOL, verifiedAt);
  assert.deepEqual(parseStoredConnection(stored), {
    serverUrl: 'http://umbrel.local:19192',
    protocol: APP_VIEWER_PROTOCOL,
    verifiedAt
  });
});

test('reads an address saved by the earlier unversioned viewer as unverified', () => {
  assert.deepEqual(parseStoredConnection('http://umbrel.local:19192'), {
    serverUrl: 'http://umbrel.local:19192',
    protocol: null,
    verifiedAt: null
  });
});

test('ignores malformed or unsafe stored connections', () => {
  assert.equal(parseStoredConnection('{not-json'), null);
  assert.equal(parseStoredConnection(JSON.stringify({ serverUrl: 'javascript:alert(1)', protocol: 1 })), null);
  assert.equal(
    parseStoredConnection(JSON.stringify({ serverUrl: 'https://example.test', protocol: 1, verifiedAt: 'not-a-date' })).verifiedAt,
    null
  );
});

test('accepts a matching, current callback', () => {
  const now = 1_000_000;
  const pending = {
    state: 'matching-state',
    serverUrl: 'http://umbrel.local:19192',
    protocol: APP_VIEWER_PROTOCOL,
    createdAt: now - 1000
  };
  assert.deepEqual(validateConnectionCallback(pending, 'matching-state', '1', now), {
    valid: true,
    clearPending: true,
    reason: null
  });
});

test('rejects mismatched, expired, and unsupported callbacks', () => {
  const now = 1_000_000;
  const pending = {
    state: 'expected-state',
    serverUrl: 'http://umbrel.local:19192',
    protocol: APP_VIEWER_PROTOCOL,
    createdAt: now - 1000
  };

  assert.equal(validateConnectionCallback(pending, 'other-state', '1', now).reason, 'state');
  assert.equal(validateConnectionCallback(null, 'expected-state', '1', now).reason, 'missing');
  assert.equal(
    validateConnectionCallback({ ...pending, createdAt: now - CONNECTION_MAX_AGE_MS - 1 }, 'expected-state', '1', now).reason,
    'expired'
  );
  assert.equal(validateConnectionCallback(pending, 'expected-state', '2', now).reason, 'protocol');
  assert.equal(validateConnectionCallback(pending, 'expected-state', '01', now).reason, 'protocol');
  assert.equal(validateConnectionCallback(pending, 'expected-state', null, now).reason, 'protocol');
  assert.equal(validateConnectionCallback({ ...pending, protocol: 2 }, 'expected-state', '1', now).reason, 'protocol');
  assert.equal(validateConnectionCallback({ ...pending, serverUrl: 'not a {host}' }, 'expected-state', '1', now).reason, 'server');
});

test('shows connection troubleshooting after the waiting period', () => {
  const now = 1_000_000;
  assert.equal(connectionHelpDelay(now, now), CONNECTION_HELP_DELAY_MS);
  assert.equal(connectionHelpDelay(now - 5000, now), CONNECTION_HELP_DELAY_MS - 5000);
  assert.equal(connectionHelpDelay(now - CONNECTION_HELP_DELAY_MS, now), 0);
  assert.equal(connectionHelpDelay(now - CONNECTION_HELP_DELAY_MS - 5000, now), 0);
});
