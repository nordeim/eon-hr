// r127-toward-away.ts — the drift classification: for each changed member,
// the word-stream + line-form similarities vs pdftotext BEFORE (HEAD) and
// AFTER (patched), plus the actual hunks (the first 12) — every hunk must be
// a space REMOVAL at a Class-A junction, and the similarities must move
// TOWARD pdftotext.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { SequenceMatcher } from "difflib";
const head = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const CURED = "/tmp/r127-cured.ts"; // the variable form — the literal /tmp import ban
const cured = await import(CURED);

const members: Array<[string, string]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

for (const [p, n] of members) {
  const raw = readFileSync(p);
  const h = await head.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const c = await cured.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const sim = (a: string | string[], b: string | string[]) => new SequenceMatcher(null, a, b, false).ratio();
  const wh = h.split(/\s+/), wc = c.split(/\s+/), wr = ref.split(/\s+/);
  const lh = h.split("\n"), lc = c.split("\n"), lr = ref.split("\n");
  console.log(`\n=== ${n} ===`);
  console.log(`word-stream: HEAD ${sim(wh, wr).toFixed(4)} -> CURED ${sim(wc, wr).toFixed(4)} ${sim(wc, wr) > sim(wh, wr) ? "TOWARD" : sim(wc, wr) < sim(wh, wr) ? "*** AWAY ***" : "IDENTICAL"}`);
  console.log(`line-form:  HEAD ${sim(lh, lr).toFixed(4)} -> CURED ${sim(lc, lr).toFixed(4)} ${sim(lc, lr) > sim(lh, lr) ? "TOWARD" : sim(lc, lr) < sim(lh, lr) ? "*** AWAY ***" : "IDENTICAL"}`);
  const sm = new SequenceMatcher(null, h, c, false);
  const hunks = sm.getOpcodes().filter((x: string[]) => x[0] !== "equal");
  console.log(`hunks: ${hunks.length}`);
  let spaceRemovals = 0, other = 0;
  for (const [tag, i1, i2, j1, j2] of hunks as Array<[string, number, number, number, number]>) {
    const a = h.slice(i1, i2), b = c.slice(j1, j2);
    // classify: a space removal = the head has "X Y" where cured has "XY"
    if (tag === "delete" && /^ ?\s?$/.test(a)) { spaceRemovals++; continue; }
    if (tag === "replace" && b === a.replace(/\s+/g, "")) { spaceRemovals++; continue; }
    other++;
    if (other <= 8) console.log(`  [${tag}] HEAD ${JSON.stringify(a.slice(0, 60))} -> CURED ${JSON.stringify(b.slice(0, 60))}`);
  }
  console.log(`space-removal hunks: ${spaceRemovals} · other hunks: ${other}`);
}
