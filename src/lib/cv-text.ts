// Session 95 (R95-A): the REF's AI CV Upload tab is a FILE-UPLOAD surface
// ("PDF, DOC, DOCX — AI will parse & score automatically" — the hidden
// input's accept set, live-captured on the REF). The clone's superset keeps
// the flow working with ZERO new dependencies: the browser-native
// DecompressionStream inflates the .docx zip's word/document.xml (the zip
// central-directory walk) and the .pdf's FlateDecode streams, with a
// printable-scrub fallback for plain-text and legacy .doc files. Everything
// is best-effort and deterministic: a file that yields nothing readable
// surfaces an actionable error in the UI instead of a garbage "analysis".

/** The minimum alphanumeric yield for a "readable" extraction. */
const MIN_ALPHANUMERIC = 40;

function isMeaningful(text: string): boolean {
  const alnum = text.replace(/[^A-Za-z0-9]/g, "");
  return alnum.length >= MIN_ALPHANUMERIC;
}

/**
 * The per-stream inflated-output budget (R105-A). The R102-A dict gate skips
 * /Image and /FontFile streams BEFORE the inflate, but every other stream
 * type (ObjStm, Form, Metadata, content) inflated to completion before any
 * gate could reject it — a crafted deflate bomb inside an ObjStm expanded
 * unbounded in the tab (the client-side self-DoS; the session-105 audit's
 * M-1). 8MB is two orders of magnitude above the largest legitimate
 * content/ObjStm/CMap stream in the 12-writer corpus and far below the 26MB
 * image streams that never reach inflate. An over-budget stream throws —
 * the callers' standing best-effort catches turn it into "" and the
 * per-stream `continue` contract holds (one bomb never kills the file).
 */
const MAX_INFLATED_BYTES = 8 * 1024 * 1024;

