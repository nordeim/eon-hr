#!/usr/bin/env node
// r93-loc-reauth.mjs — re-auth the loc session on :3200 (the fill-settle-click pattern).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

run(`agent-browser --session loc close 2>/dev/null; true`);
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 400));
run(`agent-browser --session loc fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session loc click 'button[type=submit]'`);
await new Promise((r) => setTimeout(r, 5000));
console.log("loc session:", run(`agent-browser --session loc get url`).trim());
