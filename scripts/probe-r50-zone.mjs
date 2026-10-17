#!/usr/bin/env node
// probe-r50-zone.mjs — targeted REF re-reads for the ambiguous zones this
// round: notificationpreferences switch rows, staffrequests tab+table,
// payrollmodule table card, surveys stat text, shiftswap stat wrappers.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 160); } }
async function evalOn(expr) {
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ref eval ${JSON.stringify(oneLine)}`);
  const t = out.trim();
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; }
}
const open = async (route, ms) => { run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, ms)); };

const npSwitches = `(() => {
  const rows = [...document.querySelectorAll('button[role=switch]')].map(b => {
    const row = b.closest('div[class*=flex]');
    const label = row ? row.textContent.trim().replace(/\\s+/g,' ').slice(0,60) : '';
    const svg = row && row.querySelector('svg');
    return { on: b.getAttribute('aria-checked'), label, svgCls: svg ? svg.getAttribute('class') : null, rowCls: row ? row.getAttribute('class').slice(0,90) : null };
  });
  return rows;
})()`;

const srZone = `(() => {
  const tablist = document.querySelector('[role=tablist]');
  const tbl = document.querySelector('table');
  const tblCard = tbl ? tbl.closest('[class*=rounded-xl]') : null;
  return {
    tablistCls: tablist ? tablist.getAttribute('class') : null,
    tabItems: tablist ? [...tablist.querySelectorAll('[role=tab]')].map(t => t.getAttribute('class') + ' :: ' + t.textContent.trim()) : null,
    tabPanel: document.querySelector('[role=tabpanel]') ? document.querySelector('[role=tabpanel]').getAttribute('class') : null,
    tblCardCls: tblCard ? tblCard.getAttribute('class') : null,
    tblCardKids: tblCard ? [...tblCard.children].map(k => k.tagName + '[' + (k.getAttribute('class')||'').slice(0,60) + ']') : null,
    ths: tbl ? [...tbl.querySelectorAll('thead th')].map(th => (th.getAttribute('class')||'') + ' :: ' + th.textContent.trim().slice(0,14)) : null,
    zeroRow: tbl && tbl.querySelector('tbody tr') ? tbl.querySelector('tbody tr').textContent.trim().slice(0,90) : null,
    emptyBtn: [...document.querySelectorAll('button')].find(b => /first|get started/i.test(b.textContent)) ? 'present' : 'absent'
  };
})()`;

const pmTable = `(() => {
  const tbl = document.querySelector('table');
  const card = tbl ? tbl.closest('[class*=rounded-xl]') : null;
  const title = card ? card.querySelector('h3, [class*=tracking-tight]') : null;
  return {
    cardCls: card ? card.getAttribute('class') : null,
    cardKids: card ? [...card.children].map(k => k.tagName + '[' + (k.getAttribute('class')||'').slice(0,70) + ']') : null,
    titleCls: title ? title.getAttribute('class') : null,
    titleText: title ? title.textContent.trim().slice(0,50) : null,
    ths: tbl ? [...tbl.querySelectorAll('thead th')].slice(0,3).map(th => th.getAttribute('class') || '') : null,
    zeroCell: tbl && tbl.querySelector('tbody td') ? (tbl.querySelector('tbody td').getAttribute('class')||'') + ' :: ' + tbl.querySelector('tbody td').textContent.trim().slice(0,80) : null,
    tableCls: tbl ? tbl.getAttribute('class') : null,
    wrapCls: tbl && tbl.parentElement ? tbl.parentElement.tagName + '[' + (tbl.parentElement.getAttribute('class')||'').slice(0,70) + ']' : null
  };
})()`;

const svText = `(() => {
  const main = document.querySelector('main');
  const sc = main.querySelector('div.overflow-auto, div.overflow-y-auto') || main;
  const root = sc.querySelector('[class*=min-h-screen]') || sc;
  return [...root.querySelectorAll('div')].filter(d => /Avg Sentiment/.test(d.textContent) && d.children.length <= 1).map(d => JSON.stringify(d.textContent)).slice(0,2);
})()`;

const ssStats = `(() => {
  const main = document.querySelector('main');
  const sc = main.querySelector('div.overflow-auto, div.overflow-y-auto') || main;
  const root = sc.querySelector('[class*=min-h-screen]') || sc;
  const ps = [...root.querySelectorAll('p')].filter(p => /My Requests|Peer Approval Needed|Manager Review|Approved/.test(p.textContent) && p.textContent.length < 22);
  return ps.map(p => {
    const holder = p.parentElement;
    const svg = holder.querySelector('svg');
    return { holderCls: holder.getAttribute('class'), svgCls: svg ? svg.getAttribute('class') : null, valCls: (holder.querySelector('p')||{} .getAttribute ? holder.querySelector('p').getAttribute('class') : null), labelCls: p.getAttribute('class'), label: p.textContent.trim() };
  });
})()`;

await open("/notificationpreferences", 3000);
console.log("NP switches:", JSON.stringify(await evalOn(npSwitches), null, 1));
await open("/staffrequests", 3000);
console.log("SR zone:", JSON.stringify(await evalOn(srZone), null, 1));
await open("/payrollmodule", 11000);
console.log("PM table:", JSON.stringify(await evalOn(pmTable), null, 1));
await open("/surveys", 3000);
console.log("SV text:", JSON.stringify(await evalOn(svText)));
await open("/shiftswap", 3000);
console.log("SS stats:", JSON.stringify(await evalOn(ssStats), null, 1));
