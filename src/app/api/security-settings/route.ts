import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/security-settings — the global security feature flags.
// GET   → settings (defaults created on first read)
// PATCH → update (admin/hr)

const SecurityInput = z.object({
  twoFactorAuth: z.boolean().optional(),
  auditLogging: z.boolean().optional(),
  dataEncryption: z.boolean().optional(),
  automatedBackups: z.boolean().optional(),
  gdprCompliance: z.boolean().optional(),
});

const FIELDS = {
  twoFactorAuth: true,
  auditLogging: true,
  dataEncryption: true,
  automatedBackups: true,
  gdprCompliance: true,
  updatedAt: true,
} as const;

export async function GET() {
  return guard(async () => {
    await requireUser();
    let settings = await db.securitySettings.findFirst({ select: FIELDS });
    if (!settings) {
      settings = await db.securitySettings.create({ data: {}, select: FIELDS });
    }
    return ok({ settings });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, SecurityInput);
    if (!data) return bad;

    const existing = await db.securitySettings.findFirst({ select: { id: true } });
    const settings = existing
      ? await db.securitySettings.update({ where: { id: existing.id }, data, select: FIELDS })
      : await db.securitySettings.create({ data, select: FIELDS });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "security.update",
        entity: "security_settings",
        entityId: settings.updatedAt.toISOString(),
        detail: JSON.stringify(data),
      },
    });

    return ok({ settings });
  });
}
