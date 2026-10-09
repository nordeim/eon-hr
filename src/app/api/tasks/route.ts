import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/tasks — Tasks & Projects module. One route handles both entities:
// POST body carries `kind: "task" | "project"`; PATCH/DELETE take
// `?kind=&id=` query params. Kanban statuses: backlog | todo | in_progress |
// review | done.

const TASK_STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const TaskCreate = z.object({
  kind: z.literal("task"),
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES).default("backlog"),
  assignee: z.string().trim().max(80).optional().or(z.literal("")),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  dueDate: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().optional().or(z.literal("")),
});

const ProjectCreate = z.object({
  kind: z.literal("project"),
  name: z.string().trim().min(1, "Project name is required").max(140),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  progress: z.number().int().min(0).max(100).default(0),
});

const CreateInput = z.discriminatedUnion("kind", [TaskCreate, ProjectCreate]);

const TaskPatch = z.object({
  title: z.string().trim().min(1, "Title is required").max(140).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES).optional(),
  assignee: z.string().trim().max(80).optional().or(z.literal("")),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().optional().or(z.literal("")),
});

const ProjectPatch = z.object({
  name: z.string().trim().min(1, "Project name is required").max(140).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  progress: z.number().int().min(0).max(100).optional(),
});

// GET /api/tasks — tasks + projects for the board
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const [tasks, projects] = await Promise.all([
      db.task.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          assignee: true,
          priority: true,
          dueDate: true,
          projectId: true,
          createdAt: true,
        },
      }),
      db.project.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          progress: true,
          createdAt: true,
        },
      }),
    ]);
    return ok({ tasks, projects });
  });
}

// POST /api/tasks — create a task (kind:"task") or a project (kind:"project")
export async function POST(req: NextRequest) {
  return guard<{ task?: { id: string; title: string }; project?: { id: string; name: string } }>(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, CreateInput);
    if (!data) return bad;

    if (data.kind === "project") {
      const project = await db.project.create({
        data: {
          name: data.name,
          description: data.description || null,
          progress: data.progress,
        },
        select: { id: true, name: true },
      });
      return ok({ project });
    }

    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        assignee: data.assignee || null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00`) : null,
        projectId: data.projectId || null,
      },
      select: { id: true, title: true },
    });
    return ok({ task });
  });
}

// PATCH /api/tasks?kind=task|project&id=xxx — update fields / move card
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const kind = req.nextUrl.searchParams.get("kind") ?? "task";
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "id is required");

    if (kind === "project") {
      const { data, response: bad } = await parseBody(req, ProjectPatch);
      if (!data) return bad;
      const existing = await db.project.findUnique({ where: { id } });
      if (!existing) return err("NOT_FOUND", "Project not found");

      await db.project.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description || null } : {}),
          ...(data.progress !== undefined ? { progress: data.progress } : {}),
        },
      });
      return ok({ updated: true });
    }

    const { data, response: bad } = await parseBody(req, TaskPatch);
    if (!data) return bad;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Task not found");

    if (data.projectId) {
      const project = await db.project.findUnique({ where: { id: data.projectId } });
      if (!project) return err("NOT_FOUND", "Project not found");
    }

    await db.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.assignee !== undefined ? { assignee: data.assignee || null } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.dueDate !== undefined
          ? { dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00`) : null }
          : {}),
        ...(data.projectId !== undefined ? { projectId: data.projectId || null } : {}),
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/tasks?kind=task|project&id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const kind = req.nextUrl.searchParams.get("kind") ?? "task";
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "id is required");

    if (kind === "project") {
      const existing = await db.project.findUnique({ where: { id } });
      if (!existing) return err("NOT_FOUND", "Project not found");
      // detach tasks rather than deleting them
      await db.task.updateMany({ where: { projectId: id }, data: { projectId: null } });
      await db.project.delete({ where: { id } });
      return ok({ deleted: true });
    }

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Task not found");
    await db.task.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
