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

/** Concatenated text from a PDF's inflated content streams ((…) Tj / TJ arrays). */
async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = new TextDecoder("latin1").decode(bytes);
  const parts: string[] = [];

  // scan every "stream\n…\endstream" pair and try to inflate it
  const streamRe = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(ascii))) {
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    streamRe.lastIndex = end;
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
    if (text) parts.push(pdfTextOperators(text));
  }
  return parts.join("\n");
}

/** Pulls the literal strings out of a content stream's text-showing operators. */
function pdfTextOperators(content: string): string {
  const out: string[] = [];
  // (…) Tj — the single-string show; [ (…) (…) …] TJ — the array form
  const re = /\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    out.push(m[1].replace(/\\([()\\])/g, "$1").replace(/\\n/g, " "));
  }
  return out.join(" ");
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
