import { test, expect } from "@playwright/test";

// Session-73 (parity round 72) — the security-isolation rung (R73-B).
//
// Context: the r68 header census measured REF serving a 5-header security
// set but NO cross-origin isolation policies — re-measured live this
// round (curl -sI on https://eon.base44.app/login and /): REF serves NO
// Cross-Origin-Opener-Policy, NO Cross-Origin-Embedder-Policy, and NO
// Cross-Origin-Resource-Policy on any surface. The session_157 frontier
// named "a security-headers second pass (COOP/COEP/CORP — REF serves
// none, the superset stays open)" — this round ships it.
//
// The trio's design (next.config.ts headers(), the r69 catch-all):
//   cross-origin-opener-policy: same-origin
//     — windows only share references with same-origin openers;
//       kills the cross-window reference class of attacks.
//   cross-origin-resource-policy: same-origin
//     — no other origin may embed this origin's resources (the
//       hotlink/embedding protection); lands on EVERY response the
//       catch-all covers (pages, /api/*, /_next/static chunks,
//       public/ assets — verified this round).
//   cross-origin-embedder-policy: require-corp
//     — the document may only load subresources that opt in via CORP
//       or CORS; EARNED because the whole-source URL sweep (session-70,
//       re-verified) reads ZERO external runtime resources — every
//       asset self-hosted. The CORP:same-origin on every own response
//       (the same catch-all) is exactly the opt-in the own loads need.
//
// All three are response-layer (non-visual): the byte-stability chain
// is unaffected by construction — headers change zero rendered bytes.
//
// The pin follows the R69 pattern verbatim: presence assertions on a
// PAGE route and an API route against the served standalone response —
// RED on the unpatched build (the headers are absent), GREEN after the
// next.config.ts patch.

const EXPECTED = {
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "cross-origin-embedder-policy": "require-corp",
} as const;

test.describe("session-73 security-isolation rung (R73-B, the cross-origin trio)", () => {
  for (const [route, kind] of [
    ["/login", "page"],
    ["/api/health", "api"],
  ] as const) {
    test(`R73-B${kind === "api" ? "b" : "a"}: the ${kind} route ${route} serves the cross-origin isolation trio`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBeLessThan(400);
      const headers = res.headers();
      for (const [name, value] of Object.entries(EXPECTED)) {
        expect(headers[name], `${name} on ${route}`).toBe(value);
      }
    });
  }

  test("R73-Bc: the static-asset surface carries the trio too (the catch-all covers subresources)", async ({ request }) => {
    // COEP require-corp gates subresource loads: the own static assets
    // must carry CORP same-origin for the document's loads to pass.
    // The service worker script is the round's own PWA artifact — the
    // cleanest static-surface probe.
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
    expect(headers["cross-origin-embedder-policy"]).toBe("require-corp");
  });
});
