// r106-objstm-pages.mjs — session 106: why the page map is missing. Dumps the
// ObjStm-carried /Type /Page bodies (their /Resources form: inline vs
// referenced) and whether the referenced /Resources objects are themselves
// ObjStm-carried — the fontspec/dvipdfmx page-resolution gap.
// Usage: node scripts/r106-objstm-pages.mjs <file.pdf>
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

let objstmCount = 0;
let pagesInObjstm = 0;
let pagesInline = 0;
let pagesRefRes = 0;
let refResResolvedRaw = 0;
const rawResObjs = new Set();
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  if (/\/(F\w+)\s+\d+\s+0\s+R/.test(rm[2]) && !/\/Type\s*\/Page\b/.test(rm[2])) rawResObjs.add(parseInt(rm[1], 10));
}
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const sample = [];
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictRegion = ascii.slice(Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6), m.index);
  if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
    const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
    if (endSkip < 0) break;
    streamRe.lastIndex = endSkip + "endstream".length;
    continue;
  }
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  if (!/\/Type\s*\/ObjStm\b/.test(dictRegion)) continue;
  objstmCount++;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  let text = "";
  try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd))); } catch { continue; }
  const firstMatch = dictRegion.match(/\/First\s+(\d+)/);
  const hdr = text.match(/^\s*((?:\d+\s+\d+\s+)+)/);
  if (!firstMatch || !hdr) continue;
  const first = parseInt(firstMatch[1], 10);
  const nums = hdr[1].trim().split(/\s+/).map(Number);
  const entries = [];
  for (let i = 0; i + 1 < nums.length; i += 2) entries.push({ obj: nums[i], off: nums[i + 1] });
  for (let i = 0; i < entries.length; i++) {
    const s = first + entries[i].off;
    const e = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
    if (s > e || e > text.length) continue;
    const body = text.slice(s, e);
    if (!/\/Type\s*\/Page\b/.test(body)) continue;
    pagesInObjstm++;
    const contents = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
    const inline = /\/Font\s*<</.test(body);
    const ref = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (inline) pagesInline++;
    else if (ref) {
      pagesRefRes++;
      const resolvedRaw = rawResObjs.has(parseInt(ref[1], 10));
      if (resolvedRaw) refResResolvedRaw++;
      if (sample.length < 4) sample.push({ objstmEntry: entries[i].obj, contents: contents?.[1], res: ref[1], resInRawPass: resolvedRaw });
    } else if (sample.length < 4) sample.push({ objstmEntry: entries[i].obj, contents: contents?.[1], resForm: "NO-RESOURCES-KEY" });
  }
}
console.log(`ObjStms: ${objstmCount}`);
console.log(`pages in ObjStms: ${pagesInObjstm} (inline fonts: ${pagesInline}, referenced /Resources: ${pagesRefRes}, of which resolvable by the RAW pass: ${refResResolvedRaw})`);
for (const s of sample) console.log("  sample:", JSON.stringify(s));
process.exit(0);
