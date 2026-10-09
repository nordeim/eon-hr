import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Training platforms (LMS directory).

const PlatformInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  category: z.enum(["technical", "soft_skills", "compliance", "product", "tools", "leadership"]).default("technical"),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL (https://…)")
    .optional()
    .or(z.literal("")),
  coursesCount: z.number().int().min(0).max(100_000).default(0),
});

const LOGO_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

// GET /api/training?category=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const category = req.nextUrl.searchParams.get("category") ?? "all";
    const platforms = await db.trainingPlatform.findMany({
      where: category !== "all" ? { category } : {},
      orderBy: { createdAt: "desc" },
    });

    return ok({
      platforms: platforms.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        url: p.url,
        coursesCount: p.coursesCount,
        logoColor: p.logoColor,
        active: p.active,
      })),
    });
  });
}

// POST /api/training — add a training platform (admin)
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, PlatformInput);
    if (!data) return bad;

    const logoColor = LOGO_COLORS[data.name.length % LOGO_COLORS.length] as string;
    const platform = await db.trainingPlatform.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || null,
        url: data.url || null,
        coursesCount: data.coursesCount,
        logoColor,
        active: true,
      },
      select: { id: true },
    });
    return ok({ platform });
  });
}
