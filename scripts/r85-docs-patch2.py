#!/usr/bin/env python3
# r85-docs-patch2.py — the session-85 docs layer (2/2): CLAUDE.md clause
# + README.md evidence row + worklog.md round-84 entry.
import sys

CLAUSE = " + the session-85 keyboard-navigation cycle evidence (7 new specs — the session85-keyboard spec: the round's fresh-eyes instrument opened the r83 close-out's LAST named candidate — THE KEYBOARD-NAVIGATION CYCLE (the tab walks, the focus-visible rings, the drawer's keyboard contract — never audited; every one of the 1182 standing PNGs an at-rest unfocused capture) — and proved the tab orders (login + dashboard 15/15) and the drawer's keyboard cycle parity-locked end to end; TWO clone-authored defects TDD-fixed (R85-A the TW-v4 preflight's 50%-alpha UA focus rings — pixel-proven by the program's first cross-side focused-state pixel diff — restored to the REF's opaque rgb(16,16,16) via the pinned literal; R85-B the never-replicated Base44 platform badge — the fixed bottom-right black pill on every page, session-only dismissal, hidden from the protocol for 20+ rounds by the per-side byte chains and the text-bearing census — replicated in the root layout with the vendored assets + the functional-anchor superset) + the logo-derivative follow-up (the REF's exact 192px supabase derivative vendored; the full suite 424/424 — the 417 standing + the 7 new); the mid-round workspace reset survived with a byte-deterministic replay; the 55th deploy held through a FOURTH consecutive round; the 56TH + the 57TH each step-1-proven non-visual at the round-ends)"

claude = open("CLAUDE.md").read()
clines = claude.split("\n")
target = None
for i, ln in enumerate(clines):
    if "session-84 export/print toolbar action evidence" in ln:
        target = i
        break
if target is None:
    print("FATAL: CLAUDE session-84 clause not found"); sys.exit(1)
clines[target] = clines[target] + CLAUSE
open("CLAUDE.md", "w").write("\n".join(clines))
print(f"CLAUDE.md L{target+1} clause appended")

ROW = " | + the session-85 keyboard-navigation cycle evidence (7 new specs — the session85-keyboard spec: the round's fresh-eyes instrument — THE KEYBOARD-NAVIGATION CYCLE (the r83 close-out's last named candidate, never audited) — proved the tab orders (the login walk's REF-measured 9 stops + the dashboard walk 15/15 identical) and the mobile drawer's keyboard contract (open → focus lands on the first nav item → the trap holds → Escape closes, both sides) parity-locked end to end, now pinned; TWO clone-authored defects TDD-FIXED: R85-A Tailwind v4's preflight pins every element's outline-color to color-mix(in oklab, var(--ring) 50%, transparent) rendering the UA-default :focus-visible rings (the login social buttons, the auth links) at 50% alpha vs the reference's opaque rgb(16,16,16) — pixel-proven by the program's FIRST cross-side focused-state pixel diff (1692 differing pixels) — fixed with the pinned resolved literal in the base layer (the outline-color:auto first form rejected: Chrome 155's parser drops the longhand-auto rule while 1248 accepts it); R85-B the reference's platform-injected \"Edit with Base44\" badge (the fixed bottom-right black pill on EVERY page — login + authed + mobile, session-only dismissal, z-999999) never replicated — invisible to the per-side byte chains (each side compared against itself: the badge rode the REF's own baselines all along) and to the text-bearing DOM census (the icon-only close button) — replicated in the root layout with the REF-measured structure, the VENDORED assets (the orange symbol + the wordmark, self-hosted per the zero-external doctrine), the session-only close, and the functional-anchor superset (the REF's badge body is click-inert); + the logo-derivative follow-up (the REF's exact 192px supabase derivative vendored byte-for-byte — the program's first cross-side pixel comparison caught the 1563px original's different resampling); E2E 424/424 (the 417 standing + the 7 new, zero flakes); the mid-round workspace reset survived with a byte-deterministic replay (every LOC PNG md5 identical); the 55th deploy held through a FOURTH consecutive round; the 56TH + the 57TH each step-1-proven non-visual at the round-ends"

readme = open("README.md").read()
rlines = readme.split("\n")
target = None
for i, ln in enumerate(rlines):
    if "session-84 export/print toolbar action evidence" in ln:
        target = i
        break
if target is None:
    print("FATAL: README session-84 row not found"); sys.exit(1)
rlines[target] = rlines[target] + ROW
open("README.md", "w").write("\n".join(rlines))
print(f"README.md L{target+1} evidence row appended")

