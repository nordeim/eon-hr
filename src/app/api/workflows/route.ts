import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Workflow automation — CRUD for automated workflow definitions.
// Session92 (R92-D): the REF's event-based contract live-read from its
// Create Automated Workflow dialog — Trigger Type (the six lifecycle events)
// + Target Department (Optional) + the Actions list
// [{type, delayDays, message}] (Action Type × Delay (days) × Email Message).

const TRIGGER_TYPES = [
  "new_employee_onboarding",
  "employee_offboarding",
  "work_anniversary",
  "birthday",
  "probation_end",
  "contract_renewal",
] as const;

const ACTION_TYPES = ["send_email", "create_task", "send_notification", "assign_template"] as const;

const ActionItem = z.object({
  type: z.enum(ACTION_TYPES),
  delayDays: z.number().int().min(0).max(365).default(0),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

const WorkflowInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  triggerType: z.enum(TRIGGER_TYPES).default("new_employee_onboarding"),
  targetDepartment: z.string().trim().max(120).optional().or(z.literal("")),
  actions: z.array(ActionItem).min(1, "At least one action is required").max(10),
  active: z.boolean().default(true),
});

const WorkflowPatch = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  triggerType: z.enum(TRIGGER_TYPES).optional(),
  targetDepartment: z.string().trim().max(120).optional().or(z.literal("")),
  actions: z.array(ActionItem).min(1).max(10).optional(),
  active: z.boolean().optional(),
});

interface WorkflowAction {
  type: string;
  delayDays: number;
  message?: string;
}

function parseActions(raw: string): WorkflowAction[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const out: WorkflowAction[] = [];
    for (const entry of parsed) {
      if (typeof entry === "object" && entry !== null && "type" in entry) {
        const e = entry as { type?: unknown; delayDays?: unknown; message?: unknown };
        if (typeof e.type === "string" && e.type.length > 0) {
          out.push({
            type: e.type,
            delayDays: typeof e.delayDays === "number" ? e.delayDays : 0,
            ...(typeof e.message === "string" && e.message ? { message: e.message } : {}),
          });
        }
      } else if (typeof entry === "string" && entry.length > 0) {
        // legacy rows (pre-session92): the old free-string action list
        out.push({ type: entry, delayDays: 0 });
      }
    }
    return out;
  } catch {
    return [];
  }
}

// GET /api/workflows
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const workflows = await db.workflow.findMany({ orderBy: { createdAt: "desc" } });
    return ok({
      workflows: workflows.map((w) => ({
        id: w.id,
        name: w.name,
        triggerType: w.triggerType,
        targetDepartment: w.targetDepartment ?? "",
        actions: parseActions(w.actions),
        active: w.active,
        executions: w.executions,
        createdAt: w.createdAt,
      })),
    });
  });
}

// POST /api/workflows — create a workflow
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, WorkflowInput);
    if (!data) return bad;

    const workflow = await db.workflow.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        targetDepartment: data.targetDepartment || "",
        actions: JSON.stringify(data.actions),
        active: data.active,
        executions: 0,
      },
      select: { id: true },
    });
    return ok({ workflow });
  });
}

// PATCH /api/workflows?id= — toggle active / edit definition
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Workflow id is required");

    const { data, response: bad } = await parseBody(req, WorkflowPatch);
    if (!data) return bad;

    const existing = await db.workflow.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Workflow not found");

    await db.workflow.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.triggerType !== undefined ? { triggerType: data.triggerType } : {}),
        ...(data.targetDepartment !== undefined ? { targetDepartment: data.targetDepartment } : {}),
        ...(data.actions !== undefined ? { actions: JSON.stringify(data.actions) } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/workflows?id= — removes the workflow and its executions (cascade)
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Workflow id is required");

    const existing = await db.workflow.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Workflow not found");

    await db.workflow.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
