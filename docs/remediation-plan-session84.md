# Remediation Plan — Session 84 / Parity Round 83: the export/print toolbar action matrix (the 55th login deploy holding through a THIRD consecutive single-generation round + the r83 close-out's first suggested frontier — the print/export/AI toolbar actions — opened for the first time: the cluster membership parity-locked 59/59 across the full route registry, the REF's cluster read almost entirely DEAD (one real Print + one blank-window stub + seven dead buttons), the clone's REAL-EXPORT superset verified end to end, ONE clone-authored defect found (R84-A the assetmanagement Export icon's missed `mr-2` — the session-14 R13-A systemic pattern's missed call site) TDD-FIXED + R84-B the payrollreports PDF upgraded from the advisory toast to the REAL `window.print()` (the session-29 print superset in one click) + the FIRST byte-compare of the r83 dark/RTL baselines (859-889) + the standing sets + the mobile-menu cycle green

**The round's motivation.** The session-83 completion record (the
theme-direction audit round) closed the theme-direction program — the two
toggle states both apps carry (dark mode + RTL) measured member-by-member,
zero clone-authored defects, the states pinned (the session83-theme spec,
5 tests). The close-out's carry-forward named this round's frontier
candidates: "the print/export toolbar actions, the form-validation error
states, the keyboard-navigation cycle — or a re-walk of the REF's
progressively-emptied tenant surfaces." The opening recon picked the
FIRST: the export/print toolbar actions — a user-facing surface the
program had NEVER audited (no census of which routes carry the cluster,
no functional probe of what the buttons DO, no pin of the recipes). The
standing PNG chains capture the buttons' happy-path rendering only; the
r81 cluster census measured the PageHeader actions WRAP classes but not
the export family's behavior; the session-14 R13-A recipe layer pinned
the iconed-button `mr-2` pattern but its call-site list was incomplete
(this round's finding).

**The session's environment note.** The workspace was RESET (the sixth
reset of the record): fresh clone @ `e75dc3f` (main, clean, remote-
matched — the r83 round commit `5ee7618` + the owner transcripts
`20180e1`/`e75dc3f`). Environment rebuilt from zero: `.env` from
`.env.example` (`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET`
generated) · `bun install` (525 packages) · `db:generate` + `db:push` +
`db:seed` (Annual 21/21, Sick 30/30) · DB pristine verified (users =
[sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0). The
exported-`DATABASE_URL` trap ACTIVE for the seventh consecutive sandbox
(`file:/home/z/my-project/db/custom.db` — the `env -u` guard per
invocation throughout; the r72 sweep needed it explicitly).

1. **THE OPENING READ: BOTH SIDES QUIET — THE 55TH HELD THROUGH A THIRD
   CONSECUTIVE ROUND; THE FULL LADDER GREEN NON-VISUAL.** The r84 watch
   (`scripts/r84-deploy-watch.mjs`, re-armed at the unchanged post-55th
   finals — the 55th was still the last observed generation) read both
   sides QUIET (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the
   app side `C-IrDy5f`/`BGNH4KkS`; the login DOM census unchanged — the
   six-button set, one form, zero Turnstile, zero iframes). Per the r83
   carry-forward, the full ladder ran as this session's opening read on
   the 55th: the fresh logged-out login pair **BYTE-IDENTICAL** to the
   standing `69aa4241…` baseline (`scripts/r84-login-probe.mjs`) +
   standing **5/5** + sweep **12/12** + verify-r49 **13/13** (the r83
   careful-retry hardening working — first try this round) + verify-r45
   **13/13** → **NON-VISUAL.** The r83 ref-re-auth protocol applied
   BEFORE the standing/sweep run (the ref session re-authed first — no
   stale-cookie trap this round); the close-out traps retired (the loc
   session re-authed as the seeded user + the stale `:3201` verify
   server killed + the r45 probe user swept by the r72 instrument).

2. **THE CODE AUDIT (the repo skills' lens — `skills/web-app-foundation`
   + the catalog): the r83 diff CLEAN, the standing checks green.** The
   r83 round's source diff (the session83-theme spec — computed-style
   assertions per §18 T8, behavior tests per §13.5, the localStorage
   state cleaned at every test's close; the verify-r49 careful-retry —
   idempotent, the lesson citation in-place) re-reviewed against the
   foundation skill's contracts: no findings. The standing checks on the
   rebuilt environment: lint 0/0 · tsc clean · **941/941 unit** · build
   OK · the standalone healthy on `:3200` (`{"status":"ok","db":"up"}`) ·
   the patch watch QUIET (16.4.2 the latest stable; the 16.5 line at
   16.5.0-canary.24) · `bun audit` UNCHANGED (the two upstream-blocked
   dev-chain advisories) · the TW-v4 scan clean (15 `!important` all
   globals.css; oklch 6/6 comments-only; zero row-level `md:flex-wrap`
   anywhere) · secrets zero.

