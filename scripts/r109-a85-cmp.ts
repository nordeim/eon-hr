#!/usr/bin/env bun
// r109-a85-cmp.ts — byte-compare my ascii85Decode against python's
// authoritative decode on the same armored stream.
import { readFileSync, writeFileSync } from "node:fs";

function ascii85Decode(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let group: number[] = [];
  let started = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === 32 || c === 9 || c === 10 || c === 13 || c === 12 || c === 0) continue;
    if (!started && c === 60) {
      if (i + 1 < input.length && input[i + 1] === 126) { i++; started = true; continue; }
    }
    if (c === 126) break;
    if (c === 122 && group.length === 0) { out.push(0, 0, 0, 0); continue; }
    if (c < 33 || c > 117) throw new Error("ascii85: bad char " + c);
    group.push(c - 33);
    if (group.length === 5) {
      let v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
      out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
      group = [];
    }
  }
  if (group.length) {
    const n = group.length;
    while (group.length < 5) group.push(84);
    const v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
    const bytes = [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
    for (let i = 0; i < n - 1; i++) out.push(bytes[i]);
  }
  return Uint8Array.from(out);
}

const armor = new Uint8Array(readFileSync("/tmp/r109-armor.bin"));
const ref = new Uint8Array(readFileSync("/tmp/r109-a85-ref.bin"));
const mine = ascii85Decode(armor);
console.log(`armor ${armor.length}B → mine ${mine.length}B, ref ${ref.length}B`);
let firstDiff = -1;
for (let i = 0; i < Math.min(mine.length, ref.length); i++) {
  if (mine[i] !== ref[i]) { firstDiff = i; break; }
}
console.log(firstDiff < 0 ? (mine.length === ref.length ? "IDENTICAL" : `same prefix, length differs (${mine.length} vs ${ref.length})`) : `first diff at ${firstDiff}: mine=${mine[firstDiff]?.toString(16)} ref=${ref[firstDiff]?.toString(16)}`);
// the tail comparison
console.log("mine tail:", Buffer.from(mine.slice(-8)).toString("hex"));
console.log("ref tail: ", Buffer.from(ref.slice(-8)).toString("hex"));
// check the armor's tail chars
console.log("armor tail chars:", Array.from(armor.slice(-6)).map((c) => String.fromCharCode(c)).join(""));
// does the armor contain 'z'?
let zCount = 0;
for (const c of armor) if (c === 122) zCount++;
console.log("'z' chars in armor:", zCount);
