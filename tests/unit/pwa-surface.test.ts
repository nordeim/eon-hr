import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
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
    expect(existsSync(path.join(repo, "public/sw.js"))).toBe(true);
    expect(sw).toContain("eon-hr-shell-r72");
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
