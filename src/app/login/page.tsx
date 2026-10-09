"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    <svg viewBox="0 0 23 23" className="h-5 w-5" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.05 2.49-4.51 2.6-4.58-1.42-2.07-3.62-2.36-4.4-2.39-1.87-.19-3.65 1.1-4.6 1.1-.95 0-2.41-1.07-3.96-1.04-2.04.03-3.92 1.19-4.97 3.01-2.12 3.68-.54 9.12 1.53 12.11 1.01 1.46 2.21 3.09 3.79 3.03 1.52-.06 2.1-.98 3.94-.98s2.36.98 3.97.95c1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.63-3.33 1.66-3.42-.04-.02-3.17-1.22-3.2-4.84zM14.16 3.5c.83-1.01 1.4-2.42 1.24-3.82-1.22.05-2.71.82-3.58 1.83-.78.9-1.46 2.35-1.28 3.72 1.37.11 2.77-.7 3.62-1.73z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-secondary/60"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
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
    <div className="flex min-h-screen items-center justify-center bg-secondary/60 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Briefcase className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">EON HR</h1>
        </div>

        <Card className="border-border/80 shadow-xl shadow-black/5">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Eon HR</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button type="button" variant="outline" className="h-11 w-full" onClick={() => setError("Social sign-in is not configured on this deployment")}>
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button type="button" variant="outline" className="h-11 w-full" onClick={() => setError("Social sign-in is not configured on this deployment")}>
                <MicrosoftIcon />
                Continue with Microsoft
              </Button>
              <Button type="button" variant="outline" className="h-11 w-full" onClick={() => setError("Social sign-in is not configured on this deployment")}>
                <AppleIcon />
                Continue with Apple
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3" role="separator" aria-label="or">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Sign in
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setError("Password reset is not configured on this deployment")}>
                Forgot password?
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setError("Sign up is disabled on this demo deployment")}>
                Need an account? <span className="font-medium text-primary">Sign up</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
