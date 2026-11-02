// r120-separation-census.ts — THE FIRE-SEPARATION CENSUS: every REAL
// per-part R117-A fire (>=2.5em) across the corpus, each with poppler's own
// line-membership verdict (the r118 discipline) and the candidate
// separating features: gapEm, font change, ps ratio, intervening pieces in
// the x-span, left/right block composition. The output: the empirical law
// that separates JOIN-fires (must not fire) from SPLIT-fires (correct).
// Usage: bun scripts/r120-separation-census.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; font?: string; condGap?: boolean; condKern?: boolean };
type P = { p?: S; text: string; genuine?: boolean; trail?: boolean };

const members: [string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 792],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 842],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 842],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", 792],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", 792],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", 792],
  ["/tmp/typst-cv/resume.pdf", "Typst", 842],
];

function layoutWords(path: string) {
  const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };
  const out: W[][] = []; // per page
  let page = -1, lineId = 0;
  const events: { at: number; kind: "p" | "l" }[] = [];
  let m: RegExpExecArray | null;
  const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p" });
  while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l" });
  events.sort((a, b) => a.at - b.at);
  let ei = 0;
  const all: W[] = [];
  wordRe.lastIndex = 0;
  while ((m = wordRe.exec(xml))) {
    while (ei < events.length && events[ei].at < m.index) {
      if (events[ei].kind === "p") { page++; lineId = 0; } else lineId++;
      ei++;
    }
    all.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: lineId });
  }
  for (const w of all) {
    (out[w.page] ??= []).push(w);
  }
  return out;
}

for (const [path, name, pageH] of members) {
  const pages = layoutWords(path);
  (globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(readFileSync(path))], "m.pdf"));
  const parts = (globalThis as unknown as { __r119pages: P[][] }).__r119pages;
  // which page does each part belong to? match by content: use the piece py/px against poppler words
  // (the parts are in file order; the poppler pages too — approximate by text overlap, the census discipline)
  type Fire = { gap: number; fontChange: boolean; psRatio: number; inSpan: number; verdict: "JOIN" | "SPLIT" | "?" };
  const fires: Fire[] = [];
  for (const decoded of parts) {
    const hasSpaceGlyphs = decoded.some(({ text }) => text.length > 0 && /^ +$/.test(text));
    for (let i = 1; i < decoded.length; i++) {
      const d = decoded[i], e = decoded[i - 1];
      const p = d.p, q = e.p;
      if (!p || !q || p.px === undefined || p.py === undefined || p.ps === undefined) continue;
      if (q.px === undefined || q.py === undefined || q.ps === undefined || q.bx === undefined) continue;
      if (Math.abs(q.px - p.px) < 0.01) continue;
      if (Math.abs(q.py - p.py) >= 0.5 * Math.max(q.ps, p.ps)) continue;
      const gapEm = (p.px - q.bx) / Math.max(q.ps, p.ps);
      if (gapEm < 2.5) continue;
      let j = i - 1;
      while (j >= 0) { const dj = decoded[j]; if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { j--; continue; } break; }
      let alnumRight = 0;
      for (let k = i; k < decoded.length; k++) { const dk = decoded[k]; if (dk.p?.px === undefined || dk.p?.py === undefined) break; if (Math.abs(dk.p.px - p.px) > 0.01 || Math.abs(dk.p.py - p.py) > 0.01) break; alnumRight += (dk.text.match(/[A-Za-z0-9]/g) ?? []).length; }
      if (alnumRight < 2) continue;
      if (p.condGap && hasSpaceGlyphs) continue;
      if (p.condKern && d.genuine) continue;
      // the intervening pieces in the x-span (same part, between j and i, non-space, x-overlapping the gap)
      let inSpan = 0;
      for (let k = j + 1; k < i; k++) {
        const dk = decoded[k];
        if (dk.text.trim().length > 0) inSpan++;
      }
      // poppler verdict: find the left block's last word + the right block's first word
      // our device py (flip-y): top-left y = pageH - py (approx — the Typst flip-y form)
      const leftTxt = decoded[j].text.replace(/\s+/g, "");
      const rightTxt = d.text.replace(/\s+/g, "");
      const yTop = pageH - p.py;
      let verdict: "JOIN" | "SPLIT" | "?" = "?";
      for (let pg = 0; pg < pages.length; pg++) {
        const ws = pages[pg] ?? [];
        const cand = ws.filter((w) => Math.abs((w.y0 + w.y1) / 2 - yTop) < Math.max(6, (w.y1 - w.y0) * 1.5));
        const lw = cand.filter((w) => (leftTxt.endsWith(w.text.replace(/\s+/g, "")) || w.text.replace(/\s+/g, "").length > 2 && leftTxt.endsWith(w.text.replace(/\s+/g, "")))).sort((a, b) => b.x1 - a.x1)[0];
        const rw = cand.filter((w) => rightTxt.startsWith(w.text.replace(/\s+/g, "")) || (w.text.replace(/\s+/g, "").length > 2 && rightTxt.startsWith(w.text.replace(/\s+/g, "")))).sort((a, b) => a.x0 - b.x0)[0];
        if (lw && rw) {
          verdict = lw.line === rw.line ? "JOIN" : "SPLIT";
          break;
        }
      }
      fires.push({ gap: gapEm, fontChange: (q.font ?? "") !== (p.font ?? ""), psRatio: Math.min(q.ps, p.ps) / Math.max(q.ps, p.ps), inSpan, verdict });
    }
  }
  const joins = fires.filter((f) => f.verdict === "JOIN");
  const splits = fires.filter((f) => f.verdict === "SPLIT");
  const unknown = fires.filter((f) => f.verdict === "?");
  console.log(`\n===== ${name}: ${fires.length} fires | JOIN ${joins.length} SPLIT ${splits.length} ? ${unknown.length} =====`);
  const feat = (f: Fire) => `gap ${f.gap.toFixed(1)} ${f.fontChange ? "fontChange" : "sameFont"} psR ${f.psRatio.toFixed(2)} inSpan ${f.inSpan}`;
  console.log("  JOIN fires (the away class):");
  for (const f of joins.slice(0, 10)) console.log(`    ${feat(f)}`);
  console.log("  SPLIT fires (the toward class):");
  for (const f of splits.slice(0, 10)) console.log(`    ${feat(f)}`);
}
