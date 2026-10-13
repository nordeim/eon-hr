import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

/**
 * Request-approval configuration — session 32 (R31-C8).
 *
 * REF's /requestsettings renders the approval-workflow UI over zero data;
 * this API backs the clone's superset: per-category approval levels with
 * employee approvers ("Level 1/2/3 Approvers", "None set" at zero).
 */

const ApprovalConfigInput = z.object({
  category: z.enum(["general", "it", "hr", "facilities", "finance", "admin"]).default("general"),
  level: z.number().int().min(1).max(3),
  /* Round 33 (R33-C): REF's form collects free-text name+email (no
     employee picker). The API accepts either the direct approverId or
     the name+email pair, resolving the email against Employee — the
     superset's persistence path stays schema-identical. */
  approverId: z.string().min(1).optional(),
  approverName: z.string().min(1).optional(),
  approverEmail: z.string().email().optional(),
}).refine((d) => d.approverId || (d.approverName && d.approverEmail), {
  message: "Either approverId or approverName+approverEmail is required",
});

const SELECT = {
  id: true,
  category: true,
  level: true,
  approverId: true,
  approver: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
} as const;

// GET /api/approval-config — all config rows (grouped client-side per level)
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const rows = await db.approvalConfig.findMany({
      orderBy: [{ category: "asc" }, { level: "asc" }, { createdAt: "asc" }],
      select: SELECT,
    });
    return ok({
      configs: rows.map((r) => ({
        id: r.id,
        category: r.category,
        level: r.level,
        approverId: r.approverId,
        approverName: [r.approver.firstName, r.approver.lastName].filter(Boolean).join(" "),
      })),
    });
  });
}

// POST /api/approval-config — add an approver to a category level
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ApprovalConfigInput);
    if (!data) return bad;
    const { category, level } = data;

    let approverId = data.approverId;
    if (!approverId) {
      /* SQLite has no case-insensitive `equals` filter — resolve the
         email in JS over the small employee table. */
      const employees = await db.employee.findMany({ select: { id: true, email: true } });
      const match = employees.find((e) => e.email?.toLowerCase() === data.approverEmail?.toLowerCase());
      if (!match) {
        return err("NOT_FOUND", `No employee found with email ${data.approverEmail}`);
      }
      approverId = match.id;
    }

    const employee = await db.employee.findUnique({ where: { id: approverId }, select: { id: true } });
    if (!employee) return err("NOT_FOUND", "Employee not found");
    approverId = employee.id;

    const existing = await db.approvalConfig.findUnique({
      where: { category_level_approverId: { category, level, approverId } },
      select: { id: true },
    });
    if (existing) return err("CONFLICT", "That employee is already an approver at this level");

    const created = await db.approvalConfig.create({ data: { category, level, approverId }, select: SELECT });
    return ok({ id: created.id });
  });
}

// DELETE /api/approval-config?id= — remove an approver row
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id") ?? "";
    const existing = await db.approvalConfig.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return err("NOT_FOUND", "Approval config not found");

    await db.approvalConfig.delete({ where: { id } });
    return ok({ id });
  });
}
