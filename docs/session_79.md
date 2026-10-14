# Session 79 (raw journal) — the window that delivered parity round 38

*The unedited narrative of session 78 / parity round 38. The polished
retrospective is docs/session_78.md; the plan with the addendum and the
completion record is docs/remediation-plan-session39.md.*

git pull brought one new journal (session_77). Read the doc chain:
README, CLAUDE, AGENTS (the session-38 layer), the SKILL, PAD,
session_76/77, the plan-38 completion record, the worklog tail. This
window = session 39 / parity round 38. The frontier per round 37's
closing note: the keyboard/focus remainder (Shift+Tab, the login Tab
order, popover focus) + the standing redeploy watch.

Baseline gates ALL GREEN (lint · tsc · 582/582 unit · build · 165/165
E2E). The shell-level DATABASE_URL override was present again (the
documented trap — ensure-server.sh strips it with env -u; the
db-pristine check needs the same). Skills: agent-browser 0.39.0 + tdd +
tailwind-patterns, the established toolset.

THE OPENING FALSE ALARM: the first login probe read the page UNSTYLED
(default fonts, black borders, a 1999px body). Investigation: the
stylesheet URL returned a 21-byte "Internal Server Error" — the
still-running :3200 server (started before the baseline rebuild) kept
serving the OLD manifest's chunk hash; the rebuilt CSS file existed
under a NEW name. ensure-server.sh's HTML liveness check passed the
whole time. Killed + restarted → styled. The stale-server trap
recorded: kill :3200 after EVERY rebuild.

THE REDEPLOY: REF's /login static JS chunk changed
(index-CneaUv24.js → index-BYE5Ojxh.js); the login CSS, the app JS and
the app CSS all unchanged → every app-level pin holds; the login page
became the round's frontier. Standing audits 5/5 (the drawer after the
documented x=-261 toggle-race artifact + the Escape-reset pattern).
REF still zero-data.

THE LOGIN RE-AUDIT: full-surface diff at 1440×900 — the desktop
geometry already byte-identical; the diffs were recipes (the
placeholder slate-600 vs muted, the Sign in px-3/gap-1/transition-all
200ms, the social type=submit + the icon wrappers, the main root, the
shrink-to-fit title block, the shadow-none remnant) and the zinc-950
typed-text (REF's login build uses the ZINC palette; the app build is
neutral — two CSS builds, one shared token in the clone). Then THE
FIRST MOBILE PROBE of the login page (390×844) — an entire responsive
dimension the 37 desktop-only rounds never saw: h-11 sm:h-12 inputs at
16px (the clone's flat h-12/text-sm = 48px/14px), the sm:hidden
&nbsp; spacer (card y=16 + the 18px scroll), the links row flex-col
sm:flex-row (the clone's flat row wrapped BOTH link labels to two
lines — the intrinsic widths 118+176 exactly filled the 294px row),
the logo glow family (blur-xl gradient, opacity-30→40), the
continuous-line or-divider, and the keyboard walks GREEN (Tab +
Shift+Tab identical; T9 = the builder badge, documented).

The mobile card stack diff (REF 782 vs clone 786) traced to the
responsive heights; the canvas tree diff found the spacer + REF's
<main> root; the label-span/links recipes came from the wrapper class
reads. Plan written (docs/remediation-plan-session39.md) with 12
finding families + the probe lessons, validated against the login
source and the Input base.

TDD: 15 RED pins → the login page rewrite → GREEN. Three re-learned
traps en route: the comments-in-source regex inflation (my own new
comments contained the literal class strings — reworded), the R18-E /
R19-H anchors broke (the social buttons are now type=submit — the
anchors moved to disabled={loading}), and the zinc foreground on the
root main was NOT enough (the card's text-card-foreground beats
inheritance — any rule beats inheritance; pinned on the card after the
E2E caught rgb(10,10,10)).

THE PIXEL-DIFF ADDENDUM: the pairs diffed 4.33% on mobile vs the
~1.1-1.6% baseline → the band trace found the icon glyphs (the
Microsoft viewBox 23 vs 24; a completely different Apple path) AND the
per-button wrapper correction: REF's -ml-4 pull is ONLY on Google
(live-measured div x=84.8 ml=-16; Microsoft/Apple x=84.6/98.2 without
— a uniform pull put the clone's Microsoft icon at x=77 through the
negative-margin flexbox math). Both fixed; the mobile icon bands
dropped to 0.8%; the VLM crop confirmed the ONLY remaining difference
is REF's fixed "Edit with Base 44" builder badge (the documented
non-clone). Final: desktop 0.84%, mobile 3.27%.

Gates: lint 0/0 · tsc ✓ · 598/598 unit (+16) · build ✓ · 167/167 E2E
(+2: the desktop recipe spec, the mobile responsive spec). Live: the
mobile pair byte-identical (email y=516 h=44 font 16px, card y=16
h=782, scrollHeight 862, icon x 85/85/98, links y=718/746 h=20); the
desktop pair MATCH (four documented non-gaps); standing audits 5/5. 8
screenshots (144-147) → 196 PNG. DB pristine (users=1, employees=1).
.env re-verified (DATABASE_URL="file:../db/custom.db", db/ at the repo
root); .env.example matches.

Docs: AGENTS session-39 layer, SKILL 3.22.0 + §51, PAD [S39],
CLAUDE/README counts, docs/session_78.md, the plan's addendum +
completion record, the worklog.

Delivery: committed af5bf3d (29 files, +1308/−57), pushed via the SSH
wrapper (the paramiko shim already deployed at the workspace bin/;
the --remote override to nordeim/eon-hr), remote verified, tree clean,
operator key shredded. This journal is the post-push commit.
