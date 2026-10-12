import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const READER = `(() => JSON.stringify([...document.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return { t: (b.textContent||'').trim().slice(0,18), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })))()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
