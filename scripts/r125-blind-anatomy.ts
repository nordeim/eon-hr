// r125-blind-anatomy.ts — the r125 hunt's measurement leg: decode the
// anatomy of the two named blind pockets (the arXiv residual 182 pieces:
// the f-0-0 class · the Font2 Calibri null-glyph class · the f-0-1
// ligature class; the IRS 108 fontless pieces — the ZaDb appearance-stream
// class). Dumps each blind font's object body + the descendant /W array,
// and censuses the widthFor failure cause per blind piece through the
// instrumented proto (the r119/r124 protocol).
// Usage: bun scripts/r125-blind-anatomy.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

type P = { p?: { font?: string; px?: number; py?: number; ps?: number; bx?: number; cid?: number }; text: string };

function dumpObj(ascii: string, num: number, label: string, maxLen = 500) {
  const om = ascii.match(new RegExp(`(?:^|\\n)${num} 0 obj\\s*([\\s\\S]{0,${maxLen}}?)endobj`));
  if (om) console.log(`  --- ${label} obj ${num}: ${om[1].replace(/\s+/g, " ").slice(0, maxLen)}`);
  else console.log(`  --- ${label} obj ${num}: NOT FOUND (may live in an ObjStm)`);
}

// ---------- arXiv: the f-0-0 / Font2 / f-0-1 classes ----------
{
  const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
  const raw = readFileSync(path);
  const ascii = raw.toString("latin1");
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as P[];

  // census blind pieces per font + sample the actual CID/text
  const byFont = new Map<string, P[]>();
  for (const d of decoded) {
    const p = d.p ?? {};
    if (p.px === undefined || p.ps === undefined) continue;
    if (p.bx !== undefined) continue;
    const f = p.font ?? "(no font)";
    (byFont.get(f) ?? byFont.set(f, []).get(f)!).push(d);
  }
  console.log("=== arXiv blind classes ===");
  for (const [f, pieces] of byFont) {
    console.log(`\n[${f}] ${pieces.length} blind pieces; first 6 texts: ${JSON.stringify(pieces.slice(0, 6).map((x) => (x.text || "").slice(0, 24)))}`);
  }

  // the raw font-object dump for each named binding (the f-0-N lowercase form
  // and the FontN form) — find the /Resources declaration sites
  for (const name of ["f-0-0", "f-0-1", "Font1", "Font2", "Font3"]) {
    const re = new RegExp(`/${name}\\s+(\\d+)\\s+0\\s+R`, "g");
    const refs = new Set<number>();
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(ascii))) refs.add(Number(mm[1]));
    console.log(`\n/${name}: ${refs.size} declaration refs -> ${[...refs].slice(0, 8).join(", ")}`);
    for (const r of [...refs].slice(0, 2)) dumpObj(ascii, r, `/${name}`);
  }

  // dump the Font2 descendant (obj 366) with its FULL /W array
  dumpObj(ascii, 366, "Font2 descendant", 1400);
  // and Font1 (364) + Font3 (368)
  dumpObj(ascii, 364, "Font1 descendant", 900);
  dumpObj(ascii, 368, "Font3 descendant", 900);
  // f-0-0's object: find its ref
  const f00 = ascii.match(/\/f-0-0\s+(\d+)\s+0\s+R/);
  if (f00) dumpObj(ascii, Number(f00[1]), "f-0-0 font", 700);
  const f01 = ascii.match(/\/f-0-1\s+(\d+)\s+0\s+R/);
  if (f01) dumpObj(ascii, Number(f01[1]), "f-0-1 font", 700);
}

// ---------- IRS: the fontless pieces ----------
{
  const path = "/tmp/r106-corpus/irs-f1040.pdf";
  const raw = readFileSync(path);
  const ascii = raw.toString("latin1");
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as P[];
  const blind = decoded.filter((d) => {
    const p = d.p ?? {};
    return p.px !== undefined && p.ps !== undefined && p.bx === undefined && !(p.font ?? "");
  });
  console.log(`\n\n=== IRS: ${blind.length} fontless blind pieces ===`);
  console.log("sample texts:", JSON.stringify(blind.slice(0, 20).map((x) => (x.text || "").slice(0, 16))));
  // their px/ps census
  const psCensus = new Map<string, number>();
  for (const d of blind) {
    const k = String(d.p?.ps);
    psCensus.set(k, (psCensus.get(k) ?? 0) + 1);
  }
  console.log("ps census:", [...psCensus.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10));
  // where do they sit? dump the first few with coordinates
  for (const d of blind.slice(0, 6)) {
    console.log(`  text=${JSON.stringify((d.text || "").slice(0, 20))} px=${d.p?.px} py=${d.p?.py} ps=${d.p?.ps}`);
  }
  // census the ZaDb appearance-stream form in the raw file
  const zadb = (ascii.match(/ZaDb/g) ?? []).length;
  const acro = (ascii.match(/\/AcroForm/g) ?? []).length;
  const ap = (ascii.match(/\/AP\s*<<|\/AP\s+\d+\s+0\s+R/g) ?? []).length;
  console.log(`\nraw census: ZaDb=${zadb} AcroForm=${acro} AP-entries=${ap}`);
  // find the ZaDb usage context
  const zctx = ascii.match(/[\s\S]{80}ZaDb[\s\S]{120}/);
  if (zctx) console.log("ZaDb context:", zctx[0].replace(/\s+/g, " ").slice(0, 220));
}
