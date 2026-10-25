import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/approval-workflows — multi-level approval hierarchies.
// The Workflow model stores engine-neutral fields; the approval-engine
// specifics (levels, appliesTo, threshold) live in the conditions JSON.
// GET    → workflows (parsed conditions)
// POST   → create (admin/hr)
// PATCH  → ?id= update (admin/hr)
// DELETE → ?id= remove (admin/hr)

/* Session 36 (R35-F3): the five types of REF's Create Approval
   Workflow dialog (measured: Leave/Expense/Loan/Payroll/Recruitment).
   The first three predate this round; loans/payroll/recruitment joined
   with the dialog.
   Session 93 (R93-C): the workflowconfigpage editor's Applies To —
   Staff Requests | Expense Claims (the REF's live combobox read; the
   legacy expense value stays for the settings dialog's pinned flow). */
const APPLIES_TO = ["leave_requests", "expenses", "staff_requests", "loans", "payroll", "recruitment", "expense_claims"] as const;

/* Session 93 (R93-C): the REF's workflowconfigpage editor sends the
   level-object array + the amount window + categories; the settings page's
   pinned dialog still posts the legacy number shape. The Zod union accepts
   both; the conditions JSON carries whichever shape arrived. */
const LevelInput = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  approverType: z.string().trim().max(60).optional().or(z.literal("")),
  approverEmails: z.string().trim().max(500).optional().or(z.literal("")),
  autoApproveHours: z.number().min(0).max(8760).optional(),
});

const WorkflowInput = z.object({
  name: z.string().trim().min(1, "Workflow name is required").max(120),
  levels: z
    .union([z.number().int().min(1, "At least one level").max(3, "Maximum 3 levels"), z.array(LevelInput).min(1, "At least one level").max(6)])
    .default(1),
  appliesTo: z.enum(APPLIES_TO),
  threshold: z.number().min(0, "Threshold cannot be negative").default(0), // SAR, converted to minor units
  active: z.boolean().default(false),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  categories: z.string().trim().max(500).optional().or(z.literal("")),
});

const WorkflowPatch = WorkflowInput.partial();

const MODULE_BY_APPLIES: Record<(typeof APPLIES_TO)[number], string> = {
  leave_requests: "leave",
  expenses: "expense",
  staff_requests: "general",
  loans: "general",
  payroll: "general",
  recruitment: "recruitment",
  expense_claims: "expense",
};

interface Conditions {
  levels?: number | { name?: string; approverType?: string; approverEmails?: string; autoApproveHours?: number }[];
  appliesTo?: (typeof APPLIES_TO)[number];
  threshold?: number;
  minAmount?: number;
  maxAmount?: number;
  categories?: string;
}

function parseConditions(raw: string): Conditions {
  try {
    const v: unknown = JSON.parse(raw || "{}");
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Conditions;
    return {};
  } catch {
    return {};
  }
}

export async function GET() {
  return guard(async () => {
    await requireUser();
    const workflows = await db.workflow.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, module: true, conditions: true, active: true, executions: true, createdAt: true },
    });
    return ok({
      workflows: workflows.map((w) => {
        const c = parseConditions(w.conditions);
        return {
          id: w.id,
          name: w.name,
          levels: Array.isArray(c.levels) ? c.levels.length : typeof c.levels === "number" ? c.levels : 1,
          appliesTo:
            c.appliesTo && (APPLIES_TO as readonly string[]).includes(c.appliesTo) ? c.appliesTo : "leave_requests",
          threshold: typeof c.threshold === "number" ? c.threshold : 0,
          minAmount: typeof c.minAmount === "number" ? c.minAmount : undefined,
          maxAmount: typeof c.maxAmount === "number" ? c.maxAmount : undefined,
          categories: c.categories ?? "",
          active: w.active,
          executions: w.executions,
          createdAt: w.createdAt,
        };
      }),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, WorkflowInput);
    if (!data) return bad;

    const workflow = await db.workflow.create({
      data: {
        name: data.name,
        module: MODULE_BY_APPLIES[data.appliesTo],
        trigger: "manual",
        conditions: JSON.stringify({
          levels: data.levels,
          appliesTo: data.appliesTo,
          threshold: Math.round(data.threshold * 100),
          ...(data.minAmount !== undefined ? { minAmount: Math.round(data.minAmount * 100) } : {}),
          ...(data.maxAmount !== undefined ? { maxAmount: Math.round(data.maxAmount * 100) } : {}),
          ...(data.categories ? { categories: data.categories } : {}),
        }),
        actions: JSON.stringify([{ type: "approve_chain", levels: Array.isArray(data.levels) ? data.levels.length : data.levels }]),
        active: data.active,
      },
      select: { id: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "workflow.create",
        entity: "workflow",
        entityId: workflow.id,
        detail: JSON.stringify({ name: data.name, appliesTo: data.appliesTo, levels: data.levels }),
      },
    });

    return ok({ id: workflow.id });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Workflow id is required");
    const existing = await db.workflow.findUnique({ where: { id }, select: { id: true, conditions: true } });
    if (!existing) return err("NOT_FOUND", "Workflow not found");

    const { data, response: bad } = await parseBody(req, WorkflowPatch);
    if (!data) return bad;

    const current = parseConditions(existing.conditions);
    const merged: Conditions = {
      levels: data.levels ?? (typeof current.levels === "number" || Array.isArray(current.levels) ? current.levels : 1),
      appliesTo: data.appliesTo ?? current.appliesTo ?? "leave_requests",
      threshold:
        data.threshold !== undefined
          ? Math.round(data.threshold * 100)
          : typeof current.threshold === "number"
            ? current.threshold
            : 0,
      ...(data.minAmount !== undefined ? { minAmount: Math.round(data.minAmount * 100) } : {}),
      ...(data.maxAmount !== undefined ? { maxAmount: Math.round(data.maxAmount * 100) } : {}),
      ...(data.categories !== undefined ? { categories: data.categories } : {}),
    };

    await db.workflow.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(merged.appliesTo ? { module: MODULE_BY_APPLIES[merged.appliesTo] } : {}),
        conditions: JSON.stringify(merged),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "workflow.update",
        entity: "workflow",
        entityId: id,
        detail: JSON.stringify(data),
      },
    });

    return ok({ updated: true });
  });
}

export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Workflow id is required");
    const existing = await db.workflow.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!existing) return err("NOT_FOUND", "Workflow not found");

    await db.workflow.delete({ where: { id } });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "workflow.delete",
        entity: "workflow",
        entityId: id,
        detail: JSON.stringify({ name: existing.name }),
      },
    });
    return ok({ deleted: true });
  });
}
