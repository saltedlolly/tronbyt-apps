# App Viewer and Tronbyt Server PR Readiness

Single source of truth for the coordinated work. Checked means that exact
decision or implementation is complete, not necessarily merged. The Viewer
integration stays Draft until its required server version is released.

## New-thread handoff

- Read this file and each repository's `AGENTS.md`/`CLAUDE.md` before changing
  either repository, then re-check the live PR status because reviews and
  merges may have changed since **4 October 2026**.
- Apps repository: `/Users/ollystedall/Projects/Tronbyt/tronbyt-apps`.
  `feature/app-viewer-add-to-tronbyt` is a dirty, interleaved prototype branch
  (currently 35 commits ahead of `upstream/app-viewer-source`). Preserve it and
  port only the intended files into clean PR branches; do not reset or clean it.
- Server repository: `/Users/ollystedall/Projects/Tronbyt/tronbyt-server`.
  `feature/community-app-install-link` is also a dirty, interleaved prototype.
  Preserve it and rebuild PR 5 from current upstream after #942 merges.
- PR #799 was prepared in `/tmp/tronbyt-apps-pages-workflow` on
  `ci/app-viewer-pages-build`, commit `80c0ac14a`, and is pushed to
  `saltedlolly/tronbyt-apps`. The temporary worktree may not survive a reboot;
  recreate it from the pushed branch if necessary.
- This checklist is intentionally a local, untracked handoff document. Preserve
  it, but do not accidentally include it in an upstream PR.
- Never create, publish, or update a PR title/body until the user has reviewed
  the complete proposed title and description and explicitly approved it.
- Immediate next step: collect review on Draft PR #800 and PR #799. PR #799
  must merge before PR #800 is deployed. PRs #797 and #942 are merged, so PR 5
  can now be rebuilt from current server `main` when work resumes.
- Local preview endpoints used during testing were the Viewer at
  `http://192.168.1.78:8888/app-viewer/` and the temporary server at
  `http://192.168.1.20:19192/`. Treat them as temporary and never record test
  passwords or other credentials in commits, logs, PRs or this checklist.

## Umbrel production-safety gate

- [x] Treat `ssh umbrel` as access to the user's **production machine**, not a
  disposable development host. Protect unrelated applications and user data.
- [ ] Begin with read-only inventory and health checks. Resolve an exact test
  resource to its container/Compose project, path, ports, mounts, networks and
  dependants before proposing any mutation.
- [ ] Before any significant Umbrel action, show the user the exact intended
  targets, commands, impact and recovery plan, then wait for explicit approval.
  Significant actions include stopping/restarting/removing services or
  containers; changing Compose/configuration/authentication/firewall settings;
  deleting files/data/images/volumes/networks; installing/upgrading packages;
  pruning Docker; or rebooting the host.
- [ ] Never use broad cleanup commands such as Docker system/volume/network
  prune, broad globs or recursive deletion on Umbrel. Remove only individually
  identified test resources after approval.
- [ ] Do not expose, echo, log or commit Umbrel credentials. Do not modify
  production Tronbyt, Audiobookshelf or another service merely to simplify test
  cleanup.
- [ ] For each approved mutation, check relevant service health and retained
  data before and after it; stop and report unexpected state rather than trying
  increasingly invasive repairs.

## PR order and status

- [x] Process rule: before creating or updating any PR, present its proposed
  title and complete description to the user and wait for explicit approval.
- [x] Rewrite PR #942's description to explain the multi-PR feature, final user
  experience, security boundaries, why refresh coordination must land first,
  and what this isolated PR intentionally does not include. Apply only after
  the user approves the draft.

