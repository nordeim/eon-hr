#!/usr/bin/env node
// probe-r14-withdata.mjs — with-data UI check: inject a platform via
// Prisma, load /training in the authenticated LOC browser, verify the
// platform card + trailing add-tile render, then clean up.
// Usage: node scripts/probe-r14-withdata.mjs  (run with bun + env -u DATABASE_URL wrapper)
import { execSync } from "node:child_process";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 100); }
}

async function evalOn(js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session loc eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

// 1. inject via the smoke script's first half
const inj = run(`env -u DATABASE_URL bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.trainingPlatform.create({ data: { name: 'Smoke Test LMS', category: 'technical', description: 'temporary smoke row', coursesCount: 5, active: true } }).then(p => { console.log(p.id); return db.\\$disconnect(); });
"`);
const pid = inj.trim().split("\n").pop();
console.log("injected:", pid);

// 2. load the page in the authenticated browser
run(`agent-browser --session loc open "http://127.0.0.1:3200/training"`);
await new Promise(r => setTimeout(r, 2500));

const check = await evalOn(`(() => {
  const out = {};
  const cards = [...document.querySelectorAll("main .grid > div")].filter(c => c.offsetParent !== null);
  out.tiles = cards.map(c => ({ t: (c.textContent || "").trim().slice(0, 30), dashed: String(c.className).includes("border-dashed") }));
  out.hasAddTile = cards.some(c => String(c.className).includes("border-dashed") && /Add Platform/.test(c.textContent || ""));
  out.hasSmoke = cards.some(c => /Smoke Test LMS/.test(c.textContent || ""));
  out.hasEmptyState = /No training platforms available/.test(document.querySelector("main").textContent || "");
  return JSON.stringify(out);
})()`);
console.log("with-data UI:", check);

// 3. clean up
const del = run(`env -u DATABASE_URL bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.trainingPlatform.deleteMany({ where: { name: 'Smoke Test LMS' } }).then(d => { console.log(d.count); return db.\\$disconnect(); });
"`);
console.log("cleanup:", del.trim().split("\n").pop());
