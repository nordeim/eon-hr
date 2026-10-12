import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const READER = `(() => {
  const aside = document.querySelector('aside');
  if (!aside) return JSON.stringify({aside:false});
  const els = [...aside.querySelectorAll('button, a')];
  const out = [];
  let prevY = 0;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const y = Math.round(r.y), h = Math.round(r.height);
    if (r.width === 0 || y > 1200) continue;
    const gap = y - prevY;
    out.push({ t: (el.textContent||'').trim().slice(0,20) || el.getAttribute('aria-label') || '[icon]', y, h, gap: gap !== h ? gap - h : 0 });
    prevY = y + h;
  }
  return JSON.stringify(out);
})()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d, null, 0).replace(/\},\{/g, '}\n{'));
}
