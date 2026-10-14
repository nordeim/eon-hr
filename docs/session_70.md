# Session 70 — eon-hr parity round 35, part 1 (the census + R35-A..E)

*The first working window of round 35 — interrupted at live-verification
time; its uncommitted work survived on disk and was completed by
session 71 (docs/session_71.md).*

The workspace survived from the prior window. Repo at `a754971` on
main, branch clean. The document chain advanced to session_68/69 +
`docs/remediation-plan-session35.md` — this round is session 36 /
parity round 35.

Baseline after the fresh setup (`.env` with `file:../db/custom.db`,
install, db push + seed): **lint 0/0 · tsc ✓ · 521/521 unit · build ✓ ·
142/142 E2E** — the codebase aligned with the documented round-34 state.

**THE REDEPLOY EVENT**: REF's CSS chunk changed — `index-D0Q6-tUz.css`
(was `index-BGNH4KkS.css` since round 31). Analysis: the new chunk
carries a zinc-flavored shadcn base, but the LIVE tokens are still
neutral (`0 0% 3.9%`) — the app's authored layer overrides. The app
chunk itself is UNCHANGED; only the /login page's static build is new,
and it renders byte-identically to the clone (the login layout pair:
all y-positions equal after scroll-offset normalization). One real
find from the login probe: the sandbox shell exports a `DATABASE_URL`
pointing at the outer workspace, silently overriding `.env` — the
server must run with the variable scrubbed (`ensure-server.sh` does
this).

**The census** (agent-browser dual sessions): the zero-data REF holds
(the with-data frontier stays blocked). The mobile chrome + drawer
byte-identical (nav 766y+78h, tabs x=10/79/139/204/313). The bell
popover interior identical. **The user menu**: REF's footer dropdown
measured for the first time this carefully — 192×74, TWO items (My
Profile + Logout, no Label/Separator — the clone's "Admin" label was
invented), align=end, sideOffset=4. **The select interiors**: the
compliance All Types options are REF's Saudi taxonomy (Iqama, Visa,
Passport, Contract, Probation) — the clone shipped an invented set.
**The 404**: REF renders the route in the sentence, a per-route title,
a divider bar, and a Go Home action — the clone's was a bare "404 |
Page Not Found". **The settings tabs** (six non-Company bodies, never
inventoried): Departments (h-9 Add 180×36, 48px icon, P-based
two-line empty), Workflows/Shifts (48px icon + single P), Integrations
(four text-chip tiles + Active badge), Theme (three color fields +
preview + Menu Position + collapse checkboxes + Save Theme), Logs
(five-field filter grid + Clear Filters 97×32 + the empty line).

**TDD execution** (the plan's R35-A..E): 20 RED pins → GREEN at
541/541 unit (+20). The compliance taxonomy + API enum, the documents
route, the not-found rebuild (the client island — three title
approaches until the React-19 `<title>` + delayed-removal combo
survived Next's hydration re-assertion), the settings tabs, the
dropdown/select shared-component recipes (rounded-md containers,
cursor-default rounded-sm items). E2E: 10 new specs across user-menu,
not-found, settings-tabs, compliance-filters → **151/151 E2E** (142+9)
after the usual locator hardening (Radix aria-hidden hides the
trigger while open — measure before clicking; expect.poll for the
enter animations).

Gates at handoff: lint 0/0 · tsc ✓ · 541/541 unit · build ✓ · 151/151
E2E. The live dual-browser verification was IN PROGRESS when the
window ended — the user-menu pair had just surfaced its first real
diff (the clone's menu at 128px wide vs REF's 192). The width driver
investigation, the amendments it produced, and the delivery live in
**docs/session_71.md**.
