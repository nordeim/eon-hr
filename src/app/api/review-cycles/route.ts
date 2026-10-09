import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Review cycles (appraisal workflows) — create, list with nested reviews, advance status.

const CycleInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  type: z.enum(["annual", "quarterly", "probation", "360"]).default("annual"),
  periodStart: z.string().optional().or(z.literal("")),
  periodEnd: z.string().optional().or(z.literal("")),
});

const CyclePatch = z.object({
  status: z.enum(["not_started", "in_progress", "completed"], { message: "Invalid cycle status" }),
});

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

// GET /api/review-cycles — cycles with nested review rows
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const cycles = await db.reviewCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            employee: { select: { firstName: true, lastName: true, employeeId: true } },
            reviewer: { select: { firstName: true, lastName: true, employeeId: true } },
          },
        },
      },
    });

    return ok({
      cycles: cycles.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
        createdAt: c.createdAt,
        reviews: c.reviews.map((r) => ({
          id: r.id,
          status: r.status,
          overallRating: r.overallRating,
          completedAt: r.completedAt,
          employeeName: empName(r.employee),
          reviewerName: empName(r.reviewer),
        })),
      })),
    });
  });
}

// POST /api/review-cycles — create a new review cycle (New Review)
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, CycleInput);
    if (!data) return bad;

    if (data.periodStart && data.periodEnd && new Date(data.periodEnd) < new Date(data.periodStart)) {
      return err("VALIDATION", "Period end must be after period start");
    }

    const cycle = await db.reviewCycle.create({
      data: {
        name: data.name,
        type: data.type,
        status: "not_started",
        periodStart: data.periodStart ? new Date(data.periodStart) : null,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
      },
      select: { id: true },
    });
    return ok({ cycle });
  });
}

// PATCH /api/review-cycles?id= — start / complete a cycle
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Cycle id is required");

    const { data, response: bad } = await parseBody(req, CyclePatch);
    if (!data) return bad;

    const existing = await db.reviewCycle.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Review cycle not found");

    await db.reviewCycle.update({ where: { id }, data: { status: data.status } });
    return ok({ updated: true });
  });
}
