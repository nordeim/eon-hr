// probe-r102-e2e-audit.mjs — the E2E fixture audit (the r101 discipline,
// run BEFORE the spec): compute the scorer's exact first-24 keyword set from
// the seeded System Admin job, then simulate the fixture's yield under the
// FIX and under each mutation (M2 wrong-CMap, M3 sign-blind) to prove the
// discrimination BEFORE writing the spec.
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "will", "are", "was", "you",
  "your", "our", "their", "they", "who", "what", "when", "where", "how", "why", "all",
  "any", "can", "has", "had", "not", "but", "out", "use", "using", "work", "working",
  "role", "team", "teams", "job", "jobs", "company", "companies", "years", "year",
  "looking", "join", "joining", "seeking", "candidate", "candidates", "experience",
  "experienced", "strong", "good", "great", "excellent", "must", "should", "plus",
]);
const tokenize = (t) => t.toLowerCase().split(/[^a-z0-9+#]+/).filter((x) => x.length >= 3);
const containsToken = (tokens, k) => tokens.includes(k) || tokens.some((t) => (t.startsWith(k) || k.startsWith(t)) && Math.min(t.length, k.length) >= 4);

const jobs = await p.jobPosting.findMany({ where: { title: { contains: "System Admin" } } });
const job = jobs[0];
console.log("job:", job?.title, "|", job?.department);
const jobText = `${job.title} ${job.department ?? ""} ${job.description ?? ""}`;
const jobKeywords = [...new Set(tokenize(jobText).filter((t) => !STOPWORDS.has(t)))].slice(0, 24);
console.log("first-24 keywords:", jobKeywords.join(" "));

// the fixture vocabulary: every word rides F2's font-scoped hex atoms AND a
// +110 first-letter split (the LibreOffice T-kern form generalized)
const words = ["technology", "systems", "securely", "support", "specialist", "platform"];
// the split fragments (under M3 the words split after the first letter)
const fragments = words.map((w) => w.slice(1));
console.log("\nfragment audit (M3): every fragment must match ZERO keywords");
for (const f of fragments) {
  const hits = jobKeywords.filter((k) => containsToken([f], k));
  console.log(` ${f}: ${hits.length === 0 ? "SAFE" : "MATCHES " + hits.join(",")}`);
}
// also audit whole fused forms (the over-join guard): no fused pair should match
console.log("\nwhole-word audit: every word must MATCH a keyword (the fix's yield)");
for (const w of words) {
  const hits = jobKeywords.filter((k) => containsToken([w], k));
  console.log(` ${w}: ${hits.length > 0 ? "MATCHES " + hits.join(",") : "NO MATCH"}`);
}

// simulate the scorer on the three builds
const score = (cvText) => {
  const cvTokens = tokenize(cvText);
  const matched = jobKeywords.filter((k) => containsToken(cvTokens, k));
  const skillsMatch = Math.round((matched.length / jobKeywords.length) * 100);
  const years = [...cvText.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi)].map((m) => Number(m[1]));
  const maxYears = years.length > 0 ? Math.max(...years) : 0;
  const wordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const seniorHits = (cvText.toLowerCase().match(/\b(senior|lead|manager|head|director|architect|founder)\b/g) ?? []).length;
  const aiScore = Math.max(5, Math.min(98, Math.round(skillsMatch * 0.6 + Math.min(18, maxYears * 2) + Math.min(10, seniorHits * 2) + Math.min(10, Math.floor(wordCount / 60)))));
  return { matched, skillsMatch, aiScore, alnum: cvText.replace(/[^A-Za-z0-9]/g, "").length };
};
const FIX_YIELD = words.join(" ");                       // the fix: joined + font-scoped decode
const M2_YIELD = "qwzvxjkbmqwzvxjkbm qwzvxjkbmqwzvx";   // the wrong-CMap gibberish (F1's letters)
const M3_YIELD = words.map((w) => w[0] + " " + w.slice(1)).join(" "); // the sign-blind split soup
console.log("\nFIX:", JSON.stringify(score(FIX_YIELD)));
console.log("M2 (wrong-CMap):", JSON.stringify(score(M2_YIELD)));
console.log("M3 (sign-blind):", JSON.stringify(score(M3_YIELD)));
await p.$disconnect();
