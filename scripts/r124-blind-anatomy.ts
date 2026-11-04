// r124-blind-anatomy.ts — the r124 hunt's measurement leg: for each named
// blind-pocket member (IRS · arXiv · ReportLab), census the positioned
// pieces WITHOUT bx by their font resource name, then dump each blind
// font's object body (the raw dictionary) so the blindness anatomy can be
// decoded (missing /Widths? missing /W? unbound stream? codes outside the
// map?). Uses the proto's __r119pages hook (the r119 protocol).
// Usage: bun scripts/r124-blind-anatomy.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

type P = { p?: { font?: string; px?: number; ps?: number; bx?: number }; text: string };

const members: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
];

for (const [path, name] of members) {
  (globalThis as any).__r119pages = [];
  const raw = readFileSync(path);
  const ascii = raw.toString("latin1");
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as P[];
  const blindByFont = new Map<string, { count: number; sample: string }>();
  for (const d of decoded) {
    const p = d.p ?? {};
    if (p.px === undefined || p.ps === undefined) continue; // unpositioned — not the pocket
    if (p.bx !== undefined) continue; // tracked — not blind
    const f = p.font ?? "(no font)";
    const e = blindByFont.get(f) ?? { count: 0, sample: "" };
    e.count++;
    if (!e.sample) e.sample = (d.text || "").slice(0, 40);
    blindByFont.set(f, e);
  }
  console.log(`\n=== ${name}: blind pieces by font ===`);
  const sorted = [...blindByFont.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [f, e] of sorted) {
    console.log(`  ${f}: ${e.count} blind | sample: ${JSON.stringify(e.sample)}`);
  }
  // dump the raw dictionary of each blind font resource name (the /F1 form)
  for (const [f] of sorted.slice(0, 6)) {
    const m = f.match(/^[^\s]/) ? f : null;
    if (!m) continue;
    const re = new RegExp(`/${f}\\s+(\\d+)\\s+0\\s+R`, "g");
    const refs = new Set<number>();
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(ascii))) refs.add(Number(mm[1]));
    for (const r of refs) {
      const om = ascii.match(new RegExp(`(?:^|\\n)${r} 0 obj\\s*([\\s\\S]{0,420}?)endobj`));
      if (om) {
        console.log(`  --- /${f} -> obj ${r}: ${om[1].replace(/\s+/g, " ").slice(0, 400)}`);
        break; // the first declaration only
      }
    }
  }
}
