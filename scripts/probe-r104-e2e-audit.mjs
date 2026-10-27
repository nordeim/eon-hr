// probe-r104-e2e-audit.mjs — the r101/r103 fixture-audit discipline: compute
// the scorer's EXACT first-24 keyword set live (from the seeded job via the
// running :3200 server + the route's own tokenize/stopword logic), then
// simulate the FIX vs the MUTATIONS on the planned session-104 fixture
// vocabulary (the XeTeX per-word-BT region + the F-name collision region).
// The documented no-teeth: the word-per-line defect does NOT change the
// score (the scorer's tokenizer splits on /[^a-z0-9+#]+/ — newlines are
// whitespace); the M1 leg rides the unit layer (the r100/r102 documented
// split). The M2 leg (the font-chain last-wins revert) garbles the
// collision region's letters — the E2E teeth.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }

run(`curl -s -X POST http://127.0.0.1:3200/api/auth/login -H "Content-Type: application/json" -d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}' -c /tmp/r104-audit-cookies.txt -o /dev/null`);
const jobsRaw = run(`curl -s -b /tmp/r104-audit-cookies.txt http://127.0.0.1:3200/api/jobs`);
const jobs = JSON.parse(jobsRaw).data?.jobs ?? [];
const sa = jobs.find((j) => j.id === "job-sysadmin");

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "will", "are", "was", "you",
  "your", "our", "their", "they", "who", "what", "when", "where", "how", "why", "all",
  "any", "can", "has", "had", "not", "but", "out", "use", "using", "work", "working",
  "role", "team", "teams", "job", "jobs", "company", "companies", "years", "year",
  "looking", "join", "joining", "seeking", "candidate", "candidates", "experience",
  "experienced", "strong", "good", "great", "excellent", "must", "should", "plus",
]);
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9+#]+/).filter((t) => t.length >= 3);
const jobText = `${sa.title} ${sa.department ?? ""} ${sa.description ?? ""}`;
const jobKeywords = [...new Set(tokenize(jobText).filter((t) => !STOPWORDS.has(t)))].slice(0, 24);
console.log("the scorer's first-24 keyword set:", JSON.stringify(jobKeywords));

// the planned fixture vocabulary:
// - the XeTeX region: whole words in the per-word-BT absolute-Td form (≥2
//   letters — no narrow-word fusions; the flow works under FIX and M2 alike)
// - the collision region: font A's vocabulary (decodes correctly under FIX,
//   garbles under M2) + font B's own words (correct under both)
const XETEX_WORDS = ["securely", "support", "specialist", "closely", "people"];
const A_WORDS = ["systems", "technology", "oriented", "management", "optimization"];
const B_WORDS = ["admin", "platform", "training"];
const wrong = "qwzvxjk";
const garble = (w) => [...w].map((ch, i) => wrong[(ch.charCodeAt(0) + i) % wrong.length]).join("");

const fixTokens = new Set(tokenize([...XETEX_WORDS, ...A_WORDS, ...B_WORDS].join(" ")));
// M1 (the fresh-Td rule reverted): the XeTeX region goes word-per-line — the
// tokenizer treats newlines as whitespace: the SAME tokens (no teeth, the
// documented split)
const m1Tokens = fixTokens;
// M2 (the font chain last-wins): font A's words decode through font B's map
// — the letters garble (sub-3 and prefix-mismatched tokens)
const m2Tokens = new Set(tokenize([...XETEX_WORDS, ...A_WORDS.map(garble), ...B_WORDS].join(" ")));

const containsToken = (tokens, keyword) =>
  tokens.has(keyword) || [...tokens].some((t) => (t.startsWith(keyword) || keyword.startsWith(t)) && Math.min(t.length, keyword.length) >= 4);

for (const [name, tokens] of [["FIX", fixTokens], ["M1 (fresh-Td reverted — no teeth, documented)", m1Tokens], ["M2 (font chain last-wins)", m2Tokens]]) {
  const matched = jobKeywords.filter((k) => containsToken(tokens, k));
  const skillsMatch = Math.round((matched.length / jobKeywords.length) * 100);
  console.log(`${name}: matched=${matched.length} skillsMatch=${skillsMatch} → ${JSON.stringify(matched)}`);
}

// the guard check: the fixture payload must clear 40 alnums on EVERY side
const alnum = (s) => s.replace(/[^A-Za-z0-9]/g, "").length;
console.log("\nfixture alnum totals: FIX:", alnum([...XETEX_WORDS, ...A_WORDS, ...B_WORDS].join("")),
  "· M2:", alnum([...XETEX_WORDS, ...A_WORDS.map(garble), ...B_WORDS].join("")));
