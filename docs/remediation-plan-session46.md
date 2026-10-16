# Remediation plan — session 46 (parity round 45)

## The round's context

- Workspace reset again (the third+ reset across the parity program); fresh
  clone at `3c767d7`, env rebuilt (bun install, `.env` with
  `DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET, db:push +
  db:seed with the shell-level DATABASE_URL trap unset inline, Playwright
  chromium reinstalled). Baseline gates ALL GREEN: lint 0/0 · tsc ✓ ·
  681/681 unit · build ✓ · 203/203 E2E — aligned with the documented
  round-44 state.
- **Redeploy watch: the 11th login deploy** — login JS `BerEzxez` →
  `CcAnCcTT`, login CSS `NS4V-1t3` → `BWytzgpi` (JS + CSS both; the app
  fingerprints `C-IrDy5f`/`BGNH4KkS` quiet). Per the round-42 precedent this
  triggers a full login re-audit; the r44-fixed surfaces re-verified MATCH on
  the new build (the icon family, the title/action row, the at-rest
  geometry, the failed-login Alert). The runtime Tailwind block now ships
  17,080 bytes / the ring-slate-400 pair still present; the react-hot-toast
  block is GONE from the login (the sonner block remains — platform
  runtime, no toast is fireable on any login flow).
- **A continuation note**: the previous window completed this round's code
  work but was interrupted before the full-E2E confirmation + commit, and
  the workspace reset lost the uncommitted work. This plan re-derives every
  contract from fresh live measurements (census scripts
  `probe-r45-census-a..b10.mjs`) — nothing is carried over unmeasured.

## The findings (all live-measured on REF's 11th-deploy login build)

### The headline: TWO hidden view-swapped flows behind the action buttons

The login card's `w-full` column swaps its ENTIRE content (the logo, the
welcome title, the social row, and the or-divider all unmount) when the two
sign-in action buttons are clicked — flows 44 rounds never censused because
they leave no DOM trace until clicked:

**1. The password-reset flow** ("Forgot password?"):

- The view wrapper `space-y-4 sm:space-y-6` with THREE children:
  - the back button `flex items-center gap-2 text-sm text-slate-500
    hover:text-slate-700 font-medium transition-colors -mb-2` —
    "Back to sign in" + `lucide lucide-arrow-left h-4 w-4` (glyph
    `m12 19-7-7 7-7` + `M19 12H5`);
  - the title group `text-center space-y-2` — H2 `text-xl sm:text-2xl
    font-bold text-slate-900` "Reset your password" + P `text-slate-600
    text-sm sm:text-base` "Enter your email and we'll send you a link to
    reset your password";
  - the form `space-y-4 sm:space-y-5` — ONE field unit (`space-y-1.5`: the
    Label "Email" + a BARE `relative` icon-input wrapper) + the CTA
    `... px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800
    text-white font-medium shadow-sm rounded-xl transition-all
    duration-200` "Send reset link".
- The reset input is a SIBLING input family (NOT the sign-in's verbatim
  string): the shared base but `h-10 sm:h-11` (44/44px), `text-base`
  mid-string, and `placeholder:text-slate-400` (the sign-in ships
  `h-11 sm:h-12` + `placeholder:text-slate-600`). NO autocomplete attr, id
  "email", ph "you@example.com".
- The field icon is the same older-lucide Mail glyph at **slate-400**
  (`text-slate-400` — the hidden views' icons sit LIGHTER than the
  re-measured sign-in pair's slate-500).
- The CTA loading state: text swaps to **"Sending..."** + disables +
  renders `lucide-loader-circle mr-2 h-4 w-4 animate-spin` (the r44
  family).
- **The success view** (after submit — measured with a throwaway
  non-existent email): the same view-wrapper family with:
  - a header group `text-center space-y-3 sm:space-y-4` — an icon circle
    `mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex
    items-center justify-center` wrapping the older-lucide Mail at
    `h-7 w-7 sm:h-8 sm:w-8 text-slate-700`, then a `space-y-2` title
    group (H2 "Check your email" + P `text-slate-600 text-sm sm:text-base`
    reading "We've sent password reset instructions to" + `<br>` + a
    `font-medium text-slate-900` span with the submitted email);
  - a GREEN Alert — the shared shadcn base with `text-foreground
    bg-green-50/70 border-green-200 rounded-xl` + an AlertDescription
    `[&_p]:leading-relaxed text-green-700 text-sm` reading "Please check
    your email for the password reset link. It may take a few minutes to
    arrive." (NO svg inside);
  - a bottom back button `w-full flex items-center justify-center gap-2
    text-sm text-slate-500 hover:text-slate-700 font-medium
    transition-colors` + the arrow-left — "Back to sign in".
- **Anti-enumeration verified live**: a non-existent email renders the
  IDENTICAL success view (copy + geometry) — no account-existence signal.

**2. The sign-up flow** ("Sign up"):

- The view wrapper is **bare `space-y-4`** (16px in BOTH bands — measured:
  the H2's mt=16px at 390 and at 1440; the reset wrapper's sm:space-y-6
  gives 24px at desktop).
- The back button (-mb-2, arrow-left) then the H2 **directly** (NO title
  group, NO subtitle): `text-xl sm:text-2xl font-bold text-slate-900`
  "Create your account".
- The form `space-y-3 sm:space-y-4` with a **fields group `space-y-3`**
  (bare — 12px gaps measured between the units at mobile) holding THREE
  field units (`space-y-1.5`: Label + bare `relative` wrapper):
  Email/Password/Confirm Password — htmlFor `email`/`password`/
  `confirmPassword`, placeholders "you@example.com" / "Min. 8 characters"
  / "Re-enter password", all `type` email/password/password, all
  `required`, NO autocomplete, NO name.
- The THREE inputs carry the sibling family with the font pair at the
  TAIL: `... placeholder:text-slate-400 text-sm sm:text-base` (NOT the
  mid-string text-base the reset input ships). The Password/Confirm icons
  are the older-lucide Lock at slate-400.
- The CTA "Create account" — the loading swap **"Creating account..."** +
  the same spinner + disabled.
- **The duplicate-email error** (measured with the demo account's email —
  non-destructive): the error Alert renders INSIDE the form (between the
  fields group and the CTA) — the shared base + `bg-red-50/70
  border-red-200 rounded-xl` with the description `[&_p]:leading-relaxed
  text-red-700 text-sm` reading verbatim **"A user with this email
  already exists"** (REF returns this even when the password is the
  correct demo password).

### The `--foreground` two-build split (the r42 `--ring` precedent)

REF's login build sets `--foreground: 240 10% 3.9%` (zinc-950, rgb(9,9,11))
at :root — the app build ships `0 0% 3.9%` (neutral-950, rgb(10,10,10)).
The only root-`--foreground` consumer on the login is the Alert family's
`text-foreground` (the container copy color; the description text carries
its own red-700/green-700). The clone's login main already pins
`[--ring:#09090b]` (r42); this round adds the sibling
`[--foreground:#09090b]` — scoped to the login root so the app pages keep
the shared token.

### The trap-6 rhythm restorations (v3-stacking losses)

- The back buttons' authored `-mb-2` overrides v4's zero-specificity
  `:where` space-y margin-bottom, so the FOLLOWING element loses its gap
  (REF's v3 stacks the button's -8px mb with the next sibling's mt). The
  clone authors the restoration members (documented supersets):
  - the reset title group carries `mt-4 sm:mt-6` (the wrapper's 16/24px
    v3 mt restored; effective gap after the -mb-2: 8/16px — REF measured
    8px at 390, 16px at 1440);
  - the signup H2 carries `mt-4` (the bare space-y-4 wrapper's 16px;
    effective gap 8px in both bands — REF measured 8px at 390 and 1440).
- The reset/signup field units' `relative` wrappers are BARE on REF (v3's
  space-y-1.5 lands mt on the wrapper); the clone authors the documented
  `mt-1.5` restoration (the r42 sign-in pattern — v4's space-y mb lands on
  the inline Label where vertical margins are ignored).
- The form classes are authored verbatim (`space-y-4 sm:space-y-5` reset /
  `space-y-3 sm:space-y-4` signup + the bare `space-y-3` fields group) —
  the form's own top gap rides v4's natural mb on the preceding element
  (no restoration needed).

### The clone's current state (the gap)

The clone's two action buttons fire plain error Alerts ("Password reset is
not configured on this deployment" / "Sign up is disabled on this demo
deployment") — the pre-superset placeholders. The hidden flows did not
exist in the clone at all (the round's functional + visual gap).

## The fixes

1. `src/components/ui/alert.tsx` — add the `success` variant
   (`text-foreground bg-green-50/70 border-green-200 rounded-xl`), the
   measured sibling of the r33 `error` variant.
2. `src/app/api/auth/forgot-password/route.ts` (new) — POST {email}:
   zod-validate + the login-family rate limiter; ALWAYS `ok` (the
   anti-enumeration contract — no email transport is configured, and the
   response carries no account-existence signal either way).
3. `src/app/api/auth/signup/route.ts` (new) — POST {email, password,
   confirmPassword}: zod-validate (email + password min 8); duplicate
   email → `err` with REF's verbatim copy "A user with this email already
   exists"; new email → `hashPassword` + create User (name derived from
   the email local-part, role "employee") + `setSessionCookie` (the
   auto-login superset — the client redirects to /dashboard, which is
   already null-safe for an employee-less user); the rate limiter rides.
4. `src/app/login/page.tsx` — the view-swap refactor:
   - a `view` state ("signin" | "reset" | "reset-success" | "signup");
     the sign-in action buttons swap views (and clear the error/loading
     state); the back buttons return to "signin";
   - dedicated field state per view (resetEmail / signupEmail /
     signupPassword / signupConfirm — REF unmounts the fields on view
     swaps, so values do not persist);
   - the four hand-authored icon components (ArrowLeft + the slate-400
     Mail/Lock field pair + the success view's slate-700 Mail — all with
     REF's verbatim serialization + the older-lucide glyphs), defined
     AFTER the r44 slate-500 pair so the R44-B1/B2 anchor blocks stay
     scoped;
   - the two new views + the success view with the verbatim classes,
     copy, rhythm restorations, loading swaps, and Alert slots captured
     above; the Loader2 spinner reused (the r44-D2 family);
   - the client-side confirm-mismatch guard (the superset: an error
     Alert "Passwords do not match" before the fetch — the path is
     unmeasured on REF, so any reasonable behavior is a superset);
   - the root main gains `[--foreground:#09090b]` (the r42 `--ring`
     sibling).
5. Unit pins (tests/unit/recipes.test.ts) — the session-46 block (16
   pins): the reset view (A1-A5: the architecture, the back button, the
   title group + restoration, the field unit + the verbatim sibling input
   string, the CTA + the "Sending..." swap), the signup view (B1-B4: the
   form + fields group + the H2 restoration, the three units with ids +
   placeholders + the tail font pair, the CTA + the "Creating
   account..." swap, the duplicate-error Alert slot), the success view
   (C1-C3: the icon circle + the slate-700 mail, the title group + the
   email span, the green Alert + the bottom back button), the API routes
   (D1-D2: the anti-enumeration ok + the verbatim duplicate copy + the
   create+session path), and E1 (the `--foreground` pin).
6. Predecessor amendments (re-anchored to the sign-in form region — the
   measured surface they pin, now that the sibling input families exist):
   R38-G1 (the main class gains the foreground member), R38-A2
   (`md:text-sm` ×2 within the sign-in slice), R39-C1 (the ring triple ×3
   within the sign-in slice), R44-A2 (the three counts within the sign-in
   slice).
7. E2E: `tests/e2e/session46-login-flows.spec.ts` (6 tests) — the two
   view swaps (strings + fields + the back button returning to sign-in),
   the reset success flow (the green Alert + the email span), the signup
   duplicate error (REF's verbatim copy), and the two CTA loading states
   (the login-family route-interception hold).
8. `scripts/verify-r45.mjs` — the round pairs: both views' rendered
   surfaces both bands (desktop 1440 + mobile 390: the card height, the
   back/H2/form/CTA rhythm), the reset + signup input classes, the field
   icon colors (slate-400), the two loading interiors (the microtask
   snapshot), the success view (the circle + the Alert + the email span),
   the duplicate-error Alert, the `--foreground` resolution on the green
   Alert (rgb(9,9,11)), the at-rest sign-in regression (the r44 set).
   Normalizations: the sorted-set class comparison (tw-merge reorders),
   the documented-restoration member strip (`mt-4`/`mt-4 sm:mt-6`/
   `mt-1.5` supersets), the 8ms loading read.
9. Screenshots 176-179 (the reset view, the signup view, the success
   view + the duplicate error — REF + LOC pairs, both bands) → the
   260-PNG record. DB pristine check + `.env.example` re-verified.

## The verification gates

lint 0/0 · tsc ✓ · 697/697 unit (+16) · build ✓ · 209/209 E2E (+6) ·
verify-r45 10/10 · standing audits 5/5 · route sweep 12/12.

---

## Completion record (session 46, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **697/697 unit** (+16: A1-A6, B1-B4, C1-C3,
  D1-D2, E1) · build ✓ · **209/209 E2E** (+6 — the session46-login-flows
  spec: the reset view swap + the back button, the reset-success flow with
  the anti-enumeration green Alert, the signup view swap with the
  three-field contracts, the duplicate-email error with REF's verbatim
  copy, the two CTA loading states via route interception).
- **Predecessor amendments**: 5 — R38-G1 (the main class gains the
  `[--foreground:#09090b]` member), R18-E + R38-A2 + R39-C1 + R44-A2 (the
  four count pins re-anchored to the sign-in form region — the hidden
  views' four sibling inputs + two CTAs carry the same token members, so
  the page-wide counts now conflate two input families).
- **Live verification**: standing audits **5/5**, route sweep **12/12**,
  **verify-r45 13/13 MATCH** — the pairs: both views' rhythm both bands
  (the y/h geometry + the restoration-stripped classes; the raw mt/mb
  values drop out — REF's v3 space-y lands mt on following siblings,
  v4's lands mb on preceding ones, the SAME rendered gaps via the other
  margin side), the sibling input classes (sorted-set) + the slate-400
  icon colors, the reset-success view (the circle + the green Alert +
  the email span + the bottom back button), the duplicate-error Alert
  (canvas-rasterized bg **254,242,242,179** on BOTH apps — the lab()
  serialization split proven pixel-identical), the two CTA loading
  interiors, the `--foreground` resolution (the Alert's container color
  rgb(9,9,11) both apps; the raw token form is the documented trap-1
  split), the at-rest sign-in regression (the r44 set), and the
  action-button view swap (the logo/social unmount + the back restore).
- **Round-specific gotchas resolved en route**: (1) the workspace reset
  lost the previous window's uncommitted round-45 work — every contract
  re-derived from fresh live measurements (census scripts
  probe-r45-census-a..b10.mjs), nothing carried over unmeasured; (2) the
  11th login deploy (JS + CSS both) re-audited per the round-42 precedent
  — every r44 fix held on the new build (the icon family, the title row,
  the at-rest geometry, the failed-login Alert); the react-hot-toast
  block left the login's runtime set (the sonner block remains); (3) REF
  SILENTLY DROPPED the sidebar trigger's aria-label (the accessible name
  now rides the sr-only span alone) — the drawer opens identically on
  click (288px panel both apps), the clone's aria-label/type/aria-expanded
  stay kept supersets, and the standing probe's finder now matches either
  mechanism; (4) the comments-in-source trap fired once (a fresh comment
  quoting the retired input members inflated two count pins — reworded to
  prose); (5) the DB pristine check caught the loading-probe's live signup
  (users=2) — the throwaway probe user cleaned, the pristine tenant
  restored (users=1, employees=1, leaveBalances=2).
- **Screenshots**: 176-179 (10 PNG: the reset view, the reset-success
  view with the green Alert, the signup duplicate-error state, the mobile
  band of both views — REF + LOC pairs) → **262 PNG captures**. DB
  pristine. `.env.example` verified (keys match `.env`).
