// R99-B probe: run a REAL downloaded PDF through the extraction pipeline and
// report (a) the Producer/Creator metadata, (b) the stream-delimiter forms it
// uses, (c) the extracted text yield. Real-writer ground truth for the queue's
// "real Acrobat-produced PDF" candidate.
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text.ts";

const path = process.argv[2] ?? "/home/z/my-project/tmp-r99/pdf-test.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

// metadata
for (const key of ["Producer", "Creator"]) {
  const m = ascii.match(new RegExp(`/${key}\\s*\\(([^)]*)\\)`));
  console.log(`${key}: ${m ? m[1] : "(not found)"}`);
}

// stream-delimiter census: every "stream" keyword followed by what?
const re = /stream/g;
let m;
const forms = {};
while ((m = re.exec(ascii))) {
  const after = ascii.slice(m.index + 6, m.index + 6 + 3);
  const form = after
    .replace(/\r\n/g, "␍␊")
    .replace(/\r/g, "␍")
    .replace(/\n/g, "␊");
  forms[form] = (forms[form] ?? 0) + 1;
}
console.log("stream-keyword following-bytes census:", JSON.stringify(forms));

// does the extraction read it?
const file = new File([buf], "real.pdf", { type: "application/pdf" });
const text = await extractTextFromFile(file);
console.log("extracted length:", text.length);
console.log("first 300 chars:", JSON.stringify(text.slice(0, 300)));
