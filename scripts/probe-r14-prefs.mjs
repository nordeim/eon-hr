#!/usr/bin/env node
// probe-r14-prefs.mjs — verify the profile Preferences tab renders the
// lang/tz card + notification toggles after a real click. Usage: node scripts/probe-r14-prefs.mjs
const { execSync } = await import("node:child_process");

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

// fresh navigation (client component re-mounts)
execSync(`agent-browser --session loc open "http://127.0.0.1:3200/profile"`, { stdio: "pipe", timeout: 45000 });
await new Promise(r => setTimeout(r, 2500));

// wait for hydration: the tab triggers exist
console.log("tabs:", await evalOn("loc", `JSON.stringify([...document.querySelectorAll("[role=tab]")].filter(t => t.offsetParent !== null).map(t => t.textContent.trim()))`));

// click Preferences via agent-browser's own click (dispatches real events)
const snap = execSync(`agent-browser --session loc snapshot -i -c`, { stdio: "pipe", timeout: 30000 }).toString();
const m = snap.match(/- button "Preferences" \[ref=(\w+)\]/);
if (!m) { console.log("NO-PREFERENCES-BUTTON"); process.exit(1); }
execSync(`agent-browser --session loc click @${m[1]}`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

console.log("after click:", await evalOn("loc", `JSON.stringify({
  labels: [...document.querySelectorAll("main label")].filter(l => l.offsetParent !== null).map(l => l.textContent.trim()),
  cards: [...document.querySelectorAll("main h3")].filter(h => h.offsetParent !== null).map(h => h.textContent.trim()),
  selects: [...document.querySelectorAll("main [role=combobox]")].filter(s => s.offsetParent !== null).length,
  switches: [...document.querySelectorAll("main button[role=switch]")].filter(s => s.offsetParent !== null).length
})`));
