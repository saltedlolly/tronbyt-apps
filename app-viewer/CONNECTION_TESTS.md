# Tronbyt Server connection test matrix

The viewer and Tronbyt Server are different web origins. Authentication is
verified through a user-initiated new tab and redirect. The viewer must never
receive a password, session cookie, API key, username, or device data.

The first supported App Viewer connection protocol is `1`. Compatibility is
decided by this protocol handshake rather than by guessing from a server
version string.

## Address validation

- Empty address: show an error and do not open a new tab.
- Hostname without a scheme: assume HTTPS.
- HTTP and HTTPS base origins: accept.
- Address containing credentials: reject.
- Non-HTTP scheme: reject.
- Address containing a path, query, or fragment: discard everything after the
  origin and verify the resulting server address.
- Local address while off the relevant LAN: only the new tab fails; the viewer
  remains available and the address is not saved.

## Authentication and verification

- Compatible server, already signed in: return to the same App Viewer page,
  save the address with protocol `1` and the verification time, and show the
  install buttons.
- Compatible server, signed out: show the normal server login page and resume
  the complete connection URL automatically after sign-in.
- Successful password, passkey, OIDC, or initial-registration sign-in: preserve
  both `protocol=1` and the one-time state while resuming the connection.
- Incorrect server or unrelated website: only the new tab fails; the original
  viewer remains open and the address is not saved.
- New tab blocked: leave a visible Continue to Tronbyt Server link; do not save
  the address until a valid callback is received.
- New tab closed by the user: leave the original viewer unchanged.
- After 20 seconds without confirmation: keep waiting, but reveal Try Again and
  Cancel actions. Do not state that an update is definitely required because an
  outage or blocked tab looks the same.
- Try Again: create a fresh one-time state and open the current address again.
- Cancel: clear only the pending attempt. Keep any previously verified server.
- Successful confirmation in a script-opened tab: save the verified server and
  close the tab. If the browser refuses to close it (including a same-tab
  fallback), show a confirmation with a Return to App Viewer link.
- Clear: forget the verified and pending addresses and immediately hide install
  buttons.

## Protocol and server-version compatibility

- Current server supporting protocol `1`: accept only a callback that returns
  the same state and `protocol=1`.
- Older server without the connection endpoint: its tab may show not found or a
  different page. The viewer remains pending, exposes troubleshooting after 20
  seconds, and never saves the address.
- Server endpoint that omits the callback protocol: reject the callback, clear
  that pending attempt, keep install buttons hidden, and recommend updating.
- Server returning an unsupported protocol: handle it exactly like a missing
  protocol; never silently assume compatibility.
- Server rejecting `protocol=1`: leave the viewer pending so the user can retry,
  update, or cancel.
- Newer server that remains compatible with protocol `1`: accept it regardless
  of its release version.
- Address saved by the earlier unversioned viewer: remember and prefill it, but
  treat it as unverified and hide install buttons until it completes protocol
  `1` verification.
- Verified server later downgraded: its previously saved capability may still
  show the install buttons, but installation fails safely in the server tab.
  Re-verifying exposes the compatibility guidance.
- Before making the App Viewer PR ready for review, replace the temporary
  `v2.x.x` wording with the exact first released Tronbyt Server version that
  supports protocol `1`.

## Callback integrity and concurrency

- Missing pending attempt: reject the callback and do not alter saved settings.
- Wrong state: reject it without deleting a newer pending attempt.
- Callback older than 10 minutes: reject it and clear the expired attempt.
- Replayed callback after success: reject it because the pending state has
  already been consumed.
- Two attempts from different tabs: only the latest stored state can succeed;
  the older callback must not delete the newer pending attempt.
- Malformed remembered storage: ignore it and behave as disconnected.

## Returning visits and outages

- Versioned verified record: show the tick and address, and expose install
  buttons.
- Verification time: retain it for diagnosis and future migration decisions;
  do not present it as proof that the server is currently online.
- Server session later expires: Add to Tronbyt opens the server login page; no
  credentials are exposed to the viewer.
- Server temporarily goes offline: the install tab fails normally, while the
  remembered address remains available to edit or clear.

Browsers do not allow a GitHub Pages site to silently inspect an authenticated
session on a different origin. Automatic authenticated checks on page load or
on a timer would require weakening cookie policy or storing a new credential in
the viewer. Verification therefore happens on an explicit user gesture, and
Tronbyt enforces authentication again whenever an installation link is opened.

## Installation handoff

- No devices: explain that a device must be created and link to device setup.
- One device: GET performs no mutation; an auto-submitted POST adds the app and
  opens its configuration page.
- Multiple devices: show the app name and preview, ask an explicit device
  question, and add only after the user selects a device.
- Device belonging to another user: reject.
- Unknown app: return not found.
- Broken app: reject without creating an installation.
- Cancel from configuration: delete the new installation via the existing
  `delete_on_cancel=true` flow.

## Release order

1. Merge and release the Tronbyt Server support first.
2. Keep the App Viewer PR in draft while that release propagates.
3. Update the Viewer copy and PR description with the precise minimum server
   version.
4. Re-run this matrix against both the minimum supported release and an older
   release before making the Viewer PR ready.
