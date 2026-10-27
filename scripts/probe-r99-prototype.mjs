// R99 prototype: validate the two fix designs against the REAL downloaded
// PDFs + the crafted delimiter variants BEFORE writing them into src (the
// design-validation step; the src change lands via TDD after).
//   Fix A: stream delimiter regex → /stream[ \t]*(?:\r\n|\r|\n)/g + the
//          "end"-prefix guard (a "stream" inside "endstream" is never a start)
//   Fix B: hex-string atoms (<hex> Tj + hex atoms in TJ arrays) decoded
//          through parsed ToUnicode CMaps (bfchar/bfrange), Latin-1 fallback.
import { readFileSync } from "node:fs";

// ---- the prototype (mirrors the planned src shape) ----
const WIN_ANSI_HIGH = {
  0x80: "\u20AC", 0x82: "\u201A", 0x83: "\u0192", 0x84: "\u201E", 0x85: "\u2026",
  0x86: "\u2020", 0x87: "\u2021", 0x88: "\u02C6", 0x89: "\u2030", 0x8a: "\u0160",
  0x8b: "\u2039", 0x8c: "\u0152", 0x8e: "\u017D", 0x91: "\u2018", 0x92: "\u2019",
  0x93: "\u201C", 0x94: "\u201D", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014",
  0x98: "\u02DC", 0x99: "\u2122", 0x9a: "\u0161", 0x9b: "\u203A", 0x9c: "\u0153",
  0x9e: "\u017E", 0x9f: "\u0178",
};
function latin1Printable(b) {
  const high = WIN_ANSI_HIGH[b];
  if (high !== undefined) return high;
  return (b >= 32 && b < 127) || b >= 0xa0 ? String.fromCharCode(b) : " ";
}
function utf16be(hex) {
  const h = hex.length % 4 === 0 ? hex : hex.padStart(Math.ceil(hex.length / 4) * 4, "0");
  let out = "";
  for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
  return out;
}
function parseToUnicode(text) {
  if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) return null;
  const map = new Map();
  let codeLen = 2;
  const cs = text.match(/begincodespacerange([\s\S]*?)endcodespacerange/);
  if (cs) {
    const first = cs[1].match(/<([0-9A-Fa-f]+)>/);
    if (first) codeLen = first[1].length > 2 ? 2 : 1;
  }
  const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
  let m;
  while ((m = bfRe.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    let p;
    while ((p = pairRe.exec(m[1]))) map.set(parseInt(p[1], 16), utf16be(p[2]));
  }
  const brRe = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = brRe.exec(text))) {
    let r;
    const arrRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g;
    while ((r = arrRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16), hi = parseInt(r[2], 16);
      (r[3].match(/<([0-9A-Fa-f]+)>/g) ?? []).forEach((d, i) => {
        const c = lo + i;
        if (c <= hi) map.set(c, utf16be(d.slice(1, -1)));
      });
    }
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    while ((r = offRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16), hi = parseInt(r[2], 16), base = parseInt(r[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(base + (c - lo)));
    }
  }
  return map.size ? { codeLen, map } : null;
}
function decodeHexString(hexRaw, cmaps) {
  const hex = hexRaw.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (!hex) return "";
  const padded = hex.length % 2 ? hex + "0" : hex;
  const bytes = [];
  for (let i = 0; i < padded.length; i += 2) bytes.push(parseInt(padded.slice(i, i + 2), 16));
  for (const cm of cmaps) {
    if (cm.codeLen === 2) {
      if (bytes.length < 2 || bytes.length % 2) continue;
      const codes = [];
      let all = true;
      for (let i = 0; i < bytes.length; i += 2) {
        const c = bytes[i] * 256 + bytes[i + 1];
        if (!cm.map.has(c)) { all = false; break; }
        codes.push(c);
      }
      if (all) return codes.map((c) => cm.map.get(c)).join("");
    } else {
      if (!bytes.length || !bytes.every((b) => cm.map.has(b))) continue;
      return bytes.map((b) => cm.map.get(b)).join("");
    }
  }
  return bytes.map(latin1Printable).join("");
}

async function inflate(b, format) {
  const stream = new Blob([b]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function extract(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = new TextDecoder("latin1").decode(bytes);
  const cmaps = [];
  const pending = [];
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g; // FIX A
  let m;
  while ((m = streamRe.exec(ascii))) {
    if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue; // endstream guard
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    streamRe.lastIndex = end + 9;
    let chunkEnd = end;
    if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
    else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
    const chunk = bytes.subarray(start, chunkEnd);
    let text = "";
    for (const trimmed of [chunk, bytes.subarray(start, end)]) {
      try { text = new TextDecoder().decode(await inflate(trimmed, "deflate")); break; }
      catch { try { text = new TextDecoder().decode(await inflate(trimmed, "deflate-raw")); break; } catch { text = ""; } }
    }
    if (!text) continue;
    if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
      const cm = parseToUnicode(text);
      if (cm) cmaps.push(cm);
      continue;
    }
    // FIX B: atoms — literal (…) and hex <…>, direct or inside TJ arrays
    const atoms = [];
    const re = /\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g;
    while ((m = re.exec(text))) {
      if (m[1] !== undefined) atoms.push({ kind: "lit", raw: m[1] });
      else if (m[2] !== undefined) {
        const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
        let a;
        while ((a = atomRe.exec(m[2]))) atoms.push(a[1] !== undefined ? { kind: "lit", raw: a[1] } : { kind: "hex", raw: a[2] });
      } else if (m[3] !== undefined) atoms.push({ kind: "hex", raw: m[3] });
    }
    if (atoms.length) pending.push(atoms);
  }
  const parts = pending.map((atoms) =>
    atoms.map((at) => (at.kind === "hex" ? decodeHexString(at.raw, cmaps) : at.raw)).join(" ")
  );
  return { text: parts.join("\n"), cmaps: cmaps.length };
}

// ---- validation legs ----
const enc = new TextEncoder();
async function pdfFile(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const pdf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { pdf.set(p, o); o += p.length; }
  return new File([pdf], "probe.pdf", { type: "application/pdf" });
}
async function deflate(s) {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer());
}

