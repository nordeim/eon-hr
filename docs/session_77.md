The workspace has been reset. Let me clone the repository and start the task fresh.
Repo cloned successfully. Let me read the key documentation files to understand the project state.
This is a mature project with 37+ remediation sessions. Let me read the latest session docs and worklog to understand where things stand.
Now I understand the state: session 37 (parity round 36) was the last completed round. This window is **session 38 / parity round 37**. Let me read the remaining key docs.
Let me understand the session numbering convention from git history.
Now I have a clear picture of the conventions. This window is **session-38 audit / parity round 37**. Let me read the worklog's latest entry and check the environment setup.
I now have full context. This window is **session-38 audit / parity round 37**. Let me set up the task plan and begin.
The db file seems missing despite a successful seed. Let me investigate.
The Prisma CLI resolved the DB to `/home/z/my-project/db/custom.db` — outside the repo. An env var is likely overriding .env. Let me check.
A shell-level `DATABASE_URL` env var is overriding the `.env` file, pointing the DB outside the repo. Per the task requirement (`db/` at repo root, `file:../db/custom.db`), let me unset it and redo.
DB now correctly at repo root. Now running baseline gates.
E2E failed. Let me get the full failure details.
All tests fail instantly — a bootstrapping failure. Let me check the start of the output.
The setup passes but all chromium tests fail instantly. Let me run one spec for the full error.
The Playwright browser binaries are missing after the workspace reset. Installing them.
**Baseline ALL GREEN: lint 0/0 · tsc ✓ · 569/569 unit · build ✓ · 158/158 E2E.** Codebase aligned with documented round-36 state. Now the skills audit.
Skills audit complete (agent-browser 0.39.0, tdd, tailwind-patterns — the established toolset). Now starting the LOC standalone server and setting up the dual-browser census.
The production boot guard requires a real AUTH_SECRET. Let me set one in the local .env (gitignored).
Password fill failed. Let me complete the login manually.
LOC authenticated. Now setting up the REF session.
Both sessions authenticated. Starting the round-37 census — first the redeploy watch.
**No redeploy** (login static + app chunks unchanged from round-35 fingerprints) and **REF still zero-data** — with-data frontier stays blocked. Now the standing audits. Let me check the established verify script pattern.
Let me write the round-37 standing-audit probe script.
Three DIFFs are probe artifacts (REF's non-semantic markup — documented lesson). Let me check how previous rounds probed REF's sidebar/bell.
Now I understand the established approaches. Let me fix the probe with them.
Let me verify the file state and remove the dead BELL constant.
4/5 MATCH. The drawer probe has a toggle-state race (drawer was already open from the prior run — the click closed it). Let me probe the drawer cleanly with explicit state reset.
**Mobile drawer byte-identical** — standing audits now 5/5 MATCH. Mobile navigation (user priority) fully verified, no Tailwind v4 bug. Now the round-37 frontier: **keyboard/focus flows in dialogs** (the never-probed dimension). Let me locate the dialogs first.
The dialogs live in settings tabs. Let me write the keyboard/focus probe — the round's frontier dimension.
The probe works (the "error" key is my parse fallback — values are real). I can see real diffs: LOC's Add Shift dialog has an extra `shift-code` field, and focus-restore after Escape fails on LOC (BODY vs the trigger button). Let me see the full output.
Add Department's Tab order is structurally identical (only id attrs differ — a superset), but focus-restore after Escape differs. Let me see the workflow + shift sections fully.
The census reveals real findings:

1. **Tab-order sequences: structurally identical** on all three dialogs (including wrap-around and native time-input segment cycling — the shift-code field exists on REF too)
2. **REAL GAP — focus-restore after Escape broken on all LOC dialogs**: REF returns focus to the trigger button; LOC drops to BODY
3. Minor: Add Level button width 113 (REF) vs 117 (LOC)

Let me check the asset/loan dialogs for the same focus gap, then examine the source.
Major finding on the asset dialog: **LOC's Tab order SKIPS the Cancel/Add Asset footer buttons entirely** (assignment combobox → Close X directly), plus the same focus-restore gap. Let me find the loan dialog and read the sources.
Found a likely cause for Add Asset (the submit is `disabled` when name is empty — disabled buttons are skipped in Tab order), but Cancel is skipped too. Let me inspect the live DOM.
Cancel isn't disabled and has tabIndex 0 — yet Tab skipped it. Let me manually trace the Tab sequence from the assignment combobox.
Manual Tab works correctly (→ Cancel). The probe result differs — let me trace the full sequence step-by-step to find the divergence.
The dialog had closed. Let me reopen and trace properly.
Manual trace reveals ground truth: Cancel IS tabbable; the **disabled Add Asset submit** (disabled when name empty — REF keeps it enabled for native validation) is the real skip. The earlier probe read was a timing artifact. Now let me check the loan/settings dialogs for the same `disabled` pattern and investigate the focus-restore gap.
Only the asset dialog has the empty-name disable — the others are `disabled={saving}` (correct). Now the focus-restore gap. Let me examine the dialog primitive and how open state is managed.
The primitive is standard Radix. Let me check how the dialogs are controlled — the trigger wiring.
The trigger is a plain `<Button onClick>` — not a `DialogTrigger`. Let me check the Radix focus-scope restore logic in the installed version to understand the exact mechanism.
The restore logic saves `document.activeElement` at mount. The question is whether the trigger is focused when the dialog opens. Let me experiment on the live app.
Focus restore fails even with a focused trigger. Let me search for anything intercepting the close-focus chain.
No interception in source. Let me poll activeElement over time after Escape — maybe the restore happens then gets stolen.
The restore never fires — focus goes straight from the input to BODY. Let me inspect the installed react-dialog's unmount-focus wiring.
Let me read the full FocusScope effect code from the installed package.
The library logic should restore. Let me instrument `focus()` live to see if the restore call happens at all.
The restore never fires. Let me see the exact effect opening — there may be a guard.
**ROOT CAUSE FOUND.** Radix's `DialogContentModal` restores focus via `context.triggerRef.current?.focus()` — the **DialogTrigger ref**. The clone's dialogs use plain `<Button onClick={setOpen}>` instead of `<DialogTrigger asChild>`, so `triggerRef.current` is null → preventDefault → focus falls to BODY. REF's triggers ARE DialogTriggers (that's why they carry `aria-expanded` — the round-36 regex lesson).

