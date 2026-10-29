// r107-count-variants.ts — what did the r106 "101,515" measure? Test the
// counting variants on the current fontspec extraction + the build dates.
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text";

for (const [path, name] of [
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "lo-calc"],
] as const) {
  const raw = readFileSync(path);
  const latin = raw.toString("latin1");
  const cd = latin.match(/\/CreationDate\s*\(D:(\d{8})/);
  const mod = latin.match(/\/ModDate\s*\(D:(\d{8})/);
  console.log(`\n===== ${name} =====`);
  console.log("CreationDate:", cd?.[1] ?? "?", "ModDate:", mod?.[1] ?? "?");
  const file = new File([new Uint8Array(raw)], "probe.pdf", { type: "application/pdf" });
  const text = await extractTextFromFile(file);
  const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
  const letters = text.replace(/[^A-Za-z]/g, "").length;
  const digits = text.replace(/[^0-9]/g, "").length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  console.log(`alnums=${alnums} letters=${letters} digits=${digits} words=${words}`);
  console.log(`lines=${text.split("\n").length} chars=${text.length}`);
}
process.exit(0);
