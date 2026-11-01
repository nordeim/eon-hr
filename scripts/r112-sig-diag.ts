// r112-sig-diag.ts — instrument the signature: per stream, why did (or
// didn't) the repair fire? Reports ascents, k, prefix-top, suffix-top.
// Usage: bun scripts/r112-sig-diag.ts <pdf-path>
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

// Minimal reimplementation of the walk's position tracking (mirror of the
// prototype) to dump per-piece y sequences + signature evaluation.
const HOIST_ASCENT = 25;
type Piece = { sep: string; text: string; px?: number; py?: number; ps?: number };

function walk(content: string): Piece[] {
  const pieces: Piece[] = [];
  type Mat = [number, number, number, number, number, number];
  const mul = (m1: Mat, m2: Mat): Mat => [
    m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
  let ctm: Mat = [1, 0, 0, 1, 0, 0];
  const ctmStack: Mat[] = [];
  let tlm: Mat = [1, 0, 0, 1, 0, 0];
  let effSize = 1;
  const curPos = () => {
    const e = mul(ctm, tlm);
    if (Math.abs(e[1]) > 0.01 || Math.abs(e[2]) > 0.01) return null;
    const ps = Math.abs(e[3]) * effSize;
    if (!Number.isFinite(ps) || ps <= 0) return null;
    return { px: e[4], py: e[5], ps };
  };
  const ops =
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\bBT\b|\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+cm|\bq\b|\bQ\b/g;
  let m: RegExpExecArray | null;
  const unescapeLit = (s: string) => s.replace(/\\([0-7]{1,3}|[nrtbf]|[()\\])/g, (_, g) => {
    if (/[nrtbf]/.test(g)) return { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f" }[g]!;
    if (/^[0-7]+$/.test(g)) return String.fromCharCode(parseInt(g, 8) % 256);
    return g;
  });
  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) { effSize = parseFloat(m[1]) || 1; continue; }
    if (m[2] !== undefined) { tlm = mul(tlm, [1, 0, 0, 1, parseFloat(m[2]), parseFloat(m[3])]); continue; }
    if (m[0] === "T*") continue;
    if (m[0] === "BT") { tlm = [1, 0, 0, 1, 0, 0]; continue; }
    if (m[15] !== undefined) {
      ctm = mul(ctm, [parseFloat(m[15]), parseFloat(m[16]), parseFloat(m[17]), parseFloat(m[18]), parseFloat(m[19]), parseFloat(m[20])]);
      continue;
    }
    if (m[0] === "q") { if (ctmStack.length < 256) ctmStack.push(ctm); continue; }
    if (m[0] === "Q") { const p = ctmStack.pop(); if (p) ctm = p; continue; }
    const pos = curPos();
    if (m[4] !== undefined) { pieces.push({ sep: " ", text: unescapeLit(m[4]), ...(pos ?? {}) }); continue; }
    if (m[6] !== undefined) { pieces.push({ sep: " ", text: unescapeLit(m[6]).slice(0, 4), ...(pos ?? {}) }); continue; }
    if (m[7] !== undefined) { pieces.push({ sep: " ", text: "H" + m[7].replace(/\s+/g, "").slice(0, 4), ...(pos ?? {}) }); continue; }
    if (m[9] !== undefined) { tlm = [parseFloat(m[9]), parseFloat(m[10]), parseFloat(m[11]), parseFloat(m[12]), parseFloat(m[13]), parseFloat(m[14])]; continue; }
  }
  return pieces;
}

const file = process.argv[2];
const buf = readFileSync(file);
const latin = Buffer.from(buf).toString("latin1");
const re = /(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n?/g;
let m;
const streams: { obj: number; text: string }[] = [];
while ((m = re.exec(latin))) {
  const start = m.index + m[0].length;
  const end = latin.indexOf("endstream", start);
  if (/FlateDecode/.test(m[2])) {
    try {
      const out = zlib.inflateSync(buf.subarray(start, end)).toString("latin1");
      if (/Tj|TJ/.test(out)) streams.push({ obj: parseInt(m[1], 10), text: out });
    } catch {}
  }
}
console.log(`${file}: ${streams.length} text streams`);
for (const s of streams.slice(0, 6)) {
  const pieces = walk(s.text);
  const positioned = pieces.filter((p) => p.py !== undefined);
  if (positioned.length < 4) continue;
  const ys = positioned.map((p) => p.py!);
  const ascents: number[] = [];
  for (let i = 0; i + 1 < ys.length; i++) if (ys[i + 1] - ys[i] >= HOIST_ASCENT) ascents.push(i);
  const verdict = (a: number[]) => {
    if (a.length === 0) return "";
    if (a.length > 1) return "";
    const k = a[0] + 1;
    if (k > ys.length / 2) return "";
    const suffixTop = ys[k];
    const prefixTop = Math.max(...ys.slice(0, k));
    if (suffixTop <= prefixTop + HOIST_ASCENT) return "";
    const step2 = ys.length > k + 1 ? ys[k + 1] - ys[k] : 0;
    const firstPy = positioned[0].py!;
    return `FIRES ascent@${k}/${ys.length} prefixTop ${prefixTop.toFixed(0)} suffixTop ${suffixTop.toFixed(0)} step2 ${step2.toFixed(0)} firstPy ${firstPy.toFixed(1)}`;
    return `ascent@${k}: prefixTop ${prefixTop.toFixed(0)} suffixTop ${suffixTop.toFixed(0)} — *** FIRES ***`;
  };
  console.log(`  obj ${s.obj}: ${positioned.length}/${pieces.length} positioned | ${verdict(ascents)}`);
  if (ascents.length > 0 && ascents.length <= 3) {
    for (const a of ascents) {
      console.log(`     ascent ${ys[a].toFixed(1)} -> ${ys[a + 1].toFixed(1)}: '${positioned.slice(Math.max(0, a - 1), a + 2).map((p) => p.text.slice(0, 14)).join("' | '")}'`);
    }
  }
}
