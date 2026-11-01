// r116-member-checks.ts — session 116 / parity round 115: the real-file
// ground truth on the FINAL source. The Typst family (the hunt target) with
// the LINE-STRUCTURE probes (the r116 round's form class); the corpus
// members with alnum pins + newline counts + the toward/away summary; the
// regenerated families.
// Usage: bun scripts/r116-member-checks.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const dbl = (s: string) => (s.match(/\S  +\S/g) || []).length;
const nl = (s: string) => (s.match(/\n/g) || []).length;

console.log("=== 1) THE TYPST FAMILY — the hunt target (the cm-carried line structure) ===");
const typst: [string, string, number][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 871],
];
for (const [p, n, pin] of typst) {
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  const ok = na(ours).length === pin && na(ours).length === na(ref).length;
  // the LINE-STRUCTURE probe: every pdftotext line boundary (word pair
  // separated by \n) must also read \n in ours — computed over the aligned
  // word streams
  const ow = ours.split(/\s+/).filter(Boolean);
  const rw = ref.split(/\s+/).filter(Boolean);
  let lineAgree = 0, lineDisagree = 0;
  if (ow.length === rw.length) {
    for (let i = 1; i < ow.length; i++) {
      const oSep = ours.slice(ours.indexOf(ow[i - 1]) + ow[i - 1].length).split(/\S/)[0].includes("\n");
      const rSep = ref.slice(ref.indexOf(rw[i - 1]) + rw[i - 1].length).split(/\S/)[0].includes("\n");
      if (oSep === rSep) lineAgree++; else lineDisagree++;
    }
  }
  console.log(`${n}: ours ${na(ours).length} (pin ${pin}) pdftotext ${na(ref).length} — ${ok ? "100.00%" : "*** DRIFT ***"} | nl ours ${nl(ours)} ref ${nl(ref)} | line-sep agree ${lineAgree}/${lineAgree + lineDisagree} | dbl ours ${dbl(ours)} ref ${dbl(ref)} | U+FFFD ${ours.includes("\uFFFD") ? "YES" : "no"}`);
}

// the ORDER + FORM probes on the Typst resume
{
  const raw = readFileSync("/tmp/typst-cv/resume.pdf");
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync("pdftotext /tmp/typst-cv/resume.pdf -", { encoding: "utf8" });
  const checks: [string, boolean, boolean][] = [
    ["name before dates", ours.indexOf("John Smith") < ours.indexOf("Mar 2021"), ref.indexOf("John Smith") < ref.indexOf("Mar 2021")],
    ["role before its bullet", ours.indexOf("Senior HR Manager") < ours.indexOf("Led a team"), ref.indexOf("Senior HR Manager") < ref.indexOf("Led a team")],
    ["summary before experience", ours.toUpperCase().indexOf("SUMMARY") < ours.toUpperCase().indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("SUMMARY") < ref.toUpperCase().indexOf("EXPERIENCE")],
    ["skills before certifications", ours.toUpperCase().indexOf("SKILLS") < ours.toUpperCase().indexOf("CERTIFICATIONS"), ref.toUpperCase().indexOf("SKILLS") < ref.toUpperCase().indexOf("CERTIFICATIONS")],
    ["education after experience", ours.toUpperCase().indexOf("EDUCATION") > ours.toUpperCase().indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("EDUCATION") > ref.toUpperCase().indexOf("EXPERIENCE")],
  ];
  console.log("\n=== ORDER PROBES (the Typst resume) ===");
  for (const [n, o, r] of checks) console.log(`${o === r ? "MATCH" : "*** DIVERGE ***"} — ${n}`);
  console.log("FORM probe (joined name):", ours.includes("John Smith"));
  console.log("FORM probe (single-spaced body):", ours.includes("Human resources leader with twelve years"));
  console.log("FORM probe (no doubled gaps):", !/\S  \S/.test(ours.slice(0, 600)));
  console.log("FORM probe (line-broken header):", ours.includes("John Smith\nSenior HR Manager"));
  console.log("FORM probe (line-broken section — the R115-B trailing form):", /Summary \nHuman/.test(ours));
  console.log("zero U+FFFD:", !ours.includes("\uFFFD"));
}

console.log("\n=== 2) THE CORPUS — the final-source pins (post-R116-A) ===");
const corpus: [string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", 83657],
];
for (const [p, n, pin] of corpus) {
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  console.log(`${n}: md5 ${md5(ours)} alnums ${na(ours).length} (pin ${pin}) ${na(ours).length === pin ? "PIN HOLDS" : "*** DRIFT ***"} | nl ours ${nl(ours)} ref ${nl(ref)}`);
}
