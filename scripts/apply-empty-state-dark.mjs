#!/usr/bin/env node
/**
 * Session-6 codemod — EmptyState action buttons switch to the reference's
 * dark shadcn-default variant (#171717). Measured on the reference payroll
 * empty state ("No payroll records" → "Add Payroll" renders bg #171717,
 * #FAFAFA text — NOT the gradient CTA).
 *
 * For each <EmptyState ... action={<Button ...>...</Button>} occurrence,
 * add variant="dark" to the action Button (unless it already carries a
 * custom variant).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";

const files = globSync("src/app/(app)/**/*.tsx");
let touched = 0;
for (const file of files) {
  let src = readFileSync(file, "utf8");
  let changed = false;
  // find "action={" blocks; the first <Button ...> within the next ~200 chars
  let idx = 0;
  while ((idx = src.indexOf("action={", idx)) !== -1) {
    const btnIdx = src.indexOf("<Button", idx);
    if (btnIdx === -1 || btnIdx - idx > 200) { idx += 8; continue; }
    // confirm this Button is the action's direct child: nothing closes
    // between "action={" and the <Button (no "</" in between)
    const between = src.slice(idx + 8, btnIdx);
    if (between.includes("</")) { idx = btnIdx + 1; continue; }
    const tagEnd = src.indexOf(">", btnIdx);
    const tag = src.slice(btnIdx, tagEnd);
    if (/variant="(green|cyan|red|purple|indigo|pink|default)"/.test(tag) || !tag.includes("variant=")) {
      const newTag = tag.includes("variant=")
        ? tag.replace(/variant="(green|cyan|red|purple|indigo|pink|default)"/, 'variant="dark"')
        : tag.replace("<Button", '<Button variant="dark"');
      if (newTag !== tag) {
        src = src.slice(0, btnIdx) + newTag + src.slice(tagEnd);
        changed = true;
      }
    }
    idx = btnIdx + 7;
  }
  if (changed) {
    writeFileSync(file, src);
    touched++;
    console.log(`${file.replace("src/app/(app)/", "")}: dark empty-state CTA`);
  }
}
console.log(`\n${touched} files updated`);
