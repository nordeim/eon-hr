// r122-drift-ledger.ts — the R122-B cure's drift ledger: every corpus
// member's HEAD-pin md5 vs the CURED extraction (the zero-away discipline —
// every member IDENTICAL or TOWARD, never away).
// Usage: bun scripts/r122-drift-ledger.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: [string, string, string, number][] = [
  // [path, name, HEAD pin (the r120-cured state), alnum pin]
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "6aa0c41b", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "d70a708e", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "8ecdda5e", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "e5752ab1", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "fe969d8d", 83657],
];

for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const t = await mod.extractTextFromFile(file);
  const cur = md5(t);
  const alnums = na(t).length;
  const status = cur === pin ? "IDENTICAL" : "CHANGED";
  const alnumOk = alnums === alnumPin ? "alnums exact" : `*** ALNUM DRIFT ${alnums} vs ${alnumPin} ***`;
  console.log(`${n}: ${cur} (HEAD ${pin}) ${status} · ${alnumOk}`);
}
