import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Performance goals — CRUD + progress/status updates.

const GoalInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.enum(["performance", "development", "okr", "kpi"]).default("performance"),
  targetValue: z.number().int().min(0).max(1_000_000).optional(),
  dueDate: z.string().optional().or(z.literal("")),
});

const GoalPatch = z.object({
  title: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.enum(["performance", "development", "okr", "kpi"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["on_track", "at_risk", "behind", "completed"]).optional(),
  dueDate: z.string().optional().or(z.literal("")),
});

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

const GOAL_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  targetValue: true,
  progress: true,
  status: true,
  dueDate: true,
  createdAt: true,
  employee: { select: { firstName: true, lastName: true, employeeId: true, jobTitle: true } },
} as const;

// GET /api/goals
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const goals = await db.goal.findMany({ orderBy: { createdAt: "desc" }, select: GOAL_SELECT });
    return ok({
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        category: g.category,
        targetValue: g.targetValue,
        progress: g.progress,
        status: g.status,
        dueDate: g.dueDate,
        createdAt: g.createdAt,
        employeeId: g.employee.employeeId,
        employeeName: empName(g.employee),
        jobTitle: g.employee.jobTitle,
      })),
    });
  });
}

// POST /api/goals — set a new goal
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, GoalInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const goal = await db.goal.create({
      data: {
        employeeId: employee.id,
        createdById: user.id,
        title: data.title,
        description: data.description || null,
        category: data.category,
        targetValue: data.targetValue ?? null,
        progress: 0,
        status: "on_track",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      select: { id: true },
    });
    return ok({ goal });
  });
}

// PATCH /api/goals?id= — update progress/status/details.
// progress=100 auto-completes; dropping below 100 re-opens an completed goal.
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Goal id is required");

    const { data, response: bad } = await parseBody(req, GoalPatch);
    if (!data) return bad;

    const existing = await db.goal.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Goal not found");

    let status = data.status ?? existing.status;
    if (data.progress !== undefined) {
      if (data.progress >= 100) status = "completed";
      else if (existing.status === "completed") status = data.status ?? "on_track";
    }

    await db.goal.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
        ...(data.progress !== undefined ? { progress: data.progress } : {}),
        status,
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/goals?id=
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Goal id is required");

    const existing = await db.goal.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Goal not found");

    await db.goal.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
