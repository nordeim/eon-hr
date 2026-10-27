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

async function inflate(bytes: Uint8Array, format: "deflate-raw" | "deflate"): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
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

/** A text-showing operand: a literal string (already unescaped) or raw hex. */
type TextAtom = { kind: "lit"; text: string } | { kind: "hex"; hex: string };

/**
 * Pulls the text operands out of a content stream's text-showing operators.
 * Session 97 (R97-A): the literal forms — (…) Tj|TJ|'|" and the TJ array.
 * Session 99 (R99-B): the HEX forms — <…> Tj|TJ|'|" and hex atoms inside
 * TJ arrays (the W3C dummy.pdf / subset-font writer shape; the hex decodes
 * later, through the file's ToUnicode CMaps when they cover its codes).
 */
function pdfTextAtoms(content: string): TextAtom[] {
  const atoms: TextAtom[] = [];
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
  // The three operand shapes, reading order preserved:
  //   1. (…) Tj|TJ|'|" — the string directly followed by the operator
  //   2. [ … ] TJ — the ARRAY form: a body of (…) atoms, <hex> atoms,
  //      positioning numbers, and whitespace
  //   3. <hex> Tj|TJ|'|" — the hex string directly followed by the operator
  const re =
    /\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    if (m[1] !== undefined) {
      atoms.push({ kind: "lit", text: unescape(m[1]) });
    } else if (m[2] !== undefined) {
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
      let a: RegExpExecArray | null;
      while ((a = atomRe.exec(m[2]))) {
        atoms.push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) } : { kind: "hex", hex: a[2] });
      }
    } else if (m[3] !== undefined) {
      atoms.push({ kind: "hex", hex: m[3] });
    }
  }
  return atoms;
}

/** Concatenated text from a PDF's inflated content streams ((…) Tj / TJ arrays / hex strings). */
async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = new TextDecoder("latin1").decode(bytes);
  // Two-phase (R99-B): a file's ToUnicode CMap stream can FOLLOW its
  // content streams (the W3C dummy.pdf has the CMap last), so hex atoms
  // decode only after every stream has been walked.
  const cmaps: CodeMap[] = [];
  const pending: TextAtom[][] = [];

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
        text = new TextDecoder().decode(await inflate(trimmed, "deflate"));
        break;
      } catch {
        try {
          text = new TextDecoder().decode(await inflate(trimmed, "deflate-raw"));
          break;
        } catch {
          text = "";
        }
      }
    }
    if (!text) continue;
    // R99-B: a stream carrying bfchar/bfrange markers is a ToUnicode CMap —
    // collect it as a map, never mine it for text operators
    if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
      const cm = parseToUnicode(text);
      if (cm) cmaps.push(cm);
      continue;
    }
    const atoms = pdfTextAtoms(text);
    if (atoms.length) pending.push(atoms);
  }
  const parts = pending.map((atoms) =>
    atoms.map((at) => (at.kind === "hex" ? decodeHexString(at.hex, cmaps) : at.text)).join(" ")
  );
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
