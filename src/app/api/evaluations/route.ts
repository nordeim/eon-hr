import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// 360° evaluations & appraisals — list with parsed competency ratings.

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

function parseRatings(raw: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(raw || "{}");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

const EvaluationInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  type: z.enum(["360", "appraisal", "self", "peer"]).default("360"),
  feedback: z.string().trim().max(2000).optional().or(z.literal("")),
});

// GET /api/evaluations
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const evaluations = await db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true, jobTitle: true } },
      },
    });

    return ok({
      evaluations: evaluations.map((e) => ({
        id: e.id,
        type: e.type,
        status: e.status,
        feedback: e.feedback,
        aiSummary: e.aiSummary,
        ratings: parseRatings(e.ratings),
        createdAt: e.createdAt,
        employeeId: e.employee.employeeId,
        employeeName: empName(e.employee),
        jobTitle: e.employee.jobTitle,
      })),
    });
  });
}

// POST /api/evaluations — record a new evaluation entry
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, EvaluationInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const evaluation = await db.evaluation.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        feedback: data.feedback || null,
        status: "submitted",
        ratings: JSON.stringify({}),
      },
      select: { id: true },
    });
    return ok({ evaluation });
  });
}
