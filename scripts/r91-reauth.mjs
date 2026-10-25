#!/usr/bin/env node
// r91-reauth.mjs — re-auth a session on the REF or LOC after a daemon bounce.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 600));
run(`agent-browser --session ${session} click 'button[type=submit]'`);
await new Promise(r => setTimeout(r, 5000));
const url = run(`agent-browser --session ${session} get url`).trim();
console.log(`${side} session now at: ${url}`);
process.exit(0);