1. [Viewer hardening #797](https://github.com/tronbyt/apps/pull/797) ->
   `app-viewer-source`. Escaping, dependency update, tests and CI. **Merged.**
2. [Server refresh coordination #942](https://github.com/tronbyt/server/pull/942)
   -> `main`. Serialized refresh/cache/error foundation. **Merged.**
3. [Apps Pages-workflow #799](https://github.com/tronbyt/apps/pull/799) ->
   `main`. Make deployment support the new Viewer. **Open and mergeable; all
   three checks passed; review pending.**
4. [Viewer catalogue/UI Draft #800](https://github.com/tronbyt/apps/pull/800)
   -> `app-viewer-source`. No server integration. **Open as Draft, mergeable;
   checks passed.**
5. Server integration PR -> `main`. Handshake, repo matching, refresh-on-miss,
   chooser and install endpoint.
6. Viewer/server integration PR -> `app-viewer-source`. Open as **Draft**; merge
   only after PR 5 ships in a server release.

## Locked decisions

- [x] Viewer sends only app slug and catalogue provenance: never source, a local
  path, password, cookie or API token.
- [x] Server resolves the slug from its own checkout and shows its own metadata,
  compatibility, installed state and previews before confirmation.
- [x] Installation always needs an intentional click, even with one device; a
  GET never submits an install POST.
- [x] Official repo or a GitHub fork is allowed only when Viewer and server
  identify the same canonical repo. Different forks must not interoperate.
- [x] Catalogue commit is diagnostic, not an exact-match requirement; the
  server may legitimately be ahead.
- [x] Cached app means no refresh. A missing app causes one coordinated refresh,
  complete cache rebuild and retry. Concurrent misses share it rather than
  queueing duplicate pulls.
- [x] Revised 5 October 2026: expose the existing 12-hour system-app refresh as
  an admin-controlled web preference in a separate Server PR. Keep it off by
  default, retain the manual Refresh action, and warn that automatic updates
  can change or break installed apps.
- [x] Broken remote README images remain visible so Report Issue remains useful.
- [x] Public URLs require HTTPS; LAN HTTP remains valid for localhost,
  loopback/private/link-local addresses, `.local`, `.home.arpa` and bare hosts.
- [ ] Decide whether install-specific CSRF ships in PR 5 or a preliminary
  server-wide CSRF PR; record the answer before review.
- [ ] Finalise protocol number and compatibility behaviour before PRs 5/6.

## PR 1 - Viewer hardening (#797)

- [x] Expand the approved PR description with the multi-part product context,
  final user flow, security boundaries and deliberately excluded follow-ups.
- [x] Escape all manifest-derived generated HTML text, attributes and URLs.
- [x] Injection tests cover scripts, closing tags, quotes, ampersands and Unicode.
- [x] Upgrade `js-yaml` 4.1.1 -> 4.3.2; lockfile updated; `npm audit` clean.
- [x] Add Viewer tests to pull-request CI.
- [x] Clean generation succeeded: 1,095 details and 597 author pages when tested.
- [x] Merge #797 before branching PR 4.

## PR 2 - Server refresh coordination (#942)

- [x] One operation mutex covers scheduled, manual, repo-change and future
  on-demand refresh callers.
- [x] Build replacement cache before atomically swapping it into service.
- [x] Propagate cache errors and return a real admin JSON refresh failure.
- [x] Add serialization/error tests; pass full tests, vet, targeted race test and
  diff check.
- [x] Address review and merge #942 before rebasing PR 5.

## PR 3 - Pages workflow (`main`)

- [x] Publish approved PR #799 from commit `80c0ac14a` with the staged-feature
  context and catalogue provenance purpose documented.
- [x] Branch from current `upstream/main`; do not change deployment only on
  `app-viewer-source`, because Actions reads the workflow from `main`.
- [x] Use `npm ci` rather than `npm install`.
- [x] Copy `readme-images.js` and every new local module into `_site`.
- [x] Smoke-test that every local script/module/style reference exists in the
  generated artifact.
- [x] Continue taking app data from `main/apps` and Viewer code from
  `app-viewer-source`.
- [x] Export canonical repo identity from the actual app-data checkout so forks
  identify themselves; export `git rev-parse HEAD` from that checkout as the
  catalogue commit (not the Viewer commit or unrelated workflow SHA).
- [x] Preserve deploy triggers for `apps/**`, `broken_apps.txt` and manual runs.
- [x] Ensure merging Viewer code into `app-viewer-source` reliably causes a new
  deployment (automatic trigger or an explicit, documented workflow-dispatch
  release step); do not wait for an unrelated future app merge.
- [x] Test official and simulated-fork builds.
- [x] Confirm artifact has no dev symlink, credentials, local URL or developer
  generated files.

## PR 4 - Viewer catalogue/UI only

### Construct and scope

- [x] Start from merged #797 and port final UI deliberately from the interleaved
  feature history.
- [x] Exclude modal, saved server, server URL code/tests, Add buttons and
  integration-only CSS.
- [x] Exclude `app-viewer/apps.json`, `app-viewer/apps` and
  `.devcontainer/devcontainer-lock.json`.
- [ ] Confirm PR 3 merged before PR 4 can deploy.

### Catalogue

- [x] Search title/name, summary/description, author, category and manifest tags.
- [x] Selected tags are non-editable search pills with remove control and proper
  spacing; remove redundant Tags dropdown.
- [x] Clicked detail tag returns with that tag selected and search still usable.
- [x] Category, readable Sort and Display (Standard / 1x, Wide / 2x, Square)
  filters compose correctly; Square selects square previews.
- [x] No square screenshot badge; Standard view shows 2x badge where applicable.
- [x] Dot overlay/Hide broken controls reflow cleanly; Hide broken creates no
  stray search clear X.
- [x] Broken cards use shared right-side warning, no yellow strip.
- [x] Preserve filters, sort, tag, broken state, loaded count and useful return
  position through details/back.
- [x] Responsive `Tronbyt App Viewer`/`App Viewer` title cannot hit a long server
  button.
- [x] Three desktop columns, two on viable wide phones/tablets, one only when
  narrow; no huge mobile previews.
- [x] Initial 60 cards plus 60 per Load more; lazy/async images; 150ms search
  debounce; no per-card Bootstrap tooltip allocation.
- [ ] Ensure filtering cannot hide not-yet-loaded matches or misstate counts.
- [ ] Verify normal Back/Forward cache and reload behaviour.

### Details, authors and README

- [x] Description directly below title in left area; no Description label.
- [x] Subtle author link/hover/focus; working author page.
- [x] Metadata never wraps one character per line; compact display label.
- [x] Display pills use Standard / 1x, Wide / 2x, Square and link to filters.
- [x] Preview badges use dimensions; include 64x32/32x64, 128x64 and 64x64;
  scale proportionally; allow one preview to appear larger.
- [x] Broken detail shows shared icon/reason, disables Add, and later uses
  disabled Already Reported behaviour.
- [x] Clickable tag pills sit above a clear README divider.
- [x] README responsive; relative/blob image URLs normalised; genuine failures
  remain visible.
- [x] Dot overlay applies only to images classified by exact supported device
  dimensions/scales, not ordinary README artwork.
- [ ] Confirm legacy author/tag deep links survive the PR split.

### Catalogue freshness/provenance

- [ ] Fetch `apps.json` and `broken_apps.txt` with `cache: "no-cache"` so each
  page load revalidates by ETag/304.
- [ ] Keep only page-lifetime memory cache; no persistent app-data storage or
  service worker.
- [ ] Expose immutable build repo identity/commit; never take them from a query.
- [ ] Older builds without provenance disable integration rather than guessing.
- [ ] Document that the static snapshot updates after successful Pages deploy,
  not on a timer; failed/disabled fork deployments can remain stale.

### Automated Viewer tests

- [x] Current Node suite passes (12/12); README classification tests pass.
- [x] Generated injection regression tests are in #797.
- [ ] Test filtering/sorting, tag-pill composition/removal, batching/count state,
  debounce, display preview choice and responsive title.
- [ ] Test malformed optional manifests do not break generation.
- [ ] Test official/fork provenance and `no-cache` requests.
- [ ] Run a clean generated-site smoke test after PR 3.

## Independent Server PR - system app automatic updates

- [x] Implemented on `feature/system-app-auto-refresh-ui` and opened as
  `tronbyt/server#944`; follow-up commit `8ca0f73` addresses CodeRabbit's
  concurrent preference-save finding and is published with a review reply.
- [x] Branch from current upstream `main` after #942/#943 in an isolated
  worktree; preserve the dirty Server integration prototype.
- [x] Add an admin-only persisted toggle under System Apps Repository, default
  off, with a warning that automatic updates can affect installed apps.
- [x] Save the preference immediately when the checkbox changes; show inline
  saving/saved/error feedback and restore the previous state if saving fails.
- [x] Keep the manual Refresh button and the fixed 12-hour interval.
- [x] Apply preference changes without a server restart and retain the
  `SYSTEM_APPS_AUTO_REFRESH` environment variable as the initial default.
- [x] Reuse #942 serialization for manual and scheduled system refreshes.
- [x] Test persistence, authorisation, runtime enable/disable, the 12-hour
  scheduler dispatch path and UI state.
- [x] Serialize preference persistence and runtime publication with one mutex,
  with a regression test proving concurrent transitions must wait.
- [x] Handle per-user custom repository automatic updates in a later,
  independent PR; keep those refreshes sequential and retain manual controls.

## PR 5 - Server integration

### Branch/code quality

- [ ] After #942 merges, branch/rebase from current upstream `main`; retain
  `quic-go` 0.63.0+ and avoid unrelated dependency changes.
- [ ] Port only server work from the dirty feature branch.
- [ ] Use focused helpers for repo identity, refresh-on-miss, compatibility,
  installed state and callbacks; review translations and documentation.
- [ ] Document `APPS_VIEWER_URL`, repo matching, HTTP policy and on-demand
  refresh.
- [ ] Document that `SYSTEM_APPS_AUTO_REFRESH` defaults false, is read at server
  startup unless a saved web preference overrides it, and first runs after 12
  hours; retain the existing admin Content -> Refresh action.

### Repository identity

- [ ] Canonicalise case-insensitive `github.com/<owner>/<repo>` from HTTPS with
  optional `.git`, SCP SSH and `ssh://git@github.com/...`.
- [ ] Reject different forks, lookalikes, non-GitHub hosts, HTTP credentials,
  unexpected ports, query/fragment and non-owner/repo paths.
- [ ] Compare Viewer repo with current `SYSTEM_APPS_REPO` during verification;
  show a safe, clear mismatch page.
- [ ] Recheck expected identity in install GET and POST in case settings change.
- [ ] Bind verified provenance to the saved connection/install link so it cannot
  be silently omitted later.
- [ ] Use commit only for diagnostics; never fetch/execute Viewer-supplied code.

### Refresh on missing

- [ ] Cached lookup performs zero refreshes.
- [ ] Missing lookup enters shared coordinator and rechecks after waiting or
  acquiring, preventing sequential duplicate pulls after #942's mutex unlocks.
- [ ] One pull/cache rebuild serves all concurrent misses, then each retries.
- [ ] Add/document success and failure cooldowns against public-server Git DoS.
- [ ] Admin Refresh may deliberately override cooldown but shares the mutex.
- [ ] Preserve usable checkout/cache on pull/parse failure where possible.
- [ ] Success-but-missing gets a specific unavailable page; failure gets a safe
  retry action without paths, Git credentials or tokens.
- [ ] Decide normal loading vs lightweight `Updating app catalogue…`; avoid
  polling complexity unless measured latency needs it.
- [ ] Log identity, outcome, duration and waiting, never secrets.

### Authentication/verification

- [x] Validate protocol/high-entropy state; trusted callback only; no-store and
  no-referrer response.
- [x] Public callback HTTPS and defined LAN HTTP policy implemented locally.
- [ ] Preserve pending return through password, passkey, OIDC, single-user and
  registration/login paths.
- [ ] Viewer-specific login text appears only for pending verification.
- [ ] Complete verification and close new tab where permitted; same-window or
  failed-close path shows Return to App Viewer.

### Add page

- [x] Top has no summary or Supported Displays; responsive 2:1 layout with
  title/description left and Author/Published/Updated right.
- [x] Content-width cards sit side-by-side and wrap; title/smaller summary top,
  proportional actual-device preview centred, device text aligned at bottom.
- [x] Support Standard / 1x, Wide / 2x, Square and future sizes proportionally.
- [x] All devices remain visible; incompatible disabled with explanation;
  installed devices show Installed badge.
- [x] One device still requires an explicit click; no `requestSubmit()`.
- [ ] Simplify installed detection if a helper is clearer/cheaper.
- [ ] Audit disabled/incompatible/installed keyboard, reader, hover and contrast.

### Server tests

- [x] Local feature tests cover callback, state, unknown/owned device, broken and
  incompatible apps, install creation and no auto-submit.
- [ ] Accept matching official/fork URL variants; reject mismatch/lookalike/
  credentials/ports/query/fragment in verification, GET and POST.
- [ ] Zero refresh for cached app; one for stale app; one total for concurrent
  misses; cooldown for repeated fake slugs.
- [ ] Refresh/pull/parse failure preserves usable state and creates nothing.
- [ ] All refresh paths share coordinator without deadlock/race.
- [ ] Reject traversal, encoded separators, dot/empty segments and unexpected
  Unicode app slugs.
- [ ] Repo change between GET/POST prevents installation.
- [ ] Test CSRF/state according to decision; forged/missing state creates nothing.
- [ ] Test invalid callbacks and all password/passkey/OIDC/single-user/
  registration return paths.
- [x] LAN/public HTTP policy tests exist locally.
- [ ] Final: full tests, targeted race tests, vet, govulncheck and diff check.

## PR 6 - Viewer/server integration (Draft)

### Modal/connection

- [x] Verify strips pasted page paths such as `/auth/login` to server origin.
- [x] URL validation handles LAN HTTP/public HTTPS policy; current tests pass.
- [ ] Send immutable build repo identity/commit; save verified URL, protocol and
  canonical repo; force legacy/mismatched records to reverify.
- [ ] Store no passwords, cookies, tokens or secret-bearing responses.
- [ ] Link `Tronbyt Server vX.Y.Z` to official releases in new tab; remove Update
  Tronbyt Server button.
- [ ] Waiting text: `Continue in the new tab. Sign in to Tronbyt if asked; and
  then return here when you are done.`
- [ ] Popup failure says Unable to complete verification and offers `Sign in to
  Tronbyt Server`, without browser-internals wording.
- [ ] Clear/Verify precede fallback status; Cancel bottom-left, Try Again
  bottom-right; Try Again restarts Verify safely.
- [ ] Successful popup closes; same-window fallback has explicit return link.
- [ ] Long server label never collides with responsive Viewer title.

### Integration controls/tests

- [ ] Create install links only after repo-aware verification; safely encode
  slug, repo identity and diagnostic commit.
- [ ] Add disabled for manifest-broken apps.
- [ ] Rename Report Broken -> Report Issue everywhere; already-broken report is
  disabled with shared icon and `Already Reported` hover/focus title.
- [ ] Controls work on cards, details and author pages without fragile repeated
  modal markup.
- [ ] Replace `v2.x.x` only after server release number is known.
- [ ] Test same official/same fork success, mismatches, legacy connection,
  encoded URL, popup success/block/cancel/retry and state mismatch/expiry.

## Manual end-to-end matrix

- [ ] Chrome, Firefox, Safari, Edge; Arc normal and Little Arc genuinely logged
  out and cache-cleared.
- [ ] Popup allowed closes after login; blocked popup/same window returns.
- [ ] Password, passkey, OIDC, single-user and registration authentication.
- [ ] Private IP, localhost, `.local`, `.home.arpa`, bare LAN, IPv6 and public
  HTTPS; public HTTP rejected; reverse proxy callback/cookie behaviour checked.
- [ ] With Freedom.to enabled, use Network tools to identify/eliminate the
  reported unintended background request (including any YouTube request).
- [ ] Standard/Wide/Square/broken/tag/author flows at narrow phone, wide-phone
  two-column, tablet, desktop, very wide and long translated text.
- [ ] Keyboard, visible focus, modal trap/return, screen reader, reduced motion
  and contrast.
- [ ] Valid README images load, broken remain visible, only device screenshots
  receive dots.
- [ ] Back restores filters/sort/load depth/scroll after several batches.
- [ ] Initial browsing avoids all-image download; compare DOM nodes, bytes,
  filter time and scrolling with unbatched version.
- [ ] Install page: zero/one/two/many mixed devices, compatible/incompatible/
  installed/future size; alignment, wrapping and preview proportions.
- [ ] Cached app no refresh; newly merged app one refresh; several simultaneous
  misses one pull; offline/nonexistent errors preserve existing apps.
- [ ] Device choice opens existing config flow; cancellation creates no orphan.

## Security/privacy gate

- [x] Generated metadata escaping covered by #797.
- [x] README sanitised with DOMPurify; image classification does not bypass it.
- [x] Server uses only its configured local source checkout.
- [ ] Add `referrerpolicy="no-referrer"` to external README images.
- [ ] Decide/file follow-up for pinning/vendoring `marked`, DOMPurify, Bootstrap,
  SRI and/or CSP.
- [ ] Re-audit final generated HTML/URL sinks and refresh DoS exposure.
- [ ] Confirm logs, errors, storage, artifacts, commits and PR text contain no
  passwords, tokens, private credentials or preview-server secrets.
- [ ] Confirm Report Issue URL construction is safe and external links use safe
  target/rel behaviour.

## Release and cleanup

- [ ] Merge PRs 1-4 in dependency order without folding unrelated changes in.
- [ ] Merge PR 5 and release server; record exact minimum version in PR 6 and
  remove every `v2.x.x` placeholder.
- [ ] Test PR 6 against released build, keep Draft until release, then run final
  clean-checkout generated-site/end-to-end smoke tests.
- [ ] Verify every PR target, file list, history and dependency version.

### Final housekeeping (only after the associated testing is complete)

- [ ] Inventory temporary infrastructure before deleting anything: record the
  exact container/service, compose project, image, volume, network, listener,
  process and owning path so production services are not mistaken for tests.
- [ ] On Umbrel (`ssh umbrel`), stop and remove the temporary Tronbyt preview at
  `192.168.1.20:19192`, including only its confirmed test containers and
  test-only data. Remove unused test images/volumes/networks only after checking
  that no production Tronbyt, Umbrel or Audiobookshelf service references them.
- [ ] Confirm normal Umbrel services, especially the real Tronbyt installation
  and Audiobookshelf, remain healthy after preview cleanup.
- [ ] On the local machine, stop and remove the temporary Viewer service at
  `192.168.1.78:8888`; confirm the previously removed `:8889` service has not
  returned. Remove their startup/Compose configuration and test-only artifacts
  after resolving each listener to its owner.
- [ ] Remove temporary test users/passwords, dummy devices, installed test app
  copies and other preview data from test instances; never put credentials in
  this document, shell output, commits or PRs.
- [ ] Clear saved Viewer server records and test-only cookies/local storage from
  browsers used for verification, without clearing unrelated browser data.
- [ ] Remove build staging directories, generated test catalogues and dependency
  directories that are no longer needed; retain any evidence needed to address
  an open review.
- [ ] Remove temporary worktrees and merged/abandoned local and fork branches,
  including `/tmp/tronbyt-apps-pages-workflow`, only after verifying every
  required commit is pushed or merged.
- [ ] Remove the prototype `app-viewer/apps` symlink and unwanted generated
  files such as local `apps.json`/devcontainer lock changes only after all useful
  work has been ported. Preserve both dirty feature branches until then.
- [ ] Run a final container/process/port/worktree/status audit on Umbrel and the
  local machine; verify no preview listener, test container, credential, dummy
  data or accidental untracked build output remains.
- [ ] Keep this checklist until every cleanup item is confirmed. Archive or
  delete it only with the user's approval because it is untracked and is the
  cross-thread source of truth.

## Non-blocking follow-ups - file or explicitly decline

- [ ] Proxy-aware `Secure` session-cookie scheme detection.
- [ ] Configurable cookie name for servers on different ports of one hostname.
- [ ] Server-wide CSRF middleware if not a prerequisite.
- [ ] Compact catalogue/detail-on-demand if measurement still shows JSON cost.
- [ ] Split `main.js` into connection/catalogue/detail modules after stability.
- [ ] Consolidate repeated modal markup without making deployment fragile.
