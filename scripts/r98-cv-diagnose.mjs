#!/usr/bin/env node
// r98-cv-diagnose.mjs — decompose extractPdfText step-by-step IN THE LIVE
// PAGE to find which step fails (boundary scan / inflate / operators /
// meaningfulness guard).
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
const S = "r98diag";

const b64 = fs.readFileSync("/tmp/r98-real-cv.pdf").toString("base64");

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);

const diag = `(() => {
  const b64 = "${b64}";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const steps = {};
  try {
    const ascii = new TextDecoder("latin1").decode(bytes);
    steps.latin1 = "ok len=" + ascii.length;
    const streamRe = /stream\\r?\\n/g;
    const found = [];
    let m;
    while ((m = streamRe.exec(ascii))) {
      const start = m.index + m[0].length;
      const end = ascii.indexOf("endstream", start);
      if (end < 0) break;
      streamRe.lastIndex = end + 9;
      found.push([start, end]);
    }
    steps.streams = "count=" + found.length;
    window.__chunks = found.map(([s, e]) => {
      let chunkEnd = e;
      if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
      else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
      return bytes.subarray(s, chunkEnd);
    });
    steps.chunkSizes = window.__chunks.map(c => c.length).join(",");
  } catch (e) { steps.scan = "FAIL:" + e.message; }
  return JSON.stringify(steps);
})()`;
const r1 = run(`agent-browser --session ${S} eval ${JSON.stringify(diag.replace(/\n/g, " "))}`);
console.log("scan:", r1.trim().slice(0, 300));

// now inflate each chunk
const inflateEval = `(async () => {
  const out = [];
  for (let i = 0; i < window.__chunks.length; i++) {
    const chunk = window.__chunks[i];
    try {
      const stream = new Blob([chunk]).stream().pipeThrough(new DecompressionStream("deflate"));
      const buf = new Uint8Array(await new Response(stream).arrayBuffer());
      const text = new TextDecoder().decode(buf);
      out.push({ i, ok: true, len: buf.length, head: text.slice(0, 80) });
    } catch (e) {
      out.push({ i, ok: false, err: String(e.message || e).slice(0, 80) });
    }
  }
  return JSON.stringify(out);
})()`;
const r2 = run(`agent-browser --session ${S} eval ${JSON.stringify(inflateEval.replace(/\n/g, " "))}`);
console.log("inflate:", r2.trim().slice(0, 600));
run(`agent-browser --session ${S} close`);
