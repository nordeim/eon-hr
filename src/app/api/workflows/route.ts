import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Workflow automation — CRUD for automated workflow definitions.

const WorkflowInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  module: z.enum(["leave", "expense", "recruitment", "general"]).default("general"),
  trigger: z.enum(["manual", "on_create", "on_status_change", "scheduled"]).default("manual"),
  conditions: z
    .array(z.string().trim().min(1).max(80))
    .max(10, "At most 10 conditions")
    .default([]),
  actions: z
    .array(z.string().trim().min(1).max(80))
    .max(10, "At most 10 actions")
    .default([]),
  active: z.boolean().default(false),
});

const WorkflowPatch = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  module: z.enum(["leave", "expense", "recruitment", "general"]).optional(),
  trigger: z.enum(["manual", "on_create", "on_status_change", "scheduled"]).optional(),
  conditions: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  actions: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  active: z.boolean().optional(),
});

function parseList(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string" && c.length > 0);
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
        module: w.module,
        trigger: w.trigger,
        conditions: parseList(w.conditions),
        actions: parseList(w.actions),
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
        module: data.module,
        trigger: data.trigger,
        conditions: JSON.stringify(data.conditions),
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
        ...(data.module !== undefined ? { module: data.module } : {}),
        ...(data.trigger !== undefined ? { trigger: data.trigger } : {}),
        ...(data.conditions !== undefined ? { conditions: JSON.stringify(data.conditions) } : {}),
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
