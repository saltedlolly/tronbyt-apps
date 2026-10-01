# Tronbyt Server connection test matrix

The viewer and Tronbyt Server are different web origins. Authentication is
therefore verified through a user-initiated popup and `postMessage`; the viewer
must never receive a password, session cookie, API key, username, or device
data.

## Address validation

- Empty address: show an error and do not open a popup.
- Hostname without a scheme: assume HTTPS.
- HTTP and HTTPS base origins: accept.
- Address containing credentials: reject.
- Non-HTTP scheme: reject.
- Address containing a path, query, or fragment: reject.
- Local address while off the relevant LAN: show a persistent connection error.

## Authentication and verification

- Tronbyt Server reachable and already signed in: verification popup closes,
  the modal shows a persistent success message, and install buttons appear.
- Tronbyt Server reachable but signed out: popup shows the server login page;
  after signing in, retrying Verify succeeds.
- Incorrect server or unrelated website: no matching verification message is
  received and the address is not saved.
- Popup blocked: explain that popups must be allowed; do not save the address.
- Popup closed by the user: show a persistent incomplete-verification message.
- Verification takes longer than eight seconds: keep the login window open and
  explain that the user should finish signing in and retry Verify.
- Message from the wrong origin: ignore it.
- Message with the wrong one-time nonce: ignore it.
- Clear: forget the verified address and immediately hide install buttons.

## Returning visits and outages

- Previously verified address: prefill it and show the connected indicator.
- Server session later expires: Add to Tronbyt opens the server login page; no
  credentials are exposed to the viewer.
- Server temporarily goes offline: the install tab fails normally, while the
  remembered address remains available to edit or clear.

Browsers do not allow a GitHub Pages site to silently inspect an authenticated
session on a different origin. Automatic authenticated checks on page load or
on a timer would require weakening cookie policy, storing a new credential in
the viewer, or opening repeated popups. The viewer therefore verifies on an
explicit user gesture and lets Tronbyt enforce authentication again whenever an
installation link is opened.

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
