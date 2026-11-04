// r125-blind-causes.ts — the instrumented blindness-cause walk (the r124
// protocol): a PATCHED COPY of the committed proto, its widthFor/width
// failure sites logging every blind event (font · pageMap binding · code ·
// map hit · def), so each r125 pocket's root cause is measured, not
// guessed. The committed proto is never touched.
// Usage: bun scripts/r125-blind-causes.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts";
const PATCHED = "/tmp/r125-instrumented-proto.ts";

let src = readFileSync(SRC, "utf8");

// Insertion 1: the cause log at the no-table site
const noTableAnchor = `        const we = widthFor(piece.font);
        if (!we) { blind = true; continue; }`;
const noTablePatched = `        const we = widthFor(piece.font);
        if (!we) { (globalThis as any).__r125causes?.push({ cause: "no-table", font: piece.font ?? "", hasPageMap: !!pageMap, pageMapFonts: pageMap ? [...pageMap.keys()].slice(0, 12) : null }); blind = true; continue; }`;
if (!src.includes(noTableAnchor)) throw new Error("no-table anchor not found");
src = src.replace(noTableAnchor, noTablePatched);

// Insertion 2: the cause log at the w<=0 / uncovered site
const wAnchor = `          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { ok = false; break; }`;
const wPatched = `          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { (globalThis as any).__r125causes?.push({ cause: w === undefined ? "code-uncovered" : "w<=0", font: (piece as any).font ?? "", code: c, mapHit: we.map.get(c), def: we.def, text: (piece as any).text ?? "", codeLen: we.codeLen }); ok = false; break; }`;
if (!src.includes(wAnchor)) throw new Error("w anchor not found");
src = src.replace(wAnchor, wPatched);

// Insertion 3: the odd-byte-count site (codeLen 2)
const oddAnchor = `            if (raw.length === 0 || raw.length % 2 !== 0) { blind = true; continue; }`;
const oddPatched = `            if (raw.length === 0 || raw.length % 2 !== 0) { (globalThis as any).__r125causes?.push({ cause: "odd-bytes", font: (piece as any).font ?? "", rawLen: raw.length }); blind = true; continue; }`;
if (!src.includes(oddAnchor)) throw new Error("odd anchor not found");
src = src.replace(oddAnchor, oddPatched);

mkdirSync("/tmp", { recursive: true });
writeFileSync(PATCHED, src);
console.log("patched proto written:", PATCHED);

const mod = await import(PATCHED);

type Cause = {
  cause: string; font?: string; code?: number; mapHit?: number | undefined;
  def?: number | undefined; text?: string; codeLen?: number; rawLen?: number;
  hasPageMap?: boolean; pageMapFonts?: string[] | null;
};

for (const [path, name] of [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
] as [string, string][]) {
  (globalThis as any).__r125causes = [];
  (globalThis as any).__r119pages = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const causes = ((globalThis as any).__r125causes ?? []) as Cause[];
  console.log(`\n=== ${name}: ${causes.length} blind events ===`);
  const byCause = new Map<string, Cause[]>();
  for (const c of causes) (byCause.get(c.cause) ?? byCause.set(c.cause, []).get(c.cause)!).push(c);
  for (const [cause, list] of byCause) {
    const byFont = new Map<string, number>();
    for (const c of list) byFont.set(c.font ?? "(none)", (byFont.get(c.font ?? "(none)") ?? 0) + 1);
    console.log(`\n[${cause}] ${list.length} events`);
    console.log("  by font:", [...byFont.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([f, n]) => `${f}:${n}`).join(" · "));
    // the per-cause detail samples
    for (const c of list.slice(0, 5)) {
      console.log(`  -> font=${JSON.stringify(c.font)} code=${c.code} mapHit=${c.mapHit} def=${c.def} text=${JSON.stringify((c.text ?? "").slice(0, 20))} codeLen=${c.codeLen} hasPageMap=${c.hasPageMap}`);
      if (c.pageMapFonts) console.log(`     pageMap fonts: ${c.pageMapFonts.join(", ")}`);
    }
  }
}
