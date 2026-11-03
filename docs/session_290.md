I'll internalize the operating instructions (Mode A–D workflow, decision priority hierarchy, evidence-based verification) and start executing this multi-phase task. Let me set up a todo plan and check the workspace first.
The workspace has a `.git` but appears reset. Let me check git state and pull/clone as instructed.
Workspace was reset — cloning the eon-hr repo fresh as instructed.
Repo cloned. The doc files are massive (AGENTS.md 728KB, worklog.md 865KB), so I'll read them strategically — overview sections plus recent entries. Let me check the key session docs exist and start reading.
Now let me read the core docs. Starting with README, CLAUDE.md, and the latest session docs.
The files have very long lines. Let me read them in parts using offset/limit.
The docs have very long lines causing persistence. Let me read the smaller critical session files directly.
Session 121 closed at commit 3fbcbb9. My round is **Session 122 / Parity Round 121** with the r122 queue armed. Let me read the remediation plan and worklog tail.
Now I understand the current state. My round is **Session 122 / Parity Round 121** with the r122 queue armed. Let me read the worklog tail for the armed queue details.
Now let me read the AGENTS.md core protocol sections (the operational rules for each round).
Now let me read the repo skills catalog and web-application SKILL.md for the audit phase.
I now have the operational picture. Let me set up the environment (fresh clone protocol) and validate the codebase state.
Environment contract confirmed. Let me run the fresh-clone bootstrap protocol: `bun install`, `.env`, db push + seed.
DB pushed to the correct root `db/` path, but seed failed. Let me see the full error.
The classic documented "Error code 14" trap. Let me check how `prisma/seed.ts` resolves the DB path.
The seed hit the documented "Error code 14" trap. Let me diagnose where the runtime resolves the relative URL.
Found it — an exported absolute `DATABASE_URL` in the sandbox shell is overriding `.env` (the exact documented trap). Let me verify and unset it.
The sandbox globally exports `DATABASE_URL` pointing at the workspace root (where the repo lived in prior sessions). Since I cloned to `eon-hr/` per instructions, I'll strip it per the documented `env -u DATABASE_URL` protocol on every Prisma leg.
Seeded (1 user, 1 company). Now the baseline gates: lint → typecheck → unit tests (documented close state: 1161/1161).
Baseline gates reproduce the documented close state exactly: **lint 0/0 · tsc ✓ · 1161/1161 unit**. Let me validate key codebase structures against the documented session-121 state.
Both test configs are in place and correct (1161 unit + 563 E2E). Let me validate the session-121 login warm-token fix and mobile drawer structure in the code.
Let me verify line 32 of app-shell.tsx — the grep output looked mangled.
The displayed line looks corrupted but tsc passed — let me check the raw bytes (a hidden control character may be mangling terminal display).
The raw bytes are valid (`const [mobileOpen, ...`) — the earlier display was a terminal artifact stripping `[m`. Git tree is clean. Now let me build the app and check the agent-browser tooling for the parity comparison.
agent-browser CLI and Playwright chromium are available. Let me check the agent-browser skill usage quickly.
Now let me boot the standalone server on :3200 and set up my agent-browser session for the parity audit.
Clone server is healthy on :3200. Now the opening read on the REF site — first the login page (the 86th-deploy watch for any new movement since the 85th).
**86th-deploy watch**: JS moved `index-r0DWh4vL` → `index-C_KCpRIS`, CSS held at `index-xihcXjhm` (the 85th's). Per the documented churn pattern, a JS-only move with CSS held is usually non-visual — let me verify the render against the session-121 warm-token baseline via computed styles.
**Login watch: QUIET** — all tokens match the session-121 warm-token baseline exactly (social `rgb(15,14,14)`/`rgb(233,230,224)`, or-chip `rgb(93,93,93)`). The 86th deploy is JS-churn-only. Now logging into the REF to check the app side.
Logged into REF. Now the app-side asset watch (baseline: `C-IrDy5f`/`BGNH4KkS` from r42) and dashboard capture.
**App side QUIET** — assets at the r42 baseline (`C-IrDy5f`/`BGNH4KkS`). Now the mobile-nav pair (the user's named focus) at 390×844.
Viewport set. Now the REF mobile-nav audit: hamburger geometry, drawer structure, item count.
Drawer anatomy matches (288×844 fixed z-50, Close `display:none`). Now the menu-cycle test — the REF stay-open regression watch.
**REF stay-open regression persists through its 17th deploy** (drawer still open on /training). Let me capture this, then verify the clone side's auto-close superset.
Now the clone side — navigate to the clone at :3200, log in, and audit the same mobile-nav pair.
Clone login tokens match REF exactly. Now the clone mobile-nav pair.
Clone drawer structure matches REF. Now the menu-cycle test — clone should AUTO-CLOSE (the pinned superset).
**Mobile-nav pair: PARITY** — clone auto-closes (superset), REF regression persists. No Tailwind v4 regression. Now the desktop dashboard comparison — let me capture the clone dashboard and pixel-diff against REF.
Let me recapture the REF dashboard at the same 1280×800 viewport for an apples-to-apples diff.
**Dashboard pixel parity: 1 pixel in 1,024,000** (0.000%, a single antialiasing artifact in the sidebar). Visual parity confirmed across login, dashboard, and mobile nav. Now the audit legs: advisory census + patch watch + neo-crm HEAD.
Advisory census unchanged (2 dev-toolchain vulns, zero runtime exposure); patch watch QUIET (16.4.4 still latest). Now the neo-crm HEAD watch.
neo-crm HEAD has moved to **s211** (e21269a, the login semi-island parity event). Let me audit what changed there — the r122 standing watch named the s211+ layer.
**Major audit finding**: neo-crm s211 decoded the same Base44 platform login-island event — including a **Wix Madefor Text webfont** (label span 166px vs 172px system) and the **exact Google brand SVG** — that eon-hr's session-121 cure may not have fully mirrored (hex pins only). Let me probe the live REF login for the island font and icon construction.
**The island genus is live on eon's REF** — `data-ds="base44"` wrapper, Wix Madefor Text webfont (loaded, span 164px), exact 4-path Google brand SVG. Now the clone side comparison.
**THE ROUND'S MATERIAL FOUND** — the login semi-island genus (neo-crm s211's find, live on eon's REF, not yet mirrored in eon-hr): label span **164px vs 172px** (the Wix Madefor Text typeface), the `data-ds="base44"` island wrapper missing. Icon + colors already at parity. Let me map the exact REF island DOM structure for the cure design.
The REF island construction decoded. Let me capture the complete structure (all 3 buttons + or-divider + what the island wraps) and the remaining sem vars.
Let me dump the full island HTML to get the exact nesting of the or-divider.
Complete REF island construction captured. Now let me read the clone's current login page structure to map the exact delta.
The delta is mapped. Now let me find the REF's actual woff2 URL and verify the neo-crm self-hosted copy matches byte-for-byte.
The REF's latin woff2 is at `/static/wix-madefor-text-latin-BTSEdCXq.woff2`. Let me download it and compare with the neo-crm self-hosted copy.
**Byte-identical** (same md5 as neo-crm's verified copy). Now let me extract the island's full CSS rules from the REF stylesheet for the construction-for-construction mirror.
The full REF island block carries the platform's entire token palette (116KB) — the neo-crm doctrine mirrors only what the subtree consumes. Let me read neo-crm's tight island CSS construction (the genus to transfer).
The tight island CSS captured. Let me see neo-crm's call-site wrapper construction and the button class flips.
The genus is fully decoded. Now let me check the r122 hunt-class tooling — the corpus scripts and the ReportLab TOC dot-order state.
The full picture is clear. Let me start the corpus re-source in the background (needed for the hunt + drift ledger), then build the remediation plan.
Let me check whether eon-hr has a "zero webfont" doctrine that the island would need to amend (the neo-crm lesson).
The zero-webfont doctrine needs the island-exception amendment (live claim sites only). Let me verify the island's scope on the REF — the h1/labels should stay on the system stack.
Scope confirmed — island members only. The measurement is complete. Let me check corpus progress and write the remediation plan.
Corpus downloads in progress. Meanwhile, let me capture the login pixel-diff pair to quantify the current visual gap for the plan.
Login diff is 0.498% spanning the card. Let me localize the hot regions to understand the structure of the delta.
The three button bands carry the bulk (the webfont label spans) — exactly the island genus. Let me inspect the title-area bands (95-131) to check what differs there.
Let me analyze the title-band difference programmatically instead.
The button-band diff confirms the icon/label group shift (the webfont width delta). Let me measure the exact element rects on both sides to separate real deltas from rasterization noise.
Let me measure the clone's rects for the exact comparison.
Both rect measurements ran against the clone (no `open` before the first). Let me redo the REF measurement properly.
REF authoritative: span 164.3 (webfont), icon x 533.9 vs clone 529.8 — the 4.1px group shift. Links/h1/email identical. The x1177+ band is the Base44 platform badge (never-mirrored genus). Let me check the logo band (rows 95-131) — comparing logo assets on both sides.
Logo byte-identical (md5 match) — that band is rasterization noise. The opening read is complete. Let me check corpus progress and then write the remediation plan.
The background download was reaped (the documented sandbox orphan-reaping). Let me re-run the corpus sourcing in the foreground.
ReportLab (`0f64df85`) and Prawn (`699ebcab`) are EXACT — the hunt target is secured. Let me fix the others with the documented trails (dvipdfmx via texdoc, QUARTZ via the submodule path, arXiv retry).
QUARTZ exact (27575d59), dvipdfmx correct size. Retrying arXiv (truncated earlier).
arXiv fully downloaded (1.5MB). Let me run the corpus extraction verification against the pins.
All 7 members' alnum counts match exactly — the re-source is complete. The r115 script's md5 pins are stale (pre-r119); let me verify against the r120 script (the latest).
Corpus verified at the session-121 close state. Now let me measure the r122 hunt class — the ReportLab TOC dot-order divergence — before writing the plan.
Let me measure the current TOC dot-order state on the re-sourced ReportLab member — extraction vs pdftotext ground truth.
The phase-shift measured exactly as documented. Let me read the r116 IRS refutation to understand why the global x-sort died — the cure must be narrowly scoped.
The refutation narrows the cure design: only the leader-dot class may re-order, never a global x-sort. Let me study the extractor's assembly code to find the right seam.
Let me probe the raw piece anatomy of the TOC lines to design the narrow cure precisely.
The anatomy is decoded: per TOC row, ReportLab paints `[dots+pagenum]` BEFORE the entry, same baseline, entry at smaller px. Let me get the positions to finalize the swap design.
The anatomy is fully decoded — the swap design is clear. Let me check the drift classifier to establish the away-boundary baseline before the cure.
Let me check the generator toolchain availability (typst binary, weasyprint) for the family verification posture.
weasyprint available; typst missing. Let me check what the family pin tests use — if fixtures are committed, they run without regeneration.
Let me try installing typst 0.15.1 (single binary) for the family regeneration.
typst 0.15.1 installed. Let me find the family generators and regenerate the families.
The verification posture is clear. Now let me write the remediation plan with the complete measurement, then execute. First the plan document:
Discovery complete. Now writing the remediation plan with the full measurement record.
Plan written. Now validating it against the codebase before execution — first the session-121 E2E spec (must stay green through the class flip).
The computed pins stay green through the flip. Now the TDD round — Step 1: the RED spec. Let me check the recipes test file structure for the insertion point.
Now writing the RED spec block for the island mirror (TDD Step 1).
**RED 5/5 confirmed** (the 5 failed = my new R122 specs). Now Step 2 — the cure. First the font file and globals.css:
Now the doctrine amendment on the `--font-sans` comment (the live claim site):
Now the login page cure — the island wrapper + sem-var class flips:
Let me verify the JSX structure is valid — checking what follows the island close.
Structure correct — form is the island's sibling. Now run the new specs (expect GREEN) and find the dead-premise failures:
R38-F1/K1, R39-A1, R42-C1 are the expected dead-premise failures. But R122-A1 and R122-A5 (my own specs) are failing — let me see why.
Two spec bugs — fixing the form anchor and the Buffer indexing:
**R122 specs 5/5 GREEN.** Now the dead-premise rewrites (R38-F1, R38-K1, R39-A1, R42-C1). Let me read R42-C1 first:
R42-C1's 1600-char window no longer reaches the form (my comment blocks lengthened the region) — a window-size fix. Let me apply all four dead-premise rewrites:
**GREEN 1166/1166** (1161 + 5). Material 1 complete at the unit layer. Now Material 2 — the TOC dot-order cure. Let me study the cv-text test fixture pattern:
I have the pattern. Now writing the R122-B RED spec — the leader-dot phase-shift fixture:
**RED 1/1 + 2 born-green guards** — the designed TDD state. Now the cure in `src/lib/cv-text.ts`:
**GREEN 156/156.** Now the real-member verification — the TOC region on the actual ReportLab PDF:
**The cure works on the real member** — the TOC rows now read in pdftotext's exact form. Now the drift ledger across all 7 corpus members:
6/7 IDENTICAL, ReportLab changed with alnums exact. Now the toward/away classification of the ReportLab change:
TOWARD confirmed (+0.0129 similarity, 86 rows re-ordered, alnums exact). Let me examine the remaining dots-first rows to see which classes they are:
The remaining true TOC row is a 2-dot leader (below my ≥3-dot threshold). Let me check pdftotext's form for that row to assess the residual:
The residual is a 2-dot leader (the long entry leaves only 2 dots). Lowering the threshold to ≥2 dots — then re-verifying the blast radius:
6 members still IDENTICAL, but 1 unit test broke with the threshold change. Let me check:
The proto sync arm — the proto must be regenerated after the source change (the D-120a contract):
**GREEN 1169/1169.** Re-running the toward/away classifier with the complete cure:
The 2-dot row cured but landed on a separate line — something fires "\n" between entry and leader for that row. Let me diagnose:
The 2-dot row's leader carried a walk-time "\n" sep that survives the swap. The cure needs the sep reset — the leader joins its same-baseline entry with " ":
Both row classes cured. Final drift ledger + toward/away verification:
The wrapped-entry and chapter-header rows are documented residuals (different sub-classes). Now the mutation matrix — let me check the r121 runner pattern:
The matrix revealed overlapping-guard findings (the honest M2/M4 results). Let me correct the runner with the measured expectations and document the findings:
**MUTATION MATRIX EXACT.** Now the family regeneration for the drift verification. Let me find the generators:
4 Typst members compiled. Now the WeasyPrint and fpdf2 families:
The documented browser-version trap — installing the matching chromium build:
**ALL 16 FAMILY MEMBERS EXACT** — the drift ledger is zero-away. Now the E2E island live-read spec:
Gates green. Now — per the documented memory-pressure trap — close all browser sessions and dev servers before build+E2E:
E2E running detached. While it runs (no concurrent browser work), let me write the docs layer. First the AGENTS.md session-122 layer — checking the session-121 form:
Writing the AGENTS.md session-122 layer:
Now the count lockstep across the live claim sites (1169 + 565 = 1734):
Now the zero-webfont doctrine amendments in CLAUDE.md and README.md:
The detached E2E died (the sandbox orphan-reaping trap). Running a quick single-spec smoke first, then the full suite in the foreground:
R121-C fails — the or-chip computed color. Let me diagnose:
A locator dead-premise — `span.bg-white.px-3` no longer exists. Rewriting R121-C's locator with the amendment note:
Let me check for other E2E specs referencing retired login classes:
Now the full E2E suite — using setsid for a properly detached run:
E2E running (29 green at 30s). Continuing docs in parallel — the session narrative and SKILL layer:
Updating the SKILL version banner, State line, and appending §134:
Background processes are reaped between tool calls — running the E2E in foreground chunks instead:
The live-DOM shape spec needs the island amendment (the w-full column now carries island + form):
Chunk 2: **253 passed, zero failures**. Verifying the fixed session43 spec:
Let me get the authoritative spec count:
**E2E gate: 565/565 GREEN** (all chunks + the fixed spec). Now the live UI verify + screenshots. Booting the remediated standalone server:
**Live UI verify passed** — span 164.2 vs REF 164.3. Now the final pixel-diff proof and the round's screenshots:
**The cure's visual proof: 0.498% → 0.021%** (24× improvement). Now the full screenshot set — REF dashboard + mobile pair:
All 6 screenshots verified non-blank. Now the DB pristine check, then the docs finalization:
**DB PRISTINE** (1/1/1/0/3/0). Now the session narrative and worklog entry:
Now the worklog entry:
Now let me validate the .env.example is committed-ready and review the full change set:
Change set clean, `.env.example` tracked. Now the SSH push protocol — reading the wrapper skill:
The protocol is clear. Final gate re-check on the complete tree, then commit:
No ssh binary and no paramiko — deploying the shim per the runbook. Installing paramiko first:
Shim deployed. Now materializing the operator key (outside the repo, 0600) and committing:
Committed `b5ade95`. Now the wrapper push — dry-run first:
**Pushed and verified** — remote main @ b5ade95. Shredding the operator key and doing final verification:
**Session 122 / Parity Round 121 — complete and pushed to `main` @ `b5ade95`** (remote verified, keys shredded, tree clean, no new branches).

**The round's two materials:**

1. **The login semi-island mirror** (the neo-crm s211 genus, decoded live on the reference): the platform wrapped the login social block in its `data-ds="base44"` design-system island with a live Wix Madefor Text webfont — the label spans rendered 172.5px on the clone vs the reference's 164.3px. Mirrored construction-for-construction with a self-hosted, byte-identical woff2. **Login pixel diff: 0.498% → 0.021%**; the clone's span now measures 164.2 vs the reference's 164.3.

2. **The ReportLab TOC dot-order cure** (the queued ORDER class): each TOC row paints its leader dots + page number *before* the entry. The narrow leader-dot re-order cured 87 rows toward pdftotext (similarity 0.8947 → 0.9076), with the drift ledger zero-away across all 23 corpus/family members.

**Verification**: RED→GREEN TDD, mutation matrix exact (with two honest documented zero-counts), lint 0/0 · tsc ✓ · **1169/1169 unit** · build ✓ · **E2E 565/565** · DB pristine · mobile-nav parity confirmed (no Tailwind v4 regression; the reference's stay-open drawer bug persists through its 17th deploy while the clone's superset holds). Screenshots, remediation plan, session narrative, and worklog are all in the commit.

**Next steps when you're ready**: the r123 queue is armed — the remaining blind pockets (IRS 94.7% ZaDb, arXiv 97.3% CJK, ReportLab 95.6% MacRoman), the Typst sub-em residuals, and the TOC residual sub-classes (chapter-header numbers, wrapped entries).
