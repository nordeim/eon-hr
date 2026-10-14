#!/usr/bin/env node
// probe-r38-login.mjs — the login-page re-audit after REF's redeploy
// (login JS chunk changed: index-CneaUv24.js -> index-BYE5Ojxh.js).
// Diffs the FULL login surface: DOM structure, text, form contracts,
// geometry, colors. Both apps at logged-out state, 1440x900.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const COLLECT = `(() => {
  const getRect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const cs = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor, font: s.fontSize + "/" + s.fontWeight, pad: s.padding, border: s.borderTopWidth + " " + s.borderTopColor, radius: s.borderRadius, shadow: s.boxShadow === "none" ? "none" : "has" };
  };
  const els = Array.from(document.querySelectorAll("body *")).filter(el => {
    const tag = el.tagName.toLowerCase();
    if (["script","style","link","meta","noscript"].includes(tag)) return false;
    const kidText = Array.from(el.children).some(c => c.textContent.trim());
    const ownText = Array.from(el.childNodes).some(n => n.nodeType===3 && n.textContent.trim());
    const interactive = ["input","button","a","select","textarea"].includes(tag);
    return (ownText && !kidText) || interactive;
  });
  const map = els.map(el => {
    const tag = el.tagName.toLowerCase();
    const attrs = {};
    for (const a of ["type","name","placeholder","required","autocomplete","aria-label","aria-invalid","role","href"]) {
      const v = el.getAttribute(a);
      if (v !== null) attrs[a] = v === "" ? "(empty)" : v;
    }
    if (el.disabled) attrs.disabled = true;
    return { tag, attrs: Object.keys(attrs).length ? attrs : null, text: (el.textContent || "").trim().slice(0, 60) || null, rect: getRect(el) };
  });
  const form = document.querySelector("form");
  const email = document.querySelector('input[type=email], input[name=email]');
  const pass = document.querySelector('input[type=password]');
  const btns = Array.from(document.querySelectorAll("button")).map(b => ({ text: b.textContent.trim().slice(0, 40), type: b.type, disabled: b.disabled, rect: getRect(b), cs: cs(b) }));
  const links = Array.from(document.querySelectorAll("a")).map(a => ({ text: a.textContent.trim().slice(0, 40), href: a.getAttribute("href") }));
  const headings = Array.from(document.querySelectorAll("h1,h2,h3")).map(h => ({ tag: h.tagName, text: h.textContent.trim(), rect: getRect(h) }));
  const alerts = Array.from(document.querySelectorAll('[role=alert]')).map(al => ({ text: al.textContent.trim().slice(0,80), rect: getRect(al), cs: cs(al) }));
  return { url: location.pathname, title: document.title, nElements: document.querySelectorAll("body *").length, map, form: form ? { rect: getRect(form), novalidate: form.noValidate } : null, email: email ? { rect: getRect(email), cs: cs(email), ph: email.placeholder, req: email.required, ac: email.autocomplete, type: email.type } : null, pass: pass ? { rect: getRect(pass), cs: cs(pass), ph: pass.placeholder, req: pass.required, ac: pass.autocomplete, type: pass.type } : null, btns, links, headings, alerts };
})()`;

async function collect(session, url) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise((r) => setTimeout(r, 3000));
  return evalOn(session, COLLECT);
}

const ref = await collect("ref2", "https://eon.base44.app/login");
const loc = await collect("loc2", "http://127.0.0.1:3200/login");

const cmp = (label, a, b) => {
  const ja = JSON.stringify(a), jb = JSON.stringify(b);
  console.log(`=== ${label} === ${ja === jb ? "MATCH" : "DIFF"}`);
  if (ja !== jb) { console.log("REF:", ja); console.log("LOC:", jb); }
};

cmp("TITLE", ref.title, loc.title);
cmp("ELEMENT COUNT", ref.nElements, loc.nElements);
cmp("HEADINGS", ref.headings, loc.headings);
cmp("BUTTONS", ref.btns, loc.btns);
cmp("LINKS", ref.links, loc.links);
cmp("EMAIL", ref.email, loc.email);
cmp("PASSWORD", ref.pass, loc.pass);
cmp("FORM", ref.form, loc.form);
cmp("ALERTS", ref.alerts, loc.alerts);

console.log("=== TEXT/INTERACTIVE MAP — structural tag+text compare ===");
const norm = (m) => m.map(e => e.tag + (e.text ? ":" + e.text : "") + (e.attrs && e.attrs.placeholder ? " ph=" + e.attrs.placeholder : ""));
const ra = norm(ref.map), la = norm(loc.map);
console.log("REF n=" + ra.length, JSON.stringify(ra));
console.log("LOC n=" + la.length, JSON.stringify(la));
