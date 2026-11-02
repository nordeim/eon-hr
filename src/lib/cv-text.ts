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
  // Session 109 (R109-C): the authoritative high zone — PDF 32000-1 Annex
  // D.6, generated through the AGL (the canonical Adobe glyph readings,
  // never hand-reconstructed; verified slot-by-slot against an all-bytes
  // probe PDF read through pdftotext). The PUA corporate slots
  // (registerserif/sans etc.) normalize to the base chars. The old table
  // ended at 0x7E — the ReportLab bullet (\267 = 0xB7, the 'bullet' glyph)
  // fell to the latin1Printable fallback and read · the Latin-1 middle
  // dot, not • U+2022.
  0xa1: "\u03D2", 0xa2: "\u2032", 0xa3: "\u2264", 0xa4: "\u2044", 0xa5: "\u221E", 0xa6: "\u0192",
  0xa7: "\u2663", 0xa8: "\u2666", 0xa9: "\u2665", 0xaa: "\u2660", 0xab: "\u2194", 0xac: "\u2190",
  0xad: "\u2191", 0xae: "\u2192", 0xaf: "\u2193", 0xb0: "\u00B0", 0xb1: "\u00B1", 0xb2: "\u2033",
  0xb3: "\u2265", 0xb4: "\u00D7", 0xb5: "\u221D", 0xb6: "\u2202", 0xb7: "\u2022", 0xb8: "\u00F7",
  0xb9: "\u2260", 0xba: "\u2261", 0xbb: "\u2248", 0xbc: "\u2026", 0xc0: "\u2135", 0xc1: "\u2111",
  0xc2: "\u211C", 0xc3: "\u2118", 0xc4: "\u2297", 0xc5: "\u2295", 0xc6: "\u2205", 0xc7: "\u2229",
  0xc8: "\u222A", 0xc9: "\u2283", 0xca: "\u2287", 0xcb: "\u2284", 0xcc: "\u2282", 0xcd: "\u2286",
  0xce: "\u2208", 0xcf: "\u2209", 0xd0: "\u2220", 0xd1: "\u2207", 0xd2: "\u00AE", 0xd3: "\u00A9",
  0xd4: "\u2122", 0xd5: "\u220F", 0xd6: "\u221A", 0xd7: "\u22C5", 0xd8: "\u00AC", 0xd9: "\u2227",
  0xda: "\u2228", 0xdb: "\u21D4", 0xdc: "\u21D0", 0xdd: "\u21D1", 0xde: "\u21D2", 0xdf: "\u21D3",
  0xe0: "\u25CA", 0xe2: "\u00AE", 0xe3: "\u00A9", 0xe4: "\u2122", 0xe5: "\u2211",
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

// Session 110 (R110-C): the WinAnsi named-encoding marker — the R108-B
// "a font that NAMES its encoding is its own ToUnicode" doctrine's third
// member. The 15th-writer Prawn glyph-table pages render the WinAnsi table
// itself under /F1.0 = Helvetica /Encoding /WinAnsiEncoding with NO
// ToUnicode: the glyph column's <a1> atom fell to the all-cmaps
// first-covering walk and the Iosevka cmap's 0xa1→° U+00B0 won (the WRONG
// glyph — pdftotext reads ¡, the WinAnsi reading). The map mirrors
// latin1Printable EXACTLY (the cp1252 high zone + identity + the control
// scrub): a byte no cmap covers already reads latin1Printable, so the
// marker is a NO-OP for uncovered atoms and only SHADOWS the wrong-cmap
// coverings that would otherwise win first.
const WIN_ANSI_MAP = new Map<number, string>();
for (let c = 0; c <= 0xff; c++) WIN_ANSI_MAP.set(c, latin1Printable(c));
const WIN_ANSI_CMAP: CodeMap = { codeLen: 1, map: WIN_ANSI_MAP };

// Session 109 (R109-D): the MacRoman literal remap in the cp1252 CHAR
// space. THE DISCOVERY: the WHATWG Encoding Standard maps the "latin1"
// label to windows-1252 — `new TextDecoder("latin1")` decodes byte 0x87 as
// ‡ U+2021, NOT U+0087 — in every runtime (bun, node, and the browsers the
// client-side extractor runs in). The r108 literal remap matched
// [\u0080-\u00ff], a class the C1-zone bytes NEVER land in (their cp1252
// readings live outside it): MacRoman 0x87 (á) and 0x80 (Ä) read "‡€".
// This map takes the char each byte BECOMES through the WHATWG decode →
// the MacRoman reading, so the literal pass works in both zones (identity
// entries collapse to no-ops; the QUARTZ 0xD5 quote behavior is verbatim).
const MAC_ROMAN_LIT_REMAP = new Map<string, string>();
for (let b = 0x80; b <= 0xff; b++) {
  const target = MAC_ROMAN_HIGH[b];
  if (target === undefined) continue;
  const ch = WIN_ANSI_HIGH[b] ?? String.fromCharCode(b); // the WHATWG "latin1" reading of the byte
  if (ch !== target) MAC_ROMAN_LIT_REMAP.set(ch, target);
}

// Session 109 (R109-A): the ASCII85Decode filter — ISO 32000-1 §7.4.2.
// ReportLab's default stream armor (the 14th writer family: /Filter
// [ /ASCII85Decode /FlateDecode ] on 138 of the user guide's 147 streams).
// Whitespace is never data; 'z' is a full zero group (only between groups);
// '~>' ends the data; a final partial group of n chars yields n-1 bytes
// (padded with 'u', the max char); the Adobe '<~' prefix is tolerated.
// The base-85 weight: 85^4 = 52,200,625 (a digit-typoed constant decodes to
// the right LENGTH with every byte wrong — caught by the python
// base64.a85decode reference diff).
function ascii85Decode(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let group: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === 32 || c === 9 || c === 10 || c === 13 || c === 12 || c === 0) continue; // whitespace is never data
    if (c === 60 && out.length === 0 && group.length === 0 && i + 1 < input.length && input[i + 1] === 126) {
      i++; // the optional Adobe '<~' prefix
      continue;
    }
    if (c === 126) break; // '~' — the EOD ('~>') marker
    if (c === 122 && group.length === 0) {
      out.push(0, 0, 0, 0); // 'z' — a full zero group
      continue;
    }
    if (c < 33 || c > 117) throw new Error("ascii85: bad char"); // '!'..'u'
    group.push(c - 33);
    if (group.length === 5) {
      const v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
      out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
      group = [];
    }
  }
  if (group.length) {
    // the FINAL partial group: pad with 'u' (84) to five, decode, keep n-1
    const n = group.length;
    while (group.length < 5) group.push(84);
    const v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
    const bytes = [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
    for (let i = 0; i < n - 1; i++) out.push(bytes[i]);
  }
  return Uint8Array.from(out);
}

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
    // R110-E: the base-offset pass runs on the ARRAY-FREE block text. The
    // old global pass re-matched array ELEMENT TRIPLES as ranges: the
    // Prawn 15th-writer Greek cmap's array form <20><35>[<0020><20ac>
    // <1f55>…] correctly mapped 0x22→ὕ U+1F55, and then the element run
    // <0020><20ac><1f55> matched the base-offset shape (lo=0x20,
    // hi=0x20AC, dst=0x1F55) and OVERWROTE 0x20..0x201F with
    // ὕὖὗ὘… — the Greek-Extended garbage that read "ὗ὘Ὑ὚" where
    // pdftotext reads "ὕαλον ϕαγεῖν". Stripping the bracket-delimited
    // element lists before the pass makes the re-match impossible; the
    // array handling above and the base-offset handling here stay
    // verbatim otherwise.
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    while ((r = offRe.exec(m[1].replace(/\[[^\]]*\]/g, " ")))) {
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
 * R114-B: whether a HEX piece's leading code is the writer's OWN space — the
 * first byte IS 0x20, or a FULLY-COVERING cmap declares the first code
 * U+0020 (the same covering discipline as decodeHexString). A leading space
 * that survives only through the printable scrub (a control byte the
 * fallback remaps) is NOT genuine — the kern's separator must stand there
 * (the pdfTeX fi-ligature class: the \034 glyph remaps to a space, and the
 * kern gap before it is a REAL word gap).
 */
function hexTrailingIsSpace(hexRaw: string, cmaps: CodeMap[]): boolean {
  const hex = hexRaw.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const padded = hex.length % 2 ? hex + "0" : hex;
  if (!padded) return false;
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 2) bytes.push(parseInt(padded.slice(i, i + 2), 16));
  // The cmap-covering branches run FIRST — a 2-byte code whose LOW byte is 0x20
  // (the fontspec class: code 0x0020 mapping to "?") is NOT the writer's space;
  // the bare byte check is the FALLBACK (the uncoded path — latin1Printable maps
  // a real 0x20 byte to a space).
  for (const cm of cmaps) {
    if (cm.codeLen === 2) {
      if (bytes.length < 2 || bytes.length % 2) continue;
      let covered = true;
      for (let i = 0; i < bytes.length; i += 2) if (!cm.map.has(bytes[i] * 256 + bytes[i + 1])) { covered = false; break; }
      if (covered) return cm.map.get(bytes[bytes.length - 2] * 256 + bytes[bytes.length - 1]) === " ";
    } else {
      if (!bytes.every((b) => cm.map.has(b))) continue;
      return cm.map.get(bytes[bytes.length - 1]) === " ";
    }
  }
  return bytes[bytes.length - 1] === 0x20; // the 1-byte space byte — the uncoded fallback
}

function hexLeadingIsSpace(hexRaw: string, cmaps: CodeMap[]): boolean {
  const hex = hexRaw.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const padded = hex.length % 2 ? hex + "0" : hex;
  if (!padded) return false;
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 2) bytes.push(parseInt(padded.slice(i, i + 2), 16));
  // R115: the cmap-covering branches run FIRST — a 2-byte code whose HIGH byte
  // is 0x20 (0x20XX — an arbitrary subset-code mapping) is NOT the writer's
  // space; the bare byte check is the FALLBACK (the uncoded path). The r114
  // byte-first order was a latent misfire class that never fired on the r114
  // corpus (the fpdf2 leading spaces ride real cmap-declared 0x0020 codes).
  for (const cm of cmaps) {
    if (cm.codeLen === 2) {
      if (bytes.length < 2 || bytes.length % 2) continue;
      let covered = true;
      for (let i = 0; i < bytes.length; i += 2) if (!cm.map.has(bytes[i] * 256 + bytes[i + 1])) { covered = false; break; }
      if (covered) return cm.map.get(bytes[0] * 256 + bytes[1]) === " ";
    } else {
      if (!bytes.every((b) => cm.map.has(b))) continue;
      return cm.map.get(bytes[0]) === " ";
    }
  }
  return bytes[0] === 0x20; // the 1-byte space byte — the uncoded fallback
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
type TextPiece =
  { sep: string; font?: string; condGap?: boolean; condKern?: boolean; px?: number; py?: number; ps?: number; bx?: number; kv?: number }
  & ({ kind: "lit"; text: string; raw?: string } | { kind: "hex"; hex: string });

/**
 * R117-A: the per-font WIDTH TABLE — a font object's code→width map (in
 * 1/1000 text-space units), parsed from the CID /W array (all three
 * measured forms: the spec `c w` pairs, the spec `c [w1 w2 …]` arrays,
 * and the Typst `c c w` triples — 255 numbers on the real resume, CID k →
 * w_k, validated against the bbox ground truth: the space 250, digits
 * 465, letters 431–839) or the simple-font /Widths array (+ /FirstChar,
 * the descriptor's /MissingWidth). `codeLen` is 2 for Identity-H Type0
 * fonts (the 2-byte CID pairing), 1 for simple fonts. A font whose widths
 * cannot be parsed (or an encoding the pairing cannot serve — Identity-V)
 * simply has NO entry: the advance post-pass leaves its blocks' `bx`
 * undefined and the R117-A column rule stays blind on them (the
 * conservative guard — a missing table never misfires, it only cures
 * less).
 */
type WidthEntry = { codeLen: 1 | 2; map: Map<number, number>; def: number | undefined };

/**
 * Parses a /W array's content into a code→width map. The token walk
 * handles the two spec forms and the Typst triple form: a number followed
 * by a bracket is the array form (CIDs c..c+n−1); otherwise the numbers
 * group as pairs — unless EVERY group of three carries its CID twice
 * (k k w — the Typst writer's form, structurally disjoint from any real
 * pair sequence: the pair reading of it yields a non-ascending CID run).
 */