3. **THE FRESH-EYES INSTRUMENT — THE EXPORT/PRINT TOOLBAR ACTION MATRIX
   (`scripts/r84-export-recon.mjs` + the live functional probes): the
   cluster membership parity-locked; ONE clone-authored defect (R84-A);
   the functional superset verified end to end.**

   **The membership census (the full 59-route walk, both sides):** the
   export/print cluster lives on exactly FIVE routes both sides —
   /attendance {Print, PDF, Excel} · /assetmanagement {Export} ·
   /attendancedashboard {Export Report, Export} · /payrollreports {CSV,
   PDF} · /surveyanalytics {Export} — **59/59 label-set MATCH, zero
   DIVERGE.** No route carries the cluster on one side only; no label
   differs. The cluster widths matched on every member except ONE: the
   /assetmanagement Export button — **REF 112×36 vs LOC 104×36.**

   **The functional probes (the both-sides live reads — the surface
   never measured before):**

   | Route | Action | REF behavior | LOC behavior | Class |
   |---|---|---|---|---|
   | /attendance | Print | `window.print()` — REAL | `window.print()` — REAL | PARITY |
   | /attendance | PDF | dead (nothing) | toast "Export queued…" | toast-superset |
   | /attendance | Excel | dead (nothing) | toast "Export queued…" | toast-superset |
   | /assetmanagement | Export | dead (nothing) | REAL CSV download + success toast | superset |
   | /attendancedashboard | Export Report | dead (nothing) | REAL CSV (downloadCsv) + toast | superset |
   | /attendancedashboard | Export (in-card) | dead (nothing) | REAL CSV + toast | superset |
   | /payrollreports | CSV | dead (nothing) | REAL CSV + toast | superset |
   | /payrollreports | PDF | `window.open("")` — a BLANK-WINDOW STUB | toast "Use your browser's print dialog" | divergent-stub → **R84-B** |
   | /surveyanalytics | Export | dead (nothing) | REAL CSV + toast | superset |

   **The verdict:** the REF's export cluster is 1-real + 1-stub + 7-dead;
   the clone ships REAL functional exports on every route (the CSV
   downloads) — the standing superset doctrine (match the REF's dead
   surfaces visually, supersede functionally) verified end to end for
   the first time. The login empty-submit recon (the second frontier
   candidate, checked and closed): BOTH sides ride the browser-native
   HTML5 validation (`checkValidity()` false + "Please fill out this
   field.", `form.noValidate: false`, zero custom error UI) — parity,
   nothing to remediate.

4. **R84-A — THE ASSETMANAGEMENT EXPORT ICON'S MISSED `mr-2` (the
   session-14 R13-A systemic pattern's missed call site).** The deep
   read: the REF's Export button icon carries `lucide-download w-4 h-4
   mr-2` — the `mr-2` ON TOP of the Button's `gap-2` (the 16px effective
   icon-text gap, the R13-A recipe) — while the LOC's icon renders bare
   (`lucide-download`, sized 16px by the Button component's
   `[&_svg]:size-4`), so the LOC button rides the `gap-2` alone (8px)
   and renders **104px vs the REF's 112px** (the exact 8px delta). The
   defect is ISOLATED: the same page's Add Asset button carries `mr-2`
   (134×134 both sides), the All Statuses / All Types selects match
   (176/160), and every other cluster member route-matched (93×32, 78×32,
   77×32, 97×32). The R13-A pinned call-site list (session-14:
   employees, payroll, payrollmodule, taskmanager, attendancedashboard,
   documenttracker, surveyanalytics, analyticsdashboard, advancedanalytics,
   compliancedashboard, the attendance cluster, hrreports) missed
   assetmanagement's Export — **FIX (TDD): `<Download className="mr-2"
   aria-hidden="true" />`.**

5. **R84-B — THE PAYROLLREPORTS PDF BUTTON UPGRADED TO THE REAL PRINT
   DIALOG (the session-29 print superset in one click).** The REF's PDF
   button opens a BLANK window (`window.open("")` — a broken stub, no
   document, no print). The LOC's current behavior toasts "Use your
   browser's print dialog (already print-optimized)" — honest but inert
   (the user must find Ctrl+P themselves). The session-29 R28-B/R29-C
   print superset already ships the print CSS (`@media print` rules:
   the chrome hidden, the dialogs/toasts suppressed, the tab-bar reset,
   `print-color-adjust: exact`, the `@page` margins) — the page IS
   print-optimized. **FIX (TDD): the PDF button calls `window.print()`
   directly** — one click → the browser's print dialog → "Save as PDF"
   produces the print-optimized document. This supersedes BOTH the
   REF's blank-window stub (broken) and the LOC's advisory toast
   (inert): the functional superset doctrine applied on the print axis
   (the same class as the session-29 decision — "supersede on the print
   axis instead of replicating the defect").

6. **THE CONTRACT PINS — `tests/e2e/session84-export.spec.ts` (5 tests,
   the standing-contract green-pin pattern, the behavior live-proven
   before pinning):** R84-A the assetmanagement Export geometry (112×36
   + the icon's `mr-2` member — the R13-A recipe on the last missed
   call site); R84-B the payrollreports PDF's real print dialog
   (`window.print` called on click); R84-C the cluster membership
   contract (the FIVE cluster routes' label sets on the LOC — the
   census pinned so a future edit that adds/removes an export button
   surfaces); R84-D the attendance Print parity (the one REAL action
   both sides — `window.print` on click); R84-E the toast-superset
   contract (the attendance PDF/Excel toasts — the documented superset
   for the REF's dead buttons).

7. **THE BYTE CHAINS (`scripts/r84-screenshots.mjs`, the standing
   numbers continuing 785-889 → 891+):** the FIRST byte-compare of the
   r83 dark/RTL baselines (859-889) — the dark set, the RTL set, and
   the theme drawer pairs re-captured and compared on the holding 55th;
   the standing login pair + the mobile drawer pair (the NINETEEN-round
   chain continuing to TWENTY); the 1440 route pairs + the mobile +
   the tablet re-baselines; **the mobile-menu cycle GREEN** (the
   standing user emphasis: toggle → the drawer → the Training LMS link
   → /training → the auto-close — no TW-v4 regression).

8. **THE GATES:** lint 0/0 · tsc clean · 941/941 unit · build OK ·
   **E2E 417/417 expected (the 412 standing + the 5 new)** · DB
   pristine at close (the r72 sweep) · the round-end deploy watch (the
   55th-or-newer read) · `.env.example` re-verified (the two-variable
   contract unchanged).

**Standing watches carried forward:** the deploy watch (armed at the
post-55th finals — quiet THREE full rounds; r85's opening read = the
full ladder on the 55th-or-newer), the deploy-cadence watch (three
consecutive single-generation rounds), the design-system-growth watch,
the byte chains (the nineteen-round chain + the mobile/tablet/boundary
sets + the dark/RTL sets 859-889 — byte-compared from this round), the
Next.js patch watch (16.4.2 latest stable; the 16.5 line at canary),
the Turnstile rollout (login-side, watch-only), the upstream dependency
watch, the cluster-member watch, the role-parity note (the REF tenant
progressively EMPTIED — employees AND payroll records zero; expect more
ref-side data drifts), the ref-session re-auth protocol (before every
standing/sweep run), and the NEW export-cluster contract pin (the
5-route label sets + the R13-A recipe on every iconed export button).
