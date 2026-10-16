"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function GoogleIcon() {
  return (
    /* REF's glyph (session-39 pixel-diff forensics; session-45: the path
       attrs authored in REF's order — the geometry data first, the fill
       second). */
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    /* REF's glyph (session-39 pixel-diff forensics; session-45: REF's own
       square variant — the blue square top-right, the green bottom-left,
       NOT the real logo's arrangement). */
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M13 1h10v10H13z" />
      <path fill="#7FBA00" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    /* REF's glyph (session-39 pixel-diff forensics; session-45: the fill
       lives ON THE PATH in explicit black — no svg-level fill, the logo
       renders black regardless of the button's text color). */
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#000000"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
    </svg>
  );
}

/* REF's field icons (session-45): the login build ships the OLDER lucide
   revision — the envelope body rect renders BEFORE the flap path, and the
   flap's arc is the older curve. The stroke attrs + the lucide prefix
   classes + the v3 transform member mirror REF's serialization; the color
   is REF's slate-500 (the icons sit darker than a slate-400 would render). */
function MailFieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockFieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-lock absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error?.message ?? "Sign in failed");
        return;
      }
      const from = params.get("from_url");
      router.replace(from && from.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Reference login shell (session-4 re-measurement; session-39 re-audit
       after REF's login redeploy; session-43 re-audit after the JS+CSS
       redeploy): a <main> canvas with the slate-50 → slate-100 sRGB
       gradient + p-4 + the login build's zinc-950 foreground
       (computed rgb(9,9,11) on the typed text — the login CSS build uses
       the zinc palette, the app build the neutral one) and the login-scoped
       zinc-950 --ring override (REF's login build sets it at :root; the
       Sign in's ring-ring token resolves #09090b here while the app pages
       keep the shared neutral token), glass card (rounded-2xl, white/95,
       p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10), top h-1 accent bar, the
       glow-wrapped circular logo, the responsive 44/48px inputs
       (rounded-xl, bg-slate-50/50, border-slate-200, pl-10, 16px→14px
       responsive font) and the responsive sign-in action. */
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_bottom_right,#f8fafc,#f1f5f9)] p-4 text-[#09090b] [--ring:#09090b]">
      {/* REF's runtime focus-cascade mirror (session-45): the platform
          injects a second Tailwind stylesheet INLINE (after the linked
          one) on the login — its two plain-focus rules sit at equal
          specificity but later in document order than the linked
          focus-visible ring rule, so they WIN: the keyboard-focused
          inputs render the slate-400 ring, while the Sign in's token ring
          is untouched (the button's tail carries no plain-focus ring
          member). This element renders in place — a plain style tag (no
          precedence prop, so React 19 keeps it in the body, after the
          head links) — reproducing the same winning cascade position. */}
      <style>{`.focus\\:border-slate-400:focus{--tw-border-opacity:1;border-color:rgb(148 163 184 / var(--tw-border-opacity, 1))}.focus\\:ring-slate-400:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(148 163 184 / var(--tw-ring-opacity, 1))}`}</style>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border-0 bg-white/95 text-[#09090b] shadow-2xl backdrop-blur-sm">
          {/* REF's card rides its login build's --card-foreground, which is
              zinc-950 (#09090B) — NOT the app build's neutral-950 token
              (R38-C: the typed input text computed rgb(9,9,11) on REF vs
              the clone's rgb(10,10,10); pinned literally here so the app
              pages keep the shared token). */}
          {/* Reference top accent bar: slate-200 → slate-300 → slate-200. */}
          <div
            className="absolute left-0 right-0 top-0 h-1 bg-[linear-gradient(to_right,#e2e8f0,#cbd5e1,#e2e8f0)]"
            aria-hidden="true"
          />
          {/* REF's card body (round 33 re-measure): ONE padded wrapper
              (p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10) > ONE
              `flex flex-col items-center text-center space-y-6
              sm:space-y-8` stack — logo (96), the title block
              (space-y-2 sm:space-y-3), then the w-full column (social
              space-y-3 + the my-6 or-divider + the form). */}
          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {/* Circular brand mark — REF's structure (session-39): a
                relative group wrapper, the blur-xl slate gradient glow
                (opacity-30 → 40 on hover), then the self-hosted logo copy
                (public/eon-logo.png) in the ring-wrapped shadowed span. */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#e2e8f0,#cbd5e1)] rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
              <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
                <img src="/eon-logo.png" alt="Eon HR logo" className="aspect-square h-full w-full object-cover" />
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome to Eon HR
              </h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium">
                Sign in to continue
              </p>
            </div>

            <div className="w-full">
            {/* REF's w-full column (session-43 re-measure): THREE direct
                children — the social space-y-3 group (ONLY the three
                buttons), the my-6 or-divider, and the form. The clone's
                former single space-y-3 wrapper around all three retired
                (render-neutral: the divider's my-6 owns the 24px gaps
                either way). */}
            <div className="space-y-3">
            {/* REF's social buttons (session-40 re-measure): NO type attr
                (the latest redeploy dropped it — REF renders type:null; they
                sit outside the form so it was inert), text-[16px] + group,
                the icon in a transition-transform wrapper — ONLY Google's
                carries the -ml-4 pull (REF's Microsoft/Apple divs have
                none; the icons sit at 85/85/98 on their own text widths)
                — and the label span-wrapped. */}
            <button
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
              onClick={() => setError("Social sign-in is not configured on this deployment")}
            >
              <div className="transition-transform duration-200 -ml-4">
                <GoogleIcon />
              </div>
              <span>Continue with Google</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
              onClick={() => setError("Social sign-in is not configured on this deployment")}
            >
              <div className="transition-transform duration-200">
                <MicrosoftIcon />
              </div>
              <span>Continue with Microsoft</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
              onClick={() => setError("Social sign-in is not configured on this deployment")}
            >
              <div className="transition-transform duration-200">
                <AppleIcon />
              </div>
              <span>Continue with Apple</span>
            </button>
            </div>

            {/* REF's or-divider (session-39): one continuous 1px slate-200
                line (absolutely positioned, vertically centered) with the
                centered "or" chip on a white bg — NOT two line segments. */}
            <div className="relative my-6" role="separator" aria-label="or">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div data-orientation="horizontal" role="none" className="shrink-0 h-[1px] w-full bg-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">or</span>
              </div>
            </div>

            {/* REF's form (round 33): space-y-4 sm:space-y-5 — two field
                DIVs (each space-y-1.5, the label + the iconed input: the
                session-43 re-measure adopted REF's wrapper with the
                explicit mt-1.5 kept on the relative block — v4's space-y
                lands on the inline label where vertical margins are
                ignored, the trap-6 restoration), then the alert, then the
                space-y-3 actions (button + links). */}
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  {/* Reference: envelope icon inline inside the field. */}
                  <div className="relative mt-1.5">
                    <MailFieldIcon />
                    {/* REF's login-build input verbatim (session-43): the
                        ring-2/offset-2 base with the ring TOKEN in base
                        (the page tail's PLAIN-focus slate-400 ring member
                        survives the tailwind-merge — REF keeps both), the
                        base-size font in base with the md member at
                        base-end, and NO shadow/transition members (the
                        round-39 two-build split counters retired — REF's
                        new base ships neither). Hand-authored: the shared
                        v4 Input cannot shed its base members through the
                        merge. */}
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  {/* Reference: lock icon inline inside the field. */}
                  <div className="relative mt-1.5">
                    <LockFieldIcon />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* REF's error surface is the shadcn Alert — the translucent
                  red-50/70 bg + red-200 border + rounded-xl p-4 wrapper with a
                  text-red-700 text-sm description (live-measured, round 33). */}
              {error ? (
                <Alert variant="error">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-3">
                {/* Reference sign-in action (session-39, re-measured
                    round-40, session-43 amendment): the dark slate block,
                    the responsive 44/48px height, the tight padding pair +
                    row gap, and the 200ms all-props motion; the ring member
                    is REF's ring-ring TOKEN (the r38 hex pin retired) — it
                    resolves the login-scoped zinc-950 --ring set on the
                    root main. */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* REF's links row (session-39): flex-col at mobile (the
                    clone's flat row wrapped both links to two lines at
                    390px), row ≥sm; Forgot carries font-medium +
                    transition-colors; the Sign up span is slate-700. */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    onClick={() => setError("Password reset is not configured on this deployment")}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => setError("Sign up is disabled on this demo deployment")}
                  >
                    Need an account? <span className="font-medium text-slate-700">Sign up</span>
                  </button>
                </div>
              </div>
            </form>
            </div>
            </div>
          </div>
        </div>
        {/* REF's mobile-only spacer below the card (session-39): an
            invisible &nbsp; line (sm:hidden) that pins the card to the
            canvas top and gives the mobile page its 18px of scroll
            breathing room — body scrollHeight 862 at 390×844. */}
        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>
      </div>
    </main>
  );
}
