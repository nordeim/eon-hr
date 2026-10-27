// r101-e2e-audit.mjs — audit the session101 E2E fixture's discrimination
// against the REAL scorer (the route's exact STOPWORDS + tokenize + the
// seeded System Admin job description): under the mutation (the blind
// space-join), every cluster token must match ZERO of the first-24
// keywords; under the fix, the joined words must match ≥ 3.
const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "will", "are", "was", "you",
  "your", "our", "their", "they", "who", "what", "when", "where", "how", "why", "all",
  "any", "can", "has", "had", "not", "but", "out", "use", "using", "work", "working",
  "role", "team", "teams", "job", "jobs", "company", "companies", "years", "year",
  "looking", "join", "joining", "seeking", "candidate", "candidates", "experience",
  "experienced", "strong", "good", "great", "excellent", "must", "should", "plus",
]);
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9+#]+/).filter((t) => t.length >= 3);
const containsToken = (tokens, keyword) =>
  tokens.includes(keyword) ||
  tokens.some((t) => (t.startsWith(keyword) || keyword.startsWith(t)) && Math.min(t.length, keyword.length) >= 4);

// the seeded job (prisma/seed.ts, job-sysadmin): title + department + description
import { readFileSync } from "node:fs";
const seed = readFileSync("/home/z/my-project/eon-hr/prisma/seed.ts", "utf8");
const descMatch = seed.match(/where: \{ id: "job-sysadmin" \},\s*update: \{[^]*?description: "([^"]+)"/);
const desc = descMatch[1];
const jobText = "System Admin IT " + desc;
const kws = [...new Set(tokenize(jobText).filter((t) => !STOPWORDS.has(t)))].slice(0, 24);
console.log("first-24 keywords:", JSON.stringify(kws));

// the session101 E2E fixture's exact content (the kernWord walk, 3-char clusters)
function kernWord(word) {
  const clusters = [];
  for (let i = 0; i < word.length; i += 3) clusters.push(word.slice(i, i + 3));
  clusters[clusters.length - 1] += " ";
  return clusters.map((c, j) => (j === 0 ? `(${c})` : `${3 + ((j * 2) % 5)}(${c})`)).join("");
}
const words = [
  "administration", "specialist", "platform", "payroll", "compliance", "onboarding",
  "hris", "training", "manager", "senior", "experience", "technology", "systems", "securely",
];
const lines = [
  [words[0], words[1], words[2]].map(kernWord).join(""),
  [words[3], words[4], words[5]].map(kernWord).join(""),
  [words[6], words[7], words[8]].map(kernWord).join(""),
  [words[9], words[10], words[11]].map(kernWord).join(""),
  [words[12], words[13]].map(kernWord).join(""),
];
// simulate the mutation: every atom space-joined
const atoms = lines.join(" ").match(/\(([^)]*)\)/g).map((a) => a.slice(1, -1));
const mutationText = atoms.join(" ");
const fixText = lines.map((l) => l.replace(/\)\d+\(/g, ")(").replace(/[()]/g, "").replace(/\s+/g, " ")).join(" ");
console.log("\nmutation text:", JSON.stringify(mutationText.slice(0, 220)));
console.log("fix text:     ", JSON.stringify(fixText.slice(0, 220)));

const mTokens = tokenize(mutationText);
const mMatched = kws.filter((k) => containsToken(mTokens, k));
console.log(`\nMUTATION: matched=${mMatched.length} ${JSON.stringify(mMatched)} → skillsMatch=${Math.round((mMatched.length / kws.length) * 100)}`);
const fTokens = tokenize(fixText);
const fMatched = kws.filter((k) => containsToken(fTokens, k));
console.log(`FIX:      matched=${fMatched.length} ${JSON.stringify(fMatched)} → skillsMatch=${Math.round((fMatched.length / kws.length) * 100)}`);

// the alnum guard + the score math both directions
const alnum = (s) => s.replace(/[^A-Za-z0-9]/g, "").length;
const score = (text, matchedCount) => {
  const skillsMatch = Math.round((matchedCount / kws.length) * 100);
  const years = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi)].map((m) => Number(m[1]));
  const maxYears = years.length ? Math.max(...years) : 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const seniorHits = (text.toLowerCase().match(/\b(senior|lead|manager|head|director|architect|founder)\b/g) ?? []).length;
  return Math.max(5, Math.min(98, Math.round(skillsMatch * 0.6 + Math.min(18, maxYears * 2) + Math.min(10, seniorHits * 2) + Math.min(10, Math.floor(wordCount / 60)))));
};
console.log(`\nalnum (soup): ${alnum(mutationText)} (guard needs ≥ 40)`);
console.log(`MUTATION aiScore: ${score(mutationText, mMatched.length)} (assertion > 5 must FAIL → RED)`);
console.log(`FIX      aiScore: ${score(fixText, fMatched.length)} (assertion > 5 must PASS → GREEN)`);
