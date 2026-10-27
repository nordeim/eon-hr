// probe-r101-prototype.mjs — validate the TJ-internal kern-gap threshold fix
// BEFORE planning: patch pdfTextPieces's array walk in-memory (a copy of the
// logic), run the three real files + the corpus fixtures through it, and
// compare yields (the r100-prototype pattern).
//
// THE FIX UNDER TEST: inside a TJ array, the inter-atom numbers are
// thousandths of text space — |N| ≥ 100 (0.1 em) is a word gap (pdfTeX's
// 209–442, the R97 fixture's 120); under is a kern (Word ≤ 11, Adobe ≤ 92,
// pdfTeX ≤ 52) — join without a space. Consecutive numbers SUM (the spec
// allows them; the |sum| decides). Adjacent atoms with no number keep the
// standing space join.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const WIN_ANSI_HIGH = {
  0x80: "\u20AC", 0x82: "\u201A", 0x83: "\u0192", 0x84: "\u201E", 0x85: "\u2026",
  0x86: "\u2020", 0x87: "\u2021", 0x88: "\u02C6", 0x89: "\u2030", 0x8a: "\u0160",
  0x8b: "\u2039", 0x8c: "\u0152", 0x8e: "\u017D", 0x91: "\u2018", 0x92: "\u2019",
  0x93: "\u201C", 0x94: "\u201D", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014",
  0x98: "\u02DC", 0x99: "\u2122", 0x9a: "\u0161", 0x9b: "\u203A", 0x9c: "\u0153",
  0x9e: "\u017E", 0x9f: "\u0178",
};
const latin1Printable = (code) => {
  const high = WIN_ANSI_HIGH[code];
  if (high !== undefined) return high;
  return (code >= 32 && code < 127) || code >= 0xa0 ? String.fromCharCode(code) : " ";
};

// the PROTOTYPE walk — a copy of cv-text.ts's pdfTextPieces with ONLY the
// TJ-array internals changed (the threshold rule)
function pdfTextPiecesProto(content) {
  const pieces = [];
  const unescape = (s) =>
    s.replace(
      /\\(?:([0-7]{1,3})|([nrtbf])|([()\\])|(\r?\n))/g,
      (_match, oct, ws, lit, eol) => {
        if (oct !== undefined) return latin1Printable(parseInt(oct, 8) % 256);
        if (ws !== undefined) return " ";
        if (lit !== undefined) return lit;
        return eol !== undefined ? "" : _match;
      }
    );
  let effSize = 1, pendingEm = 0, pendingTy = 0, moved = false, backward = false;
  const reset = () => { pendingEm = 0; pendingTy = 0; moved = false; backward = false; };
  const push = (piece) => {
    let sep = " ";
    if (moved) {
      if (pendingTy !== 0) sep = "\n";
      else if (backward || pendingEm >= 1.0) sep = " ";
      else sep = "";
    }
    if (pieces.length === 0) sep = "";
    pieces.push({ sep, ...piece });
    reset();
  };
  const ops =
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|Tm/g;
  let m;
  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) { effSize = parseFloat(m[1]) || 1; continue; }
    if (m[2] !== undefined) {
      const tx = parseFloat(m[2]);
      pendingEm += Math.abs(tx) / effSize;
      pendingTy += parseFloat(m[3]);
      moved = true;
      if (tx < 0) backward = true;
      continue;
    }
    if (m[0] === "T*") { moved = true; pendingTy = 1; continue; }
    if (m[4] !== undefined) {
      const text = unescape(m[4]);
      if (m[5] === "'" || m[5] === '"') { pieces.push({ sep: pieces.length === 0 ? "" : "\n", kind: "lit", text }); reset(); }
      else push({ kind: "lit", text });
      continue;
    }
    if (m[6] !== undefined) {
      // === THE PROTOTYPE: atoms AND numbers walk together; the |sum| of
      // consecutive numbers decides: ≥ 100 (0.1 em) = a word gap → the
      // space rule; under = a kern → join; none = the standing space join
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a; let kern = 0;
      while ((a = atomRe.exec(m[6]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern > 0) {
            moved = true;
            pendingEm = kern >= 100 ? 1.0 : 0;
          }
          push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) } : { kind: "hex", hex: a[2] });
          kern = 0;
        } else {
          kern += Math.abs(parseFloat(a[3]));
        }
      }
      continue;
    }
    if (m[7] !== undefined) {
      const hex = m[7];
      if (m[8] === "'" || m[8] === '"') { pieces.push({ sep: pieces.length === 0 ? "" : "\n", kind: "hex", hex }); reset(); }
      else push({ kind: "hex", hex });
      continue;
    }
    reset();
  }
  return pieces;
}

// the rest of the pipeline (hex decode simplified for the literal corpus —
// the three r101 files are literal-based; the CMap path is untouched)
async function extractProto(path) {
  const buf = readFileSync(path);
  const ascii = Buffer.from(buf).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  const parts = [];
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
    const chunk = buf.subarray(start, chunkEnd);
    let text = "";
    try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
      try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
    }
    if (!text || text.includes("beginbfchar") || text.includes("beginbfrange")) continue;
    const pieces = pdfTextPiecesProto(text);
    if (pieces.length) parts.push(pieces.map((p) => p.sep + (p.kind === "hex" ? "" : p.text)).join(""));
  }
  return parts.join("\n");
}

// (1) the fixture checks (the regression net — must ALL hold)
const FIXTURES = [
  ["BT /F1 12 Tf [(Senior HR Manager) -120 (with payroll, GOSI, and compliance skills)] TJ ET",
    "Senior HR Manager with payroll, GOSI, and compliance skills"],
  ["BT /F1 12 Tf [(Senior HR Manager) -250 (with GOSI)] TJ [(and payroll)] TJ ET",
    "Senior HR Manager with GOSI and payroll"],
  ["BT [(Senior HR \\(Manager\\) with payroll, GOSI, onboarding, and compliance skills)] TJ ET",
    "Senior HR (Manager) with payroll, GOSI, onboarding, and compliance skills"],
];
for (const [content, expect] of FIXTURES) {
  const got = pdfTextPiecesProto(content).map((p) => p.sep + p.text).join("");
  console.log(`fixture ${got === expect.replace(/, /g, ", ") ? "OK  " : "DIFF "} :: ${JSON.stringify(got.slice(0, 90))}`);
}

// (2) the real-file ground truth
for (const p of process.argv.slice(2)) {
  const text = await extractProto(p);
  const alnum = text.replace(/[^A-Za-z0-9]/g, "");
  const soup = (text.match(/\b[A-Za-z] [A-Za-z] [A-Za-z] /g) ?? []).length;
  console.log(`\n${p.split("/").pop()}: len=${text.length} alnum=${alnum.length} soupRuns=${soup}`);
  console.log(`  head: ${JSON.stringify(text.slice(0, 260))}`);
}