WORKLOG_APPEND = """
---
Task ID: round-84
Agent: main (Super Z)
Task: Parity round 84 / session 85 — THE KEYBOARD-NAVIGATION CYCLE ROUND: the 55th login deploy holding through a FOURTH consecutive round at the opening + THE KEYBOARD-NAVIGATION CYCLE (the r83 close-out's last named candidate — the tab walks, the focus rings, the drawer's keyboard contract — never audited) finding TWO clone-authored defects, BOTH TDD-FIXED (R85-A the preflight's 50%-alpha UA focus rings + R85-B the never-replicated Base44 platform badge) + the logo-derivative follow-up + the mid-round workspace reset survived with a BYTE-DETERMINISTIC REPLAY + every LOC PNG re-baselined BY DESIGN + TWO round-end deploys (the 56th + the 57th) each step-1-proven NON-VISUAL

Work Log:
- Workspace HELD at the round's start (the second non-reset round): git pull b7284e4..87f748b (the owner's session_192 transcript) · the core docs re-anchored → the round mapped as Session 85 / Parity Round 84 (plan session85, narrative session_193) · the r84 fixes verified in-tree · the exported-DATABASE_URL trap ACTIVE (the EIGHTH consecutive sandbox — the first standalone boot read db:down until env -u)
- Baseline gates on the unmodified HEAD: lint 0/0 · tsc clean · 941/941 unit · build OK · the standing checks green (patch watch QUIET 16.4.2/canary.24 · audit UNCHANGED · TW-v4 clean 15+6+0 · secrets zero in src/)
- THE OPENING READ: the r85 watch read BOTH SIDES QUIET (the 55th through a FOURTH round) → the FULL LADDER GREEN: the fresh login pair BYTE-IDENTICAL to the 69aa4241… baseline (r85-login-probe) + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 → NON-VISUAL · the r83 ref-re-auth protocol applied · the close-out traps retired
- THE CODE AUDIT (the web-app-foundation + catalog lens): the r84 diff CLEAN (the two fixes recipe-consistent + the spec per §18 T8/§13.5 — no findings)
- THE FRESH-EYES INSTRUMENT — THE KEYBOARD-NAVIGATION CYCLE (r85-keyboard-recon + r85-keyboard-deep + r85-keyboard-focus-png): the login tab walk (REF 9 stops incl. the icon-only #badge-close; LOC 8) + the dashboard walk 15/15 IDENTICAL + the drawer's keyboard contract PARITY (open → Employees → the trap → Escape closes → BODY both sides) + the focus-ring computed reads (the custom-ringed surfaces' visible layers IDENTICAL; the UA-default rings divergent: REF opaque rgb(16,16,16) vs LOC oklab/0.5 — pixel-proven 1692 px)
- R85-A — THE TW-V4 PREFLIGHT'S 50%-ALPHA UA FOCUS RINGS: the mechanism (the blank-page control + the CSSOM walk + the CSS grep) = the preflight's * { outline-color: color-mix(in oklab, var(--ring) 50%, transparent) } — FIXED (TDD) with the pinned literal * { outline-color: rgb(16, 16, 16) } in @layer base after the auto form was REJECTED BY THE PARSE in HeadlessChrome/155 (the CSSOM drops the longhand-auto rule; Chrome 1248 accepts it) + the transition-all 450ms-settle lesson; the post-fix live read auto 1px rgb(16,16,16) IDENTICAL to the REF; the focused cross-side diff 515 → 6 AA-noise cells
- R85-B — THE NEVER-REPLICATED BASE44 PLATFORM BADGE: the REF's #base44-edit-badge (fixed bottom-right, z-999999, the 197x39 black pill, every page, session-only dismissal, the body click inert) — a per-route visible parity gap hiding 20+ rounds (the per-side chains self-compare; the census can't see the icon-only close) — FIXED (TDD): the root-layout Base44EditBadge (the REF-measured structure verbatim + the vendored assets base44-symbol-orange/base44-wordmark + the session-only close + the anchor superset tabIndex=-1 + print-hidden) · the standing five-tab mobile test adapted (dismisses the badge first — the badge covers the 390px tab bar's right end, authentically as on the REF)
- THE R85-B FOLLOW-UP — THE LOGO DERIVATIVE: the program's first cross-side pixel comparison caught the login logo's ~350 AA px (the 1563px original vs the REF's exact 192px supabase derivative) — FIXED: public/eon-logo-192.png vendored byte-for-byte (md5-verified); the residual ~46 px of ±1-channel subpixel noise classified
- THE CONTRACT PINS — tests/e2e/session85-keyboard.spec.ts (7 tests): R85-A/B1/B2/B3/C RED pre-fix exactly as designed (5 RED + 2 GREEN: D the drawer's keyboard contract + E the inputs' ring layers already parity), GREEN post-fix 7/7
- THE MID-ROUND WORKSPACE RESET (the SEVENTH of the record): the entire uncommitted round lost at the docs stage → the recovery (fresh clone @ 87f748b + the environment rebuilt + the round re-executed from knowledge) — THE REPLAY BYTE-DETERMINISTIC: every re-captured LOC PNG md5 identical to the pre-reset captures, the re-vendored assets identical, the re-run suite 424/424 · the standing lesson: commit early, commit often
- THE ROUND'S INSTRUMENT TRAPS (all retired): THE STANDALONE ZOMBIE (Next renames the process to next-server (v16.4.2) — a missed port-kill left the PRE-FIX server on :3200 while the new boot died EADDRINUSE; diagnosed by the served CSS chunk name; kill by PID from ss -tlnp + verify the chunk name after every reboot) · the daemon overload at the recon's start · the slice(0,56) box-shadow truncation false alarm · the CSSOM space-serialization search artifact · the transition-all focus-read timing
- THE BYTE CHAINS (r85-screenshots, numbers 1001-1111, 112 PNGs → 1294 tracked): every REF capture STABLE vs the r84 set (the 55th held through the round's captures) · every LOC capture DRIFT-BY-DESIGN (the badge + the logo + the ring re-baseline the whole LOC side) · the focused pair 1017 = the keyboard surface's FIRST baseline · the 907/909 fix-evidence baselines' first byte-compare (1019/1021) · the mobile-menu cycle GREEN (Training LMS CLICKED → /training → the auto-close — no TW-v4 regression under the badge)
- THE GATES: lint 0/0 · tsc · 941/941 unit · build · E2E 424/424 (the 417 standing + the 7 new, 7.1m, zero flakes) · DB pristine at close (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0) · .env.example re-verified (the two-variable contract unchanged)
- THE ROUND-END DEPLOY READS — TWO GENERATIONS IN ONE ROUND: THE 56TH (login JS BdweUDbT→Cixyggh5, a JS-only chunk movement; step-1-proven: the fresh login pair BYTE-IDENTICAL → NON-VISUAL) + THE 57TH (login JS Cixyggh5→BgH6kzLl; step-1-proven BYTE-IDENTICAL → NON-VISUAL; the r85 REF captures — taken between the two deploys — all STABLE vs the r84 set: the 56th non-visual at the PNG layer too) · the watch RE-ARMED at the post-57th finals
- The docs layer: docs/remediation-plan-session85.md + docs/session_193.md + the AGENTS.md session-85 layer + eon-hr_SKILL.md 3.68.0 + §95 + the CLAUDE/README session-85 clauses + this worklog entry

Stage Summary:
- Round 84 delivered: THE KEYBOARD-NAVIGATION CYCLE ROUND — the fresh-eyes instrument opened the r83 close-out's last named candidate, proved the tab orders and the drawer's keyboard cycle parity-locked end to end, TDD-fixed TWO clone-authored defects (the preflight's 50%-alpha UA focus rings → the pinned opaque restore; the never-replicated Base44 platform badge → the root-layout replication with the vendored assets + the functional superset), fixed the logo-derivative follow-up (the program's first cross-side pixel comparison), pinned the whole keyboard contract (7 tests), survived the mid-round workspace reset with a byte-deterministic replay, and step-1-proved TWO round-end deploys (the 56th + the 57th) non-visual; every LOC PNG re-baselined BY DESIGN
- TWO DEFECTS FIXED + ONE FOLLOW-UP: the round's diff = the two source fixes + the badge component + the vendored assets (3 PNGs) + the session85-keyboard spec (7 tests) + the mobile-navigation adaptation + the instruments + the evidence (112 screenshots) + the docs layer
- Standing watches carried forward: the deploy watch (RE-ARMED at the post-57TH finals — login JS index-BgH6kzLl + CSS index--4Ltml9o; the app side C-IrDy5f/BGNH4KkS; r86's opening read = the full ladder on the 57th-or-newer), the deploy-cadence watch (TWO generations in one round — re-compressed), the design-system-growth watch, the byte chains (the LOC side re-baselined at 1001-1111; the focused pair 1017 chained from r86), the Next.js patch watch, the Turnstile rollout (watch-only), the upstream dependency watch, the cluster-member watch, the role-parity note, the ref-session re-auth protocol, the export-cluster contract pin, the keyboard-contract pin, and the NEW cross-side-pixel-diff instrument class (the focused-state pair — extendable to other surfaces)
"""

with open("worklog.md", "a") as f:
    f.write(WORKLOG_APPEND)
print("worklog.md round-84 entry appended")
