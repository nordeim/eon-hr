import { createHmac } from "node:crypto";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

// Unit tests for the auth seams. import.meta / next/headers are NOT loaded —
// we re-implement the two pure functions under test from their source to
// avoid pulling server-only modules into the node environment... NO: we
// import the real module. next/headers is only imported lazily inside
// cookie functions, so importing the module in node works.

process.env.AUTH_SECRET = "unit-test-secret-at-least-16-chars";
const auth = await import("@/lib/auth");

describe("password hashing (scrypt)", () => {
  it("hashes and verifies a password", () => {
    const hash = auth.hashPassword("Sup3rSecret!");
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(auth.verifyPassword("Sup3rSecret!", hash)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const hash = auth.hashPassword("Sup3rSecret!");
    expect(auth.verifyPassword("wrong", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", () => {
    expect(auth.verifyPassword("x", "not-a-hash")).toBe(false);
    expect(auth.verifyPassword("x", "scrypt$only$twoparts")).toBe(false);
  });

  it("salts every hash uniquely", () => {
    expect(auth.hashPassword("same")).not.toBe(auth.hashPassword("same"));
  });
});

describe("session token (HMAC)", () => {
  it("round-trips a user id", () => {
    const token = auth.createSessionToken("user-123");
    expect(auth.parseSessionToken(token)).toBe("user-123");
  });

  it("rejects a tampered payload (signature mismatch)", () => {
    const token = auth.createSessionToken("user-123");
    const [uid, iat] = token.split(".");
    const forged = `user-999.${iat}.${token.split(".")[2]}`;
    expect(auth.parseSessionToken(forged)).toBeNull();
  });

  it("rejects garbage and truncated tokens", () => {
    expect(auth.parseSessionToken("")).toBeNull();
    expect(auth.parseSessionToken(null)).toBeNull();
    expect(auth.parseSessionToken("abc")).toBeNull();
    expect(auth.parseSessionToken("a.b.c")).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = auth.createSessionToken("user-123");
    const payload = token.slice(0, token.lastIndexOf("."));
    const otherMac = createHmac("sha256", "another-secret-16-chars!!")
      .update(payload)
      .digest("base64url");
    expect(auth.parseSessionToken(`${payload}.${otherMac}`)).toBeNull();
  });

  it("rejects expired tokens (TTL)", () => {
    const past = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 8; // 8 days
    const payload = `user-123.${past}`;
    const mac = createHmac("sha256", process.env.AUTH_SECRET!)
      .update(payload)
      .digest("base64url");
    expect(auth.parseSessionToken(`${payload}.${mac}`)).toBeNull();
  });

  it("rejects future-issued tokens (clock skew guard)", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const payload = `user-123.${future}`;
    const mac = createHmac("sha256", process.env.AUTH_SECRET!)
      .update(payload)
      .digest("base64url");
    expect(auth.parseSessionToken(`${payload}.${mac}`)).toBeNull();
  });
});

describe("production secret guard (assertProductionSecret)", () => {
  const realNodeEnv = process.env.NODE_ENV;
  const realSecret = process.env.AUTH_SECRET;
  // NODE_ENV is typed read-only; tests mutate it through a widened view.
  const setEnv = (key: "NODE_ENV" | "AUTH_SECRET", value?: string) => {
    (process.env as Record<string, string | undefined>)[key] = value;
  };

  beforeEach(() => {
    setEnv("AUTH_SECRET", undefined);
  });

  afterEach(() => {
    setEnv("NODE_ENV", realNodeEnv);
    setEnv("AUTH_SECRET", realSecret);
  });

  it("throws in production when AUTH_SECRET is unset", () => {
    setEnv("NODE_ENV", "production");
    setEnv("AUTH_SECRET", undefined);
    expect(() => auth.assertProductionSecret()).toThrow(/AUTH_SECRET/);
  });

  it("throws in production when AUTH_SECRET is shorter than 16 chars", () => {
    setEnv("NODE_ENV", "production");
    setEnv("AUTH_SECRET", "short");
    expect(() => auth.assertProductionSecret()).toThrow(/AUTH_SECRET/);
  });

  it("passes in production with a 16+ char AUTH_SECRET", () => {
    setEnv("NODE_ENV", "production");
    setEnv("AUTH_SECRET", "a-valid-production-secret");
    expect(() => auth.assertProductionSecret()).not.toThrow();
  });

  it("passes outside production even with no AUTH_SECRET (dev fallback)", () => {
    setEnv("NODE_ENV", "development");
    setEnv("AUTH_SECRET", undefined);
    expect(() => auth.assertProductionSecret()).not.toThrow();
  });
});
