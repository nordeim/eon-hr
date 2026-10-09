// Next.js instrumentation hook — runs once when the server boots (dev and
// standalone production alike, before any route handles a request).
//
// Purpose: enforce the production auth-secret contract at boot time.
// src/lib/auth.ts falls back to an insecure dev constant when AUTH_SECRET is
// unset, which is fine for local development but must never happen in a real
// deployment — the server refuses to start instead. (Pinned by
// tests/unit/auth.test.ts "production secret guard".)

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionSecret } = await import("./lib/auth");
    assertProductionSecret();
  }
}
