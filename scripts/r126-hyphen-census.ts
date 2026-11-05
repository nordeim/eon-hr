// r126-hyphen-census.ts — the fire-separation census for the R126-A cure:
// (a) every Form XObject whose /Resources /Font pairs include hyphenated
//     names (the f-0-N matplotlib class) — the forms the R125-D binding
//     missed because the F-scan's \w class rejects hyphens;
// (b) the width-table comparison across the same-named candidates (does
//     the wrong-subset resolution corrupt more than the 'z'?);
// (c) the damage census: which parts' pieces resolve widths through a
//     DIFFERENT subset than their own form declares.
// Usage: bun scripts/r126-hyphen-census.ts
import { readFileSync } from "node:fs";

const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(path);
const ascii = raw.toString("latin1");

// (a) the hyphen-name forms
console.log("=== (a) the Form XObjects with hyphenated /Font pair names (the f-0-N class) ===");
const hyphenForms = new Map<number, Map<string, number>>();
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const body = rm[2];
  if (!/\/Subtype\s*\/Form\b/.test(body)) continue;
  const pairs = new Map<string, number>();
  for (const fm of body.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g))
    for (const pm of fm[1].matchAll(/\/([\w#+.-]+)\s+(\d+)\s+0\s+R/g))
      if (pm[1] !== "Font") pairs.set(pm[1], parseInt(pm[2], 10));
  const hyphens = [...pairs.keys()].filter((k) => k.includes("-"));
  if (hyphens.length) {
    hyphenForms.set(parseInt(rm[1], 10), pairs);
    console.log(`form obj ${rm[1]} (${body.match(/\/PTEX.FileName\s*\(([^)]*)\)/)?.[1] ?? "?"}): ${[...pairs.entries()].map(([k, v]) => `${k}→${v}`).join(" ")}`);
  }
}
console.log(`hyphen-name forms: ${hyphenForms.size}`);

// which of these names ALSO appear in OTHER forms' resources (the candidate collision)?
console.log("\n=== (b) the same-named declarations across all forms/pages (the collision set) ===");
const nameDecls = new Map<string, { obj: number; form: number }[]>();
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const body = rm[2];
  for (const fm of body.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g))
    for (const pm of fm[1].matchAll(/\/([\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
      if (pm[1] === "Font") continue;
      const list = nameDecls.get(pm[1]) ?? nameDecls.set(pm[1], []).get(pm[1])!;
      list.push({ obj: parseInt(pm[2], 10), form: parseInt(rm[1], 10) });
    }
}
for (const [name, decls] of nameDecls) {
  if (!name.includes("-")) continue;
  const uniqObjs = [...new Set(decls.map((d) => d.obj))];
  console.log(`${name}: declared ${decls.length}x → objects ${uniqObjs.join(", ")} ${uniqObjs.length > 1 ? "*** COLLISION (the candidate chain picks the first) ***" : ""}`);
}

// (c) the width tables of the colliding candidates
console.log("\n=== (c) the candidates' /Widths tables (the divergence measurement) ===");
for (const [name, decls] of nameDecls) {
  const uniqObjs = [...new Set(decls.map((d) => d.obj))];
  if (uniqObjs.length < 2) continue;
  const tables = new Map<number, { fc: number; lc: number; w: number[] }>();
  for (const obj of uniqObjs) {
    const m = ascii.match(new RegExp(`(?:^|\\n)${obj} 0 obj\\s*<<([\\s\\S]{0,1500}?)>>`));
    if (!m) continue;
    const fc = Number(m[1].match(/\/FirstChar\s+(\d+)/)?.[1] ?? NaN);
    const lc = Number(m[1].match(/\/LastChar\s+(\d+)/)?.[1] ?? NaN);
    const wArr = m[1].match(/\/Widths\s*\[([\s\S]*?)\]/)?.[1];
    if (!wArr) continue;
    tables.set(obj, { fc, lc, w: wArr.trim().split(/\s+/).map(Number) });
  }
  if (tables.size < 2) continue;
  console.log(`${name}: ${tables.size} candidate tables`);
  const entries = [...tables.entries()];
  for (let i = 1; i < entries.length; i++) {
    const [aObj, a] = entries[0];
    const [bObj, b] = entries[i];
    const lo = Math.max(a.fc, b.fc), hi = Math.min(a.fc + a.w.length - 1, b.fc + b.w.length - 1);
    let diff = 0, samples: string[] = [];
    for (let c = lo; c <= hi; c++) {
      const wa = a.w[c - a.fc], wb = b.w[c - b.fc];
      if (wa !== wb) { diff++; if (samples.length < 5) samples.push(`code${c}: ${wa} vs ${wb}`); }
    }
    console.log(`  obj ${aObj} (${a.fc}..${a.fc + a.w.length - 1}) vs obj ${bObj} (${b.fc}..${b.fc + b.w.length - 1}): ${diff} differing codes in the overlap ${lo}..${hi}${diff ? " · " + samples.join(" · ") : ""}`);
  }
}
