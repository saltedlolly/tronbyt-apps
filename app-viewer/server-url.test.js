import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCommunityInstallUrl,
  buildServerVerificationUrl,
  normalizeServerUrl
} from './server-url.js';

test('normalizes Tronbyt server addresses', () => {
  assert.equal(normalizeServerUrl('https://umbrel.local:19191/'), 'https://umbrel.local:19191');
  assert.equal(normalizeServerUrl('umbrel.local:19191'), 'https://umbrel.local:19191');
  assert.equal(normalizeServerUrl('http://192.168.1.20:8000'), 'http://192.168.1.20:8000');
});

test('rejects unsafe or non-base addresses', () => {
  assert.throws(() => normalizeServerUrl('javascript:alert(1)'), /valid server address|http:\/\/ or https:\/\//);
  assert.throws(() => normalizeServerUrl('https://user:password@example.test'), /without credentials/);
  assert.throws(() => normalizeServerUrl('https://example.test/devices'), /without a page path/);
});

test('builds an encoded community install URL', () => {
  assert.equal(
    buildCommunityInstallUrl('https://umbrel.local:19191', 'solar beams'),
    'https://umbrel.local:19191/install/community/solar%20beams'
  );
});

test('builds a login verification URL for the viewer origin', () => {
  assert.equal(
    buildServerVerificationUrl('http://umbrel.local:19192', 'http://localhost:8888/app-viewer/', 'test-nonce'),
    'http://umbrel.local:19192/integrations/apps-viewer/verify?origin=http%3A%2F%2Flocalhost%3A8888&nonce=test-nonce'
  );
});
