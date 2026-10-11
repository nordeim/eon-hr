I'll continue executing the full-cycle instruction for the eon-hr repository. The session documents have advanced to session_30/31, so let me start by refreshing the workspace and understanding the current state.
The eon-hr workspace exists. Let me check its git status and pull the latest changes.
Pull succeeded — local workspace is now at `e58abcc` (session_31 was the only new file). Now let me read the root documents.
Workspace is refreshed and includes vitest/playwright configs, `db/` folder, `.env.example` — prior sessions made progress. Now let me read the 5 root documents.
Now let me read AGENTS.md and the architecture document.
Let me read AGENTS.md in chunks directly.
Now let me read the Project Architecture Document.
Now let me scan the eon-hr_SKILL.md structure (it's large — 172KB).
Now let me read the session documents — session_30, remediation-plan-session19, and session_31.
Session_31 confirms parity round 18 (focus rings) is complete and pushed. Now let me read the remediation plan and worklog tail.
I now have the full picture. **Current state**: Parity Round 18 (focus rings / interaction dimension) complete and pushed (`d1c0d7c` + `e58abcc`). This session = **Session 20 / Parity Round 19**. The frontier per session_30/31: redeploy check, **hover/active-state parity** (the third interaction dimension), reduced-motion support, and the with-data story.

Let me validate the environment state against the codebase.
Environment is intact: `.env` has the required `DATABASE_URL="file:../db/custom.db"`, `db/` at root with both databases, `.env.example` matches, vitest + playwright configured. Now let me run the baseline gates.
Build passed. Let me verify DB pristine state and run E2E tests.
**Baseline fully validated**: lint 0/0 · tsc ✓ · 373/373 unit · build ✓ · 86/86 E2E · DB pristine — the `e58abcc` push state exactly. Now the static audit of the recent diff and skills consultation.
Static audit clean (the "any" match was "Company" in a comment — false positive). Now let me consult the skills catalog.
Let me review the key skills for this round's methodology (tdd, agent-browser, clone-app-pat-pro, tailwind-patterns).
Skills methodology internalized (computed styles = ground truth, dual-browser probing, TDD). Now let me set up the audit infrastructure — LOC server + dual browser sessions.
Server is up. Let me authenticate the dual browser sessions.
The documented password-fill flake hit both sessions. Let me check state and refill manually.
LOC authenticated. REF shows "/" — let me verify it settled (documented behavior).
Both sessions authenticated. Let me set viewports to 1440×900 and run the redeploy check.
**Redeploy check PASSED** — 12/12 MATCH, REF unchanged since round 18. The viewport command name was wrong; let me find the right one.
Viewports set. Now the **mobile navigation audit** (user priority — every round) using the r18 probe.
**Mobile navigation audit PASSED — byte-identical end-to-end** (top bar, tabs, drawer, kickers, md boundary — no Tailwind v4 bug). 

Now the round's frontier: **hover/active-state parity** (the third interaction dimension). Let me check agent-browser's hover capability first.
`hover @ref` performs a real CDP mouse move — that's the right tool. Let me check the full command list and snapshot format.
`hover` takes a selector directly. Let me test the selector syntax and hover-state reading on the LOC dashboard.
The sidebar structure is clear — snapshot-ref approach works. Let me first inventory the clone's hover classes, then write the hover-parity probe.
Now I have LOC's hover inventory. Let me check what the mobile snapshot shows for the hamburger, then write the comprehensive hover-parity probe.
Both hamburgers are accessible as "Toggle Sidebar". Now let me write the comprehensive hover-parity probe.
Rich findings — but there's a **probe artifact**: REF hovers fire while LOC hovers don't, plus several reader queries failed. Let me debug the LOC hover issue first.
The `:hover` pseudo-class IS active but styles don't change. Let me check if the hover rules exist in the served stylesheet at all.
Rules exist in CSS. Let me check the hovered element's own classList and match.
Strange — rule exists, element matches `:hover`, but computed style doesn't apply. Let me find all matching rules that set text-decoration.
Two rules match — base `a { text-decoration: inherit }` vs utilities hover rule. The utilities layer should win... unless the layer ORDER is wrong. Let me check.
Layer order looks right (base → utilities). But **unlayered** styles beat all layers. Let me check for unlayered rules matching the link.
No unlayered rules either. Let me trace the full parent chain of the hover rule — it may sit inside a media/container query.
**FOUND IT** — Tailwind v4 wraps hover variants in `@media (hover: hover)`. Let me check what the probe browser reports.
Both sessions report `hover:hover` = false — the probe browser doesn't emulate a hover device. REF (v3, unwrapped rules) still works; LOC (v4, media-wrapped) doesn't. This is a probe limitation, not a code bug. Let me find how to emulate hover capability.
`set media` only covers dark/reduced-motion. Let me try `set device` with a desktop profile, and check the CDP URL.
CDP is available. Let me write a script to force `hover: hover` media emulation via CDP.
Emulation call succeeded but matchMedia still false. Let me reload the page — some emulations need a navigation to apply.
Let me verify the CDP plumbing works with a known-supported feature (prefers-color-scheme).
CDP works for color-scheme but **`hover` feature is not overridable** in this Chromium. New approach: inject a probe-side CSS polyfill that unwraps the `@media (hover: hover)` rules. First, let me enumerate what's wrapped.
85 hover rules are media-wrapped. Let me check REF's stylesheet structure for comparison, then build the polyfill.
REF is v3-era (px breakpoints, no bulk hover wrapper) — but has 1 custom rule wrapped in `(hover: hover) and (pointer: fine)`. Let me identify it, then build the polyfill.
REF's wrapped rules are irrelevant (drawer/toaster internals). Let me check REF's snapshot labels for the footer buttons and tabs, then rebuild the probe with the polyfill.
Now I understand all the failures. Let me debug the one remaining puzzle — the group-btn query error — then rebuild the probe.
The `"` chars in reader code break under shell escaping — single quotes only needed. Now let me write the fixed probe v2 with the hover polyfill.
The polyfill works — rich findings! Now let me decode REF's sidebar link hover recipe by dumping its class names, and re-measure the inactive leaf settled (the mid-transition artifact).
REF's recipe is decoded from class names: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-80`. Let me get the settled values and REF's token values.
**Settled REF inactive-leaf hover**: bg=zinc-100 `#F4F4F5`, text=`#18181B`, opacity 0.8. LOC has wrong pins (`hover:bg-[#e4e6eb]`, no text change). Let me check REF's group button classes and sub-items too.
Group buttons use `hover:bg-blue-50 hover:text-blue-700` — matches LOC. Now let me measure the sub-item hover recipe on REF (expand a group first).
Sub-items follow the leaf recipe (zinc-100 + #18181B + 0.8). But today's REF bell measures zinc-700 while R15 pinned slate-600 — let me dump the footer button classes to resolve.
The buttons carry no text color — it's inherited. Let me check the SVG icons inside.
Bell svg carries `text-slate-600` (own class wins over hover), moon inherits. Let me dump REF's user button structure and the عربي rest classes to complete the footer taxonomy.
REF's name span carries `text-slate-900` — but R15 pinned zinc-700. Let me measure the rendered name span color on both apps.
**Confirmed stale pin**: REF name = `text-slate-900` rgb(15,23,42), LOC = zinc-700. Now let me verify LOC's bell/moon hover with the polyfill active.
Bell/moon hover gaps confirmed. Let me probe the remaining desktop surfaces: search input, staffrequests pill, green CTA (payrollmodule), dark CTA (taskmanager).
Mostly matches — but 3 regexes failed (missing space before `[`). Let me check the actual snapshot names and re-probe those surfaces.
Still failing. Let me debug the ref-finding directly.
Found it — my regex ended with `\)` instead of `\]`. Let me fix and re-run.
Taskmanager CTAs match (the lab() vs rgba() is the documented color-serialization family). Let me check LOC's staffrequests tab naming.
LOC renders the trigger as a button (aria-pressed superset). Also spotted: search placeholder differs — REF "Search requests..." vs LOC "Search requests". Let me verify and measure LOC's trigger hover.
LOC trigger hover matches (no change). **New gap found**: placeholder "…" (unicode) vs REF "..." (ASCII dots). Now let me audit the login page with fresh sessions.
All failed — let me check the fresh sessions' state.
Login findings: socials + Sign in hover match, but REF uses `gray-200` borders (vs LOC neutral-200), REF's Sign in carries a shadow, and LOC's forgot-link underlines on hover (REF doesn't). Let me decode REF's login button classes.
REF decoded: Sign in carries `shadow-sm` (LOC lacks it), forgot has NO `hover:underline` (LOC has it). Login borders are all 0px (invisible — non-gaps). Now the mobile surfaces.
Mobile gaps found: bottom tab hover (REF none, LOC changes color), drawer links (same leaf gap). The hamburger reading is odd — let me check LOC's code.
The code says `text-slate-900` but measured slate-600 — let me verify directly on a fresh mobile page.
The drawer's hidden group buttons polluted the geometry query — LOC's real hamburger is `text-slate-900` but REF's is `#0A0A0A`. Let me measure the LOC hamburger hover properly.
REF's hamburger inherits foreground + `hover:text-accent-foreground`. One more surface family — the user dropdown menu items. Let me verify both apps.
Menu item hover: REF #171717 vs LOC #0A0A0A. Let me check LOC's dropdown-menu code and the accent-foreground token.
Menu item gap confirmed (focus:text-secondary-foreground vs REF accent-foreground). Let me dump REF's quick-chip and Import CSV classes to pin exact recipes for the remediation plan.
The quick-chip was a measurement artifact (REF styles an inner div, I measured the anchor) — chip actually **matches**. Good catch via DOM verification. Let me check the reduced-motion rules on both apps (the open a11y item), then finalize the inventory.
Both apps have exactly 1 reduced-motion rule (different invisible surfaces — documented non-gap). **The hover audit is complete.** Now let me read the exact code sites to validate the fix plan.
I see the user-menu items use custom classes in sidebar-nav (not the dropdown-menu primitive). Let me check where the primitive is used and measure REF's Logout item.
REF's Logout uses `focus:bg-accent focus:text-accent-foreground` + base `text-red-600`. Let me verify its rendered hover state.
Confirmed — REF's Logout hover = accent bg + #171717 text. Let me read the remaining code sites.
All sites confirmed. Let me check which existing test pins reference these classes (they'll need updating).
All affected pins identified. Now let me write the remediation plan for **Session 20 / Parity Round 19**.
Plan written and all 12 code sites were verified during the audit. Now TDD — let me examine the test structure and write the RED pins.
Now let me write the session-20 RED pins and update the stale pins.
12 RED confirmed — but R19-K passed erroneously (wrong slice window). Let me fix that pin to target the bottom-tab block precisely.
**All 13 RED confirmed.** Now GREEN — implementing the fixes. First sidebar-nav.tsx (R19-A, B, C, C2, D, L):
Now app-shell.tsx (R19-J hamburger, R19-K bottom tabs), and the other files:
Now update the stale test pins (recipes 77-78, 372-375, 1322-1328, tokens comment):
All pins updated. Let me fix the tokens test comment and run the full unit suite.
3 pin-regex issues (comments I added contain matching text or exceed windows). Let me fix them.
The negative regexes are catching my own comments and neighboring elements. Let me fix with positive pins and reworded comments.
**386/386 unit GREEN** (+13 pins). Now the remaining gates: lint, typecheck, build, E2E.
**All gates green: lint 0/0 · tsc ✓ · 386/386 unit (+13) · build ✓ · 86/86 E2E.** Now restart the LOC server on the fresh build (the documented stale-server trap) and re-verify live.
Both sessions live on the fresh build. Now the comprehensive live verification of all fixed surfaces.
Core fixes verified (inactive leaf, menu items MATCH; active-leaf + Import CSV visually identical — only the documented shadow-serialization differs). The REF NULLs are query issues (REF's bell is unnamed). Let me fix the remaining verifications.
REF bell/moon verified — all values match LOC's fixed state. Now the name span and placeholder on LOC.
The LOC session appears logged out (login form inputs on staffrequests). Let me check and re-authenticate.
Name span and placeholder verified. Now the login page fixes (locL session is logged out).
Login fixes verified (shadow + no underline). Now mobile verification.
**All 12 fix surfaces live-verified byte-exact.** Now the post-fix regression sweeps — canonical 12-route + mobile chrome.
The probe ran at mobile viewport (390 left over). Let me reset to 1440×900 and re-run.
Mobile regression clean — 12/12 routes + all chrome byte-identical. Now let me capture the hover-evidence screenshots.
02-dashboard and 37-reports have identical sizes — let me verify they're different captures.
The LOC session dropped again — likely the login rate limiter (10 attempts/15min, in-memory). Let me restart the server (resets the limiter), re-auth once, and redo the affected captures.
Let me check whether the current screenshots match the git versions (known-good dashboard) or show the login page.
Let me visually inspect the captures to establish ground truth — I'll use the VLM skill.
Captures 02/66 verified good (dashboard + menu hover). The 37 capture failed to navigate (page stayed on dashboard). Let me check the DB user state and re-capture /reports properly.
Root cause understood — the standalone server's `Secure` cookie over plain HTTP makes browser sessions flaky in this environment (E2E's storageState path is unaffected). Let me re-auth and re-capture just the /reports shot with verification.
/reports capture fixed. Let me spot-check the hover-evidence captures with VLM.
67 caught the login page (session had died). Let me re-capture it.
All captures verified. Now the documentation updates. Let me get exact spec counts first.
All screenshots clean (80 total). Now the documentation updates — starting with AGENTS.md.
Now the session log, worklog entry, and the remediation-plan completion record.
Now the final pre-commit checks — git status, stray files, secrets scan.
Clean — 32 files staged. Now the commit.
Committed `8ab438c` on main. Now the push via the SSH wrapper — let me review the runbook first.
Key verified (ed25519, pete@pop-os). Now the dry-run with the eon-hr remote.
Dry-run passed — remote at `e58abcc`, fast-forward to `8ab438c`. Real push now.
Push verified. Final post-push smoke test.
## Session complete — Parity Round 19 pushed to `nordeim/eon-hr@main` ✅

**Pushed**: `8ab438c` (remote verified == local HEAD via SSH wrapper, key shredded, post-push smoke green: health OK, login 200, dashboard renders, DB pristine, tree clean).

**What shipped this round**:
- **Audits**: redeploy check PASS (REF unchanged), mobile navigation **byte-identical** (no Tailwind v4 bug), and the **first hover/active-state audit** — 24 surfaces via real CDP hovers
- **Deepest find**: Tailwind v4 wraps all `hover:*` utilities in `@media (hover: hover)` — invisible to headless probes; defeated with a probe-side CSS polyfill (documented + reusable)
- **12 gap groups fixed** (13 new TDD pins, 386/386 unit + 86/86 E2E): sidebar hover tokens (zinc-100/#18181B — old `#e4e6eb` pin was stale), active-leaf text flip, ghost accent hovers, user-name slate-900 correction, blue-tinted Import CSV, accent menu items (incl. red Logout flip), login shadow/underline pair, mobile hamburger + no-hover bottom tabs, ASCII placeholder

**Suggested next**: the interaction map now covers focus + hover; the remaining frontier is `:active` (pressed) states (needs mousedown-hold tooling), the with-data story (blocked on REF's zero data), and reduced-motion. Spot-check screenshots 63–67 for the hover evidence.
