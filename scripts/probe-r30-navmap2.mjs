import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const READER = `(() => {
  const out = [];
  const els = [...document.querySelectorAll('aside button, aside a, div.min-h-screen button, div.min-h-screen a')];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.y > 1200) continue;
    out.push({ t: (el.textContent||'').trim().slice(0,22) || el.getAttribute('aria-label') || '[icon]', tag: el.tagName, y: Math.round(r.y), h: Math.round(r.height), x: Math.round(r.x) });
  }
  return JSON.stringify(out);
})()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
