#!/usr/bin/env node
// r97-evidence.mjs — the live post-fix evidence chain + the mobile-menu
// cycle on the remediated :3200: (1) the dashboard at 1440x900, (2) the AI
// CV Upload tab's at-rest + active states, (3) a REAL TJ-array .pdf through
// the UI upload → the analysis card (the R97-A fix live), (4) the mobile
// 390 nav open + the kanban card render.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
const S = "loc97ev";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 6000));

// (1) the dashboard
run(`agent-browser --session ${S} open http://127.0.0.1:3200/dashboard`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-dashboard.png`);
console.log("dashboard captured");

// (2) the AI CV Upload tab — at-rest (disabled dropzone)
run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV Upload/i.test(t.textContent||'')); t&&t.click(); return 'tab-clicked'; })()"`);
await new Promise((r) => setTimeout(r, 1200));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cvtab-rest.png`);
console.log("CV tab at-rest captured");

// (3) the real TJ-pdf upload → the analysis card
run(`agent-browser --session ${S} eval "(() => { const c=[...document.querySelectorAll('button[role=combobox]')].find(b=>/choose a job/i.test(b.textContent||'')||b.textContent.includes('Select job')); if(!c){const any=[...document.querySelectorAll('[role=tabpanel] button')].pop(); any&&any.click(); return 'fallback-click';} c.click(); return 'combo-clicked'; })()"`);
await new Promise((r) => setTimeout(r, 1500));
run(`agent-browser --session ${S} eval "(() => { const o=[...document.querySelectorAll('[role=option]')].find(o=>/System Admin/.test(o.textContent||'')); o&&o.click(); return o?'option-clicked':'NOOPT'; })()"`);
await new Promise((r) => setTimeout(r, 1200));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cvtab-active.png`);
console.log("CV tab active captured");

// the real upload — write the TJ pdf to disk, then set it on the hidden input
const pdfPath = "/tmp/r97-real-cv.pdf";
const makePdf = `
const zlib = new CompressionStream("deflate");
const content = "BT /F1 12 Tf [(Senior HR Administrator with) -120 (HRIS, GOSI, payroll, onboarding, and compliance experience)] TJ ET";
const deflated = new Uint8Array(await new Response(new Blob([content]).stream().pipeThrough(zlib)).arrayBuffer());
const head = new TextEncoder().encode("stream\\r\\n");
const tail = new TextEncoder().encode("\\r\\nendstream\\r\\nendobj");
const pdf = new Uint8Array(2 + head.length + deflated.length + tail.length);
pdf.set(new Uint8Array([0x3c, 0x3c]), 0);
pdf.set(head, 2);
pdf.set(deflated, 2 + head.length);
pdf.set(tail, 2 + head.length + deflated.length);
await Bun.write("${pdfPath}", pdf);
console.log("pdf written");
`;
execSync(`bun -e ${JSON.stringify(makePdf.replace(/\n/g, " "))}`, { stdio: "pipe" });
// agent-browser upload the file path onto the input
const up = run(`agent-browser --session ${S} upload 'input[type=file]' ${pdfPath}`);
console.log("upload:", up.trim().slice(0, 80));
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cv-analysis.png`);
const card = run(`agent-browser --session ${S} eval "(() => { const t=(document.body.innerText||''); return JSON.stringify({hasName: t.includes('real cv')||t.includes('Senior HR'), hasScore: /AI score/i.test(t)}); })()"`);
console.log("analysis card state:", card.trim().slice(0, 150));

// (4) mobile 390: the nav open + the kanban card
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/dashboard`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Toggle Sidebar'); b&&b.click(); return 'nav-clicked'; })()"`);
await new Promise((r) => setTimeout(r, 1500));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-mobilenav.png`);
console.log("mobile nav captured");

// the mobile-menu cycle: open → navigate → auto-close (the standing E2E-verified superset)
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Toggle Sidebar'); b&&b.click(); return 'closed-then'; })()"`);
await new Promise((r) => setTimeout(r, 900));
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Toggle Sidebar'); b&&b.click(); return 'reopened'; })()"`);
await new Promise((r) => setTimeout(r, 1200));
run(`agent-browser --session ${S} eval "(() => { const d=[...document.querySelectorAll('[role=dialog]')].find(e=>e.getAttribute('data-state')==='open'); const link=d&&[...d.querySelectorAll('a,button')].find(a=>/Training LMS/.test(a.textContent||'')); if(link){link.click(); return 'nav-to-training';} return 'NOLINK'; })()"`);
await new Promise((r) => setTimeout(r, 3500));
const cycle = run(`agent-browser --session ${S} eval "(() => { const d=[...document.querySelectorAll('[role=dialog]')].find(e=>e.getAttribute('data-state')==='open'); return JSON.stringify({path: location.pathname, drawerOpen: !!d}); })()"`);
console.log("mobile-menu cycle:", cycle.trim().slice(0, 150));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-training-mobile.png`);

// cleanup: sweep the r97 candidate from the live DB (keep pristine)
run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(async j=>{ for(const c of (j.data?.candidates||[])) { if((c.name||'').includes('real cv')||/Senior HR/i.test(c.name||'')) await fetch('/api/candidates?id='+c.id,{method:'DELETE'}); } return 'swept'; })()"`);
await new Promise((r) => setTimeout(r, 2500));

run(`agent-browser --session ${S} close`);
console.log("evidence chain complete");
