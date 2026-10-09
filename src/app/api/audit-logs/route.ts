import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, guard, requireRole } from "@/lib/api";

// /api/audit-logs — system action trail (admin/hr/security).
// GET → latest audit log entries with the acting user's name

export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "security"]);
    if (!user) return response;

    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50) || 50, 200);
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        detail: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    return ok({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        createdAt: l.createdAt,
        userName: l.user?.name ?? "System",
      })),
    });
  });
}
