# Remediation plan — session 57 (parity round 56)

> The round-55 frontier said the history-journey family is censused and
> the Next.js history bug is recorded upstream. This round's census took
> the interaction dimension to the layer every census SEES but never
> presses — **the affordance-stub family** (buttons that fire info toasts
> in the clone where REF opens real dialogs / hidden file inputs, plus two
> invented profile tab interiors). All contracts live-measured this window
> (REF @1440×900 vs the seeded LOC :3200 standalone,
> `scripts/r57-census.mjs` — pre-fix **0/6 MATCH**).

## The round's context

- Workspace re-cloned from `a43972e` (the prior session's R57 work was
  lost uncommitted in a workspace reset — this round REDOES it from the
  round-55 landed state). Environment re-seeded (`.env` with
  `DATABASE_URL="file:../db/custom.db"` + AUTH_SECRET; the shell's
  exported `DATABASE_URL=file:/home/z/my-project/db/custom.db` trap hit
  once — unset, documented AGENTS.md rule — db re-created inside the repo).
- Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · **806/806 unit** ·
  build ✓ · **269/269 E2E** (1 dialog-interiors R37-C timing flake,
  10/10 green in isolation — the documented round-54 family).
- The skills audit (Phase 2): the session-56 delta (on-remote state) was
  audited clean at landing; the structural counts verified current
  (62 page files / 54 API files / 47 models / 806 / 269); scandihaven
  (the tech-stack model) unchanged (`d4789c3`).
- The deploy watch: **the login side deployed again** — login JS
  `C2ujlke6` → `DEszsFDJ` (CSS `D5oCh2kx` unchanged; the app side
  `C-IrDy5f`/`BGNH4KkS` unchanged). Per protocol the login re-audit ran:
  **verify-r45 13/13 MATCH** — the deploy is a non-visual rebuild (the
  login deploys keep rolling; the surface holds). The confirmation ladder
  green after REF session re-auth (the stale-session DIFF pattern of the
  r56 record): standing **5/5** + route sweep **12/12** +
  **verify-r49 13/13** + **verify-r45 13/13**.

## THE AFFORDANCE-STUB CENSUS (the record — pre-fix 0/6)

`scripts/r57-census.mjs`, paired live at 1440×900, five phases:

- **(A) the employees "Import CSV"** — REF opens a real **"Bulk Import
  Employees"** dialog (`max-w-5xl max-h-[90vh] overflow-y-auto`): h2
  `text-2xl flex items-center gap-2` + `lucide-file-spreadsheet w-6 h-6
  text-blue-600`; the info Alert ("How to import employees:" + a 4-step
  `list-decimal list-inside` ol); the `w-full` outline "Download CSV
  Template" button (`lucide-download w-4 h-4 mr-2`); the dropzone
  (`border-2 border-dashed border-slate-300 rounded-lg p-8 text-center
  hover:border-slate-400 transition-colors` — hidden `#csv-file` input +
  `cursor-pointer` label + `lucide-upload w-12 h-12 mx-auto mb-4
  text-slate-400` + the p pair); the footer (`flex justify-end gap-3 pt-4
  border-t border-slate-200` + outline Cancel) + the X close. Post-upload:
  the dropzone's first p swaps to the FILENAME and a "Process File"
  button appears (→ "Processing..." disabled → the destructive
  "Validation Errors:" Alert on parse failure). REF's template blob is
  the 7-column `full_name,email,job_title,start_date,phone,department_id,
  template_id` with 2 sample rows. **REF's own "Process File" is broken**
  (fails "Failed to parse CSV file. Please check the format." on the
  template's own format — measured live). The clone fires an info toast —
  a stub.
- **(B) the company wall "Photo"** — REF's button triggers a hidden
  `#media-upload` file input (`accept="image/*,video/*"`, class
  `hidden`); the Video button rides the same input. The clone's
  Photo/Video fire "Attach coming soon" toasts — stubs.
- **(C) the settings Integrations "WhatsApp … Connect"** — REF opens a
  real **"Configure WhatsApp API"** dialog (`max-w-lg`): h2 `text-lg
  font-semibold leading-none tracking-tight`; form `space-y-4` with 3
  `space-y-2` fields — "API Key" (PH "Enter your WhatsApp API key",
  required), "Phone Number (with country code)" (PH "+966XXXXXXXXX",
  required), "Webhook URL (Optional)" (PH "https://your-webhook.com");
  footer `flex justify-end gap-3` outline Cancel + primary "Save
  Configuration"; the X close. REF's Save closes silently (no tile state
  change, no toast — measured). **SMS Gateway "Configure" and ZKT
  "Connect" are no-ops on REF too** (measured: no dialog) — the clone's
  info toasts there are the standing REF-parity stubs, unchanged.
