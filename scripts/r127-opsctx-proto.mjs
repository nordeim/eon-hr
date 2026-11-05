// r127-opsctx-proto.mjs — a deeper proto patch: each piece carries `opsCtx` —
// the concatenated op TEXTS (the regex match strings) seen since the previous
// show — so every site-2 boundary's exact intervening ops are visible in the
// flat dump.
import { readFileSync, writeFileSync } from "node:fs";

const proto = readFileSync("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts", "utf8");

// 1. module-level state — after the flat debug surface
const A1 = "export const __r117DebugPieces: Array<Record<string, unknown>> = [];";
const R1 = A1 + "\n\n// R127 census: the op-context + show-op stamps\nlet __r127opSeq = 0;\nlet __r127opsCtx = \"\";";
if (!proto.includes(A1)) throw new Error("anchor 1 missing");

// 2. stamp in push()
const A2 = "    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });";
const R2 = "    pieces.push({ op: __r127opSeq, moved, backward, opsCtx: __r127opsCtx, sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });\n    __r127opsCtx = \"\";";
if (!proto.includes(A2)) throw new Error("anchor 2 missing");

// 3. increment opSeq at each show-op match and record ctx ops at the TOP of
//    the walk loop — anchor: the while (m = ops.exec(content)) line
const A6 = "  while ((m = ops.exec(content))) {";
const R6 = "  while ((m = ops.exec(content))) {\n    if (m[4] !== undefined) __r127opSeq++;\n    else if (m[6] !== undefined) __r127opSeq++;\n    else if (m[7] !== undefined) __r127opSeq++;\n    else __r127opsCtx += m[0].replace(/\\s+/g, \" \").slice(0, 60) + \";\";";
if (!proto.includes(A6)) throw new Error("anchor 6 missing");

const pairs = [[A1, R1], [A2, R2], [A6, R6]];
let out = proto;
for (const [a, r] of pairs) {
  if (!out.includes(a)) throw new Error("anchor missing: " + a.slice(0, 60));
  out = out.replace(a, r);
}
writeFileSync("/tmp/r127-opsctx-proto.ts", out);
console.log("patched proto written: /tmp/r127-opsctx-proto.ts");
