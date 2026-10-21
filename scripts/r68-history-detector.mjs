#!/usr/bin/env node
// r68-history-detector.mjs — session-68 / parity round 67: the Next.js
// 16.4.0 Navigation API history-corruption detector, revived on the
// UPGRADED build. The session-56 record (R56-E): after a full document
// load of any (app) route, the SECOND consecutive client-side navigation
// replaces the fresh-loaded entry's URL with a duplicate of the entry
// below it — ["pre", "/"] → click → ["pre", "/", "/staffrequests"] →
// click → ["pre", "pre", "/staffrequests", "/training"]. The user loses
// the page they landed on (back-back skips it). The upgrade watch
// (the recorded follow-up) is NOW actionable: 16.4.1/16.4.2 shipped
// (16.4.1 = critical security fixes; 16.4.2 = Turbopack stability).
// This script dumps the navigation entries on the LOCAL app after each
// step and renders the verdict: corruption gone (upstream fixed) or
// still live (the documented divergence stands).
// NOTE: the local side needs the standalone server on :3200 (the
// standing-run boot pattern) — start it BEFORE running this probe.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  const t = out.trim();
  // agent-browser may return either a JSON-encoded string or a pretty-printed
  // JSON array — try the plain parse first, then the double-decode.
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(JSON.parse(t)); } catch {}
  return "ERR:" + t.slice(0, 300);
}

const baseLoc = "http://127.0.0.1:3200";
const ENTRIES = `(() => {
  const nav = window.navigation;
  if (!nav) return "NO_NAVIGATION_API";
  return nav.entries().map(e => { try { return new URL(e.url).pathname; } catch { return e.url; } });
})()`;

// The corruption shape (from the session-56 record): full-load /profile,
// click staffrequests, click training — then dump entries after each step.
// Expected CLEAN: ["/profile", "/"] → ["/profile", "/", "/staffrequests"]
// → ["/profile", "/", "/staffrequests", "/training"]
// The 16.4.0 corruption: ["/profile", "/profile", "/staffrequests", "/training"]

async function detect() {
  console.log("===== the r68 history-corruption detector (the upgraded build) =====");
  run(`agent-browser --session loc68 set viewport 1440 900`);
  // Determinism pre-step: a document change away from the app resets the
  // detector's starting stack (the second run of this script on a live
  // session inherits the previous run's entries — the r68 first-run
  // evidence was clean, but the re-run's e0 was polluted by the leftover).
  run(`agent-browser --session loc68 open about:blank`);
  await settle(1200);
  run(`agent-browser --session loc68 open ${baseLoc}/profile`);
  await settle(2800);
  const e0 = await ev("loc68", ENTRIES);
  console.log("after full load /profile:", JSON.stringify(e0));

  await ev("loc68", `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /staff requests/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return a.getAttribute('href'); } return 'NOTFOUND'; })()`);
  await settle(2400);
  const e1 = await ev("loc68", ENTRIES);
  console.log("after click 1 (staffrequests):", JSON.stringify(e1));

  await ev("loc68", `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training lms/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return a.getAttribute('href'); } return 'NOTFOUND'; })()`);
  await settle(2400);
  const e2 = await ev("loc68", ENTRIES);
  console.log("after click 2 (training lms):", JSON.stringify(e2));

  // The back-back walk — the user-visible effect
  run(`agent-browser --session loc68 back`);
  await settle(2600);
  const b1 = run(`agent-browser --session loc68 get url`).trim();
  run(`agent-browser --session loc68 back`);
  await settle(2600);
  const b2 = run(`agent-browser --session loc68 get url`).trim();
  console.log(`back1: ${b1.replace(baseLoc, "")}  back2: ${b2.replace(baseLoc, "")}`);

  // Verdict machinery — signature-based (the 16.4.0 corruption):
  // the corruption REPLACED the loaded entry's URL with a duplicate of the
  // entry below it. The corruption-free contract, RELATIVE to the initial
  // stack (robust to the initial shape): each click PUSHES exactly one
  // entry (prefix preserved + length +1), no adjacent duplicates, and
  // back-back reaches the page the user landed on (/profile).
  const a0 = Array.isArray(e0) ? e0 : [];
  const a1 = Array.isArray(e1) ? e1 : [];
  const a2 = Array.isArray(e2) ? e2 : [];
  const isPrefix = (small, big) => small.every((p, i) => big[i] === p);
  const push1 = a1.length === a0.length + 1 && isPrefix(a0, a1);
  const push2 = a2.length === a1.length + 1 && isPrefix(a1, a2);
  const hasDup = a2.some((p, i) => i > 0 && p === a2[i - 1]);
  const backOk = b2.includes("/profile");
  const clean = push1 && push2 && !hasDup && backOk;
  console.log("\nVERDICT:", clean
    ? "CLEAN — the 16.4.0 corruption is GONE on the upgraded build (upstream fixed between 16.4.0 and 16.4.2): every click PUSHES one entry (prefix preserved, no replaces, no duplicates) and back-back reaches the loaded page"
    : "CORRUPTION or regression — the push-only contract FAILED: " +
      JSON.stringify({ push1, push2, hasDup, backOk }));
  console.log("back-walk:", backOk ? "back-back reaches the loaded page (the one-click contract holds)" : "back-back SKIPS the loaded page");
  process.exit(0);
}
detect();
