import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/announcements — company announcements.
// GET    → list (author included)
// POST   → create (admin/hr) + fan-out notifications to every active user
// DELETE → ?id= remove (admin/hr)

const AnnouncementInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  content: z.string().trim().min(1, "Content is required").max(4000),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
});

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const announcements = await db.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        publishedAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return ok({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.priority,
        publishedAt: a.publishedAt,
        authorId: a.author.id,
        authorName: a.author.name,
        authorAvatarUrl: a.author.avatarUrl,
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, AnnouncementInput);
    if (!data) return bad;

    const announcement = await db.announcement.create({
      data: { authorId: user.id, title: data.title, content: data.content, priority: data.priority },
      select: { id: true },
    });

    // fan-out an in-app notification to every active user (incl. author)
    const recipients = await db.user.findMany({ where: { active: true }, select: { id: true } });
    await db.notification.createMany({
      data: recipients.map((r) => ({
        userId: r.id,
        type: "announcement",
        title: data.title,
        body: data.content.length > 140 ? `${data.content.slice(0, 137)}...` : data.content,
      })),
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "announcement.create",
        entity: "announcement",
        entityId: announcement.id,
        detail: JSON.stringify({ title: data.title, priority: data.priority }),
      },
    });

    return ok({ id: announcement.id });
  });
}

export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Announcement id is required");
    const existing = await db.announcement.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existing) return err("NOT_FOUND", "Announcement not found");

    await db.announcement.delete({ where: { id } });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "announcement.delete",
        entity: "announcement",
        entityId: id,
        detail: JSON.stringify({ title: existing.title }),
      },
    });
    return ok({ deleted: true });
  });
}
