import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/posts — company wall feed.
// GET    → visible posts (audience filtered) with author info
// POST   → create a post
// PATCH  → ?id= like/unlike { liked: boolean }

const PostInput = z.object({
  content: z.string().trim().min(1, "Post content is required").max(2000, "Post is too long"),
  audience: z.enum(["all", "managers", "department"]).default("all"),
});

const LikeInput = z.object({ liked: z.boolean() });

const MANAGER_ROLES = ["admin", "hr", "manager"];

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
        author: { id: p.user.id, name: p.user.name, role: p.user.role, avatarUrl: p.user.avatarUrl },
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, PostInput);
    if (!data) return bad;

    const post = await db.post.create({
      data: { userId: user.id, content: data.content, audience: data.audience },
      select: { id: true, createdAt: true },
    });

    return ok({
      post: {
        id: post.id,
        content: data.content,
        audience: data.audience,
        likes: 0,
        createdAt: post.createdAt,
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