- **(D) the profile "Social Accounts" tab** — REF renders a
  **"Connected Accounts"** card (border-slate-200 CardHeader/CardBody
  split) with a `space-y-4` set of 4 `flex items-center gap-4` rows, each
  a 48px icon tile + label + URL input: LinkedIn (`w-12 h-12 bg-blue-100
  rounded-lg` + `lucide-linkedin w-6 h-6 text-blue-600`, "LinkedIn
  Profile", PH "https://linkedin.com/in/yourprofile"), Twitter
  (`bg-sky-100` + `lucide-twitter text-sky-600`, "Twitter Profile", PH
  "https://twitter.com/yourusername"), GitHub (`bg-slate-100` +
  `lucide-github text-slate-700`, "GitHub Profile", PH
  "https://github.com/yourusername"), Facebook (`bg-blue-100` +
  `lucide-facebook text-blue-700`, "Facebook Profile", PH
  "https://facebook.com/yourprofile"); footer `flex justify-end` +
  "Save Accounts" (`lucide-save w-4 h-4 mr-2`). The clone's tab is
  INVENTED (a Google/Microsoft/Slack "Connect" row list + "Social
  sign-in coming soon" toasts — never REF-verified).
- **(E) the profile "Preferences" tab** — REF renders TWO cards: the
  **"Notification Preferences"** card (form `space-y-6` > `space-y-4`
  with 2 `flex items-center justify-between p-4 bg-slate-50 rounded-lg`
  rows — "Email Notifications"/"Receive notifications via email" and
  "Push Notifications"/"Receive push notifications in browser", both
  Switches CHECKED by default + the footer `flex justify-end`
  type=submit "Save Preferences" `lucide-save w-4 h-4 mr-2`) and the
  **"Danger Zone"** card (`border-red-200 dark:border-red-900` frame,
  title `text-red-600 dark:text-red-400`, h4 "Delete Account" +
  "Once you delete your account, there is no going back. Please be
  certain." + the destructive `bg-destructive` "Delete My Account"
  button `lucide-trash2 w-4 h-4 mr-2`). Pressing Delete opens the
  **confirmation dialog**: h2 `text-red-600` "Delete Account", the
  destructive Alert ("This action cannot be undone. This will
  permanently delete your account and remove your data from our
  servers."), label `Type "DELETE" to confirm` + Input PH "DELETE",
  footer `flex flex-col-reverse sm:flex-row sm:justify-end
  sm:space-x-2` (outline Cancel + destructive "Delete Account",
  disabled until DELETE typed) + the X close. The clone's tab is the
  duplicate-`value="preferences"` structural bug: the session-15
  language/timezone "General Settings" artifact (never REF-interior-
  verified — REF has no language/timezone card anywhere on /profile)
  mounted as a second preferences panel, while the real preferences
  panel renders the notification toggles — and neither matches REF's
  recipe.

## The remediation (TDD — red first, then the fixes)

| ID | Fix | File(s) | Pin |
|----|-----|---------|-----|
| R57-A | The Import CSV button opens REF's verbatim "Bulk Import Employees" dialog + the WORKING superset flow: template download (REF's exact 7-column blob), file pick (filename swap + "Process File" → "Processing..."), client-side CSV parse → per-row validation → review table → Import → `POST /api/employees/import` (admin/hr gate, full_name split → firstName/lastName, email/job_title/start_date required, the destructive "Validation Errors:" Alert on failure) | new `src/components/shared/bulk-import-dialog.tsx`; `src/app/(app)/employees/page.tsx` (the toast stub → the dialog); new `src/app/api/employees/import/route.ts` | unit (the dialog source recipe + the API contract) + E2E computed |
| R57-B | The wall Photo/Video buttons trigger the hidden `#media-upload` input (`accept="image/*,video/*"`); the picked file previews in the composer and rides the post as multipart FormData; `POST /api/posts` accepts multipart, stores the file under `db/uploads/`, sets `mediaUrl`; new `GET /api/media/[name]` serves by extension; the post card renders the media | `src/app/(app)/companywall/page.tsx`; `src/app/api/posts/route.ts`; new `src/app/api/media/[name]/route.ts` | unit + E2E computed |
| R57-C | The WhatsApp tile's Connect opens REF's verbatim "Configure WhatsApp API" dialog; Save persists to the new `Integration` model + a success toast (the superset — REF's save is silent); SMS/ZKT keep the REF-parity stubs | `src/app/(app)/settings/page.tsx` (IntegrationsTab); new `src/components/shared/whatsapp-dialog.tsx`; new `src/app/api/integrations/whatsapp/route.ts`; `prisma/schema.prisma` (the `Integration` model — 48 models) | unit + E2E computed |
| R57-D | The Social Accounts tab rebuilt to REF's verbatim "Connected Accounts" 4-field URL form; "Save Accounts" persists to 4 new User fields via `PATCH /api/profile`; the invented Google/Microsoft/Slack list removed | `src/app/(app)/profile/page.tsx`; `prisma/schema.prisma` (User + linkedinUrl/twitterUrl/githubUrl/facebookUrl); `src/app/api/profile/route.ts` | unit + E2E computed |
| R57-E | The Preferences tab rebuilt to REF's verbatim two-card recipe (the notification rows + Save Preferences persisting `pushEnabled`; the Danger Zone + the DELETE-typed confirmation dialog deleting the account via `DELETE /api/profile`); the language/timezone artifact removed (the duplicate-`value=` structural fix) | `src/app/(app)/profile/page.tsx`; `prisma/schema.prisma` (NotificationPreference + pushEnabled); `src/app/api/profile/route.ts` (DELETE); `src/app/api/notification-preferences/route.ts` (pushEnabled) | unit + E2E computed |
| R57-p | The palette pins: the **sky** family (bg-sky-100/text-sky-600 — unpinned, v4 oklch drift renders them in lab()) and **red-200/400/800/900** (the Danger Zone frame) | `src/app/globals.css` | unit (the globals pins) |

Superset notes (the best-judgment decisions on REF's broken/silent
parts): the import flow is fully working in the clone (REF's own Process
File fails on its own template — measured); the wall media upload is
fully working (REF exposes the input but the post-with-media path is
unreachable in measurement); the WhatsApp save persists with a toast
(REF's save is silent). All three keep the at-rest recipe byte-identical
to REF.

## Validation

- The plan validates against the codebase: the five fix targets are the
  exact live-measured surfaces; no existing pin asserts the old stub
  behaviors (the R19-F employees pin reads the Import CSV button's
  presence — the dialog rides behind it; the R14-B/E profile pins read
  the tab TRIGGER set — unchanged; the wall pins read the at-rest
  composer — unchanged).
- Post-fix: the full gate stack (lint → tsc → 806+ unit → build → 269+
  E2E) + the census re-run (expected 6/6 MATCH) + the DB pristine check.

## Completion record (2026-10-18, end of session 57)

All five fix-target findings closed with TDD (RED → GREEN — 7 unit
pins RED-first at 806 → 813 GREEN), the full gate stack green, and
the post-fix census at the target:

- **R57-A ✓** — the Bulk Import Employees dialog
  (`src/components/shared/bulk-import-dialog.tsx`): REF's verbatim
  at-rest recipe + the working superset flow (the template blob,
  the filename swap + Process File → "Processing..." states, the
  client-side parse, per-row validation with the destructive
  "Validation Errors:" alert, the review table, the Import →
  `POST /api/employees/import` round-trip). Census (A) MATCH; the
  E2E round-trip pins the whole flow.
- **R57-B ✓** — the wall's hidden `#media-upload` input (the
  shared Photo/Video trigger) + the preview, the multipart post,
  `db/uploads/` storage, the path-guarded `/api/media/[name]`
  serve-by-extension route, and the media on the post card. Census
  (B) MATCH; the E2E round-trip pins the served content-type.
- **R57-C ✓** — the Configure WhatsApp API dialog
  (`src/components/shared/whatsapp-dialog.tsx`): REF's verbatim
  recipe (with `tracking-tight` on the title — REF's measured class
  string) + the persistence to the new `Integration` model (48
  models) + the success toast. Census (C) MATCH.
- **R57-D ✓** — the Connected Accounts card: the 4 icon-tile rows
  with REF's labels/placeholders + the Save Accounts footer; the
  invented Google/Microsoft/Slack list removed; the save persists
  to the 4 new User fields. Census (D) MATCH (the computed sky tile
  rgb(224, 242, 254) — the R57-p pin).
- **R57-E ✓** — the two-card Preferences recipe (the 2
  bg-slate-50 toggle rows + Save Preferences; the red-framed Danger
  Zone + the DELETE-typed confirmation dialog) + the superset
  (pushEnabled, `DELETE /api/profile` with the explicit relation
  walk, the full deletion round-trip). The language/timezone
  artifact REMOVED (the duplicate-`value=` structural fix; the
  R14-E pin inverted to the REF-verified truth). Census (E) + (E-d)
  MATCH — including the plain-div title recipe (REF's profile-tab
  cards carry `font-semibold leading-none tracking-tight`, not the
  app-wide CardTitle pattern, and NO description line).
- **R57-p ✓** — the sky family + red-200/400/800/900 palette pins
  (the oklch-drift trap — bg-sky-100 computed rgb(224, 242, 254)).

Gates at completion: lint 0/0 · tsc ✓ · **813/813 unit** (+7) ·
build ✓ · **276/276 E2E** (+7 — no flakes) · post-fix census
**6/6 MATCH** · DB pristine (1/1/2) · 428 screenshot files (+10) ·
`.env.example` verified (keys match the codebase — unchanged this
round: only DATABASE_URL + AUTH_SECRET are read). Code batch pushed
at the first green stack (`2a636d9` via the ssh wrapper + the
paramiko shim + the EXPLICIT `--remote git@github.com:nordeim/
eon-hr.git`; remote verified == HEAD; the operator key shredded);
this docs layer rides the follow-up commit.

Accuracy notes for the record: (1) the round was executed twice —
the prior session's identical-named work was lost uncommitted in a
workspace reset; every recipe above was re-measured live this
window (no measurement was trusted from the lost session). (2) The
census needed three instrument fixes before its pre-fix 0/6 was
trustworthy (the Radix pointer-event lesson, the eval-comment
lesson, the two-parse state-read lesson — see §session_115). (3)
REF's own import Process File and the WhatsApp Save are broken /
silent live — both recorded as the measured baseline for the
superset decisions.
