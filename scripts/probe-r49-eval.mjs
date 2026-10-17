#!/usr/bin/env node
// probe-r49-eval.mjs — ad-hoc reader: reads an expression from
// scripts/r49-eval.txt (kept as a FILE — no shell-quoting traps), opens
// the route, evals, prints JSON.
// Usage: node scripts/probe-r49-eval.mjs ref /payrollreports
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
const side = process.argv[2] || "ref";
const route = process.argv[3] || "";
const wait = Number(process.argv[4] || 3000);
const BASE = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3201";
const S = side === "ref" ? "ref" : "loc0";
const EXPR = readFileSync(new URL("./r49-eval.txt", import.meta.url), "utf8");
if (route) { run(`agent-browser --session ${S} open "${BASE}${route}"`); await new Promise(r => setTimeout(r, side === "ref" ? wait : wait - 700)); }
const r = await evalOn(S, EXPR);
console.log(JSON.stringify(r, null, 1).slice(0, 4000));
