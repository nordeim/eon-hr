# Session 115 (2026-10-18) — parity round 56: the affordance-stub family

> The round-55 frontier said the history-journey family is censused
> and the Next.js history bug is recorded upstream. This round's
> census took the interaction dimension to the layer every census
> SEES but never presses — **the affordance-stub family** (buttons
> that fire info toasts in the clone where REF opens real dialogs /
> hidden file inputs, plus two invented profile tab interiors).
> Pre-fix: **0/6 MATCH** — five real gaps. Post-fix census:
> **6/6 MATCH**. The round was executed twice: the prior session's
> completed R57 work was lost uncommitted in a workspace reset —
> this round redid it from the landed round-55 state (`a43972e`),
> re-measuring every recipe live (nothing was trusted from the lost
> window).

## What the round delivered

- **The deploy watch: the login side deployed again** — login JS
  `C2ujlke6` → `DEszsFDJ` (CSS `D5oCh2kx` unchanged; the app side
  `C-IrDy5f`/`BGNH4KkS` unchanged). Per protocol the login re-audit
  ran: **verify-r45 13/13 MATCH — a non-visual rebuild** (the login
  deploys keep rolling; the surface holds). The confirmation ladder
  green after the REF session re-auth (the stale-session DIFF
  pattern of the r56 record): standing audits **5/5** + route sweep
  **12/12** + **verify-r49 13/13** + **verify-r45 13/13**.
- **R57-A — the employees Import CSV**: REF's real "Bulk Import
  Employees" dialog restored verbatim (the max-w-5xl recipe: the
  file-spreadsheet icon title, the 4-step info alert, the w-full
  template button, the dashed dropzone, the Process File →
  "Processing..." states, the Cancel/X footer) + the WORKING
  superset REF lacks (REF's own Process File fails on its own
  template's format — measured live): the exact 7-column template
  blob, the client-side parse, per-row validation with REF's
  destructive "Validation Errors:" alert, the review table, and
  `POST /api/employees/import` (admin/hr gate, full_name split,
  duplicate-email skip, the honest created/skipped summary).
- **R57-B — the wall Photo/Video**: REF's hidden `#media-upload`
  input (one shared input, `accept="image/*,video/*"`, class
  `hidden`) + the working media superset: the composer preview, the
  multipart post, `db/uploads/` storage, the path-guarded
  serve-by-extension `GET /api/media/[name]`, and the media on the
  post card.
- **R57-C — the WhatsApp Connect**: REF's real "Configure WhatsApp
  API" dialog verbatim (the 3 fields + placeholders + required pair,
  the Cancel/Save Configuration footer) + the superset persistence
  (the new `Integration` model — the schema is at **48 models**;
  REF's own Save closes silently with nothing stored, measured).
  SMS/ZKT stay the REF-parity no-op stubs (measured: no dialog on
  REF either).
- **R57-D — the profile Social Accounts tab**: REF's
  "Connected Accounts" card restored verbatim (the 4 icon-tile rows
  — LinkedIn/Twitter-sky/GitHub/Facebook — with REF's labels,
  placeholders, and the Save Accounts footer); the invented
  Google/Microsoft/Slack list removed; the save persists to the 4
  new User fields.
- **R57-E — the profile Preferences tab**: REF's two-card recipe
  restored verbatim (the Notification Preferences card with the 2
  bg-slate-50 toggle rows + Save Preferences; the red-framed Danger
  Zone with the DELETE-typed confirmation dialog); the R14-E
  language/timezone artifact REMOVED (the duplicate
  `value="preferences"` structural bug — REF has no
  language/timezone card anywhere on /profile) + the superset:
  `pushEnabled` persisted, `DELETE /api/profile` with the explicit
  relation walk, and the full deletion round-trip (signup → delete →
  /login).
- **R57-p — the palette pins**: the sky family (bg-sky-100 /
  text-sky-600 rendered in lab() — the v4 oklch drift trap) +
  red-200/400/800/900 (the Danger Zone frame).

## The instrument lessons (transferable)

1. **A bare eval `.click()` on a Radix TabsTrigger fires no
   `pointerdown` and the tab never activates** — the census's
   tab-interaction phases must use the browser's REAL click path
   (snapshot ref → `agent-browser click`). The first two census
   runs silently compared the General tab on both sides (false
   MATCHes).
2. **`//` comments inside a census eval template swallow the rest
   of the expression** when the newlines collapse to spaces (the
   one-line join for the shell command) — keep eval templates
   comment-free; the (D) phase failed with "Unexpected end of
   input" until the comment was removed.
3. **The two-parse `ev()` wrapper ERR-wraps bare-string returns**
   (the session-56 §instrument lesson, re-learned) — every state
   read must return JSON, or the string-equality check never
   matches.
4. **The exported-`DATABASE_URL` trap re-fires per tool-call** (a
   shell unset does not persist across the tool boundary) — prefix
   every db-touching command with `unset DATABASE_URL` or
   `env -u DATABASE_URL`, or the push/seed quietly writes outside
   the repo (hit once this round: the schema-update push landed in
   a stray `/home/z/my-project/db/custom.db`; re-pushed clean and
   verified by table inspection).

## Gates

lint 0/0 · tsc ✓ · **813/813 unit** (+7, RED-first) · build ✓ ·
**276/269+7 E2E** (+7, no flakes) · post-fix census **6/6 MATCH** ·
DB pristine (1 user / 1 employee / 2 balances) · 428 screenshot
files (+10: the 254-257 pairs + the 2 LOC superset evidence
captures) · the code batch pushed at the first green stack
(`2a636d9` via the ssh wrapper + the paramiko shim + the explicit
`--remote git@github.com:nordeim/eon-hr.git`; remote verified ==
HEAD; the operator key shredded).

## The frontier after this round

The affordance-stub family is censused and closed; the clone is now
a functional superset on all five surfaces (the import, the media,
the WhatsApp config, the social links, the account deletion — all
persisted where REF's own flows are broken or silent). Open
items: the Next.js 16.4.0 history bug (the upgrade watch — the one
recorded functional divergence whose fix lives upstream), the login
build stays under ACTIVE development (the deploys keep rolling —
the watch stays armed), the remaining with-data superset surfaces
stay REF-unmeasurable at the shared demo's zero state, and the
byte-parity backlog remains documented-allowance territory.
