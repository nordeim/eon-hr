// r107-drift-isolate.ts — session 107: isolate the fontspec drift
// (106,179 now vs the r106-documented 101,515 on an unchanged tree).
//   (1) determinism: extract fontspec twice, byte-compare
//   (2) the file provenance: md5 + the /Producer read
//   (3) the same for lo-calc (695,014 vs the 691,268 pin — the r102 file
//       re-downloaded today; the site may serve a regenerated build)
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import { extractTextFromFile } from "../src/lib/cv-text";

const md5 = (p: string) => crypto.createHash("md5").update(readFileSync(p)).digest("hex");

for (const [path, name] of [
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0"],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6"],
] as const) {
  console.log(`\n===== ${name} =====`);
  console.log("md5:", md5(path), "size:", readFileSync(path).length);
  const raw = readFileSync(path);
  const prod = raw.toString("latin1").match(/\/Producer\s*\(([^)]*)\)/);
  const creator = raw.toString("latin1").match(/\/Creator\s*\(([^)]*)\)/);
  console.log("Producer:", prod?.[1] ?? "(none found)");
  console.log("Creator:", creator?.[1] ?? "(none found)");
  const file = new File([new Uint8Array(raw)], "probe.pdf", { type: "application/pdf" });
  const t1 = await extractTextFromFile(file);
  const t2 = await extractTextFromFile(file);
  const a1 = t1.replace(/[^A-Za-z0-9]/g, "").length;
  const a2 = t2.replace(/[^A-Za-z0-9]/g, "").length;
  console.log(`run1: ${a1} alnums · run2: ${a2} alnums · ${a1 === a2 && t1 === t2 ? "DETERMINISTIC (byte-identical)" : "NON-DETERMINISTIC"}`);
}
process.exit(0);
