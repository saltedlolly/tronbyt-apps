# Tronbyt Server connection test matrix

The viewer and Tronbyt Server are different web origins. Authentication is
therefore verified through a user-initiated new tab and redirect; the viewer
must never receive a password, session cookie, API key, username, or device
data.

## Address validation

- Empty address: show an error and do not open a new tab.
- Hostname without a scheme: assume HTTPS.
- HTTP and HTTPS base origins: accept.
- Address containing credentials: reject.
- Non-HTTP scheme: reject.
- Address containing a path, query, or fragment: reject.
- Local address while off the relevant LAN: show a persistent connection error.

## Authentication and verification

- Tronbyt Server reachable and already signed in: the new tab returns to the
  same App Viewer page with the server saved and install buttons visible.
- Tronbyt Server reachable but signed out: the new tab shows the normal server
  login page and resumes the connection automatically after sign-in.
- Incorrect server or unrelated website: only the new tab fails; the original
  viewer remains open and the address is not saved.
- New tab blocked: leave a visible Continue to Tronbyt Server link; do not save
  the address until a valid callback is received.
- New tab closed by the user: leave the original viewer unchanged.
- Callback with the wrong or expired one-time state: reject it and ask the user
  to verify again.
- Successful verification after password, passkey, or OIDC login: resume the
  pending connection and return to the viewer.
- Clear: forget the verified address and immediately hide install buttons.

## Returning visits and outages

- Previously verified address: prefill it and show the connected indicator.
- Server session later expires: Add to Tronbyt opens the server login page; no
  credentials are exposed to the viewer.
- Server temporarily goes offline: the install tab fails normally, while the
  remembered address remains available to edit or clear.

Browsers do not allow a GitHub Pages site to silently inspect an authenticated
session on a different origin. Automatic authenticated checks on page load or
on a timer would require weakening cookie policy or storing a new credential in
the viewer. The viewer therefore verifies on an
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
