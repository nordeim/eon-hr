# Session 12 — Parity round 10: header action alignment, read-only headers, page restructures

(Session record — the audit/fix cycle below is also captured in
`docs/remediation-plan-session11.md`; `docs/session_13.md` holds the prior
conversation's raw transcript, so this record lands in session_14.md.)

Baseline: workspace continuing from remote `819dc03` (the session-10 push +
its transcript). `git pull` brought in `docs/session_13.md` only. `.env`
intact (`DATABASE_URL="file:../db/custom.db"` + AUTH_SECRET), `db/` at the
repo root, install/generate/push/seed already in place. Re-validated every
gate from scratch: lint 0/0 · tsc · **194/194 unit** · build · **86/86
E2E** — the session-10 push state exactly.

## Audit (skills: code-review-and-audit methodology, agent-browser
dual-session sweep, tdd-workflow, clone-app-pat-pro extraction discipline,
avant-garde mobile-nav taxonomy A–H)

Static review clean on the session-10 diff (secret scan, no `any`/empty
catch/eval/`dangerouslySetInnerHTML`/`@ts-ignore`, `process.env` confined
to the four server seams) with one finding: the companywall composer
avatar used the unpinned `bg-gradient-to-br from-blue-500 to-indigo-500`
(trap 3 — oklab interpolation).

**Mobile navigation (the user's priority) re-verified end-to-end and
byte-identical**: top bar 73px sticky; 5 bottom tabs (every width exact);
drawer 288×844 `#FAFAFA` + `rgba(0,0,0,0.8)` overlay; Employees submenu
expansion identical; kicker geometry AND rendered scroll behavior
identical; the md boundary identical (767 mobile chrome → 800/1024
sidebar); no Tailwind v4 bug — all six traps still pinned.

The coarse 46-route sweep passed every route; a **deeper second-tier
sweep** (per-button y taxonomy, full DOM dumps, text-node geometry,
composer internals) found **18 gap groups (R10-A…R10-R)**: the reference
has TWO header-action alignment patterns (six pages ride actions on the
badge row); four headers are action-free (hrletters, surveys,
announcements, payrollengine — with payrollengine's Generate button
living in a toolbar card); attendance's Devices button is cyan-700 (the
clone used the wrong family, unpinned → oklch drift) and its Report Type
select is 192px; the companywall composer had four precision residuals;
the toast viewport geometry differs; shiftcalendar renders a standalone
month toolbar + a border-collapse table calendar + colored borderless
mini stats; recruitmentkanban is a full-width board page with five w-64
columns; the reports category selector is a white bordered wrapping pill
with icon chips; the profile identity card is a different recipe (96px
gradient circle with the circle-user icon); hrassistantchat's grid and
sidebar geometry differ; the loans/staffrequests/workflowconfigpage/
notificationpreferences empty states and furniture differ. Two systemic
findings: **every EmptyState had been 16px short** (the reference's icon
carries mb-4 — re-measured on payroll AND loans), and border-b
CardHeader titles render leading-none (16px) while regular in-card
titles keep text-base (24px).

Documented reference bugs kept as fitting supersets: the kanban page
overflows horizontally (docW 1664 at 1440 — the clone keeps the fitting
internal scroll, the same category as the attendance fitting).

## Remediation (TDD)

RED first: 22 new pins (session-11 blocks in `shell-recipes.test.ts`);
one stale session-9 R8-A pin refined (items-center remains the DEFAULT —
the six items-start pages opt in via the new `actionsStart` prop). GREEN
across page-header.tsx, toast.tsx, stat-card.tsx, empty-state.tsx,
globals.css (the cyan-700 pin) and 18 page files.

Live-verify corrections (the re-measure loop): the composer's label
group is `space-y-3` with a `block leading-5` label; Photo/Video are
GHOST buttons (the outline border added 2px); the loans CTA needed the
systemic EmptyState mb-4; the workflowconfigpage py-16 sits on the card
itself; the staffrequests CTA is the dark variant without an icon and
the card rides mt-2 under the toggle; the hrassistantchat wrapper is an
mb-6 header stack (not gap-8); hrletters' CardTitle needs leading-none;
surveys renders "%" at 0 responses (reference quirk); the
workflowconfigpage line carries a trailing period.

## Verification

- Gates: lint 0/0 · tsc · **216/216 unit** · build (exported
  DATABASE_URL unset per the AGENTS.md rule) · **86/86 E2E**.
- Live dual-browser re-verify of every fixed surface: the six
  actionsStart pages at y=32/64 exact; attendance Devices
  `rgb(14,116,144)` + select 192px; composer card 264/Photo 90/Post 93
  byte-exact; shiftcalendar toolbar y=172 + 82px stats + table; kanban
  board 5×256; reports white pill 94px + 170px chips; profile card 154px
  with the button at y=297; New Chat y=188; loans CTA y=433 w=194;
  staffrequests CTA w=207; hrletters card 204/header 65/icon 318/h3 398;
  announcements bare line y=112 h=152; payrollengine + staffrequests
  content diffs at ZERO.
- The full 47-route sweep re-run after the fixes: every route OK. Mobile
  navigation re-checked unchanged (top bar, tabs, drawer, no overflow).
- 24 screenshots refreshed via `./scripts/capture-all.sh` (production
  standalone build); DB pristine after capture (users=1, employees=1,
  leaveBalances=2).

Docs updated: AGENTS.md (216 specs + the two-pattern header taxonomy +
the session-11 recipe layer), CLAUDE.md (counts + unit description),
README.md (counts), PAD (S11 revision row), eon-hr_SKILL.md (v2.4.0 +
§23 session-11 layer), docs/remediation-plan-session11.md (+ completion
record), this session log, worklog.md.
