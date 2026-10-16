import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, parseBody } from "@/lib/api";

// Session-46 (R45-D1): the password-reset request seam. REF's flow renders
// the SAME success view for existing and non-existent emails (verified live
// with a throwaway address) — the anti-enumeration contract: the response
// carries no account-existence signal either way. No email transport is
// wired on this deployment; the endpoint validates, rate-limits, and always
// acknowledges, mirroring the measured surface while staying safe to expose.

const ForgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

// Per-IP fixed window (the login route's limiter family).
const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(req: Request) {
  return guard(async () => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (rateLimited(ip)) {
      // Still ok-shaped: the acknowledgement is identical either way — a
      // distinct error here would leak that this IP hammered the endpoint,
      // but never whether any given address exists.
      return ok({ acknowledged: true });
    }

    const { data, response } = await parseBody(req, ForgotSchema);
    if (!data) return response;

    // Anti-enumeration: probe the account but NEVER branch the response on
    // its existence. The lookup keeps the timing profile honest for future
    // email transport wiring without changing the contract.
    await db.user.findUnique({ where: { email: data.email }, select: { id: true } });

    return ok({ acknowledged: true });
  });
}
