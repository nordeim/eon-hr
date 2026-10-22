#!/usr/bin/env node
// r78-css-delta.mjs — session 78 / parity round 77: classify the login
// CSS movement (index-DS1aCkan → index-IXVC2MOA, the second login-CSS
// movement since the 35th deploy; an intermediate wkqf_TRn generation was
// observed by the interrupted pre-crash read of this round). The login
// pair is already PNG-proven BYTE-IDENTICAL on the current generation
// (69aa4241… baseline) — this forensic classifies WHAT moved in the CSS
// so the round's classification is rule-level, not just render-level.
// Protocol (r77): fetch both generations live from the REF origin (the
// old hashed assets remain served), byte-compare, split at rule
// boundaries, diff the rule sets, then sweep the CURRENT entry JS bundle
// + the served login HTML for usages of any removed rule name.
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const scratch = `${repo}/.tmp-r78`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

fs.mkdirSync(scratch, { recursive: true });
const origin = "https://eon.base44.app";

// The login page's stylesheet href (relative — needs the origin prefix).
const hrefOut = run(`agent-browser --session ref78css open ${origin}/login`);
await new Promise(r => setTimeout(r, 3000));
const href = run(`agent-browser --session ref78css eval "document.querySelector('link[rel=stylesheet]').getAttribute('href')"`).trim().replace(/^"|"$/g, "");
console.log("login CSS href:", href);
const curUrl = href.startsWith("http") ? href : origin + href;

// Fetch the CURRENT generation + the r77-finals generation + the
// interrupted-session intermediate (if still served).
const gens = [["cur", curUrl], ["d41", `${origin}/assets/index-DS1aCkan.css`], ["mid", `${origin}/assets/index-wkqf_TRn.css`]];
for (const [tag, url] of gens) {
  const out = run(`curl -sf --max-time 20 -o ${scratch}/${tag}.css "${url}"`);
  const ok = fs.existsSync(`${scratch}/${tag}.css`);
  const size = ok ? fs.statSync(`${scratch}/${tag}.css`).size : 0;
  console.log(`${tag}: ${url.split("/").pop()} -> ${ok ? size + " bytes" : "NOT SERVED (" + out.slice(0, 60) + ")"}`);
}

// Also capture the current entry JS size (the chunk-graph signature).
const jsHref = run(`agent-browser --session ref78css eval "[...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')).find(s=>/index-/.test(s))"`).trim().replace(/^"|"$/g, "");
console.log("login entry JS href:", jsHref);
const jsUrl = jsHref.startsWith("http") ? jsHref : origin + jsHref;
run(`curl -sf --max-time 30 -o ${scratch}/entry.js "${jsUrl}"`);
console.log("entry JS size:", fs.existsSync(`${scratch}/entry.js`) ? fs.statSync(`${scratch}/entry.js`).size + " bytes" : "FETCH FAILED");

// Fetch the served login HTML for the usage sweep.
run(`curl -sf --max-time 20 -o ${scratch}/login.html "${origin}/login"`);

// Rule-level diff: old (DS1aCkan) vs current (IXVC2MOA) if both present.
function rules(file) {
  const css = fs.readFileSync(file, "utf8");
  // split at top-level rule boundaries (} followed by a selector or @media)
  return css.split("}").map(s => s.trim()).filter(Boolean).map(r => r + "}");
}
if (fs.existsSync(`${scratch}/cur.css`) && fs.existsSync(`${scratch}/d41.css`)) {
  const cur = rules(`${scratch}/cur.css`), old = rules(`${scratch}/d41.css`);
  console.log(`\nrule counts: DS1aCkan ${old.length} -> IXVC2MOA ${cur.length}`);
  const curSet = new Set(cur), oldSet = new Set(old);
  const removed = old.filter(r => !curSet.has(r));
  const added = cur.filter(r => !oldSet.has(r));
  console.log(`REMOVED ${removed.length}:`);
  for (const r of removed) console.log("  - " + r.slice(0, 160));
  console.log(`ADDED ${added.length}:`);
  for (const r of added) console.log("  + " + r.slice(0, 160));

  // Usage sweep: do the removed rule NAMES appear in the current entry
  // bundle or the served login HTML? (dead code = zero usages)
  if (removed.length) {
    const js = fs.existsSync(`${scratch}/entry.js`) ? fs.readFileSync(`${scratch}/entry.js`, "utf8") : "";
    const html = fs.existsSync(`${scratch}/login.html`) ? fs.readFileSync(`${scratch}/login.html`, "utf8") : "";
    const names = [...new Set(removed.map(r => {
      const head = r.split("{")[0].trim();           // the selector preamble
      const m = head.match(/[.#][A-Za-z0-9_\-[\]!%().:/,#>~ ]+/); // first class/id-ish token
      return (m ? m[0] : head).split(/[,>~ +]/)[0].trim() || r.slice(0, 40);
    }))];
    console.log("\nusage sweep of the removed rule names (entry JS + login HTML):");
    for (const n of names) {
      const inJs = js.includes(n.slice(1));           // the bare name substring
      const inHtml = html.includes(n.slice(1));
      console.log(`  ${n}: entryJS=${inJs} loginHTML=${inHtml}`);
    }
  }
} else {
  console.log("\ncannot diff — one or both generations unavailable");
}
console.log("\nscratch dir:", scratch);
