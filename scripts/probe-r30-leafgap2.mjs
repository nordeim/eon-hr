import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session loc set viewport 1440 900");
const READ = `(() => {
  const links = [...document.querySelectorAll('a')];
  const pick = (t) => links.find(a => a.textContent.trim() === t && a.getBoundingClientRect().width > 0);
  const ai = pick('AI HR Assistant'), org = pick('Organogram');
  const btns = [...document.querySelectorAll('button')];
  const settings = btns.find(b => b.textContent.trim() === 'Settings');
  return JSON.stringify({
    lastLeafBottom: org ? Math.round(org.getBoundingClientRect().bottom) : null,
    aiY: ai ? Math.round(ai.getBoundingClientRect().y) : null,
    trailingGap: (ai && org) ? Math.round(ai.getBoundingClientRect().y - org.getBoundingClientRect().bottom) : null,
    settingsY: settings ? Math.round(settings.getBoundingClientRect().y) : null
  });
})()`;
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} open ${s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200"}/organogram`);
  await new Promise(r => setTimeout(r, 3500));
  const d = await evalOn(s, READ);
  console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
