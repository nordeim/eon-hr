#!/usr/bin/env node
// r88-cluster-probe.mjs — deep-probe the diff clusters on this round's
// target routes: per cluster bbox, the elementFromPoint chain + the text
// digest + the key members' geometry/classes both sides.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

// route → the clusters to probe (x, y centers from the diff grid)
const TARGETS = {
  attendancedashboard: [[910, 80], [320, 450], [320, 740], [940, 450], [1140, 800]],
  tenantsetup: [[520, 220], [560, 470], [660, 370], [520, 720]],
  reports: [[320, 320], [560, 510], [360, 220], [880, 210], [320, 750]],
  hrreports: [[380, 420], [1050, 800], [1160, 40], [1290, 60]],
  shiftswap: [[320, 220], [610, 220], [890, 220], [1180, 220]],
  companywall: [[470, 470], [470, 720], [540, 350]],
};

for (const [route, clusters] of Object.entries(TARGETS)) {
  console.log(`\n############ ${route} ############`);
  for (const [name, session, base] of [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]]) {
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3000));
    const reads = [];
    for (const [cx, cy] of clusters) {
      const read = await evalOn(session, `(() => {
        const el = document.elementFromPoint(${cx}, ${cy});
        if (!el) return { pt: [${cx}, ${cy}], none: true };
        const chain = [];
        let n = el;
        for (let i = 0; i < 6 && n && n !== document.body; i++) {
          const r = n.getBoundingClientRect();
          chain.push({ tag: n.tagName, cls: String(n.getAttribute('class')||'').split(' ').slice(0,6).join(' ').slice(0,90), txt: (n.textContent||'').trim().slice(0,40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
          n = n.parentElement;
        }
        return { pt: [${cx}, ${cy}], chain };
      })()`);
      reads.push(read);
    }
    console.log(`--- ${name} ---`);
    for (const r of reads) console.log(JSON.stringify(r));
  }
}
process.exit(0);
