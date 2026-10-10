# Session 11 — Parity round 9: centered headers, companywall feed, training restructure, StatCard variant map, attendance toolbar, 404 page

(Session record — the audit/fix cycle below is also captured in
`docs/remediation-plan-session10.md`; `docs/session_11.md` holds the prior
conversation's raw transcript, so this record lands in session_12.md.)

Baseline: workspace continuing from remote `4b6ed98` (the session-9 push +
its transcript). `git pull` brought in `docs/session_11.md` only. `.env`
intact (`DATABASE_URL="file:../db/custom.db"` + AUTH_SECRET), `db/` at the
repo root, install/generate/push/seed already in place. Re-validated every
gate from scratch: lint 0/0 · tsc · **164/164 unit** · build · **86/86
E2E** — the session-9 push state exactly.

## Audit (skills: code-review-and-audit methodology, agent-browser
dual-session sweep, tdd-workflow, avant-garde mobile-nav taxonomy A–H)

Static review clean on the session-9 diff (secret scan, no `any`/empty
catch/eval/`dangerouslySetInnerHTML`/`@ts-ignore`, `process.env` confined
to the four server seams, zero unpinned gradients in `src/`).

**Mobile navigation (the user's priority) re-verified end-to-end and
byte-identical**: top bar 73px sticky; 5 bottom tabs (61px items, active
`rgb(37,99,235)`); drawer 288×844 `#FAFAFA` + `rgba(0,0,0,0.8)` overlay;
Employees submenu expansion identical; kicker geometry AND rendered scroll
behavior identical (both sides' kicker scrolls away — the reference's
sticky is still inert); the md boundary (767/800) identical; dashboard
mobile cards identical. **No Tailwind v4 bug present.**

The deeper content-area sweep found **six gap groups** (R9-A…R9-F): the
centered headers centered at their own content width (152–327px off the
reference's 848 content center — a session-9 verification blind spot);
companywall is a narrow max-w-3xl feed (768px) with a different composer;
training carries a header button the reference doesn't have, shadcn tabs
instead of bare dark/outline buttons, a CardHeader instead of the bare
24px H2 row, and the full empty state instead of the simple variant;
**the reference renders EIGHT per-page StatCard variants** (the session-6
recipe was a 2-page generalization — 14 clone pages rendered the wrong
one); attendance has a seven-button header cluster (mixed sizes/colors),
a Report Type toolbar, and no more leading-[2]; and unmatched routes
render a styled in-shell 404 (72px) vs the Next default.

**Documented reference bugs (kept as the fitting superset):** the
reference's attendance page overflows horizontally at 1440 (docW 1558) —
the clone keeps the one-line title and wraps the cluster; its stat row
and toolbar are 1238px wide (also overflowing) — the clone fits at 1120.

## Remediation (TDD)

RED first: 30 new pins (session-10 blocks in `shell-recipes.test.ts` +
`recipes.test.ts` — the centered flex-1, companywall wrapper + composer,
training H2 row + tabs + simple empty state + no header actions, the
eight-variant StatCard map + per-page matrix, attendance buttons +
toolbar + no leading-[2], the not-found block) and one stale session-5
pin inverted (the attendance tall-title quirk). GREEN across
page-header.tsx, stat-card.tsx (the variant map), 20 page files, and the
new not-found.tsx.

Live-verify corrections (the re-measure loop): mini/mini-centered/no-tile
must not render the icon tile; the compact value drops mb-1; the
training card interior is p-0; companywall rows 2-3 indent to the
textarea column and Post carries a Send icon; the attendance icons need
mr-2 (the reference's 16px effective gap — proven via canvas
text-metric comparison after the computed styles matched but widths
didn't); the recruitment hint drops; hrreports' Report Builder became the
reference's compact 106px filter row; the attendance fitting layout
landed on `sm:flex-wrap` after a `titleNoShrink` min-content floor
reproduced the reference's overflow.

## Verification

- Gates: lint 0/0 · tsc · **194/194 unit** · build (exported
  DATABASE_URL unset per the AGENTS.md rule) · **86/86 E2E**.
- Live dual-browser re-verify of every fixed surface: the four centered
  headers at **848**; companywall 768px wrapper + composer geometry;
  training tabs byte-identical (39×32 12px #171717) + empty-state text at
  the reference's exact y=461; the stat variants (recruitment 146
  byte-exact; the rest within 4-12px); attendance's seven buttons with
  every width exact (86/81/90/121/123/142/195, cluster 911) + toolbar at
  y=281 (ref 280) + docW 1440 (no overflow); the 404 with sidebar 256 +
  72px/300 + 24px/500 centered at 847.
- 24 screenshots refreshed via `./scripts/capture-all.sh` (production
  standalone build); DB pristine after capture (users=1, employees=1,
  leaveBalances=2). Mobile navigation re-checked unchanged after the
  fixes.

Docs updated: AGENTS.md (194 specs, PageHeader contract + centered
flex-1, the StatCard variant map, the attendance recipe), CLAUDE.md
(counts + unit description), README.md (counts), PAD (checklist),
eon-hr_SKILL.md (v2.3.0 + §22 session-10 recipe layer),
docs/remediation-plan-session10.md (+ completion record), this session
log, worklog.md.