Let me verify REF's trigger attribute contract live, then enumerate all affected LOC dialogs.
REF's trigger carries the full DialogTrigger contract (`aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`). Now let me enumerate all LOC dialogs with plain-button triggers.
~20 plain-trigger locations exist; only 2 use DialogTrigger. The parity-dialog family for this round: assets, loans, settings×3, staffrequests. Let me now investigate the Add Level button width diff (113 vs 117).
Identical computed styles but 4px width difference. Let me compare the button interiors.
REF: icon `w-4 h-4 mr-1` (16px + 4px); LOC: icon bare `mr-2` (24px + 8px). Let me measure the actual rendered geometry.
The 4px diff is the icon margin: REF `mr-1` vs LOC `mr-2` (both icons render 16px). Now let me verify the loans + staffrequests triggers on REF for the DialogTrigger contract.
REF's loans trigger has the DialogTrigger contract; staffrequests' is a plain submit (no dialog semantics — clone's plain trigger is correct parity there). Let me probe the loans dialog Tab order (correcting the earlier wrong path).
Two more findings: the loans Tab order matches structurally, but the **reason textarea placeholder differs** (REF: "Hi, I'm buying an apartment..." vs LOC: "e.g. Family relocation...") plus the focus-restore gap. Let me pin the exact REF placeholder.
Confirmed. Let me sweep the full loans dialog text layer (placeholders on every field) — the round-36 lesson: geometry audits miss text.
More loans diffs found: Reason `required` on REF, Amount defaults "0", Paid From prefilled "New Era LLC". Let me check REF's company settings to understand the prefill source.
REF's company is "Demo" — so "New Era LLC" is a hardcoded form default in REF's loans code. Let me examine the clone's loans form implementation.
Let me verify the Paid From prefill is stable across dialog re-opens on REF.
Prefill is stable — hardcoded REF defaults confirmed. The census is complete. Let me look at the five trigger sites to prepare the remediation plan.
All sources identified. Let me check REF's amount/months input attributes to complete the loans contract.
REF's inputs carry only `required` — the clone's min/max/step are invented constraints. Let me check the loans API validation before finalizing the plan.
The API validates with toasts (the superset). Let me check the employee select's required state on REF (via the hidden native select).
Census complete. REF's employee select isn't required (clone matches). Now let me study the existing unit pin conventions before writing the plan.
Now let me check the E2E spec structure for the dialog tests.
Now I have everything needed. Writing the remediation plan.
Plan written. Now validating the critical wiring detail — DialogTrigger must sit inside the Dialog root (context). Let me verify each settings tab's structure.
The settings dialogs render their own `<Dialog>` roots as siblings of the triggers — DialogTrigger must live inside the root, so the plan needs a mechanical root-lift. Let me read the full structures to plan precise edits.
The assets structure is clear. Let me check the loans and settings dialog component boundaries.
Neither settings dialog component uses `open` beyond the root. Let me check the Button component's type handling for the asChild merge.
All validated — the Button passes no `type` (DialogTrigger's survives), and `[&_svg]:size-4` explains the 16px icons. Let me add the discovered architectural detail to the plan.
Plan validated. Now TDD — writing the RED pin block first.
Now appending the session-38 RED pin block.
**RED confirmed: 11/11 failing.** Now GREEN — starting with the assets page conversion.
Assets done. Now the loans page — let me see its full return structure.
The edit is atomic and one block didn't match. Let me read the exact source.
The file shows partial application — the first MultiEdit may have partially applied. Let me check the current state of all the edit sites.
Partial application occurred. Let me audit the full current state and fix the remaining pieces.
REF's empty-state CTA is a plain button (no aria) — the clone's stays as-is (parity). Three fixes remain: the stray `</Dialog>` closer, the min/max/step, and the reason.
Indentation mismatch — the months Input is at 16 spaces. Fixing.
Loans complete. Typechecking both files, then running the pins.
Fixing pin calibration (comments break the regexes; the empty-state CTA's onClick is legitimate parity) then implementing settings.
Now implementing the settings conversions — WorkflowsTab first.
Now de-rooting CreateWorkflowDialog.
Partial application again — the signature applied. Let me check the return block state.
Now ShiftsTab — same conversion.
Now DepartmentsTab — the last settings conversion.
All three settings tabs converted. Now the Add Level mr-1 fix (R37-C1).
An older session-36 pin expects the old plain-button markup. Updating it to the new contract (the established amendment convention).
**Unit GREEN — 442 in recipes (+11).** Running the full unit suite, then extending the E2E specs.
**580/580 unit GREEN (+11).** Now extending the E2E specs with the session-38 contracts.
TSC clean. Running lint and the build.
One failure — the loans focus-restore. Let me debug it.
The initial-focus assertion was wrong — the loans dialog's first control is the Employee combobox (a button). Fixing the shared helper to assert focus-inside-dialog.
111 vs 113 — 2px unaccounted. Let me rebuild the :3200 server and measure the pair precisely.
LOC measures 112.73 ≈ 113 (matches REF) in the same browser environment — the E2E's 111 is a headless font-rasterization variance. Relaxing the E2E pin to a range (the established tolerance precedent).
All 10 dialog specs pass. Running the full E2E suite to confirm no regressions.
Passes solo — a flake. Re-running the full suite to confirm stability.
Same test fails in-suite but passes solo — test interference. Let me examine the failure context.
The round-36 flake class re-fired: `getByText` matches both the row and the toast description. Applying the established `{ exact: true }` fix.
The serial rides inside "Desktop · R30-SN-001" — exact can't match it, and the toast never contained the serial anyway. Reverting just that matcher.
**165/165 E2E GREEN (+7).** Full gates green. Now the live dual-browser verification.
12/13 — the REF-side `pfVal` read came back missing. Let me inspect REF's paid-from input directly.
The paid-from IS present on a fresh REF open. Let me re-run the verify to check if it was a transient.
Reproduces. The verify reads REF ~6s after open (vs ~1.3s manual). Let me test the delayed read.
Found it — a probe artifact: REF's paid-from input has no explicit `type` attribute (property-only), so the CSS selector `[type=text]` misses it. Fixing the probe to property-based reads.
The flattened `//` comment swallows the rest of the one-liner (the newline-flattening trap). Moving the comment outside the eval template.
**13/13 MATCH.** Now the standing audits to complete the record.
REF's drawer probe failed to find the hamburger this time. Let me check REF's mobile state manually.
**REF drawer manual read: byte-identical to LOC** (288px @ x=0, #FAFAFA, 1px #e5e5e5) — the automated click was the documented transient. Standing audits effectively 5/5. Now the screenshots.
Writing the round-37 capture script (numbering at 140).
8 shots captured → 188 PNG. Verifying pair equivalence with a pixel-diff.
Let me baseline against the round-36 pairs to confirm these deltas are normal.
The loans pair (3.73%) is elevated vs the ~1.1–1.6% baseline. Let me localize where the differences cluster.
Mixed findings — a 1px input offset and a dark block on REF at the Employee row. Let me re-capture with longer settle to rule out animation frames.
Stable — not transient. Let me map the two regions in detail.
Text-pixel differences at the Employee row. Let me compare the computed placeholder colors directly.
**Real gap found**: the loans "Select employee" placeholder renders `rgb(10,10,10)` on LOC vs REF's muted `rgb(115,115,115)`, plus a 1px y-offset. Let me check the clone's SelectValue implementation.
Identical markup — the color comes from an ancestor. Let me trace the computed color chain.
REF's trigger itself carries the gray. Let me check whether it's placeholder-state-conditional by measuring a valued trigger.
The placeholder-state contract confirmed (gray when empty, dark when valued). Let me check REF's mechanism — likely `data-placeholder`.
**Mechanism found**: REF's trigger carries Radix's `data-placeholder` attribute styled with muted gray — the shadcn `data-[placeholder]:text-muted-foreground` recipe the clone's SelectTrigger lacks. Let me verify the clone's token and current state.
The clone's triggers carry `data-placeholder` but lack the style rule. REF's gray is `#737373` = neutral-500 (not the muted token). Let me confirm it's systemic on a non-dialog select, then implement.
The compliance selects are valued (dark) — recipe confirmed on the two placeholder cases. Now investigating the 1px y-offset in the loans dialog stack.
A 2px interior height drift (dlgH 698 vs 696) localized between the employee row and the textarea — pre-existing, surfaced by the pixel-diff. Let me bisect the interior stack.
**Found it**: REF's Requesting-for card carries a `border` (h=90 vs 88). Let me pin the exact recipe.
**R37-F pinned**: REF's card = `border border-blue-200`. Two new findings (E: placeholder gray, F: card border). Let me check REF's dark-mode placeholder before implementing.
REF dark: placeholder flips to `#a3a3a3` (neutral-400); the card stays light. Restoring REF to light mode (the persisted-dark lesson), then adding pins.
RED confirmed. Implementing both fixes.
My new comment pushed text outside the old pin's slice window. Widening it.
The pin now matches my comment's "bg-blue-50" first. Making it target the actual card div.
**582/582 unit GREEN (+13).** Rebuilding and re-running the gates.
13/13 MATCH. Verifying the E/F fixes live and re-capturing the loans pair.
**Byte-identical**: placeholder gray, card border, dialog 698@101 on both. Re-capturing the loans pair and re-diffing.
**1.41% — within baseline.** The round is complete. Updating the remediation plan with the addendum + completion record.
Now the documentation chain. Let me check the AGENTS.md session-37 layer format.
AGENTS line 1827 is the historical session-37 layer (correctly unchanged). Now the polished session log.
Now the worklog entry and final pre-commit verification.
All gates green. Verifying DB pristine state before commit.
DB pristine (users=1, employees=1, zero mutations). Now the commit — first let me review the SSH wrapper instructions.
Now the commit and push. First checking the SSH environment.
No ssh binary — deploying the paramiko shim per Appendix A.
Committed. Now setting up the SSH key and pushing via the wrapper.
Dry-run clean (remote at 0182f0d, fast-forward to c924dd9). Executing the real push.
**Round 37 delivered and pushed** — remote verified at `c924dd9`. Following the established convention, committing the raw session journal and pushing it.
**Round 37 delivered and pushed to `main`** (`c924dd9` + the journal commit `ae3ed25`, remote-verified).

**What this window found**: the keyboard/focus census (round 36's named frontier) showed Tab orders are already identical everywhere — but dialog *close* was broken: REF's triggers are real Radix DialogTriggers (focus returns to the trigger + aria contract), while the clone's plain onClick buttons dropped focus to BODY on every close. All five parity dialogs were converted (with the required root-lift), plus the asset's dead submit button, the Add Level 4px drift, the loans text layer (placeholder/defaults/invented constraints), and two pixel-diff forensics finds (placeholder-state gray + the missing card border).

**Gates**: lint · tsc · 582/582 unit (+13) · 165/165 E2E (+7) · 13/13 live pair MATCH · 188 screenshots. Mobile nav re-verified byte-identical — no Tailwind v4 bug. Docs chain and worklog updated; DB pristine.

**Suggested next steps**: the with-data surfaces remain blocked on REF's zero-data state; the next round could probe Shift+Tab walks, the login page's Tab order, or popover/menu focus flows, plus the standing redeploy watch.
