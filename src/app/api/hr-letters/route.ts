import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// HR letter requests — request, issue and reject official documents.

const LetterInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  type: z.enum(["employment", "salary", "bank", "noc", "experience"]).default("employment"),
  reason: z.string().trim().max(500, "Reason is too long").optional().or(z.literal("")),
});

const LetterPatch = z.object({
  status: z.enum(["issued", "rejected"], { message: "Status must be issued or rejected" }),
});

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

// GET /api/hr-letters
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const letters = await db.hRLetter.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true, jobTitle: true } },
      },
    });

    return ok({
      letters: letters.map((l) => ({
        id: l.id,
        type: l.type,
        status: l.status,
        reason: l.reason,
        issuedAt: l.issuedAt,
        createdAt: l.createdAt,
        employeeId: l.employee.employeeId,
        employeeName: empName(l.employee),
        jobTitle: l.employee.jobTitle,
      })),
    });
  });
}

// POST /api/hr-letters — create a pending letter request
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, LetterInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const letter = await db.hRLetter.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        reason: data.reason || null,
        status: "pending",
      },
    });
    return ok({ letter: { id: letter.id } });
  });
}

// PATCH /api/hr-letters?id= — issue or reject
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Letter id is required");

    const { data, response: bad } = await parseBody(req, LetterPatch);
    if (!data) return bad;

    const existing = await db.hRLetter.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Letter request not found");

    await db.hRLetter.update({
      where: { id },
      data: { status: data.status, issuedAt: data.status === "issued" ? new Date() : null },
    });
    return ok({ updated: true });
  });
}
