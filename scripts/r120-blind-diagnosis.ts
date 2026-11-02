// r120-blind-diagnosis.ts — the width-blind taxonomy diagnosis (the r120
// hunt). For each blind member: the font objects' width forms (inline /W,
// inline /Widths, INDIRECT /Widths N 0 R), the carriage (raw vs ObjStm), and
// the Type0 descendant resolution — the exact failure layer per member,
// measured before any code. Byte-safe: offsets come from a Node-latin1
// (iso-8859-1, 1:1 byte↔char) string over the raw buffer — never the
// WHATWG TextDecoder("latin1") alias (windows-1252, which corrupts bytes
// 0x80-0x9F on any re-encode — the roundtrip bug this script's first draft
// hit).
// Usage: bun scripts/r120-blind-diagnosis.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
];

for (const [path, name] of members) {
  const buf = readFileSync(path);
  const s = buf.toString("latin1"); // true iso-8859-1 — 1:1 with bytes
  console.log(`\n===== ${name} =====`);
  type FO = { obj: number; base?: string; subtype?: string; wForm: string; carried: "raw" | "objstm" };
  const fonts = new Map<number, FO>();
  const classify = (obj: number, body: string, carried: "raw" | "objstm") => {
    const subtype = body.match(/\/Subtype\s*\/(\w+)/)?.[1];
    const base = body.match(/\/BaseFont\s*\/([\w#+-]+)/)?.[1];
    let wForm = "none";
    if (/\/Subtype\s*\/Type0\b/.test(body)) {
      const df = body.match(/\/DescendantFonts\s*\[\s*(\d+)\s+0\s+R/);
      wForm = df ? `type0->desc ${df[1]}` : "type0-no-desc";
    } else if (/\/W\s*\[/.test(body)) wForm = "inline /W";
    else if (/\/W\s+(\d+)\s+0\s+R/.test(body)) wForm = "INDIRECT /W";
    if (/\/Widths\s*\[/.test(body)) wForm += " + inline /Widths";
    else {
      const wi = body.match(/\/Widths\s+(\d+)\s+0\s+R/);
      if (wi) wForm += ` + INDIRECT /Widths obj${wi[1]}`;
    }
    fonts.set(obj, { obj, base, subtype, wForm, carried });
  };
  for (const fm of s.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
    if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
    classify(parseInt(fm[1], 10), fm[2], "raw");
  }
  // ObjStm harvest — byte offsets from the 1:1 string
  const objstmBodies = new Map<number, string>();
  let objstmCount = 0;
  for (const m of s.matchAll(/(\d+)\s+0\s+obj\s*(<<[^>]*\/Type\s*\/ObjStm[^>]*>>)/g)) {
    const dict = m[2];
    const First = parseInt(dict.match(/\/First\s+(\d+)/)?.[1] ?? "-1");
    const Len = parseInt(dict.match(/\/Length\s+(\d+)/)?.[1] ?? "-1");
    if (First < 0 || Len < 0) continue;
    const sm = s.slice(m.index + m[0].length).match(/^\s*stream\r?\n?/);
    if (!sm) continue;
    const dataStart = m.index + m[0].length + sm[0].length;
    let text = "";
    const chunk = buf.subarray(dataStart, dataStart + Len);
    try { text = inflateSync(chunk).toString("latin1"); } catch {
      try { text = inflateSync(buf.subarray(dataStart, s.indexOf("endstream", dataStart))).toString("latin1"); } catch { continue; }
    }
    objstmCount++;
    const hdr = text.match(/^\s*((?:\d+\s+\d+\s+)+)/);
    if (!hdr) continue;
    const nums = hdr[1].trim().split(/\s+/).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const start = First + nums[i + 1];
      const end = i + 2 < nums.length ? First + nums[i + 3] : text.length;
      const body = text.slice(start, end);
      objstmBodies.set(nums[i], body);
      if (/\/Type\s*\/Font\b/.test(body)) classify(nums[i], body, "objstm");
    }
  }
  // resolve Type0 descendants (raw or ObjStm-carried)
  const bodyOf = (obj: number): string | null => {
    if (objstmBodies.has(obj)) return objstmBodies.get(obj)!;
    const rm = s.match(new RegExp(`(?:^|\\n)${obj} 0 obj\\s*<<`));
    if (!rm) return null;
    const end = s.indexOf("endobj", rm.index);
    return s.slice(rm.index, end);
  };
  for (const [obj, fo] of [...fonts]) {
    const dm = fo.wForm.match(/^type0->desc (\d+)$/);
    if (!dm) continue;
    const descObj = parseInt(dm[1], 10);
    const body = bodyOf(descObj);
    if (body === null) { fo.wForm = "type0-desc MISSING"; continue; }
    let wForm = "none";
    if (/\/W\s*\[/.test(body)) wForm = "desc inline /W";
    else {
      const wi = body.match(/\/W\s+(\d+)\s+0\s+R/);
      if (wi) wForm = `desc INDIRECT /W obj${wi[1]}`;
    }
    if (/\/Widths\s*\[/.test(body)) wForm += " + desc inline /Widths";
    else {
      const wi = body.match(/\/Widths\s+(\d+)\s+0\s+R/);
      if (wi) wForm += ` + desc INDIRECT /Widths obj${wi[1]}`;
    }
    fo.wForm = wForm + ` [${objstmBodies.has(descObj) ? "objstm" : "raw"}]`;
  }
  console.log(`  ObjStms decoded: ${objstmCount} | font objects: ${fonts.size}`);
  const byForm = new Map<string, number>();
  for (const fo of fonts.values()) {
    const key = `${fo.wForm} (${fo.carried})`;
    byForm.set(key, (byForm.get(key) ?? 0) + 1);
  }
  for (const [form, n] of [...byForm].sort()) console.log(`  ${n}x ${form}`);
  // sample a few font faces
  let i = 0;
  for (const fo of fonts.values()) {
    if (i++ >= 4) break;
    console.log(`    e.g. obj${fo.obj} /${fo.base ?? "?"} ${fo.wForm} ${fo.carried}`);
  }
}
