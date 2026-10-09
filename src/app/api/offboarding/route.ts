import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Offboarding journeys. The checklist is a JSON string column — always parsed
// defensively and never trusted.

// Default checklist for a new offboarding journey.
const DEFAULT_CHECKLIST = [
  "Exit interview scheduled",
  "Knowledge transfer & handover document",
  "Company assets returned",
  "System access & accounts revoked",
  "Final payroll & leave settlement",
  "HR file closed & records archived",
];

interface ChecklistItem {
  title: string;
  done: boolean;
}

function parseChecklist(raw: string | null): ChecklistItem[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const items: ChecklistItem[] = [];
    for (const entry of parsed) {
      if (typeof entry === "object" && entry !== null && "title" in entry) {
        const title = (entry as { title?: unknown }).title;
        if (typeof title === "string" && title.trim().length > 0) {
          items.push({ title: title.trim(), done: Boolean((entry as { done?: unknown }).done) });
        }
      }
    }
    return items;
  } catch {
    return [];
  }
}

function serializeChecklist(items: ChecklistItem[]): string {
  return JSON.stringify(items.map((i) => ({ title: i.title, done: i.done })));
}

const OffboardingInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  lastDay: z.string().min(1, "Last working day is required"),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  checklist: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
});

const OffboardingPatch = z.object({
  itemIndex: z.number().int().min(0).optional(),
  done: z.boolean().optional(),
  status: z.enum(["in_progress", "completed", "cancelled"]).optional(),
});

// GET /api/offboarding
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const processes = await db.offboardingProcess.findMany({
      include: {
        employee: { select: { id: true, employeeId: true, firstName: true, lastName: true, email: true, jobTitle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      processes: processes.map((p) => ({ ...p, checklistItems: parseChecklist(p.checklist) })),
    });
  });
}

// POST /api/offboarding — start an offboarding journey.
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, OffboardingInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const lastDay = new Date(data.lastDay);
    if (Number.isNaN(lastDay.getTime())) return err("VALIDATION", "Enter a valid last working day");

    const titles = data.checklist && data.checklist.length > 0 ? data.checklist : DEFAULT_CHECKLIST;
    const process = await db.offboardingProcess.create({
      data: {
        employeeId: data.employeeId,
        lastDay,
        reason: data.reason || null,
        status: "in_progress",
        checklist: serializeChecklist(titles.map((title) => ({ title, done: false }))),
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ process: { ...process, checklistItems: parseChecklist(process.checklist) } });
  });
}

// PATCH /api/offboarding?id=xxx — toggle a checklist item (persisted) or
// change the process status.
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Offboarding process id is required");

    const { data, response: bad } = await parseBody(req, OffboardingPatch);
    if (!data) return bad;
    if (data.itemIndex === undefined && !data.status) {
      return err("VALIDATION", "Provide itemIndex/done or a status");
    }

    const existing = await db.offboardingProcess.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Offboarding process not found");

    let items = parseChecklist(existing.checklist);
    let status = existing.status;

    if (data.itemIndex !== undefined) {
      if (data.itemIndex >= items.length) return err("VALIDATION", "Checklist item not found");
      if (data.done === undefined) return err("VALIDATION", "Provide the new done state");
      items = items.map((item, i) => (i === data.itemIndex ? { ...item, done: data.done! } : item));
      if (items.every((i) => i.done) && existing.status === "in_progress") {
        status = "completed";
      }
    }

    if (data.status) status = data.status;

    const process = await db.offboardingProcess.update({
      where: { id },
      data: {
        checklist: serializeChecklist(items),
        status,
        ...(status === "completed" && !existing.completedAt ? { completedAt: new Date() } : {}),
        ...(status !== "completed" ? { completedAt: null } : {}),
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ process: { ...process, checklistItems: parseChecklist(process.checklist) } });
  });
}

// DELETE /api/offboarding?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Offboarding process id is required");

    const existing = await db.offboardingProcess.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Offboarding process not found");

    await db.offboardingProcess.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
