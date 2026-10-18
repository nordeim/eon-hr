import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireRole, parseBody } from "@/lib/api";

// /api/employees/import — the bulk import (session 57, R57-A — the
// working superset behind REF's "Bulk Import Employees" dialog; REF's own
// Process File is broken live, failing on its own template format).
//
// POST { rows: [{ full_name, email, job_title, start_date, phone?,
//                 department_id?, template_id? }, ...] }
//   → per-row validation (row numbers surfaced), duplicate-email skip,
//     full_name split into firstName/lastName, employees created with
//     the same employeeId allocator as the single-create route.
//
// The response reports both cohorts so the dialog can show an honest
// summary: { created: n, skipped: [{ row, reason }] }.

const ImportRow = z.object({
  full_name: z.string().trim().min(1, "full_name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  job_title: z.string().trim().min(1, "job_title is required").max(80),
  start_date: z
    .string()
    .trim()
    .min(1, "start_date is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid start_date"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  department_id: z.string().trim().optional().or(z.literal("")),
  template_id: z.string().trim().optional().or(z.literal("")),
});

const ImportInput = z.object({
  rows: z.array(ImportRow).min(1, "At least one row is required").max(1000),
});

/** "" -> null for optional strings. */
function text(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
}

async function nextEmployeeId(): Promise<string> {
  const rows = await db.employee.findMany({ select: { employeeId: true } });
  const max = rows.reduce((m, r) => {
    const n = Number.parseInt(r.employeeId.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `EMP-${String(max + 1).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ImportInput);
    if (!data) return bad;

    const created: { row: number; employeeId: string; name: string }[] = [];
    const skipped: { row: number; reason: string }[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const rowNo = i + 2; // CSV row number (1 = the header line)

      // full_name → firstName/lastName (the template's single column; the
      // final word is the last name, everything before it is the first)
      const parts = row.full_name.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") || firstName;

      // duplicate email (an existing employee) → skip, keep importing
      const existing = await db.employee.findUnique({
        where: { email: row.email },
        select: { id: true },
      });
      if (existing) {
        skipped.push({ row: rowNo, reason: `Duplicate email: ${row.email}` });
        continue;
      }

      // optional relations must exist when supplied
      if (row.department_id) {
        const dept = await db.department.findUnique({ where: { id: row.department_id } });
        if (!dept) {
          skipped.push({ row: rowNo, reason: `Department not found: ${row.department_id}` });
          continue;
        }
      }

      const createData = {
        firstName,
        lastName,
        email: row.email,
        phone: text(row.phone),
        jobTitle: text(row.job_title),
        departmentId: text(row.department_id),
        employmentStatus: "active",
        employmentType: "full_time",
        startDate: new Date(row.start_date),
        baseSalary: 0,
      };

      let employee: { id: string; employeeId: string } | null = null;
      for (let attempt = 0; attempt < 2 && !employee; attempt++) {
        try {
          employee = await db.employee.create({
            data: { ...createData, employeeId: await nextEmployeeId() },
            select: { id: true, employeeId: true },
          });
        } catch (e) {
          const code = (e as { code?: string }).code;
          if (code === "P2002" && attempt === 0) continue; // id race — retry
          throw e;
        }
      }
      if (!employee) {
        skipped.push({ row: rowNo, reason: "Could not allocate an employee id" });
        continue;
      }
      created.push({ row: rowNo, employeeId: employee.employeeId, name: row.full_name });
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "employee.import",
        entity: "employee",
        entityId: "bulk",
        detail: JSON.stringify({ created: created.length, skipped: skipped.length }),
      },
    });

    return ok({ created, skipped });
  });
}
