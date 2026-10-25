#!/usr/bin/env node
// gen-seed-block.mjs — build the R93-H seed block for prisma/seed.ts from the
// captured REF job description texts.
import fs from "node:fs";

const hrm = fs.readFileSync("/tmp/r93/job-hr-manager-clean.txt", "utf8");
const hrd = fs.readFileSync("/tmp/r93/job-hr-director-clean.txt", "utf8");
const sa = fs.readFileSync("/tmp/r93/job-system-admin-clean.txt", "utf8");

const job = (id, fields, desc, postedAt) => {
  const data = `title: "${fields.title}", department: "${fields.department}", location: "${fields.location}", type: "full_time", status: "${fields.status}", ${
    fields.company ? `company: "${fields.company}", ` : ""
  }${fields.salaryRange ? `salaryRange: "${fields.salaryRange}", ` : ""}description: ${JSON.stringify(desc)}, postedAt: new Date("${postedAt}")`;
  return `  await prisma.jobPosting.upsert({
    where: { id: "${id}" },
    update: { ${data} },
    create: { id: "${id}", ${data} },
  });
`;
};

const block = `
  // Session93 (R93-H): the REF's three-job tenant (live-read 2026-10-25 — the
  // Job Postings tab's card order HR Manager -> HR Director -> System Admin rides
  // the API's postedAt DESC: System Admin oldest, HR Manager newest). The
  // descriptions are the REF's verbatim blobs (including its own copy-paste
  // artifacts — the HR Director's Jeddah/HR-Manager mentions). Idempotent
  // upserts: the update arm also carries postedAt (the convergence rule).
${job("job-sysadmin", { title: "System Admin", department: "IT", location: "Jeddah", status: "active", company: "Company", salaryRange: "12000-15000" }, sa, "2026-01-05T09:00:00Z")}${job("job-hrdirector", { title: "HR Director", department: "HR", location: "Riyadh", status: "draft" }, hrd, "2026-02-10T09:00:00Z")}${job("job-hrmanager", { title: "HR Manager", department: "HR", location: "Jeddah", status: "draft" }, hrm, "2026-03-15T09:00:00Z")}`;

fs.writeFileSync("/tmp/r93/seed-block.txt", block);
console.log("seed block written,", block.length, "chars");
