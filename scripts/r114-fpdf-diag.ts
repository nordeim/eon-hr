// r114-fpdf-diag.ts — the stage-by-stage diagnostic on the fpdf2 probe.
// Where does the extraction die? (1) the content stream walked? (2) pieces
// pushed? (3) the ToUnicode CMaps collected? (4) the font chain resolved?
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const raw = new Uint8Array(readFileSync("/tmp/r114-writers/fpdf-cv.pdf"));
// decode as latin1 so we can regex the ascii frame like the source does
const ascii = new TextDecoder("latin1").decode(raw);

// (1) find the content stream (obj 4) and its decode result — replicate the
// source's stream walk for this one stream
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const streams: { objNum: number; dict: string; text: string; kind: string }[] = [];
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
  const dictRegion = ascii.slice(dictStart, m.index);
  const objMatch = dictRegion.match(/^\s*(\d+)\s+0\s+obj\b/) ?? dictRegion.match(/(\d+)\s+0\s+obj\b/);
  const objNum = objMatch ? parseInt(objMatch[1], 10) : -1;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) continue;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = raw.subarray(start, chunkEnd);
  const hasFilter = /\/Filter\b/.test(dictRegion);
  let text = "";
  const zlib = await import("node:zlib");
  const inflateSync = (b: Uint8Array) => zlib.inflateSync(b);
  const zRawInflate = (b: Uint8Array) => zlib.inflateRawSync(b);
  const attempts: string[] = [];
  for (const trimmed of [chunk, raw.subarray(start, end)]) {
    try { text = new TextDecoder("latin1").decode(inflateSync(trimmed)); attempts.push("deflate"); break; } catch { /* next */ }
    try { text = new TextDecoder("latin1").decode(zRawInflate(trimmed)); attempts.push("raw-deflate"); break; } catch { /* next */ }
    if (!hasFilter) { text = new TextDecoder("latin1").decode(trimmed); attempts.push("RAW (undeclared)"); break; }
  }
  const kind = text.includes("beginbfchar") || text.includes("beginbfrange") ? "CMAP"
    : /(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text) ? "content?" : "other";
  streams.push({ objNum, dict: dictRegion.replace(/\s+/g, " ").slice(0, 90), text, kind });
  void attempts;
}
for (const s of streams) {
  console.log(`obj ${s.objNum} [${s.kind}] len=${s.text.length} dict=${JSON.stringify(s.dict)}`);
}
// (2) the content stream: count text-show pieces with the source's regexes
const content = streams.find((s) => s.kind === "content?");
if (content) {
  const litRe = /\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)\s*(Tj|TJ|'|")/g;
  const arrRe = /\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*\))*)\]\s*TJ/g;
  let count = 0, mm;
  while ((mm = litRe.exec(content.text))) count++;
  let acount = 0;
  while ((mm = arrRe.exec(content.text))) acount++;
  console.log(`\ncontent stream obj ${content.objNum}: ${count} literal shows, ${acount} TJ arrays`);
  // printable census (the R102-A leg 3)
  let printable = 0; const samples = Math.min(content.text.length, 4096);
  const stride = Math.max(1, Math.floor(content.text.length / samples)); let taken = 0;
  for (let i = 0; i < content.text.length; i += stride) { taken++; const c = content.text.charCodeAt(i); if ((c >= 32 && c < 127) || c === 10 || c === 13 || c === 9) printable++; }
  console.log(`printable census: ${printable}/${taken} = ${(printable / taken * 100).toFixed(1)}% (gate: >= 60%)`);
  // the first 3 literal shows raw bytes
  litRe.lastIndex = 0; let shown = 0;
  while ((mm = litRe.exec(content.text)) && shown < 3) {
    console.log(`literal[${shown}]: ${JSON.stringify(mm[1].slice(0, 40))} hex=${Buffer.from(mm[1], "latin1").toString("hex").slice(0, 60)} op=${mm[2]}`);
    shown++;
  }
}
// (3) the cmap streams — parse them with the source's parser
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const cmapStreams = streams.filter((s) => s.kind === "CMAP");
console.log(`\ncmap streams: ${cmapStreams.map((s) => `obj ${s.objNum} (${s.text.length}b)`).join(", ")}`);

// (4) full extraction at HEAD + the yield guard check
const ours = await mod.extractTextFromFile(new File([raw], "probe.pdf"));
console.log(`\nHEAD extraction: ${ours.length} chars, alnums=${ours.replace(/[^A-Za-z0-9]/g, "").length}`);
console.log(JSON.stringify(ours.slice(0, 200)));
