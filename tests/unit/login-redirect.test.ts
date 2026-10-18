import { describe, expect, it } from "vitest";

import { resolveFromUrl } from "@/lib/login-redirect";

/**
 * Session 55 (R55-A, unit seam): the from_url resolver — the auth-boundary
 * round-trip's security gate. REF's guard/logout pass the FULL ABSOLUTE URL
 * (`https://eon.base44.app/settings`); the clone's historic handler only
 * honored path-form values (from.startsWith("/")). The resolver accepts
 * BOTH forms but ONLY same-origin absolute URLs — a foreign absolute URL,
 * a protocol-relative `//evil.com`, or a backslash-leading `/\evil.com`
 * are open-redirect vectors and resolve to null (the login then falls
 * back to the root, never the attacker's target).
 *
 * The paired-live evidence (scripts/r55-census.mjs): REF (D) guard
 * from_url=/settings → (E) round-trip lands /settings; the clone (pre-fix)
 * hardcoded /dashboard and lost the deep link.
 */
describe("resolveFromUrl (session 55, R55-A)", () => {
  const ORIGIN = "http://localhost:3100";

  it("passes a plain path-form from_url through", () => {
    expect(resolveFromUrl("/settings", ORIGIN)).toBe("/settings");
  });

  it("keeps the query string of a path-form from_url", () => {
    expect(resolveFromUrl("/payroll?tab=history", ORIGIN)).toBe("/payroll?tab=history");
  });

  it("extracts the path from a same-origin absolute URL (REF's format)", () => {
    expect(resolveFromUrl("http://localhost:3100/settings", ORIGIN)).toBe("/settings");
  });

  it("keeps the query string of a same-origin absolute URL", () => {
    expect(resolveFromUrl(`${ORIGIN}/settings?tab=2`, ORIGIN)).toBe("/settings?tab=2");
  });

  it("resolves the same-origin ROOT absolute URL to the root path", () => {
    // REF's (C) guard passes the full root URL — the round-trip must land
    // back on `/` (which serves the dashboard via the root rewrite).
    expect(resolveFromUrl(`${ORIGIN}/`, ORIGIN)).toBe("/");
  });

  it("rejects a foreign-origin absolute URL (open-redirect guard)", () => {
    expect(resolveFromUrl("https://evil.example.com/phish", ORIGIN)).toBeNull();
  });

  it("rejects a protocol-relative URL", () => {
    expect(resolveFromUrl("//evil.example.com", ORIGIN)).toBeNull();
  });

  it("rejects a backslash-leading path", () => {
    // browsers normalize \ to / in some contexts — /\evil.com must not
    // sneak past the leading-slash check
    expect(resolveFromUrl("/\\evil.example.com", ORIGIN)).toBeNull();
  });

  it("resolves null for null, empty, and non-URL garbage", () => {
    expect(resolveFromUrl(null, ORIGIN)).toBeNull();
    expect(resolveFromUrl("", ORIGIN)).toBeNull();
    expect(resolveFromUrl("not a url", ORIGIN)).toBeNull();
  });
});
