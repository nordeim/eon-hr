#!/usr/bin/env node
// probe-r31-chat-geom.mjs — REF /hrassistantchat exact geometry: the
// "Active Chats" label, "No chats" P (with parents' classes), and the
// right-pane empty P (width + card bounds).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/hrassistantchat");
await new Promise(r => setTimeout(r, 3500));

const GEOM = `(() => {
  const find = (txt) => [...document.querySelectorAll('main p, main div, main h1, main h2, main h3')].find(e => e.textContent.trim() === txt && e.getBoundingClientRect().width > 0);
  const desc = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { tag: el.tagName, cls: el.className.toString().slice(0,90), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color };
  };
  const label = find('Active Chats');
  const nochats = find('No chats');
  const select = find('Select a chat or start a new one');
  const parents = (el, n) => { const out = []; let p = el; for (let i = 0; i < n && p; i++) { p = p.parentElement; if (p) out.push({ tag: p.tagName, cls: p.className.toString().slice(0,80), x: Math.round(p.getBoundingClientRect().x), y: Math.round(p.getBoundingClientRect().y), w: Math.round(p.getBoundingClientRect().width) }); } return out; };
  return JSON.stringify({ label: desc(label), nochats: desc(nochats), nochatsParents: nochats ? parents(nochats, 3) : null, select: desc(select), selectParents: select ? parents(select, 3) : null });
})()`;

console.log(JSON.stringify(await evalOn("ref", GEOM), null, 1));
