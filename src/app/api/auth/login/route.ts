import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie, hashPassword } from "@/lib/auth";
import { ok, err, guard, parseBody } from "@/lib/api";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Simple in-memory rate limiter (per-IP, fixed window) — see AGENTS.md.
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

    const { data, response } = await parseBody(req, LoginSchema);
    if (!data) return response;

    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !user.active || !verifyPassword(data.password, user.passwordHash)) {
      return err("UNAUTHENTICATED", "Invalid email or password");
    }

    await setSessionCookie(user.id);
    return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}
