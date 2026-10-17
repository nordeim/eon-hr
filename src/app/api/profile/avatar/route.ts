import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireUser, parseBody } from "@/lib/api";

// /api/profile/avatar — set the signed-in user's avatar photo.
// POST { avatar: dataUrl } — a client-side canvas-downscaled PNG/JPEG
// data URL (the profile page downscales to 96×96 before posting, so the
// stored payload stays small). REF renders the same Change Photo button
// + hidden file input (live-measured, R46-F1/R48-F); the clone makes the
// flow WORK (the functional superset).

const MAX_DATA_URL = 256 * 1024; // 256 KiB — the 96px downscale lands ~10-30 KiB

const AvatarInput = z.object({
  avatar: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Avatar must be a base64 image data URL")
    .max(MAX_DATA_URL, "Avatar image is too large"),
});

export async function POST(req: Request) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, AvatarInput);
    if (!data) return bad;

    const updated = await db.user.update({
      where: { id: user.id },
      data: { avatarUrl: data.avatar },
      select: { avatarUrl: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "profile.avatar_changed",
        entity: "user",
        entityId: user.id,
      },
    });
    return ok({ avatarUrl: updated.avatarUrl });
  });
}

export const dynamic = "force-dynamic";
