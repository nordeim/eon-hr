#!/usr/bin/env node
// probe-r31-chat-pane.mjs — drill into REF's right-pane subtree: the exact
// parent chain of the "Select a chat or start a new one" P + the left
// card's title element.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/hrassistantchat");
await new Promise(r => setTimeout(r, 3500));

const SUBTREE = `(() => {
  const pane = [...document.querySelectorAll('div')].find(d => d.className.toString().includes('lg:col-span-3'));
  if (!pane) return JSON.stringify({found:false});
  const dump = (el, depth) => {
    const out = [];
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(c);
      out.push({ d: depth, tag: c.tagName, cls: c.className.toString().slice(0,80), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, col: cs.color, kids: c.children.length, txt: (c.childNodes.length && c.children.length === 0) ? c.textContent.trim().slice(0,40) : undefined });
      out.push(...dump(c, depth + 1));
    }
    return out;
  };
  return JSON.stringify({found:true, paneCls: pane.className.toString().slice(0,60), tree: dump(pane, 0)});
})()`;

console.log(JSON.stringify(await evalOn("ref", SUBTREE), null, 1).slice(0, 2600));
