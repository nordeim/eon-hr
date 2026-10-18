import { NextRequest } from "next/server";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/posts — company wall feed.
// GET    → visible posts (audience filtered) with author info
// POST   → create a post — JSON { content, audience } OR multipart
//          FormData (content, audience, file) with an attached image/video
//          (session 57, R57-B — the media superset: the file lands in
//          db/uploads/<random>.<ext> and the post carries mediaUrl)
// PATCH  → ?id= like/unlike { liked: boolean }

const PostInput = z.object({
  content: z.string().trim().min(1, "Post content is required").max(2000, "Post is too long"),
  audience: z.enum(["all", "managers", "department"]).default("all"),
});

const LikeInput = z.object({ liked: z.boolean() });

const MANAGER_ROLES = ["admin", "hr", "manager"];

// the media contract: images + videos, 10 MB cap (the wall's attach
// affordance rides the same accept="image/*,video/*" pair as REF's
// hidden #media-upload input)
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MEDIA_EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};
const UPLOADS_DIR = path.join(process.cwd(), "db", "uploads");

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const viewerEmployee = await db.employee.findUnique({
      where: { userId: user.id },
      select: { departmentId: true },
    });
    const viewerDeptId = viewerEmployee?.departmentId ?? null;
    const isManagerLike = MANAGER_ROLES.includes(user.role);

    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        content: true,
        audience: true,
        likes: true,
        createdAt: true,
        mediaUrl: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
            employee: { select: { departmentId: true } },
          },
        },
      },
    });

    const visible = posts.filter((p) => {
      if (p.audience === "all") return true;
      if (p.userId === user.id) return true;
      if (isManagerLike) return true; // admins/hr/managers moderate the wall
      if (p.audience === "department") {
        const authorDept = p.user.employee?.departmentId ?? null;
        return Boolean(authorDept && authorDept === viewerDeptId);
      }
      return false;
    });

    return ok({
      posts: visible.map((p) => ({
        id: p.id,
        content: p.content,
        audience: p.audience,
        likes: p.likes,
        createdAt: p.createdAt,
        mediaUrl: p.mediaUrl,
        author: { id: p.user.id, name: p.user.name, role: p.user.role, avatarUrl: p.user.avatarUrl },
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    // multipart (content + audience + file) or plain JSON — one handler
    const contentType = req.headers.get("content-type") ?? "";
    let content = "";
    let audience = "all";
    let mediaUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      content = String(form.get("content") ?? "").trim();
      const audienceRaw = String(form.get("audience") ?? "all");
      if (!["all", "managers", "department"].includes(audienceRaw)) {
        return err("VALIDATION", "Invalid audience");
      }
      audience = audienceRaw;

      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_MEDIA_BYTES) {
          return err("VALIDATION", "Media file exceeds the 10 MB limit");
        }
        const ext = MEDIA_EXTENSIONS[file.type];
        if (!ext) return err("VALIDATION", "Unsupported media type");
        await mkdir(UPLOADS_DIR, { recursive: true });
        const fileName = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}${ext}`;
        await writeFile(path.join(UPLOADS_DIR, fileName), Buffer.from(await file.arrayBuffer()));
        mediaUrl = `/api/media/${fileName}`;
      }
    } else {
      const { data, response: bad } = await parseBody(req, PostInput);
      if (!data) return bad;
      content = data.content;
      audience = data.audience;
    }

    if (!content) return err("VALIDATION", "Post content is required");

    const post = await db.post.create({
      data: { userId: user.id, content, audience, ...(mediaUrl ? { mediaUrl } : {}) },
      select: { id: true, createdAt: true, mediaUrl: true },
    });

    return ok({
      post: {
        id: post.id,
        content,
        audience,
        likes: 0,
        createdAt: post.createdAt,
        mediaUrl: post.mediaUrl,
        author: { id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
      },
    });
  });
}

// PATCH /api/posts?id=xxx — body { liked } → like (true) or unlike (false)
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Post id is required");

    const { data, response: bad } = await parseBody(req, LikeInput);
    if (!data) return bad;

    const post = await db.post.findUnique({ where: { id }, select: { id: true, likes: true } });
    if (!post) return err("NOT_FOUND", "Post not found");

    const likes = Math.max(0, post.likes + (data.liked ? 1 : -1));
    await db.post.update({ where: { id }, data: { likes } });
    return ok({ likes });
  });
}
