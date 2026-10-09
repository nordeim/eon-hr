import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Company asset registry. Money (value) is integer minor units (1 SAR = 100).

const AssetInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  type: z.enum(["laptop", "phone", "monitor", "furniture", "vehicle", "other"]).default("laptop"),
  serialNumber: z.string().trim().max(60).optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
  value: z.number().int().min(0).max(1_000_000_000).default(0),
  warrantyExpiry: z.string().optional().or(z.literal("")),
});

function empName(emp: { firstName: string; lastName: string; employeeId: string } | null): string | null {
  if (!emp) return null;
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

const ASSET_SELECT = {
  id: true,
  name: true,
  type: true,
  serialNumber: true,
  status: true,
  purchaseDate: true,
  warrantyExpiry: true,
  value: true,
  assignedTo: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
} as const;

// GET /api/assets?status=&type= — filtered list + fleet-wide stats
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const type = req.nextUrl.searchParams.get("type") ?? "all";

    const [assets, stats] = await Promise.all([
      db.asset.findMany({
        where: {
          AND: [status !== "all" ? { status } : {}, type !== "all" ? { type } : {}],
        },
        orderBy: { createdAt: "desc" },
        select: ASSET_SELECT,
      }),
      db.asset.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const counts: Record<string, number> = {};
    for (const row of stats) counts[row.status] = row._count._all;

    return ok({
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        serialNumber: a.serialNumber,
        status: a.status,
        warrantyExpiry: a.warrantyExpiry,
        value: a.value,
        assignedToId: a.assignedTo ? a.assignedTo.employeeId : null,
        assignedToInternalId: a.assignedTo ? a.assignedTo.id : null,
        assignedToName: empName(a.assignedTo),
      })),
      stats: {
        total: Object.values(counts).reduce((s, n) => s + n, 0),
        assigned: counts["assigned"] ?? 0,
        available: counts["available"] ?? 0,
        repair: counts["repair"] ?? 0,
      },
    });
  });
}

// POST /api/assets — register an asset (optionally pre-assigned)
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, AssetInput);
    if (!data) return bad;

    let assignee: { id: string } | null = null;
    if (data.assignedToId) {
      const employee = await db.employee.findUnique({ where: { id: data.assignedToId } });
      if (!employee) return err("NOT_FOUND", "Assignee employee not found");
      assignee = { id: employee.id };
    }

    const asset = await db.asset.create({
      data: {
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber || null,
        assignedToId: assignee?.id ?? null,
        status: assignee ? "assigned" : "available",
        value: data.value,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      },
      select: { id: true },
    });
    return ok({ asset });
  });
}

// PATCH /api/assets?id= — edit details, assign / unassign, change status
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Asset id is required");

    const { data, response: bad } = await parseBody(req, AssetInput.partial());
    if (!data) return bad;

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Asset not found");

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.type !== undefined) update.type = data.type;
    if (data.serialNumber !== undefined) update.serialNumber = data.serialNumber || null;
    if (data.value !== undefined) update.value = data.value;
    if (data.warrantyExpiry !== undefined) {
      update.warrantyExpiry = data.warrantyExpiry ? new Date(data.warrantyExpiry) : null;
    }

    if (data.assignedToId !== undefined) {
      if (data.assignedToId === "") {
        update.assignedToId = null;
        if (existing.status === "assigned") update.status = "available";
      } else {
        const employee = await db.employee.findUnique({ where: { id: data.assignedToId } });
        if (!employee) return err("NOT_FOUND", "Assignee employee not found");
        update.assignedToId = employee.id;
        if (existing.status === "available") update.status = "assigned";
      }
    }

    await db.asset.update({ where: { id }, data: update });
    return ok({ updated: true });
  });
}

// DELETE /api/assets?id=
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Asset id is required");

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Asset not found");

    await db.asset.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
