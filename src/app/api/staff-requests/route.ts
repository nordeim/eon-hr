import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";
import { StaffRequestInput } from "@/lib/validation";

// Staff requests across departments — submit, track, resolve/reject.

const PatchInput = z.object({
  status: z.enum(["in_progress", "resolved", "rejected"], { message: "Invalid status transition" }),
  response: z
    .string()
    .trim()
    .min(1, "A response message is required")
    .max(2000, "Response is too long"),
});

// GET /api/staff-requests?scope=mine|all&category=&status=
// Admins/HR/Managers default to all requests; everyone else only sees their own.
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const sp = req.nextUrl.searchParams;
    const scope = sp.get("scope") ?? "all";
    const category = sp.get("category") ?? "all";
    const status = sp.get("status") ?? "all";

    const privileged = ["admin", "hr", "manager"].includes(user.role);
    const onlyMine = scope === "mine" || !privileged;

    const requests = await db.staffRequest.findMany({
      where: {
        AND: [
          onlyMine ? { userId: user.id } : {},
          category !== "all" ? { category } : {},
          status !== "all" ? { status } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    const mineCount = await db.staffRequest.count({ where: { userId: user.id } });

    return ok({
      requests: requests.map((r) => ({
        id: r.id,
        category: r.category,
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        response: r.response,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        requesterName: r.user.name,
        mine: r.userId === user.id,
      })),
      mineCount,
      scope: onlyMine ? "mine" : "all",
    });
  });
}

// POST /api/staff-requests — submit a new request for the signed-in user
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, StaffRequestInput);
    if (!data) return bad;

    const request = await db.staffRequest.create({
      data: {
        userId: user.id,
        category: data.category,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: "pending",
      },
      select: { id: true },
    });
    return ok({ request });
  });
}

// PATCH /api/staff-requests?id= — start / resolve / reject with a response message
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Request id is required");

    const { data, response: bad } = await parseBody(req, PatchInput);
    if (!data) return bad;

    const existing = await db.staffRequest.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Request not found");

    await db.staffRequest.update({
      where: { id },
      data: { status: data.status, response: data.response },
    });
    return ok({ updated: true });
  });
}
