// r125-launch-verify.mjs — the genus-transfer probe (the neo-crm s212
// standalone bun-launch DB re-anchor, verified against eon-hr's seam):
// boot the standalone server through the NATURAL launch shape (bun runtime
// + the .env auto-load + the standalone chdir + the traced .env artifact)
// and prove which database file it actually opens.
//   Leg A: env -u DATABASE_URL (the clean .env-only launch — bun loads
//          <repo>/.env raw: "file:../db/custom.db")
//   Leg B: the sandbox-exported DATABASE_URL (the absolute workspace-root
//          form — the documented operator trap)
// Usage: node scripts/r125-launch-verify.mjs
import { spawn, execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const repo = "/home/z/my-project/eon-hr";
function run(cmd, t = 30000) {
  try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); }
  catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 400); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function killPort(port) {
  const out = run(`ss -ttlnp 2>/dev/null | grep ':${port} ' || true`);
  const pids = [...out.matchAll(/pid=(\d+)/g)].map((m) => m[1]);
  for (const p of new Set(pids)) run(`kill -9 ${p} 2>/dev/null; true`);
}

async function bootLeg(name, port, clean) {
  killPort(port);
  const env = {
    ...process.env, PORT: String(port), NODE_ENV: "production", HOSTNAME: "127.0.0.1",
    // the production boot guard requires a secret (src/instrumentation.ts);
    // the standing probe value from scripts/boot3200.mjs
    AUTH_SECRET: "dev-only-secret-0123456789abcdef",
  };
  if (clean) delete env.DATABASE_URL;
  const child = spawn("bun", [`${repo}/.next/standalone/server.js`], {
    cwd: repo, detached: true, stdio: "ignore", env,
  });
  child.unref();
  // wait for the health endpoint
  let up = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const h = run(`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${port}/api/health`, 8000);
    if (h.trim() === "200") { up = true; break; }
  }
  if (!up) { console.log(`[${name}] SERVER NEVER CAME UP`); return; }
  // the seeded-user login probe — success proves the server opened the
  // SEEDED <repo>/db/custom.db; failure proves a different (empty/phantom) file
  const login = run(
    `curl -s -X POST http://127.0.0.1:${port}/api/auth/login ` +
    `-H 'Content-Type: application/json' ` +
    `-d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}'`,
    15000,
  );
  const ok = login.includes('"ok":true');
  const phantom = existsSync("/home/z/my-project/db/custom.db");
  console.log(`[${name}] up=${up} loginOk=${ok} phantomParentDb=${phantom}`);
  console.log(`[${name}] login body: ${login.slice(0, 160)}`);
  killPort(port);
  await sleep(1500);
}

console.log("repo db exists:", existsSync(`${repo}/db/custom.db`),
  existsSync(`${repo}/db/custom.db`) ? statSync(`${repo}/db/custom.db`).size + " bytes" : "");
console.log("parent db exists BEFORE:", existsSync("/home/z/my-project/db/custom.db"));

await bootLeg("A: clean .env-only launch (:3201)", 3201, true);
console.log("parent db exists AFTER leg A:", existsSync("/home/z/my-project/db/custom.db"));

await bootLeg("B: sandbox-exported absolute DATABASE_URL (:3202)", 3202, false);
console.log("parent db exists AFTER leg B:", existsSync("/home/z/my-project/db/custom.db"),
  existsSync("/home/z/my-project/db/custom.db") ? statSync("/home/z/my-project/db/custom.db").size + " bytes" : "");
