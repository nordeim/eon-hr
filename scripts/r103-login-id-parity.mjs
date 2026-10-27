#!/usr/bin/env node
// r103-login-id-parity.mjs — the neo-crm session-192 methodology transfer:
// the id/for literal-parity census on the login surface. Read the REF's live
// input ids + label wiring, then the clone's, and compare.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }

const READ = `(() => { const inputs=[...document.querySelectorAll('input')].map(i=>({id:i.id, type:i.type, name:i.name, autoComplete:i.getAttribute('autocomplete'), labelledBy: i.getAttribute('aria-labelledby'), inc: i.labels?.length ? (i.labels[0].getAttribute('for')||'') : ''})); const labels=[...document.querySelectorAll('label')].map(l=>({for:l.getAttribute('for'), text:(l.textContent||'').trim().slice(0,30)})); return JSON.stringify({inputs, labels}); })()`;

// ---- the REF side ----
const R = "ref103ids";
run(`agent-browser --session ${R} close 2>/dev/null; true`);
run(`agent-browser --session ${R} set viewport 1440 900`);
run(`agent-browser --session ${R} open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 4000));
const ref = run(`agent-browser --session ${R} eval "${READ.replace(/"/g, '\\"')}"`);
console.log("REF login ids:", ref.trim().slice(0, 800));
run(`agent-browser --session ${R} close`);

// ---- the clone side ----
const L = "loc103ids";
run(`agent-browser --session ${L} close 2>/dev/null; true`);
run(`agent-browser --session ${L} set viewport 1440 900`);
run(`agent-browser --session ${L} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3500));
const loc = run(`agent-browser --session ${L} eval "${READ.replace(/"/g, '\\"')}"`);
console.log("clone login ids:", loc.trim().slice(0, 800));
run(`agent-browser --session ${L} close`);