async function inflate(bytes: Uint8Array, format: "deflate-raw" | "deflate"): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  // the streaming byte budget: read chunk-wise and abort the producer the
  // moment the accumulated output crosses the cap — the bomb never
  // materializes (a plain arrayBuffer() would inflate it whole first)
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
    if (total > MAX_INFLATED_BYTES) {
      await reader.cancel().catch(() => {});
      throw new Error("inflate budget exceeded");
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// .docx — the minimal ZIP reader (find word/document.xml, inflate it)
// ---------------------------------------------------------------------------

interface ZipEntryHeader {
  name: string;
  method: number;
  compressedSize: number;
  dataOffset: number;
}

/**
 * Walks the zip's central directory (backwards from the End of Central
 * Directory record) collecting the entry headers — no external zip lib.
 * Handles both the classic 0xffffffff-free layout and >64k archives is NOT
 * attempted (a CV never needs it; the fallback path catches the rest).
 */
function readZipEntries(bytes: Uint8Array): ZipEntryHeader[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();

  // locate the EOCD: scan backwards from the tail for the signature
  let eocd = -1;
  const min = Math.max(0, bytes.length - 66_000);
  for (let i = bytes.length - 22; i >= min; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return [];

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries: ZipEntryHeader[] = [];

  for (let i = 0; i < count; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break; // central header signature
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen));

    // the local header's variable part: read ITS name/extra lengths (they
    // are allowed to differ from the central record's)
    const lNameLen = view.getUint16(localOffset + 26, true);
    const lExtraLen = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + lNameLen + lExtraLen;

    entries.push({ name, method, compressedSize, dataOffset });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** Reads word/document.xml from a .docx and returns its XML text. */
async function readDocxDocumentXml(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entry = readZipEntries(bytes).find((e) => e.name === "word/document.xml");
  if (!entry) return "";
  const data = bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
  const xmlBytes =
    entry.method === 8 ? await inflate(data, "deflate-raw") : entry.method === 0 ? data : new Uint8Array(0);
  return new TextDecoder().decode(xmlBytes);
}

/** Extracts the text content from OOXML: paragraph breaks at w:p, runs from w:t. */
function xmlToText(xml: string): string {
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:t[^>]*>/g, "")
    .replace(/<\/w:t>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// .pdf — the FlateDecode stream scan + the text-operator extraction
// ---------------------------------------------------------------------------

// Session 98 (R98-B) + Session 99 (R99-B): the WinAnsi (cp1252) high block —
// 0x80–0x9F is where WinAnsi diverges from Latin-1 (curly quotes, em-dash,
// €, ™). Shared by the literal unescape and the hex decode.
const WIN_ANSI_HIGH: Record<number, string> = {
  0x80: "\u20AC", 0x82: "\u201A", 0x83: "\u0192", 0x84: "\u201E", 0x85: "\u2026",
  0x86: "\u2020", 0x87: "\u2021", 0x88: "\u02C6", 0x89: "\u2030", 0x8a: "\u0160",
  0x8b: "\u2039", 0x8c: "\u0152", 0x8e: "\u017D", 0x91: "\u2018", 0x92: "\u2019",
  0x93: "\u201C", 0x94: "\u201D", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014",
  0x98: "\u02DC", 0x99: "\u2122", 0x9a: "\u0161", 0x9b: "\u203A", 0x9c: "\u0153",
  0x9e: "\u017E", 0x9f: "\u0178",
};

/** A decoded byte through the WinAnsi/Latin-1 printable rule (controls → space). */
function latin1Printable(code: number): string {
  const high = WIN_ANSI_HIGH[code];
  if (high !== undefined) return high;
  // printable ASCII + the Latin-1 letters (0xA0-0xFF: é ñ ü …);
  // DEL and the unmapped C1 controls carry no CV text → space
  return (code >= 32 && code < 127) || code >= 0xa0 ? String.fromCharCode(code) : " ";
}

// Session 99 (R99-B): the ToUnicode CMap — how subset fonts map their GLYPH
// INDICES to real characters. A PDF's hex strings in such files (<01020303>
// Tj) carry glyph codes, and the mapping (<01>→D, <02>→u, <03>→m…) lives in
// a separate FlateDecode stream carrying beginbfchar/beginbfrange blocks.
interface CodeMap {
  codeLen: 1 | 2;
  map: Map<number, string>;
}

// Session 105 (R105-B): the standard-14 marker tables — a simple font whose
// /BaseFont names ZapfDingbats or Symbol (and whose codes no ToUnicode map
// covers) decodes through its STANDARD encoding (PDF 32000-1 Annex D), never
// the Latin-1 fallback: ZapfDingbats <33> is ✓ U+2713 (not "3"), Symbol <41>
// is Α U+0391. Reduced to the single-byte range real PDFs use; the
// private-use composition extenders (Symbol's 0x60 radicalex) are omitted —
// glyph-composition internals, never CV text.
const ZAPF_DINGBATS: Record<number, string> = {
  0x20: " ",
  0x21: "\u2701", 0x22: "\u2702", 0x23: "\u2703", 0x24: "\u2704", 0x25: "\u260E", 0x26: "\u2706",
  0x27: "\u2707", 0x28: "\u2708", 0x29: "\u2709", 0x2a: "\u261B", 0x2b: "\u261E", 0x2c: "\u270C",
  0x2d: "\u270D", 0x2e: "\u270E", 0x2f: "\u270F",
  0x30: "\u2710", 0x31: "\u2711", 0x32: "\u2712", 0x33: "\u2713", 0x34: "\u2714", 0x35: "\u2715",
  0x36: "\u2716", 0x37: "\u2717", 0x38: "\u2718", 0x39: "\u2719", 0x3a: "\u271A", 0x3b: "\u271B",
  0x3c: "\u271C", 0x3d: "\u271D", 0x3e: "\u271E", 0x3f: "\u271F",
  0x40: "\u2720", 0x41: "\u2721", 0x42: "\u2722", 0x43: "\u2723", 0x44: "\u2724", 0x45: "\u2725",
  0x46: "\u2726", 0x47: "\u2727", 0x48: "\u2605", 0x49: "\u2606", 0x4a: "\u272A", 0x4b: "\u272B",
  0x4c: "\u272C", 0x4d: "\u272D", 0x4e: "\u272E", 0x4f: "\u272F",
  0x50: "\u2730", 0x51: "\u2731", 0x52: "\u2732", 0x53: "\u2733", 0x54: "\u2734", 0x55: "\u2735",
  0x56: "\u2736", 0x57: "\u2737", 0x58: "\u2738", 0x59: "\u2739", 0x5a: "\u273A", 0x5b: "\u273B",
  0x5c: "\u273C", 0x5d: "\u273D", 0x5e: "\u273E", 0x5f: "\u273F",
  0x60: "\u2740", 0x61: "\u2741", 0x62: "\u2742", 0x63: "\u2743", 0x64: "\u2744", 0x65: "\u2745",
  0x66: "\u2746", 0x67: "\u2747", 0x68: "\u2748", 0x69: "\u2749", 0x6a: "\u274A", 0x6b: "\u274B",
  0x6c: "\u25CF", 0x6d: "\u274D", 0x6e: "\u25A0", 0x6f: "\u274F",
  0x70: "\u2750", 0x71: "\u2751", 0x72: "\u2752", 0x73: "\u25B2", 0x74: "\u25BC", 0x75: "\u25C6",
  0x76: "\u2756", 0x77: "\u25A0", 0x78: "\u2758", 0x79: "\u2759", 0x7a: "\u275A", 0x7b: "\u275B",
  0x7c: "\u275C", 0x7d: "\u275D", 0x7e: "\u275E",
};

const SYMBOL_FONT: Record<number, string> = {
  0x20: " ", 0x21: "!", 0x22: "\u2200", 0x23: "#", 0x24: "\u2203", 0x25: "%", 0x26: "&",
  0x27: "\u2201", 0x28: "(", 0x29: ")", 0x2a: "\u2217", 0x2b: "+", 0x2c: ",", 0x2d: "\u2212",
  0x2e: ".", 0x2f: "/",
  0x30: "0", 0x31: "1", 0x32: "2", 0x33: "3", 0x34: "4", 0x35: "5", 0x36: "6", 0x37: "7",
  0x38: "8", 0x39: "9",
  0x3a: ":", 0x3b: ";", 0x3c: "<", 0x3d: "=", 0x3e: ">", 0x3f: "\u2250", 0x40: "\u224C",
  0x41: "\u0391", 0x42: "\u0392", 0x43: "\u03A7", 0x44: "\u0394", 0x45: "\u0395", 0x46: "\u03A6",
  0x47: "\u0393", 0x48: "\u0397", 0x49: "\u0399", 0x4a: "\u03D1", 0x4b: "\u039A", 0x4c: "\u039B",
  0x4d: "\u039C", 0x4e: "\u039D", 0x4f: "\u039F",
  0x50: "\u03A0", 0x51: "\u0398", 0x52: "\u03A1", 0x53: "\u03A3", 0x54: "\u03A4", 0x55: "\u03A5",
  0x56: "\u03C2", 0x57: "\u03A9", 0x58: "\u039E", 0x59: "\u03A8", 0x5a: "\u0396",
  0x5b: "[", 0x5c: "\u2234", 0x5d: "]", 0x5e: "\u22A5", 0x5f: "_",
  0x61: "\u03B1", 0x62: "\u03B2", 0x63: "\u03C7", 0x64: "\u03B4", 0x65: "\u03B5", 0x66: "\u03C6",
  0x67: "\u03B3", 0x68: "\u03B7", 0x69: "\u03B9", 0x6a: "\u03D5", 0x6b: "\u03BA", 0x6c: "\u03BB",
  0x6d: "\u03BC", 0x6e: "\u03BD", 0x6f: "\u03BF",
  0x70: "\u03C0", 0x71: "\u03B8", 0x72: "\u03C1", 0x73: "\u03C3", 0x74: "\u03C4", 0x75: "\u03C5",
  0x76: "\u03D6", 0x77: "\u03C9", 0x78: "\u03BE", 0x79: "\u03C8", 0x7a: "\u03B6",
  0x7b: "{", 0x7c: "|", 0x7d: "}", 0x7e: "\u223C",
};

/** The marker tables keyed by lowercased /BaseFont name (subset "ABCDEF+" prefixes stripped). */
const MARKER_TABLES: Record<string, CodeMap> = {
  zapfdingbats: { codeLen: 1, map: new Map(Object.entries(ZAPF_DINGBATS).map(([k, v]) => [Number(k), v])) },
  symbol: { codeLen: 1, map: new Map(Object.entries(SYMBOL_FONT).map(([k, v]) => [Number(k), v])) },
};

// Session 108 (R108-B): the MacRoman high block — the macOS Quartz writer
// (Producer "… Quartz PDFContext", the 13th writer family) declares
// /Encoding /MacRomanEncoding on its fonts and carries its typographic
// characters as RAW single-byte literals in Flate-compressed content
// streams: MacRoman 0xD5 is ' U+2019 (the right single quote), 0xD4 the
// left, 0xD0/0xD1 the en/em dashes — NOT the Latin-1 readings. The
// authoritative 0x80-0xFF zone (the canonical Apple mapping, = PDF 32000-1
// Annex D's Mac OS Roman table). The "a font that NAMES its encoding is
// its own ToUnicode" doctrine (the R105-B marker precedent's second
// member): the marker fires ONLY on the font's OWN declaration — a
// ToUnicode CMap still wins (the writer's own truth), and a font
// declaring WinAnsi (or nothing) keeps the standing Latin-1 path (the
// WinAnsi raw-literal class stays the documented watch).
const MAC_ROMAN_HIGH: Record<number, string> = {
  0x80: "\u00C4", 0x81: "\u00C5", 0x82: "\u00C7", 0x83: "\u00C9", 0x84: "\u00D1", 0x85: "\u00D6",
  0x86: "\u00DC", 0x87: "\u00E1", 0x88: "\u00E0", 0x89: "\u00E2", 0x8a: "\u00E4", 0x8b: "\u00E3",
  0x8c: "\u00E5", 0x8d: "\u00E7", 0x8e: "\u00E9", 0x8f: "\u00E8", 0x90: "\u00EA", 0x91: "\u00EB",
  0x92: "\u00ED", 0x93: "\u00EC", 0x94: "\u00EE", 0x95: "\u00EF", 0x96: "\u00F1", 0x97: "\u00F3",
  0x98: "\u00F2", 0x99: "\u00F4", 0x9a: "\u00F6", 0x9b: "\u00F5", 0x9c: "\u00FA", 0x9d: "\u00F9",
  0x9e: "\u00FB", 0x9f: "\u00FC", 0xa0: "\u2020", 0xa1: "\u00B0", 0xa2: "\u00A2", 0xa3: "\u00A3",
  0xa4: "\u00A7", 0xa5: "\u2022", 0xa6: "\u00B6", 0xa7: "\u00DF", 0xa8: "\u00AE", 0xa9: "\u00A9",
  0xaa: "\u2122", 0xab: "\u00B4", 0xac: "\u00A8", 0xad: "\u2260", 0xae: "\u00C6", 0xaf: "\u00D8",
  0xb0: "\u221E", 0xb1: "\u00B1", 0xb2: "\u2264", 0xb3: "\u2265", 0xb4: "\u00A5", 0xb5: "\u00B5",
  0xb6: "\u2202", 0xb7: "\u2211", 0xb8: "\u220F", 0xb9: "\u03C0", 0xba: "\u222B", 0xbb: "\u00AA",
  0xbc: "\u00BA", 0xbd: "\u03A9", 0xbe: "\u00E6", 0xbf: "\u00F8", 0xc0: "\u00BF", 0xc1: "\u00A1",
  0xc2: "\u00AC", 0xc3: "\u221A", 0xc4: "\u0192", 0xc5: "\u2248", 0xc6: "\u2206", 0xc7: "\u00AB",
  0xc8: "\u00BB", 0xc9: "\u2026", 0xca: "\u00A0", 0xcb: "\u00C0", 0xcc: "\u00C3", 0xcd: "\u00D5",
  0xce: "\u0152", 0xcf: "\u0153", 0xd0: "\u2013", 0xd1: "\u2014", 0xd2: "\u201C", 0xd3: "\u201D",
  0xd4: "\u2018", 0xd5: "\u2019", 0xd6: "\u00F7", 0xd7: "\u25CA", 0xd8: "\u00FF", 0xd9: "\u0178",
  0xda: "\u2044", 0xdb: "\u20AC", 0xdc: "\u2039", 0xdd: "\u203A", 0xde: "\uFB01", 0xdf: "\uFB02",
  0xe0: "\u2021", 0xe1: "\u00B7", 0xe2: "\u201A", 0xe3: "\u201E", 0xe4: "\u2030", 0xe5: "\u00C2",
  0xe6: "\u00CA", 0xe7: "\u00C1", 0xe8: "\u00CB", 0xe9: "\u00C8", 0xea: "\u00CD", 0xeb: "\u00CE",
  0xec: "\u00CF", 0xed: "\u00CC", 0xee: "\u00D3", 0xef: "\u00D4", 0xf0: "\uF8FF", 0xf1: "\u00D2",
  0xf2: "\u00DA", 0xf3: "\u00DB", 0xf4: "\u00D9", 0xf5: "\u0131", 0xf6: "\u02C6", 0xf7: "\u02DC",
  0xf8: "\u00AF", 0xf9: "\u02D8", 0xfa: "\u02D9", 0xfb: "\u02DA", 0xfc: "\u00B8", 0xfd: "\u02DD",
  0xfe: "\u02DB", 0xff: "\u02C7",
};
// the marker CodeMap: the printable ASCII zone is identity (a hex atom's
// WHOLE byte range must be covered for decodeHexString's covering rule to
// pick the map); the high zone is the MacRoman table
const MAC_ROMAN_MAP = new Map<number, string>();
for (let c = 0x20; c <= 0x7f; c++) MAC_ROMAN_MAP.set(c, String.fromCharCode(c));
for (const [k, v] of Object.entries(MAC_ROMAN_HIGH)) MAC_ROMAN_MAP.set(Number(k), v);
const MAC_ROMAN_CMAP: CodeMap = { codeLen: 1, map: MAC_ROMAN_MAP };

/** Decodes a UTF-16BE hex payload (the CMap dst form) into a string. */
function utf16be(hex: string): string {
  const h = hex.length % 4 === 0 ? hex : hex.padStart(Math.ceil(hex.length / 4) * 4, "0");
  let out = "";
  for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
  return out;
}

/**
 * Parses a ToUnicode CMap from an inflated stream's text: the codespacerange
 * decides 1-byte vs 2-byte codes; bfchar pairs, bfrange base-offset and
 * bfrange array forms all feed one code→string map. Returns null when the
 * text carries no CMap markers.
 */
function parseToUnicode(text: string): CodeMap | null {
  if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) return null;
  const map = new Map<number, string>();
  let codeLen: 1 | 2 = 2; // CID default when the codespace is unparseable
  const cs = text.match(/begincodespacerange([\s\S]*?)endcodespacerange/);
  if (cs) {
    const first = cs[1].match(/<([0-9A-Fa-f]+)>/);
    if (first) codeLen = first[1].length > 2 ? 2 : 1;
  }
  let m: RegExpExecArray | null;
  const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((m = bfRe.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    let p: RegExpExecArray | null;
    while ((p = pairRe.exec(m[1]))) map.set(parseInt(p[1], 16), utf16be(p[2]));
  }
  const brRe = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = brRe.exec(text))) {
    let r: RegExpExecArray | null;
    // the array form: <lo> <hi> [<d1> <d2> …]
    const arrRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g;
    while ((r = arrRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16);
      const hi = parseInt(r[2], 16);
      (r[3].match(/<([0-9A-Fa-f]+)>/g) ?? []).forEach((d, i) => {
        const c = lo + i;
        if (c <= hi) map.set(c, utf16be(d.slice(1, -1)));
      });
    }
    // the base-offset form: <lo> <hi> <dst> — each code maps to dst + offset
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    while ((r = offRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16);
      const hi = parseInt(r[2], 16);
      const base = parseInt(r[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(base + (c - lo)));
    }
  }
  return map.size ? { codeLen, map } : null;
}

/**
 * Decodes a hex-string operand (R99-B). CMap-first: the first ToUnicode map
 * that covers ALL the string's codes is authoritative (a ToUnicode map is
 * the writer's own glyph→character truth). With no covering map the bytes
 * decode as hex-encoded Latin-1/WinAnsi — the Word-style <44756D6D79> form.
 */
function decodeHexString(hexRaw: string, cmaps: CodeMap[]): string {
  const hex = hexRaw.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (!hex) return "";
  // an odd digit count takes a trailing 0 (ISO 32000 §7.3.4.3)
  const padded = hex.length % 2 ? hex + "0" : hex;
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 2) bytes.push(parseInt(padded.slice(i, i + 2), 16));
  for (const cm of cmaps) {
    if (cm.codeLen === 2) {
      if (bytes.length < 2 || bytes.length % 2) continue;
      const codes: number[] = [];
      let covered = true;
      for (let i = 0; i < bytes.length; i += 2) {
        const c = bytes[i] * 256 + bytes[i + 1];
        if (!cm.map.has(c)) {
          covered = false;
          break;
        }
        codes.push(c);
      }
      if (covered) return codes.map((c) => cm.map.get(c) ?? "").join("");
    } else {
      if (!bytes.length || !bytes.every((b) => cm.map.has(b))) continue;
      return bytes.map((b) => cm.map.get(b) ?? "").join("");
    }
  }
  return bytes.map(latin1Printable).join("");
}

/**
 * A text-showing piece with its leading separator (R100-A) and its font
 * name (R102-B): the separator is decided by the POSITIONING between shows,
 * and the hex decode by the font's OWN ToUnicode CMap when the file's
 * object structure resolves it. R103: a piece whose " " separator came from
 * a ty=0 em-gap between shows carries condGap — in streams that write
 * EXPLICIT space glyphs (the Skia/LO convention: word gaps are glyphs, never
 * bare moves) those gaps are split-word continuations and resolve to joins
 * at assembly time (the R103-C conditional).
 */
type TextPiece = { sep: string; font?: string; condGap?: boolean } & ({ kind: "lit"; text: string } | { kind: "hex"; hex: string });

/**
 * Pulls the text operands out of a content stream's text-showing operators
 * as separator-annotated pieces, reading order preserved.
 * Session 97 (R97-A): the literal forms — (…) Tj|TJ|'|" and the TJ array.
 * Session 99 (R99-B): the HEX forms — <…> Tj|TJ|'|" and hex atoms inside
 * TJ arrays (the W3C dummy.pdf / subset-font writer shape; the hex decodes
 * later, through the file's ToUnicode CMaps when they cover its codes).
 * Session 100 (R100-A): the POSITION-AWARE JOIN — the Acrobat/LiveCycle
 * XFA writers (pinned on the real IRS f1040) write each glyph as its own
 * (X)Tj show with a glyph-advance Td move between shows (0.2–0.65 em),
 * while word gaps are bigger Td moves (1.2+ em) and spaces ride INSIDE
 * atoms. A blind " "-join turns such files into letter soup ("p a y r o
 * l l") that no keyword matcher can score. The walk tracks the Tf size
 * (the em denominator — the Tm scale cancels: em = |tx| / Tf_size) and
 * the Td/TD moves between shows: a same-line forward move under 1.0 em
 * joins WITHOUT a space (the glyph advance); ≥ 1.0 em, a backwards move,
 * or a ty≠0 move separates (space / newline). With NO positioning between
 * shows the standing space join holds, and the TJ-array INTERNALS decide
 * their separators by the inter-atom numbers' |sum| against the 0.1-em
 * kern boundary (Session 101, R101-A: ≥ 100 thousandths is a word gap —
 * pdfTeX's interword glue and the R97 fixture's -120; under is a kern and
 * the atoms join — the real Word/Adobe/pdfTeX writer forms; adjacent
 * atoms with no number keep the standing space join).
 * Session 102 (R102-C): the SIGN rule — every REAL word gap in the corpus
 * is NEGATIVE (pdfTeX's -209…-442 interword glue, the R97 fixture's
 * -120), while LibreOffice writes the classic T-lowercase overhang kerns
 * as POSITIVE +110…+149 thousandths (the biggest kern class in common
 * fonts — "T eam" under the sign-blind rule). The gap fires only when
 * the consecutive-number SUM is ≤ -100; positive sums (any magnitude)
 * and small negatives join.
 */
function pdfTextPieces(content: string): TextPiece[] {
  const pieces: TextPiece[] = [];
  // Session 98 (R98-B): the single-pass alternation unescape is REQUIRED: a
  // sequential replace cannot tell \\053 (escaped backslash + literal
  // digits) from \053 (octal escape) — the alternation consumes the whole
  // escaped-backslash match before the octal branch can misread its tail.
  const unescape = (s: string) =>
    s.replace(
      /\\(?:([0-7]{1,3})|([nrtbf])|([()\\])|(\r?\n))/g,
      (_match: string, oct?: string, ws?: string, lit?: string, eol?: string): string => {
        if (oct !== undefined) return latin1Printable(parseInt(oct, 8) % 256); // 1-3 octal digits, mod 256 per spec
        if (ws !== undefined) return " "; // \n \r \t \b \f → space (the \n contract kept)
        if (lit !== undefined) return lit; // \( \) \\
        return eol !== undefined ? "" : _match; // line continuation \<EOL>
      }
    );
  // The position state, per the R100-A rule:
  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)
  let pendingEm = 0; // accumulated |tx| / effSize since the last show
  let pendingTy = 0; // accumulated ty since the last show
  let moved = false; // any positioning operator since the last show?
  let backward = false; // any backwards (tx < 0) move?
  // The R103-B absolute-position state: the LAST axis-aligned Tm's origin
  // (e,f) in user space — the separator between two Tm-separated shows comes
  // from the ORIGIN-TO-ORIGIN delta (the Google Docs/Skia form: every word
  // its own BT block, Tm + a constant-baseline Td; the LuaTeX form: every
  // word/glyph its own Tm). A Td arriving BEFORE any show in a fresh run
  // (shownSinceTm=false) carries a BASELINE placement, not a line move — the Skia
  // constant-baseline class (the -14.26 ty on every word) must not fire the
  // newline rule; line moves between shows keep the standing ty rule.
  let lastTm: { x: number; y: number } | null = null;
  let shownSinceTm = true; // a show since the last Tm? (true initially — Tm-less streams keep the ty rule)
  // R104-C: the XeTeX form's run state. A BT begins a FRESH RUN: the first
  // Td after it (with no Tm in between) carries an ABSOLUTE position (the
  // xdvipdfmx form: every word its own BT block — same-ty words on a line,
  // one leading between lines), and the ORIGIN-TO-ORIGIN delta from the
  // last fresh Td drives the separator exactly like the R103-B Tm rule.
  // btFresh: a show since the last BT? (true initially — BT-less streams
  // keep the standing between-shows rules). tmInRun: a Tm since the last
  // BT (the Skia/LuaTeX forms keep the r103-B rules verbatim — their Tds
  // NEVER take the fresh path). freshTdTaken: only the FIRST Td of a run
  // is absolute; later Tds in the same run are between-shows moves.
  let btFresh = true;
  let tmInRun = false;
  let freshTdTaken = false;
  let lastFreshTd: { x: number; y: number } | null = null;
  const reset = () => {
    pendingEm = 0;
    pendingTy = 0;
    moved = false;
    backward = false;
  };
  // fromKern: the gap was decided by a TJ-ARRAY INTERNAL NUMBER (the writer's
  // explicit numeric kern/gap intent — pdfTeX's -322 class) — never a
  // conditional; only Td/Tm-driven gaps (positioning moves, which the
  // space-glyph writers use for split-word continuations) are conditional.
  const push = (piece: { kind: "lit"; text: string } | { kind: "hex"; hex: string }, fromKern = false) => {
    let sep = " "; // the standing join: adjacent shows separate
    let condGap = false;
    if (moved) {
      if (pendingTy !== 0) sep = "\n"; // a line move is a line break
      else if (backward || pendingEm >= 1.0) {
        sep = " "; // a word gap / backstep
        condGap = !backward && !fromKern; // a forward MOVE-driven em-gap MIGHT be a split-word continuation (R103-C)
      } else sep = ""; // a same-line forward move under 1.0 em — the glyph advance
    }
    if (pieces.length === 0) sep = ""; // no leading separator on the first piece
    pieces.push({ sep, font: curFont, ...(condGap ? { condGap: true } : {}), ...piece });
    reset();
    shownSinceTm = true; // a show happened — the next Td is a BETWEEN-SHOWS move (the ty rule lives)
    btFresh = false; // R104-C: the show ends the fresh run — the next Td is a between-shows move
  };
  // The operator walk, left to right — the alternation order guarantees a
  // string/array match consumes its whole body before any inner fragment
  // could re-match (the same guarantee the old single regex relied on):
  //   1: Tf size | 2,3: Td/TD tx,ty | the T* line-op | BT (R104-C — the
  //   fresh-run marker) | 4,5: literal show + operator | 6: the TJ-array
  //   body | 7,8: hex show + operator | 9-14: the Tm operands a b c d e f
  //   (the R103-B position-aware form). The bare BT alternative carries
  //   the same token-level exposure as the standing bare T* (a BT inside a
  //   non-show string is unmeasured) — the standing design's class.
  const ops =
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\bBT\b|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;
  let m: RegExpExecArray | null;
  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) {
      effSize = parseFloat(m[1]) || 1;
      // the font NAME rides the match's own text (zero regex-group churn):
      // "/F1 16 Tf" → "F1" — the R102-B scoping key
      curFont = (m[0].split(/\s+/)[0] || "").replace(/^\//, "");
      continue;
    }
    if (m[2] !== undefined) {
      const tx = parseFloat(m[2]);
      const ty = parseFloat(m[3]);
      // R104-C: the FIRST Td of a fresh BT run with NO Tm in between is an
      // ABSOLUTE placement (the xdvipdfmx per-word-BT form). The
      // origin-to-origin delta from the last fresh Td drives the separator
      // exactly like the R103-B Tm rule: |dy|/size ≥ 0.5 em → a line move
      // (pdfTeX's per-line absolute Tds keep their newlines); same-ty →
      // same-line: a backwards or ≥1.0-em dx → a word gap, a forward sub-em
      // dx → a glyph continuation (the join — the narrow-word residual, the
      // same unthresholdable class as the r103 LuaTeX word gaps). A Td
      // after a Tm in the run (the Skia form) or between shows NEVER takes
      // this path — the r103-B rules verbatim.
      if (btFresh && !tmInRun && !freshTdTaken) {
        freshTdTaken = true;
        if (lastFreshTd) {
          const emDx = (tx - lastFreshTd.x) / effSize;
          const emDy = (ty - lastFreshTd.y) / effSize;
          if (Math.abs(emDy) >= 0.5) {
            pendingTy = 1; // a line move
            moved = true;
          } else {
            pendingEm = Math.abs(emDx);
            moved = emDx !== 0;
            if (emDx < 0) backward = true;
          }
        } else if (pieces.length > 0) {
          // the first absolute Td after prior text (a mixed-form stream):
          // a conservative word gap — never fuse across the unknown gap
          pendingEm = 1.0;
          moved = true;
        }
        lastFreshTd = { x: tx, y: ty };
      } else {
        // the standing between-shows / post-Tm rules (verbatim)
        pendingEm += Math.abs(tx) / effSize;
        // R103-B: a Td BEFORE any show in the fresh run carries a baseline
        // placement (the Skia constant-baseline class) — its ty is not a line
        // move; between shows the ty keeps the standing line-move rule
        if (shownSinceTm) pendingTy += ty;
        moved = true;
        if (tx < 0) backward = true;
      }
      continue;
    }
    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      continue;
    }
    if (m[0] === "BT") {
      // R104-C: a fresh text run begins — the run state resets (the first
      // Td after this, with no Tm in between, is absolute). The pending
      // separator state is NOT reset: the next positioning operator (the
      // fresh Td itself) decides it.
      btFresh = true;
      tmInRun = false;
      freshTdTaken = false;
      continue;
    }
    if (m[4] !== undefined) {
      const text = unescape(m[4]);
      if (m[5] === "'" || m[5] === '"') {
        // the next-line shows: always a line break, the pending move consumed
        pieces.push({ sep: pieces.length === 0 ? "" : "\n", font: curFont, kind: "lit", text });
        reset();
      } else {
        push({ kind: "lit", text });
      }
      continue;
    }
    if (m[6] !== undefined) {
      // The TJ array: the first atom takes the pending separator (the outer
      // Td/Tm state). The INTERNAL atoms' separator is decided by the
      // inter-atom NUMBERS — thousandths of text space (Session 101,
      // R101-A; Session 102, R102-C): the consecutive numbers' SUM ≤ -100
      // (0.1 em leftward — pdfTeX's 209–442 interword glue, the R97
      // fixture's -120) is a word gap; POSITIVE sums are KERNS at ANY
      // magnitude (LibreOffice's +110…+149 T-overhangs — the r102 sign
      // census: real gaps are negative, LibreOffice's word spaces ride as
      // space GLYPHS, never as numbers) and the atoms join with NO space;
      // a small negative sum is a kern too (Word's -4/+7 class). Adjacent
      // atoms with NO number keep the standing space join; a trailing
      // number is discarded (the outer walk's next operator sets fresh
      // state).
      //
      // Session 107 (R107-A): the DISPLAY-TRACKING signature — a TJ array
      // where EVERY consecutive atom pair carries a kern, ALL the kerns
      // fall in (-200,-100], ALL the atoms are single-glyph (single-CID
      // hex or single-char literal), and the count ≥ 4. Measured on the
      // real LibreOffice Calc guide's cover: the 26pt title and 20pt
      // subtitle kern EVERY letter at -113..-154 (the display tracking)
      // while the WORD gaps ride space-GLYPH atoms — the ≤ -100 gap rule
      // split every letter ("C a l c   G u i d e" where pdftotext reads
      // "Calc Guide"). The naive band conditional is refuted by the
      // prototype (it joins xdvipdfmx's -150..-196 interword glue and
      // pdfTeX's -161..-185 math thin-spaces — pdftotext reads both
      // spaced); the signature's four conditions reject every other
      // measured shape: the glue arrays ride multi-CID word chunks, the
      // math arrays are 2–3 atoms or coverage-broken, the R97 -120 rides
      // multi-char literals, the pdfTeX -322 glue is ≤ -200.
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let displayTracked = false;
      {
        const items: { lit: boolean; v: string; kern: number }[] = [];
        let p: RegExpExecArray | null;
        let preKern = 0;
        while ((p = atomRe.exec(m[6]))) {
          if (p[1] !== undefined || p[2] !== undefined) {
            items.push({ lit: p[1] !== undefined, v: (p[1] ?? p[2])!, kern: preKern });
            preKern = 0;
          } else preKern += parseFloat(p[3]);
        }
        displayTracked =
          items.length >= 4 &&
          items.every((x, i) => i === 0 || (x.kern <= -100 && x.kern > -200)) &&
          items.every((x) => (x.lit ? x.v.length === 1 : x.v.replace(/\s+/g, "").length <= 4));
      }
      atomRe.lastIndex = 0;
      let a: RegExpExecArray | null;
      let kern = 0; // SIGNED sum of consecutive numbers since the last atom
      while ((a = atomRe.exec(m[6]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern !== 0) {
            moved = true;
            // R107-A: a display-tracked array's kerns are TRACKING, not gaps
            // — the atoms join (the space glyphs carry the word separation)
            pendingEm = !displayTracked && kern <= -100 ? 1.0 : 0; // the negative gap fires the space rule; a kern (either sign, under the boundary) joins
          }
          push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) } : { kind: "hex", hex: a[2] }, kern !== 0);
          kern = 0;
        } else {
          kern += parseFloat(a[3]);
        }
      }
      continue;
    }
    if (m[7] !== undefined) {
      const hex = m[7];
      if (m[8] === "'" || m[8] === '"') {
        pieces.push({ sep: pieces.length === 0 ? "" : "\n", font: curFont, kind: "hex", hex });
        reset();
      } else {
        push({ kind: "hex", hex });
      }
      continue;
    }
    // Tm (R103-B) — the position-aware reposition. The six operands are the
    // text matrix; for an AXIS-ALIGNED matrix (|b|,|c| ≈ 0) the translation
    // (e,f) is the new run's origin in user space, and the ORIGIN-TO-ORIGIN
    // delta from the last axis-aligned Tm decides the separator exactly like
    // a between-shows move:
    //   |dy| / (size·|d|) ≥ 0.5 em → a line move (pdfTeX's per-line Tm steps,
    //     the cross-paragraph jumps)
    //   a backwards or ≥ 1.0 em dx → a word gap
    //   a forward dx under 1.0 em → a glyph continuation (the join — the
    //     LuaTeX per-glyph form: "N", "o", "v" each in their own Tm block)
    // A ROTATED matrix (|b| or |c| significant — the IRS's sideways labels)
    // keeps the standing blind reset (and drops the origin track): the delta
    // math has no meaning there. The Skia same-line words share the SAME Tm
    // origin (delta 0,0) and their gaps ride the Td's own em accumulation;
    // the Skia constant-baseline Td ty is suppressed by the shownSinceTm rule.
    {
      const a = parseFloat(m[9]);
      const b = parseFloat(m[10]);
      const c = parseFloat(m[11]);
      const d = parseFloat(m[12]);
      const e = parseFloat(m[13]);
      const f = parseFloat(m[14]);
      const axisAligned = Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && Math.abs(a) > 0.01 && Math.abs(d) > 0.01;
      reset();
      shownSinceTm = false; // in a fresh run — the FIRST Td's ty is a baseline placement, not a line move
      tmInRun = true; // R104-C: the Tm form — the run's Tds NEVER take the fresh-Td path (the r103-B rules verbatim)
      lastFreshTd = null; // R105-D (L-2): the Tm form's geometry is Tm-tracked — a later fresh BT's absolute Td must not delta against this stale pre-Tm origin (the mixed XeTeX+Skia hazard; the conservative word-gap branch takes over)
      if (axisAligned) {
        if (lastTm) {
          const emDx = (e - lastTm.x) / (effSize * Math.abs(a));
          const emDy = (f - lastTm.y) / (effSize * Math.abs(d));
          if (Math.abs(emDy) >= 0.5) {
            pendingTy = 1; // a line move
            moved = true;
          } else {
            pendingEm = Math.abs(emDx);
            moved = emDx !== 0;
            if (emDx < 0) backward = true;
          }
        }
        lastTm = { x: e, y: f };
      } else {
        lastTm = null; // rotated — the origin track is meaningless until the next axis-aligned Tm
      }
      continue;
    }
  }
  return pieces;
}

