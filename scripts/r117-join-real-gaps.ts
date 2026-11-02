// r117-join-real-gaps.ts — the refutation JOINs' real gaps + trail states:
// Prawn ticks, IRS "0"->"2025", ReportLab "User Guide"->"Table of contents".
// Real gap = B.px − A's last bbox word xMax.
// Usage: bun scripts/r117-join-real-gaps.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

type P = { text: string; px: number; py: number; ps: number };
async function dump(path: string): Promise<P[]> {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as P[];
}
function blocks(pp: P[]) {
  const bs: { px: number; py: number; ps: number; text: string }[] = [];
  for (const p of pp) {
    const last = bs[bs.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01 && Math.abs(last.ps - p.ps) < 0.01) last.text += p.text;
    else bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text });
  }
  return bs;
}
function wordEnds(path: string) {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: { text: string; x0: number; x1: number }[] = [];
  const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let w: RegExpExecArray | null;
  while ((w = wRe.exec(xml))) out.push({ text: w[5], x0: parseFloat(w[1]), x1: parseFloat(w[3]) });
  return out;
}

async function check(path: string, name: string, aNeedle: string, bNeedle: string) {
  const ends = wordEnds(path);
  const pp = await dump(path);
  const bs = blocks(pp);
  // find the block boundary whose B text starts with bNeedle and A contains aNeedle
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    if (!A.text.includes(aNeedle) || !B.text.trimStart().startsWith(bNeedle)) continue;
    const aLast = A.text.trim().split(/\s+/).pop() ?? "";
    const cands = ends.filter(e => e.text === aLast);
    if (!cands.length) { console.log(`${name}: block A "${A.text.slice(0, 24)}" last word "${aLast}" not in bbox`); continue; }
    // nearest xMax to A.px + rough width
    const re = cands.sort((x, y) => Math.abs(x.x0 - A.px) - Math.abs(y.x0 - A.px))[0];
    const realGap = (B.px - re.x1) / Math.max(A.ps, B.ps);
    console.log(`${name}: "${A.text.trim().slice(0, 26)}"(trail=${/\s$/.test(A.text)}) -> "${B.text.trim().slice(0, 20)}"(alnum=${(B.text.match(/[A-Za-z0-9]/g) ?? []).length}) real gap = ${realGap.toFixed(2)}em (ps ${A.ps}/${B.ps})`);
  }
}

await check("/tmp/r110-prawn-manual.pdf", "Prawn ticks", "100.0", "200.0");
await check("/tmp/r106-corpus/irs-f1040.pdf", "IRS 0->2025", "0 ", "2025");
await check("/tmp/r109-corpus/rl-userguide.pdf", "ReportLab cover", "User Guide", "Table of contents");
// arXiv joins at small gaps (the estimate-noise class): "comprehension."->"2017"
await check("/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv refs", "comprehension.", "2017");
