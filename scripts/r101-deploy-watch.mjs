#!/usr/bin/env node
// r100-deploy-watch.mjs — the opening read: fingerprint the REF's login-page
// assets (JS/CSS chunk names) and compare against the recorded 66th-deploy
// state (login JS index-DmiZE53r, CSS index-puMd6fDW). A filename move = a
// NEW deploy (the 67th+) → the full ladder.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

run(`agent-browser --session ref101watch close 2>/dev/null; true`);
run(`agent-browser --session ref101watch set viewport 1440 900`);
run(`agent-browser --session ref101watch open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 4000));

const scripts = run(`agent-browser --session ref101watch eval "JSON.stringify([...document.querySelectorAll('script[src]')].map(s=>s.src.split('/').pop()))"`);
const links = run(`agent-browser --session ref101watch eval "JSON.stringify([...document.querySelectorAll('link[rel=stylesheet]')].map(l=>(l.href||'').split('/').pop()))"`);
console.log("login JS chunks:  ", scripts.trim().slice(0, 400));
console.log("login CSS chunks: ", links.trim().slice(0, 300));

run(`agent-browser --session ref101watch close`);

const RECORDED = {
  loginJs: "index-DmiZE53r",
  loginCss: "index-puMd6fDW",
};
function extractNames(raw) {
  try { return JSON.parse(raw.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { return []; }
}
const js = extractNames(scripts);
const css = extractNames(links);
const strip = (n) => (n || "").replace(/\.(js|css)$/, "");
const jsHit = strip(js.find((n) => n && n.startsWith("index-")));
const cssHit = strip(css.find((n) => n && n.startsWith("index-")));
console.log("\nrecorded 66th deploy:", JSON.stringify(RECORDED));
console.log("current login JS entry:", jsHit, jsHit === RECORDED.loginJs ? "(SAME)" : "(MOVED — a newer deploy)");
console.log("current login CSS entry:", cssHit, cssHit === RECORDED.loginCss ? "(SAME)" : "(MOVED — a newer deploy)");
