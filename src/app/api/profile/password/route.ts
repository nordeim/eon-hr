import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";
import { verifyPassword, hashPassword } from "@/lib/auth";

// /api/profile/password — change the signed-in user's password.
// POST { currentPassword, newPassword }

const PasswordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export async function POST(req: Request) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, PasswordInput);
    if (!data) return bad;

    const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!record || !verifyPassword(data.currentPassword, record.passwordHash)) {
      return err("VALIDATION", "Current password is incorrect", {
        currentPassword: ["Current password is incorrect"],
      });
    }
    if (data.currentPassword === data.newPassword) {
      return err("VALIDATION", "New password must be different from the current one", {
        newPassword: ["Choose a different password"],
      });
    }

    await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(data.newPassword) } });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "profile.password_changed",
        entity: "user",
        entityId: user.id,
      },
    });
    return ok({ updated: true });
  });
}
