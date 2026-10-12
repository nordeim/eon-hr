import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
// Inspect the DOM structure around the expanded Analytics group on both apps:
// find the leaf-list container, read its computed margins + the next sibling.
const READER = `(() => {
  const links = [...document.querySelectorAll('a')];
  const org = links.find(a => a.textContent.trim() === 'Organogram' && a.getBoundingClientRect().width > 0);
  if (!org) return JSON.stringify({found:false});
  let ul = org.closest('ul');
  const out = { found: true };
  if (ul) {
    const cs = getComputedStyle(ul);
    out.ul = { cls: String(ul.className).slice(0,80), mt: cs.marginTop, mb: cs.marginBottom, gap: cs.gap, display: cs.display, h: Math.round(ul.getBoundingClientRect().height) };
    const parent = ul.parentElement;
    const pcs = parent ? getComputedStyle(parent) : null;
    out.parent = parent ? { tag: parent.tagName, cls: String(parent.className).slice(0,80), display: pcs.display, gap: pcs.gap, mb: pcs.marginBottom } : null;
    const ulr = ul.getBoundingClientRect();
    const next = ul.nextElementSibling || (parent ? parent.nextElementSibling : null);
    if (next) { const nr = next.getBoundingClientRect(); out.next = { tag: next.tagName, cls: String(next.className).slice(0,60), y: Math.round(nr.y) }; }
    out.ulBottom = Math.round(ulr.bottom);
  }
  return JSON.stringify(out);
})()`;
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, READER);
  console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