function parseWidthsArray(w: string): Map<number, number> | null {
  const toks = w.match(/\[|\]|-?[\d.]+/g);
  if (!toks || toks.length === 0) return null;
  const out = new Map<number, number>();
  if (!toks.includes("[")) {
    const nums = toks.map(Number);
    if (nums.length % 3 === 0 && nums.length >= 3) {
      let triple = true;
      for (let i = 0; i < nums.length; i += 3) if (nums[i] !== nums[i + 1] || !(nums[i + 2] > 0)) { triple = false; break; }
      if (triple) {
        for (let i = 0; i < nums.length; i += 3) out.set(nums[i], nums[i + 2]);
        return out;
      }
    }
    for (let i = 0; i + 1 < nums.length; i += 2) out.set(nums[i], nums[i + 1]);
    return out;
  }
  let i = 0;
  while (i < toks.length) {
    if (toks[i] === "[" || toks[i] === "]") { i++; continue; }
    const c = Number(toks[i]);
    i++;
    if (i < toks.length && toks[i] === "[") {
      i++;
      let cid = c;
      while (i < toks.length && toks[i] !== "]") {
        if (toks[i] !== "[") out.set(cid++, Number(toks[i]));
        i++;
      }
      i++;
    } else if (i < toks.length && toks[i] !== "]") {
      out.set(c, Number(toks[i]));
      i++;
    }
  }
  return out;
}

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
  // R111-A: the RAW byte string — escapes resolved to TRUE bytes (octal to
  // the byte value, ws shortforms to the control byte, escaped delimiters
  // to the literal char, EOL continuation to nothing), NO printable scrub.
  // The 2-byte Identity-H codes a CID writer carries in LITERAL strings
  // survive only here — unescape's latin1Printable turns every control
  // byte into a space and destroys the code pairing.
  const unescapeRaw = (s2: string): string => {
    const re = /\\(?:([0-7]{1,3})|([nrtbf])|([()\\])|(\r?\n))/g;
    let out = "";
    let last = 0;
    let m2: RegExpExecArray | null;
    while ((m2 = re.exec(s2))) {
      out += s2.slice(last, m2.index);
      if (m2[1] !== undefined) out += String.fromCharCode(parseInt(m2[1], 8) % 256);
      else if (m2[2] !== undefined)
        out += String.fromCharCode(m2[2] === "n" ? 10 : m2[2] === "r" ? 13 : m2[2] === "t" ? 9 : m2[2] === "b" ? 8 : 12);
      else if (m2[3] !== undefined) out += m2[3];
      last = re.lastIndex;
    }
    out += s2.slice(last);
    return out;
  };

  // R112-A: the DEVICE-SPACE position tracker — the hoist repair's eyes.
  // Maintains the CTM (cm concatenation — the operand applies BEFORE the
  // standing transform, empirically pinned on the Chromium specimen — with
  // a q/Q stack) and the text-line matrix (BT resets to identity, Tm sets
  // it, Td composes its translation inside it). Every show stamps its
  // device-space origin (px, py) + device font size (ps). Y is exact
  // (only Td/Tm move the baseline; T*/TL and the implicit show-width
  // advance stay untracked — the two-pass per-letter width table is the
  // standing deferred item — so T*-positioned streams read position-flat
  // and the repair conservatively never fires on them); X carries the
  // show-width drift — adequate for the same-line tiebreak, nothing finer.
  // A rotated/sheared composed matrix (the IRS sideways labels) or a piece
  // riding the BT-default origin (the XFA-XML garbage class) returns null
  // and goes unpositioned — the repair never fires on either.
  type Mat = [number, number, number, number, number, number];
  const mul = (m1: Mat, m2: Mat): Mat => [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
  let ctm: Mat = [1, 0, 0, 1, 0, 0];
  const ctmStack: Mat[] = [];
  let tlm: Mat = [1, 0, 0, 1, 0, 0];
  let tlmExplicit = false; // a Tm/Td placed the line matrix since the stream start / the last BT?
  const curPos = (): { px: number; py: number; ps: number } | null => {
    if (!tlmExplicit) return null; // the BT-default origin — not a layout position
    const e = mul(ctm, tlm);
    if (Math.abs(e[1]) > 0.01 || Math.abs(e[2]) > 0.01) return null; // rotated/sheared
    const ps = Math.abs(e[3]) * effSize;
    if (!Number.isFinite(ps) || ps <= 0) return null;
    return { px: e[4], py: e[5], ps };
  };

  // The position state, per the R100-A rule:
  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)
  // R120-F: the text-state advance modifiers — Tw adds text-space units to
  // every single-byte 0x20 code's advance (Prawn's justification form: the
  // word spaces are real 0x20 glyph bytes inside the atoms, the JUSTIFIED
  // spacing riding Tw), Tz scales every advance (the shrink/tracking form).
  // Both ride the piece for the bx post-pass (ISO 32000-1 9.3).
  let curTw = 0;
  let curTz = 100;
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
  const push = (piece: { kind: "lit"; text: string; raw?: string } | { kind: "hex"; hex: string }, fromKern = false, kernGap = false, kernVal = 0) => {
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
    const pos = curPos();
    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });
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
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\bBT\b|\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+cm|\bq\b|\bQ\b|(-?[\d.]+)\s+Tw|(-?[\d.]+)\s+Tz/g;
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
      tlm = mul(tlm, [1, 0, 0, 1, tx, ty]); // R112-A: the line origin moves
      tlmExplicit = true;
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
    // R120-F: the advance-modifier text state (the Tw/Tz regex arms)
    if (m[21] !== undefined) { curTw = parseFloat(m[21]) || 0; continue; }
    if (m[22] !== undefined) { curTz = parseFloat(m[22]) || 100; continue; }
    if (m[0] === "BT") {
      // R104-C: a fresh text run begins — the run state resets (the first
      // Td after this, with no Tm in between, is absolute). The pending
      // separator state is NOT reset: the next positioning operator (the
      // fresh Td itself) decides it.
      btFresh = true;
      tmInRun = false;
      freshTdTaken = false;
      tlm = [1, 0, 0, 1, 0, 0]; // R112-A: BT resets the text-line matrix (PDF §9.4.1)
      tlmExplicit = false;
      continue;
    }
    if (m[15] !== undefined) {
      // R112-A: cm CONCATENATES — the operand applies before the standing
      // transform (CTM' = CTM x M; pinned on the Chromium flip+scale stack)
      ctm = mul(ctm, [
        parseFloat(m[15]), parseFloat(m[16]), parseFloat(m[17]),
        parseFloat(m[18]), parseFloat(m[19]), parseFloat(m[20]),
      ]);
      continue;
    }
    if (m[0] === "q") {
      if (ctmStack.length < 256) ctmStack.push(ctm); // bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }
    if (m[4] !== undefined) {
      const text = unescape(m[4]);
      const rawText = unescapeRaw(m[4]);
      if (m[5] === "'" || m[5] === '"') {
        // the next-line shows: always a line break, the pending move consumed
        const pos = curPos();
        pieces.push({ sep: pieces.length === 0 ? "" : "\n", font: curFont, kind: "lit", text, raw: rawText, ...(pos ?? {}) });
        reset();
      } else {
        push({ kind: "lit", text, raw: rawText });
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
      const atomRe = /\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
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
      let sawNum = false; // R113-A: an explicit NUMBER token since the last atom — even a net-zero one (the WeasyPrint per-glyph 0) is the writer's contiguous-placement intent; only the ABSENCE of a number keeps the standing space join (the W3C dummy.pdf shape)
      while ((a = atomRe.exec(m[6]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          // R114-B: the kern word-gap branch marker — the fpdf2 class writes
          // the gap DOUBLY (a ≤ -100 kern AND a leading space glyph in the
          // next atom); the marker collapses the separator at assembly when
          // the atom's leading space is the writer's OWN (a cmap-declared
          // U+0020 or a real 0x20 byte — never the printable-scrub remap)
          const kernGap = kern !== 0 && !displayTracked && kern <= -100;
          if (kern !== 0 || sawNum) {
            moved = true;
            // R107-A: a display-tracked array's kerns are TRACKING, not gaps
            // — the atoms join (the space glyphs carry the word separation)
            pendingEm = kernGap ? 1.0 : 0; // the negative gap fires the space rule; a kern (either sign, under the boundary, or an explicit zero) joins
          }
          push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]), raw: unescapeRaw(a[1]) } : { kind: "hex", hex: a[2] }, sawNum, kernGap, kern); // R117-A: the kern rides the piece for the advance post-pass
          kern = 0;
          sawNum = false;
        } else {
          kern += parseFloat(a[3]);
          sawNum = true;
        }
      }
      continue;
    }
    if (m[7] !== undefined) {
      const hex = m[7];
      if (m[8] === "'" || m[8] === '"') {
        const pos = curPos();
        pieces.push({ sep: pieces.length === 0 ? "" : "\n", font: curFont, kind: "hex", hex, ...(pos ?? {}) });
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
      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim
      tlmExplicit = true;
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

// R112-A: the HOISTED-PREFIX REPAIR — the Chromium/Skia print pipeline (the
// 17th writer family: headless-Chromium page.pdf(), the modern "Download
// CV" path) paints FLOATED boxes before the in-flow content, so the stream
// reads every float first regardless of its layout position (a right-floated
// date column hoists above the candidate's name; pdftotext emits the merged
// reading order). The repair re-merges the hoisted run when — and only when
// — the full seven-guard signature fires:
//   (a) every piece carries a device position (axis-aligned matrices, an
//       explicit Tm/Td placement — never the BT-default origin);
//   (b) the FIRST clear ascent (>= 25 device units) in the y sequence bounds
//       the prefix — the jump back to the main flow's top. Later ascents
//       inside the suffix are irrelevant (the suffix never reorders: the
//       Chromium specimen's own skills section is column-count-2, and its
//       column break must not veto the repair);
//   (c) the hoisted run is at most TWO-THIRDS of the stream's pieces
//       — the suffix it merges into must be a substantial flow, not a
//       trailing header (the ReportLab TOC pages paint the TOC body first
//       and the running header LAST: k=67 of 70 = 96% on the full pages,
//       k=7..9 of 10..12 = 70-75% on the tail fragments). A plain
//       majority bound misfired on the SHORT-CV probe class (a floated
//       date column at 53% of a one-page stream — floats are not minority
//       content on short documents);
//   (d) the suffix's first y sits ABOVE every hoisted piece by the margin —
//       the main flow starts at the page top. A 2-column layout's second
//       column starts at the SAME height as the first: blocked (pdftotext
//       reads columns in stream order too);
//   (e) the suffix CONTINUES the flow — its second piece within a normal
//       step of its first (>= -75): a lone top-edge-clipped glyph at the
//       ascent (the QUARTZ stray, dropping -222 back into the page) is
//       furniture, not a flow's start;
//   (f) the suffix STARTS at its own top — pieces[k].py is the suffix's
//       maximum. A running header riding mid-suffix above the ascent's
//       landing (the ReportLab figure pages) or a scaled 2000+-unit figure
//       space (the arXiv streams) is scattered furniture, not a flow;
//   (g) the hoisted run sits in the page's READING BAND — its top at or
//       above a quarter of the flow's top. A run at the page floor is the
//       footer class (the LO Calc "Index | 545" footer paints first at
//       y=60 of a 688-high flow — a verified pdftotext improvement left to
//       stream order by the conservative bar), and a run at the origin is
//       XFA-XML garbage the walk matched incidentally.
// The merge: the prefix (stream order, stably) merges into the UNTOUCHED
// suffix; a prefix piece drains in when it sits above the suffix head, or
// same-line (0.35-em tolerance) with a smaller x. Relocated BLOCK HEADS
// (the run's first piece, or a new y / a backwards x within the run)
// carry "\n" seps; glyph continuations keep theirs; the output's first
// piece normalizes to "".
const HOIST_ASCENT = 25;
function repairHoistedPrefix(pieces: TextPiece[]): TextPiece[] {
  const n = pieces.length;
  if (n < 4) return pieces;
  if (!pieces.every((p) => p.px !== undefined && p.py !== undefined && p.ps !== undefined)) return pieces;
  // (b): the FIRST clear ascent bounds the prefix
  let ascentAt = -1;
  for (let i = 0; i + 1 < n; i++) {
    if (pieces[i + 1].py! - pieces[i].py! >= HOIST_ASCENT) {
      ascentAt = i;
      break;
    }
  }
  if (ascentAt === -1) return pieces;
  const k = ascentAt + 1; // the suffix starts here
  if (k > (2 / 3) * n) return pieces; // (c) the suffix-substance guard
  // (e): the suffix must CONTINUE the flow
  if (k + 1 >= n || pieces[k + 1].py! - pieces[k].py! < -3 * HOIST_ASCENT) return pieces;
  const suffixTop = pieces[k].py!;
  const prefixTop = Math.max(...pieces.slice(0, k).map((p) => p.py!));
  if (suffixTop <= prefixTop + HOIST_ASCENT) return pieces; // (d) the flow starts above every float
  // (f): the suffix starts at its own top
  for (let i = k + 1; i < n; i++) if (pieces[i].py! > pieces[k].py!) return pieces;
  // (g): the reading band
  if (prefixTop < 0.25 * suffixTop) return pieces;
  // the block heads within the prefix: the first piece, or a new y / a
  // backwards x relative to the previous prefix piece
  const head = new Set<number>([0]);
  for (let i = 1; i < k; i++) {
    const eps = 0.35 * Math.max(pieces[i - 1].ps!, pieces[i].ps!);
    if (Math.abs(pieces[i].py! - pieces[i - 1].py!) > eps || pieces[i].px! < pieces[i - 1].px! - eps) head.add(i);
  }
  const out: TextPiece[] = [];
  let pi = 0;
  for (let si = k; si < n; si++) {
    const s = pieces[si];
    while (pi < k) {
      const p = pieces[pi];
      const eps = 0.35 * Math.max(p.ps!, s.ps!);
      const dy = p.py! - s.py!;
      if (dy > eps || (dy >= -eps && p.px! < s.px!)) {
        out.push(head.has(pi) ? { ...p, sep: "\n" } : p);
        pi++;
      } else break;
    }
    out.push(s);
  }
  while (pi < k) {
    out.push(head.has(pi) ? { ...pieces[pi], sep: "\n" } : pieces[pi]);
    pi++;
  }
  if (out.length && out[0].sep !== "") out[0] = { ...out[0], sep: "" };
  return out;
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
  for (const fm of ascii.matchAll(/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g)) {
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
  for (const rm of ascii.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g)) {
    for (const fm of rm[1].matchAll(/\/(F\w+(?:\.\w+)*|[\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
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
  // R110-C: font objects DECLARING /Encoding /WinAnsiEncoding — the named
  // encoding feeds the WIN_ANSI marker through the candidate chain (a real
  // ToUnicode still wins; the MacRoman marker's exact discipline)
  const objWinAnsi = new Set<number>();
  // R117-A: the per-font WIDTH TABLES — keyed by font object. Type0 fonts
  // (Identity-H) resolve through /DescendantFonts to the CID /W + /DW
  // (the parent's key — the page binds the parent); simple fonts read
  // /Widths + /FirstChar + /MissingWidth. The parse covers the three
  // measured /W forms (pairs, arrays, the Typst c-c-w triples — see
  // parseWidthsArray). A font with no parseable widths carries NO entry —
  // its blocks stay blind to the R117-A column rule.
  const objWidths = new Map<number, WidthEntry>();
  const objDescendant = new Map<number, { desc: number; identityH: boolean }>(); // Type0 font obj → descendant obj
  // R120-A: THE INDIRECT WIDTH REFS — a font dict whose /W or /Widths value
  // is an object REFERENCE (Prawn's /Widths 514 0 R, dvipdfmx/fontspec's
  // descendant /W 1029 0 R, arXiv's 36 /Widths N 0 R) carries the array in
  // a SEPARATE object (raw or ObjStm-carried) — unresolvable at the body
  // parse (the target may not be seen yet), deferred to the post-walk pass.
  const widthsRef = new Map<number, { kind: "w" | "widths"; target: number; first: number; def: number }>();
  const readWidthsFromFontBody = (objNum: number, body: string) => {
    if (/\/Subtype\s*\/Type0\b/.test(body)) {
      const df = body.match(/\/DescendantFonts\s*\[\s*(\d+)\s+0\s+R/);
      if (df) objDescendant.set(objNum, { desc: parseInt(df[1], 10), identityH: /\/Encoding\s*\/Identity-H\b/.test(body) });
      return; // the widths live on the descendant (merged in the post-walk pass)
    }
    const wsm = body.match(/\/W\s*\[([^\]]*)\]/);
    if (wsm) {
      const map = parseWidthsArray(wsm[1]);
      const dw = body.match(/\/DW\s+(\d+)/);
      if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: dw ? parseInt(dw[1], 10) : 1000 });
      return;
    }
    // R120-A: the INDIRECT /W form — "/W 1029 0 R" (the dvipdfmx/fontspec
    // CID descendants). /DW rides the font body; the array rides the target.
    {
      const wr = body.match(/\/W\s+(\d+)\s+0\s+R/);
      if (wr) {
        const dw = body.match(/\/DW\s+(\d+)/);
        widthsRef.set(objNum, { kind: "w", target: parseInt(wr[1], 10), first: 0, def: dw ? parseInt(dw[1], 10) : 1000 });
      }
    }
    const sm = body.match(/\/Widths\s*\[([^\]]*)\]/);
    if (sm) {
      const nums = (sm[1].match(/-?[\d.]+/g) ?? []).map(Number);
      const fc = body.match(/\/FirstChar\s+(\d+)/);
      const first = fc ? parseInt(fc[1], 10) : 0;
      const map = new Map<number, number>();
      nums.forEach((w, i) => map.set(first + i, w));
      const mw = body.match(/\/MissingWidth\s+(\d+)/);
      objWidths.set(objNum, { codeLen: 1, map, def: mw ? parseInt(mw[1], 10) : 0 });
    } else {
      // R120-A: the INDIRECT /Widths form — "/Widths 514 0 R" (Prawn's
      // embedded fonts, arXiv's Type1 families). The first/missing defaults
      // ride the FONT body (the array object carries numbers only).
      const wr = body.match(/\/Widths\s+(\d+)\s+0\s+R/);
      if (wr) {
        const fc = body.match(/\/FirstChar\s+(\d+)/);
        const mw = body.match(/\/MissingWidth\s+(\d+)/);
        widthsRef.set(objNum, { kind: "widths", target: parseInt(wr[1], 10), first: fc ? parseInt(fc[1], 10) : 0, def: mw ? parseInt(mw[1], 10) : 0 });
      }
    }
  };
  for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
    if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
    const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) objToTu.set(parseInt(fm[1], 10), parseInt(tu[1], 10));
    const bf = fm[2].match(/\/BaseFont\s*\/([\w#+-]+)/);
    if (bf) objBaseFont.set(parseInt(fm[1], 10), (bf[1].split("+").pop() ?? bf[1]).toLowerCase());
    if (/\/Encoding\s*\/MacRomanEncoding\b/.test(fm[2])) objMacRoman.add(parseInt(fm[1], 10));
    if (/\/Encoding\s*\/WinAnsiEncoding\b/.test(fm[2])) objWinAnsi.add(parseInt(fm[1], 10)); // R110-C
    readWidthsFromFontBody(parseInt(fm[1], 10), fm[2]); // R117-A
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
  // R120-A: every ObjStm entry's body, kept for the deferred width-array
  // resolution (the dvipdfmx/fontspec /W targets are themselves
  // ObjStm-carried — invisible to any raw scan)
  const objstmBodies = new Map<number, string>();
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
  // R120-B: THE GENERAL-NAME FONT PAIRS — the WeasyPrint/IRS/QUARTZ class
  // (the Tf names are the subset tag or T1_0/Tc1 forms, never /F-prefixed):
  // (a) the pairs inside a /Font << … >> region (the R108-B discipline — by
  //     construction every Name N 0 R pair there IS a font binding);
  // (b) a body that IS a pure pair dict (WeasyPrint's referenced font dict
  //     "<< /BAWKYD 19 0 R /KTGASA 23 0 R >>" — no /Type, no other keys).
  const fontPairsOf = (body: string): Map<string, number> => {
    const out = new Map<string, number>();
    for (const rm of body.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g)) {
      for (const fm of rm[1].matchAll(/\/([\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
        if (fm[1] === "Font") continue;
        out.set(fm[1], parseInt(fm[2], 10));
      }
    }
    if (out.size === 0 && /^<<\s*(\/[\w#+.-]+\s+\d+\s+0\s+R\s*)+>>$/.test(body.trim())) {
      for (const fm of body.matchAll(/\/([\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
        if (fm[1] === "Font") continue;
        out.set(fm[1], parseInt(fm[2], 10));
      }
    }
    return out;
  };
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
      for (const fm of body.matchAll(/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g))
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
        // R120-B: the general-name pairs (the Tc1/T1_0/BAWKYD class) — a
        // resources body's /Font << >> region or a pure pair dict feeds the
        // SAME objFonts feed the F-prefixed form fills
        const gpairs = fontPairsOf(body);
        if (gpairs.size) {
          const cur = objFonts.get(parseInt(rm[1], 10)) ?? new Map<string, number>();
          for (const [k, v] of gpairs) cur.set(k, v);
          objFonts.set(parseInt(rm[1], 10), cur);
          for (const [k, v] of gpairs) pushCandidate(k, v, rm.index ?? 0);
        }
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
    // Session 109 (R109-A): the FILTER-AWARE decode — the stream's own
    // /Filter chain (from its dict region, already computed for the R102-A
    // image gate) decides the decode order: an /ASCII85Decode declaration
    // strips the armor FIRST (the ReportLab 14th-writer default), then
    // FlateDecode inflates when also declared (the array order is the
    // decode order per ISO 32000-1 §7.4); an ASCII85-only stream's decoded
    // bytes ARE the content. No declaration → the standing best-effort
    // inflate-only behavior (the uncompressed-content watch stays
    // documented, unexercised by the corpus).
    const hasA85 = /\/ASCII85Decode|\/A85\b/.test(dictRegion);
    const hasFlate = /\/FlateDecode/.test(dictRegion);
    // R110-A: a stream whose dict declares NO /Filter key at all is
    // UNCOMPRESSED — its bytes ARE the content (ISO 32000-1 §7.4: /Filter
    // names the filters applied, in order; no key, no filter — the oldest
    // PDF form). The 15th-writer Prawn class: 182 of 189 streams raw, the
    // content AND the ToUnicode CMaps both, and the standing best-effort
    // inflate failed on every one — `if (!text) continue` silently dropped
    // them all (0 chars extracted). The LAST-RESORT form: the r95-era
    // fixtures pin the OPPOSITE undeclared case — a dict-stub stream
    // (no /Filter) carrying DEFLATED bytes — so the raw reading fires
    // ONLY after BOTH inflate attempts fail on an undeclared stream; a
    // dict that declares /Filter with ANY spelling or abbreviation
    // (/Fl, /AHx, an empty array) never takes the raw reading at all.
    // The downstream gates (text-op shape + printable-dominant, the
    // R102-A legs 2+3) still vet every raw stream before the operator
    // walk — binary that slipped past the dict gate never reaches the
    // regex.
    const hasFilter = /\/Filter\b/.test(dictRegion);
    for (const trimmed of [chunk, bytes.subarray(start, end)]) {
      try {
        let payload: Uint8Array = trimmed;
        if (hasA85) {
          payload = ascii85Decode(trimmed);
          if (!hasFlate) {
            text = new TextDecoder("latin1").decode(payload);
            break;
          }
        }
        // R108-B LEG A: the latin1 decode — PDF content streams are BYTE
        // strings, not UTF-8; the TextDecoder default corrupted every
        // byte >= 0x80 in a literal atom to U+FFFD before the decode tables
        // ever saw it (the 13th-writer Quartz class: the fonts declare
        // MacRomanEncoding and byte 0xD5 IS the right single quote). The
        // .docx XML paths above stay UTF-8 — XML is UTF-8 by spec. (The
        // "latin1" label is the WHATWG alias for windows-1252 — the r109
        // discovery; a byte 0x80-0x9F decodes to its cp1252 char, which is
        // exactly the WinAnsi reading those fonts intend.)
        text = new TextDecoder("latin1").decode(await inflate(payload, "deflate"));
        break;
      } catch {
        try {
          text = new TextDecoder("latin1").decode(await inflate(trimmed, "deflate-raw"));
          break;
        } catch {
          // R110-A: undeclared AND both inflates failed — the bytes ARE
          // the content (the Prawn raw form; the r95 deflated-undeclared
          // class already succeeded at one of the inflates above)
          if (!hasFilter) {
            text = new TextDecoder("latin1").decode(trimmed);
            break;
          }
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
          objstmBodies.set(entries[i].obj, body); // R120-A: the deferred-resolution feed
          if (/\/Type\s*\/Font\b/.test(body)) {
            const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
            if (tu) objToTu.set(entries[i].obj, parseInt(tu[1], 10));
            const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/); // R105-B
            if (bf) objBaseFont.set(entries[i].obj, (bf[1].split("+").pop() ?? bf[1]).toLowerCase());
            if (/\/Encoding\s*\/MacRomanEncoding\b/.test(body)) objMacRoman.add(entries[i].obj); // R108-B
            if (/\/Encoding\s*\/WinAnsiEncoding\b/.test(body)) objWinAnsi.add(entries[i].obj); // R110-C
            readWidthsFromFontBody(entries[i].obj, body); // R117-A: the ObjStm-carried fonts' width tables
          }
          // R108-B: the ObjStm side of the /Font-dict-region collector — an
          // ObjStm-carried resources body's /Font << … >> pairs feed the
          // candidate chain at the stream's file position (the Quartz
          // general-name form, ObjStm-carried)
          for (const fm2 of body.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g)) {
            for (const fm of fm2[1].matchAll(/\/(F\w+(?:\.\w+)*|[\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
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
              for (const fm of body.matchAll(/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g))
                if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
              for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R120-B: the inline /Font region pairs (the IRS T1_0 class)
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
            for (const fm of body.matchAll(/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R120-B: the WeasyPrint pure-pair dict + the region form
            if (fonts.size) objFonts.set(entries[i].obj, fonts);
            const fr = body.match(/\/Font\s+(\d+)\s+0\s+R/); // R107-B shape (b): the link
            if (fr) fontRefOf.set(entries[i].obj, parseInt(fr[1], 10));
          }
          for (const fm of body.matchAll(/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g)) {
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
    // Session 114 (R114-A): the census measures the stream's SYNTAX —
    // operators, numbers, names — never the payload bytes inside LITERAL
    // strings. The 19th-writer fpdf2 class writes 2-byte Identity-H codes
    // as RAW control bytes in literals (high byte 0x00 — half the literal
    // bytes are NULs), and the whole-stream sample read a genuine content
    // stream at 51.8% printable → under the 60% gate → the WHOLE file read
    // 0 characters. The literal spans are collected with a LINEAR
    // depth-tracked scan (a regex mask would re-introduce the pathological
    // backtracking class this guard exists to prevent); sampled positions
    // inside a span are skipped, and an unclosed span is discarded (binary
    // junk with a stray `(` never masks the tail — the paren-free decoy
    // class stays rejected, and random binary keeps its non-printable
    // majority outside the spans too).
    if (!/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
    {
      let printable = 0;
      const spans: [number, number][] = [];
      {
        let depth = 0;
        let start = -1;
        for (let i = 0; i < text.length; i++) {
          const c = text.charCodeAt(i);
          if (c === 92) { i++; continue; } // an escaped char — the next byte is payload
          if (c === 40) { if (depth === 0) start = i; depth++; continue; }
          if (c === 41 && depth > 0) {
            depth--;
            if (depth === 0 && start >= 0) { spans.push([start, i + 1]); start = -1; }
          }
        }
      }
      const inSpan = (i: number): boolean => {
        let lo = 0, hi = spans.length - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (i < spans[mid][0]) hi = mid - 1;
          else if (i >= spans[mid][1]) lo = mid + 1;
          else return true;
        }
        return false;
      };
      const samples = Math.min(text.length, 4096);
      const stride = Math.max(1, Math.floor(text.length / samples));
      let taken = 0;
      for (let i = 0; i < text.length; i += stride) {
        if (inSpan(i)) continue; // literal payload — the syntax census skips it
        taken++;
        const c = text.charCodeAt(i);
        if ((c >= 32 && c < 127) || c === 10 || c === 13 || c === 9) printable++;
      }
      if (taken === 0 || printable / taken < 0.6) continue;
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
          // R110-C: the WinAnsi twin — a font DECLARING
          // /Encoding /WinAnsiEncoding with no ToUnicode decodes through
          // the cp1252 table (the Prawn glyph-table class)
          if (objWinAnsi.has(c.obj)) own.push(WIN_ANSI_CMAP);
        }
      }
      if (own.length) chain = [...own, ...cmaps];
    }
    const out = chain ?? cmaps;
    cmapsForMemo.set(font, out);
    return out;
  };
  // R120-A: THE INDIRECT WIDTH-ARRAY RESOLUTION — every recorded ref's
  // target body (raw array object or ObjStm entry) parsed into objWidths.
  // The raw targets are plain array objects ("1435 0 obj\n[ 333.3 ... ]");
  // the /W form may nest arrays ("3 [318] 11 [390 390]") so the slice is
  // BRACKET-BALANCED, never a regex. A target that resolves nowhere leaves
  // the font blind (the conservative guard — a missing array never
  // misfires, it only cures less).
  if (widthsRef.size) {
    const rawArray = new Map<number, string>();
    for (const wr of widthsRef.values()) {
      if (objstmBodies.has(wr.target) || rawArray.has(wr.target)) continue;
      const hm = ascii.match(new RegExp("(?:^|\\n)" + wr.target + " 0 obj\\s*\\["));
      if (!hm || hm.index === undefined) continue;
      let depth = 0;
      let end = -1;
      for (let i = hm.index + hm[0].length - 1; i < ascii.length; i++) {
        const ch = ascii[i];
        if (ch === "[") depth++;
        else if (ch === "]") { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end > 0) rawArray.set(wr.target, ascii.slice(hm.index + hm[0].length - 1, end + 1));
    }
    for (const [objNum, wr] of widthsRef) {
      if (objWidths.has(objNum)) continue; // a real inline array won (the precedence guard)
      const body = objstmBodies.get(wr.target) ?? rawArray.get(wr.target);
      if (body === undefined) continue;
      const inner = body.replace(/^[\s\[]+/, "").replace(/[\s\]]+$/, "");
      if (wr.kind === "w") {
        const map = parseWidthsArray(inner);
        if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: wr.def });
      } else {
        const nums = (inner.match(/-?[\d.]+/g) ?? []).map(Number);
        if (nums.length) {
          const map = new Map<number, number>();
          nums.forEach((w, i) => map.set(wr.first + i, w));
          objWidths.set(objNum, { codeLen: 1, map, def: wr.def });
        }
      }
    }
  }
  // R117-A: THE DESCENDANT MERGE — the Type0 parents' width entries resolve
  // through /DescendantFonts to the CID descendants' /W tables (both may be
  // raw-carried, ObjStm-carried, or split across the two; the merge runs
  // after every walk). Only Identity-H parents merge (the 2-byte CID
  // pairing; an Identity-V parent stays widthless — the blind guard).
  for (const [parent, { desc, identityH }] of objDescendant) {
    if (!identityH) continue;
    const we = objWidths.get(desc);
    if (we) objWidths.set(parent, we);
  }
    // R119-B: THE STANDARD-14 WIDTH TABLES (run-length triples
    // "firstCode,width,count;..." — Adobe's core-font AFM metrics, the
    // encoding-resolved byte maps; a standard-14 font object without
    // /Widths seeds its table from here (codeLen 1, no default — an
    // uncovered code blinds the block, the conservative guard).
    const STD14: Record<string, string> = {
      "courier-boldoblique|macroman": "32,600,95;128,600,45;174,600,2;177,600,1;180,600,2;187,600,2;190,600,5;196,600,1;199,600,16;216,600,24;241,600,15",
      "courier-boldoblique|winansi": "32,600,224",
      "courier-bold|macroman": "32,600,95;128,600,45;174,600,2;177,600,1;180,600,2;187,600,2;190,600,5;196,600,1;199,600,16;216,600,24;241,600,15",
      "courier-bold|winansi": "32,600,224",
      "courier-oblique|macroman": "32,600,95;128,600,45;174,600,2;177,600,1;180,600,2;187,600,2;190,600,5;196,600,1;199,600,16;216,600,24;241,600,15",
      "courier-oblique|winansi": "32,600,224",
      "courier|macroman": "32,600,95;128,600,45;174,600,2;177,600,1;180,600,2;187,600,2;190,600,5;196,600,1;199,600,16;216,600,24;241,600,15",
      "courier|winansi": "32,600,224",
      "helvetica-boldoblique|macroman": "32,278,1;33,333,1;34,474,1;35,556,2;37,889,1;38,722,1;39,238,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,333,2;60,584,3;63,611,1;64,975,1;65,722,4;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,556,1;75,722,1;76,611,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,333,1;92,278,1;93,333,1;94,584,1;95,556,1;96,333,1;97,556,1;98,611,1;99,556,1;100,611,1;101,556,1;102,333,1;103,611,2;105,278,2;107,556,1;108,278,1;109,889,1;110,611,4;114,389,1;115,556,1;116,333,1;117,611,1;118,556,1;119,778,1;120,556,2;122,500,1;123,389,1;124,280,1;125,389,1;126,584,1;128,722,3;131,667,1;132,722,1;133,778,1;134,722,1;135,556,11;146,278,4;150,611,10;160,556,1;161,400,1;162,556,3;165,350,1;166,556,1;167,611,1;168,737,2;170,1000,1;171,333,2;174,1000,1;175,778,1;177,584,1;180,556,1;181,611,1;187,370,1;188,365,1;190,889,1;191,611,2;193,333,1;194,584,1;196,556,1;199,556,2;201,1000,1;202,278,1;203,722,2;205,778,1;206,1000,1;207,944,1;208,556,1;209,1000,1;210,500,2;212,278,2;214,584,1;216,556,1;217,667,1;218,167,1;219,556,1;220,333,2;222,611,2;224,556,1;225,278,2;227,500,1;228,1000,1;229,722,1;230,667,1;231,722,1;232,667,2;234,278,4;238,778,2;241,778,1;242,722,3;245,278,1;246,333,10",
      "helvetica-boldoblique|winansi": "32,278,1;33,333,1;34,474,1;35,556,2;37,889,1;38,722,1;39,238,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,333,2;60,584,3;63,611,1;64,975,1;65,722,4;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,556,1;75,722,1;76,611,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,333,1;92,278,1;93,333,1;94,584,1;95,556,1;96,333,1;97,556,1;98,611,1;99,556,1;100,611,1;101,556,1;102,333,1;103,611,2;105,278,2;107,556,1;108,278,1;109,889,1;110,611,4;114,389,1;115,556,1;116,333,1;117,611,1;118,556,1;119,778,1;120,556,2;122,500,1;123,389,1;124,280,1;125,389,1;126,584,1;127,350,1;128,556,1;129,350,1;130,278,1;131,556,1;132,500,1;133,1000,1;134,556,2;136,333,1;137,1000,1;138,667,1;139,333,1;140,1000,1;141,350,1;142,611,1;143,350,2;145,278,2;147,500,2;149,350,1;150,556,1;151,1000,1;152,333,1;153,1000,1;154,556,1;155,333,1;156,944,1;157,350,1;158,500,1;159,667,1;160,278,1;161,333,1;162,556,4;166,280,1;167,556,1;168,333,1;169,737,1;170,370,1;171,556,1;172,584,1;173,333,1;174,737,1;175,333,1;176,400,1;177,584,1;178,333,3;181,611,1;182,556,1;183,278,1;184,333,2;186,365,1;187,556,1;188,834,3;191,611,1;192,722,6;198,1000,1;199,722,1;200,667,4;204,278,4;208,722,2;210,778,5;215,584,1;216,778,1;217,722,4;221,667,2;223,611,1;224,556,6;230,889,1;231,556,5;236,278,4;240,611,7;247,584,1;248,611,5;253,556,1;254,611,1;255,556,1",
      "helvetica-bold|macroman": "32,278,1;33,333,1;34,474,1;35,556,2;37,889,1;38,722,1;39,238,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,333,2;60,584,3;63,611,1;64,975,1;65,722,4;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,556,1;75,722,1;76,611,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,333,1;92,278,1;93,333,1;94,584,1;95,556,1;96,333,1;97,556,1;98,611,1;99,556,1;100,611,1;101,556,1;102,333,1;103,611,2;105,278,2;107,556,1;108,278,1;109,889,1;110,611,4;114,389,1;115,556,1;116,333,1;117,611,1;118,556,1;119,778,1;120,556,2;122,500,1;123,389,1;124,280,1;125,389,1;126,584,1;128,722,3;131,667,1;132,722,1;133,778,1;134,722,1;135,556,11;146,278,4;150,611,10;160,556,1;161,400,1;162,556,3;165,350,1;166,556,1;167,611,1;168,737,2;170,1000,1;171,333,2;174,1000,1;175,778,1;177,584,1;180,556,1;181,611,1;187,370,1;188,365,1;190,889,1;191,611,2;193,333,1;194,584,1;196,556,1;199,556,2;201,1000,1;202,278,1;203,722,2;205,778,1;206,1000,1;207,944,1;208,556,1;209,1000,1;210,500,2;212,278,2;214,584,1;216,556,1;217,667,1;218,167,1;219,556,1;220,333,2;222,611,2;224,556,1;225,278,2;227,500,1;228,1000,1;229,722,1;230,667,1;231,722,1;232,667,2;234,278,4;238,778,2;241,778,1;242,722,3;245,278,1;246,333,10",
      "helvetica-bold|winansi": "32,278,1;33,333,1;34,474,1;35,556,2;37,889,1;38,722,1;39,238,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,333,2;60,584,3;63,611,1;64,975,1;65,722,4;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,556,1;75,722,1;76,611,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,333,1;92,278,1;93,333,1;94,584,1;95,556,1;96,333,1;97,556,1;98,611,1;99,556,1;100,611,1;101,556,1;102,333,1;103,611,2;105,278,2;107,556,1;108,278,1;109,889,1;110,611,4;114,389,1;115,556,1;116,333,1;117,611,1;118,556,1;119,778,1;120,556,2;122,500,1;123,389,1;124,280,1;125,389,1;126,584,1;127,350,1;128,556,1;129,350,1;130,278,1;131,556,1;132,500,1;133,1000,1;134,556,2;136,333,1;137,1000,1;138,667,1;139,333,1;140,1000,1;141,350,1;142,611,1;143,350,2;145,278,2;147,500,2;149,350,1;150,556,1;151,1000,1;152,333,1;153,1000,1;154,556,1;155,333,1;156,944,1;157,350,1;158,500,1;159,667,1;160,278,1;161,333,1;162,556,4;166,280,1;167,556,1;168,333,1;169,737,1;170,370,1;171,556,1;172,584,1;173,333,1;174,737,1;175,333,1;176,400,1;177,584,1;178,333,3;181,611,1;182,556,1;183,278,1;184,333,2;186,365,1;187,556,1;188,834,3;191,611,1;192,722,6;198,1000,1;199,722,1;200,667,4;204,278,4;208,722,2;210,778,5;215,584,1;216,778,1;217,722,4;221,667,2;223,611,1;224,556,6;230,889,1;231,556,5;236,278,4;240,611,7;247,584,1;248,611,5;253,556,1;254,611,1;255,556,1",
      "helvetica-oblique|macroman": "32,278,2;34,355,1;35,556,2;37,889,1;38,667,1;39,191,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,278,2;60,584,3;63,556,1;64,1015,1;65,667,2;67,722,2;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,500,1;75,667,1;76,556,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,278,3;94,469,1;95,556,1;96,333,1;97,556,2;99,500,1;100,556,2;102,278,1;103,556,2;105,222,2;107,500,1;108,222,1;109,833,1;110,556,4;114,333,1;115,500,1;116,278,1;117,556,1;118,500,1;119,722,1;120,500,3;123,334,1;124,260,1;125,334,1;126,584,1;128,667,2;130,722,1;131,667,1;132,722,1;133,778,1;134,722,1;135,556,6;141,500,1;142,556,4;146,278,4;150,556,11;161,400,1;162,556,3;165,350,1;166,537,1;167,611,1;168,737,2;170,1000,1;171,333,2;174,1000,1;175,778,1;177,584,1;180,556,2;187,370,1;188,365,1;190,889,1;191,611,2;193,333,1;194,584,1;196,556,1;199,556,2;201,1000,1;202,278,1;203,667,2;205,778,1;206,1000,1;207,944,1;208,556,1;209,1000,1;210,333,2;212,222,2;214,584,1;216,500,1;217,667,1;218,167,1;219,556,1;220,333,2;222,500,2;224,556,1;225,278,1;226,222,1;227,333,1;228,1000,1;229,667,5;234,278,4;238,778,2;241,778,1;242,722,3;245,278,1;246,333,10",
      "helvetica-oblique|winansi": "32,278,2;34,355,1;35,556,2;37,889,1;38,667,1;39,191,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,278,2;60,584,3;63,556,1;64,1015,1;65,667,2;67,722,2;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,500,1;75,667,1;76,556,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,278,3;94,469,1;95,556,1;96,333,1;97,556,2;99,500,1;100,556,2;102,278,1;103,556,2;105,222,2;107,500,1;108,222,1;109,833,1;110,556,4;114,333,1;115,500,1;116,278,1;117,556,1;118,500,1;119,722,1;120,500,3;123,334,1;124,260,1;125,334,1;126,584,1;127,350,1;128,556,1;129,350,1;130,222,1;131,556,1;132,333,1;133,1000,1;134,556,2;136,333,1;137,1000,1;138,667,1;139,333,1;140,1000,1;141,350,1;142,611,1;143,350,2;145,222,2;147,333,2;149,350,1;150,556,1;151,1000,1;152,333,1;153,1000,1;154,500,1;155,333,1;156,944,1;157,350,1;158,500,1;159,667,1;160,278,1;161,333,1;162,556,4;166,260,1;167,556,1;168,333,1;169,737,1;170,370,1;171,556,1;172,584,1;173,333,1;174,737,1;175,333,1;176,400,1;177,584,1;178,333,3;181,556,1;182,537,1;183,278,1;184,333,2;186,365,1;187,556,1;188,834,3;191,611,1;192,667,6;198,1000,1;199,722,1;200,667,4;204,278,4;208,722,2;210,778,5;215,584,1;216,778,1;217,722,4;221,667,2;223,611,1;224,556,6;230,889,1;231,500,1;232,556,4;236,278,4;240,556,7;247,584,1;248,611,1;249,556,4;253,500,1;254,556,1;255,500,1",
      "helvetica|macroman": "32,278,2;34,355,1;35,556,2;37,889,1;38,667,1;39,191,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,278,2;60,584,3;63,556,1;64,1015,1;65,667,2;67,722,2;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,500,1;75,667,1;76,556,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,278,3;94,469,1;95,556,1;96,333,1;97,556,2;99,500,1;100,556,2;102,278,1;103,556,2;105,222,2;107,500,1;108,222,1;109,833,1;110,556,4;114,333,1;115,500,1;116,278,1;117,556,1;118,500,1;119,722,1;120,500,3;123,334,1;124,260,1;125,334,1;126,584,1;128,667,2;130,722,1;131,667,1;132,722,1;133,778,1;134,722,1;135,556,6;141,500,1;142,556,4;146,278,4;150,556,11;161,400,1;162,556,3;165,350,1;166,537,1;167,611,1;168,737,2;170,1000,1;171,333,2;174,1000,1;175,778,1;177,584,1;180,556,2;187,370,1;188,365,1;190,889,1;191,611,2;193,333,1;194,584,1;196,556,1;199,556,2;201,1000,1;202,278,1;203,667,2;205,778,1;206,1000,1;207,944,1;208,556,1;209,1000,1;210,333,2;212,222,2;214,584,1;216,500,1;217,667,1;218,167,1;219,556,1;220,333,2;222,500,2;224,556,1;225,278,1;226,222,1;227,333,1;228,1000,1;229,667,5;234,278,4;238,778,2;241,778,1;242,722,3;245,278,1;246,333,10",
      "helvetica|winansi": "32,278,2;34,355,1;35,556,2;37,889,1;38,667,1;39,191,1;40,333,2;42,389,1;43,584,1;44,278,1;45,333,1;46,278,2;48,556,10;58,278,2;60,584,3;63,556,1;64,1015,1;65,667,2;67,722,2;69,667,1;70,611,1;71,778,1;72,722,1;73,278,1;74,500,1;75,667,1;76,556,1;77,833,1;78,722,1;79,778,1;80,667,1;81,778,1;82,722,1;83,667,1;84,611,1;85,722,1;86,667,1;87,944,1;88,667,2;90,611,1;91,278,3;94,469,1;95,556,1;96,333,1;97,556,2;99,500,1;100,556,2;102,278,1;103,556,2;105,222,2;107,500,1;108,222,1;109,833,1;110,556,4;114,333,1;115,500,1;116,278,1;117,556,1;118,500,1;119,722,1;120,500,3;123,334,1;124,260,1;125,334,1;126,584,1;127,350,1;128,556,1;129,350,1;130,222,1;131,556,1;132,333,1;133,1000,1;134,556,2;136,333,1;137,1000,1;138,667,1;139,333,1;140,1000,1;141,350,1;142,611,1;143,350,2;145,222,2;147,333,2;149,350,1;150,556,1;151,1000,1;152,333,1;153,1000,1;154,500,1;155,333,1;156,944,1;157,350,1;158,500,1;159,667,1;160,278,1;161,333,1;162,556,4;166,260,1;167,556,1;168,333,1;169,737,1;170,370,1;171,556,1;172,584,1;173,333,1;174,737,1;175,333,1;176,400,1;177,584,1;178,333,3;181,556,1;182,537,1;183,278,1;184,333,2;186,365,1;187,556,1;188,834,3;191,611,1;192,667,6;198,1000,1;199,722,1;200,667,4;204,278,4;208,722,2;210,778,5;215,584,1;216,778,1;217,722,4;221,667,2;223,611,1;224,556,6;230,889,1;231,500,1;232,556,4;236,278,4;240,556,7;247,584,1;248,611,1;249,556,4;253,500,1;254,556,1;255,500,1",
      "symbol": "32,250,1;33,333,1;34,713,1;35,500,1;36,549,1;37,833,1;38,778,1;39,439,1;40,333,2;42,500,1;43,549,1;44,250,1;45,549,1;46,250,1;47,278,1;48,500,10;58,278,2;60,549,3;63,444,1;64,549,1;65,722,1;66,667,1;67,722,1;68,612,1;69,611,1;70,763,1;71,603,1;72,722,1;73,333,1;74,631,1;75,722,1;76,686,1;77,889,1;78,722,2;80,768,1;81,741,1;82,556,1;83,592,1;84,611,1;85,690,1;86,439,1;87,768,1;88,645,1;89,795,1;90,611,1;91,333,1;92,863,1;93,333,1;94,658,1;95,500,2;97,631,1;98,549,2;100,494,1;101,439,1;102,521,1;103,411,1;104,603,1;105,329,1;106,603,1;107,549,2;109,576,1;110,521,1;111,549,2;113,521,1;114,549,1;115,603,1;116,439,1;117,576,1;118,713,1;119,686,1;120,493,1;121,686,1;122,494,1;123,480,1;124,200,1;125,480,1;126,549,1;160,750,1;161,620,1;162,247,1;163,549,1;164,167,1;165,713,1;166,500,1;167,753,4;171,1042,1;172,987,1;173,603,1;174,987,1;175,603,1;176,400,1;177,549,1;178,411,1;179,549,2;181,713,1;182,494,1;183,460,1;184,549,4;188,1000,1;189,603,1;190,1000,1;191,658,1;192,823,1;193,686,1;194,795,1;195,987,1;196,768,2;198,823,1;199,768,2;201,713,7;208,768,1;209,713,1;210,790,2;212,890,1;213,823,1;214,549,1;215,250,1;216,713,1;217,603,2;219,1042,1;220,987,1;221,603,1;222,987,1;223,603,1;224,494,1;225,329,1;226,790,2;228,786,1;229,713,1;230,384,6;236,494,4;241,329,1;242,274,1;243,686,3;246,384,6;252,494,3",
      "times-bolditalic|macroman": "32,250,1;33,389,1;34,555,1;35,500,2;37,833,1;38,778,1;39,278,1;40,333,2;42,500,1;43,570,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,570,3;63,500,1;64,832,1;65,667,3;68,722,1;69,667,2;71,722,1;72,778,1;73,389,1;74,500,1;75,667,1;76,611,1;77,889,1;78,722,2;80,611,1;81,722,1;82,667,1;83,556,1;84,611,1;85,722,1;86,667,1;87,889,1;88,667,1;89,611,2;91,333,1;92,278,1;93,333,1;94,570,1;95,500,1;96,333,1;97,500,2;99,444,1;100,500,1;101,444,1;102,333,1;103,500,1;104,556,1;105,278,2;107,500,1;108,278,1;109,778,1;110,556,1;111,500,3;114,389,2;116,278,1;117,556,1;118,444,1;119,667,1;120,500,1;121,444,1;122,389,1;123,348,1;124,220,1;125,348,1;126,570,1;128,667,4;132,722,3;135,500,6;141,444,5;146,278,4;150,556,1;151,500,5;156,556,4;160,500,1;161,400,1;162,500,3;165,350,1;166,500,2;168,747,2;170,1000,1;171,333,2;174,944,1;175,722,1;177,570,1;180,500,1;181,576,1;187,266,1;188,300,1;190,722,1;191,500,2;193,389,1;194,606,1;196,500,1;199,500,2;201,1000,1;202,250,1;203,667,2;205,722,1;206,944,1;207,722,1;208,500,1;209,1000,1;210,500,2;212,333,2;214,570,1;216,444,1;217,611,1;218,167,1;219,500,1;220,333,2;222,556,2;224,500,1;225,250,1;226,333,1;227,500,1;228,1000,1;229,667,5;234,389,4;238,722,2;241,722,4;245,278,1;246,333,10",
      "times-bolditalic|winansi": "32,250,1;33,389,1;34,555,1;35,500,2;37,833,1;38,778,1;39,278,1;40,333,2;42,500,1;43,570,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,570,3;63,500,1;64,832,1;65,667,3;68,722,1;69,667,2;71,722,1;72,778,1;73,389,1;74,500,1;75,667,1;76,611,1;77,889,1;78,722,2;80,611,1;81,722,1;82,667,1;83,556,1;84,611,1;85,722,1;86,667,1;87,889,1;88,667,1;89,611,2;91,333,1;92,278,1;93,333,1;94,570,1;95,500,1;96,333,1;97,500,2;99,444,1;100,500,1;101,444,1;102,333,1;103,500,1;104,556,1;105,278,2;107,500,1;108,278,1;109,778,1;110,556,1;111,500,3;114,389,2;116,278,1;117,556,1;118,444,1;119,667,1;120,500,1;121,444,1;122,389,1;123,348,1;124,220,1;125,348,1;126,570,1;127,350,1;128,500,1;129,350,1;130,333,1;131,500,2;133,1000,1;134,500,2;136,333,1;137,1000,1;138,556,1;139,333,1;140,944,1;141,350,1;142,611,1;143,350,2;145,333,2;147,500,2;149,350,1;150,500,1;151,1000,1;152,333,1;153,1000,1;154,389,1;155,333,1;156,722,1;157,350,1;158,389,1;159,611,1;160,250,1;161,389,1;162,500,4;166,220,1;167,500,1;168,333,1;169,747,1;170,266,1;171,500,1;172,606,1;173,333,1;174,747,1;175,333,1;176,400,1;177,570,1;178,300,2;180,333,1;181,576,1;182,500,1;183,250,1;184,333,1;185,300,2;187,500,1;188,750,3;191,500,1;192,667,6;198,944,1;199,667,5;204,389,4;208,722,7;215,570,1;216,722,5;221,611,2;223,500,7;230,722,1;231,444,5;236,278,4;240,500,1;241,556,1;242,500,5;247,570,1;248,500,1;249,556,4;253,444,1;254,500,1;255,444,1",
      "times-bold|macroman": "32,250,1;33,333,1;34,555,1;35,500,2;37,1000,1;38,833,1;39,278,1;40,333,2;42,500,1;43,570,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,570,3;63,500,1;64,930,1;65,722,1;66,667,1;67,722,2;69,667,1;70,611,1;71,778,2;73,389,1;74,500,1;75,778,1;76,667,1;77,944,1;78,722,1;79,778,1;80,611,1;81,778,1;82,722,1;83,556,1;84,667,1;85,722,2;87,1000,1;88,722,2;90,667,1;91,333,1;92,278,1;93,333,1;94,581,1;95,500,1;96,333,1;97,500,1;98,556,1;99,444,1;100,556,1;101,444,1;102,333,1;103,500,1;104,556,1;105,278,1;106,333,1;107,556,1;108,278,1;109,833,1;110,556,1;111,500,1;112,556,2;114,444,1;115,389,1;116,333,1;117,556,1;118,500,1;119,722,1;120,500,2;122,444,1;123,394,1;124,220,1;125,394,1;126,520,1;128,722,3;131,667,1;132,722,1;133,778,1;134,722,1;135,500,6;141,444,5;146,278,4;150,556,1;151,500,5;156,556,4;160,500,1;161,400,1;162,500,3;165,350,1;166,540,1;167,556,1;168,747,2;170,1000,1;171,333,2;174,1000,1;175,778,1;177,570,1;180,500,1;181,556,1;187,300,1;188,330,1;190,722,1;191,500,2;193,333,1;194,570,1;196,500,1;199,500,2;201,1000,1;202,250,1;203,722,2;205,778,1;206,1000,1;207,722,1;208,500,1;209,1000,1;210,500,2;212,333,2;214,570,1;216,500,1;217,722,1;218,167,1;219,500,1;220,333,2;222,556,2;224,500,1;225,250,1;226,333,1;227,500,1;228,1000,1;229,722,1;230,667,1;231,722,1;232,667,2;234,389,4;238,778,2;241,778,1;242,722,3;245,278,1;246,333,10",
      "times-bold|winansi": "32,250,1;33,333,1;34,555,1;35,500,2;37,1000,1;38,833,1;39,278,1;40,333,2;42,500,1;43,570,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,570,3;63,500,1;64,930,1;65,722,1;66,667,1;67,722,2;69,667,1;70,611,1;71,778,2;73,389,1;74,500,1;75,778,1;76,667,1;77,944,1;78,722,1;79,778,1;80,611,1;81,778,1;82,722,1;83,556,1;84,667,1;85,722,2;87,1000,1;88,722,2;90,667,1;91,333,1;92,278,1;93,333,1;94,581,1;95,500,1;96,333,1;97,500,1;98,556,1;99,444,1;100,556,1;101,444,1;102,333,1;103,500,1;104,556,1;105,278,1;106,333,1;107,556,1;108,278,1;109,833,1;110,556,1;111,500,1;112,556,2;114,444,1;115,389,1;116,333,1;117,556,1;118,500,1;119,722,1;120,500,2;122,444,1;123,394,1;124,220,1;125,394,1;126,520,1;127,350,1;128,500,1;129,350,1;130,333,1;131,500,2;133,1000,1;134,500,2;136,333,1;137,1000,1;138,556,1;139,333,1;140,1000,1;141,350,1;142,667,1;143,350,2;145,333,2;147,500,2;149,350,1;150,500,1;151,1000,1;152,333,1;153,1000,1;154,389,1;155,333,1;156,722,1;157,350,1;158,444,1;159,722,1;160,250,1;161,333,1;162,500,4;166,220,1;167,500,1;168,333,1;169,747,1;170,300,1;171,500,1;172,570,1;173,333,1;174,747,1;175,333,1;176,400,1;177,570,1;178,300,2;180,333,1;181,556,1;182,540,1;183,250,1;184,333,1;185,300,1;186,330,1;187,500,1;188,750,3;191,500,1;192,722,6;198,1000,1;199,722,1;200,667,4;204,389,4;208,722,2;210,778,5;215,570,1;216,778,1;217,722,5;222,611,1;223,556,1;224,500,6;230,722,1;231,444,5;236,278,4;240,500,1;241,556,1;242,500,5;247,570,1;248,500,1;249,556,4;253,500,1;254,556,1;255,500,1",
      "times-italic|macroman": "32,250,1;33,333,1;34,420,1;35,500,2;37,833,1;38,778,1;39,214,1;40,333,2;42,500,1;43,675,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,675,3;63,500,1;64,920,1;65,611,2;67,667,1;68,722,1;69,611,2;71,722,2;73,333,1;74,444,1;75,667,1;76,556,1;77,833,1;78,667,1;79,722,1;80,611,1;81,722,1;82,611,1;83,500,1;84,556,1;85,722,1;86,611,1;87,833,1;88,611,1;89,556,2;91,389,1;92,278,1;93,389,1;94,422,1;95,500,1;96,333,1;97,500,2;99,444,1;100,500,1;101,444,1;102,278,1;103,500,2;105,278,2;107,444,1;108,278,1;109,722,1;110,500,4;114,389,2;116,278,1;117,500,1;118,444,1;119,667,1;120,444,2;122,389,1;123,400,1;124,275,1;125,400,1;126,541,1;128,611,2;130,667,1;131,611,1;132,667,1;133,722,2;135,500,6;141,444,5;146,278,4;150,500,11;161,400,1;162,500,3;165,350,1;166,523,1;167,500,1;168,760,2;170,980,1;171,333,2;174,889,1;175,722,1;177,675,1;180,500,2;187,276,1;188,310,1;190,667,1;191,500,2;193,389,1;194,675,1;196,500,1;199,500,2;201,889,1;202,250,1;203,611,2;205,722,1;206,944,1;207,667,1;208,500,1;209,889,1;210,556,2;212,333,2;214,675,1;216,444,1;217,556,1;218,167,1;219,500,1;220,333,2;222,500,3;225,250,1;226,333,1;227,556,1;228,1000,1;229,611,5;234,333,4;238,722,2;241,722,4;245,278,1;246,333,10",
      "times-italic|winansi": "32,250,1;33,333,1;34,420,1;35,500,2;37,833,1;38,778,1;39,214,1;40,333,2;42,500,1;43,675,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,333,2;60,675,3;63,500,1;64,920,1;65,611,2;67,667,1;68,722,1;69,611,2;71,722,2;73,333,1;74,444,1;75,667,1;76,556,1;77,833,1;78,667,1;79,722,1;80,611,1;81,722,1;82,611,1;83,500,1;84,556,1;85,722,1;86,611,1;87,833,1;88,611,1;89,556,2;91,389,1;92,278,1;93,389,1;94,422,1;95,500,1;96,333,1;97,500,2;99,444,1;100,500,1;101,444,1;102,278,1;103,500,2;105,278,2;107,444,1;108,278,1;109,722,1;110,500,4;114,389,2;116,278,1;117,500,1;118,444,1;119,667,1;120,444,2;122,389,1;123,400,1;124,275,1;125,400,1;126,541,1;127,350,1;128,500,1;129,350,1;130,333,1;131,500,1;132,556,1;133,889,1;134,500,2;136,333,1;137,1000,1;138,500,1;139,333,1;140,944,1;141,350,1;142,556,1;143,350,2;145,333,2;147,556,2;149,350,1;150,500,1;151,889,1;152,333,1;153,980,1;154,389,1;155,333,1;156,667,1;157,350,1;158,389,1;159,556,1;160,250,1;161,389,1;162,500,4;166,275,1;167,500,1;168,333,1;169,760,1;170,276,1;171,500,1;172,675,1;173,333,1;174,760,1;175,333,1;176,400,1;177,675,1;178,300,2;180,333,1;181,500,1;182,523,1;183,250,1;184,333,1;185,300,1;186,310,1;187,500,1;188,750,3;191,500,1;192,611,6;198,889,1;199,667,1;200,611,4;204,333,4;208,722,1;209,667,1;210,722,5;215,675,1;216,722,5;221,556,1;222,611,1;223,500,7;230,667,1;231,444,5;236,278,4;240,500,7;247,675,1;248,500,5;253,444,1;254,500,1;255,444,1",
      "times-roman|macroman": "32,250,1;33,333,1;34,408,1;35,500,2;37,833,1;38,778,1;39,180,1;40,333,2;42,500,1;43,564,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,278,2;60,564,3;63,444,1;64,921,1;65,722,1;66,667,2;68,722,1;69,611,1;70,556,1;71,722,2;73,333,1;74,389,1;75,722,1;76,611,1;77,889,1;78,722,2;80,556,1;81,722,1;82,667,1;83,556,1;84,611,1;85,722,2;87,944,1;88,722,2;90,611,1;91,333,1;92,278,1;93,333,1;94,469,1;95,500,1;96,333,1;97,444,1;98,500,1;99,444,1;100,500,1;101,444,1;102,333,1;103,500,2;105,278,2;107,500,1;108,278,1;109,778,1;110,500,4;114,333,1;115,389,1;116,278,1;117,500,2;119,722,1;120,500,2;122,444,1;123,480,1;124,200,1;125,480,1;126,541,1;128,722,2;130,667,1;131,611,1;132,722,3;135,444,11;146,278,4;150,500,11;161,400,1;162,500,3;165,350,1;166,453,1;167,500,1;168,760,2;170,980,1;171,333,2;174,889,1;175,722,1;177,564,1;180,500,2;187,276,1;188,310,1;190,667,1;191,500,1;192,444,1;193,333,1;194,564,1;196,500,1;199,500,2;201,1000,1;202,250,1;203,722,3;206,889,1;207,722,1;208,500,1;209,1000,1;210,444,2;212,333,2;214,564,1;216,500,1;217,722,1;218,167,1;219,500,1;220,333,2;222,556,2;224,500,1;225,250,1;226,333,1;227,444,1;228,1000,1;229,722,1;230,611,1;231,722,1;232,611,2;234,333,4;238,722,2;241,722,4;245,278,1;246,333,10",
      "times-roman|winansi": "32,250,1;33,333,1;34,408,1;35,500,2;37,833,1;38,778,1;39,180,1;40,333,2;42,500,1;43,564,1;44,250,1;45,333,1;46,250,1;47,278,1;48,500,10;58,278,2;60,564,3;63,444,1;64,921,1;65,722,1;66,667,2;68,722,1;69,611,1;70,556,1;71,722,2;73,333,1;74,389,1;75,722,1;76,611,1;77,889,1;78,722,2;80,556,1;81,722,1;82,667,1;83,556,1;84,611,1;85,722,2;87,944,1;88,722,2;90,611,1;91,333,1;92,278,1;93,333,1;94,469,1;95,500,1;96,333,1;97,444,1;98,500,1;99,444,1;100,500,1;101,444,1;102,333,1;103,500,2;105,278,2;107,500,1;108,278,1;109,778,1;110,500,4;114,333,1;115,389,1;116,278,1;117,500,2;119,722,1;120,500,2;122,444,1;123,480,1;124,200,1;125,480,1;126,541,1;127,350,1;128,500,1;129,350,1;130,333,1;131,500,1;132,444,1;133,1000,1;134,500,2;136,333,1;137,1000,1;138,556,1;139,333,1;140,889,1;141,350,1;142,611,1;143,350,2;145,333,2;147,444,2;149,350,1;150,500,1;151,1000,1;152,333,1;153,980,1;154,389,1;155,333,1;156,722,1;157,350,1;158,444,1;159,722,1;160,250,1;161,333,1;162,500,4;166,200,1;167,500,1;168,333,1;169,760,1;170,276,1;171,500,1;172,564,1;173,333,1;174,760,1;175,333,1;176,400,1;177,564,1;178,300,2;180,333,1;181,500,1;182,453,1;183,250,1;184,333,1;185,300,1;186,310,1;187,500,1;188,750,3;191,444,1;192,722,6;198,889,1;199,667,1;200,611,4;204,333,4;208,722,7;215,564,1;216,722,6;222,556,1;223,500,1;224,444,6;230,667,1;231,444,5;236,278,4;240,500,7;247,564,1;248,500,8",
      "zapfdingbats": "32,278,1;33,974,1;34,961,1;35,974,1;36,980,1;37,719,1;38,789,1;39,790,1;40,791,1;41,690,1;42,960,1;43,939,1;44,549,1;45,855,1;46,911,1;47,933,1;48,911,1;49,945,1;50,974,1;51,755,1;52,846,1;53,762,1;54,761,1;55,571,1;56,677,1;57,763,1;58,760,1;59,759,1;60,754,1;61,494,1;62,552,1;63,537,1;64,577,1;65,692,1;66,786,1;67,788,2;69,790,1;70,793,1;71,794,1;72,816,1;73,823,1;74,789,1;75,841,1;76,823,1;77,833,1;78,816,1;79,831,1;80,923,1;81,744,1;82,723,1;83,749,1;84,790,1;85,792,1;86,695,1;87,776,1;88,768,1;89,792,1;90,759,1;91,707,1;92,708,1;93,682,1;94,701,1;95,826,1;96,815,1;97,789,2;99,707,1;100,687,1;101,696,1;102,689,1;103,786,1;104,787,1;105,713,1;106,791,1;107,785,1;108,791,1;109,873,1;110,761,1;111,762,2;113,759,2;115,892,2;117,788,1;118,784,1;119,438,1;120,138,1;121,277,1;122,415,1;123,392,2;125,668,2;128,390,2;130,317,2;132,276,2;134,509,2;136,410,2;138,234,2;140,334,2;161,732,1;162,544,2;164,910,1;165,667,1;166,760,2;168,776,1;169,595,1;170,694,1;171,626,1;172,788,40;212,894,1;213,838,1;214,1016,1;215,458,1;216,748,1;217,924,1;218,748,1;219,918,1;220,927,1;221,928,2;223,834,1;224,873,1;225,828,1;226,924,2;228,917,1;229,930,1;230,931,1;231,463,1;232,883,1;233,836,2;235,867,2;237,696,2;239,874,1;241,874,1;242,760,1;243,946,1;244,771,1;245,865,1;246,771,1;247,888,1;248,967,1;249,888,1;250,831,1;251,873,1;252,927,1;253,970,1;254,918,1",
    };
    // R119-B: THE STANDARD-14 SEEDING — a simple font whose /BaseFont names a
    // core font but carries no parseable /Widths (the viewer-supplies-metrics
    // convention; the whole ReportLab family rides it) seeds its width table
    // by (BaseFont, declared encoding): WinAnsiEncoding -> the WinAnsi byte
    // map, MacRomanEncoding -> the MacRoman map, Symbol/ZapfDingbats -> their
    // built-in maps; an undeclared text font stays blind (the conservative
    // guard). The seeding is strictly additive: fonts with real /Widths or
    // /W keep their parsed tables; subset-prefixed BaseFonts strip to
    // non-core names and stay blind.
    {
      const expand = (rle: string): Map<number, number> => {
        const m = new Map<number, number>();
        for (const run of rle.split(";")) {
          const parts = run.split(",").map(Number);
          for (let k = 0; k < parts[2]; k++) m.set(parts[0] + k, parts[1]);
        }
        return m;
      };
      for (const [objNum, base] of objBaseFont) {
        if (objWidths.has(objNum)) continue;
        if (objDescendant.has(objNum)) continue;
        const enc = objWinAnsi.has(objNum) ? "WinAnsi" : objMacRoman.has(objNum) ? "MacRoman" : "";
        const rle = enc === "" ? STD14[base] ?? null : STD14[`${base}|${enc.toLowerCase()}`] ?? null;
        if (rle === null) continue;
        objWidths.set(objNum, { codeLen: 1, map: expand(rle), def: undefined });
      }
    }
  // R103-C: the space-glyph conditional. Streams that write EXPLICIT
  // standalone space-glyph pieces (the Skia/LO convention: word gaps are
  // glyphs, never bare positioning moves) encode their split-word
  // continuations as bare em-gap moves — the condGap pieces resolve to JOINS
  // there (the space pieces themselves carry the word separation), while
  // streams without space glyphs (the IRS/pdfTeX convention: gaps ride the
  // moves) keep every gap. The decode happens first so the standalone-space
  // detection sees the decoded text.
  const parts = pending.map(({ objNum, pieces: rawPieces }) => {
    const pieces = repairHoistedPrefix(rawPieces); // R112-A: the hoisted-float merge (a no-op unless the seven-guard signature fires)
    // R105-C: this stream's OWN page's font map resolves first; the
    // candidate chain stays the fallback (the page-tree chain — the
    // fontspec.pdf fully-covering collision class)
    const pageMap = pageFonts.get(objNum);
    // R117-A: THE WIDTH-TABLE ADVANCE POST-PASS — each positioned block's
    // projected end x. The pass runs here (after the whole stream walk) so
    // the pageFonts map is fully resolved (the R106-A referenced-resources
    // timing). Blocks group by their exact stamp origin (the pieces of one
    // q/cm/BT context share (px, py)); within a block the advance
    // accumulates the pieces' code widths (Σ width(code)/1000 × ps — the
    // raw's byte pairs under a codeLen-2 Identity-H font, single bytes
    // under a simple font) and the TJ kerns (kern/1000 × ps). ANY
    // unresolvable piece — a font without a width table, a code the table
    // does not cover (width 0 or missing with no default), an odd byte
    // count under a 2-byte pairing — blinds the REST of the block (no bx):
    // a missing table never misfires, it only cures less (the conservative
    // guard). The kern on a piece applies from the block origin (a leading
    // TJ number shifts the whole run; the trailing kern of a finished
    // array is discarded with the walk's own standing rule).
    const widthFor = (font?: string): WidthEntry | undefined => {
      if (!font) return undefined;
      const fo = pageMap?.get(font);
      if (fo === undefined) {
        // R120-C: THE PAGE-MAP-LESS FALLBACK — a part with NO page binding
        // at all (the unbound-stream class) resolves through the candidate
        // chain's first width-carrying object (the position-sorted
        // ownChainFor discipline). A page map that EXISTS but lacks this
        // font stays blind — that is the misbind signal, never a fallback
        // license (the fontspec collision class).
        if (pageMap) return undefined;
        const cands = fCandidates.get(font);
        if (!cands?.length) return undefined;
        for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
          const we = objWidths.get(c.obj);
          if (we) return we;
        }
        return undefined;
      }
      return objWidths.get(fo);
    };
    {
      let origin: number | null = null;
      let originPy: number | null = null;
      let adv = 0;
      let blind = false;
      for (const piece of pieces) {
        if (piece.px === undefined || piece.ps === undefined) { blind = true; origin = null; continue; }
        if (origin === null || originPy === null || Math.abs(piece.px - origin) > 0.01 || (piece.py !== undefined && Math.abs(piece.py - originPy) > 0.01)) {
          origin = piece.px; originPy = piece.py ?? null; adv = 0; blind = false;
        }
        if (blind) continue;
        const we = widthFor(piece.font);
        if (!we) { blind = true; continue; }
        if (piece.kv) adv -= (piece.kv / 1000) * piece.ps; // R120-D: a TJ number displaces by -K/1000 x ps (ISO 32000-1 9.4.3) — the word-gap kerns (-321) move RIGHT
        let codes: number[] | null = null;
        if (piece.kind === "lit") {
          const raw = piece.raw ?? "";
          if (we.codeLen === 2) {
            if (raw.length === 0 || raw.length % 2 !== 0) { blind = true; continue; }
            codes = [];
            for (let i = 0; i < raw.length; i += 2) codes.push(raw.charCodeAt(i) * 256 + raw.charCodeAt(i + 1));
          } else {
            codes = [];
            for (let i = 0; i < raw.length; i++) codes.push(raw.charCodeAt(i));
          }
        } else {
          const hx = piece.hex.replace(/\s+/g, "");
          const per = we.codeLen * 2;
          if (hx.length === 0 || hx.length % per !== 0 || !/^[0-9A-Fa-f]+$/.test(hx)) { blind = true; continue; }
          codes = [];
          for (let i = 0; i < hx.length; i += per) codes.push(parseInt(hx.slice(i, i + per), 16));
        }
        let ok = true;
        // R120-F: the advance modifiers — Tz scales every advance, Tw adds
        // text-space units to every single-byte 0x20 code (the Prawn
        // justification form; ISO 32000-1 9.3 — Tw applies ONLY to
        // single-byte codes)
        const tz = (piece as { tz?: number }).tz ?? 100;
        const twv = (piece as { tw?: number }).tw ?? 0;
        for (const c of codes) {
          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { ok = false; break; }
          adv += ((w / 1000) + (we.codeLen === 1 && c === 32 ? twv : 0)) * piece.ps * (tz / 100);
        }
        if (!ok) { blind = true; continue; }
        (piece as { bx?: number }).bx = origin + adv;
      }
    }
    // R111-A: the OWN-BINDING chain — the pageMap + candidate resolutions
    // (real font bindings), never the global all-cmaps fallback: the loose
    // first-covering walk produced the dvipdfmx/IRS false-cover class (a
    // literal whose bytes happened to pair into a foreign CJK map's codes).
    const ownChainFor = (font?: string): CodeMap[] => {
      if (!font) return [];
      const out: CodeMap[] = [];
      const pageMap = pageFonts.get(objNum);
      if (pageMap) {
        const fontObj = pageMap.get(font);
        if (fontObj !== undefined) {
          const tu = objToTu.get(fontObj);
          if (tu !== undefined) {
            const cm = tuToCmap.get(tu);
            if (cm) out.push(cm);
          }
        }
        if (out.length) return out;
      }
      const cands = fCandidates.get(font);
      if (cands?.length) {
        for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
          const tu = objToTu.get(c.obj);
          if (tu !== undefined) {
            const cm = tuToCmap.get(tu);
            if (cm) out.push(cm);
          }
        }
      }
      return out;
    };
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
            // R110-C: the WinAnsi named-encoding marker on the page path
            // (the Prawn glyph-table form: the table font is page-bound)
            if (objWinAnsi.has(fontObj)) return [WIN_ANSI_CMAP, ...cmapsFor(font)];
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
      if (p.kind === "hex")
        return { p, text: decodeHexString(p.hex, localFor(p.font)), genuine: hexLeadingIsSpace(p.hex, localFor(p.font)), trail: hexTrailingIsSpace(p.hex, localFor(p.font)) };
      // R111-A: the LITERAL-form CID decode — a literal whose font's OWN
      // binding chain resolves a codeLen-2 CMap that FULLY covers its
      // byte-paired codes decodes through it (the Typst 16th-writer class:
      // Identity-H codes as octal-escaped literals, not hex atoms). The
      // full-coverage guard keeps every 1-byte-font literal verbatim.
      if (p.kind === "lit" && p.raw && p.raw.length >= 2 && p.raw.length % 2 === 0) {
        const chain = ownChainFor(p.font);
        for (const cm of chain) {
          if (cm.codeLen !== 2) continue;
          const codes: number[] = [];
          let covered = true;
          for (let i = 0; i < p.raw.length; i += 2) {
            const c = p.raw.charCodeAt(i) * 256 + p.raw.charCodeAt(i + 1);
            if (!cm.map.has(c)) { covered = false; break; }
            codes.push(c);
          }
          if (covered) {
            const text = codes.map((c) => cm.map.get(c) ?? "").join("");
            // R114-B: the cmap branch's leading space IS the writer's own — the ToUnicode declared it
            // R115-B: the TRAILING space is too (the kern/sep duality's mirror form)
            return { p, text, genuine: text.startsWith(" "), trail: text.endsWith(" ") };
          }
        }
      }
      if (p.font && localFor(p.font).includes(MAC_ROMAN_CMAP) && /[^\u0000-\u007f]/.test(p.text)) {
        // R109-D: the cp1252 CHAR-space remap — a MacRoman byte 0x80–0x9F
        // arrives as its WHATWG-"latin1" (= windows-1252) char (0x87 → ‡
        // U+2021), which the old [\u0080-\u00ff] class never matched; the
        // map takes every high byte's DECODED char → the MacRoman reading
        // (the identity zone's entries are no-ops by construction — the
        // QUARTZ 0xD5 quote behavior verbatim)
        return { p, text: [...p.text].map((c) => MAC_ROMAN_LIT_REMAP.get(c) ?? c).join("") };
      }
      // Session 109 (R109-C): the marker-font LITERAL remap — a literal
      // whose font chain resolves a Symbol/ZapfDingbats marker map remaps
      // through it under the covering discipline (every char covered, else
      // the literal stays verbatim — a misbound multi-char word never
      // garbles). The marker tables previously fired only on HEX atoms
      // (decodeHexString's covering rule); the ReportLab bullets are
      // (\267) Tj LITERALS under /F4 = Symbol — pdftotext reads •.
      if (p.font) {
        for (const mk of Object.values(MARKER_TABLES)) {
          if (localFor(p.font).includes(mk) && [...p.text].every((c) => mk.map.has(c.charCodeAt(0)))) {
            return { p, text: [...p.text].map((c) => mk.map.get(c.charCodeAt(0)) ?? c).join("") };
          }
        }
      }
      // R114-B: the non-cmap lit branches — genuine iff the raw's FIRST byte IS the space byte
      // R115-B: trail iff the raw's LAST byte IS the space byte (the trailing-glyph duality)
      return { p, text: p.text, genuine: p.raw !== undefined && p.raw.charCodeAt(0) === 0x20, trail: p.raw !== undefined && p.raw.length > 0 && p.raw.charCodeAt(p.raw.length - 1) === 0x20 };
    });
    // R110-D: the census is SPACE-only — a word-separation space GLYPH is
    // U+0020. The old /^\s+$/ also counted U+00A0 runs (NBSP pieces), and
    // the 15th-writer Prawn class fell in: its Iosevka code font maps
    // 0xCA→U+00A0 and writes NBSP runs (indentation — a NON-BREAKING
    // space, a typographic unit, never a word separator), so every Prawn
    // stream read hasSpaceGlyphs=true and the R103-C join fired on the
    // CHART AXIS TICKS — 14-em absolute repositionings that are separate
    // visual elements, not split-word continuations ("100.0200.0300.0").
    // Measured across the 8-member corpus: every standing member's
    // space-glyph convention rides U+0020 (arXiv 113/113, IRS 129/129,
    // QUARTZ 469/469, ReportLab 315/315; LO Calc 123,382 U+0020 vs 25
    // NBSP — its census never rode the NBSPs); Prawn is 530/530 NBSP,
    // ZERO U+0020 — a no-space-glyph writer whose gaps ride the moves.
    // The join class (the Skia/LO split-word continuation) keeps its
    // U+0020 census verbatim; NBSP-only streams keep every gap.
    const hasSpaceGlyphs = decoded.some(({ text }) => text.length > 0 && /^ +$/.test(text));
    // R115 — THE POSITIONED-SPACE DUALITY FAMILY (the Typst form round — the 16th
    // writer's count-exact FORM defects the r111 count-only pins missed; the count-pin
    // blind spot class, the FOURTH consecutive round — the form probes caught it). The writer emits its OWN word separators (cmap-declared
    // U+0020 or a real 0x20 byte — the R114-B genuine discipline, never the
    // printable-scrub remap) while the separator machinery ALSO fires " " —
    // the doubled-gap forms. Three assembly-space collapse rules, each removing
    // ONLY a " " separator or a redundant space-run text (never "\n", never a
    // join, never a scrub-class space — the pdfTeX \034 guard keeps its double).
    // The EMPTY-piece rule was REFUTED by measurement (the fontspec TOC leaders:
    // an empty glyph run's separator is a real layout gap pdftotext keeps):
    //   R115-A  a piece whose ENTIRE text is the writer's own space (a
    //           POSITIONED space run — the Typst header grid "John"|" "|"Smith")
    //           IS the separator: its own " " sep collapses, and the FOLLOWING
    //           piece's " " sep collapses (the separation was already emitted).
    //   R115-B  a piece whose text ENDS with the writer's own space (the
    //           TRAILING-glyph form — the r115-queued hunt class: Typst's
    //           justified paragraphs write every word gap as the word atom's
    //           trailing space glyph + an adjustment kern; the squeeze kerns
    //           (<= -100) fire our word-gap rule and double with the glyph)
    //           collapses the NEXT piece's " " sep.
    //   R115-C  a space run contributes nothing when the output already ends
    //           whitespace (consecutive space runs — the contacts separator
    //           "  " written as two space-glyph pieces).
    const isSpaceRun = (i: number): boolean => {
      const d = decoded[i] as { genuine?: boolean; text: string } | undefined;
      return d !== undefined && d.genuine === true && d.text.length > 0 && /^ +$/.test(d.text);
    };
    const prevTrail = (i: number): boolean => {
      const d = decoded[i] as { trail?: boolean } | undefined;
      return d !== undefined && d.trail === true;
    };
    let out = "";
    let outTail = ""; // the last emitted char — the R115-C whitespace check (a regex on the growing out would be O(n^2))
    // R117-A: THE SAME-LINE X-GAP COLUMN MOVE — the pre-pass. A stamped pair
    // at a BLOCK BOUNDARY (different stamp origins) on the SAME baseline
    // whose left block's width-tracked end (bx — the /W advance post-pass)
    // sits >= 13 em left of the right block's origin is a COLUMN: pdftotext
    // breaks the line there (measured on the Typst resume: the 7 column
    // splits at true gaps 15.1-42.2 em — title|company, description|dates
    // ×2, cert|year ×2, degree|university), while the highest true-gap JOIN
    // in the corpus measures 11.78 em (the Prawn chart ticks) — the 13-em
    // threshold sits in the measured separation band. Three guards, each
    // born from a measured refutation: the TRAIL license (the left side
    // carries the writer's OWN trailing space — the R115-B trail or the
    // R115-A space run; the ReportLab cover's 33.6-em trailless join), the
    // ALNUM right (>= 2 alphanumeric chars; the IRS "(See instructions.)"
    // bare-period join at 39.8 em), and the JOIN guard (a condGap/condKern
    // resolution never upgrades — the r115 re-breaking refutation). The
    // upgrade REPLACES the writer's trailing-space separation with the
    // newline (the space-run pieces emit nothing, the trail piece's
    // trailing spaces strip) so the line lands CLEAN, exactly as pdftotext
    // reads it — never " \n".
    const upgrade = new Array<boolean>(decoded.length).fill(false);
    const dropText = new Set<number>(); // the space-run pieces an upgrade consumes
    const stripTrail = new Set<number>(); // the left pieces whose trailing writer-space the newline replaces
    for (let i = 1; i < decoded.length; i++) {
      const d = decoded[i] as { p: { px?: number; py?: number; ps?: number; bx?: number; condGap?: boolean; condKern?: boolean }; text: string; genuine?: boolean };
      const e = decoded[i - 1] as { p: { px?: number; py?: number; ps?: number; bx?: number }; text: string };
      const p = d.p, q = e.p;
      if (p.px === undefined || p.py === undefined || p.ps === undefined) continue;
      if (q.px === undefined || q.py === undefined || q.ps === undefined || q.bx === undefined) continue;
      if (Math.abs(q.px - p.px) < 0.01) continue; // the same block — no boundary
      if (Math.abs(q.py - p.py) >= 0.5 * Math.max(q.ps, p.ps)) continue; // a cross-line pair — the R116-A territory
      const gapEm = (p.px - q.bx) / Math.max(q.ps, p.ps);
      if (gapEm < 2.5) continue; // R119-A: the [1, 2.5) em overlap band stays joined (the measured word-level join ceiling is 2.05 em — the arXiv max-join; every corpus pair >= 2.06 em splits)
      // R119-A: the trail license is RETIRED for the >= 2.5 em class — its
      // load-bearing refutation (the ReportLab cover's 33.6-em trailless
      // "join") was exposed by the r118 census as a cross-page adjacency,
      // and the r119 piece-level census reads the trailless population in
      // [2.5, 13) em all-SPLIT (the ReportLab form-field tables cure
      // through it). The walk-back still consumes intervening space runs
      // for the clean emission (the R117-A dropText form).
      let j = i - 1;
      const consumed: number[] = []; // the space runs the upgrade would consume — applied ONLY on success (a rejected upgrade must never drop text: the fusion class)
      while (j >= 0) {
        const dj = decoded[j] as { genuine?: boolean; text: string; trail?: boolean };
        if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { consumed.push(j); j--; continue; }
        break;
      }
      // the alnum guard reads the right BLOCK's whole content — the right side's
      // first piece may be a single-char TJ atom of a multi-char word (the
      // resume's "T"+"e"+"chCorp"), so the count walks the stamp-mates forward
      let alnumRight = 0;
      for (let k = i; k < decoded.length; k++) {
        const dk = decoded[k] as { p: { px?: number; py?: number }; text: string };
        if (dk.p.px === undefined || dk.p.py === undefined) break;
        if (Math.abs((dk.p.px ?? 0) - (p.px ?? 0)) > 0.01 || Math.abs(dk.p.py - p.py!) > 0.01) break; // the block ended
        alnumRight += (dk.text.match(/[A-Za-z0-9]/g) ?? []).length;
      }
      if (alnumRight < 2) continue; // the bare-period refutation
      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades
      if (p.condKern && d.genuine) continue; // the kern collapse never upgrades
      upgrade[i] = true;
      for (const c of consumed) dropText.add(c);
      if (decoded[j] !== undefined && (decoded[j] as { trail?: boolean }).trail === true) stripTrail.add(j);
    }
    // R118-A: THE ICON-ANCHORED SUB-THRESHOLD COLUMN SPLIT — the pre-pass
    // (session 118, the Typst contacts class). pdftotext breaks the line at
    // the phone→mail-icon boundary of the contacts row (the controlled-
    // variant census measured the split GAP-driven, not icon-driven: the
    // no-icons variant still splits, the icons-without-separator variant
    // joins, text-glyph "icons" split identically — the poppler word-gap
    // boundary sits at ~1 em; the separator bisect read 0.944 em joining
    // and 1.056 em splitting). The corpus fire surface (the icon-anchored
    // walk-back census): the Typst contacts pairs SPLIT at 1.06/2.43 em,
    // the Skia em-dash JOINS at 0.89 em, every other member ZERO
    // candidates — the threshold sits at 0.95 em, inside the measured
    // band. The rule: a ZERO-ALNUM CONTENT block (an icon/symbol/
    // punctuation anchor — text.trim() non-empty, no [A-Za-z0-9]; never a
    // space run) at a same-baseline BLOCK BOUNDARY whose walk-back content
    // block A (skipping the intervening genuine space runs) carries a
    // width-tracked end sits >= 0.95 em behind the anchor upgrades the
    // separator to a CLEAN "\n" — the consumed space runs emit nothing
    // (the R117-A dropText form), a left trail strips when present, and
    // the icon then joins the FOLLOWING content at its sub-threshold gap
    // (the measured 0.25 em icon→email boundary keeps its space — pdftotext's
    // exact "<icon> email" line form). The alnum-rich sub-13 em class
    // (the "Jun 2018" 5.1 em pair, the ReportLab 8.7-9.4 em table rows)
    // stays joined — the anchor is the license, not the gap.
    const iconSplit = new Array<boolean>(decoded.length).fill(false);
    const iconDrop = new Set<number>(); // the space runs an icon split consumes
    for (let i = 1; i < decoded.length; i++) {
      const d = decoded[i] as { p: { px?: number; py?: number; ps?: number; condGap?: boolean; condKern?: boolean }; text: string; genuine?: boolean };
      const p = d.p;
      if (p.px === undefined || p.py === undefined || p.ps === undefined) continue;
      // the anchor: a zero-alnum content block — an icon/symbol/punctuation
      // glyph, never a space run (those trim to nothing) and never alnum
      // content (the R117-A territory above 13 em; the anchor class below)
      const bTxt = d.text ?? "";
      if (bTxt.trim().length === 0) continue;
      if (/[A-Za-z0-9]/.test(bTxt)) continue;
      // the adjacent piece must share the anchor's baseline (a cross-line
      // icon pair is the R116-A territory — never doubled)
      const e = decoded[i - 1] as { p: { px?: number; py?: number; ps?: number }; text: string };
      const q = e.p;
      if (q.px === undefined || q.py === undefined || q.ps === undefined) continue;
      if (Math.abs(q.py - p.py) >= 0.5 * Math.max(q.ps, p.ps)) continue;
      // the walk-back over consecutive genuine space runs to the content block A
      let j = i - 1;
      while (j >= 0) {
        const dj = decoded[j] as { genuine?: boolean; text: string };
        if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { j--; continue; }
        break;
      }
      if (j < 0) continue;
      const a = decoded[j] as { p: { px?: number; py?: number; ps?: number; bx?: number }; text: string; trail?: boolean };
      const ap = a.p;
      if (ap.px === undefined || ap.py === undefined || ap.ps === undefined || ap.bx === undefined) continue;
      if (Math.abs(ap.px - p.px) < 0.01) continue; // the same block — no boundary
      if (Math.abs(ap.py - p.py) >= 0.5 * Math.max(ap.ps, p.ps)) continue; // A sits on another line
      const gapEm = (p.px - ap.bx) / Math.max(ap.ps, p.ps);
      if (gapEm < 0.95) continue; // the Skia em-dash band stays joined (0.89 em measured)
      // R120-E: THE LEADER-RUN GUARD — an anchor followed on the same
      // baseline by the SAME anchor text at a regular forward step (the TOC
      // dot leaders, both forms: the fontspec/dvipdfmx same-block run and
      // the IRS per-dot repositioned pieces) is a typographic LEADER
      // bridging the entry to its page number, not an icon separator —
      // pdftotext reads the whole run same-line. The Typst contacts icons
      // lead DIFFERENT content (the phone digits, the email) — the icon
      // class keeps firing.
      {
        const at = d.text.trim();
        let leader = false;
        for (let k = i + 1; k <= i + 2 && k < decoded.length; k++) {
          const nk = decoded[k] as { p: { px?: number; py?: number; ps?: number }; text: string };
          if (nk.p.px === undefined || nk.p.py === undefined || nk.p.ps === undefined) break;
          if (Math.abs(nk.p.py - p.py) >= 0.5 * Math.max(nk.p.ps, p.ps)) break;
          const step = nk.p.px - p.px;
          if (step >= 0 && step <= 3 * Math.max(nk.p.ps, p.ps) && nk.text.trim() === at) { leader = true; break; }
        }
        if (leader) continue;
      }
      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades (the R117-A guard form)
      if (p.condKern && d.genuine) continue; // the kern collapse never upgrades
      iconSplit[i] = true;
      for (let k = j + 1; k < i; k++) iconDrop.add(k); // the consumed space runs — applied ONLY on success
      if (a.trail === true) stripTrail.add(j); // the clean form when the left block trails
    }
    decoded.forEach(({ p, text, genuine }, i) => {
      let sep = p.condGap && hasSpaceGlyphs ? "" : p.condKern && genuine ? "" : p.sep;
      // R116-A: THE CM-CARRIED LINE MOVE — a positioned piece pair whose
      // DEVICE-space y-delta >= 0.5 em (the max-ps denominator — the hoist
      // repair's tolerance precedent) is a line move regardless of WHICH
      // operator carried the position (the Typst q/cm/BT form: every word
      // its own flipped block, the `cm` translation feeding only the R112-A
      // position stamps, never the walk's separator tracker — so a line
      // move read as the standing " " join where every positional reader
      // reads a newline). The upgrade fires ONLY on a " " separator — never
      // on a join (the condGap/kern resolutions above stand), never on an
      // existing "\n" — and only when BOTH pieces carry position stamps
      // (the unpositioned BT-default class stays blind). Sub-em deltas keep
      // the space (the arXiv math-accent class rides sub-em device deltas
      // and every reader keeps them same-line — the r115 refutation
      // constraint, measured: the Typst line steps are 0.75+ em, the accent
      // deltas sub-0.5).
      if (sep === " " && i > 0 && p.py !== undefined && p.ps !== undefined) {
        const q = decoded[i - 1].p;
        if (q.py !== undefined && q.ps !== undefined) {
          if (Math.abs(p.py - q.py) >= 0.5 * Math.max(q.ps, p.ps)) sep = "\n";
        }
      }
      if (sep === " ") {
        if (i > 0 && (isSpaceRun(i - 1) || prevTrail(i - 1))) sep = ""; // R115-A tail / R115-B
        else if (genuine && text.length > 0 && /^ +$/.test(text)) sep = ""; // R115-A head
      }
      if (upgrade[i]) sep = "\n"; // R117-A: the column move overrides the R115 collapses (the space separation it consumed rides the newline)
      if (iconSplit[i]) sep = "\n"; // R118-A: the icon-anchored split overrides the R115 collapses (the consumed space runs ride the newline)
      let emit = text;
      if (dropText.has(i) || iconDrop.has(i)) emit = ""; // R117-A/R118-A: the consumed space-run separators
      else if (stripTrail.has(i)) emit = text.replace(/ +$/, ""); // R117-A/R118-A: the newline replaces the writer's trailing space
      if (emit === text && isSpaceRun(i) && (outTail === " " || outTail === "\n")) emit = ""; // R115-C
      out += sep + emit;
      const tail = sep + emit;
      if (tail.length > 0) outTail = tail[tail.length - 1];
    });
    return out;
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
