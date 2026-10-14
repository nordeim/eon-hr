"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    /* REF's glyph (session-39 pixel-diff forensics): the four squares in
       the 24-box — NOT the clone's old 23-box (the ~4% scale drift). */
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    /* REF's glyph (session-39 pixel-diff forensics): the classic two-path
       Apple logo — NOT the clone's old alternate glyph. */
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
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
       after REF's login redeploy): a <main> canvas with the slate-50 →
       slate-100 sRGB gradient + p-4 + the login build's zinc-950 foreground
       (computed rgb(9,9,11) on the typed text — the login CSS build uses
       the zinc palette, the app build the neutral one), glass card
       (rounded-2xl, white/95, p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10),
       top h-1 accent bar, the glow-wrapped circular logo, the responsive
       44/48px inputs (rounded-xl, bg-slate-50/50, border-slate-200, pl-10,
       16px→14px responsive font) and the responsive sign-in action. */
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_bottom_right,#f8fafc,#f1f5f9)] p-4 text-[#09090b]">
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome to Eon HR
              </h1>
              <p className="text-sm font-medium text-slate-500 sm:text-base">
                Sign in to continue
              </p>
            </div>

            <div className="w-full">
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
                DIVs (each `space-y-1.5`: label + the iconed input), then
                the alert, then the space-y-3 actions (button + links). */}
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  {/* Reference: envelope icon inline inside the field. The
                      v3 space-y-1.5 put mt on this BLOCK (v4 would put mb on
                      the inline label — ignored vertically; explicit mt-1.5). */}
                  <div className="relative mt-1.5">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      className="h-11 sm:h-12 text-base md:text-sm rounded-xl border-slate-200 bg-slate-50/50 py-2 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus-visible:ring-slate-400 shadow-none transition-none ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  {/* Reference: lock icon inline inside the field. */}
                  <div className="relative mt-1.5">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      className="h-11 sm:h-12 text-base md:text-sm rounded-xl border-slate-200 bg-slate-50/50 py-2 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus-visible:ring-slate-400 shadow-none transition-none ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2"
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
                    round-40): the dark slate block, the responsive
                    44/48px height, the tight padding pair + row gap, and
                    the 200ms all-props motion; round-40 added the login
                    build's Button base members (the ring-offset
                    background token + the svg guards — inert at rest)
                    for DOM class parity. The ring color stays the
                    zinc-950 literal (the two-build split). */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09090b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Sign in
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
