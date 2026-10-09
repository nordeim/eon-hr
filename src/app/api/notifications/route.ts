import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser } from "@/lib/api";

// /api/notifications — the signed-in user's notifications.
// GET   → latest notifications + unread count
// PATCH → ?id= mark one read, otherwise mark ALL read

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const [notifications, unread] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, type: true, title: true, body: true, read: true, createdAt: true },
      }),
      db.notification.count({ where: { userId: user.id, read: false } }),
    ]);
    return ok({ notifications, unread, total: await db.notification.count({ where: { userId: user.id } }) });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const existing = await db.notification.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!existing || existing.userId !== user.id) return err("NOT_FOUND", "Notification not found");
      await db.notification.update({ where: { id }, data: { read: true } });
      return ok({ updated: 1 });
    }

    const result = await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return ok({ updated: result.count });
  });
}
