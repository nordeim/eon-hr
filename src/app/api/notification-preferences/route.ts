import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireUser, parseBody } from "@/lib/api";

// /api/notification-preferences — per-user delivery toggles.
// GET   → preferences (created with defaults on first read)
// PATCH → partial update

const PreferenceInput = z.object({
  emailEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  approvals: z.boolean().optional(),
  rejections: z.boolean().optional(),
  assignments: z.boolean().optional(),
  announcements: z.boolean().optional(),
});

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    let preferences = await db.notificationPreference.findUnique({ where: { userId: user.id } });
    if (!preferences) {
      preferences = await db.notificationPreference.create({ data: { userId: user.id } });
    }
    return ok({ preferences });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, PreferenceInput);
    if (!data) return bad;

    const preferences = await db.notificationPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
    return ok({ preferences });
  });
}
