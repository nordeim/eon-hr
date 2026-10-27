// r104-writer-census.mjs — census a candidate real-writer PDF: the Producer
// string, the text-operator counts (Tj/TJ/Td/Tm/Tf/BT), and a quick
// extractPdfText yield (alnum count + soup runs) via the app's own
// extractor. For the 12th-writer family hunt (macOS Quartz / XeTeX).
// Usage: node scripts/r104-writer-census.mjs <file.pdf> [file2.pdf ...]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const { extractTextFromFile } = await import("../src/lib/cv-text.ts");
const FileCls = (await import("node:buffer")).File;

for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path} ===`);
  const buf = readFileSync(path);
  const ascii = Buffer.from(buf).toString("latin1");

  // producer/creator (both literal and hex-encoded forms)
  const prod = ascii.match(/\/Producer\s*\(([^)]{0,120})\)/) || ascii.match(/\/Producer\s*<([0-9a-fA-F\s]+)>/);
  const creator = ascii.match(/\/Creator\s*\(([^)]{0,120})\)/) || ascii.match(/\/Creator\s*<([0-9a-fA-F\s]+)>/);
  const hexToStr = (h) => h ? Buffer.from(h.replace(/\s+/g, ""), "hex").toString("latin1") : h;
  console.log("Producer:", prod ? hexToStr(prod[1]) : "(none)");
  console.log("Creator:", creator ? hexToStr(creator[1]) : "(none)");

  // object streams + content streams census
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m; let contentStreams = 0;
  let opCounts = { Tj: 0, TJ: 0, Td: 0, TD: 0, Tm: 0, Tf: 0, BT: 0, Tstar: 0, TL: 0, Tz: 0, Ts: 0, cm: 0, Tc: 0, Tw: 0 };
  let totalText = "";
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
    // content-stream shape: text ops present
    if (!/(?:^|\n)\s*BT/.test(text) && !/Tj|TJ/.test(text)) continue;
    contentStreams++;
    for (const op of Object.keys(opCounts)) {
      const re = new RegExp(`(?:^|[\\s)\\]>])${op}(?=$|[\\s\\r\\n])`, "gm");
      const matches = text.match(re);
      if (matches) opCounts[op] += matches.length;
    }
    if (totalText.length < 400000) totalText += text + "\n";
  }
  console.log("content streams:", contentStreams);
  console.log("op census:", JSON.stringify(opCounts));

  // the extractor's own yield (through the File seam — the app's own path)
  const text = await extractTextFromFile(new FileCls([new Uint8Array(buf)], "census.pdf", { type: "application/pdf" }));
  const alnums = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const soupRuns = (text.match(/(?:^|\n)(?:[a-zA-Z0-9] ){4,}[a-zA-Z0-9](?=\n|$)/g) || []).length;
  console.log("extractor alnums:", alnums, "| soup runs:", soupRuns);
  console.log("first 400 chars:", JSON.stringify(text.slice(0, 400)));
}
