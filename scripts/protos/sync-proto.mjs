// sync-proto.mjs — session 120 / parity round 119: regenerate the committed
// census proto (scripts/protos/cv-text-proto.ts) from src/lib/cv-text.ts.
//
// The proto is the REAL source plus exactly TWO documented insertions (the
// debug-capture surfaces the scripts/ census families read); it exists so
// the census scripts never import ephemeral /tmp state — the fresh-clone
// gate failure class (tsc + next build RED on 23 scripts after any sandbox
// reset; the neo-crm s210 checkout-portability genus). The unit pin
// (tests/unit/script-portability.test.ts) asserts this script's exact
// output, so the proto can never drift from the source silently.
//
// Usage: bun scripts/protos/sync-proto.mjs [--also-tmp]
//   --also-tmp  additionally materialize the legacy /tmp/r11X-proto/cv-text.ts
//               paths (the historical import sites, for one-shot re-runs of
//               pre-r120 census scripts that still reference them).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const SRC = join(root, "src", "lib", "cv-text.ts");
const OUT = join(root, "scripts", "protos", "cv-text-proto.ts");

// Insertion 1 — the module-level flat debug surface (the r117 census form).
const ANCHOR_EXPORT = "const MAX_INFLATED_BYTES = 8 * 1024 * 1024;";
const EXPORT_BLOCK = `

// R120-A: THE FLAT DEBUG SURFACE — the committed proto's module-level
// addition over src/lib/cv-text.ts (see scripts/protos/PROTO.md). The
// r117 census family reads mod.__r117DebugPieces after an extraction; the
// capture hook (insertion 2, at the decoded map) appends each part's
// pieces. The app NEVER imports this file — census scripts only.
export const __r117DebugPieces: Array<Record<string, unknown>> = [];`;

// Insertion 2 — the capture hook (inside the per-part assembly, right
// after the decoded map closes, before the R110-D census comment).
const ANCHOR_HOOK = "    // R110-D: the census is SPACE-only";
const HOOK_BLOCK = `    // R120-A: THE DEBUG-CAPTURE HOOK — the committed proto's in-body
    // addition over src/lib/cv-text.ts (see scripts/protos/PROTO.md).
    // Each part's decoded pieces feed the census surfaces: __r119pages
    // (the nested per-part form), __r118pieces (the flat spread form),
    // and the module-level __r117DebugPieces export. The census scripts
    // reset their own global before each extraction; the hook only
    // ever appends — the extraction's own output is untouched.
    {
      const __g = globalThis as unknown as { __r119pages?: unknown[][]; __r118pieces?: unknown[] };
      (__g.__r119pages ??= []).push(decoded);
      const __flat = decoded.map((d) => {
        const e = d as unknown as { p: Record<string, unknown>; text: string; genuine?: boolean; trail?: boolean };
        return { ...e.p, text: e.text, genuine: e.genuine, trail: e.trail };
      });
      (__g.__r118pieces ??= []).push(...__flat);
      __r117DebugPieces.push(...__flat);
    }
`;

const src = readFileSync(SRC, "utf8");
if (!src.includes(ANCHOR_EXPORT)) throw new Error(`export anchor missing: ${ANCHOR_EXPORT}`);
if (!src.includes(ANCHOR_HOOK)) throw new Error(`hook anchor missing: ${ANCHOR_HOOK.trim()}`);
if (src.includes("__r117DebugPieces")) throw new Error("source already carries the debug surface — sync anchors collided");

const proto =
  src.replace(ANCHOR_EXPORT, ANCHOR_EXPORT + EXPORT_BLOCK)
     .replace(ANCHOR_HOOK, HOOK_BLOCK + ANCHOR_HOOK);

writeFileSync(OUT, proto);
console.log(`proto written: ${OUT} (${proto.length} bytes, source ${src.length} + ${proto.length - src.length})`);

if (process.argv.includes("--also-tmp")) {
  for (const dir of ["/tmp/r116-proto", "/tmp/r117-proto", "/tmp/r118-proto", "/tmp/r119-proto"]) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "cv-text.ts"), proto);
    console.log(`legacy path materialized: ${dir}/cv-text.ts`);
  }
}
