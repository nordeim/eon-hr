import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/profile — the signed-in user's own profile + form preferences.
// GET   → profile + preferences (language/timezone persisted as a JSON
//         audit entry; see PATCH below)
// PATCH → update name/email/phone/jobTitle and/or preferences

const PREFERENCES_ENTITY = "user_preferences";

const ProfileInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(120).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  preferences: z
    .object({
      language: z.string().trim().max(40).optional(),
      timezone: z.string().trim().max(60).optional(),
    })
    .optional(),
});

interface UserPreferences {
  language?: string;
  timezone?: string;
}

function parsePreferences(detail: string | null): UserPreferences {
  if (!detail) return {};
  try {
    const v: unknown = JSON.parse(detail);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const out: UserPreferences = {};
      const obj = v as Record<string, unknown>;
      if (typeof obj.language === "string") out.language = obj.language;
      if (typeof obj.timezone === "string") out.timezone = obj.timezone;
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const record = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, jobTitle: true, avatarUrl: true, role: true, createdAt: true },
    });
    if (!record) return err("NOT_FOUND", "User not found");

    const prefEntry = await db.auditLog.findFirst({
      where: { entity: PREFERENCES_ENTITY, entityId: user.id, action: "preferences.update" },
      orderBy: { createdAt: "desc" },
      select: { detail: true },
    });

    return ok({ profile: record, preferences: parsePreferences(prefEntry?.detail ?? null) });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ProfileInput);
    if (!data) return bad;

    if (data.email && data.email !== user.email) {
      const dupe = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
      if (dupe) return err("CONFLICT", "Another account already uses this email");
    }

    const profileFields = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle || null } : {}),
    };
    if (Object.keys(profileFields).length > 0) {
      await db.user.update({ where: { id: user.id }, data: profileFields });
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "profile.update",
          entity: "user",
          entityId: user.id,
          detail: JSON.stringify(Object.keys(profileFields)),
        },
      });
    }

    if (data.preferences) {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "preferences.update",
          entity: PREFERENCES_ENTITY,
          entityId: user.id,
          detail: JSON.stringify(data.preferences),
        },
      });
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, jobTitle: true, avatarUrl: true, role: true, createdAt: true },
    });
    return ok({ profile, preferences: data.preferences ?? undefined });
  });
}
