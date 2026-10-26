#!/usr/bin/env node
// r97-deploy-watch.mjs — the opening read: fingerprint the REF's login-page
// assets (JS/CSS chunk names) and compare against the recorded 65th-deploy
// state (login JS index-Cb4GrjTt, CSS index-ByKl99Mk; app side C-IrDy5f /
// BGNH4KkS). A filename move = a NEW deploy (the 66th+) → the full ladder.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

run(`agent-browser --session ref97watch close 2>/dev/null; true`);
run(`agent-browser --session ref97watch set viewport 1440 900`);
run(`agent-browser --session ref97watch open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 4000));

const scripts = run(`agent-browser --session ref97watch eval "JSON.stringify([...document.querySelectorAll('script[src]')].map(s=>s.src.split('/').pop()))"`);
const links = run(`agent-browser --session ref97watch eval "JSON.stringify([...document.querySelectorAll('link[rel=stylesheet]')].map(l=>(l.href||'').split('/').pop()))"`);
console.log("login JS chunks:  ", scripts.trim().slice(0, 400));
console.log("login CSS chunks: ", links.trim().slice(0, 300));

// the app side (post-login bundle names) — read via the standing recorded
// session: only if the login pair diffs do we need the full authed walk.
// Cheap read first: the login HTML references the app entry chunks only
// after auth; the login pair (below) is the visual gate.
run(`agent-browser --session ref97watch close`);

const RECORDED = {
  loginJs: "index-Cb4GrjTt",
  loginCss: "index-ByKl99Mk",
};
function extractNames(raw) {
  try { return JSON.parse(raw.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { return []; }
}
const js = extractNames(scripts);
const css = extractNames(links);
const strip = (n) => (n || "").replace(/\.(js|css)$/, "");
const jsHit = strip(js.find((n) => n && n.startsWith("index-")));
const cssHit = strip(css.find((n) => n && n.startsWith("index-")));
console.log("\nrecorded 65th deploy:", JSON.stringify(RECORDED));
console.log("current login JS entry:", jsHit, jsHit === RECORDED.loginJs ? "(SAME)" : "(MOVED — a newer deploy)");
console.log("current login CSS entry:", cssHit, cssHit === RECORDED.loginCss ? "(SAME)" : "(MOVED — a newer deploy)");
