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
  };
  // The operator walk, left to right — the alternation order guarantees a
  // string/array match consumes its whole body before any inner fragment
  // could re-match (the same guarantee the old single regex relied on):
  //   1: Tf size | 2,3: Td/TD tx,ty | the T* line-op | 4,5: literal show +
  //   operator | 6: the TJ-array body | 7,8: hex show + operator | 9-14: the
  //   Tm operands a b c d e f (the R103-B position-aware form)
  const ops =
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;
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
      pendingEm += Math.abs(tx) / effSize;
      // R103-B: a Td BEFORE any show in the fresh run carries a baseline
      // placement (the Skia constant-baseline class) — its ty is not a line
      // move; between shows the ty keeps the standing line-move rule
      if (shownSinceTm) pendingTy += parseFloat(m[3]);
      moved = true;
      if (tx < 0) backward = true;
      continue;
    }
    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
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
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a: RegExpExecArray | null;
      let kern = 0; // SIGNED sum of consecutive numbers since the last atom
      while ((a = atomRe.exec(m[6]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern !== 0) {
            moved = true;
            pendingEm = kern <= -100 ? 1.0 : 0; // the negative gap fires the space rule; a kern (either sign, under the boundary) joins
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
  const pending: TextPiece[][] = [];
  // Session 102 (R102-B): the font chain — /F-name → font object →
  // /ToUnicode object. Multi-font subset files (the real LibreOffice form:
  // 15 fonts, every one restarting its glyph codes at <01>) need each
  // font's atoms decoded through that font's OWN CMap; the first-covering
  // rule reads them through the wrong map. All three scans ride the RAW
  // ascii (object headers are never compressed in this writer family);
  // the third link (objNum → CMap) fills in during the stream walk.
  const fToObj = new Map<string, number>();
  for (const fm of ascii.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fToObj.set(fm[1], parseInt(fm[2], 10));
  const objToTu = new Map<number, number>();
  for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
    if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
    const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) objToTu.set(parseInt(fm[1], 10), parseInt(tu[1], 10));
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
    if (pieces.length) pending.push(pieces);
  }
  // R100-A: each piece carries its own leading separator (decided by the
  // positioning between shows); the hex pieces decode through the collected
  // CMaps (the two-phase R99-B contract) — R102-B: through their OWN font's
  // CMap first when the /F-name → font object → /ToUnicode chain resolves,
  // with the standing first-covering walk as the fallback (files without
  // the chain keep the previous behavior verbatim)
  const cmapsFor = (font?: string): CodeMap[] => {
    if (font) {
      const obj = fToObj.get(font);
      const tu = obj !== undefined ? objToTu.get(obj) : undefined;
      const cm = tu !== undefined ? tuToCmap.get(tu) : undefined;
      if (cm) return [cm, ...cmaps];
    }
    return cmaps;
  };
  // R103-C: the space-glyph conditional. Streams that write EXPLICIT
  // standalone space-glyph pieces (the Skia/LO convention: word gaps are
  // glyphs, never bare positioning moves) encode their split-word
  // continuations as bare em-gap moves — the condGap pieces resolve to JOINS
  // there (the space pieces themselves carry the word separation), while
  // streams without space glyphs (the IRS/pdfTeX convention: gaps ride the
  // moves) keep every gap. The decode happens first so the standalone-space
  // detection sees the decoded text.
  const parts = pending.map((pieces) => {
    const decoded = pieces.map((p) => ({ p, text: p.kind === "hex" ? decodeHexString(p.hex, cmapsFor(p.font)) : p.text }));
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
