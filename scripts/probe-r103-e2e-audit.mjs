// probe-r103-e2e-audit.mjs — the r101/r102 fixture-audit discipline: compute
// the scorer's EXACT first-24 keyword set live (from the seeded job via the
// running :3200 server + the route's own tokenize/stopword logic), then
// simulate the FIX vs the MUTATIONS on the planned fixture vocabulary.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }

// 1) fetch the job (logged in)
run(`curl -s -X POST http://127.0.0.1:3200/api/auth/login -H "Content-Type: application/json" -d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}' -c /tmp/r103-audit-cookies.txt -o /dev/null`);
const jobsRaw = run(`curl -s -b /tmp/r103-audit-cookies.txt http://127.0.0.1:3200/api/jobs`);
const jobs = JSON.parse(jobsRaw).data?.jobs ?? [];
const sa = jobs.find((j) => j.id === "job-sysadmin");

// 2) the scorer's exact keyword derivation (verbatim from the route)
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

// 3) the planned fixture vocabulary: the Skia region (whole words + ONE
// split-word continuation) + the LuaTeX region (per-glyph Tm soup form)
const SKIA_WORDS = ["securely", "support", "specialist", "platform"];
const SKIA_SPLIT = ["syst", "ems"]; // "syst" + Td(2.5em) + "ems" → "systems"
const LUA_WORDS = ["technology", "admin", "data"]; // per-glyph Tm form

// simulate the FIX: all words intact
const fixTokens = new Set(tokenize([...SKIA_WORDS, "systems", ...LUA_WORDS].join(" ")));
// simulate M1 (the Tm rule reverted → the LuaTeX region letters soup'd, the Skia words keep their spaces)
const m1Tokens = new Set(tokenize([...SKIA_WORDS, "systems", ..."technology admin data".split("").join(" ")].join(" ")));
// simulate M2 (the condGap conditional removed → the split word stays split)
const m2Tokens = new Set(tokenize([...SKIA_WORDS, "syst", "ems", ...LUA_WORDS].join(" ")));

const containsToken = (tokens, keyword) =>
  tokens.has(keyword) || [...tokens].some((t) => (t.startsWith(keyword) || keyword.startsWith(t)) && Math.min(t.length, keyword.length) >= 4);

for (const [name, tokens] of [["FIX", fixTokens], ["M1 (Tm reverted)", m1Tokens], ["M2 (condGap removed)", m2Tokens]]) {
  const matched = jobKeywords.filter((k) => containsToken(tokens, k));
  const skillsMatch = Math.round((matched.length / jobKeywords.length) * 100);
  console.log(`${name}: matched=${matched.length} skillsMatch=${skillsMatch} → ${JSON.stringify(matched)}`);
}

// 4) the guard check: the fixture payload must clear 40 alnums on EVERY side
const alnum = (s) => s.replace(/[^A-Za-z0-9]/g, "").length;
console.log("\nfixture alnum totals: FIX:", alnum([...SKIA_WORDS, "systems", ...LUA_WORDS].join("")),
  "· M1:", alnum([...SKIA_WORDS, "systems", "technology admin data".split("").join(" ")]),
  "· M2:", alnum([...SKIA_WORDS, "syst", "ems", ...LUA_WORDS].join("")));
