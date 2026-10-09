import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, guard, requireUser } from "@/lib/api";

// Performance reviews — read-only listing (write flows live in /api/review-cycles).

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

// GET /api/reviews
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true, jobTitle: true } },
        reviewer: { select: { firstName: true, lastName: true, employeeId: true } },
        cycle: { select: { id: true, name: true, type: true, status: true } },
      },
    });

    return ok({
      reviews: reviews.map((r) => ({
        id: r.id,
        status: r.status,
        overallRating: r.overallRating,
        strengths: r.strengths,
        improvements: r.improvements,
        comments: r.comments,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
        employeeId: r.employee.employeeId,
        employeeName: empName(r.employee),
        jobTitle: r.employee.jobTitle,
        reviewerName: empName(r.reviewer),
        cycleId: r.cycle.id,
        cycleName: r.cycle.name,
        cycleType: r.cycle.type,
        cycleStatus: r.cycle.status,
      })),
    });
  });
}
