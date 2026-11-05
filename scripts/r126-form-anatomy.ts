// r126-form-anatomy.ts — the obj-321 anatomy: who references it (the
// parent form), what /Resources the parent declares (inline vs INDIRECT),
// and why the R125-D form binding missed it.
// Usage: bun scripts/r126-form-anatomy.ts
import { readFileSync } from "node:fs";

const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(path);
const ascii = raw.toString("latin1");

const dumpObj = (num: number, label: string, maxLen = 700) => {
  const m = ascii.match(new RegExp(`(?:^|\\n)${num} 0 obj\\s*([\\s\\S]{0,${maxLen}}?)endobj`));
  console.log(`--- ${label} obj ${num}: ${m ? m[1].replace(/\\s+/g, " ").slice(0, maxLen) : "NOT FOUND (may be in an ObjStm)"}`);
};

// 1. what IS obj 321?
dumpObj(321, "the content stream", 400);

// 2. who references obj 321? scan for "321 0 R"
console.log("\n--- the referrers of 321 0 R ---");
for (const m of ascii.matchAll(/(\d+) 0 obj\s*<<([\s\S]{0,900}?)>>/g)) {
  const body = m[2];
  if (new RegExp(`(^|\\s)321 0 R`).test(body)) {
    console.log(`obj ${m[1]}: ${body.replace(/\s+/g, " ").slice(0, 500)}`);
  }
}

// 3. the /XObject subdicts mentioning 321 anywhere
console.log("\n--- any dict text containing '321 0 R' (context ±200) ---");
let count = 0;
for (const m of ascii.matchAll(/321 0 R/g)) {
  const start = Math.max(0, m.index - 200);
  console.log("..." + ascii.slice(start, m.index + 60).replace(/\s+/g, " ") + "...");
  if (++count > 8) break;
}
