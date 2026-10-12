import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const READER = `(() => {
  const sc = document.querySelector('aside div.overflow-y-auto, div.overflow-y-auto');
  const out = {};
  if (sc) { out.scroll = { top: sc.scrollTop, sh: sc.scrollHeight, ch: sc.clientHeight }; }
  const btns = [...document.querySelectorAll('button')];
  const settings = btns.find(b => b.textContent.trim() === 'Settings');
  if (settings) { const r = settings.getBoundingClientRect(); out.settings = { y: Math.round(r.y), h: Math.round(r.height), fs: getComputedStyle(settings).fontSize }; }
  return JSON.stringify(out);
})()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
