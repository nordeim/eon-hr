// r127-opseq-proto.mjs — materialize a patched proto that stamps each piece
// with the SHOW-OP SEQUENCE number (opSeq): pieces from the same TJ array
// share opSeq; separate Tj/TJ show ops increment it. The census then separates
// the TWO standing-join classes: TJ-internal-no-number (the W3C dummy.pdf
// pin) vs separate-show-ops (the matplotlib ﬀ class — no positioning between
// shows, the pen continues).
import { readFileSync, writeFileSync } from "node:fs";

const proto = readFileSync("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts", "utf8");

// 1. module-level opSeq counter — anchor: the flat debug surface block
const A1 = "export const __r117DebugPieces: Array<Record<string, unknown>> = [];";
const R1 = A1 + "\n\n// R127 census: the show-op sequence stamp\nlet __r127opSeq = 0;";
if (!proto.includes(A1)) throw new Error("anchor 1 missing");

// 2. stamp in push() — anchor: the pieces.push line inside push()
const A2 = "    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });";
const R2 = "    pieces.push({ op: __r127opSeq, moved, backward, sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });";
if (!proto.includes(A2)) throw new Error("anchor 2 missing");

// 3. increment at each show-op match: the m[4] literal-show handler, the m[6]
//    TJ-array handler, the m[7] hex-show handler. Anchors:
const A3 = '    if (m[4] !== undefined) {\n      const text = unescape(m[4]);';
const R3 = '    if (m[4] !== undefined) {\n      __r127opSeq++;\n      const text = unescape(m[4]);';
const A4 = '    if (m[6] !== undefined) {\n      // The TJ array:';
const R4 = '    if (m[6] !== undefined) {\n      __r127opSeq++;\n      // The TJ array:';
const A5 = '    if (m[7] !== undefined) {\n      const hex = m[7];';
const R5 = '    if (m[7] !== undefined) {\n      __r127opSeq++;\n      const hex = m[7];';

const pairs = [[A1, R1], [A2, R2], [A3, R3], [A4, R4], [A5, R5]];
let out = proto;
for (const [a, r] of pairs) {
  if (!out.includes(a)) throw new Error("anchor missing: " + a.slice(0, 60));
  out = out.replace(a, r);
}
writeFileSync("/tmp/r127-opseq-proto.ts", out);
console.log("patched proto written: /tmp/r127-opseq-proto.ts");
