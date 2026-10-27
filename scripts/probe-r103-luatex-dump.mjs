// probe-r103-luatex-dump.mjs — dump the LuaTeX file's BT blocks to see the
// per-glyph soup mechanism (the "N o v" form).
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const buf = readFileSync("/home/z/my-project/tmp-r103/martino-lualatex.pdf");
const ascii = Buffer.from(buf).toString("latin1");
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  let text = "";
  try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd))); } catch {
    try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd), true)); } catch { continue; }
  }
  if (!text || !/TJ/.test(text)) continue;
  const bt = text.indexOf("BT");
  console.log("--- first BT block ---");
  console.log(JSON.stringify(text.slice(bt, bt + 1100)));
  // find the 'Nov' region: search for a TJ containing (N)
  const seg = text.match(/\[((?:[^\[\]\\]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/);
  if (seg) {
    console.log("--- first TJ array ---");
    console.log(JSON.stringify(seg[0].slice(0, 500)));
  }
  break;
}
