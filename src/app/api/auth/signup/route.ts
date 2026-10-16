import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie, hashPassword } from "@/lib/auth";
import { ok, err, guard, parseBody } from "@/lib/api";

// Session-46 (R45-D2): the sign-up seam behind the login's "Sign up" view.
// REF's duplicate-email error renders verbatim "A user with this email
// already exists" (measured live with the demo account — REF returns it
// even when the password is the correct demo password). The new-email path
// is the functional SUPERSET: the account is created and the session cookie
// set (auto-login), so the client redirects to /dashboard — which is
// already null-safe for an employee-less user.

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
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
      return err("FORBIDDEN", "Too many attempts. Try again in 15 minutes.");
    }

    const { data, response } = await parseBody(req, SignupSchema);
    if (!data) return response;

    // The confirm guard rides the client too (the superset) — the server
    // re-checks so the seam is safe on its own.
    if (data.password !== data.confirmPassword) {
      return err("VALIDATION", "Passwords do not match");
    }

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      // REF's verbatim duplicate copy (R45-D2).
      return err("CONFLICT", "A user with this email already exists");
    }

    const created = await db.user.create({
      data: {
        email: data.email,
        passwordHash: hashPassword(data.password),
        name: data.email.split("@")[0] || "New User",
        role: "employee",
      },
    });

    // The auto-login superset: the fresh account rides straight into the
    // app (the dashboard renders the employee-less state safely).
    await setSessionCookie(created.id);
    return ok({ id: created.id, name: created.name, email: created.email, role: created.role });
  });
}
