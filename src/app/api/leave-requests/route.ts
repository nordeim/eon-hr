import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";
import { daysBetween } from "@/lib/utils";

// /api/leave-requests — Leave Requests module.
// GET    ?scope=mine → own requests + balances; default → all requests + stats.
// POST   creates a pending request for the logged-in user's employee profile.
// PATCH  ?id=&action=approve|reject — admin/hr; approve also increments
//        LeaveBalance.used for the request's year.

const LeaveCreate = z.object({
  leaveTypeName: z.string().trim().min(1, "Leave type is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().trim().min(1, "End date is required"),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

const REQUEST_SELECT = {
  id: true,
  startDate: true,
  endDate: true,
  days: true,
  reason: true,
  status: true,
  decidedAt: true,
  createdAt: true,
  employeeId: true,
  employee: { select: { firstName: true, lastName: true, email: true, employeeId: true } },
  leaveType: { select: { id: true, name: true } },
} as const;

// GET /api/leave-requests[?scope=mine]
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const scope = req.nextUrl.searchParams.get("scope") ?? "all";
    const mine = scope === "mine" && user.employeeId;

    const requests = await db.leaveRequest.findMany({
      where: mine ? { employeeId: user.employeeId! } : {},
      orderBy: { createdAt: "desc" },
      select: REQUEST_SELECT,
    });

    const leaveTypes = await db.leaveType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, quotaDays: true, color: true },
    });

    let balances: {
      leaveTypeId: string;
      name: string;
      color: string;
      entitled: number;
      used: number;
    }[] = [];
    if (mine) {
      const rows = await db.leaveBalance.findMany({
        where: { employeeId: user.employeeId!, year: new Date().getFullYear() },
        select: { entitled: true, used: true, leaveTypeId: true, leaveType: { select: { name: true, color: true } } },
        orderBy: { leaveType: { name: "asc" } },
      });
      balances = rows.map((r) => ({
        leaveTypeId: r.leaveTypeId,
        name: r.leaveType.name,
        color: r.leaveType.color,
        entitled: r.entitled,
        used: r.used,
      }));
    }

    const stats = {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      total: requests.length,
    };

    return ok({
      requests,
      stats: mine ? null : stats,
      canApprove: ["admin", "hr"].includes(user.role),
      leaveTypes,
      balances,
    });
  });
}

// POST /api/leave-requests — submit a request for the signed-in employee
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    if (!user.employeeId) {
      return err("VALIDATION", "No employee profile is linked to your account");
    }

    const { data, response: bad } = await parseBody(req, LeaveCreate);
    if (!data) return bad;

    const start = new Date(`${data.startDate}T00:00:00`);
    const end = new Date(`${data.endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return err("VALIDATION", "Enter valid start and end dates");
    }
    if (end < start) {
      return err("VALIDATION", "End date must be on or after the start date");
    }

    const leaveType = await db.leaveType.findUnique({ where: { name: data.leaveTypeName } });
    if (!leaveType) return err("NOT_FOUND", "Leave type not found");

    const request = await db.leaveRequest.create({
      data: {
        employeeId: user.employeeId,
        leaveTypeId: leaveType.id,
        startDate: start,
        endDate: end,
        days: daysBetween(start, end),
        reason: data.reason || null,
        status: "pending",
      },
      select: { id: true, days: true },
    });
    return ok({ request });
  });
}

// PATCH /api/leave-requests?id=xxx&action=approve|reject
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    const action = req.nextUrl.searchParams.get("action");
    if (!id) return err("VALIDATION", "Request id is required");
    if (action !== "approve" && action !== "reject") {
      return err("VALIDATION", "action must be approve or reject");
    }

    const request = await db.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: { select: { id: true, quotaDays: true } } },
    });
    if (!request) return err("NOT_FOUND", "Leave request not found");
    if (request.status !== "pending") {
      return err("CONFLICT", "This request has already been decided");
    }

    if (action === "reject") {
      await db.leaveRequest.update({
        where: { id },
        data: { status: "rejected", approverId: user.id, decidedAt: new Date() },
      });
      return ok({ updated: true, status: "rejected" });
    }

    // approve: bump the employee's used balance for the request's year
    const year = new Date(request.startDate).getFullYear();
    await db.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id },
        data: { status: "approved", approverId: user.id, decidedAt: new Date() },
      });
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        },
      });
      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { used: balance.used + request.days },
        });
      } else {
        await tx.leaveBalance.create({
          data: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
            entitled: request.leaveType.quotaDays,
            used: request.days,
          },
        });
      }
    });
    return ok({ updated: true, status: "approved" });
  });
}
