import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

// ---------------------------------------------------------------------------
// HMAC-signed cookie sessions + scrypt password hashing.
//
// Design notes:
// - Stateless session: uid + issued-at + HMAC-SHA256 with AUTH_SECRET. The
//   user record is re-read from SQLite on every getSession() call, so
//   deactivation or role changes take effect immediately (no revocation
//   lag window beyond the cookie lifetime).
// - Passwords: scrypt with per-user random salt (N=16384, r=8, p=1) —
//   memory-hard, no dependency on bcrypt native builds.
// - The cookie is httpOnly + sameSite=lax + secure in production.
// ---------------------------------------------------------------------------

const COOKIE_NAME = "eon_session";
const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  // Dev-only fallback — production deployments must set AUTH_SECRET
  // (see .env.example; next.config fails the production build without it).
  return "insecure-dev-secret-do-not-use-in-production";
}

export function assertProductionSecret(): void {
  if (process.env.NODE_ENV === "production" && process.env.AUTH_SECRET) {
    if (process.env.AUTH_SECRET.length < 16) {
      throw new Error("AUTH_SECRET must be at least 16 characters in production");
    }
  }
}

// ---- password hashing ----

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

// ---- session token ----

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}.${Math.floor(Date.now() / 1000)}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [userId, issuedAt] = payload.split(".");
  if (!userId || !issuedAt) return null;
  const age = Math.floor(Date.now() / 1000) - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_S) return null;
  return userId;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_S,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  employeeId: string | null;
}

/** Read the current session user (null when signed out / inactive). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = parseSessionToken(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      active: true,
      employee: { select: { id: true } },
    },
  });
  if (!user || !user.active) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    employeeId: user.employee?.id ?? null,
  };
}
