// r118-hunt-measure.ts — dump the piece stream around the Typst contacts row
// (the icon-bridged phone|email split). Usage: bun /tmp/r118-hunt-measure.ts
import { readFileSync } from "node:fs";

const mod = await import("./protos/cv-text-proto");
const raw = readFileSync("/tmp/typst-cv/resume.pdf");
const out = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pieces = (globalThis as unknown as { __r118pieces: Array<{ p: Record<string, number | boolean | undefined>; text: string; genuine?: boolean; sep?: string }> }).__r118pieces;
// find the contacts row: the piece whose text contains 010-9911 or the CID-decoded form
const idx = pieces.findIndex(p => p.text.includes("010") && p.text.includes("9911"));
console.log("our output line:", out.split("\n").find(l => l.includes("010-9911")));
console.log("phone piece idx:", idx);
const lo = Math.max(0, idx - 8), hi = Math.min(pieces.length, idx + 10);
for (let i = lo; i < hi; i++) {
  const p = pieces[i];
  const st = p.p ?? {};
  const txt = p.text.replace(/\uF018/g, "<ICON-PHONE>").replace(/\uF03A/g, "<ICON-MAIL>").replace(/ /g, "·");
  console.log(`[${i}] font=${String(st.font)} sep=${JSON.stringify(p.sep)} px=${st.px} py=${st.py} ps=${st.ps} bx=${st.bx} genuine=${p.genuine} text=${JSON.stringify(txt).slice(0, 90)}`);
}
