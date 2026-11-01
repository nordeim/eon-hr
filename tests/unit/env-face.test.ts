import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Session 114 — THE ENV-FACE TOTALITY CENSUS (the neo-crm s205 doctrine,
// the D-205a2 form adapted): every non-framework environment variable the
// repo's own code reads appears in .env.example, and every knob the example
// documents is a real consumer. The per-knob documentation cure (the r113
// E2E_PORT leg) fixed the instance; this census closes the GENUS — any
// future env var added to the app or test side without a doc face trips
// RED at the unit gate, and a rename that leaves the doc face behind trips
// the reverse arm.
//
// The walk's scope (the eon-hr adaptation): src/ + tests/ + the root
// config files (playwright/vitest/next/eslint) — the operator-facing
// surface. scripts/ is EXCLUDED by design: the repo's scripts/ folder
// carries the historical round-local probe tooling (the r63–r74 era
// R*_DUMP / PROBE_BASE one-off knobs — internal conveniences documented in
// their own headers, never operator configuration). skills/ is excluded
// per the standing repo rule. The framework/convention set (NODE_ENV, CI,
// NEXT_RUNTIME, NEXT_PHASE) is subtracted — Next.js and the CI providers
// own those; the example documents CI only as informational.

const repo = join(__dirname, "..", "..");
const FRAMEWORK = new Set(["NODE_ENV", "CI", "NEXT_RUNTIME", "NEXT_PHASE"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "skills" || e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(e)) out.push(p);
  }
  return out;
}

const consumerFiles = [
  ...walk(join(repo, "src")),
  ...walk(join(repo, "tests")),
  "playwright.config.ts",
  "vitest.config.ts",
  "next.config.ts",
  "eslint.config.mjs",
].filter((p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
});

// the comment-stripped consumer census
const consumers = new Map<string, string[]>();
for (const f of consumerFiles) {
  const rel = f.replace(`${repo}/`, "");
  const src = readFileSync(f, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/^\s*\/\/.*/gm, ""); // line comments (the s205 comment-strip doctrine)
  for (const m of src.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) {
    const k = m[1];
    if (FRAMEWORK.has(k)) continue;
    if (!consumers.has(k)) consumers.set(k, []);
    consumers.get(k)!.push(rel);
  }
}

const example = readFileSync(join(repo, ".env.example"), "utf8");
// the documented face: uncommented assignments (NAME=...) + the commented
// informational knobs (# NAME=...)
const documented = new Set<string>();
for (const m of example.matchAll(/^(?:#\s*)?([A-Z][A-Z0-9_]*)\s*=/gm)) documented.add(m[1]);

describe("the env-face totality census (session 114 — the neo-crm s205 doctrine)", () => {
  it("every non-framework env consumer is documented in .env.example (the genus pin)", () => {
    const undocumented = [...consumers.keys()].filter((k) => !documented.has(k));
    expect(undocumented).toEqual([]);
  });

  it("every .env.example knob is a real consumer or a framework convention (the reverse arm)", () => {
    const phantom = [...documented].filter((k) => !consumers.has(k) && !FRAMEWORK.has(k));
    expect(phantom).toEqual([]);
  });

  it("the census actually sees the standing face (the self-check — a broken walk fails here)", () => {
    // the three live knobs the repo's own code reads: DATABASE_URL + AUTH_SECRET
    // (src/) and E2E_PORT (playwright.config.ts). A walk that silently saw
    // nothing would pass the two pins vacuously.
    expect(consumers.has("DATABASE_URL")).toBe(true);
    expect(consumers.has("AUTH_SECRET")).toBe(true);
    expect(consumers.has("E2E_PORT")).toBe(true);
    expect((consumers.get("DATABASE_URL") ?? []).some((f) => f.startsWith("src/"))).toBe(true);
  });
});
