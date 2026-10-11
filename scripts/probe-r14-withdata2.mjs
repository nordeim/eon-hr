#!/usr/bin/env node
// probe-r14-withdata2.mjs — with-data UI check round 2: include button
// elements in the grid scan. Usage: node scripts/probe-r14-withdata2.mjs
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

const inj = run(`env -u DATABASE_URL bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.trainingPlatform.create({ data: { name: 'Smoke Test LMS', category: 'technical', description: 'temporary smoke row', coursesCount: 5, active: true } }).then(p => { console.log(p.id); return db.\\$disconnect(); });
"`);
console.log("injected:", inj.trim().split("\n").pop());

run(`agent-browser --session loc open "http://127.0.0.1:3200/training"`);
await new Promise(r => setTimeout(r, 2500));

const check = await evalOn(`(() => {
  const out = {};
  const grid = document.querySelector("main .grid");
  const kids = grid ? [...grid.children].filter(c => c.offsetParent !== null) : [];
  out.gridChildren = kids.map(c => ({ tag: c.tagName, t: (c.textContent || "").trim().slice(0, 24), dashed: String(c.className).includes("border-dashed") }));
  out.hasAddTile = kids.some(c => String(c.className).includes("border-dashed") && /Add Platform/.test(c.textContent || ""));
  return JSON.stringify(out);
})()`);
console.log("with-data grid:", check);

const del = run(`env -u DATABASE_URL bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.trainingPlatform.deleteMany({ where: { name: 'Smoke Test LMS' } }).then(d => { console.log(d.count); return db.\\$disconnect(); });
"`);
console.log("cleanup:", del.trim().split("\n").pop());
