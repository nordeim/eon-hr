import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Onboarding templates. `tasks` is a JSON string column shaped
// [{title, dayOffset}] — parsed defensively, never trusted.

interface TemplateTask {
  title: string;
  dayOffset: number;
}

function parseTasks(raw: string | null): TemplateTask[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const tasks: TemplateTask[] = [];
    for (const entry of parsed) {
      if (typeof entry === "object" && entry !== null && "title" in entry) {
        const title = (entry as { title?: unknown }).title;
        if (typeof title === "string" && title.trim().length > 0) {
          tasks.push({ title: title.trim(), dayOffset: Number((entry as { dayOffset?: unknown }).dayOffset) || 0 });
        }
      }
    }
    return tasks;
  } catch {
    return [];
  }
}

const CreateTemplateInput = z.object({
  title: z.string().trim().min(1, "Template title is required").max(120),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  tasks: z
    .array(z.string().trim().min(1, "Task cannot be empty").max(120))
    .min(1, "Add at least one task")
    .max(20, "Maximum 20 tasks"),
});

const UseTemplateInput = z.object({
  action: z.literal("use"),
  templateId: z.string().min(1, "Template is required"),
  employeeId: z.string().min(1, "Employee is required"),
});

const Body = z.union([UseTemplateInput, CreateTemplateInput]);

// GET /api/onboarding-templates
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const templates = await db.onboardingTemplate.findMany({
      include: { _count: { select: { processes: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      templates: templates.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        active: t.active,
        createdAt: t.createdAt,
        tasks: parseTasks(t.tasks),
        usedCount: t._count.processes,
      })),
    });
  });
}

// POST /api/onboarding-templates — create a template, or apply one:
// {action: "use", templateId, employeeId} starts an OnboardingProcess for the
// employee with the template's task list. The two actions return different
// payloads, so the guard is annotated with the union explicitly.
type TemplatesPostData = { process: unknown } | { template: unknown };

export async function POST(req: NextRequest) {
  return guard<TemplatesPostData>(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, Body);
    if (!data) return bad;

    if ("action" in data) {
      const template = await db.onboardingTemplate.findUnique({ where: { id: data.templateId } });
      if (!template) return err("NOT_FOUND", "Template not found");

      const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
      if (!employee) return err("NOT_FOUND", "Employee not found");

      const tasks = parseTasks(template.tasks);
      if (tasks.length === 0) {
        return err("VALIDATION", "This template has no tasks — add tasks before using it");
      }

      const process = await db.onboardingProcess.create({
        data: {
          employeeId: data.employeeId,
          templateId: template.id,
          status: "in_progress",
          progress: 0,
          tasks: JSON.stringify(tasks.map((t) => ({ title: t.title, done: false }))),
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
      });
      return ok({ process });
    }

    const template = await db.onboardingTemplate.create({
      data: {
        title: data.title,
        description: data.description || null,
        tasks: JSON.stringify(data.tasks.map((title, i) => ({ title, dayOffset: i }))),
        active: true,
      },
    });
    return ok({
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        active: template.active,
        createdAt: template.createdAt,
        tasks: parseTasks(template.tasks),
        usedCount: 0,
      },
    });
  });
}

// PATCH /api/onboarding-templates?id=xxx — toggle active state.
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Template id is required");

    const { data, response: bad } = await parseBody(
      req,
      z.object({ active: z.boolean().optional() })
    );
    if (!data) return bad;

    const existing = await db.onboardingTemplate.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Template not found");

    const template = await db.onboardingTemplate.update({
      where: { id },
      data: { ...(data.active !== undefined ? { active: data.active } : {}) },
    });
    return ok({ template: { ...template, tasks: parseTasks(template.tasks) } });
  });
}

// DELETE /api/onboarding-templates?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Template id is required");

    const existing = await db.onboardingTemplate.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Template not found");

    await db.onboardingTemplate.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
