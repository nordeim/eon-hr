// r112-drift-diffs.ts — the three drifted members: what exactly changed?
// Usage: bun scripts/r112-drift-diffs.ts
import { readFileSync } from "node:fs";

const protoPath = "/tmp/r112-proto/cv-text.ts"; // variable-path import per the R108-A lesson
const mod = await import(protoPath);
const src = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

for (const [p, name] of [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
] as [string, string][]) {
  const raw = readFileSync(p);
  const file = () => new File([new Uint8Array(raw)], "m.pdf");
  const ours = await mod.extractTextFromFile(file());
  const head = await src.extractTextFromFile(file());
  console.log(`\n===== ${name} (len ours ${ours.length} vs HEAD ${head.length}) =====`);
  // first divergence
  let i = 0;
  while (i < Math.min(ours.length, head.length) && ours[i] === head[i]) i++;
  console.log(`first divergence at ${i}`);
  console.log(`HEAD: ...${JSON.stringify(head.slice(Math.max(0, i - 80), i + 160))}`);
  console.log(`OURS: ...${JSON.stringify(ours.slice(Math.max(0, i - 80), i + 160))}`);
}
