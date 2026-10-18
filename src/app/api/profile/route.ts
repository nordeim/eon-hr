import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/profile — the signed-in user's own profile + form preferences.
// GET    → profile + preferences (language/timezone persisted as a JSON
//          audit entry; see PATCH below) + the social link URLs
// PATCH  → update name/email/phone/jobTitle, the social link URLs, and/or
//          preferences
// DELETE → delete the account (session 57, R57-E — the Danger Zone's
//          working superset behind REF's DELETE-typed confirmation dialog)

const PREFERENCES_ENTITY = "user_preferences";

const SOCIAL_URL = (label: string) =>
  z
    .string()
    .trim()
    .max(300, `${label} URL is too long`)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), `${label} URL must start with http:// or https://`)
    .optional();

const ProfileInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(120).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  // the Connected Accounts form (session 57, R57-D)
  linkedinUrl: SOCIAL_URL("LinkedIn"),
  twitterUrl: SOCIAL_URL("Twitter"),
  githubUrl: SOCIAL_URL("GitHub"),
  facebookUrl: SOCIAL_URL("Facebook"),
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
      select: {
        id: true, name: true, email: true, phone: true, jobTitle: true, avatarUrl: true, role: true, createdAt: true,
        linkedinUrl: true, twitterUrl: true, githubUrl: true, facebookUrl: true,
      },
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
      ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl || null } : {}),
      ...(data.twitterUrl !== undefined ? { twitterUrl: data.twitterUrl || null } : {}),
      ...(data.githubUrl !== undefined ? { githubUrl: data.githubUrl || null } : {}),
      ...(data.facebookUrl !== undefined ? { facebookUrl: data.facebookUrl || null } : {}),
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
      select: {
        id: true, name: true, email: true, phone: true, jobTitle: true, avatarUrl: true, role: true, createdAt: true,
        linkedinUrl: true, twitterUrl: true, githubUrl: true, facebookUrl: true,
      },
    });
    return ok({ profile, preferences: data.preferences ?? undefined });
  });
}

// DELETE /api/profile — delete the account and every owned record
// (session 57, R57-E). The relation walk deletes the user's own records
// first (messages, posts, notifications, preferences, audit trail, the
// employee record with its dependent rows), then the user itself — the
// order respects the schema's foreign keys (SQLite has no ON DELETE
// CASCADE here, so the walk is explicit).
export async function DELETE() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const employee = await db.employee.findUnique({ where: { userId: user.id }, select: { id: true } });

    // the employee record's dependents (only when the account owns one)
    if (employee) {
      await db.shiftSwap.deleteMany({ where: { requesterId: employee.id } });
      await db.approvalConfig.deleteMany({ where: { approverId: employee.id } });
      await db.leaveBalance.deleteMany({ where: { employeeId: employee.id } });
      await db.attendanceRecord.deleteMany({ where: { employeeId: employee.id } });
      await db.shiftAssignment.deleteMany({ where: { employeeId: employee.id } });
      await db.document.deleteMany({ where: { employeeId: employee.id } });
      await db.payrollRecord.deleteMany({ where: { employeeId: employee.id } });
      await db.loan.deleteMany({ where: { employeeId: employee.id } });
      await db.onboardingProcess.deleteMany({ where: { employeeId: employee.id } });
      await db.offboardingProcess.deleteMany({ where: { employeeId: employee.id } });
      await db.complianceAlert.deleteMany({ where: { employeeId: employee.id } });
      await db.hRLetter.deleteMany({ where: { employeeId: employee.id } });
      // the employee's own requests/claims + the goal rows pointing at both
      await db.leaveRequest.deleteMany({ where: { employeeId: employee.id } });
      await db.expenseClaim.deleteMany({ where: { employeeId: employee.id } });
      await db.goal.deleteMany({ where: { employeeId: employee.id } });
      // reports pointing at this employee as manager → detach (set null is
      // not declared; clear the pointer row-by-row)
      await db.employee.updateMany({ where: { managerId: employee.id }, data: { managerId: null } });
      await db.employee.delete({ where: { id: employee.id } });
    }

    // the user's own records
    await db.message.deleteMany({ where: { senderId: user.id } });
    await db.aIChat.deleteMany({ where: { userId: user.id } });
    await db.post.deleteMany({ where: { userId: user.id } });
    await db.announcement.deleteMany({ where: { authorId: user.id } });
    await db.notification.deleteMany({ where: { userId: user.id } });
    await db.notificationPreference.deleteMany({ where: { userId: user.id } });
    await db.auditLog.deleteMany({ where: { userId: user.id } });
    await db.goal.deleteMany({ where: { createdById: user.id } });
    await db.leaveRequest.deleteMany({ where: { approverId: user.id } });
    await db.staffRequest.deleteMany({ where: { userId: user.id } });
    await db.expenseClaim.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });

    return ok({ deleted: true });
  });
}