/** Concatenated text from a PDF's inflated content streams ((…) Tj / TJ arrays / hex strings). */
async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = new TextDecoder("latin1").decode(bytes);
  // Two-phase (R99-B): a file's ToUnicode CMap stream can FOLLOW its
  // content streams (the W3C dummy.pdf has the CMap last), so hex atoms
  // decode only after every stream has been walked.
  const cmaps: CodeMap[] = [];
  // R105-C: each stream's pieces carry their stream's object number — the
  // page-tree chain resolves the stream's OWN page's font map at assembly
  const pending: { objNum: number; pieces: TextPiece[] }[] = [];
  // Session 102 (R102-B): the font chain — /F-name → font object →
  // /ToUnicode object. Multi-font subset files (the real LibreOffice form:
  // 15 fonts, every one restarting its glyph codes at <01>) need each
  // font's atoms decoded through that font's OWN CMap; the first-covering
  // rule reads them through the wrong map. All three scans ride the RAW
  // ascii (object headers are never compressed in this writer family);
  // the third link (objNum → CMap) fills in during the stream walk.
  // R104-D: the /F-name → font-object chain, MULTI-CANDIDATE. The R102-B
  // form kept ONE mapping per name (the LAST /F1 pair in the whole file) —
  // a 60+-page doc (fontspec.pdf) names each page's fonts /F1…/F10, so
  // every page's /F1 atoms decoded through the LAST page's /F1 CMap. The
  // fix collects EVERY candidate IN FILE ORDER (the raw pairs by their
  // match position, the ObjStm-carried pairs by their stream position —
  // PDF 1.5+ files put page resource dicts and font objects inside
  // compressed object streams, invisible to the raw scans) and the
  // first-FULLY-COVERING rule in decodeHexString picks the atom's own
  // page's map. Single-page files (the whole standing corpus) keep
  // exactly one candidate — the previous behavior verbatim.
  const fCandidates = new Map<string, { pos: number; obj: number }[]>();
  const pushCandidate = (name: string, obj: number, pos: number) => {
    const list = fCandidates.get(name) ?? [];
    if (!list.some((c) => c.obj === obj)) list.push({ pos, obj });
    fCandidates.set(name, list);
  };
  for (const fm of ascii.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) {
    // R107-B: the dict KEY \Font is never a font NAME (no writer selects
    // "/Font 12 Tf") — excluding it stops the false pair from polluting
    // the candidate chain
    if (fm[1] === "Font") continue;
    pushCandidate(fm[1], parseInt(fm[2], 10), fm.index ?? 0);
  }
  // R108-B: the /Font-dict-region name collector — the macOS Quartz writer
  // names its fonts /Tc1 /Tc2 (NOT /F…: the standing F\w+ pair regex never
  // binds them). The pairs live inside /Font << … >> dict regions where
  // every `Name N 0 R` pair IS a font binding by construction (a colorspace
  // or xobject pair elsewhere in the resources never matches). The R107-B
  // "Font" key exclusion kept — a font named exactly "Font" is always the
  // dict key.
  for (const rm of ascii.matchAll(/\/Font\s*<<\s*([\w#+\-/\s]+)>>/g)) {
    for (const fm of rm[1].matchAll(/\/([\w#+-]+)\s+(\d+)\s+0\s+R/g)) {
      if (fm[1] === "Font") continue;
      pushCandidate(fm[1], parseInt(fm[2], 10), rm.index + (fm.index ?? 0));
    }
  }
  // R108-B: the /Font-dict-region name collector — the macOS Quartz writer
  // names its fonts /Tc1 /Tc2 (NOT /F…: the standing F\w+ pair regex never
  // binds them). The pairs live inside /Font << … >> dict regions where
  // every `Name N 0 R` pair IS a font binding by construction (a colorspace
  // or xobject pair elsewhere in the resources never matches). The R107-B
  // "Font" key exclusion kept — a font named exactly "Font" is always the
  // dict key.
  const objToTu = new Map<number, number>();
  // R105-B: font object → lowercased /BaseFont name (subset "ABCDEF+"
  // prefixes stripped) — the standard-14 marker lookup (ZapfDingbats/Symbol)
  const objBaseFont = new Map<number, string>();
  // R108-B: font objects DECLARING /Encoding /MacRomanEncoding — the named
  // encoding feeds the MAC_ROMAN marker through the candidate chain (a
  // real ToUnicode still wins; WinAnsi/undeclared fonts keep the Latin-1
  // path — the over-application guard)
  const objMacRoman = new Set<number>();
  for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
    if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
    const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) objToTu.set(parseInt(fm[1], 10), parseInt(tu[1], 10));
    const bf = fm[2].match(/\/BaseFont\s*\/([\w#+-]+)/);
    if (bf) objBaseFont.set(parseInt(fm[1], 10), (bf[1].split("+").pop() ?? bf[1]).toLowerCase());
    if (/\/Encoding\s*\/MacRomanEncoding\b/.test(fm[2])) objMacRoman.add(parseInt(fm[1], 10));
  }
  // R105-C: the page tree — /Type /Page objects bind a CONTENT STREAM to the
  // page's own /F-name → font-object mapping (inline in the page dict or via
  // a referenced /Resources object). Assembly resolves each stream's atoms
  // through ITS page's map FIRST; the candidate chain stays the fallback
  // (single-page and tree-less files keep the previous behavior verbatim).
  // The region scan (obj header → endobj) tolerates the doubly-nested
  // /Resources << /Font << /F1 N 0 R >> >> shape the dict-pattern cannot.
  // R106-A: the real-file activation. BOTH real xdvipdfmx builds (fontspec
  // v2.9h, 71 pages; the dvipdfmx manual, 50 pages) carry 100% of their
  // pages inside ObjStms, 100% with the /Contents[N 0 R] ARRAY form (the
  // scalar regex matched NEITHER file — pageFonts was empty and every atom
  // rode the file-order candidate chain: fontspec's title 'F' stolen by
  // EBGaramond's map, "Dont selection"), and 100% with /Resources
  // references that are THEMSELVES ObjStm-carried (the raw-pass-only
  // deferred resolution resolved nothing). Three legs: the contentsRefs
  // helper (array + scalar + multi-ref), the ObjStm objFonts feed, and the
  // pendingRes resolution moved AFTER the stream walk.
  const pageFonts = new Map<number, Map<string, number>>(); // content objNum → /F-name → font objNum
  const objFonts = new Map<number, Map<string, number>>(); // resources objNum → /F-name → font objNum
  const pendingRes: { contents: number[]; res: number }[] = [];
  // R107-B: the third page-form — the referenced /Font dict. Two shapes:
  // (a) the page carries /Resources << /Font N 0 R >> (INLINE resources
  // whose /Font VALUE is a reference — the measured lo-calc cover form);
  // (b) the page carries /Resources R 0 R where obj R = << /Font N 0 R >>
  // (the referenced-resources two-hop — the measured 545-page lo-calc
  // form). The old F-pair scan captured the dict KEY "Font" as a font
  // name for both shapes — a false pair that blocked every resolution.
  // The cure: the "Font" key exclusion everywhere + the fontRefOf link map
  // (a body carrying /Font N 0 R records objNum→N) + the pendingFontRef
  // queue for shape (a), both resolved after the walk like pendingRes.
  const pendingFontRef: { contents: number[]; fontRef: number }[] = [];
  const fontRefOf = new Map<number, number>(); // resources objNum → the /Font ref's target
  const inlineFontRef = (body: string): number | null => {
    const fm = body.match(/\/Resources\s*<<\s*\/Font\s+(\d+)\s+0\s+R/);
    return fm ? parseInt(fm[1], 10) : null;
  };
  // the /Contents value's object refs: the ARRAY form [4 0 R 5 0 R] (every
  // ref — a page's content may span streams; a shared stream is last-wins,
  // the rare form) or the scalar form 4 0 R (the single ref)
  const contentsRefs = (body: string): number[] => {
    const at = body.indexOf("/Contents");
    if (at < 0) return [];
    const after = body.slice(at + "/Contents".length);
    const br = after.match(/^\s*\[([^\]]*)\]/);
    if (br) return [...br[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((x) => parseInt(x[1], 10));
    const sc = after.match(/^\s*(\d+)\s+\d+\s+R/);
    return sc ? [parseInt(sc[1], 10)] : [];
  };
  {
    for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
      const body = rm[2];
      const fonts = new Map<string, number>();
      for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g))
        if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
      if (/\/Type\s*\/Page\b/.test(body)) {
        const refs = contentsRefs(body);
        if (!refs.length) continue;
        const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
        const fontRef = inlineFontRef(body);
        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
        else if (res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
        else if (fontRef !== null) pendingFontRef.push({ contents: refs, fontRef }); // R107-B shape (a)
      } else {
        if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
        const fr = body.match(/\/Font\s+(\d+)\s+0\s+R/); // R107-B shape (b): the link
        if (fr) fontRefOf.set(parseInt(rm[1], 10), parseInt(fr[1], 10));
      }
    }
  }
  const tuToCmap = new Map<number, CodeMap>();

  // Session 99 (R99-A): the delimiter matrix — some writers emit
  // "stream \r\n" (a SPACE between the keyword and the EOL) and the bare-CR
  // form "stream\r" (the Acrobat-accepted lenient EOL); the old
  // /stream\r?\n/g required the EOL IMMEDIATELY after the keyword and lost
  // the WHOLE stream for every such writer.
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(ascii))) {
    // belt-and-suspenders for R98-A: a "stream" whose 3 preceding chars are
    // "end" is the keyword inside end**stream**, never a stream start —
    // even if a future edit moves the scan position before an endstream
    if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
    // R102-B: this stream's object number — the "N 0 obj" header at the
    // START of the region between the last endobj and the stream keyword
    // (the object's own dict region); an unanchored fallback covers the
    // first object (no preceding endobj).
    const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
    const dictRegion = ascii.slice(dictStart, m.index);
    const objMatch = dictRegion.match(/^\s*(\d+)\s+0\s+obj\b/) ?? dictRegion.match(/(\d+)\s+0\s+obj\b/);
    const objNum = objMatch ? parseInt(objMatch[1], 10) : -1;
    // Session 102 (R102-A, leg 1): the PRE-INFLATE dict gate — a stream
    // whose object dict declares /Subtype /Image or a /FontFile[23]? is
    // never a content stream. The real LibreOffice writer guide carries
    // 26MB/25MB/8.7MB image streams whose inflated binary garbage blows
    // the V8 regex stack inside the operator walk (RangeError) and — with
    // no per-stream guard — killed the WHOLE file's extraction. Skipping
    // before the inflate is also ~5x faster on image-heavy files.
    if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
      const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
      if (endSkip < 0) break;
      streamRe.lastIndex = endSkip + "endstream".length;
      continue;
    }
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    // Session 98 (R98-A): skip past the WHOLE "endstream" token. The old
    // `lastIndex = end` re-matched the "stream" INSIDE "endstream" (end-
    // **stream**\r\n), so every chunk after the first started at the
    // PREVIOUS endstream — object-dict garbage + the next stream's bytes —
    // failed to inflate, and every stream after the first was silently
    // lost (a multi-page CV yielded page 1 only).
    streamRe.lastIndex = end + "endstream".length;
    let text = "";
    // the EOL immediately before "endstream" is not part of the data —
    // try the chunk as-is, then with the trailing EOL stripped (real
    // writers differ; best-effort on both)
    let chunkEnd = end;
    if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
    else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
    const chunk = bytes.subarray(start, chunkEnd);
    for (const trimmed of [chunk, bytes.subarray(start, end)]) {
      try {
        // R108-B LEG A: the latin1 decode — PDF content streams are BYTE
        // strings, not UTF-8; the TextDecoder default corrupted every
        // byte >= 0x80 in a literal atom to U+FFFD before the decode tables
        // ever saw it (the 13th-writer Quartz class: the fonts declare
        // MacRomanEncoding and byte 0xD5 IS the right single quote). The
        // .docx XML paths above stay UTF-8 — XML is UTF-8 by spec.
        text = new TextDecoder("latin1").decode(await inflate(trimmed, "deflate"));
        break;
      } catch {
        try {
          text = new TextDecoder("latin1").decode(await inflate(trimmed, "deflate-raw"));
          break;
        } catch {
          text = "";
        }
      }
    }
    if (!text) continue;
    // R104-D: the ObjStm harvest — PDF 1.5+ files put page resource dicts
    // and font objects inside compressed object streams (fontspec.pdf:
    // every page's /F1 → the same font object, the object's own body and
    // its /ToUnicode link both ObjStm-carried) — invisible to the raw
    // scans. The header (N pairs of "objNum bodyOffset", bodies at
    // /First + offset) yields each inner object's body; font objects with
    // /ToUnicode feed objToTu, and /F-name pairs feed the candidate list
    // at this stream's file position. Stream objects cannot live inside
    // an ObjStm (ISO 32000-1 §7.5.7 — the R100-B classification), so no
    // content or CMap stream is ever missed by skipping these.
    if (/\/Type\s*\/ObjStm\b/.test(dictRegion)) {
      const firstMatch = dictRegion.match(/\/First\s+(\d+)/);
      const hdr = text.match(/^\s*((?:\d+\s+\d+\s+)+)/);
      if (firstMatch && hdr) {
        const first = parseInt(firstMatch[1], 10);
        const nums = hdr[1].trim().split(/\s+/).map(Number);
        const entries: { obj: number; off: number }[] = [];
        for (let i = 0; i + 1 < nums.length; i += 2) entries.push({ obj: nums[i], off: nums[i + 1] });
        for (let i = 0; i < entries.length; i++) {
          const start = first + entries[i].off;
          const end = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
          if (start > end || end > text.length) continue;
          const body = text.slice(start, end);
          if (/\/Type\s*\/Font\b/.test(body)) {
            const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
            if (tu) objToTu.set(entries[i].obj, parseInt(tu[1], 10));
            const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/); // R105-B
            if (bf) objBaseFont.set(entries[i].obj, (bf[1].split("+").pop() ?? bf[1]).toLowerCase());
            if (/\/Encoding\s*\/MacRomanEncoding\b/.test(body)) objMacRoman.add(entries[i].obj); // R108-B
          }
          // R108-B: the ObjStm side of the /Font-dict-region collector — an
          // ObjStm-carried resources body's /Font << … >> pairs feed the
          // candidate chain at the stream's file position (the Quartz
          // general-name form, ObjStm-carried)
          for (const fm2 of body.matchAll(/\/Font\s*<<\s*([\w#+\-/\s]+)>>/g)) {
            for (const fm of fm2[1].matchAll(/\/([\w#+-]+)\s+(\d+)\s+0\s+R/g)) {
              if (fm[1] === "Font") continue;
              pushCandidate(fm[1], parseInt(fm[2], 10), m.index + (fm.index ?? 0));
            }
          }
          // R108-B: the ObjStm side of the /Font-dict-region collector — an
          // ObjStm-carried resources body's /Font << … >> pairs feed the
          // candidate chain at the stream's file position (the Quartz
          // general-name form, ObjStm-carried)
          // R105-C + R106-A: ObjStm-carried page objects register their
          // content streams' font map — inline fonts directly (the r105
          // form), a referenced /Resources through the deferred resolution
          // (the real fontspec/dvipdfmx form: the resources object itself
          // rides an ObjStm, often a LATER one)
          // R107-B: the third form — INLINE /Resources with a REFERENCED
          // /Font value (the measured lo-calc cover shape) queues the
          // pendingFontRef resolution
          if (/\/Type\s*\/Page\b/.test(body)) {
            const refs = contentsRefs(body);
            if (refs.length) {
              const fonts = new Map<string, number>();
              for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g))
                if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
              const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
              const fontRef = inlineFontRef(body);
              if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
              else if (res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
              else if (fontRef !== null) pendingFontRef.push({ contents: refs, fontRef }); // R107-B shape (a)
            }
          } else {
            // R106-A: an ObjStm-carried /Resources body (the /Font pairs
            // dict) feeds the deferred resolution — the raw pass cannot see
            // it, and the fontspec pages reference exactly these
            const fonts = new Map<string, number>();
            for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            if (fonts.size) objFonts.set(entries[i].obj, fonts);
            const fr = body.match(/\/Font\s+(\d+)\s+0\s+R/); // R107-B shape (b): the link
            if (fr) fontRefOf.set(entries[i].obj, parseInt(fr[1], 10));
          }
          for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) {
            if (fm[1] === "Font") continue; // R107-B: the key exclusion
            pushCandidate(fm[1], parseInt(fm[2], 10), m.index + (fm.index ?? 0));
          }
        }
      }
      continue; // an ObjStm is never itself a content or CMap stream
    }
    // R99-B: a stream carrying bfchar/bfrange markers is a ToUnicode CMap —
    // collect it as a map, never mine it for text operators
    if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
      const cm = parseToUnicode(text);
      if (cm) {
        cmaps.push(cm);
        if (objNum >= 0) tuToCmap.set(objNum, cm); // the R102-B third link
      }
      continue;
    }
    // Session 102 (R102-A, legs 2+3): only walk streams that LOOK like
    // content — a real text-op shape, and a printable-dominant body (an
    // even-stride sample over the WHOLE stream: a leading inline image
    // must not disqualify the text that follows). Font programs and other
    // binary that slipped past the dict gate never reach the regex; and
    // the per-stream guard turns the pathological backtracking class into
    // a skipped stream instead of a dead file.
    if (!/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
    {
      let printable = 0;
      const samples = Math.min(text.length, 4096);
      const stride = Math.max(1, Math.floor(text.length / samples));
      let taken = 0;
      for (let i = 0; i < text.length; i += stride) {
        taken++;
        const c = text.charCodeAt(i);
        if ((c >= 32 && c < 127) || c === 10 || c === 13 || c === 9) printable++;
      }
      if (printable / taken < 0.6) continue;
    }
    let pieces: TextPiece[];
    try {
      pieces = pdfTextPieces(text);
    } catch {
      continue; // the stack-overflow class — one bad stream never kills the file
    }
    if (pieces.length) pending.push({ objNum, pieces });
  }
  // R106-A: the referenced-/Resources pages resolve AFTER the whole stream
  // walk — the resources object may ride an ObjStm the walk meets LATER
  // than the page's own ObjStm (the real fontspec ordering), and the
  // ObjStm objFonts feed above only fills during the walk
  // R107-B: the TWO-HOP — when the resources object's own body carries a
  // referenced /Font (obj R = << /Font N 0 R >>, the 545-page lo-calc
  // form), the direct objFonts lookup misses and the fontRefOf link
  // reaches the font dict — and the pendingFontRef queue (the
  // inline-/Resources referenced-/Font pages) resolves the same way
  for (const p of pendingRes) {
    let fonts = objFonts.get(p.res);
    if (!fonts) {
      const fr = fontRefOf.get(p.res);
      if (fr !== undefined) fonts = objFonts.get(fr);
    }
    if (fonts) p.contents.forEach((c) => pageFonts.set(c, fonts));
  }
  for (const p of pendingFontRef) {
    const fonts = objFonts.get(p.fontRef);
    if (fonts) p.contents.forEach((c) => pageFonts.set(c, fonts));
  }
  // R100-A: each piece carries its own leading separator (decided by the
  // positioning between shows); the hex pieces decode through the collected
  // CMaps (the two-phase R99-B contract) — R102-B: through their OWN font's
  // CMap first when the /F-name → font object → /ToUnicode chain resolves,
  // with the standing first-covering walk as the fallback (files without
  // the chain keep the previous behavior verbatim)
  // R105-D (L-4): the per-font memo — the candidate chain re-sorted and
  // re-resolved per hex piece before; assembly resolves each font once.
  const cmapsForMemo = new Map<string, CodeMap[]>();
  const cmapsFor = (font?: string): CodeMap[] => {
    if (!font) return cmaps;
    const memo = cmapsForMemo.get(font);
    if (memo) return memo;
    let chain: CodeMap[] | null = null;
    // R104-D: EVERY candidate for this /F-name in file order (the raw
    // pairs and the ObjStm-carried pairs), each resolved through the
    // objToTu/tuToCmap chain — the first-FULLY-COVERING rule in
    // decodeHexString picks the atom's own page's map; the wrong-name
    // maps from other pages rarely fully cover a multi-code atom
    const cands = fCandidates.get(font);
    if (cands?.length) {
      const own: CodeMap[] = [];
      for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
        const tu = objToTu.get(c.obj);
        if (tu !== undefined) {
          const cm = tuToCmap.get(tu);
          if (cm) own.push(cm);
        } else {
          // R105-B: a marker font (ZapfDingbats/Symbol) with no ToUnicode
          // decodes through its STANDARD encoding table
          const bf = objBaseFont.get(c.obj);
          if (bf) {
            const mk = MARKER_TABLES[bf];
            if (mk) own.push(mk);
          }
          // R108-B: a font DECLARING /Encoding /MacRomanEncoding with no
          // ToUnicode decodes through the MacRoman table (the Quartz
          // 13th-writer class — a font that NAMES its encoding is its own
          // ToUnicode)
          if (objMacRoman.has(c.obj)) own.push(MAC_ROMAN_CMAP);
        }
      }
      if (own.length) chain = [...own, ...cmaps];
    }
    const out = chain ?? cmaps;
    cmapsForMemo.set(font, out);
    return out;
  };
  // R103-C: the space-glyph conditional. Streams that write EXPLICIT
  // standalone space-glyph pieces (the Skia/LO convention: word gaps are
  // glyphs, never bare positioning moves) encode their split-word
  // continuations as bare em-gap moves — the condGap pieces resolve to JOINS
  // there (the space pieces themselves carry the word separation), while
  // streams without space glyphs (the IRS/pdfTeX convention: gaps ride the
  // moves) keep every gap. The decode happens first so the standalone-space
  // detection sees the decoded text.
  const parts = pending.map(({ objNum, pieces }) => {
    // R105-C: this stream's OWN page's font map resolves first; the
    // candidate chain stays the fallback (the page-tree chain — the
    // fontspec.pdf fully-covering collision class)
    const pageMap = pageFonts.get(objNum);
    const localFor = (font?: string): CodeMap[] => {
      if (font && pageMap) {
        const fontObj = pageMap.get(font);
        if (fontObj !== undefined) {
          const tu = objToTu.get(fontObj);
          if (tu !== undefined) {
            const cm = tuToCmap.get(tu);
            if (cm) return [cm, ...cmapsFor(font)];
          } else {
            const bf = objBaseFont.get(fontObj); // R105-B on the page path
            if (bf) {
              const mk = MARKER_TABLES[bf];
              if (mk) return [mk, ...cmapsFor(font)];
            }
          }
        }
      }
      return cmapsFor(font);
    };
    // R108-B LEG B: the literal remap — a literal piece's HIGH BYTES remap
    // through the font's NAMED encoding when its chain resolves the MacRoman
    // marker (the hex atoms get it through decodeHexString's covering rule;
    // the literal path needs the explicit pass). A font without the
    // declaration keeps its bytes verbatim (the WinAnsi guard).
    // R108-B LEG B: the literal remap — a literal piece's HIGH BYTES remap
    // through the font's NAMED encoding when its chain resolves the MacRoman
    // marker (the hex atoms get it through decodeHexString's covering rule;
    // the literal path needs the explicit pass). A font without the
    // declaration keeps its bytes verbatim (the WinAnsi guard).
    const decoded = pieces.map((p) => {
      if (p.kind === "hex") return { p, text: decodeHexString(p.hex, localFor(p.font)) };
      if (p.font && localFor(p.font).includes(MAC_ROMAN_CMAP) && /[\u0080-\u00ff]/.test(p.text)) {
        return { p, text: p.text.replace(/[\u0080-\u00ff]/g, (c) => MAC_ROMAN_HIGH[c.charCodeAt(0)] ?? c) };
      }
      return { p, text: p.text };
    });
    const hasSpaceGlyphs = decoded.some(({ text }) => text.length > 0 && /^\s+$/.test(text));
    return decoded
      .map(({ p, text }) => (p.condGap && hasSpaceGlyphs ? "" : p.sep) + text)
      .join("");
  });
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// The fallback scrub — plain text + legacy .doc (NUL-interleaved UTF-16)
// ---------------------------------------------------------------------------

/** Strips NULs and keeps the printable word runs (the .doc read-as-text shape). */
export function scrubPrintable(raw: string): string {
  const noNulls = raw.replace(/\x00/g, "");
  const runs = noNulls.match(/[A-Za-z0-9][A-Za-z0-9 .,'&()/+:-]{2,}/g) ?? [];
  return runs.join(" ").trim();
}

// ---------------------------------------------------------------------------
// The public surface
// ---------------------------------------------------------------------------

/**
 * Best-effort client-side CV text extraction, zero dependencies:
 * .docx → the zip walk + inflate; .pdf → the stream scan + inflate;
 * everything else → the raw text (with the printable scrub fallback).
 * Structured formats NEVER fall back to their own raw bytes (a deflated
 * file read as text is garbage, not a CV). Returns "" when nothing
 * readable was found (the UI surfaces the error).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".docx")) {
    try {
      const text = xmlToText(await readDocxDocumentXml(file));
      if (isMeaningful(text)) return text;
    } catch {
      // a damaged docx yields "" — its raw bytes are deflate garbage
    }
    return "";
  }

  if (lower.endsWith(".pdf")) {
    try {
      const text = await extractPdfText(file);
      if (isMeaningful(text)) return text;
    } catch {
      // a damaged pdf yields "" — its raw bytes are deflate garbage
    }
    return "";
  }

  let raw = "";
  try {
    raw = await file.text();
  } catch {
    return "";
  }
  if (isMeaningful(raw)) return raw;
  const scrubbed = scrubPrintable(raw);
  return isMeaningful(scrubbed) ? scrubbed : "";
}

/**
 * The superset flow's candidate name — the REF's dialog has no name field
 * ("AI will parse & score automatically"), so the filename stem becomes it:
 * the extension stripped, separators spaced, whitespace collapsed.
 */
export function deriveCandidateName(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, "");
  return stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}
