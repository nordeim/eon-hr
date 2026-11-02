// r120-away-anatomy.ts — measure the AWAY pairs' true geometry: the piece
// gap (px - bx), the poppler word-level gap + line membership, the block
// composition (left/right), and the font/width source. The question: why
// does pdftotext JOIN pairs our rule now splits — overstated bx, a distinct
// layout class, or a guard hole?
// Usage: bun scripts/r120-away-anatomy.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; font?: string; sep?: string };
type P = { p?: S; text: string };

const members: [string, string, string[]][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", ["self-speculative", "Thirty-Fourth"]],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", ["pdf:content", "39"]],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", ["Acknowledgements", "Warnings"]],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", [":overflow", ":align"]],
];

for (const [path, name, probes] of members) {
  console.log(`\n===== ${name} =====`);
  (globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as unknown as { __r119pages: P[][] }).__r119pages ?? []).flat();
  // poppler word ground truth
  type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };
  const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const words: W[] = [];
  let page = 0, lineId = 0, curLine = -1;
  const events: { at: number; kind: "p" | "l" }[] = [];
  let m: RegExpExecArray | null;
  const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p" });
  while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l" });
  events.sort((a, b) => a.at - b.at);
  let ei = 0;
  wordRe.lastIndex = 0;
  while ((m = wordRe.exec(xml))) {
    while (ei < events.length && events[ei].at < m.index) {
      if (events[ei].kind === "p") { page++; curLine = -1; } else { lineId++; curLine = lineId; }
      ei++;
    }
    words.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: curLine });
  }
  // find the probe pieces (the right block's first piece)
  for (const probe of probes) {
    const idx = pieces.findIndex((d) => d.text.startsWith(probe) && d.p?.px !== undefined && d.p?.bx !== undefined);
    if (idx < 0) { console.log(`  "${probe}": piece not found`); continue; }
    const d = pieces[idx];
    const p = d.p!;
    // the left neighbor block: walk back to the piece with a different px origin on the same baseline
    let j = idx - 1;
    while (j >= 0) {
      const q = pieces[j].p;
      if (q?.px !== undefined && q.py !== undefined && q.ps !== undefined && q.bx !== undefined && Math.abs(q.px - p.px!) > 0.01 && Math.abs(q.py - p.py!) < 0.5 * Math.max(q.ps, p.ps!)) break;
      j--;
    }
    if (j < 0) { console.log(`  "${probe}": no left block`); continue; }
    const q = pieces[j].p!;
    const gapEm = (p.px! - q.bx!) / Math.max(q.ps ?? p.ps ?? 1, p.ps ?? 1);
    // poppler: the words near the left block's end
    const leftText = pieces.slice(Math.max(0, j - 2), j + 1).map((x) => x.text).join(" ");
    const rightText = pieces.slice(idx, idx + 3).map((x) => x.text).join(" ");
    console.log(`  "${probe}": gapEm ${gapEm.toFixed(2)} | left "...${leftText.slice(-34)}" [ps ${q.ps} px ${(q.px ?? 0).toFixed(1)} bx ${(q.bx ?? 0).toFixed(1)}] right "${rightText.slice(0, 34)}" [px ${(p.px ?? 0).toFixed(1)} py ${(p.py ?? 0).toFixed(1)}]`);
    // poppler words at that y (device py vs top-left y: need page height — approximate by matching text)
    const wl = words.filter((w) => w.text.includes(leftText.split(/\s+/).pop() ?? "@@")).slice(-2);
    const wr = words.filter((w) => w.text.startsWith(probe.slice(0, 4))).slice(0, 2);
    for (const w of wl) console.log(`    poppler left word: "${w.text}" x1=${w.x1.toFixed(1)} line=${w.line} page=${w.page}`);
    for (const w of wr) console.log(`    poppler right word: "${w.text}" x0=${w.x0.toFixed(1)} line=${w.line} page=${w.page}`);
  }
}
