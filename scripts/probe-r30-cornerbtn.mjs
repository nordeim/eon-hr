import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const READER = `(() => {
  const btns = [...document.querySelectorAll('button')];
  const corner = btns.find(b => { const r = b.getBoundingClientRect(); return r.x > 1300 && r.y > 800 && r.width > 0; });
  if (!corner) return JSON.stringify({found:false});
  const cs = getComputedStyle(corner);
  const r = corner.getBoundingClientRect();
  const out = { found: true, t: (corner.textContent||'').trim().slice(0,30), aria: corner.getAttribute('aria-label'), cls: String(corner.className).slice(0,120), r: {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, pos: cs.position, bg: cs.backgroundColor, title: corner.getAttribute('title'), html: corner.outerHTML.slice(0,300) };
  return JSON.stringify(out);
})()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
