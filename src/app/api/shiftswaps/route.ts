import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

/**
 * Shift swap requests — session 32 (R31-C9).
 *
 * REF serves /shiftswap as a zero-data stub; this API backs the clone's
 * functional superset (the /assets precedent): employees request a swap,
 * the status walks pending → peer_approved → manager_review → approved
 * (or rejected at any stage).
 */

const ShiftSwapInput = z.object({
  requesterId: z.string().min(1, "Requester is required"),
  swapDate: z.string().min(1, "Shift date is required"),
  notes: z.string().trim().max(280).optional().or(z.literal("")),
});

const ShiftSwapPatch = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "peer_approved", "manager_review", "approved", "rejected"]),
});

const SELECT = {
  id: true,
  requesterId: true,
  swapDate: true,
  notes: true,
  status: true,
  createdAt: true,
  requester: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
} as const;

// GET /api/shiftswaps — all swaps + the per-status counts for the stat row
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const swaps = await db.shiftSwap.findMany({ orderBy: { createdAt: "desc" }, select: SELECT });
    const counts = { myRequests: 0, peerApproval: 0, managerReview: 0, approved: 0 };
    for (const s of swaps) {
      if (s.status === "pending") counts.peerApproval++;
      else if (s.status === "peer_approved") counts.managerReview++;
      else if (s.status === "manager_review") counts.managerReview++;
      else if (s.status === "approved") counts.approved++;
    }
    return ok({
      swaps: swaps.map((s) => ({
        id: s.id,
        requesterId: s.requesterId,
        requesterName: [s.requester.firstName, s.requester.lastName].filter(Boolean).join(" "),
        swapDate: s.swapDate.toISOString(),
        notes: s.notes,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
      counts,
    });
  });
}

// POST /api/shiftswaps — create a swap request
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ShiftSwapInput);
    if (!data) return bad;
    const { requesterId, swapDate, notes } = data;

    const employee = await db.employee.findUnique({ where: { id: requesterId }, select: { id: true } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const date = new Date(swapDate);
    if (Number.isNaN(date.getTime())) return err("VALIDATION", "Invalid shift date");

    const created = await db.shiftSwap.create({
      data: { requesterId, swapDate: date, notes: notes || null },
      select: SELECT,
    });
    return ok({ id: created.id, status: created.status });
  });
}

// PATCH /api/shiftswaps?id= — advance/reject a swap
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ShiftSwapPatch);
    if (!data) return bad;
    const { id, status } = data;

    const existing = await db.shiftSwap.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return err("NOT_FOUND", "Shift swap not found");

    const updated = await db.shiftSwap.update({ where: { id }, data: { status }, select: SELECT });
    return ok({ id: updated.id, status: updated.status });
  });
}

// DELETE /api/shiftswaps?id= — withdraw a request
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id") ?? "";
    const existing = await db.shiftSwap.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return err("NOT_FOUND", "Shift swap not found");

    await db.shiftSwap.delete({ where: { id } });
    return ok({ id });
  });
}
