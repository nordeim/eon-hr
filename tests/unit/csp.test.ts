import { describe, it, expect } from "vitest";
import { buildCsp } from "@/lib/csp";

// Session-70 (R70-B) — the CSP nonce pipeline pins; amended session-71
// (R71-A) for the style-src elem/attr SPLIT.
//
// The policy is the pure superset (REF serves none — measured in the
// r68 header census). These pins lock the exact directive shape so the
// strictness cannot silently erode: a future edit that swaps 'strict-
// dynamic' for a wildcard, drops the nonce, re-merges the blanket
// style-src, or adds the transport-breaking upgrade-insecure-requests
// fails here.

describe("R70-B: buildCsp (the production shape)", () => {
  const csp = buildCsp("test-nonce-123");

  it("carries the strict 'self' baseline with the nonce + strict-dynamic", () => {
    expect(csp).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'nonce-test-nonce-123' 'strict-dynamic'",
        "style-src-elem 'self' 'nonce-test-nonce-123'",
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ].join("; "),
    );
  });

  it("R71-A: the style-src elem/attr split — NO blanket style-src directive", () => {
    // Elements (<style>) must be nonce'd; attributes (Radix/vaul/recharts
    // dynamic values) keep 'unsafe-inline' — the split replaces the
    // blanket directive entirely (it would shadow the specific pair).
    expect(csp).toContain("style-src-elem 'self' 'nonce-test-nonce-123'");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    expect(csp).not.toMatch(/(?:^|; )style-src /);
    // Production elements take NO 'unsafe-inline' (dev-only — Turbopack
    // injects <style> elements for CSS in dev).
    expect(csp).not.toContain("style-src-elem 'self' 'nonce-test-nonce-123' 'unsafe-inline'");
  });

  it("the nonce is per-call (each request mints its own)", () => {
    expect(buildCsp("another-nonce")).toContain("'nonce-another-nonce'");
    expect(csp).toContain("'nonce-test-nonce-123'");
  });

  it("production carries NO unsafe-eval and NO upgrade-insecure-requests", () => {
    expect(csp).not.toContain("unsafe-eval");
    // UIR would upgrade the plain-HTTP standalone's subresources to https
    // and break the local + E2E transport (HSTS covers the TLS case).
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});

describe("R70-B: buildCsp (the dev branch)", () => {
  const dev = buildCsp("dev-nonce", true);

  it("adds the fast-refresh eval + the HMR websocket allowance", () => {
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("connect-src 'self' ws:");
  });

  it("R71-A: dev's style-src-elem keeps 'unsafe-inline' (Turbopack's injected styles)", () => {
    expect(dev).toContain("style-src-elem 'self' 'nonce-dev-nonce' 'unsafe-inline'");
    expect(dev).toContain("style-src-attr 'unsafe-inline'");
    expect(dev).not.toMatch(/(?:^|; )style-src /);
  });

  it("keeps the nonce + strict-dynamic core (dev scripts ride it too)", () => {
    expect(dev).toContain("'nonce-dev-nonce'");
    expect(dev).toContain("'strict-dynamic'");
  });
});
