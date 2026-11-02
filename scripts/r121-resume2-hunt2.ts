// r121-resume2-hunt2.ts — the targeted dump: the full untruncated text of
// the mis-tracked line's pieces (the 22.21 em pair — [113]-[116] on the
// "Owned the performance review cycle…" line), plus the raw content
// stream's show operators for that line, to see exactly what the walk
// accumulated vs what the stream carries.
// Usage: bun scripts/r121-resume2-hunt2.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { inflateSync } from "node:zlib";

const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; font?: string };
type P = { p?: S; text: string };

const path = "/tmp/typst-cv/resume2.pdf";
(globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
await mod.extractTextFromFile(new File([new Uint8Array(readFileSync(path))], "m.pdf"));
const parts = (globalThis as unknown as { __r119pages: P[][] }).__r119pages;
const decoded = parts[0];
console.log("=== the full pieces around the 22.21 em pair (py 525.3 + the date) ===");
for (let k = 108; k <= 120; k++) {
  const pk = decoded[k];
  const s = pk.p;
  console.log(`[${k}] len ${pk.text.length} "${pk.text}" px ${s?.px?.toFixed(1)} py ${s?.py?.toFixed(1)} ps ${s?.ps?.toFixed(1)} bx ${s?.bx !== undefined ? s.bx.toFixed(1) : "-"} font ${s?.font ?? "?"}`);
}

// the raw stream: find the line's show operators (the TJ/Tj arrays around
// "performance" / "onbo") to measure what the stream actually carries
const raw = new Uint8Array(readFileSync(path));
const latin = Buffer.from(raw).toString("latin1");
// find stream objects and inflate
const streamRe = /stream\r?\n/g;
let m: RegExpExecArray | null;
const shows: string[] = [];
while ((m = streamRe.exec(latin))) {
  const start = m.index + m.length;
  const end = latin.indexOf("endstream", start);
  if (end < 0) continue;
  const chunk = raw.subarray(start, end);
  let text = "";
  try { text = inflateSync(chunk).toString("latin1"); } catch { continue; }
  if (text.includes("performance") || text.includes("onbo")) {
    // extract the TJ arrays + Tm/Td/Tf ops in order
    const ops = text.match(/\((?:[^()\\]|\\.)*\)|-?\d+(?:\.\d+)?\s*(?=\()|\/F\w+\s+[\d.]+\s+Tf|[-\d.]+\s+[-\d.]+\s+Td|[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+Tm|TJ|Tj/g) ?? [];
    // filter to the region around "performance"
    const joined = ops.join(" ");
    const idx = joined.indexOf("performance");
    if (idx >= 0) shows.push(joined.slice(Math.max(0, idx - 700), idx + 900));
  }
}
console.log("\n=== the raw stream around 'performance' (the show-op anatomy) ===");
for (const s of shows.slice(0, 1)) console.log(s.replace(/\s+/g, " ").slice(0, 1800));