// Leg 1: the delimiter variants (all six forms)
const content = "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, compliance skills and long meaningful text) Tj ET";
for (const [label, delim] of [
  ["standard stream\\r\\n", "stream\r\n"],
  ["LF-only stream\\n", "stream\n"],
  ["CR-only stream\\r", "stream\r"],
  ["space+CRLF stream \\r\\n", "stream \r\n"],
  ["space+LF stream \\n", "stream \n"],
]) {
  const d = await deflate(content);
  const file = await pdfFile([enc.encode("<<"), enc.encode(delim), d, enc.encode("\r\nendstream\r\nendobj")]);
  const r = await extract(file);
  console.log(`[${label}] →`, r.text.includes("Senior HR Manager") ? "EXTRACTED" : "LOST");
}

// Leg 2: the W3C dummy.pdf shape (hex strings + ToUnicode CMap)
{
  const cmapText = [
    "/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap",
    "/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
    "/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def",
    "1 begincodespacerange\n<00> <FF>\nendcodespacerange",
    "11 beginbfchar",
    "<01> <0044>\n<02> <0075>\n<03> <006D>\n<04> <0079>\n<05> <0020>",
    "<06> <0050>\n<07> <0046>\n<08> <0066>\n<09> <0069>\n<0A> <006C>\n<0B> <0065>",
    "endbfchar\nendcmap\nend\n",
  ].join("\n");
  const pageContent = "BT\n56.8 758.1 Td /F1 16.1 Tf <01020303> Tj\n50.1 0 Td <04> Tj\n9 0 Td <05> Tj\n4.4 0 Td <060107> Tj\n32.2 0 Td <050809> Tj\n14.3 0 Td <0A0B> Tj\nET";
  const d1 = await deflate(pageContent);
  const d2 = await deflate(cmapText);
  const file = await pdfFile([
    enc.encode("1 0 obj\n<< /Length " + d1.length + " >>\nstream\r\n"), d1, enc.encode("\r\nendstream\r\nendobj\n"),
    enc.encode("5 0 obj\n<< /Length " + d2.length + " >>\nstream\r\n"), d2, enc.encode("\r\nendstream\r\nendobj\n"),
  ]);
  const r = await extract(file);
  console.log("[dummy.pdf shape] →", JSON.stringify(r.text), "cmaps:", r.cmaps);
}

// Leg 3: hex-encoded Latin-1 WITHOUT a CMap (the Word-style hex form)
{
  const hexContent = "BT /F1 12 Tf <44756D6D79205044462066696C652077697468207061796C6F6C6C20616E6420474F5349> Tj ET";
  const d = await deflate(hexContent);
  const file = await pdfFile([enc.encode("<<"), enc.encode("stream\r\n"), d, enc.encode("\r\nendstream\r\nendobj")]);
  const r = await extract(file);
  console.log("[hex Latin-1, no CMap] →", JSON.stringify(r.text.slice(0, 60)));
}

// Leg 4: the REAL downloaded PDFs
for (const [label, path] of [
  ["REAL w3c dummy.pdf", "/home/z/my-project/tmp-r99/f15cf3fa.pdf"],
  ["REAL arXiv paper", "/home/z/my-project/tmp-r99/e0191719.pdf"],
  ["REAL orimi (encrypted)", "/home/z/my-project/tmp-r99/pdf-test.pdf"],
]) {
  const buf = readFileSync(path);
  const r = await extract(new File([buf], "real.pdf", { type: "application/pdf" }));
  console.log(`[${label}] → len=${r.text.length} cmaps=${r.cmaps} sample=${JSON.stringify(r.text.slice(0, 60))}`);
}

// Leg 5: regression — the existing fixture shapes (literal Tj/TJ + octal) still work
{
  const lit = "BT /F1 12 Tf [(Senior HR Manager) -120 (with payroll, GOSI)] TJ (r\\351sum\\351) Tj ET";
  const d = await deflate(lit);
  const file = await pdfFile([enc.encode("<<"), enc.encode("stream\r\n"), d, enc.encode("\r\nendstream\r\nendobj")]);
  const r = await extract(file);
  console.log("[regression literal+octal] →", JSON.stringify(r.text.slice(0, 80)));
}
