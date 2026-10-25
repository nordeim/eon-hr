// r93 login-pair probe — ladder step 1: the REF login PNG at 1440x900 LIGHT, hashed.
// Byte-compare target: the standing 69aa4241… baseline (the login pair, ref side).
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const shot = "/tmp/r93/ref-login-pair.png";
execSync(`agent-browser open https://eon.base44.app/login`, { stdio: "pipe" });
execSync(`agent-browser set viewport 1440 900`, { stdio: "pipe" });
execSync(`agent-browser set media light`, { stdio: "pipe" });
execSync(`agent-browser open https://eon.base44.app/login`, { stdio: "pipe" });
await new Promise((r) => setTimeout(r, 3500));
execSync(`agent-browser screenshot --full ${shot}`, { stdio: "pipe" });
const h = createHash("sha256").update(readFileSync(shot)).digest("hex");
console.log("REF login PNG sha256[:12] =", h.slice(0, 12));
console.log("standing baseline        = 69aa4241efa1");
console.log(h.slice(0, 12) === "69aa4241efa1" ? "MATCH — NON-VISUAL (login surface)" : "DELTA — ladder required");

// The Turnstile census + the experiment probe (from the page state)
const census = execSync(`agent-browser eval "JSON.stringify({turnstile: document.querySelectorAll('.cf-turnstile,[data-sitekey]').length, iframes: document.querySelectorAll('iframe').length, buttons: document.querySelectorAll('button').length, forms: document.querySelectorAll('form').length})"`, { encoding: "utf8" });
console.log("census:", census.trim());
const exp = execSync(`agent-browser eval "document.cookie"`, { encoding: "utf8" });
console.log("cookies:", exp.trim().slice(0, 300));
