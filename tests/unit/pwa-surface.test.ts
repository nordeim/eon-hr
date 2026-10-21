import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

// Session-72 (R72-B) — the PWA/offline surface pins.
//
// The r72 census measured REF: login-only manifest linkage (stale
// platform-template description, EXTERNAL supabase icons), no manifest
// on the authed shell, ZERO service workers. The clone already
// superSETS the manifest surface (every-page linkage, self-hosted
// icons — the standing zero-external-resources policy); this round adds
// the offline shell. These pins lock the SW's semantic contract (the
// versioned cache, the never-cache-HTML design, the offline fallback),
// the offline page's CSP-clean construction, and the manifest's
// self-hosted superset so they cannot silently erode.

const repo = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(repo, rel), "utf8");

describe("R72-B: the service worker (public/sw.js)", () => {
  const sw = read("public/sw.js");

  it("exists and pins the versioned cache name", () => {
    // Session-74 amendment (R74-C3): the r72 literal `eon-hr-shell-r72`
    // became the generation-stamped SHELL_CACHE — the sw update mechanism
    // (install re-fires only on sw.js byte change) means an un-bumped
    // name froze the shell at r72 bytes for every existing client; the
    // generation constant + the shell-drift tripwire (R74-C1 below) now
    // enforce the bump protocol.
    expect(existsSync(path.join(repo, "public/sw.js"))).toBe(true);
    expect(sw).toContain("eon-hr-shell-r74");
  });

  it("precaches the static shell including the offline fallback", () => {
    expect(sw).toContain("offline.html");
    expect(sw).toContain("manifest.json");
    expect(sw).toContain("icon-192.png");
  });

  it("caches /_next/static chunks cache-first but NEVER page HTML", () => {
    // The static-asset branch is scoped to /_next/static/ only; page
    // navigations are network-only with the offline fallback — the
    // authed-HTML leak-free design (no cached HTML is ever served).
    expect(sw).toContain("/_next/static/");
    expect(sw).toContain("navigate");
    // The navigation branch fetches the network and falls back to the
    // cached offline page — it must NOT consult the cache for the page
    // itself (the negative: no caches.match of the request in the
    // navigation branch is asserted structurally by the offline
    // fallback being the ONLY caches.match in the file).
    const matches = sw.match(/caches\.match\(/g) ?? [];
    expect(matches.length, "exactly one caches.match — the offline.html fallback").toBe(1);
    expect(sw).toContain("caches.match(offlineUrl)");
  });

  it("activates immediately and cleans stale caches", () => {
    expect(sw).toContain("skipWaiting");
    expect(sw).toContain("clients.claim");
  });
});

// Session-74 (R74-C) — the SW cache-lifecycle hardening pins: the
// found-and-fixed gap of the round's fresh-eyes audit of the r72-era
// worker. Two defects the r72 design left open:
//   (a) THE FROZEN SHELL — the SHELL precache re-fetches only at the
//       install event, and install re-fires only when sw.js bytes
//       change; an un-bumped cache name meant every existing client
//       held the r72-era shell bytes indefinitely (a latent update
//       bug: the day a shell asset changes, every installed client
//       serves the stale copy forever).
//   (b) THE UNBOUNDED CHUNK CACHE — /_next/static chunks accumulated
//       cache-first into the same-named cache across every deploy
//       with nothing evicting them (a slow storage leak).
// The amendment (public/sw.js): the GEN constant + the
// generation-stamped SHELL_CACHE (bump on any shell-asset change;
// the activate sweep migrates old-generation clients) + the stable
// CHUNKS_CACHE (immutable chunks survive generation bumps — no
// re-download) + the CHUNKS_CAP oldest-first trim on every chunk put.
// These pins lock the mechanism AND the bump protocol executable:
// the shell-drift tripwire pairs the SHELL asset bytes to the
// generation — an asset edit without a bump goes RED with the
// message that guides it.
describe("R74-C: the SW cache-lifecycle (the generation mechanism + the bound)", () => {
  const sw74 = read("public/sw.js");
  const gen = sw74.match(/const GEN = "([^"]+)"/)?.[1];

  it("R74-C0: carries the generation mechanism (GEN + the stamped shell cache + the stable chunk cache + the cap)", () => {
    expect(gen, "the GEN constant exists in public/sw.js").toBeTruthy();
    expect(sw74, "SHELL_CACHE derives from GEN (literal-consistency)").toContain(`eon-hr-shell-${gen}`);
    expect(sw74, "CHUNKS_CACHE is the stable cross-generation name").toContain("eon-hr-chunks");
    const cap = Number(sw74.match(/const CHUNKS_CAP = (\d+)/)?.[1]);
    expect(Number.isFinite(cap), "CHUNKS_CAP exists").toBeTruthy();
    expect(cap, "the cap is a sane bound (dozens of chunks per build)").toBeGreaterThan(20);
  });

  it("R74-C1: the shell-drift tripwire — the SHELL asset bytes are pinned to the generation", () => {
    // The sha256 over the six SHELL assets (the exact SHELL list the
    // install event precaches), digest-prefixed with the GEN so BOTH
    // sides of the pairing lock: an asset edit without a GEN bump goes
    // RED, and a GEN bump without the digest update goes RED.
    const assets = ["offline.html", "manifest.json", "icon-192.png", "icon-512.png", "eon-logo.png", "og-image.png"];
    const h = crypto.createHash("sha256");
    for (const a of assets) h.update(readFileSync(path.join(repo, "public", a)));
    const pair = `${gen}:${h.digest("hex").slice(0, 32)}`;
    expect(pair, "a SHELL asset changed OR the generation bumped — bump GEN in sw.js AND update this pinned pair (the activate sweep migrates old-generation clients)").toBe("r74:37b1d2ee6cc95c840bee0eaba2ec3a3b");
  });

  it("R74-C2: the chunks ride the stable cache with the oldest-first bound on put", () => {
    expect(sw74, "the chunk branch opens the stable chunk cache").toContain("caches.open(CHUNKS_CACHE)");
    expect(sw74, "the put-time bound check exists").toMatch(/keys\.length > CHUNKS_CAP/);
    expect(sw74, "the trim deletes the oldest entries (insertion-order assumption documented)").toMatch(/keys\.slice\(0,/);
    // The bound lives ONLY on the chunk branch: the navigation branch
    // stays the leak-free design (page HTML never cached — the r72
    // contract re-pinned above).
    const matches = sw74.match(/caches\.match\(/g) ?? [];
    expect(matches.length, "still exactly one caches.match — the offline.html fallback").toBe(1);
  });

  it("R74-C3: the activate sweep keeps exactly the current generation pair", () => {
    expect(sw74).toMatch(/k !== SHELL_CACHE && k !== CHUNKS_CACHE/);
  });
});

describe("R72-B: the offline fallback page (public/offline.html)", () => {
  const html = read("public/offline.html");

  it("carries the marker text the E2E pair pins", () => {
    expect(html).toContain("You're offline");
    expect(html).toContain("Eon HR");
  });

  it("is CSP-clean by construction — zero <script>, zero <style> ELEMENTS", () => {
    // Public files skip the proxy (no CSP today), but the page stays
    // valid even if the policy ever extends to public surfaces: inline
    // style ATTRIBUTES only (style-src-attr 'unsafe-inline' covers
    // them), no scripts, no style elements.
    expect(html).not.toMatch(/<script/);
    expect(html).not.toMatch(/<style/);
    expect(html).toMatch(/style="/);
  });
});

describe("R72-B: the manifest superset contract (public/manifest.json)", () => {
  const manifest = JSON.parse(read("public/manifest.json")) as {
    name: string;
    icons: { src: string }[];
    start_url: string;
    display: string;
  };

  it("serves SELF-HOSTED icons (REF's are external supabase URLs)", () => {
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/"), `the icon src is relative: ${icon.src}`).toBeTruthy();
      expect(icon.src, "no external icon URLs").not.toContain("http");
    }
  });

  it("is the honest Eon HR identity (REF's description is stale platform text)", () => {
    expect(manifest.name).toBe("Eon HR");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
  });
});

describe("R72: the root-layout registration + TT bootstrap (source pins)", () => {
  const layout = read("src/app/layout.tsx");

  it("carries the nonced SW registration (production-only render)", () => {
    expect(layout).toContain("SW_REGISTRATION");
    expect(layout).toContain("serviceWorker");
    // The registration target: /sw.js (the template literal single-quotes
    // it — the semantic contract is the path, not the authoring style).
    expect(layout).toContain("/sw.js");
    expect(layout).toContain('process.env.NODE_ENV === "production"');
  });

  it("carries the nonced TT default-policy bootstrap (production-only render)", () => {
    expect(layout).toContain("TT_BOOT");
    expect(layout).toContain("createPolicy");
    expect(layout).toContain("'default'");
  });
});
